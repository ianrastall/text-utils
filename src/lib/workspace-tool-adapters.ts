export interface ToolField { id:string; label:string; read:() => string; write?:(text:string) => void; }
const value = (el: Element): string => el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' ? (el as HTMLInputElement).value : (el as HTMLElement).innerText || el.textContent || '';
function label(el: HTMLElement): string { return el.getAttribute('aria-label') || (el.id && el.ownerDocument.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent?.trim()) || el.id; }
function field(el: HTMLElement, name = label(el)): ToolField {
  return { id:el.id,label:name,read:() => { const result = value(el); return /^(?:Select a snippet|\/\* Select a font)/i.test(result.trim()) ? '' : result; },write:'value' in el ? text => { (el as HTMLInputElement).value = text; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); } : undefined };
}
export function toolInputs(doc: Document, tool: string): ToolField[] {
  const fields = [...doc.querySelectorAll<HTMLTextAreaElement>('main textarea:not([readonly])')].map(el => field(el));
  for (const id of tool === 'font-chooser' ? ['customText'] : tool === 'grateful-dead-archive' ? ['searchQuery'] : []) { const el = doc.getElementById(id); if (el) fields.push(field(el)); }
  return fields;
}
function coloredHTML(doc: Document): string {
  const source = doc.getElementById('code-content');
  if (!source?.textContent) return '';
  const pre = doc.createElement('pre'), code = doc.createElement('code');
  pre.style.cssText = 'padding:1em;font-family:monospace;white-space:pre-wrap';
  pre.style.backgroundColor = doc.defaultView!.getComputedStyle(doc.getElementById('code-output')!).backgroundColor;
  function copy(node: Node, parent: Node) {
    if (node.nodeType === 3) { const span = doc.createElement('span'); span.style.color = doc.defaultView!.getComputedStyle(node.parentElement!).color; span.textContent = node.textContent; parent.appendChild(span); }
    else for (const child of Array.from(node.childNodes)) copy(child,parent);
  }
  copy(source,code); pre.append(code); return pre.outerHTML;
}
export function toolOutputs(doc: Document, tool: string): ToolField[] {
  const outputs: ToolField[] = [];
  const add = (id:string, name:string, read:() => string) => outputs.push({id,label:name,read});
  const element = (id:string, name?:string) => { const el = doc.getElementById(id); if (el) outputs.push(field(el,name)); };
  if (tool === 'color-combinations') add('palette-css','Palette as CSS variables',() => {
    const colors = [...doc.querySelectorAll('.swatch-hex')].map(el => el.textContent?.trim());
    return colors.length ? `:root {\n${colors.map((hex,i) => `  --color-${i + 1}: ${hex};`).join('\n')}\n}` : '';
  });
  if (tool === 'css-unit-converter') {
    const rows = [...doc.querySelectorAll('.result-card')];
    const line = (row: Element) => { const n = row.querySelector('.value')?.textContent?.trim(); const unit = row.querySelector('h4')?.textContent?.trim(); return n && n !== 'N/A' ? `${n}${unit}` : ''; };
    add('unit-report','All unit conversions',() => rows.map(line).filter(Boolean).join('\n'));
    rows.forEach((row,i) => add(`unit-${i}`,`${row.querySelector('h4')?.textContent} conversion`,() => line(row)));
  }
  if (tool === 'regex-tester') {
    add('matches','Matched text (one per line)',() => [...doc.querySelectorAll('.match-item > code')].map(el => el.textContent).join('\n'));
    element('match-output','Matches and capture-group report');
  }
  if (tool === 'text-info') add('text-report','Text statistics report',() => [...doc.querySelectorAll('#stats-grid .stat')].map(el => `${el.querySelector('span')?.textContent}: ${el.querySelector('strong')?.textContent}`).join('\n'));
  if (tool === 'ip-info') add('ip-report','Network and browser report',() => [...doc.querySelectorAll<HTMLElement>('[id$="-val"]')].filter(el => el.textContent && !/^Loading/.test(el.textContent)).map(el => `${el.previousElementSibling?.textContent || el.id}: ${el.textContent}`).join('\n'));
  if (tool === 'grateful-dead-archive') {
    add('archive-results','Recording titles and links',() => [...doc.querySelectorAll<HTMLAnchorElement>('#resultsContainer a.result-title')].map(el => `${el.textContent}\n${el.href}`).join('\n\n'));
    add('archive-search','Archive search URL',() => { const a = doc.querySelector<HTMLAnchorElement>('#archiveLink'); return a?.href.startsWith('https://archive.org/') ? a.href : ''; });
  }
  if (tool === 'syntax-highlighter') {
    add('highlight-html','Highlighted inline HTML',() => coloredHTML(doc));
    add('highlight-bbcode','Highlighted BBCode',() => {
      const el = doc.getElementById('code-content'); if (!el?.textContent) return '';
      let result = '[code]\n';
      const walker = doc.createTreeWalker(el,4);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const rgb = doc.defaultView!.getComputedStyle(node.parentElement!).color;
        const channels = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const color = channels ? '#' + channels.slice(1,4).map(n => Number(n).toString(16).padStart(2,'0')).join('') : rgb;
        result += `[color=${color}]${node.textContent}[/color]`;
      }
      return result + '\n[/code]';
    });
  }
  if (tool === 'markdown-previewer') add('markdown-html','Rendered HTML',() => doc.getElementById('md-preview')?.innerHTML || '');
  if (tool === 'text-diff') element('diff-output','Difference report');
  for (const [id,name] of [['fac-code-out','Icon code'],['gic-code-out','Icon code'],['uc-code-out','Character code'],['cc-output','Color code'],['mainOutput','Snippet code'],['code-css','Font CSS'],['code-import','Font import'],['code-scss','Font SCSS']]) element(id,name);
  // Read-only results precede editable inputs, including tools that transform in place.
  for (const el of doc.querySelectorAll<HTMLTextAreaElement>('main textarea[readonly]')) outputs.push(field(el));
  if (!outputs.length) for (const el of doc.querySelectorAll<HTMLTextAreaElement>('main textarea')) outputs.push(field(el));
  return outputs.filter((entry,index) => outputs.findIndex(other => other.id === entry.id) === index);
}
