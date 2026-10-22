import { basicSetup } from 'codemirror';
import { Compartment, EditorState, Prec, Transaction, Text, type Extension } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { undo, redo, undoDepth, redoDepth, isolateHistory, indentWithTab, selectAll } from '@codemirror/commands';
import { openSearchPanel } from '@codemirror/search';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { tools } from '../data/tools';
import { filenameLanguage, languageLabel, loadLanguage } from '../lib/workspace-languages';
import { toolInputs, toolOutputs, type ToolField } from '../lib/workspace-tool-adapters';
import { operationName, parseRecipe, type Operation } from '../lib/workspace-operations';
import { encodeRecipe, decodeRecipe } from '../lib/workspace-recipes';
import { exportText, readTextFile } from '../lib/workspace-files';
import { readDrafts, writeDrafts, inspectDrafts, type SavedDocument } from '../lib/workspace-storage';

const root = document.querySelector<HTMLElement>('.editor-workspace')!;
root.inert = true;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
const status = (message: string, error = false) => { root.dataset.status = error ? 'error' : 'ready'; $('workspace-status').textContent = message; $('workspace-status').classList.toggle('workspace-error', error); };
const lang = new Compartment(), wrapping = new Compartment(), sizing = new Compartment();
let wrap = true, fontSize = 15, untitled = 0, active = 0, switching = false;
interface Document extends SavedDocument { id:string; state:EditorState; revision:number; languageMode:string; savedDoc:Text; modified:boolean; highlightedLanguage:string; words:number; statsRevision:number; }
const documents: Document[] = [];
const languageExtensions: Record<string, () => Extension> = { text:() => [], markdown, json, html, css, javascript, typescript:() => javascript({ typescript:true }) };
const detectLanguage = (name: string) => filenameLanguage(name) || 'text';
const HIGHLIGHT_CHARACTER_LIMIT = 1_000_000;
const current = () => documents[active];
const dirty = (doc: Document) => doc.modified || doc.eol !== doc.savedEol || doc.bom !== doc.savedBom;
const editorTheme = EditorView.theme({
  '&': { color:'var(--text)', backgroundColor:'var(--input)', height:'100%' },
  '.cm-content': { fontFamily:'ui-monospace, Consolas, monospace', padding:'20px 0', caretColor:'var(--text)' },
  '.cm-scroller': { fontFamily:'ui-monospace, Consolas, monospace', lineHeight:'1.65', overflow:'auto' },
  '.cm-gutters': { backgroundColor:'var(--bg)', color:'var(--muted)', borderRight:'1px solid var(--border)' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor:'color-mix(in srgb, var(--text) 4%, transparent)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor:'color-mix(in srgb, var(--accent) 28%, transparent) !important' },
  '.cm-cursor': { borderLeftColor:'var(--text)' },
  '.cm-panels': { backgroundColor:'var(--panel)', color:'var(--text)', borderColor:'var(--border)' },
  '.cm-searchMatch': { backgroundColor:'color-mix(in srgb, var(--accent) 25%, transparent)', outline:'1px solid var(--accent-strong)' },
  '.cm-tooltip': { backgroundColor:'var(--panel)', color:'var(--text)', borderColor:'var(--border)' },
  '&.cm-focused': { outline:'none' }
});
let refreshTimer: ReturnType<typeof setTimeout>;
function makeState(text: string, language: string): EditorState {
  return EditorState.create({ doc:text, extensions:[
    basicSetup, editorTheme,
    EditorState.transactionFilter.of(transaction => {
      if (transaction.docChanged && transaction.newDoc.length > 10_000_000) { status('Documents are limited to 10 million characters. The edit was not applied.',true); return []; }
      return transaction;
    }),
    syntaxHighlighting(HighlightStyle.define([
      { tag:[tags.keyword,tags.operatorKeyword], color:'var(--syntax-keyword)' },
      { tag:[tags.string,tags.regexp], color:'var(--syntax-string)' },
      { tag:[tags.number,tags.bool,tags.null], color:'var(--syntax-number)' },
      { tag:tags.comment, color:'var(--muted)', fontStyle:'italic' },
      { tag:[tags.heading,tags.link,tags.tagName], color:'var(--accent-strong)' }
    ])),
    Prec.high(EditorState.allowMultipleSelections.of(false)),
    lang.of(text.length > HIGHLIGHT_CHARACTER_LIMIT ? [] : (languageExtensions[language] || languageExtensions.text)()),
    wrapping.of(wrap ? EditorView.lineWrapping : []),
    sizing.of(EditorView.theme({ '&':{ fontSize:`${fontSize}px` } })),
    placeholder('Start typing, paste text, or open a file…'),
    EditorView.contentAttributes.of({ 'aria-label':'Document editor', spellcheck:'false' }),
    keymap.of([indentWithTab, { key:'Escape', run:editor => { editor.setTabFocusMode(2000); return false; } }, { key:'Mod-s', run:() => { void saveFile(); return true; } }, { key:'Mod-o', run:() => { $('workspace-files').click(); return true; } }]),
    EditorView.updateListener.of(update => {
      if (switching || !current()) return;
      current().state = update.state;
      if (update.docChanged) {
        const doc = current(); doc.revision++;
        doc.modified = update.transactions.some(tr => tr.isUserEvent('undo') || tr.isUserEvent('redo')) ? !update.state.doc.eq(doc.savedDoc) : true;
        invalidatePreview(); scheduleDraft(); scheduleStatistics();
        let replaced = false;
        update.changes.iterChanges((from, to, _newFrom, _newTo, inserted) => { if (from === 0 && to === update.startState.doc.length && inserted.length > 1) replaced = true; });
        const pasted = replaced || update.transactions.some(tr => tr.isUserEvent('input.paste'));
        if (doc.languageMode === 'auto' && !filenameLanguage(doc.name) && (doc.language === 'text' || pasted)) queueMicrotask(scheduleDetection);
        else if ((doc.state.doc.length > HIGHLIGHT_CHARACTER_LIMIT) !== (doc.highlightedLanguage === 'large-file')) queueMicrotask(() => { if (current()?.id === doc.id) void useLanguage(doc.language,'Document size changed'); });
      }
      if (update.docChanged || update.selectionSet) { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh,80); }
    })
  ] });
}
const view = new EditorView({ state:makeState('', 'text'), parent:$('document-editor') });
function newDocument(text = '', name = `Untitled ${++untitled}.txt`, saved?: SavedDocument) {
  if (text.length > 10_000_000) { status('Documents are limited to 10 million characters. Your current document is unchanged.',true); return; }
  if (documents.length >= 30) { status('Up to 30 documents can be open. Close a tab before opening another.',true); return; }
  const languageMode = saved?.languageMode || (saved?.language ? saved.language : 'auto');
  const language = languageMode === 'auto' ? filenameLanguage(name) || saved?.language || 'text' : languageMode;
  const state = makeState(text,language), savedText = saved?.savedText ?? '';
  const doc: Document = { savedDoc:text === savedText ? state.doc : Text.of(savedText.split('\n')), modified:text !== savedText, highlightedLanguage:text.length > HIGHLIGHT_CHARACTER_LIMIT ? 'large-file' : languageExtensions[language] ? language : 'text', words:0, statsRevision:text ? -1 : 0, id:saved?.id || crypto.randomUUID(), savedEol:saved?.savedEol ?? saved?.eol ?? '\n', savedBom:saved?.savedBom ?? saved?.bom ?? false, name, text, savedText:saved?.savedText ?? '', eol:saved?.eol || '\n', bom:saved?.bom || false, language, languageMode, state, revision:0 };
  documents.push(doc); activate(documents.length - 1); scheduleDraft();
}
function activate(index: number) {
  cancelOperation(); invalidatePreview(); active = index; switching = true;
  view.setState(current().state);
  view.dispatch({ effects:[wrapping.reconfigure(wrap ? EditorView.lineWrapping : []), sizing.reconfigure(EditorView.theme({ '&':{ fontSize:`${fontSize}px` } }))] });
  current().state = view.state; switching = false;
  $('document-language').setAttribute('data-current',current().language);
  ($('document-language') as HTMLSelectElement).value = current().languageMode;
  ($('document-eol') as HTMLSelectElement).value = current().eol === '\r\n' ? 'crlf' : current().eol === '\r' ? 'cr' : 'lf';
  refresh(); view.focus(); scheduleDraft(); scheduleDetection(); scheduleStatistics();
}
let tabSignature = '';
function renderTabs() {
  const signature = JSON.stringify([active,documents.map(doc => [doc.id,doc.name,dirty(doc)])]);
  if (signature === tabSignature) return;
  tabSignature = signature;
  const tabs = $('document-tabs'); const focused = document.activeElement?.getAttribute('data-document');
  tabs.replaceChildren();
  documents.forEach((doc,index) => {
    const item = document.createElement('div'); item.className = 'document-tab'; item.classList.toggle('active', index === active);
    const button = document.createElement('button'); button.type = 'button'; button.role = 'tab'; button.dataset.document = doc.id;
    button.dataset.dirty = String(dirty(doc)); button.setAttribute('aria-selected', String(index === active)); button.setAttribute('aria-controls','document-editor'); button.tabIndex = index === active ? 0 : -1;
    button.textContent = `${dirty(doc) ? '● ' : ''}${doc.name}`; button.title = `${doc.name}${dirty(doc) ? ' — modified' : ''}`;
    button.addEventListener('click', () => activate(index));
    button.addEventListener('keydown', event => {
      let target = index;
      if (event.key === 'ArrowRight') target = (index + 1) % documents.length;
      else if (event.key === 'ArrowLeft') target = (index + documents.length - 1) % documents.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = documents.length - 1;
      else if (event.key === 'Delete') { event.preventDefault(); closeDocument(index); return; }
      else return;
      event.preventDefault(); activate(target); $('document-tabs').querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    });
    const close = document.createElement('button'); close.type = 'button'; close.className = 'close-document'; close.textContent = '×'; close.setAttribute('aria-label',`Close ${doc.name}`); close.addEventListener('click', () => closeDocument(index));
    item.append(button,close); tabs.append(item);
  });
  if (focused) tabs.querySelector<HTMLButtonElement>(`[data-document="${focused}"]`)?.focus();
}
function refresh() {
  if (!current()) return;
  const doc = current(), selection = view.state.selection.main;
  $('document-stats').textContent = `${doc.statsRevision === doc.revision ? doc.words.toLocaleString() + ' words' : 'Counting words…'} · ${view.state.doc.length.toLocaleString()} characters · ${view.state.doc.lines.toLocaleString()} lines`;
  const position = view.state.doc.lineAt(selection.head);
  $('selection-stats').textContent = selection.empty ? `Ln ${position.number}, Col ${selection.head - position.from + 1}` : `${(selection.to - selection.from).toLocaleString()} selected`;
  root.querySelectorAll<HTMLButtonElement>('[data-action="undo"]').forEach(b => b.disabled = !undoDepth(view.state));
  root.querySelectorAll<HTMLButtonElement>('[data-action="redo"]').forEach(b => b.disabled = !redoDepth(view.state));
  renderTabs();
  if (panel === 'markdown') void renderMarkdown();
  if (panel === 'compare') void renderComparison();
}
let statisticsTimer: ReturnType<typeof setTimeout>, statisticsIdle: number | undefined;
let statisticsWorker: Worker | null = null;
function scheduleStatistics() {
  clearTimeout(statisticsTimer);
  if (statisticsIdle !== undefined && 'cancelIdleCallback' in window) window.cancelIdleCallback(statisticsIdle);
  const doc = current();
  if (!doc || doc.statsRevision === doc.revision) { root.dataset.statsState = 'ready'; return; }
  root.dataset.statsState = 'pending';
  const run = () => {
    if (current()?.id !== doc.id) return;
    if (!statisticsWorker) {
      statisticsWorker = new Worker(new URL('./statistics-worker.ts', import.meta.url), {type:'module'});
      statisticsWorker.onmessage = event => {
        const target = documents.find(item => item.id === event.data.id);
        if (!target || target.revision !== event.data.revision) return;
        target.words = event.data.words; target.statsRevision = event.data.revision;
        if (target.id === current()?.id) { root.dataset.statsState = 'ready'; refresh(); }
      };
      statisticsWorker.onerror = () => { statisticsWorker?.terminate(); statisticsWorker = null; root.dataset.statsState = 'error'; $('document-stats').textContent = `${view.state.doc.length.toLocaleString()} characters · ${view.state.doc.lines.toLocaleString()} lines · Word count unavailable`; };
    }
    statisticsWorker.postMessage({id:doc.id,revision:doc.revision,text:doc.state.doc.toString()});
  };
  statisticsTimer = setTimeout(() => {
    if ('requestIdleCallback' in window) statisticsIdle = window.requestIdleCallback(run, {timeout:1000}); else run();
  },250);
}
function closeDocument(index = active) {
  if (dirty(documents[index]) && !window.confirm(`Close ${documents[index].name}? Changes that have not been downloaded will be discarded from this workspace.`)) return;
  const oldActive = current()?.id; documents.splice(index,1);
  if (!documents.length) newDocument(); else { const kept = documents.findIndex(d => d.id === oldActive); activate(kept >= 0 ? kept : Math.min(index, documents.length - 1)); }
  scheduleDraft();
}
function insert(text: string, from = view.state.selection.main.from, to = view.state.selection.main.to) {
  if (view.state.doc.length - (to - from) + text.length > 10_000_000) { status('The result would exceed the 10 million character limit.',true); return; }
  view.dispatch({ changes:{ from,to,insert:text }, selection:{ anchor:from + text.length }, annotations:[Transaction.userEvent.of('input.transform'),isolateHistory.of('full')], scrollIntoView:true });
  refresh(); view.focus();
}
function download() {
  if (!current()) return;
  const doc = current(), text = view.state.doc.toString();
  const blob = new Blob([exportText(text,doc.eol,doc.bom)],{ type:'text/plain;charset=utf-8' });
  const a = document.createElement('a'), url = URL.createObjectURL(blob); a.href = url; a.download = doc.name; a.click(); setTimeout(() => URL.revokeObjectURL(url),30000);
  status(`Download started: ${doc.name}. The browser cannot confirm completion; the unsaved marker is kept.`); refresh(); scheduleDraft();
}
interface FileWriter { write(data: Blob): Promise<void>; close(): Promise<void>; }
interface SaveHandle { name: string; createWritable(): Promise<FileWriter>; }
async function saveFile() {
  const picker = (window as unknown as { showSaveFilePicker?: (options: { suggestedName: string }) => Promise<SaveHandle> }).showSaveFilePicker;
  if (!picker) { download(); return; }
  const doc = current(), savedDoc = doc.state.doc, text = savedDoc.toString(), eol = doc.eol, bom = doc.bom;
  const originalName = doc.name;
  try {
    const handle = await picker.call(window, { suggestedName: originalName });
    const writable = await handle.createWritable();
    await writable.write(new Blob([exportText(text, eol, bom)], { type: 'text/plain;charset=utf-8' }));
    await writable.close();
    doc.savedText = text; doc.savedDoc = savedDoc; doc.modified = !doc.state.doc.eq(savedDoc); doc.savedEol = eol; doc.savedBom = bom;
    if (doc.name === originalName) doc.name = handle.name;
    status(`Saved ${handle.name}.`); refresh(); scheduleDraft();
  } catch (error) {
    status(error instanceof Error && error.name === 'AbortError' ? 'Save cancelled. Your document is unchanged.' : 'The file could not be saved. Your document remains open and unsaved.', !(error instanceof Error && error.name === 'AbortError'));
  }
}
$<HTMLInputElement>('workspace-files').addEventListener('change', async event => {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files || [])) {
    try { const value = await readTextFile(file); newDocument(value.text,value.name,{ ...value,savedText:value.text, language:detectLanguage(value.name), languageMode:'auto' }); status(`Opened ${file.name} locally.`); }
    catch (error) { status(error instanceof Error ? error.message : 'Could not open the file. Use UTF-8 text.',true); }
  }
  input.value = '';
});
root.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); } });
root.addEventListener('drop', async event => {
  if (!event.dataTransfer?.files.length) return;
  event.preventDefault();
  for (const file of Array.from(event.dataTransfer.files)) { try { const value = await readTextFile(file); newDocument(value.text,value.name,{...value,savedText:value.text,language:detectLanguage(value.name), languageMode:'auto'}); } catch (e) { status(e instanceof Error ? e.message : 'Could not open file.',true); } }
});
$<HTMLSelectElement>('document-language').addEventListener('change', event => { current().languageMode = (event.target as HTMLSelectElement).value; invalidatePreview(); scheduleDetection(); scheduleDraft(); });
$<HTMLSelectElement>('document-eol').addEventListener('change', event => { const value = (event.target as HTMLSelectElement).value; current().eol = value === 'crlf' ? '\r\n' : value === 'cr' ? '\r' : '\n'; status('File line endings updated.'); refresh(); scheduleDraft(); });

