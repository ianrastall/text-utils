export interface LanguageGuess { language:string; reason:string; }
// Conservative content hints avoid coloring ordinary prose as source code.
export function strongLanguageHint(text:string): LanguageGuess | null {
  const s = text.trimStart();
  if (!s.trim()) return {language:'text',reason:'empty document'};
  const first = s.split('\n',1)[0];
  if (/^#!.*\bpython\d?\b/.test(first)) return {language:'python',reason:'Python shebang'};
  if (/^#!.*\b(?:ba|z|k)?sh\b/.test(first)) return {language:'shell',reason:'shell shebang'};
  if (/^#!.*\b(?:node|deno)\b/.test(first)) return {language:'javascript',reason:'JavaScript shebang'};
  if (/^<\?xml\b/i.test(s) || /^<svg\b/i.test(s)) return {language:'xml',reason:'XML document'};
  if (/^<!doctype\s+html\b/i.test(s) || /<(?:html|head|body|div|section|article|p|h[1-6])(?:\s|>)[\s\S]*<\//i.test(s)) return {language:'html',reason:'HTML elements'};
  if (/^<\?php\b/i.test(s)) return {language:'php',reason:'PHP opening tag'};
  if (/^[{[]/.test(s)) { try { JSON.parse(s); return {language:'json',reason:'valid JSON'}; } catch { /* Incomplete source may be another language. */ } }
  if (/^\s*(?:#{1,6}\s+.+|```\w*|\[[^\]]+\]\([^)]+\))\s*$/m.test(text) && !/^\s*#(?:include|define|if|pragma)\b/m.test(text)) return {language:'markdown',reason:'Markdown structure'};
  if (/\b(?:def\s+\w+\([^)]*\)\s*:|from\s+\w[\w.]*\s+import\s+|if\s+__name__\s*==)/.test(text)) return {language:'python',reason:'Python declarations'};
  if (/\b(?:interface|type)\s+\w+\s*(?:[={<])/.test(text) || /\b(?:const|let|function)\b[^\n]*:\s*(?:string|number|boolean)\b/.test(text)) return {language:'typescript',reason:'TypeScript types'};
  if (/\b(?:const|let|var)\s+\w+\s*=|\bfunction\s+\w+\s*\(|=>\s*[{(]/.test(text)) return {language:'javascript',reason:'JavaScript declarations'};
  if (/^\s*(?:SELECT\s+[\s\S]+\s+FROM\b|CREATE\s+TABLE\b|INSERT\s+INTO\b)/i.test(s)) return {language:'sql',reason:'SQL statement'};
  if (/^\s*(?:[.#][\w-]+|body|html|:root|@media)[^{\n]*\{[^}]*[\w-]+\s*:/m.test(text)) return {language:'css',reason:'CSS rules'};
  if (/\bfn\s+\w+\s*\([^)]*\)|\buse\s+std::/.test(text)) return {language:'rust',reason:'Rust declarations'};
  if (/\bpackage\s+\w+[\s\S]*\bfunc\s+\w+\s*\(/.test(text)) return {language:'go',reason:'Go declarations'};
  if (/^\s*(?:FROM\s+\w|RUN\s+|COPY\s+|ENTRYPOINT\s*\[)/m.test(text)) return {language:'dockerfile',reason:'Dockerfile instructions'};
  if (/^\s*using\s+System\b|\bnamespace\s+\w+[\s\S]*\bclass\s+\w+/.test(text)) return {language:'csharp',reason:'C# declarations'};
  if (/^\s*import\s+java\.|\bpublic\s+class\s+\w+/.test(text)) return {language:'java',reason:'Java declarations'};
  if (/^\s*#include\s*[<"]/.test(text)) return {language:/std::|iostream|\bclass\b/.test(text) ? 'cpp' : 'c',reason:'C/C++ includes'};
  if (/^\s*\[[\w.-]+\]\s*\n\s*[\w.-]+\s*=/m.test(text)) return {language:'toml',reason:'TOML table'};
  if (/^(?:---\s*\n)?(?:[\w-]+:\s*[^\n]*\n){2,}/.test(s)) return {language:'yaml',reason:'YAML mapping'};
  return null;
}
