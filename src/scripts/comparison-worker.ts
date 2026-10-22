/// <reference lib="webworker" />
import { buildChangePreview } from '../lib/workspace-preview';
self.onmessage = event => {
  try { self.postMessage(buildChangePreview(event.data.before,event.data.after)); }
  catch { self.postMessage({ changes: null }); }
};