let panel = '';
function showPanel(name: string, title: string) {
  if (panel !== name) { cancelOperation(); invalidatePreview(); stopComparison(); }
  panel = name; $('work-panel').hidden = false; $('work-panel-title').textContent = title;
  for (const child of Array.from($('work-panel').children)) if (child.tagName === 'SECTION') (child as HTMLElement).hidden = child.id !== `${name}-panel`;
  root.dataset.panel = name; refresh(); $('work-panel-title').focus();
}
function closePanel() { cancelOperation(); stopComparison(); panel = ''; root.dataset.panel = ''; $('work-panel').hidden = true; view.focus(); }
function openTransform(operation = 'trim') {
  showPanel('transform','Text operations'); $<HTMLSelectElement>('operation-choice').value = operation;
  $<HTMLSelectElement>('operation-scope').value = view.state.selection.main.empty ? 'document' : 'selection';
  updateOperationOptions();
}
function updateOperationOptions() { $('regex-options').hidden = !['replace','extract','filter'].includes($<HTMLSelectElement>('operation-choice').value); }
let worker: Worker | null = null, workerTimer: ReturnType<typeof setTimeout>;
let resultSnapshot: { docId:string; revision:number; from:number; to:number; result:string } | null = null;
function operationState(state: string) { root.dataset.operationState = state; $('transform-panel').setAttribute('aria-busy', String(state === 'running')); }
function invalidatePreview() {
  const pending = !!worker, hadResult = !!resultSnapshot;
  if (pending) cancelOperation();
  resultSnapshot = null; $('operation-preview').hidden = true;
  if (pending || hadResult) { operationState('stale'); status('Text or options changed. Run a fresh preview before applying.'); }
}
function cancelOperation() { if (worker) operationState('idle'); worker?.terminate(); worker = null; clearTimeout(workerTimer); $('cancel-operation').hidden = true; $<HTMLButtonElement>('preview-operation').disabled = false; $<HTMLButtonElement>('preview-recipe').disabled = false; }
function selectedOperation(): Operation {
  const id = $<HTMLSelectElement>('operation-choice').value;
  if (!['replace','extract','filter'].includes(id)) return {id};
  return { id, options:{ pattern:$<HTMLInputElement>('operation-pattern').value, flags:$<HTMLInputElement>('operation-flags').value, replacement:$<HTMLInputElement>('operation-replacement').value, group:$<HTMLInputElement>('operation-group').value } };
}
function preview(steps: Operation[], replacement?: string) {
  cancelOperation(); invalidatePreview();
  const selection = view.state.selection.main, selected = $<HTMLSelectElement>('operation-scope').value === 'selection';
  if (selected && selection.empty) { operationState('error'); status('Select text in the editor, or choose Whole document.',true); return; }
  const from = selected ? selection.from : 0, to = selected ? selection.to : view.state.doc.length;
  const snapshot = { docId:current().id,revision:current().revision,from,to,result:'' };
  const runningWorker = worker = new Worker(new URL('./workspace-worker.ts', import.meta.url),{ type:'module' });
  $<HTMLButtonElement>('preview-operation').disabled = true; $<HTMLButtonElement>('preview-recipe').disabled = true; $('cancel-operation').hidden = false;
  root.dataset.operationStep = '0'; root.dataset.operationTotal = String(steps.length || 1);
  operationState('running'); status('Preparing change preview…');
  worker.onmessage = event => {
    if (worker !== runningWorker) return;
    if (event.data.progress) { const progress = event.data.progress; root.dataset.operationStep = String(progress.step); status(`Step ${progress.step} of ${progress.total}: ${progress.name}…`); return; }
    cancelOperation();
    if (event.data.error) { operationState('error'); status(event.data.error,true); $('preview-operation').focus(); return; }
    if (snapshot.docId !== current().id || snapshot.revision !== current().revision) { status('The document changed. Run the preview again.',true); return; }
    resultSnapshot = {...snapshot,result:event.data.result};
    $('operation-result').textContent = event.data.result.slice(0,100000);
    const comparison = event.data.preview;
    $('preview-change-summary').textContent = !comparison.changed ? 'No text changes. The document will be left unchanged.' : comparison.changes ? `${comparison.added} added lines · ${comparison.removed} removed lines. ${comparison.note}` : comparison.note;
    $<HTMLButtonElement>('apply-operation').disabled = !comparison.changed;
    renderDifferences($('operation-diff'), comparison.changes || []);
    $('operation-reports').replaceChildren();
    for (const report of event.data.reports) {
      const item = document.createElement('li'); item.textContent = `${report.name}: ${report.before.toLocaleString()} → ${report.after.toLocaleString()} characters${report.changed ? '' : ' (unchanged)'}`; $('operation-reports').append(item);
    }
    root.dataset.operationStep = String(event.data.reports.length);
    $('preview-size').textContent = `${(to - from).toLocaleString()} → ${event.data.result.length.toLocaleString()} characters${event.data.result.length > 100000 ? ' (first 100,000 shown)' : ''}`;
    $('operation-preview').hidden = false; operationState('ready'); status('Preview ready. The document has not changed.'); $('preview-size').focus();
  };
  worker.onerror = () => { cancelOperation(); operationState('error'); status('Could not run the operation. Please try again.',true); };
  worker.postMessage({ text:view.state.sliceDoc(from,to), steps, language:current().language, replacement });
  workerTimer = setTimeout(() => { cancelOperation(); operationState('error'); status('Operation stopped after 5 seconds. Try a smaller selection or a simpler expression.',true); },5000);
}
$('preview-operation').addEventListener('click', () => preview([selectedOperation()]));
$('cancel-operation').addEventListener('click', () => { cancelOperation(); operationState('cancelled'); $('preview-operation').focus(); status('Operation cancelled. Your document is unchanged.'); });
$('operation-choice').addEventListener('change', () => { updateOperationOptions(); invalidatePreview(); });
for (const id of ['operation-scope','operation-pattern','operation-flags','operation-replacement','operation-group']) $(id).addEventListener('input',invalidatePreview);
$('apply-operation').addEventListener('click', () => {
  const s = resultSnapshot;
  if (!s || s.docId !== current().id || s.revision !== current().revision) { status('Run a fresh preview before applying changes.',true); return; }
  insert(s.result,s.from,s.to); operationState('applied'); status('Changes applied. Undo restores the previous text.');
});
$('result-as-document').addEventListener('click', () => { if (resultSnapshot) { const text = resultSnapshot.result; newDocument(text,`Result ${++untitled}.txt`); } });
let recipe: Operation[] = [];
let savedRecipes: Record<string,Operation[]> = Object.create(null);
try { const value = JSON.parse(localStorage.getItem('text-utils-recipes') || '{}'); for (const [name,steps] of Object.entries(value)) { if (name.length <= 80) savedRecipes[name] = parseRecipe(steps); } } catch { /* Invalid stored recipes are ignored. */ }
function persistRecipes() { try { localStorage.setItem('text-utils-recipes',JSON.stringify(savedRecipes)); status('Recipe saved on this device.'); } catch { status('Browser storage is unavailable; recipe changes will last only for this page.',true); } }
function renderRecipe() {
  $('recipe-count').textContent = recipe.length ? `(${recipe.length})` : '';
  $('recipe-steps').replaceChildren();
  recipe.forEach((step,index) => {
    const item = document.createElement('li'); item.dataset.step = String(index); item.tabIndex = -1;
    const label = document.createElement('span'); label.textContent = operationName(step.id); item.append(label);
    for (const [offset, name] of [[-1,'up'],[1,'down']] as const) {
      const move = document.createElement('button'); move.type = 'button'; move.textContent = name === 'up' ? '↑' : '↓';
      move.setAttribute('aria-label',`Move step ${index + 1} ${name}`); move.disabled = index + offset < 0 || index + offset >= recipe.length;
      move.addEventListener('click', () => { [recipe[index],recipe[index + offset]] = [recipe[index + offset],recipe[index]]; renderRecipe(); invalidatePreview(); $('recipe-steps').querySelector<HTMLElement>(`[data-step="${index + offset}"]`)?.focus(); }); item.append(move);
    }
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label',`Remove step ${index + 1}`);
    remove.addEventListener('click', () => { recipe.splice(index,1); renderRecipe(); invalidatePreview(); }); item.append(remove); $('recipe-steps').append(item);
  });
  const select = $<HTMLSelectElement>('saved-recipe'), previous = select.value; select.replaceChildren(new Option('Choose a recipe',''));
  for (const name of Object.keys(savedRecipes).sort()) select.add(new Option(name,name)); select.value = previous;
}
$('add-recipe-step').addEventListener('click', () => {
  const step = selectedOperation();
  if (recipe.length >= 30) { status('A recipe can contain up to 30 steps.',true); return; }
  recipe.push(step); $('recipe-details').setAttribute('open',''); renderRecipe(); invalidatePreview();
});
$('clear-recipe').addEventListener('click', () => { recipe = []; renderRecipe(); invalidatePreview(); });
$('preview-recipe').addEventListener('click', () => preview(recipe));
$('save-recipe').addEventListener('click', () => {
  const name = $<HTMLInputElement>('recipe-name').value.trim();
  if (!name || !recipe.length) { status('Give the recipe a name and add at least one step.',true); return; }
  if (Object.keys(savedRecipes).length >= 30 && !savedRecipes[name]) { status('Up to 30 recipes can be saved.',true); return; }
  savedRecipes[name] = structuredClone(recipe); persistRecipes(); renderRecipe(); $<HTMLSelectElement>('saved-recipe').value = name;
});
$('load-recipe').addEventListener('click', () => { const name = $<HTMLSelectElement>('saved-recipe').value; if (savedRecipes[name]) { recipe = structuredClone(savedRecipes[name]); $<HTMLInputElement>('recipe-name').value = name; renderRecipe(); invalidatePreview(); status(`Loaded ${name}.`); } });
$('delete-recipe').addEventListener('click', () => { delete savedRecipes[$<HTMLSelectElement>('saved-recipe').value]; persistRecipes(); renderRecipe(); });
$('import-recipe').addEventListener('click', () => $('recipe-file').click());
$<HTMLInputElement>('recipe-file').addEventListener('change', async event => {
  const input = event.target as HTMLInputElement, file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('Recipe files are limited to 2 MB.');
    const imported = decodeRecipe(await file.text()); recipe = imported.steps; $<HTMLInputElement>('recipe-name').value = imported.name;
    renderRecipe(); invalidatePreview(); status(`Imported ${imported.name}. Review the steps, then preview or save the recipe.`);
  } catch (error) { status(error instanceof Error ? error.message : 'Could not import this recipe.',true); }
  finally { input.value = ''; }
});
$('export-recipe').addEventListener('click', () => {
  try {
    const name = $<HTMLInputElement>('recipe-name').value.trim() || 'Recipe';
    const blob = new Blob([encodeRecipe(name,recipe)],{type:'application/json'}), url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${name.replace(/[^\p{L}\p{N} _-]/gu,'_')}.recipe.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url),30000);
    status('Recipe export started. It contains steps and options, without the editor document.');
  } catch (error) { status(error instanceof Error ? error.message : 'Could not export this recipe.',true); }
});
renderRecipe();

