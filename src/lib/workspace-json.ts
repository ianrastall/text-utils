// Keep source tokens rather than converting JSON numbers to JavaScript Numbers.
// JSON.parse is used only for validation and decoding object-key strings.
export function jsonTokens(text: string): string[] {
  JSON.parse(text);
  return text.match(/"(?:\\[\s\S]|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g) || [];
}

export function formatJsonText(text: string, indent: number | string = 2, sortKeys = false): string {
  let tokens = jsonTokens(text);
  if (sortKeys) {
    let index = 0;
    function value(depth: number): string[] {
      if (depth > 256) throw new Error('JSON key sorting is limited to 256 nesting levels.');
      const token = tokens[index++];
      if (token !== '{' && token !== '[') return [token];
      const end = token === '{' ? '}' : ']';
      const entries: { key: string; tokens: string[] }[] = [];
      while (tokens[index] !== end) {
        const key = token === '{' ? tokens[index++] : '';
        if (key) index++; // colon
        const child = value(depth + 1);
        entries.push({ key, tokens: key ? [key, ':'].concat(child) : child });
        if (tokens[index] !== ',') break;
        index++;
      }
      index++;
      if (token === '{') entries.sort((a, b) => (JSON.parse(a.key) as string).localeCompare(JSON.parse(b.key)));
      return [token].concat(entries.flatMap((entry, i) => i ? [','].concat(entry.tokens) : entry.tokens), [end]);
    }
    tokens = value(0);
  }
  const unit = typeof indent === 'number' ? ' '.repeat(Math.max(0, Math.min(10, indent))) : indent.slice(0, 10);
  if (!unit) return tokens.join('');
  let depth = 0;
  const output: string[] = [];
  const newline = () => '\n' + unit.repeat(depth);
  tokens.forEach((token, i) => {
    if (token === '{' || token === '[') {
      output.push(token); depth++;
      if (tokens[i + 1] !== '}' && tokens[i + 1] !== ']') output.push(newline());
    } else if (token === '}' || token === ']') {
      depth--;
      if (tokens[i - 1] !== '{' && tokens[i - 1] !== '[') output.push(newline());
      output.push(token);
    } else if (token === ',') output.push(',', newline());
    else if (token === ':') output.push(': ');
    else output.push(token);
  });
  return output.join('');
}
