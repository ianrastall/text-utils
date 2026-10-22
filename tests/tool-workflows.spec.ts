import { test, expect, type FrameLocator } from '@playwright/test';

type Scenario = { id:string; input?:string; run:(frame:FrameLocator)=>Promise<void>; result:RegExp };
const fill = async (f:FrameLocator,id:string,value:string) => { await f.locator('#'+id).fill(value); };
const click = async (f:FrameLocator,id:string) => { await f.locator('#'+id).click(); };
const scenarios:Scenario[] = [
{id:'case-converter',input:'hello world',run:async f=>{await f.locator('#case-mode').selectOption('upper');},result:/HELLO WORLD/},
{id:'clock-face',run:async f=>{await fill(f,'timeInput','10:15:00');},result:/<svg/},
{id:'code-snippets',run:async f=>{await f.locator('#mainCategory').selectOption('scripting');await f.locator('#language').selectOption('javascript');await expect(f.locator('#snippetType option')).not.toHaveCount(1); const value=await f.locator('#snippetType option').evaluateAll(els=>(els.find(el=>(el as HTMLOptionElement).value) as HTMLOptionElement).value);await f.locator('#snippetType').selectOption(value);},result:/\S/},
{id:'color-chooser',run:async()=>{},result:/#|rgb|hsl|--/},
{id:'color-combinations',run:async()=>{},result:/--color-1:/},
{id:'css-gradient-generator',run:async()=>{},result:/gradient\(/},
{id:'css-unit-converter',run:async()=>{},result:/rem/},
{id:'curly-quoter',input:'"Hello"',run:async f=>{await click(f,'convertBtn');},result:/“Hello”/},
{id:'font-awesome-chooser',run:async f=>{await fill(f,'fac-search','house');await f.locator('#fac-grid button').first().click();},result:/fa-/},
{id:'font-chooser',run:async f=>{await f.locator('input[name="fontSource"][value="system"]').check();await f.locator('.fc-font-item').first().click();},result:/font-family/},
{id:'google-icons-chooser',run:async f=>{await f.locator('#gic-grid button').first().click();},result:/material/},
{id:'grateful-dead-archive',input:'1977',run:async f=>{await click(f,'searchBtn');await expect(f.locator('.result-title')).toHaveCount(1);},result:/Test recording[\s\S]*archive.org/},
{id:'hashing-tool',input:'hello',run:async f=>{await f.locator('#algorithmSelect').selectOption('base64');await click(f,'transformBtn');},result:/aGVsbG8=/},
{id:'html-entities',input:'<b>Hello</b>',run:async f=>{await click(f,'encodeBtn');},result:/&#x3[cC];/},
{id:'html-tag-remover',input:'<b>Hello</b>',run:async f=>{await click(f,'stripBtn');},result:/Hello/},
{id:'gutenberg-cleaner',input:'<p>Hello</p>',run:async f=>{await f.locator('#pgOutputMode').selectOption('text');await click(f,'pgCleanBtn');},result:/Hello/},
{id:'ip-info',run:async f=>{await expect(f.locator('#public-ip-val')).toContainText('203.0.113.8');},result:/203.0.113.8/},
{id:'json-tools',input:'{"hello":1}',run:async f=>{await f.locator('[data-action="format"]').click();},result:/"hello": 1/},
{id:'line-operations',input:'beta\nalpha',run:async f=>{await f.locator('[data-action="sort"][data-value="alpha"]').click();},result:/alpha\nbeta/},
{id:'lorem-ipsum',run:async f=>{await click(f,'generate-btn');},result:/\S/},
{id:'markdown-formatter',input:'# Hello\n\nWorld',run:async f=>{await click(f,'format-btn');},result:/Hello/},
{id:'markdown-previewer',input:'# Hello',run:async()=>{},result:/<h1[^>]*>Hello/},
{id:'pretty-printer',input:'const x={a:1}',run:async f=>{await f.locator('#language-select').selectOption('babel');await click(f,'format-btn');},result:/a: 1/},
{id:'random-numbers',run:async f=>{await fill(f,'quantityInput','3');await click(f,'generateBtn');},result:/\d/},
{id:'regex-tester',input:'alpha 12 beta 34',run:async f=>{await fill(f,'regex-pattern','\\d+');},result:/12\n34/},
{id:'regex-extractor',input:'alpha 12 beta 34',run:async f=>{await fill(f,'regex-pattern','\\d+');await click(f,'btn-preview');},result:/12\n34/},
{id:'sequence-generator',run:async f=>{await fill(f,'count','3');await f.locator('#sequenceForm button[type="submit"]').click();},result:/1[\s,]+2[\s,]+3/},
{id:'text-diff',input:'Old text',run:async f=>{await fill(f,'text-new','New text');await click(f,'compare-btn');},result:/Old|New/},
{id:'text-info',input:'Hello world',run:async()=>{},result:/Words: 2/i},
{id:'unicode-chooser',run:async f=>{await f.locator('#uc-grid button').first().click();},result:/&#x/},
{id:'xml-sitemap-generator',input:'https://example.com/',run:async f=>{await click(f,'generateBtn');},result:/<loc>https:\/\/example.com\//},
{id:'text-effects',input:'abc',run:async f=>{await f.locator('#effect-mode').selectOption('reverse');},result:/cba/},
{id:'syntax-highlighter',input:'const answer = 42;',run:async()=>{},result:/<pre[\s\S]*style=[\s\S]*answer/},
];
for (const scenario of scenarios) test(`workspace tool result: ${scenario.id}`,async ({page})=>{
  await page.route('https://archive.org/advancedsearch.php*',route=>route.fulfill({json:{response:{numFound:1,docs:[{identifier:'test-recording',title:'Test recording',date:'1977-05-08',downloads:10,avg_rating:5}]}}}));
  await page.route('https://ipapi.co/json/',route=>route.fulfill({json:{ip:'203.0.113.8',org:'Test ISP',city:'Chicago',country_name:'United States',latitude:41,longitude:-87}}));
  await page.route('https://dns.google/**',route=>route.fulfill({json:{Answer:[]}}));
  await page.goto('/');await expect(page.locator('.editor-workspace')).toHaveAttribute('data-ready','true');
  const editor=page.getByRole('textbox',{name:'Document editor',exact:true});
  if(scenario.input) await editor.fill(scenario.input);
  await page.locator('.editor-toolbar [data-action="browse-tools"]').click();
  await page.locator(`#browse-panel [data-action="tool:${scenario.id}"]`).click();
  const frame=page.frameLocator('#specialist-frame');
  await expect(frame.locator('html')).toHaveAttribute('data-embedded','true');
  if(scenario.input){await expect(page.locator('#send-to-tool')).toBeEnabled();await page.locator('#send-to-tool').click();}
  await scenario.run(frame);
  await expect(page.locator('#tool-result-preview')).toHaveValue(scenario.result);
  await page.locator('#tool-result-document').click();
  await expect.poll(()=>editor.locator('.cm-line').evaluateAll(lines=>lines.map(line=>line.textContent).join('\n'))).toMatch(scenario.result);
});

test('language detection follows content, filename and explicit overrides',async({page})=>{
  await page.goto('/'); const root=page.locator('.editor-workspace');await expect(root).toHaveAttribute('data-ready','true');
  const editor=page.getByRole('textbox',{name:'Document editor',exact:true});
  await editor.fill('{"hello":42}');await expect(root).toHaveAttribute('data-language','json');
  await editor.fill('def greet(name):\n    return "Hello " + name');await expect(root).toHaveAttribute('data-language','python');
  await page.locator('#document-language').selectOption('sql');await editor.fill('<p>Hello</p>');await expect(root).toHaveAttribute('data-language','sql');
  await page.locator('#document-language').selectOption('auto');await expect(root).toHaveAttribute('data-language','html');
  await page.locator('#workspace-files').setInputFiles({name:'sample.rs',mimeType:'text/plain',buffer:Buffer.from('fn main() {}')});await expect(root).toHaveAttribute('data-language','rust');
  await expect(page.locator('#document-language')).toHaveValue('auto');
  await page.locator('#document-language').selectOption('powershell');await editor.fill('if ($true) { Write-Output "Hello" }');await expect(root).toHaveAttribute('data-language','powershell');
  await expect.poll(()=>editor.locator('.cm-line span').count()).toBeGreaterThan(0);
});



test('language changes preserve undo and manual choices survive draft recovery',async({page})=>{
  await page.goto('/');const root=page.locator('.editor-workspace');await expect(root).toHaveAttribute('data-ready','true');
  const editor=page.getByRole('textbox',{name:'Document editor',exact:true});
  await page.locator('#document-language').selectOption('javascript');
  await editor.fill('const answer = 42;');
  await expect(root).toHaveAttribute('data-language','javascript');
  await expect(page.locator('#workspace-status')).not.toHaveClass(/workspace-error/);
  await expect(editor.locator('.cm-line span')).not.toHaveCount(0);
  await page.locator('#remember-drafts').check();await expect(root).toHaveAttribute('data-draft-state','saved');
  page.on('dialog',dialog=>dialog.accept());await page.reload();await expect(root).toHaveAttribute('data-ready','true');
  await expect(page.locator('#document-language')).toHaveValue('javascript');
  await editor.press('Control+End');await editor.press('Enter');await editor.press('x');
  await page.locator('#document-language').selectOption('python');
  await page.locator('.editor-toolbar [data-action="undo"]').click();
  await expect(editor).not.toContainText('x');await expect(editor).toContainText('const answer = 42;');
  await expect(page.locator('#workspace-status')).not.toHaveClass(/workspace-error/);
});