let previewGeneration = 0, markdownKey = '';
async function renderMarkdown() {
  const key = `${current().id}:${current().revision}`;
  if (key === markdownKey) return;
  markdownKey = key;
  const generation = ++previewGeneration;
  if (view.state.doc.length > 500000) { $('workspace-markdown').textContent = 'Markdown preview is limited to 500,000 characters. Editing and downloading remain available.'; return; }
  const source = view.state.doc.toString();
  const { renderWorkspaceMarkdown } = await import('../lib/markdown');
  if (generation !== previewGeneration || panel !== 'markdown') { if (markdownKey === key) markdownKey = ''; return; }
  $('workspace-markdown').innerHTML = renderWorkspaceMarkdown(source);
  $('workspace-markdown').querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
}
function openCompare() {
  const select = $<HTMLSelectElement>('compare-document'); select.replaceChildren();
  documents.filter(d => d.id !== current().id).forEach(d => select.add(new Option(d.name,d.id)));
  showPanel('compare','Compare documents');
}
function renderDifferences(container: HTMLElement, changes: {added?:boolean;removed?:boolean;value:string}[]) {
  const fragment = document.createDocumentFragment();
  for (const part of changes) {
    const pre = document.createElement('pre'); pre.className = part.added ? 'diff-add' : part.removed ? 'diff-remove' : '';
    pre.textContent = `${part.added ? '+ ' : part.removed ? '− ' : '  '}${part.value}`; fragment.append(pre);
  }
  container.replaceChildren(fragment);
}
let comparisonWorker: Worker | null = null, comparisonKey = '';
function stopComparison() { comparisonWorker?.terminate(); comparisonWorker = null; comparisonKey = ''; }
function renderComparison() {
  const doc = current(), other = documents.find(d => d.id === $<HTMLSelectElement>('compare-document').value);
  const key = `${doc.id}:${doc.revision}:${other?.id}:${other?.revision}`;
  if (key === comparisonKey) return;
  stopComparison(); comparisonKey = key;
  $('workspace-diff').replaceChildren();
  if (!other) { $('compare-summary').textContent = 'Open a second document to compare it with the active one.'; root.dataset.comparisonState = 'empty'; return; }
  if (doc.state.doc.length + other.state.doc.length > 200000) { $('compare-summary').textContent = 'Comparison is limited to 200,000 combined characters. Select smaller documents.'; root.dataset.comparisonState = 'error'; return; }
  const worker = comparisonWorker = new Worker(new URL('./comparison-worker.ts', import.meta.url), {type:'module'});
  root.dataset.comparisonState = 'running'; $('compare-summary').textContent = 'Comparing documents…';
  const timer = setTimeout(() => { if (comparisonWorker === worker) { stopComparison(); root.dataset.comparisonState = 'error'; $('compare-summary').textContent = 'Comparison timed out. Try smaller documents.'; } },2000);
  worker.onmessage = event => {
    clearTimeout(timer); worker.terminate();
    if (comparisonWorker !== worker || comparisonKey !== key || panel !== 'compare') return;
    comparisonWorker = null;
    if (!event.data.changes) { root.dataset.comparisonState = 'error'; $('compare-summary').textContent = 'Comparison timed out. Try smaller documents.'; return; }
    renderDifferences($('workspace-diff'),event.data.changes); root.dataset.comparisonState = 'ready';
    $('compare-summary').textContent = `${other.name}: ${event.data.added} added lines, ${event.data.removed} removed lines. + marks additions; − marks removals. ${event.data.note}`;
  };
  worker.onerror = () => { clearTimeout(timer); if (comparisonWorker === worker) { stopComparison(); root.dataset.comparisonState = 'error'; $('compare-summary').textContent = 'Comparison failed. Editing is still available.'; } };
  worker.postMessage({before:doc.state.doc.toString(),after:other.state.doc.toString()});
}
$('compare-document').addEventListener('change', () => void renderComparison());

