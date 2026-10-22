import { describe, expect, it } from 'vitest';
import { inspectDrafts, type SavedDocument } from './workspace-storage';
const doc = (name: string, text: string): SavedDocument => ({ name,text,savedText:'',eol:'\n',bom:false,language:'text' });
describe('recovery limits', () => {
  it('uses the same total limit and reports every skipped document', () => {
    const text = 'x'.repeat(10_000_000);
    const checked = inspectDrafts({ active:0,documents:[doc('one',text),doc('two',text),doc('three',text),doc('four','x')] });
    expect(checked.documents).toHaveLength(3); expect(checked.skipped).toEqual(['four']);
  });
  it('keeps valid later documents when an earlier record is invalid', () => {
    const checked = inspectDrafts({ active:0,documents:[{name:'broken'} as SavedDocument,doc('intact','Keep me')] });
    expect(checked.skipped).toEqual(['broken']); expect(checked.documents[0].text).toBe('Keep me');
  });
  it('normalizes invalid language identifiers and duplicate document IDs', () => {
    const checked = inspectDrafts({ active:0,documents:[{...doc('one','ok'),id:'same',language:'__proto__'}, {...doc('two','ok'),id:'same',languageMode:'toString'}] });
    expect(checked.documents[0].language).toBe('text');
    expect(checked.documents[1].id).toBeUndefined();
    expect(checked.documents[1].languageMode).toBe('auto');
  });
});
