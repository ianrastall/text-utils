import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const editor = (page: Page) => page.getByRole('textbox', {name:'Document editor',exact:true});
const command = (page: Page, id: string) => page.locator(`.editor-toolbar [data-action="${id}"]`);
async function ready(page: Page) { await page.goto('/'); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true'); await expect(page.locator('#editor-startup-error')).not.toBeVisible(); }
test.beforeEach(async ({ page }) => {
  page.on('dialog', dialog => dialog.type() === 'beforeunload' ? dialog.accept() : dialog.dismiss());
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, route => route.abort());
});

test('formatting and key sorting preserve number tokens in both JSON interfaces', async ({ page }) => {
  const text = '{"z":12345678901234567890,"a":[1.0,-0,1e400]}';
  await ready(page); await editor(page).fill(text); await command(page,'transform').click();
  for (const operation of ['json-format','json-sort','json-minify']) {
    await page.locator('#operation-choice').selectOption(operation); await page.locator('#preview-operation').click();
    await expect(page.locator('#operation-result')).toContainText('12345678901234567890');
    await expect(page.locator('#operation-result')).toContainText('1.0');
    await expect(page.locator('#operation-result')).toContainText('1e400');
  }
  await page.goto('/json-tools.html'); await page.locator('#jtInput').fill(text);
  for (const name of ['Format','Sort Keys','Minify']) {
    await page.getByRole('button',{name,exact:true}).click();
    await expect(page.locator('#jtOutput')).toHaveValue(/12345678901234567890/);
    await expect(page.locator('#jtOutput')).toHaveValue(/1\.0/);
  }
});

test('cancelled and failed saves stay dirty; a completed write becomes clean', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).saveMode = 'cancel';
    (window as any).showSaveFilePicker = async () => {
      if ((window as any).saveMode === 'cancel') throw new DOMException('Cancelled','AbortError');
      return { name:'Saved.txt',createWritable: async () => ({ write:async () => { if ((window as any).saveMode === 'fail') throw new Error('Disk full'); },close:async () => {} }) };
    };
  });
  await ready(page); await editor(page).fill('Keep me');
  await command(page,'save').click(); await expect(page.locator('#workspace-status')).toContainText('cancelled');
  await expect(page.getByRole('tab')).toContainText('●');
  await page.evaluate(() => { (window as any).saveMode = 'fail'; });
  await command(page,'save').click(); await expect(page.locator('#workspace-status')).toContainText('could not be saved');
  await expect(page.getByRole('tab')).toContainText('●');
  await page.evaluate(() => { (window as any).saveMode = 'ok'; });
  await command(page,'save').click(); await expect(page.locator('#workspace-status')).toContainText('Saved Saved.txt');
  await expect(page.getByRole('tab')).toHaveText('Saved.txt');
  await page.locator('#document-eol').selectOption('crlf');
  await expect(page.getByRole('tab')).toContainText('●');
});

test('download fallback keeps the unsaved close warning', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window,'showSaveFilePicker',{value:undefined}); });
  await ready(page); await editor(page).fill('Keep the warning');
  const downloaded = page.waitForEvent('download'); await command(page,'save').click(); await downloaded;
  await expect(page.getByRole('tab')).toContainText('●');
  await page.getByRole('button',{name:'Close Untitled 1.txt',exact:true}).click();
  await expect(editor(page)).toContainText('Keep the warning');
});

test('draft writes touch only changed documents and migrate the session schema', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).draftWrites = [];
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value: any, key?: IDBValidKey) {
      if (this.name === 'documents') (window as any).draftWrites.push(value.name);
      return put.call(this,value,key!);
    };
  });
  await ready(page); await editor(page).fill('First'); await command(page,'new').click(); await editor(page).fill('Second');
  await page.locator('#remember-drafts').check();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-draft-state','saved');
  await page.evaluate(() => { (window as any).draftWrites = []; });
  await editor(page).fill('Second changed');
  await expect.poll(() => page.evaluate(() => (window as any).draftWrites)).toContain('Untitled 2.txt');
  expect(await page.evaluate(() => (window as any).draftWrites)).not.toContain('Untitled 1.txt');
  await page.reload(); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await expect(page.getByRole('tab')).toHaveCount(2); await expect(editor(page)).toContainText('Second changed');
});

