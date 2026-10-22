import { describe, expect, it } from 'vitest';
import { buildChangePreview } from './workspace-preview';
import { encodeRecipe, decodeRecipe } from './workspace-recipes';
describe('workflow previews and recipe exchange', () => {
  it('reports added and removed lines and handles identical/oversized sources', () => {
    expect(buildChangePreview('old\nkept','new\nkept')).toMatchObject({changed:true,added:1,removed:1});
    expect(buildChangePreview('same','same')).toMatchObject({changed:false,changes:[]});
    expect(buildChangePreview('x'.repeat(200001),'new').changes).toBeNull();
  });
  it('round-trips recipes without saving a document-specific language', () => {
    const encoded = encodeRecipe('Format',[{id:'format-code',options:{language:'json'}}]);
    expect(encoded).not.toContain('language');
    expect(decodeRecipe(encoded).steps).toEqual([{id:'format-code',options:{}}]);
  });
  it('rejects invalid recipe versions, missing steps and unsupported commands', () => {
    for (const value of [null,{version:2,name:'No',steps:[{id:'trim'}]},{version:1,name:'No',steps:[]},{version:1,name:'No',steps:[{id:'execute'}]}]) expect(() => decodeRecipe(JSON.stringify(value))).toThrow();
  });
});
