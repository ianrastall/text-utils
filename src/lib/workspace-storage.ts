import { languageOptions } from './workspace-languages';
export interface SavedDocument { id?: string; name: string; text: string; savedText: string; eol: '\n' | '\r\n' | '\r'; bom: boolean; language: string; languageMode?: string; savedEol?: '\n' | '\r\n' | '\r'; savedBom?: boolean; }
export interface WorkspaceSnapshot { documents: SavedDocument[]; active: number; }
let draftVersion: string | null | undefined;
const languageIds = new Set(languageOptions.map(([id]) => id));
export const DRAFT_CHARACTER_LIMIT = 30_000_000;
export function inspectDrafts(snapshot: WorkspaceSnapshot): { documents: SavedDocument[]; skipped: string[] } {
  const documents: SavedDocument[] = [], skipped: string[] = [];
  let total = 0;
  const ids = new Set<string>();
  for (const [index, doc] of snapshot.documents.entries()) {
    const name = typeof doc?.name === 'string' ? doc.name : `Document ${index + 1}`;
    if (!doc || typeof doc.name !== 'string' || typeof doc.text !== 'string' || doc.text.length > 10_000_000 || total + doc.text.length > DRAFT_CHARACTER_LIMIT || documents.length >= 30) {
      skipped.push(name); continue;
    }
    total += doc.text.length;
    const id = typeof doc.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(doc.id) && !ids.has(doc.id) ? doc.id : undefined;
    if (id) ids.add(id);
    documents.push({ ...doc, id, language:languageIds.has(doc.language) ? doc.language : 'text', languageMode:doc.languageMode === 'auto' || languageIds.has(doc.languageMode || '') ? doc.languageMode : 'auto', savedEol: ['\n','\r\n','\r'].includes(doc.savedEol || '') ? doc.savedEol : undefined, savedBom:typeof doc.savedBom === 'boolean' ? doc.savedBom : undefined, savedText: typeof doc.savedText === 'string' && doc.savedText.length <= 10_000_000 ? doc.savedText : '',
      eol: ['\n', '\r\n', '\r'].includes(doc.eol) ? doc.eol : '\n', bom: doc.bom === true });
  }
  return { documents, skipped };
}
export function draftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open('text-utils-workspace',2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('workspace')) request.result.createObjectStore('workspace');
      if (!request.result.objectStoreNames.contains('documents')) request.result.createObjectStore('documents');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Browser storage is unavailable.'));
    request.onblocked = () => reject(new Error('Close other Text Utilities tabs to enable draft storage.'));
  });
}
export async function readDrafts(): Promise<WorkspaceSnapshot | null> {
  const db = await draftDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(['workspace', 'documents']);
      let snapshot: WorkspaceSnapshot | null = null;
      const req = tx.objectStore('workspace').get('session');
      req.onsuccess = () => {
        const stored = req.result;
        draftVersion = typeof stored?.revision === 'string' ? stored.revision : null;
        if (stored?.version !== 2) { snapshot = stored || null; return; }
        snapshot = { active: stored.active, documents: new Array(stored.order.length) };
        stored.order.forEach((item: { id: string; name: string }, index: number) => {
          const doc = tx.objectStore('documents').get(item.id);
          doc.onsuccess = () => { snapshot!.documents[index] = doc.result || { name: item.name }; };
        });
      };
      tx.oncomplete = () => resolve(snapshot);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Draft recovery was interrupted.'));
    });
  }
  finally { db.close(); }
}
export async function writeDrafts(snapshot: WorkspaceSnapshot | null, changedIds?: Set<string>): Promise<void> {
  if (snapshot && inspectDrafts(snapshot).skipped.length) throw new Error('Draft recovery supports 30 documents, 10 million characters each and 30 million total. The previous recovery copy was kept. Download your work.');
  const db = await draftDatabase();
  try { await new Promise<void>((resolve,reject) => {
    const tx = db.transaction(['workspace', 'documents'],'readwrite');
    const docs = tx.objectStore('documents'), workspace = tx.objectStore('workspace');
    const nextVersion = crypto.randomUUID();
    if (!snapshot) { docs.clear(); workspace.delete('session'); }
    else {
      const session = workspace.get('session');
      session.onsuccess = () => {
        const actualVersion = typeof session.result?.revision === 'string' ? session.result.revision : null;
        if (draftVersion !== undefined && actualVersion !== draftVersion) {
          tx.abort(); reject(new Error('Draft recovery changed in another window. Download this window’s work, then reload to recover the latest copy.')); return;
        }
        try {
          const order = snapshot.documents.map((doc, index) => ({ id: doc.id || `legacy-${index}`, name: doc.name }));
          snapshot.documents.forEach((doc, index) => { if (!changedIds || changedIds.has(order[index].id)) docs.put(doc, order[index].id); });
          const keys = docs.getAllKeys();
          keys.onsuccess = () => { const keep = new Set(order.map(item => item.id)); for (const key of keys.result) if (!keep.has(String(key))) docs.delete(key); };
          workspace.put({ version: 2, revision: nextVersion, order, active: snapshot.active }, 'session');
        } catch (error) { try { tx.abort(); } catch { /* Already aborted. */ } reject(error); }
      };
    }
    tx.oncomplete = () => { draftVersion = snapshot ? nextVersion : null; resolve(); };
    tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Draft storage was interrupted.'));
  }); }
  finally { db.close(); }
}