test('legacy recovery names skipped records and protects the stored copy', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve,reject) => {
      const req = indexedDB.open('text-utils-workspace',1);
      req.onupgradeneeded = () => req.result.createObjectStore('workspace'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
    await new Promise<void>((resolve,reject) => {
      const tx = db.transaction('workspace','readwrite');
      tx.objectStore('workspace').put({active:0,documents:[{name:'Intact.txt',text:'Recovered',savedText:'',eol:'\n',bom:false,language:'text'},{name:'Broken.txt'}]},'session');
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    }); db.close(); localStorage.setItem('text-utils-remember-drafts','true');
  });
  await page.reload(); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await expect(editor(page)).toContainText('Recovered');
  await expect(page.locator('#workspace-status')).toContainText('Broken.txt');
  await expect(page.locator('#remember-drafts')).not.toBeChecked();
});

test('an interrupted draft transaction leaves the previous recovery copy intact', async ({ page }) => {
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value: any, key?: IDBValidKey) {
      if (this.name === 'documents' && (window as any).failDraft) { this.transaction.abort(); throw new Error('Draft storage full. Download your work.'); }
      return put.call(this,value,key!);
    };
  });
  await ready(page); await editor(page).fill('Previous recovery'); await page.locator('#remember-drafts').check();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-draft-state','saved');
  await page.evaluate(() => { (window as any).failDraft = true; }); await editor(page).fill('Unsaved new text');
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-draft-state','error');
  await expect(editor(page)).toContainText('Unsaved new text');
  await page.reload(); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await expect(editor(page)).toContainText('Previous recovery');
});

test('startup errors leave recovery navigation usable', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window,'Worker',{value:class { constructor() { throw new Error('Worker unavailable'); } }}); });
  await page.route('**/*.js', route => route.abort());
  await page.goto('/');
  // Exercise the same startup error signal as a failed module load.
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error',{message:'Startup failed'})));
  await expect(page.locator('#editor-startup-error')).toBeVisible();
  await expect(page.locator('#editor-startup-error a').first()).toBeEnabled();
  await expect(page.locator('.editor-workspace')).not.toHaveAttribute('inert','');
});

test('closing an active tab selects its neighbor and tab keys stay predictable', async ({ page }) => {
  await ready(page);
  await page.locator('#workspace-files').setInputFiles(['a.txt','b.txt','c.txt'].map(name => ({name,mimeType:'text/plain',buffer:Buffer.from(name)})));
  await page.getByRole('tab',{name:'b.txt',exact:true}).click();
  await page.getByRole('button',{name:'Close b.txt',exact:true}).click();
  await expect(page.getByRole('tab',{name:'c.txt',exact:true})).toHaveAttribute('aria-selected','true');
  await page.getByRole('tab',{name:'c.txt',exact:true}).focus(); await page.keyboard.press('Home');
  await expect(page.getByRole('tab').first()).toBeFocused();
  await page.keyboard.press('End'); await expect(page.getByRole('tab',{name:'c.txt',exact:true})).toBeFocused();
});

test('panel and menu keyboard focus returns to a useful control', async ({ page }) => {
  await ready(page); await command(page,'transform').click();
  await expect(page.locator('#work-panel-title')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.locator('#work-panel')).not.toBeVisible();
  await expect(editor(page)).toBeFocused();
  const file = page.locator('.editor-menu summary').filter({hasText:'File'});
  await file.focus(); await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button',{name:'New document',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowDown'); await expect(page.getByRole('button',{name:'Open files…',exact:true})).toBeFocused();
  await page.keyboard.press('Escape'); await expect(file).toBeFocused();
});

