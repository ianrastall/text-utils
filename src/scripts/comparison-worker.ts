/// <reference lib="webworker" />
import { diffLines } from 'diff';
self.onmessage = event => {
  try { self.postMessage({ changes: diffLines(event.data.before,event.data.after,{timeout:1000}) }); }
  catch { self.postMessage({ changes: null }); }
};
