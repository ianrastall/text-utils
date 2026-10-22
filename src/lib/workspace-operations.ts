export interface Operation { id: string; options?: Record<string, string>; }
export const operationGroups = [
  { name: 'Clean up', items: [['trim', 'Trim each line'], ['blank', 'Remove blank lines'], ['unique', 'Remove duplicate lines'], ['spaces', 'Collapse repeated spaces']] },
  { name: 'Lines', items: [['sort', 'Sort lines A–Z'], ['sort-desc', 'Sort lines Z–A'], ['reverse-lines', 'Reverse line order'], ['number', 'Number lines']] },
  { name: 'Letter case', items: [['upper', 'UPPERCASE'], ['lower', 'lowercase'], ['title', 'Title Case'], ['sentence', 'Sentence case'], ['snake', 'snake_case'], ['kebab', 'kebab-case'], ['camel', 'camelCase'], ['pascal', 'PascalCase']] },
  { name: 'Data', items: [['json-format', 'Format JSON'], ['json-minify', 'Minify JSON'], ['json-sort', 'Sort JSON keys'], ['url-encode', 'URL encode'], ['url-decode', 'URL decode'], ['base64-encode', 'Base64 encode (UTF-8)'], ['base64-decode', 'Base64 decode (UTF-8)'], ['html-encode', 'Encode HTML characters'], ['html-decode', 'Decode HTML entities']] },
  { name: 'Find and extract', items: [['replace', 'Replace with regular expression'], ['extract', 'Extract regex matches'], ['filter', 'Keep lines matching regex']] },
  { name: 'Other', items: [['reverse', 'Reverse characters'], ['straight-quotes', 'Straighten quotes'], ['format-markdown', 'Format Markdown'], ['format-code', 'Format current language']] }
];
export function operationName(id: string): string { return operationGroups.flatMap(g => g.items).find(item => item[0] === id)?.[1] || id; }
function words(text: string): string[] { return text.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2').match(/[\p{L}\p{M}\p{N}]+/gu) || []; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => [key, sorted(v)]));
  return value;
}
function regex(options: Record<string, string>): RegExp {
  if (!options.pattern) throw new Error('Enter a regular expression first.');
  return new RegExp(options.pattern, options.flags ?? 'g');
}
export function runOperation(text: string, operation: Operation): string {
  const { id, options = {} } = operation;
  const lines = () => text.split('\n');
  switch (id) {
    case 'trim': return lines().map(s => s.trim()).join('\n');
    case 'blank': return lines().filter(s => s.trim()).join('\n');
    case 'unique': return [...new Set(lines())].join('\n');
    case 'spaces': return text.replace(/[\t ]{2,}/g, ' ');
    case 'sort': return lines().sort((a,b) => a.localeCompare(b, undefined, { numeric:true })).join('\n');
    case 'sort-desc': return lines().sort((a,b) => b.localeCompare(a, undefined, { numeric:true })).join('\n');
    case 'reverse-lines': return lines().reverse().join('\n');
    case 'number': return lines().map((line,i) => `${i + 1}. ${line}`).join('\n');
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'title': return text.toLowerCase().replace(/\p{L}[\p{L}\p{M}\p{N}'’]*/gu, cap);
    case 'sentence': return text.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gmu, s => s.toUpperCase());
    case 'snake': return words(text).map(s => s.toLowerCase()).join('_');
    case 'kebab': return words(text).map(s => s.toLowerCase()).join('-');
    case 'camel': return words(text).map((s,i) => i ? cap(s) : s.toLowerCase()).join('');
    case 'pascal': return words(text).map(cap).join('');
    case 'json-format': return JSON.stringify(JSON.parse(text), null, 2);
    case 'json-minify': return JSON.stringify(JSON.parse(text));
    case 'json-sort': return JSON.stringify(sorted(JSON.parse(text)), null, 2);
    case 'url-encode': return encodeURIComponent(text);
    case 'url-decode': return decodeURIComponent(text);
    case 'base64-encode': { const bytes = new TextEncoder().encode(text); let binary = ''; for (const b of bytes) binary += String.fromCharCode(b); return btoa(binary); }
    case 'base64-decode': return new TextDecoder('utf-8', { fatal:true }).decode(Uint8Array.from(atob(text), c => c.charCodeAt(0)));
    case 'html-encode': return text.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]!));
    case 'html-decode': return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
      if (entity.startsWith('#')) { const n = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2),16) : parseInt(entity.slice(1),10); return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : '\ufffd'; }
      return ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'" } as Record<string,string>)[entity.toLowerCase()] || match;
    });
    case 'replace': return text.replace(regex(options), options.replacement || '');
    case 'filter': { const re = regex(options); return lines().filter(line => { re.lastIndex = 0; return re.test(line); }).join('\n'); }
    case 'extract': { const re = regex(options); const all = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); return [...text.matchAll(all)].map(m => options.group ? m[Number(options.group)] ?? '' : m[0]).join('\n'); }
    case 'reverse': return Array.from(new Intl.Segmenter(undefined,{ granularity:'grapheme' }).segment(text), part => part.segment).reverse().join('');
    case 'straight-quotes': return text.replace(/[“”„«»]/g, '"').replace(/[‘’‚]/g, "'");
    default: throw new Error('Unknown text operation.');
  }
}
export function runPipeline(text: string, steps: Operation[]): string {
  if (!steps.length) throw new Error('Add at least one operation.');
  for (const step of steps) { text = runOperation(text, step); if (text.length > 10_000_000) throw new Error('The result exceeds the 10 million character limit.'); }
  return text;
}
export function parseRecipe(value: unknown): Operation[] {
  if (!Array.isArray(value) || value.length > 30) throw new Error('A recipe must contain at most 30 operations.');
  const ids = new Set(operationGroups.flatMap(group => group.items.map(item => item[0])));
  return value.map(step => {
    if (!step || typeof step.id !== 'string' || !ids.has(step.id)) throw new Error('Recipe contains an unsupported operation.');
    const options: Record<string,string> = {};
    if (step.options && typeof step.options === 'object') for (const [key,v] of Object.entries(step.options)) { if (typeof v !== 'string' || v.length > 10000) throw new Error('Invalid recipe options.'); options[key] = v; }
    return { id:step.id, options };
  });
}