test('editing options cancels pending work and exposes its state', async ({ page }) => {
  await ready(page); await editor(page).fill('a'.repeat(200) + '!'); await command(page,'transform').click();
  await page.locator('#operation-choice').selectOption('replace'); await page.locator('#operation-pattern').fill('(a+)+$');
  await page.locator('#preview-operation').click();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-operation-state','running');
  await expect(page.locator('#transform-panel')).toHaveAttribute('aria-busy','true');
  await page.locator('#operation-pattern').fill('a');
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-operation-state','stale');
  await expect(page.locator('#transform-panel')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#operation-preview')).not.toBeVisible();
  await page.locator('#preview-operation').click();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-operation-state','ready');
  await expect(page.locator('#preview-size')).toBeFocused();
  await page.locator('#apply-operation').click();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-operation-state','applied');
  await expect(editor(page)).toBeFocused();
});

test('ordinary edits reuse workers and leave document tabs in place', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).languageWorkers = 0; (window as any).statisticsWorkers = 0;
    const OriginalWorker = Worker;
    window.Worker = class extends OriginalWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url,options);
        if (String(url).includes('language-worker')) (window as any).languageWorkers++;
        if (String(url).includes('statistics-worker')) (window as any).statisticsWorkers++;
      }
    };
  });
  await ready(page);
  await page.locator('#workspace-files').setInputFiles({name:'large.js',mimeType:'text/plain',buffer:Buffer.from('const value = 42;\n'.repeat(35000))});
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-stats-state','ready');
  await editor(page).press('Control+End'); await editor(page).press('x');
  await expect(page.getByRole('tab',{name:/large.js/})).toContainText('●');
  await page.evaluate(() => {
    (window as any).tabChanges = 0;
    new MutationObserver(records => { (window as any).tabChanges += records.length; }).observe(document.getElementById('document-tabs')!,{childList:true});
  });
  await editor(page).pressSequentially('abcde',{delay:100});
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-stats-state','ready');
  expect(await page.evaluate(() => (window as any).languageWorkers)).toBe(0);
  expect(await page.evaluate(() => (window as any).statisticsWorkers)).toBe(1);
  expect(await page.evaluate(() => (window as any).tabChanges)).toBe(0);
});

test('undo to an opened file restores its clean state', async ({ page }) => {
  await ready(page); await page.locator('#workspace-files').setInputFiles({name:'clean.txt',mimeType:'text/plain',buffer:Buffer.from('Original')});
  await editor(page).press('Control+End'); await editor(page).press('x');
  await expect(page.getByRole('tab',{name:/clean.txt/})).toContainText('●');
  await command(page,'undo').click();
  await expect(page.getByRole('tab',{name:'clean.txt',exact:true})).toHaveAttribute('data-dirty','false');
});

test('oversized pastes are rejected without changing the document', async ({ page }) => {
  await ready(page); await editor(page).fill('Keep this');
  await editor(page).evaluate(element => {
    const clipboardData = new DataTransfer(); clipboardData.setData('text/plain','x'.repeat(10_000_001));
    element.dispatchEvent(new ClipboardEvent('paste',{clipboardData,bubbles:true,cancelable:true}));
  });
  await expect(page.locator('#workspace-status')).toContainText('10 million');
  await expect(editor(page)).toHaveText('Keep this');
});

test('large files pause highlighting while retaining their formatting language', async ({ page }) => {
  await ready(page);
  await page.locator('#workspace-files').setInputFiles({name:'large.js',mimeType:'text/plain',buffer:Buffer.from('const n = 1;\n'.repeat(90000))});
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-highlighting','paused');
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-language','javascript');
  await expect(page.locator('#highlighting-note')).toBeVisible();
  await editor(page).fill('const n = 1;');
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-highlighting','enabled');
  await expect(page.locator('#highlighting-note')).not.toBeVisible();
});

test('a formatting recipe follows the active document language and reports its steps', async ({ page }) => {
  await ready(page); await editor(page).fill('{"value":1}'); await page.locator('#document-language').selectOption('json');
  await command(page,'transform').click(); await page.locator('#operation-choice').selectOption('format-code');
  await page.locator('#add-recipe-step').click(); await page.locator('#recipe-name').fill('Format current'); await page.locator('#save-recipe').click();
  expect(await page.evaluate(() => localStorage.getItem('text-utils-recipes'))).not.toContain('language');
  await command(page,'new').click(); await editor(page).fill('body{color:red}'); await page.locator('#document-language').selectOption('css');
  await page.locator('#preview-recipe').click();
  await expect(page.locator('#operation-result')).toContainText('color: red;');
  await expect(page.locator('#operation-reports li')).toHaveCount(1);
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-operation-step','1');
  await page.locator('#document-language').selectOption('javascript');
  await expect(page.locator('#operation-preview')).not.toBeVisible();
});

