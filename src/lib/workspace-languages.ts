import type { Extension } from '@codemirror/state';
export const languageOptions = [
  ['text','Plain text'],['markdown','Markdown'],['json','JSON'],['html','HTML'],['css','CSS'],['javascript','JavaScript'],['typescript','TypeScript'],
  ['jsx','JSX'],['tsx','TSX'],['python','Python'],['sql','SQL'],['yaml','YAML'],['xml','XML'],['shell','Shell'],['powershell','PowerShell'],
  ['c','C'],['cpp','C++'],['csharp','C#'],['java','Java'],['go','Go'],['rust','Rust'],['ruby','Ruby'],['php','PHP'],['lua','Lua'],['toml','TOML'],['kotlin','Kotlin'],['swift','Swift'],['r','R'],['dockerfile','Dockerfile'],['diff','Diff']
];
export const languageLabel = (id:string) => languageOptions.find(item => item[0] === id)?.[1] || 'Plain text';
const extensions: Record<string,string> = {
  md:'markdown',markdown:'markdown',mdown:'markdown',json:'json',jsonl:'json',html:'html',htm:'html',svg:'xml',xml:'xml',xhtml:'xml',css:'css',
  js:'javascript',mjs:'javascript',cjs:'javascript',ts:'typescript',jsx:'jsx',tsx:'tsx',py:'python',pyw:'python',sql:'sql',yaml:'yaml',yml:'yaml',
  sh:'shell',bash:'shell',zsh:'shell',ps1:'powershell',c:'c',h:'c',cc:'cpp',cpp:'cpp',hpp:'cpp',cs:'csharp',java:'java',go:'go',rs:'rust',rb:'ruby',php:'php',lua:'lua',toml:'toml',kt:'kotlin',kts:'kotlin',swift:'swift',r:'r',diff:'diff',patch:'diff'
};
export function filenameLanguage(name:string): string | null {
  const base = name.toLowerCase().split(/[\\/]/).pop()!;
  if (base === 'dockerfile' || base.startsWith('dockerfile.')) return 'dockerfile';
  if (base === 'makefile' || base.endsWith('.txt')) return null;
  return extensions[base.split('.').pop()!] || null;
}
const caches = new Map<string,Promise<Extension>>();
export function loadLanguage(id:string): Promise<Extension> {
  if (id === 'text') return Promise.resolve([]);
  if (!caches.has(id)) caches.set(id,import('@codemirror/language-data').then(async ({languages}) => {
    const name = languageLabel(id);
    const description = languages.find(language => language.name.toLowerCase() === name.toLowerCase());
    return description ? await description.load() : [];
  }));
  return caches.get(id)!;
}
