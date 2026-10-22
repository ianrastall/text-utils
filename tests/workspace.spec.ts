import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const editor = (page: Page) => page.getByRole('textbox',{ name:'Document editor',exact:true });
async function expectEditor(page: Page, text: string) {
  await expect.poll(() => editor(page).locator('.cm-line').evaluateAll(lines => lines.map(line => { const copy = line.cloneNode(true) as HTMLElement; copy.querySelectorAll('.cm-placeholder').forEach(el => el.remove()); return copy.textContent || ''; }).join('\n'))).toBe(text);
}
const command = (page: Page, id: string) => page.locator(`.editor-toolbar [data-action="${id}"]`);
async function ready(page: Page) { await page.goto('/'); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true'); }
test.beforeEach(async ({ page }) => { page.on('dialog',async dialog => { if (dialog.type() === 'beforeunload') await dialog.accept(); else await dialog.dismiss(); }); });

test('homepage is a responsive editor and does not send text over the network', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror',e => errors.push(e.message));
  await ready(page);
  await expect(page.locator('.tool-card')).toHaveCount(0);
  const requests: string[] = [];
  page.on('request',request => { if (!request.url().startsWith('http://127.0.0.1:4321/')) requests.push(request.url()); });
  await editor(page).fill('Private text: 你好, café, 🪐');
  for (const width of [1440,1024,900,768,390,320]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await command(page,'transform').click();
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#operation-preview')).toBeVisible();
  expect(requests).toEqual([]); expect(errors).toEqual([]);
});

test('cleanup preview applies as one reversible edit', async ({ page }) => {
  await ready(page); const source = '  Alpha  \n\nAlpha\n  Beta  ';
  await editor(page).fill(source);
  await page.locator('.editor-menu summary').filter({hasText:'Text'}).click();
  await page.getByRole('button',{name:'Clean up lines…',exact:true}).click();
  await page.getByRole('button',{name:'Preview recipe',exact:true}).click();
  await expect(page.locator('#operation-result')).toHaveText('Alpha\nBeta');
  await expectEditor(page, source);
  await page.getByRole('button',{name:'Apply changes',exact:true}).click();
  await expectEditor(page, 'Alpha\nBeta');
  await command(page,'undo').click(); await expectEditor(page, source);
  await command(page,'redo').click(); await expectEditor(page, 'Alpha\nBeta');
});

test('selection transforms leave surrounding text intact and stale previews are invalidated', async ({ page }) => {
  await ready(page); await editor(page).fill('alpha beta');
  await editor(page).press('Control+Home'); await editor(page).press('Control+Shift+ArrowRight');
  await command(page,'transform').click();
  await page.locator('#operation-choice').selectOption('upper');
  await expect(page.locator('#operation-scope')).toHaveValue('selection');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#operation-result')).toContainText('ALPHA');
  await page.getByRole('button',{name:'Apply changes',exact:true}).click();
  await expectEditor(page, 'ALPHA beta');
  await page.locator('#operation-scope').selectOption('document');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#operation-preview')).toBeVisible();
  await editor(page).press('End'); await editor(page).press('!');
  await expect(page.locator('#operation-preview')).not.toBeVisible();
});

test('document tabs preserve independent undo history and dirty close can be cancelled', async ({ page }) => {
  await ready(page); await editor(page).fill('First document');
  await command(page,'new').click(); await editor(page).fill('Second document');
  await page.getByRole('tab',{name:'Untitled 1.txt',exact:false}).click();
  await expectEditor(page, 'First document');
  await command(page,'undo').click(); await expectEditor(page, '');
  await page.getByRole('tab',{name:'Untitled 2.txt',exact:false}).click();
  await expectEditor(page, 'Second document');
  await page.getByRole('button',{name:'Close Untitled 2.txt',exact:true}).click();
  await expect(page.getByRole('tab')).toHaveCount(2);
});

test('UTF-8 files preserve CRLF, BOM and download filename', async ({ page }) => {
  await ready(page);
  await page.locator('#workspace-files').setInputFiles({name:'original.txt',mimeType:'text/plain',buffer:Buffer.from('\ufeffHello 🪐\r\nSecond line\r\n','utf8')});
  await expect(page.getByRole('tab',{name:'original.txt',exact:true})).toBeVisible();
  await expect(page.locator('#document-eol')).toHaveValue('crlf');
  const download = page.waitForEvent('download'); await command(page,'save').click();
  const file = await download; expect(file.suggestedFilename()).toBe('original.txt');
  const bytes = await readFile((await file.path())!); expect(bytes.toString('utf8')).toBe('\ufeffHello 🪐\r\nSecond line\r\n');
});

test('invalid files and invalid JSON preserve the current document', async ({ page }) => {
  await ready(page); await editor(page).fill('Keep this');
  await page.locator('#workspace-files').setInputFiles({name:'binary.bin',mimeType:'application/octet-stream',buffer:Buffer.from([0,1,2])});
  await expect(page.locator('#workspace-status')).toContainText('binary');
  await expectEditor(page, 'Keep this');
  await command(page,'transform').click(); await page.locator('#operation-choice').selectOption('json-format');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#workspace-status')).toHaveClass(/workspace-error/);
  await expectEditor(page, 'Keep this');
});

test('regex extraction and formatting run in the operation worker', async ({ page }) => {
  await ready(page); await editor(page).fill('one 12 two 34');
  await command(page,'transform').click(); await page.locator('#operation-choice').selectOption('extract');
  await page.locator('#operation-pattern').fill('\\d+');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#operation-result')).toHaveText('12\n34');
  await page.getByRole('button',{name:'Apply changes',exact:true}).click();
  await editor(page).fill('{"x":1}'); await page.locator('#document-language').selectOption('json');
  await page.locator('#operation-choice').selectOption('format-code');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#operation-result')).toContainText('"x": 1');
});

test('pathological regex can be cancelled without blocking editing', async ({ page }) => {
  await ready(page); await editor(page).fill('a'.repeat(200) + '!');
  await command(page,'transform').click(); await page.locator('#operation-choice').selectOption('replace');
  await page.locator('#operation-pattern').fill('(a+)+$');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await expect(page.locator('#workspace-status')).toContainText('cancelled');
  await editor(page).fill('Still usable'); await expectEditor(page, 'Still usable');
});

test('Markdown preview blocks executable markup and remote images', async ({ page }) => {
  await ready(page); const remote: string[] = [];
  page.on('request',r => { if (r.url().includes('example.invalid')) remote.push(r.url()); });
  await editor(page).fill('# Title\n\n**Hello**\n\n<img src="https://example.invalid/image.png" onerror="alert(1)"><script>alert(2)</script>');
  await command(page,'markdown').click();
  await expect(page.locator('#workspace-markdown strong')).toHaveText('Hello');
  await expect(page.locator('#workspace-markdown img, #workspace-markdown script')).toHaveCount(0);
  expect(remote).toEqual([]);
});

test('icon picker inserts its result into the current document with undo', async ({ page }) => {
  await ready(page); await editor(page).fill('Before '); await editor(page).press('Control+End');
  await command(page,'browse-tools').click(); await page.locator('#workspace-tool-search').fill('Font Awesome');
  await page.locator('#browse-panel [data-action="tool:font-awesome-chooser"]').click();
  const frame = page.frameLocator('#specialist-frame');
  await expect(frame.locator('html')).toHaveAttribute('data-embedded','true');
  await frame.locator('#fac-search').fill('house');
  await frame.locator('.fac-grid button').first().click();
  await expect(page.locator('#insert-tool-result')).toBeEnabled();
  await page.locator('#insert-tool-result').click();
  await expect(editor(page)).toContainText('fa-');
  await command(page,'undo').click(); await expectEditor(page, 'Before ');
});

test('specialist text tool receives input only explicitly and returns live output', async ({ page }) => {
  await ready(page); await editor(page).fill('Hello 🌍');
  await command(page,'browse-tools').click(); await page.locator('#workspace-tool-search').fill('hashing');
  await page.locator('[data-action="tool:hashing-tool"]').click();
  const frame = page.frameLocator('#specialist-frame');
  await expect(frame.locator('#textInput')).toHaveValue('');
  await page.locator('#send-to-tool').click(); await expect(frame.locator('#textInput')).toHaveValue('Hello 🌍');
  await frame.locator('#textOutput').evaluate((el: HTMLTextAreaElement) => { el.value = 'Tool result'; el.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.locator('#insert-tool-result').click(); await expect(editor(page)).toContainText('Tool result');
});

test('draft recovery is opt-in, restores tabs, and can be erased', async ({ page }) => {
  await ready(page); await expect(page.locator('#remember-drafts')).not.toBeChecked();
  await editor(page).fill('Recover me'); await page.locator('#remember-drafts').check();
  await expect(page.locator('.editor-workspace')).toHaveAttribute('data-draft-state','saved');
  await page.reload(); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await expectEditor(page, 'Recover me');
  await page.locator('#forget-drafts').click(); await expect(page.locator('#workspace-status')).toContainText('erased');
  await page.reload(); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await expectEditor(page, '');
});

test('recipes persist without storing document text and can be reused', async ({ page }) => {
  await ready(page); await editor(page).fill('  test  '); await command(page,'transform').click();
  await page.getByRole('button',{name:'Add to recipe',exact:true}).click();
  await page.locator('#recipe-name').fill('Trim it'); await page.getByRole('button',{name:'Save recipe',exact:true}).click();
  const stored = await page.evaluate(() => localStorage.getItem('text-utils-recipes'));
  expect(stored).toContain('Trim it'); expect(stored).not.toContain('  test  ');
  await page.reload(); await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  await command(page,'transform').click(); await page.locator('#recipe-details summary').click();
  await page.locator('#saved-recipe').selectOption('Trim it'); await page.getByRole('button',{name:'Load',exact:true}).click();
  await expect(page.locator('#recipe-steps li')).toHaveCount(1);
});

test('find and replace, help and tool directory remain reachable', async ({ page }) => {
  await ready(page); await editor(page).fill('find me'); await command(page,'find').click();
  await expect(page.locator('.cm-search')).toBeVisible();
  await page.getByRole('button',{name:'Help',exact:true}).click();
  await expect(page.locator('#help-panel')).toBeVisible();
  await page.getByRole('link',{name:'Browse tool directory',exact:true}).click();
  await expect(page.locator('.tool-card')).toHaveCount(33);
});

test('keyboard download fires once and Escape then Tab leaves the editor', async ({ page }) => {
  await ready(page); await editor(page).fill('Download me');
  let downloads = 0; page.on('download',() => downloads++);
  const downloaded = page.waitForEvent('download'); await editor(page).press('Control+s'); await downloaded;
  await expect.poll(() => downloads).toBe(1);
  await editor(page).focus(); await editor(page).press('Escape'); await editor(page).press('Tab');
  await expect(editor(page)).not.toBeFocused();
});

test('comparison identifies changes between document tabs', async ({ page }) => {
  await ready(page); await editor(page).fill('First line\nOriginal');
  await command(page,'new').click(); await editor(page).fill('First line\nChanged');
  await page.locator('.editor-menu summary').filter({hasText:'View'}).click();
  await page.getByRole('button',{name:'Compare documents…',exact:true}).click();
  await expect(page.locator('#workspace-diff .diff-remove')).toContainText('Changed');
  await expect(page.locator('#workspace-diff .diff-add')).toContainText('Original');
});

test('formatting loads only the needed parser and supports Markdown and CSS', async ({ page }) => {
  await ready(page); await editor(page).fill('#    Heading\n\nhello'); await command(page,'transform').click();
  await page.locator('#operation-choice').selectOption('format-markdown');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#operation-result')).toContainText('# Heading');
  await editor(page).fill('body{color:red}'); await page.locator('#document-language').selectOption('css');
  await page.locator('#operation-choice').selectOption('format-code');
  await page.getByRole('button',{name:'Preview changes',exact:true}).click();
  await expect(page.locator('#operation-result')).toContainText('color: red;');
});

test('workspace panels fit mobile widths and honor light and forced-color modes', async ({ page }) => {
  await ready(page); await page.setViewportSize({width:320,height:800});
  for (const action of ['transform','browse-tools','markdown']) {
    await command(page,action).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Theme',{exact:true}).selectOption('light'); await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.emulateMedia({forcedColors:'active'});
  await expect(editor(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
