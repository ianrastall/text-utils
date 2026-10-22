export interface SavedDocument { name: string; text: string; savedText: string; eol: '\n' | '\r\n' | '\r'; bom: boolean; language: string; languageMode?: string; }
export interface WorkspaceSnapshot { documents: SavedDocument[]; active: number; }
export function draftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open('text-utils-workspace',1);
    request.onupgradeneeded = () => request.result.createObjectStore('workspace');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Browser storage is unavailable.'));
    request.onblocked = () => reject(new Error('Close other Text Utilities tabs to enable draft storage.'));
  });
}
export async function readDrafts(): Promise<WorkspaceSnapshot | null> {
  const db = await draftDatabase();
  try { return await new Promise((resolve,reject) => { const req = db.transaction('workspace').objectStore('workspace').get('session'); req.onsuccess = () => resolve(req.result || null); req.onerror = () => reject(req.error); }); }
  finally { db.close(); }
}
export async function writeDrafts(snapshot: WorkspaceSnapshot | null): Promise<void> {
  const db = await draftDatabase();
  try { await new Promise<void>((resolve,reject) => { const tx = db.transaction('workspace','readwrite'); if (snapshot) tx.objectStore('workspace').put(snapshot,'session'); else tx.objectStore('workspace').delete('session'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Draft storage was interrupted.')); }); }
  finally { db.close(); }
}
