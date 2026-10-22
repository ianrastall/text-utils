# Workspace improvement passes

22 October 2026. Priorities: usability and computer-friendliness, stability/security, and useful editing workflows comparable to or beyond a desktop editor.

## 1. Preserve work

JSON formatting, minification and recursive key sorting share a token-preserving implementation. Numbers, escaped strings and duplicate keys retain their original spelling. Other JSON conversions reject numeric tokens that would change under JavaScript serialization; CSV numeric cells that cannot round-trip exactly remain strings.

Save file uses the browser file picker where supported and clears the modified marker only after the writable stream closes successfully. Download copy and the fallback download keep the marker. Line-ending changes count as modifications.

Draft storage version 2 stores one record per document and updates changed records atomically with session metadata. Version 1 recovery copies remain readable. Saving and recovery enforce 30 documents, 10 million characters per document, 30 million total. Recovery names skipped records and pauses saving so it cannot overwrite a partially recovered session. A failed transaction preserves the previous recovery copy. Startup failures expose reload and tool-directory links.

Validation: 25 unit tests; build/type check; focused browser checks for numeric preservation, cancelled/failed/successful saves, fallback download warnings, incremental drafts, legacy recovery, interrupted transactions and startup failure. Existing workspace checks also run during this pass.

## 2. Predictable interaction

Closing the active document selects the adjacent tab. Document tabs support arrows, Home, End and Delete; editor menus support arrow navigation and Escape. Opening a panel focuses its heading, closing it returns to the editor, and a completed preview focuses its summary. Regex flags explain the distinction between first-match and global replacement.

Editing text or operation settings terminates pending work and invalidates the old result. The workspace exposes `data-operation-state` (idle/running/ready/stale/cancelled/error/applied), `data-status`, and `aria-busy` on the operations panel. Previews are named regions. These states are observable without inspecting visual styling or parsing a changing status sentence.

Validation: build/type check and 29 browser checks covering the new interactions and existing workspace behavior.

## 3. Substantial documents

Ordinary edits update a modified flag; explicit undo/redo checks the saved CodeMirror text tree. Unchanged tabs keep their DOM nodes. Highlighting extensions are retained across tab switches and reconfigured only when necessary. Automatic detection runs for plain text, pasted/replaced contents, open/rename and explicit mode changes, rather than reloading a known language for every keystroke.

Word counts run in a reusable worker after a typing pause/idle callback; selection and character/line counts use CodeMirror metadata. Document comparison also runs in a cancellable worker, with source-revision caching. Markdown previews avoid rerendering unchanged sources. Direct typing and paste obey the same 10-million-character limit as operation results.

Syntax highlighting pauses above one million characters and resumes below that limit. A visible notice explains this; the detected/manual language remains available for formatting.

Local Chromium benchmark: a 4,320,000-character JavaScript file, 20 appended keystrokes spaced by 100 ms, three runs. Before this pass, summed main-thread long-task duration was 2,728/2,975/2,957 ms; after, 0/0/0 ms. Total workload duration fell from approximately 5.0 to 3.1 seconds. Long tasks are tasks exceeding 50 ms; these are local observations, not cross-browser performance guarantees. No browser regression suite ran concurrently with the reported measurements.

Validation includes large-file editing, worker reuse, stable tabs, undo to a saved baseline, oversized paste rejection, detection/formatting compatibility, and existing tool/workspace workflows.

