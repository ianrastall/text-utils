# Text Utilities editor workspace

Implemented 21 October 2026. The homepage is the working text editor; `/tools.html` is the supporting catalogue. Existing tool/category URLs remain intact.

## Documents

Open or drop UTF-8 files, or start typing. Each tab retains its own text, selection, language mode and undo/redo state while open. File → Download saves a UTF-8 copy, preserving the detected BOM and line-ending convention; it does not overwrite the original file. Mixed line endings normalize to the selected convention. A modified marker and close/navigation prompts protect work that has not been downloaded.

Ctrl/Cmd+O opens files; Ctrl/Cmd+S downloads; Ctrl/Cmd+F opens find/replace. Tab indents; Escape followed by Tab leaves the editor. Language modes: plain text, Markdown, JSON, HTML, CSS, JavaScript and TypeScript. Other files remain editable as plain text. Limits: 10 MB per input file, 10 million characters per document/result, 30 open documents.

## Operations and recipes

Text tools act on the whole document or its main selection. Native commands cover line cleanup/order/numbering, Unicode-aware case conversion, JSON formatting/minification/key sorting, URL/Base64/HTML conversion, regex replacement/extraction/filtering, quote straightening, character reversal and source formatting.

Preview shows the proposed result before applying. Each transformation/recipe is one isolated transaction in the same undo history as typing. Source changes invalidate pending previews. Results can become new documents. Recipes store ordered operations/options as named local presets, separately from document drafts. Up to 30 steps and 30 presets are supported.

Operations run in a dedicated module worker, can be cancelled and time out after five seconds. Formatting parsers load when needed. Invalid data leaves the document unchanged.

## Views and tools

Markdown preview is sanitized and blocks remote images/resources; links open separately. Preview is limited to 500,000 characters. Compare documents shows additions/removals between tabs, limited to 200,000 combined characters and bounded computation time.

Insert opens icon/Unicode/snippet/generator tools; All tools searches the original collection. Core text commands open native controls. Specialists open their existing complete interface in a same-origin docked frame, with standalone access retained. Input is sent only through the explicit input action. Choose an input/result field, then insert the result at the cursor, replace the selection, or open a new document. Insertion is undoable. Network-dependent tools retain their notices. On narrow screens panels stack below the editor.

## Recovery and privacy

Draft recovery is off initially. Opting in stores text, document names, settings and active tab in IndexedDB on this device/browser. It does not synchronize across devices. Recovered text starts fresh undo history. Browser cleanup can remove drafts; keep permanent downloaded copies. Erase saved drafts disables recovery and removes the stored session without changing open text. Concurrent browser windows can overwrite the same snapshot; use one workspace window per session.

Core editing and transformations require no account, server or paid API and do not upload text. Optional specialist services make requests described in their notices. Existing GitHub Pages hosting/domain remain in place.

## Implementation and validation

`EditorWorkspace.astro` defines the interface. `editor-workspace.ts` owns CodeMirror 6 states, document lifecycle and explicit specialist input/output exchange. `workspace-operations.ts` and `workspace-worker.ts` define cancellable transformations; `workspace-files.ts` handles decoding/export; `workspace-storage.ts` handles browser recovery. The shared Jupiter appearance control and semantic styling remain in use. CodeMirror and its dependencies are pinned and distributed with their license notices.

Release checks: `npm test`, `npm run build`, `npm run test:browser`, `npm run audit`. Browser tests cover all existing tool routes and the editor's files, selections, previews, undo, tabs, recovery, recipes, cancellation, formatting, sanitization, comparison, icon insertion, keyboard interaction, themes and responsive layout. CI repeats checks on Linux before Pages publication. Browser validation uses Chromium; Firefox/Safari validation is not claimed.
