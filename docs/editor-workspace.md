# Text Utilities editor workspace

Implemented 21 October 2026. The homepage is the working text editor; `/tools.html` is the supporting catalogue. Existing tool/category URLs remain intact.

## Documents

Open or drop UTF-8 files, or start typing. Each tab retains its own text, selection, language mode and undo/redo state while open. File → Save file writes a UTF-8 file after a browser destination picker, preserving BOM and line endings. The modified marker clears only after a successful write; edits made during saving remain modified. Browsers without file-picker support download a copy instead. File → Download copy always downloads. Download completion cannot be confirmed, so downloads retain the modified marker and close/navigation warnings. Mixed line endings normalize to the selected convention. Changing the line-ending setting counts as a modification.

Ctrl/Cmd+O opens files; Ctrl/Cmd+S saves (or downloads when the file picker is unavailable); Ctrl/Cmd+F opens find/replace. Tab indents; Escape followed by Tab leaves the editor. Automatic highlighting uses the filename first, then conservative content detection in a local background worker. Ambiguous prose stays plain text. Known languages are retained during ordinary typing; pasted/replaced contents, renames and explicit language choices can trigger detection. The language menu offers a manual override for 30 modes, including Python, SQL, C/C++, C#, Java, Rust, Go, PowerShell, YAML and XML. Parsers load on demand; detection samples at most 16,000 characters and times out after two seconds. Each tab retains its automatic/manual choice. Above one million characters, syntax highlighting pauses with a visible notice; formatting still uses the selected language. Word counts run in an idle-scheduled worker, and unchanged tabs retain their DOM nodes. Limits: 10 MB per input file, 10 million characters per document/result, 30 open documents.

## Operations and recipes

Text tools act on the whole document or its main selection. Native commands cover line cleanup/order/numbering, Unicode-aware case conversion, JSON formatting/minification/key sorting, URL/Base64/HTML conversion, regex replacement/extraction/filtering, quote straightening, character reversal and source formatting.

Preview shows the proposed result and line additions/removals before applying. Comparison is limited to 200,000 combined characters and the first 1,000 difference sections. Larger results retain their text preview; limitations are stated. Identical results cannot be applied. Each transformation/recipe is one isolated transaction in the same undo history as typing. Source changes invalidate pending previews. Results can become new documents. Recipes store ordered operations/options as named local presets, separately from document drafts. Up to 30 steps and 30 presets are supported. Steps can be reordered, and named recipes can be exported/imported as version 1 JSON files (up to 2 MB). Format current language resolves against the active document at execution time; recipes do not retain a document-specific language. Preview reports each step’s input/output sizes and progress.

Operations run in a dedicated module worker, can be cancelled and time out after five seconds. Formatting parsers load when needed. Invalid data leaves the document unchanged. JSON formatting/minification/key sorting preserve numeric tokens, duplicate keys and string escapes exactly. Text or option edits cancel pending operations and invalidate results.

## Views and tools

Markdown preview is sanitized and blocks remote images/resources; links open separately. Preview is limited to 500,000 characters. Compare documents shows additions/removals between tabs, limited to 200,000 combined characters and bounded computation time in a cancellable worker.

Insert opens icon/Unicode/snippet/generator tools; All tools searches the original collection. The Text menu offers native operations with previews and recipes. Every item in All tools opens its existing complete interface in a same-origin docked frame, with standalone access retained. Input is sent only through the explicit input action. Choose an input/result field and inspect the selected-result preview, then insert the result at the cursor, replace the selection, or open a new document. Preview replacement reviews a result against the current scope before applying. Insertion/replacement is undoable. Reports and visual tools provide text exports: palette CSS variables, unit conversions, statistics, difference reports, recording links, clock SVG, icon code, font CSS and highlighted HTML/BBCode. Expand widens a specialist panel on desktop. Network-dependent tools retain their notices. On narrow screens panels stack below the editor.

## Recovery and privacy

Draft recovery is off initially. Opting in stores text, document names, settings and active tab in IndexedDB on this device/browser. It does not synchronize across devices. Recovered text starts fresh undo history. Browser cleanup can remove drafts; keep permanent downloaded copies. Erase saved drafts disables recovery and removes the stored session without changing open text. Versioned transactions reject writes from a window whose recovery copy is older than another window’s latest save. Download the competing window’s work before reloading it. Persistent draft status distinguishes pending, saving, saved and error states. Storage version 2 writes only changed document records and migrates version 1 snapshots when saving. Saving and recovery share a 30-million-character total limit. Skipped records are named; recovery saving pauses to protect the stored copy. Quota failures/interrupted transactions keep the previous copy.

Core editing and transformations require no account, server or paid API and do not upload text. Optional specialist services make requests described in their notices. Existing GitHub Pages hosting/domain remain in place.

## Implementation and validation

`EditorWorkspace.astro` defines the interface. `editor-workspace.ts` owns CodeMirror 6 states, document lifecycle and explicit specialist input/output exchange. `workspace-operations.ts` and `workspace-worker.ts` define cancellable transformations; `workspace-files.ts` handles decoding/export; `workspace-storage.ts` handles browser recovery. The shared Jupiter appearance control and semantic styling remain in use. CodeMirror and its dependencies are pinned and distributed with their license notices.

Release checks: `npm test`, `npm run build`, `npm run test:browser`, `npm run audit`. Browser tests cover all existing tool routes and the editor's files, selections, previews, undo, tabs, recovery, recipes, cancellation, formatting, sanitization, comparison, icon insertion, keyboard interaction, themes and responsive layout. Each of the 33 tools has an input/generation-to-result browser workflow check; external Archive/IP services use deterministic fixtures. Highlighting checks include detection, filename precedence and manual overrides. CI repeats checks on Linux before Pages publication. Browser validation uses Chromium; Firefox/Safari validation is not claimed.


## Interaction and automation

Tabs support arrow keys, Home, End and Delete; closing the active tab selects a neighbor. Menus support arrow navigation and Escape. Opening panels focuses their headings, completed previews focus their summaries, and closing panels returns focus to the editor. A startup failure exposes reload and tool-directory links; JavaScript-disabled navigation remains usable.

The workspace exposes `data-ready`, `data-status`, `data-operation-state`, `data-operation-step`, `data-operation-total`, `data-stats-state`, `data-comparison-state`, `data-highlighting` and `data-draft-state`. Operations also expose `aria-busy`, and document tabs expose `data-dirty` and `aria-selected`. State changes accompany visible, accessible feedback; automation can wait on these states rather than timing guesses.

See [improvement passes](improvement-passes.md) for acceptance checks and local performance measurements.
