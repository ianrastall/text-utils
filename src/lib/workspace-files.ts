export interface TextFile { name: string; text: string; eol: '\n' | '\r\n' | '\r'; bom: boolean; }
export async function readTextFile(file: File): Promise<TextFile> {
  if (file.size > 10_000_000) throw new Error(`${file.name}: files must be smaller than 10 MB.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const bom = bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191;
  const text = new TextDecoder('utf-8', { fatal:true }).decode(bytes);
  if (text.includes('\0')) throw new Error(`${file.name}: this appears to be a binary file. Open a UTF-8 text file instead.`);
  const eol = text.includes('\r\n') ? '\r\n' : text.includes('\r') ? '\r' : '\n';
  return { name:file.name, text:text.replace(/\r\n?/g, '\n'), eol, bom };
}
export function exportText(text: string, eol: TextFile['eol'], bom: boolean): string { return (bom ? '\ufeff' : '') + text.replace(/\n/g, eol); }
