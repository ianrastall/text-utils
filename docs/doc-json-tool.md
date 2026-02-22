# JSON Tool: Full Technical Walkthrough

This document explains how `json-tool.html` works internally, including rendering structure, state flow, processing algorithms, error handling, and integration with shared site modules.

## Scope

Primary implementation:

- `json-tool.html`

Shared dependencies and integration points:

- `css/style.css`
- `js/theme.js`
- `index.html`
- `sitemap.xml`

## What the Tool Does

JSON Tool is a browser-side utility with three modes:

- **Format JSON**: parse + pretty-print JSON with indentation and optional recursive key sorting
- **JSON to JSONL**: parse JSON arrays and emit one compact JSON object per line
- **Validate Only**: parse JSON and return a validation summary with structure statistics

The tool never sends user data to a backend; all processing is done in-page with native JavaScript (`JSON.parse`, `JSON.stringify`).

## Page Composition (`json-tool.html`)

The page includes:

- Shared site shell (logo, network links, accent selector, theme toggle, footer)
- Tool header actions (`Back`, `Example`, `Copy`, `Clear`, `Process`)
- Mode tab strip (`format`, `jsonl`, `validate`)
- Context info panel (`#infoTitle`, `#infoText`)
- Error panel (`#errorPanel`, `#errorMessage`)
- Statistics panel (`#statsPanel`) with object/array/key/depth counters
- Format-only options panel (`#optionsPanel`) for indentation and key sorting
- Input/output textareas and status bar
- Inline script for all tool logic

## Runtime Lifecycle

### 1. Early theme bootstrap

Before stylesheet rendering, an inline `<script>` in `<head>`:

- resolves theme (`light`/`dark`) from `localStorage.theme` or `prefers-color-scheme`
- resolves accent from `localStorage.accentColor`
- normalizes short hex accents (`#abc` -> `#aabbcc`)
- writes `data-theme` and accent CSS vars to avoid flash of wrong theme

### 2. Shared module initialization

`js/theme.js` loads after the page body and handles:

- theme toggle button behavior
- accent dropdown options and persistence
- seasonal snow toggle/canvas behavior in holiday window

### 3. JSON Tool script setup

The inline JSON Tool script:

1. Caches DOM handles for all controls and outputs.
2. Sets mutable runtime state with `currentMode = 'format'`.
3. Defines mode metadata (`modeInfo`) and sample payload (`exampleJSON`).
4. Registers event listeners for tabs, actions, typing, and keyboard shortcuts.
5. Calls `updateStats()` and `updateModeUI()` for initial render.

## State Model

The tool is lightweight and DOM-driven:

- **State variable**: `currentMode`
- **Input state**: `inputText.value`
- **Output state**: `outputText.value`
- **Mode presentation**: tab active classes + `modeInfo` driven labels/text
- **Status state**: `#statusMessage` text + class (`success`, `warning`, `error`)
- **Timing state**: `#processingTime` text
- **Stats state**: `#statsPanel` values + display mode

No central store, framework, or persistence layer is used for tool data.

## Mode Switching Internals

Each `.mode-tab` sets `currentMode = tab.dataset.mode` and triggers `updateModeUI()`.

`updateModeUI()`:

- updates info panel title/body from `modeInfo[currentMode]`
- updates output label text
- shows format options only when mode is `format`
- swaps process button icon/text (`play_arrow`/`check_circle`, `Process`/`Validate`)

## Core Processing Algorithms

### 1. Recursive structure analysis (`analyzeJSON`)

`analyzeJSON(obj, depth = 0, stats = null)` traverses parsed JSON recursively and tracks:

- object count
- array count
- total key count
- maximum nesting depth

Implementation details:

- arrays increment `stats.arrays` and recurse over each element
- objects increment `stats.objects`, add `Object.keys(obj).length`, and recurse over values
- primitives only update depth

This function is reused by all three modes.

### 2. Recursive key sorting (`sortObjectKeys`)

When `Sort object keys alphabetically` is enabled in Format mode:

- arrays preserve order while each item is recursively sorted
- objects are rebuilt from sorted key lists
- primitives pass through unchanged

This guarantees deterministic key ordering across nested structures.

### 3. Format mode (`formatJSON`)

Flow:

1. Parse with `JSON.parse(input)`.
2. Optionally apply recursive sort.
3. Resolve indentation:
   - `tab` -> `'\t'`
   - `0` -> minified output
   - numeric string -> `parseInt(...)`
