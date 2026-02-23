# JSON Tool (Current Architecture)

This document describes the current JSON Tool implementation used by `json-tool.html`.

## Scope

Primary files:

- `json-tool.html` (page markup + tool UI shell)
- `js/json-tool-page.js` (main UI/controller logic)
- `js/json-worker.js` (background parsing/formatting/validation/query processing)

Related shared files:

- `css/style.css`
- `js/theme.js`

## What the Tool Does

The JSON Tool is a browser-side utility with four modes:

- `format`: format JSON with indentation and optional key sorting
- `jsonl`: convert JSON to JSONL (supports JMESPath pre-query)
- `jsonlToJson`: convert JSONL back to a JSON array
- `validate`: validate JSON syntax and optionally validate against a JSON Schema (Ajv)

All processing happens in the browser. The main page delegates heavy work to `js/json-worker.js` using a Web Worker.

## Runtime Architecture

### Page (`json-tool.html`)

The page provides:

- tool header/actions (`Back`, `Example`, `Copy`, `Clear`, `Process`)
- tabbed mode selector
- info panel and error panel
- stats panel (objects/arrays/keys/max depth)
- options panel (indentation + sort keys)
- optional JMESPath query input
- optional schema editor panel
- file drag/drop + file picker
- Ace editor hosts for input/output/schema
- status/timing footer

The page loads external libraries from CDN (Ace, JSONLint, Ajv, JMESPath) and shared theme behavior from `js/theme.js`.

### Main Controller (`js/json-tool-page.js`)

Responsibilities:

- initialize and configure Ace editors
- keep UI state (`currentMode`, processing state, stats scheduling, file load state)
- manage mode switching and tab accessibility state
- coordinate file loading (including streamed reads for larger files)
- send `process` and `analyzeInput` jobs to the worker
- render results, errors, status, and timing

Important UI behaviors:

- Output editor is cleared on mode changes to avoid stale cross-mode content.
- `loadExample()` resets the JMESPath query before loading sample input.
- Input and output char/line stats are updated independently from editor content or provided strings.
- The file drop zone is a non-interactive container; the nested `Choose File` button is the keyboard-focusable control.

### Worker (`js/json-worker.js`)

Responsibilities:

- parse JSON / JSONL
- format JSON
- convert JSON <-> JSONL
- apply JMESPath queries
- validate against JSON Schema (Ajv)
- compute structural stats (objects/arrays/keys/maxDepth)
- produce normalized error payloads for the page

The worker returns structured responses consumed by `runWorkerJob(...)`, including success payloads and error payloads with optional stats/validation reports.

## Worker Communication Flow

`js/json-tool-page.js` uses:

- `ensureWorker()` to lazily create the worker
- `runWorkerJob(action, payload)` to post jobs with an incrementing `jobId`
- `pendingWorkerJobs` map to resolve/reject promises when responses arrive

Error path behavior:

- worker `error` events reject all pending jobs with a normalized "Worker Error" payload
- the shared worker reference is cleared before termination is attempted
- a new worker is created lazily on the next job if needed

## File Loading and Large Inputs

The tool supports:

- direct text input in Ace
- drag-and-drop files
- file picker selection

For sufficiently large files (or larger JSONL/JSONL->JSON inputs), `readFileAsTextStream(...)` reads via `file.stream()` and updates progress text periodically (throttled to reduce UI churn).

Large pasted input and large loaded files surface a status hint that parsing/formatting runs in a background worker.

## Mode-Specific Notes

- `format`: optional JMESPath query can transform the input before formatting.
- `jsonl`: if a JMESPath query returns a non-array value, output is a single JSONL line and the success message explains this.
- `jsonlToJson`: parses line-delimited JSON and returns a JSON array.
- `validate`: can validate syntax only or syntax + schema (Ajv). Schema text is sent to the worker only in validate mode.

## Error Handling

The page and worker cooperate to surface errors with useful detail:

- syntax errors
- JMESPath query errors
- schema syntax/validation errors
- file load errors
- worker failures

The page renders normalized error details in `#errorPanel` and clears stale output/stats when appropriate.

## Performance and Safety Guards

- background worker for heavy processing
- debounced async input analysis
- throttled file-stream progress updates
- recursion depth limit in the worker (defensive protection against deeply nested inputs)
- superseded file load cancellation checks via `activeFileLoadId`

## Extension Points

To add a new mode:

1. Add mode metadata in `js/json-tool-page.js` (`modeInfo`)
2. Add a tab in `json-tool.html`
3. Update worker processing dispatch in `js/json-worker.js`
4. Update any mode-specific UI toggles/panels in `updateModeUI()`
5. Add/adjust examples and tests/manual verification steps

## Quick Verification Checklist

- Mode switch clears stale output and updates labels/panels
- Example load resets query and loads mode-appropriate sample data
- JSON -> JSONL and JSONL -> JSON conversions both work
- Validate mode works with and without schema
- Worker failure shows a visible error and later jobs recover
- File drag/drop and `Choose File` both load content
- Stats, status messages, and timing update correctly
