import { test, expect, type Page } from '@playwright/test';
const editor = (page: Page) => page.getByRole('textbox', {name:'Document editor',exact:true});
const command = (page: Page, id: string) => page.locator(`.editor-toolbar [data-action="${id}"]`);
async function ready(page: Page) { await page.goto('/'); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true'); }
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
