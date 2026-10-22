import { basicSetup } from 'codemirror';
import { Compartment, EditorState, Prec, Transaction, type Extension } from '@codemirror/state';
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
import { operationName, parseRecipe, type Operation } from '../lib/workspace-operations';
import { getTextStats } from '../lib/text';
import { exportText, readTextFile } from '../lib/workspace-files';
import { readDrafts, writeDrafts, type SavedDocument } from '../lib/workspace-storage';

const root = document.querySelector<HTMLElement>('.editor-workspace')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
const status = (message: string, error = false) => { $('workspace-status').textContent = message; $('workspace-status').classList.toggle('workspace-error', error); };
const lang = new Compartment(), wrapping = new Compartment(), sizing = new Compartment();
let wrap = true, fontSize = 15, untitled = 0, active = 0, switching = false;
interface Document extends SavedDocument { id:string; state:EditorState; revision:number; }
const documents: Document[] = [];
const languageExtensions: Record<string, () => Extension> = { text:() => [], markdown, json, html, css, javascript, typescript:() => javascript({ typescript:true }) };
const detectLanguage = (name: string) => ({ md:'markdown', markdown:'markdown', json:'json', html:'html', htm:'html', css:'css', js:'javascript', mjs:'javascript', ts:'typescript', txt:'text' } as Record<string,string>)[name.split('.').pop()!.toLowerCase()] || 'text';
const current = () => documents[active];
const dirty = (doc: Document) => doc.state.doc.toString() !== doc.savedText;
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
    syntaxHighlighting(HighlightStyle.define([
      { tag:[tags.keyword,tags.operatorKeyword], color:'var(--syntax-keyword)' },
      { tag:[tags.string,tags.regexp], color:'var(--syntax-string)' },
      { tag:[tags.number,tags.bool,tags.null], color:'var(--syntax-number)' },
      { tag:tags.comment, color:'var(--muted)', fontStyle:'italic' },
      { tag:[tags.heading,tags.link,tags.tagName], color:'var(--accent-strong)' }
    ])),
    Prec.high(EditorState.allowMultipleSelections.of(false)),
    lang.of((languageExtensions[language] || languageExtensions.text)()),
    wrapping.of(wrap ? EditorView.lineWrapping : []),
    sizing.of(EditorView.theme({ '&':{ fontSize:`${fontSize}px` } })),
    placeholder('Start typing, paste text, or open a file…'),
    EditorView.contentAttributes.of({ 'aria-label':'Document editor', spellcheck:'false' }),
    keymap.of([indentWithTab, { key:'Escape', run:editor => { editor.setTabFocusMode(2000); return false; } }, { key:'Mod-s', run:() => { download(); return true; } }, { key:'Mod-o', run:() => { $('workspace-files').click(); return true; } }]),
    EditorView.updateListener.of(update => {
      if (switching || !current()) return;
      current().state = update.state;
      if (update.docChanged) { current().revision++; invalidatePreview(); scheduleDraft(); }
      if (update.docChanged || update.selectionSet) { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh,80); }
    })
  ] });
}
const view = new EditorView({ state:makeState('', 'text'), parent:$('document-editor') });
function newDocument(text = '', name = `Untitled ${++untitled}.txt`, saved?: SavedDocument) {
  if (documents.length >= 30) { status('Up to 30 documents can be open. Close a tab before opening another.',true); return; }
  const language = saved?.language && languageExtensions[saved.language] ? saved.language : detectLanguage(name);
  const doc: Document = { id:crypto.randomUUID(), name, text, savedText:saved?.savedText ?? '', eol:saved?.eol || '\n', bom:saved?.bom || false, language, state:makeState(text,language), revision:0 };
  documents.push(doc); activate(documents.length - 1); scheduleDraft();
}
function activate(index: number) {
  cancelOperation(); invalidatePreview(); active = index; switching = true;
  view.setState(current().state);
  view.dispatch({ effects:[lang.reconfigure((languageExtensions[current().language] || languageExtensions.text)()), wrapping.reconfigure(wrap ? EditorView.lineWrapping : []), sizing.reconfigure(EditorView.theme({ '&':{ fontSize:`${fontSize}px` } }))] });
  current().state = view.state; switching = false;
  $('document-language').setAttribute('data-current',current().language);
  ($('document-language') as HTMLSelectElement).value = current().language;
  ($('document-eol') as HTMLSelectElement).value = current().eol === '\r\n' ? 'crlf' : current().eol === '\r' ? 'cr' : 'lf';
  refresh(); view.focus(); scheduleDraft();
}
function renderTabs() {
  const tabs = $('document-tabs'); const focused = document.activeElement?.getAttribute('data-document');
  tabs.replaceChildren();
  documents.forEach((doc,index) => {
    const item = document.createElement('div'); item.className = 'document-tab'; item.classList.toggle('active', index === active);
    const button = document.createElement('button'); button.type = 'button'; button.role = 'tab'; button.dataset.document = doc.id;
    button.setAttribute('aria-selected', String(index === active)); button.setAttribute('aria-controls','document-editor'); button.tabIndex = index === active ? 0 : -1;
    button.textContent = `${dirty(doc) ? '● ' : ''}${doc.name}`; button.title = `${doc.name}${dirty(doc) ? ' — modified' : ''}`;
    button.addEventListener('click', () => activate(index));
    button.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); activate((index + (event.key === 'ArrowRight' ? 1 : documents.length - 1)) % documents.length); $('document-tabs').querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus(); } });
    const close = document.createElement('button'); close.type = 'button'; close.className = 'close-document'; close.textContent = '×'; close.setAttribute('aria-label',`Close ${doc.name}`); close.addEventListener('click', () => closeDocument(index));
    item.append(button,close); tabs.append(item);
  });
  if (focused) tabs.querySelector<HTMLButtonElement>(`[data-document="${focused}"]`)?.focus();
}
function refresh() {
  if (!current()) return;
  const text = view.state.doc.toString(), stats = getTextStats(text), selection = view.state.selection.main;
  $('document-stats').textContent = `${stats.words.toLocaleString()} words · ${text.length.toLocaleString()} characters · ${view.state.doc.lines.toLocaleString()} lines`;
  const position = view.state.doc.lineAt(selection.head);
  $('selection-stats').textContent = selection.empty ? `Ln ${position.number}, Col ${selection.head - position.from + 1}` : `${(selection.to - selection.from).toLocaleString()} selected`;
  root.querySelectorAll<HTMLButtonElement>('[data-action="undo"]').forEach(b => b.disabled = !undoDepth(view.state));
  root.querySelectorAll<HTMLButtonElement>('[data-action="redo"]').forEach(b => b.disabled = !redoDepth(view.state));
  renderTabs();
  document.title = `${dirty(current()) ? '● ' : ''}${current().name} · Text Utilities`;
  if (panel === 'markdown') void renderMarkdown();
  if (panel === 'compare') void renderComparison();
}
function closeDocument(index = active) {
  if (dirty(documents[index]) && !window.confirm(`Close ${documents[index].name}? Changes that have not been downloaded will be discarded from this workspace.`)) return;
  const oldActive = current()?.id; documents.splice(index,1);
  if (!documents.length) newDocument(); else activate(Math.max(0,documents.findIndex(d => d.id === oldActive)));
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
  doc.savedText = text; status(`Download started: ${doc.name}. Keep the downloaded copy for permanent storage.`); refresh(); scheduleDraft();
}
$<HTMLInputElement>('workspace-files').addEventListener('change', async event => {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files || [])) {
    try { const value = await readTextFile(file); newDocument(value.text,value.name,{ ...value,savedText:value.text, language:detectLanguage(value.name) }); status(`Opened ${file.name} locally.`); }
    catch (error) { status(error instanceof Error ? error.message : 'Could not open the file. Use UTF-8 text.',true); }
  }
  input.value = '';
});
root.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); } });
root.addEventListener('drop', async event => {
  if (!event.dataTransfer?.files.length) return;
  event.preventDefault();
  for (const file of Array.from(event.dataTransfer.files)) { try { const value = await readTextFile(file); newDocument(value.text,value.name,{...value,savedText:value.text,language:detectLanguage(value.name)}); } catch (e) { status(e instanceof Error ? e.message : 'Could not open file.',true); } }
});
$<HTMLSelectElement>('document-language').addEventListener('change', event => { current().language = (event.target as HTMLSelectElement).value; view.dispatch({ effects:lang.reconfigure(languageExtensions[current().language]()) }); scheduleDraft(); });
$<HTMLSelectElement>('document-eol').addEventListener('change', event => { const value = (event.target as HTMLSelectElement).value; current().eol = value === 'crlf' ? '\r\n' : value === 'cr' ? '\r' : '\n'; status('Download line endings updated.'); scheduleDraft(); });

