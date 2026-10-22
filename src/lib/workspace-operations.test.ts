import { describe,it,expect } from 'vitest';
import { runOperation,runPipeline,parseRecipe } from './workspace-operations';
import { exportText } from './workspace-files';
describe('workspace operations', () => {
  it('preserves accented letters in every word-based case conversion', () => {
    const text = 'Café élan naïve Zoë';
    for (const [id, expected] of Object.entries({
      title: 'Café Élan Naïve Zoë', snake: 'café_élan_naïve_zoë',
      kebab: 'café-élan-naïve-zoë', camel: 'caféÉlanNaïveZoë', pascal: 'CaféÉlanNaïveZoë'
    })) expect(runOperation(text, { id })).toBe(expected);
    expect(runOperation('élan begins\nsecond line. déjà vu', { id: 'sentence' })).toBe('Élan begins\nSecond line. Déjà vu');
    expect(runOperation('Text utilities rebuild', { id: 'snake' })).toBe('text_utilities_rebuild');
    expect(runOperation('text-utils rebuild', { id: 'pascal' })).toBe('TextUtilsRebuild');
  });
  it('runs ordered cleanup without losing Unicode', () => {
    expect(runPipeline('  café 🪐  \n\ncafé 🪐\n  你好 ',[{id:'trim'},{id:'blank'},{id:'unique'}])).toBe('café 🪐\n你好');
  });
  it('round-trips UTF-8 Base64 and handles invalid data', () => {
    const text = '你好 café 🪐'; expect(runOperation(runOperation(text,{id:'base64-encode'}),{id:'base64-decode'})).toBe(text);
    expect(() => runOperation('@@@',{id:'base64-decode'})).toThrow();
  });
  it('does not strip non-Latin words in identifier conversion', () => expect(runOperation('你好 世界 Café',{id:'snake'})).toBe('你好_世界_café'));
  it('reverses whole graphemes without splitting accents or joined emoji', () => expect(runOperation('e\u0301👩‍💻',{id:'reverse'})).toBe('👩‍💻e\u0301'));
  it('sorts JSON keys without invoking prototype setters', () => {
    const result = runOperation('{"z":1,"__proto__":{"polluted":true},"a":2}',{id:'json-sort'});
    expect(JSON.parse(result).__proto__).toEqual({polluted:true}); expect(({} as Record<string,unknown>).polluted).toBeUndefined();
  });
  it('extracts Unicode capture groups and resets regex state for line filtering', () => {
    expect(runOperation('Name: café\nName: 你好',{id:'extract',options:{pattern:'Name: (.+)',group:'1',flags:'g'}})).toBe('café\n你好');
    expect(runOperation('abc\nabc\nno',{id:'filter',options:{pattern:'abc',flags:'g'}})).toBe('abc\nabc');
  });
  it('validates recipes and unknown operations', () => {
    expect(() => parseRecipe([{id:'bogus'}])).toThrow(); expect(() => parseRecipe(new Array(31).fill({id:'trim'}))).toThrow();
    expect(parseRecipe([{id:'trim'}])).toEqual([{id:'trim',options:{}}]);
  });
  it('preserves newline convention and BOM during export', () => expect(exportText('a\nb\n','\r\n',true)).toBe('\ufeffa\r\nb\r\n'));
});