// Specialist tools retain their complete existing controls. Same-origin frames
// exchange text only through explicit user actions; no document is auto-sent.
const frame = $<HTMLIFrameElement>('specialist-frame');
let fieldObserver: MutationObserver | null = null;
let fieldTimer: ReturnType<typeof setTimeout>;
let specialist = '';
let inputFields: ToolField[] = [], outputFields: ToolField[] = [];
let toolReady = false;
function populateFields() {
  const doc = frame.contentDocument; if (!doc || !toolReady) return;
  inputFields = toolInputs(doc,specialist); outputFields = toolOutputs(doc,specialist);
  const update = (select: HTMLSelectElement, fields:ToolField[], fallback:string) => {
    const previous = select.value, signature = fields.map(field => `${field.id}:${field.label}`).join('|');
    if (select.dataset.signature === signature) return;
    select.dataset.signature = signature; select.replaceChildren(new Option(fallback,''));
    fields.forEach(field => select.add(new Option(field.label,field.id)));
    select.value = fields.some(field => field.id === previous) ? previous : fields[0]?.id || '';
  };
  update($<HTMLSelectElement>('tool-input-field'),inputFields,'No text input');
  update($<HTMLSelectElement>('tool-output-field'),outputFields,'No text result');
  $<HTMLButtonElement>('send-to-tool').disabled = !inputFields.length;
  const result = readToolResult();
  $<HTMLTextAreaElement>('tool-result-preview').value = result.slice(0,100000);
  $('tool-result-size').textContent = `${result.length.toLocaleString()} characters${result.length > 100000 ? ' (first 100,000 shown)' : ''}`;
  $<HTMLButtonElement>('insert-tool-result').disabled = !result;
  $<HTMLButtonElement>('tool-result-document').disabled = !result;
  $<HTMLButtonElement>('preview-tool-result').disabled = !result;
}
function readToolResult(): string {
  if (!toolReady) return '';
  return outputFields.find(field => field.id === $<HTMLSelectElement>('tool-output-field').value)?.read() || '';
}
function openTool(id: string) {
  const tool = tools.find(t => t.id === id); if (!tool) return;
  showPanel('specialist',tool.name);
  const online = ['font-chooser','google-icons-chooser','grateful-dead-archive','ip-info','xml-sitemap-generator'].includes(id);
  $('tool-network-note').textContent = online ? 'This tool has online features. Read its notice before use. Your document is sent to the tool only when you choose an input action.' : 'Choose a result, then insert it at the cursor or replace selected text.';
  $<HTMLAnchorElement>('standalone-tool').href = tool.href;
  if (specialist !== id) { fieldObserver?.disconnect(); toolReady = false; inputFields = []; outputFields = []; for (const key of ['send-to-tool','insert-tool-result','tool-result-document','preview-tool-result']) $<HTMLButtonElement>(key).disabled = true; specialist = id; frame.src = `${tool.href}?embed=1`; frame.title = tool.name; status(`Opened ${tool.name}. Your document is unchanged.`); }
}
frame.addEventListener('load', () => {
  toolReady = !!frame.contentDocument?.querySelector('main');
  fieldObserver?.disconnect();
  populateFields();
  if (frame.contentDocument?.body) { fieldObserver = new MutationObserver(() => { clearTimeout(fieldTimer); fieldTimer = setTimeout(populateFields,100); }); fieldObserver.observe(frame.contentDocument.body,{ childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['value','readonly'] }); frame.contentDocument.addEventListener('input',populateFields); frame.contentDocument.addEventListener('change',populateFields); frame.contentDocument.addEventListener('click',() => setTimeout(populateFields,0)); }
});
$('tool-output-field').addEventListener('change',populateFields);
$('send-to-tool').addEventListener('click', () => {
  const field = inputFields.find(field => field.id === $<HTMLSelectElement>('tool-input-field').value);
  if (!field?.write || !toolReady) return;
  const s = view.state.selection.main;
  field.write(s.empty ? view.state.doc.toString() : view.state.sliceDoc(s.from,s.to));
  populateFields(); status('Text sent to the selected tool input. Run its action to produce a result.');
});
$('preview-tool-result').addEventListener('click', () => { const result = readToolResult(); if (result) { openTransform(); preview([],result); } });
$('insert-tool-result').addEventListener('click', () => { const result = readToolResult(); if (result) insert(result); else status('The selected tool has no result yet.',true); });
$('tool-result-document').addEventListener('click', () => { const result = readToolResult(); if (result) newDocument(result,`Tool result ${++untitled}.txt`); });
$<HTMLInputElement>('workspace-tool-search').addEventListener('input', event => {
  const words = (event.target as HTMLInputElement).value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let count = 0;
  root.querySelectorAll<HTMLButtonElement>('[data-tool-search]').forEach(button => { button.hidden = !words.every(word => button.dataset.toolSearch!.includes(word)); if (!button.hidden) count++; });
  root.querySelectorAll<HTMLElement>('.tool-list-group').forEach(group => group.hidden = !group.querySelector('button:not([hidden])'));
  $('workspace-tools-empty').hidden = !!count;
});