4. Analyze JSON and update stats panel.
5. Return `JSON.stringify(obj, null, indent)`.

### 4. JSONL mode (`convertToJSONL`)

Flow:

1. Parse input JSON.
2. Enforce array input; throw if input is not an array.
3. Reject empty arrays with explicit error.
4. Analyze parsed array and display stats.
5. Return `parsed.map(item => JSON.stringify(item)).join('\n')`.

Output is newline-delimited compact JSON objects, suitable for line-oriented ingestion.

### 5. Validate mode (`validateJSON`)

Flow:

1. Parse input.
2. Analyze structure.
3. Infer top-level type (`Array`, `Object`, or primitive type).
4. Return a plain-text validation summary.

This mode confirms parse validity without reformatting into canonical JSON output.

## Processing Pipeline (`processJSON`)

`processJSON()` is the orchestration function for the `Process` button and Ctrl/Cmd+Enter.

Execution path:

1. Trim input; if empty, show warning and stop.
2. Hide stale error panel.
3. Start timer (`performance.now()`).
4. Dispatch by mode:
   - `format` -> `formatJSON`
   - `jsonl` -> `convertToJSONL`
   - `validate` -> `validateJSON`
5. Write output text.
6. Show success status.
7. Show elapsed time in milliseconds.
8. Refresh char/line stats.

Failure path:

- catches thrown errors
- logs to console
- shows formatted error panel (`showError`)
- clears output
- updates status and timing to failure state

## Error Handling Details

`showError(error)` enhances parse errors by extracting `"position N"` from the native JSON parser message:

- maps character offset to line/column using substring split by `\n`
- appends `Location: Line X, Column Y` to the user-facing message
- shows `#errorPanel`
- hides stats panel to avoid stale metrics

`hideError()` removes the error panel when a new run starts.

## Auxiliary Actions

- `loadExample()` loads a representative nested example payload.
- `clearAll()` resets input/output, hides error + stats, and restores status.
- `copyToClipboard()` copies output if non-empty and reports success/failure.
- `updateStats()` updates input/output char and line counters continuously.

## Event Wiring

Bound listeners:

- mode tab `click` -> update mode + UI
- process button `click` -> `processJSON()`
- copy button `click` -> `copyToClipboard()`
- clear button `click` -> `clearAll()`
- example button `click` -> `loadExample()`
- back button `click` -> navigate to `index.html`
- input textarea `input` -> `updateStats()`
- input textarea `keydown` with Ctrl/Cmd+Enter -> `processJSON()`

## Site Integration

### `index.html`

Tool registry includes:

- `id: 'json-tool'`
- card metadata for icon/category/description

Card navigation resolves to `json-tool.html`.

### `sitemap.xml`

Includes `https://text-utils.net/json-tool.html`.

### Shared styling

The tool uses global tokens/components from `css/style.css` and page-local CSS for:

- mode tabs
- info/error panel styling
- JSON stats grid

## Edge Cases and Current Limitations

- JSONL mode only accepts top-level arrays.
- Empty arrays are intentionally rejected in JSONL conversion.
- Empty input shows a warning and clears stale output/error/stats.
- Inputs larger than 5MB are rejected before parsing to avoid freezing the page.
- Very deeply nested JSON is rejected with explicit depth-limit errors during analysis/sorting.
- Clipboard API requires compatible browser permissions/context.
- Parser and serializer are native JSON only (no comments, trailing commas, JSON5 features).

## Extension Points

1. Add new modes by extending `modeInfo`, tabs, and `processJSON()` dispatch.
2. Add reverse conversion (`JSONL -> JSON array`) as a fourth mode.
3. Add schema validation (`ajv`-style) if external dependency policy changes.
4. Add syntax-highlighted output panel for readability on very large objects.
5. Add chunked processing for very large arrays if performance becomes an issue.

## Quick Verification Checklist

- Format mode: all indentation options and key sorting
- JSONL mode: valid arrays, non-array error, empty-array error
- Validate mode: valid summary + invalid syntax diagnostics
- Error position mapping: line/column shown for malformed input
- Stats panel visibility and values across mode changes
- Copy/Clear/Example actions
- Ctrl/Cmd+Enter shortcut
- Theme/accent persistence and responsiveness on mobile widths
