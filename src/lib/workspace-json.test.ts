import { describe, expect, it } from 'vitest';
import { formatJsonText } from './workspace-json';

describe('lossless JSON transformations', () => {
  const text = '{"z":12345678901234567890,"a":[1.0,-0,1e400,1.2300E-20],"escape":"\\u0061 , : \\\""}';
  it('preserves numeric spelling, escaped strings and whitespace inside strings', () => {
    expect(formatJsonText(formatJsonText(text), 0)).toBe(text);
    expect(formatJsonText(text, '\t')).toContain('\n\t"z": 12345678901234567890');
  });
  it('sorts nested keys without losing duplicate keys or prototype-named keys', () => {
    expect(formatJsonText('{"z":{"b":1.0,"a":-0},"__proto__":2,"z":3}', 0, true))
      .toBe('{"__proto__":2,"z":{"a":-0,"b":1.0},"z":3}');
  });
  it('accepts primitives and empty containers and rejects malformed JSON', () => {
    for (const text of ['1.0', '[]', '{}', '[{},[]]', 'true', 'null', '" a "']) expect(formatJsonText(text, 0)).toBe(text);
    for (const text of ['01', '{"a":1,}', '[NaN]', '', '[1 2]']) expect(() => formatJsonText(text)).toThrow();
  });
});