const renameDialog = $<HTMLDialogElement>('rename-dialog');
$('rename-form').addEventListener('submit', event => { event.preventDefault(); const name = $<HTMLInputElement>('document-name').value.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g,'_'); if (name) { current().name = name; renameDialog.close(); refresh(); scheduleDraft(); scheduleDetection(); } });
$('rename-cancel').addEventListener('click', () => renameDialog.close());
function action(id: string) {
  root.querySelectorAll<HTMLDetailsElement>('.editor-menu[open]').forEach(menu => menu.open = false);
  switch (id) {
    case 'new': newDocument(); break;
    case 'open': $('workspace-files').click(); break;
    case 'save': void saveFile(); break;
    case 'download': download(); break;
    case 'rename': $<HTMLInputElement>('document-name').value = current().name; renameDialog.showModal(); break;
    case 'duplicate': newDocument(view.state.doc.toString(),`Copy of ${current().name}`); break;
    case 'close-document': closeDocument(); break;
    case 'undo': undo(view); refresh(); view.focus(); break;
    case 'redo': redo(view); refresh(); view.focus(); break;
    case 'find': openSearchPanel(view); break;
    case 'select-all': selectAll(view); view.focus(); break;
    case 'copy': { const s = view.state.selection.main; navigator.clipboard.writeText(s.empty ? view.state.doc.toString() : view.state.sliceDoc(s.from,s.to)).then(() => status('Copied.'), () => status('Clipboard is unavailable. Select text and use your browser’s Copy command.',true)); break; }
    case 'transform': openTransform(); break;
    case 'cleanup': openTransform('trim'); recipe = [{id:'trim'},{id:'blank'},{id:'unique'}]; renderRecipe(); $('recipe-details').setAttribute('open',''); break;
    case 'case': openTransform('upper'); break;
    case 'regex': openTransform('replace'); break;
    case 'format-json': openTransform('json-format'); break;
    case 'format-markdown': openTransform('format-markdown'); break;
    case 'format-code': openTransform('format-code'); break;
    case 'markdown': showPanel('markdown','Markdown preview'); break;
    case 'compare': openCompare(); break;
    case 'browse-tools': showPanel('browse','All tools'); $('workspace-tool-search').focus(); break;
    case 'help': showPanel('help','Workspace help'); break;
    case 'expand-tool': { const expanded = root.dataset.toolExpanded !== 'true'; root.dataset.toolExpanded = String(expanded); const button = root.querySelector<HTMLButtonElement>('[data-action="expand-tool"]')!; button.textContent = expanded ? 'Reduce' : 'Expand'; button.setAttribute('aria-pressed',String(expanded)); break; }
    case 'close-panel': closePanel(); break;
    case 'wrap': wrap = !wrap; view.dispatch({ effects:wrapping.reconfigure(wrap ? EditorView.lineWrapping : []) }); status(`Word wrap ${wrap ? 'on' : 'off'}.`); break;
    case 'zoom-in': case 'zoom-out': fontSize = Math.max(11,Math.min(28,fontSize + (id === 'zoom-in' ? 1 : -1))); view.dispatch({ effects:sizing.reconfigure(EditorView.theme({ '&':{ fontSize:`${fontSize}px` } })) }); break;
    default: if (id.startsWith('tool:')) openTool(id.slice(5));
  }
}
root.addEventListener('click', event => { const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (button?.dataset.action) action(button.dataset.action); });
document.addEventListener('click', event => { if (!(event.target as HTMLElement).closest('.editor-menu')) root.querySelectorAll<HTMLDetailsElement>('.editor-menu[open]').forEach(menu => menu.open = false); });
root.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const menu = root.querySelector<HTMLDetailsElement>('.editor-menu[open]');
  if (menu) { menu.open = false; menu.querySelector('summary')?.focus(); event.preventDefault(); }
  else if ((event.target as HTMLElement).closest('#work-panel')) { event.preventDefault(); closePanel(); }
});
root.querySelectorAll<HTMLDetailsElement>('.editor-menu').forEach(menu => {
  menu.addEventListener('toggle', () => { if (menu.open) root.querySelectorAll<HTMLDetailsElement>('.editor-menu').forEach(other => { if (other !== menu) other.open = false; }); });
  menu.querySelector('summary')?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); menu.open = true; menu.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus(); }
  });
  menu.addEventListener('keydown', event => {
    if (!(event.target instanceof HTMLButtonElement) || !['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const index = items.indexOf(event.target);
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
    items[target]?.focus();
  });
});
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || root.dataset.ready !== 'true') return;
  if ((event.ctrlKey || event.metaKey) && ['o','s'].includes(event.key.toLowerCase()) && !event.altKey) { event.preventDefault(); action(event.key.toLowerCase() === 'o' ? 'open' : 'save'); }
});
$('load-example').addEventListener('click', () => { newDocument('  Keep useful tools.  \n\nMake them work together.\n  Keep useful tools.  \n\nLet the text stay in one place.  ','Cleanup example.txt'); action('cleanup'); });