test('recipe steps can be reordered, exported and imported without document contents', async ({ page }) => {
  await ready(page); await editor(page).fill('Private document contents'); await command(page,'transform').click();
  await page.locator('#add-recipe-step').click(); await page.locator('#operation-choice').selectOption('upper'); await page.locator('#add-recipe-step').click();
  await page.getByRole('button',{name:'Move step 2 up',exact:true}).click();
  await expect(page.locator('#recipe-steps li').first()).toContainText('UPPERCASE');
  await page.locator('#recipe-name').fill('Reusable cleanup');
  const downloaded = page.waitForEvent('download'); await page.locator('#export-recipe').click();
  const file = await downloaded, bytes = await readFile((await file.path())!);
  expect(bytes.toString('utf8')).not.toContain('Private document contents');
  await page.locator('#clear-recipe').click();
  await page.locator('#recipe-file').setInputFiles({name:'cleanup.recipe.json',mimeType:'application/json',buffer:bytes});
  await expect(page.locator('#recipe-steps li')).toHaveCount(2);
  await expect(page.locator('#recipe-steps li').first()).toContainText('UPPERCASE');
  await page.locator('#preview-recipe').click();
  await expect(page.locator('#operation-result')).toHaveText('PRIVATE DOCUMENT CONTENTS');
  await expect(page.locator('#operation-reports li')).toHaveCount(2);
  await page.locator('#recipe-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":1,"name":"Bad","steps":[{"id":"execute"}]}')});
  await expect(page.locator('#workspace-status')).toHaveClass(/workspace-error/);
  await expect(page.locator('#recipe-steps li')).toHaveCount(2);
});

test('previews show line changes and do not apply unchanged text', async ({ page }) => {
  await ready(page); await editor(page).fill('  Original  '); await command(page,'transform').click();
  await page.locator('#preview-operation').click();
  await expect(page.locator('#operation-diff .diff-remove')).toContainText('Original');
  await expect(page.locator('#operation-diff .diff-add')).toContainText('Original');
  await expect(page.locator('#preview-change-summary')).toContainText('1 added lines');
  await page.locator('#apply-operation').click();
  await page.locator('#preview-operation').click();
  await expect(page.locator('#preview-change-summary')).toContainText('No text changes');
  await expect(page.locator('#apply-operation')).toBeDisabled();
  await command(page,'undo').click();
  expect(await editor(page).locator('.cm-line').textContent()).toBe('  Original  ');
});

test('tool replacements require preview and remain undoable', async ({ page }) => {
  await ready(page); await editor(page).fill('Original document'); await command(page,'browse-tools').click();
  await page.locator('#workspace-tool-search').fill('hashing'); await page.locator('[data-action="tool:hashing-tool"]').click();
  const frame = page.frameLocator('#specialist-frame');
  await frame.locator('#textOutput').evaluate((element: HTMLTextAreaElement) => { element.value = 'Replacement result'; element.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.locator('#preview-tool-result').click();
  await expect(page.locator('#operation-result')).toHaveText('Replacement result');
  await expect(editor(page)).toContainText('Original document');
  await expect(page.locator('#operation-diff .diff-remove')).toContainText('Original document');
  await page.locator('#apply-operation').click(); await expect(editor(page)).toContainText('Replacement result');
  await command(page,'undo').click(); await expect(editor(page)).toContainText('Original document');
});

test('a second browser window cannot overwrite a newer recovery copy', async ({ page }) => {
  await ready(page); await editor(page).fill('Shared original'); await page.locator('#remember-drafts').check();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-draft-state','saved');
  const other = await page.context().newPage();
  other.on('dialog',dialog => dialog.accept());
  await other.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, route => route.abort());
  await ready(other); await expect(editor(other)).toContainText('Shared original');
  await editor(page).fill('Newer recovery'); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-draft-state','saved');
  await editor(other).fill('Competing edit');
  await expect(other.locator('#workspace-status')).toContainText('another window');
  await expect(other.locator('#draft-status')).toContainText('needs attention');
  await expect(editor(other)).toContainText('Competing edit');
  await other.reload(); await expect(other.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await expect(editor(other)).toContainText('Newer recovery'); await other.close();
});

test('windows opened before enabling recovery cannot overwrite the first saved copy', async ({ page }) => {
  await ready(page);
  const other = await page.context().newPage(); other.on('dialog',dialog => dialog.accept());
  await other.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, route => route.abort());
  await ready(other);
  await editor(page).fill('First saved copy'); await page.locator('#remember-drafts').check();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-draft-state','saved');
  await editor(other).fill('Competing first save'); await other.locator('#remember-drafts').check();
  await expect(other.locator('#workspace-status')).toContainText('another window');
  await other.reload(); await expect(other.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await expect(editor(other)).toContainText('First saved copy'); await other.close();
});