let panel = '';
function showPanel(name: string, title: string) {
  panel = name; $('work-panel').hidden = false; $('work-panel-title').textContent = title;
  for (const child of Array.from($('work-panel').children)) if (child.tagName === 'SECTION') (child as HTMLElement).hidden = child.id !== `${name}-panel`;
  root.dataset.panel = name; refresh();
}
function closePanel() { cancelOperation(); panel = ''; root.dataset.panel = ''; $('work-panel').hidden = true; view.focus(); }
function openTransform(operation = 'trim') {
  showPanel('transform','Text operations'); $<HTMLSelectElement>('operation-choice').value = operation;
  $<HTMLSelectElement>('operation-scope').value = view.state.selection.main.empty ? 'document' : 'selection';
  updateOperationOptions();
}
function updateOperationOptions() { $('regex-options').hidden = !['replace','extract','filter'].includes($<HTMLSelectElement>('operation-choice').value); }
let worker: Worker | null = null, workerTimer: ReturnType<typeof setTimeout>;
let resultSnapshot: { docId:string; revision:number; from:number; to:number; result:string } | null = null;
function invalidatePreview() { resultSnapshot = null; $('operation-preview').hidden = true; }
function cancelOperation() { worker?.terminate(); worker = null; clearTimeout(workerTimer); $('cancel-operation').hidden = true; $<HTMLButtonElement>('preview-operation').disabled = false; $<HTMLButtonElement>('preview-recipe').disabled = false; }
function selectedOperation(): Operation {
  return { id:$<HTMLSelectElement>('operation-choice').value, options:{ pattern:$<HTMLInputElement>('operation-pattern').value, flags:$<HTMLInputElement>('operation-flags').value, replacement:$<HTMLInputElement>('operation-replacement').value, group:$<HTMLInputElement>('operation-group').value, language:current().language } };
}
function preview(steps: Operation[]) {
  cancelOperation(); invalidatePreview();
  const selection = view.state.selection.main, selected = $<HTMLSelectElement>('operation-scope').value === 'selection';
  if (selected && selection.empty) { status('Select text in the editor, or choose Whole document.',true); return; }
  const from = selected ? selection.from : 0, to = selected ? selection.to : view.state.doc.length;
  const snapshot = { docId:current().id,revision:current().revision,from,to,result:'' };
  worker = new Worker(new URL('./workspace-worker.ts', import.meta.url),{ type:'module' });
  $<HTMLButtonElement>('preview-operation').disabled = true; $<HTMLButtonElement>('preview-recipe').disabled = true; $('cancel-operation').hidden = false;
  status('Preparing change preview…');
  worker.onmessage = event => {
    cancelOperation();
    if (event.data.error) { status(event.data.error,true); return; }
    if (snapshot.docId !== current().id || snapshot.revision !== current().revision) { status('The document changed. Run the preview again.',true); return; }
    resultSnapshot = {...snapshot,result:event.data.result};
    $('operation-result').textContent = event.data.result.slice(0,100000);
    $('preview-size').textContent = `${(to - from).toLocaleString()} → ${event.data.result.length.toLocaleString()} characters${event.data.result.length > 100000 ? ' (first 100,000 shown)' : ''}`;
    $('operation-preview').hidden = false; status('Preview ready. The document has not changed.');
  };
  worker.onerror = () => { cancelOperation(); status('Could not run the operation. Please try again.',true); };
  worker.postMessage({ text:view.state.sliceDoc(from,to), steps });
  workerTimer = setTimeout(() => { cancelOperation(); status('Operation stopped after 5 seconds. Try a smaller selection or a simpler expression.',true); },5000);
}
$('preview-operation').addEventListener('click', () => preview([selectedOperation()]));
$('cancel-operation').addEventListener('click', () => { cancelOperation(); status('Operation cancelled. Your document is unchanged.'); });
$('operation-choice').addEventListener('change', () => { updateOperationOptions(); invalidatePreview(); });
for (const id of ['operation-scope','operation-pattern','operation-flags','operation-replacement','operation-group']) $(id).addEventListener('input',invalidatePreview);
$('apply-operation').addEventListener('click', () => {
  const s = resultSnapshot;
  if (!s || s.docId !== current().id || s.revision !== current().revision) { status('Run a fresh preview before applying changes.',true); return; }
  insert(s.result,s.from,s.to); status('Changes applied. Undo restores the previous text.');
});
$('result-as-document').addEventListener('click', () => { if (resultSnapshot) { const text = resultSnapshot.result; newDocument(text,`Result ${++untitled}.txt`); } });
let recipe: Operation[] = [];
let savedRecipes: Record<string,Operation[]> = Object.create(null);
try { const value = JSON.parse(localStorage.getItem('text-utils-recipes') || '{}'); for (const [name,steps] of Object.entries(value)) { if (name.length <= 80) savedRecipes[name] = parseRecipe(steps); } } catch { /* Invalid stored recipes are ignored. */ }
function persistRecipes() { try { localStorage.setItem('text-utils-recipes',JSON.stringify(savedRecipes)); status('Recipe saved on this device.'); } catch { status('Browser storage is unavailable; recipe changes will last only for this page.',true); } }
function renderRecipe() {
  $('recipe-count').textContent = recipe.length ? `(${recipe.length})` : '';
  $('recipe-steps').replaceChildren();
  recipe.forEach((step,index) => { const item = document.createElement('li'); item.textContent = operationName(step.id); const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label',`Remove step ${index + 1}`); remove.addEventListener('click', () => { recipe.splice(index,1); renderRecipe(); invalidatePreview(); }); item.append(remove); $('recipe-steps').append(item); });
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
renderRecipe();

let previewGeneration = 0;
async function renderMarkdown() {
  const generation = ++previewGeneration, source = view.state.doc.toString();
  if (source.length > 500000) { $('workspace-markdown').textContent = 'Markdown preview is limited to 500,000 characters. Editing and downloading remain available.'; return; }
  const [{ renderMarkdownPreview },{ default:purify }] = await Promise.all([import('../lib/markdown'),import('dompurify')]);
  if (generation !== previewGeneration || panel !== 'markdown') return;
  $('workspace-markdown').innerHTML = purify.sanitize(renderMarkdownPreview(source),{ FORBID_TAGS:['img','video','audio','source','iframe','form','input','style','link'] });
  $('workspace-markdown').querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
}
function openCompare() {
  const select = $<HTMLSelectElement>('compare-document'); select.replaceChildren();
  documents.filter(d => d.id !== current().id).forEach(d => select.add(new Option(d.name,d.id)));
  showPanel('compare','Compare documents');
}
async function renderComparison() {
  const other = documents.find(d => d.id === $<HTMLSelectElement>('compare-document').value);
  $('workspace-diff').replaceChildren();
  if (!other) { $('compare-summary').textContent = 'Open a second document to compare it with the active one.'; return; }
  const text = view.state.doc.toString(), second = other.state.doc.toString();
  if (text.length + second.length > 200000) { $('compare-summary').textContent = 'Comparison is limited to 200,000 combined characters. Select smaller documents.'; return; }
  const generation = ++previewGeneration;
  const { diffLines } = await import('diff');
  const changes = diffLines(text,second,{ timeout:1000 });
  if (generation !== previewGeneration || panel !== 'compare') return;
  if (!changes) { $('compare-summary').textContent = 'Comparison timed out. Try smaller documents.'; return; }
  let added = 0, removed = 0;
  for (const part of changes) { const pre = document.createElement('pre'); pre.className = part.added ? 'diff-add' : part.removed ? 'diff-remove' : ''; pre.textContent = `${part.added ? '+ ' : part.removed ? '− ' : '  '}${part.value}`; if (part.added) added += part.count || 0; if (part.removed) removed += part.count || 0; $('workspace-diff').append(pre); }
  $('compare-summary').textContent = `${other.name}: ${added} added lines, ${removed} removed lines. + marks additions; − marks removals.`;
}
$('compare-document').addEventListener('change', () => void renderComparison());

// Specialist tools retain their complete existing controls. Same-origin frames
// exchange text only through explicit user actions; no document is auto-sent.
const frame = $<HTMLIFrameElement>('specialist-frame');
let fieldObserver: MutationObserver | null = null;
let fieldTimer: ReturnType<typeof setTimeout>;
let specialist = '';
const resultSelectors = ['#fac-code-out','#gic-code-out','#uc-code-out','#cc-output','#mainOutput','#code-css','#code-import','#code-scss','#outputXml','#codeOutput','#outputText','#numberOutput','#textOutput','#pgOutput','#jtOutput','#output-text','#markdown-output','#output-code','#mainTextArea','#mainText','#source-text'];
function labelFor(el: HTMLElement): string {
  const doc = el.ownerDocument; const label = el.id ? doc.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`)?.textContent : null;
  return label?.trim() || el.getAttribute('aria-label') || el.id || el.tagName.toLowerCase();
}
function populateFields() {
  const doc = frame.contentDocument; if (!doc) return;
  const inputs = Array.from(doc.querySelectorAll<HTMLTextAreaElement>('main textarea')).filter(e => !e.readOnly);
  const outputs = Array.from(new Set([...doc.querySelectorAll<HTMLElement>(resultSelectors.join(',')),...doc.querySelectorAll<HTMLTextAreaElement>('main textarea')])).filter(e => !!e.id);
  const update = (select: HTMLSelectElement, values: HTMLElement[], fallback: string) => {
    const previous = select.value; const signature = values.map(el => el.id).join('|'); if (select.dataset.signature === signature) return;
    select.dataset.signature = signature; select.replaceChildren(new Option(fallback,'')); values.forEach(el => select.add(new Option(labelFor(el),el.id))); select.value = values.some(el => el.id === previous) ? previous : values[0]?.id || '';
  };
  update($<HTMLSelectElement>('tool-input-field'),inputs,'No text input'); update($<HTMLSelectElement>('tool-output-field'),outputs,'No text result');
  $<HTMLButtonElement>('send-to-tool').disabled = !inputs.length;
  const result = readToolResult();
  $<HTMLButtonElement>('insert-tool-result').disabled = !result;
  $<HTMLButtonElement>('tool-result-document').disabled = !result;
}
function readToolResult(): string {
  const id = $<HTMLSelectElement>('tool-output-field').value;
  const el = id && frame.contentDocument?.getElementById(id);
  if (!el) return '';
  return el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' ? (el as HTMLInputElement).value : el.textContent || '';
}
function openTool(id: string) {
  const native: Record<string,string> = { 'case-converter':'case', 'line-operations':'cleanup', 'markdown-previewer':'markdown', 'markdown-formatter':'format-markdown', 'pretty-printer':'format-code', 'text-diff':'compare' };
  if (native[id]) { action(native[id]); return; }
  const tool = tools.find(t => t.id === id); if (!tool) return;
  showPanel('specialist',tool.name);
  const online = ['font-chooser','google-icons-chooser','grateful-dead-archive','ip-info','xml-sitemap-generator'].includes(id);
  $('tool-network-note').textContent = online ? 'This tool has online features. Read its notice before use. Your document is sent to the tool only when you choose an input action.' : 'Choose a result, then insert it at the cursor or replace selected text.';
  $<HTMLAnchorElement>('standalone-tool').href = tool.href;
  if (specialist !== id) { fieldObserver?.disconnect(); specialist = id; frame.src = `${tool.href}?embed=1`; frame.title = tool.name; status(`Opened ${tool.name}. Your document is unchanged.`); }
}
frame.addEventListener('load', () => {
  fieldObserver?.disconnect();
  populateFields();
  if (frame.contentDocument?.body) { fieldObserver = new MutationObserver(() => { clearTimeout(fieldTimer); fieldTimer = setTimeout(populateFields,100); }); fieldObserver.observe(frame.contentDocument.body,{ childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['value','readonly'] }); frame.contentDocument.addEventListener('input',populateFields); frame.contentDocument.addEventListener('change',populateFields); frame.contentDocument.addEventListener('click',() => setTimeout(populateFields,0)); }
});
$('tool-output-field').addEventListener('change',populateFields);
$('send-to-tool').addEventListener('click', () => {
  const el = frame.contentDocument?.getElementById($<HTMLSelectElement>('tool-input-field').value) as HTMLTextAreaElement | null; if (!el) return;
  const s = view.state.selection.main;
  el.value = s.empty ? view.state.doc.toString() : view.state.sliceDoc(s.from,s.to);
  el.dispatchEvent(new Event('input',{ bubbles:true })); el.dispatchEvent(new Event('change',{ bubbles:true })); populateFields(); status('Text sent to the selected tool input. Run its action to produce a result.');
});
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
$('rename-form').addEventListener('submit', event => { event.preventDefault(); const name = $<HTMLInputElement>('document-name').value.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g,'_'); if (name) { current().name = name; renameDialog.close(); refresh(); scheduleDraft(); } });
$('rename-cancel').addEventListener('click', () => renameDialog.close());
function action(id: string) {
  root.querySelectorAll<HTMLDetailsElement>('.editor-menu[open]').forEach(menu => menu.open = false);
  switch (id) {
    case 'new': newDocument(); break;
    case 'open': $('workspace-files').click(); break;
    case 'save': download(); break;
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
    case 'close-panel': closePanel(); break;
    case 'wrap': wrap = !wrap; view.dispatch({ effects:wrapping.reconfigure(wrap ? EditorView.lineWrapping : []) }); status(`Word wrap ${wrap ? 'on' : 'off'}.`); break;
    case 'zoom-in': case 'zoom-out': fontSize = Math.max(11,Math.min(28,fontSize + (id === 'zoom-in' ? 1 : -1))); view.dispatch({ effects:sizing.reconfigure(EditorView.theme({ '&':{ fontSize:`${fontSize}px` } })) }); break;
    default: if (id.startsWith('tool:')) openTool(id.slice(5));
  }
}
root.addEventListener('click', event => { const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (button?.dataset.action) action(button.dataset.action); });
document.addEventListener('click', event => { if (!(event.target as HTMLElement).closest('.editor-menu')) root.querySelectorAll<HTMLDetailsElement>('.editor-menu[open]').forEach(menu => menu.open = false); });
root.addEventListener('keydown', event => { if (event.key === 'Escape') { root.querySelectorAll<HTMLDetailsElement>('.editor-menu[open]').forEach(menu => menu.open = false); } });
document.addEventListener('keydown', event => {
  if (event.defaultPrevented) return;
  if ((event.ctrlKey || event.metaKey) && ['o','s'].includes(event.key.toLowerCase()) && !event.altKey) { event.preventDefault(); action(event.key.toLowerCase() === 'o' ? 'open' : 'save'); }
});
$('load-example').addEventListener('click', () => { newDocument('  Keep useful tools.  \n\nMake them work together.\n  Keep useful tools.  \n\nLet the text stay in one place.  ','Cleanup example.txt'); action('cleanup'); });

let draftEnabled = false, restoring = true, draftGeneration = 0, draftWrite: Promise<void> = Promise.resolve();
let draftTimer: ReturnType<typeof setTimeout>;
try { draftEnabled = localStorage.getItem('text-utils-remember-drafts') === 'true'; } catch { /* Storage is optional. */ }
$<HTMLInputElement>('remember-drafts').checked = draftEnabled;
function scheduleDraft() { if (restoring || !draftEnabled) return; clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft,500); }
function saveDraft() {
  if (!draftEnabled || restoring) return;
  const generation = draftGeneration;
  root.dataset.draftState = 'saving';
  const snapshot = { active,documents:documents.map(d => ({ name:d.name,text:d.state.doc.toString(),savedText:d.savedText,eol:d.eol,bom:d.bom,language:d.language })) };
  draftWrite = draftWrite.catch(() => {}).then(async () => { if (generation === draftGeneration && draftEnabled) { await writeDrafts(snapshot); root.dataset.draftState = 'saved'; } }).catch(() => { root.dataset.draftState = 'error'; status('Draft recovery could not be saved. Download important work before closing.',true); });
}
async function eraseDrafts() {
  draftGeneration++; draftEnabled = false; clearTimeout(draftTimer); $<HTMLInputElement>('remember-drafts').checked = false;
  try { localStorage.removeItem('text-utils-remember-drafts'); await draftWrite; await writeDrafts(null); status('Saved drafts erased from this browser. Open documents are unchanged.'); }
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
async function initialize() {
  if (draftEnabled) {
    try {
      const snapshot = await readDrafts();
      if (snapshot?.documents && Array.isArray(snapshot.documents)) {
        let total = 0;
        for (const doc of snapshot.documents.slice(0,30)) {
          if (!doc || typeof doc.text !== 'string' || typeof doc.name !== 'string' || doc.text.length > 10_000_000) continue;
          total += doc.text.length; if (total > 30_000_000) break;
          newDocument(doc.text,doc.name,{ ...doc, savedText:typeof doc.savedText === 'string' ? doc.savedText : '',eol:['\n','\r\n','\r'].includes(doc.eol) ? doc.eol : '\n', bom:!!doc.bom });
        }
        if (documents.length) { activate(Math.max(0,Math.min(documents.length - 1,Number(snapshot.active) || 0))); status('Drafts recovered from this browser. Undo history starts fresh.'); }
      }
    } catch { status('Saved drafts could not be restored. Browser storage may be unavailable.',true); }
  }
  if (!documents.length) newDocument();
  restoring = false;
  const command = new URLSearchParams(location.search).get('tool'); if (command) openTool(command);
  root.dataset.ready = 'true';
  root.inert = false;
  root.removeAttribute('aria-busy');
  $('editor-loading').hidden = true;
}
void initialize();