let draftEnabled = false, restoring = true, draftGeneration = 0, draftRevision = 0, draftWrite: Promise<void> = Promise.resolve();
let draftTimer: ReturnType<typeof setTimeout>;
const persistedDrafts = new Map<string, { text: EditorState['doc']; meta: string; value: SavedDocument }>();
try { draftEnabled = localStorage.getItem('text-utils-remember-drafts') === 'true'; } catch { /* Storage is optional. */ }
$<HTMLInputElement>('remember-drafts').checked = draftEnabled;
function setDraftState(state: string) {
  if (root.dataset.draftState === state) return;
  root.dataset.draftState = state;
  $('draft-status').textContent = ({off:'Draft recovery off',pending:'Draft changes pending',saving:'Saving drafts…',saved:'Drafts saved on this device',error:'Draft recovery needs attention',paused:'Draft saving paused'} as Record<string,string>)[state] || state;
}
function scheduleDraft() { if (restoring || !draftEnabled) return; draftRevision++; setDraftState('pending'); clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft,500); }
function saveDraft() {
  if (!draftEnabled || restoring) return;
  const generation = draftGeneration, revision = draftRevision;
  setDraftState('saving');
  const entries = documents.map(d => {
    const meta = JSON.stringify([d.name,d.eol,d.bom,d.language,d.languageMode,d.savedEol,d.savedBom]);
    const previous = persistedDrafts.get(d.id);
    return { id: d.id, text: d.state.doc, meta, value: previous?.text === d.state.doc && previous.meta === meta && previous.value.savedText === d.savedText ? previous.value : { id:d.id,name:d.name,text:d.state.doc.toString(),savedText:d.savedText,eol:d.eol,bom:d.bom,language:d.language,languageMode:d.languageMode,savedEol:d.savedEol,savedBom:d.savedBom } };
  });
  const snapshot = { active, documents: entries.map(entry => entry.value) };
  const changed = new Set(entries.filter(entry => persistedDrafts.get(entry.id)?.value !== entry.value).map(entry => entry.id));
  draftWrite = draftWrite.catch(() => {}).then(async () => {
    if (generation !== draftGeneration || !draftEnabled) return;
    await writeDrafts(snapshot, changed);
    persistedDrafts.clear(); for (const entry of entries) persistedDrafts.set(entry.id, entry);
    setDraftState(revision === draftRevision ? 'saved' : 'pending');
  }).catch(error => { setDraftState('error'); status(error instanceof Error ? error.message : 'Draft recovery could not be saved. Download important work before closing.',true); });
}
async function eraseDrafts() {
  persistedDrafts.clear(); draftGeneration++; draftEnabled = false; clearTimeout(draftTimer); $<HTMLInputElement>('remember-drafts').checked = false;
  try { localStorage.removeItem('text-utils-remember-drafts'); await draftWrite; await writeDrafts(null); setDraftState('off'); status('Saved drafts erased from this browser. Open documents are unchanged.'); }
  catch { status('Draft storage could not be erased. Use your browser’s site-data controls to remove it.',true); }
}
$('remember-drafts').addEventListener('change', async event => {
  draftEnabled = (event.target as HTMLInputElement).checked;
  if (!draftEnabled) { await eraseDrafts(); return; }
  try { localStorage.setItem('text-utils-remember-drafts','true'); saveDraft(); status('Draft recovery enabled on this device. Keep important work in downloaded files.'); }
  catch { draftEnabled = false; $<HTMLInputElement>('remember-drafts').checked = false; status('Browser storage is unavailable. Documents remain open for this session.',true); }
});
$('forget-drafts').addEventListener('click', () => void eraseDrafts());
window.addEventListener('beforeunload', event => { if (documents.some(dirty)) event.preventDefault(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) saveDraft(); });
let detectionTimer: ReturnType<typeof setTimeout>, detectionTimeout: ReturnType<typeof setTimeout>;
let detectionWorker: Worker | null = null, languageGeneration = 0;
function showLanguage(reason:string) {
  const doc = current(); if (!doc) return;
  $('language-status').textContent = `${languageLabel(doc.language)} · ${doc.languageMode === 'auto' ? 'auto' : 'manual'}`;
  $('language-status').title = reason;
  const large = doc.state.doc.length > HIGHLIGHT_CHARACTER_LIMIT;
  root.dataset.highlighting = large ? 'paused' : 'enabled';
  $('highlighting-note').hidden = !large;
  root.dataset.language = doc.language; root.dataset.languageMode = doc.languageMode;
}
async function useLanguage(id:string, reason:string) {
  const doc = current(), generation = ++languageGeneration;
  if (doc.language !== id) invalidatePreview();
  doc.language = id; showLanguage(reason);
  const highlighting = doc.state.doc.length > HIGHLIGHT_CHARACTER_LIMIT ? 'large-file' : id;
  if (doc.highlightedLanguage === highlighting) return;
  try {
    const extension = highlighting === 'large-file' ? [] : languageExtensions[id] ? languageExtensions[id]() : await loadLanguage(id);
    if (current()?.id !== doc.id || generation !== languageGeneration) return;
    view.dispatch({effects:lang.reconfigure(extension)}); doc.state = view.state; doc.highlightedLanguage = highlighting;
    scheduleDraft();
  } catch { if (current()?.id === doc.id) status(`Could not load ${languageLabel(id)} highlighting. Editing is still available.`,true); }
}
function scheduleDetection() {
  clearTimeout(detectionTimer); clearTimeout(detectionTimeout); detectionWorker?.terminate(); detectionWorker = null;
  if (!current()) return;
  const doc = current(); languageGeneration++;
  if (doc.languageMode !== 'auto') { void useLanguage(doc.languageMode,'Manual language choice'); return; }
  const named = filenameLanguage(doc.name);
  if (named) { void useLanguage(named,`Detected from ${doc.name}`); return; }
  const docId = doc.id, revision = doc.revision;
  showLanguage('Examining document contents');
  detectionTimer = setTimeout(() => {
    if (current()?.id !== docId || current().revision !== revision || current().languageMode !== 'auto') return;
    const worker = detectionWorker = new Worker(new URL('./language-worker.ts',import.meta.url),{type:'module'});
    const finish = () => { worker.terminate(); if (detectionWorker === worker) detectionWorker = null; clearTimeout(detectionTimeout); };
    worker.onmessage = event => {
      finish();
      if (current()?.id === docId && current().revision === revision && current().languageMode === 'auto') void useLanguage(event.data.language,event.data.reason);
    };
    worker.onerror = () => { finish(); if (current()?.id === docId) void useLanguage('text','Detection unavailable; choose a language manually'); };
    worker.postMessage({text:doc.state.doc.sliceString(0,16000)});
    detectionTimeout = setTimeout(() => { finish(); if (current()?.id === docId && current().languageMode === 'auto') void useLanguage('text','Ambiguous text; choose a language manually'); },2000);
  },450);
}
async function initialize() {
  if (draftEnabled) {
    try {
      const snapshot = await readDrafts();
      if (snapshot?.documents && Array.isArray(snapshot.documents)) {
        const checked = inspectDrafts(snapshot);
        for (const doc of checked.documents) newDocument(doc.text,doc.name,doc);
        if (documents.length) { activate(Math.max(0,Math.min(documents.length - 1,Number(snapshot.active) || 0))); status('Drafts recovered from this browser. Undo history starts fresh.'); }
        if (checked.skipped.length) {
          draftEnabled = false; $<HTMLInputElement>('remember-drafts').checked = false;
          setDraftState('error');
          status(`Not recovered: ${checked.skipped.join(', ')}. Draft saving is paused to preserve the stored recovery copy. Download recovered work before enabling it again.`,true);
        }
      }
    } catch { draftEnabled = false; $<HTMLInputElement>('remember-drafts').checked = false; status('Saved drafts could not be restored. Recovery saving is paused to preserve the stored copy.',true); }
  }
  if (!documents.length) newDocument();
  restoring = false;
  const command = new URLSearchParams(location.search).get('tool'); if (command) openTool(command);
  if (!root.dataset.draftState) setDraftState(draftEnabled ? 'saved' : 'off');
  operationState('idle'); root.dataset.ready = 'true';
  root.inert = false;
  root.removeAttribute('aria-busy');
  $('editor-loading').hidden = true;
  $('editor-startup-error').hidden = true;
}
void initialize();
