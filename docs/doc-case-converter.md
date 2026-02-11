# Case Converter Tool: Full Technical Walkthrough

This document explains how the Case Converter page works end to end, including UI structure, runtime flow, conversion algorithms, shared dependencies, and integration with the wider site.

## Scope

The active implementation of the tool is in:

- `case-converter.html`

Shared code and integration points that directly affect behavior:

- `js/theme.js`
- `css/style.css`
- `index.html`
- `sitemap.xml`

## What the Tool Does

The tool reads text from an input textarea, converts it to one of nine casing styles, and writes the result to an output textarea in real time:

- `UPPERCASE`
- `lowercase`
- `Title Case`
- `Sentence case`
- `camelCase`
- `PascalCase`
- `snake_case`
- `kebab-case`
- `InVeRt CaSe`

## Page Composition (`case-converter.html`)

The page is standalone. It has:

- Global shell: header, logo, controls, footer
- Tool section: title, action buttons, options panel, input/output panes, status bar
- Inline script that contains all case-conversion logic and event binding

### Structural Elements and IDs

Main interactive nodes:

- `#accentColor`: accent color dropdown (driven by `js/theme.js`)
- `#themeToggle`: light/dark toggle button (driven by `js/theme.js`)
- `#backButton`: navigates back to `index.html`
- `#clearAll`: clears input/output
- `#copyOutput`: copies output text via Clipboard API
- `#caseType`: selects conversion mode
- `#inputText`: source textarea
- `#outputText`: readonly result textarea
- `#inputStats`: input chars/lines label
- `#outputStats`: output chars/lines label
- `#statusMessage`: short status text (`Ready`, `Success`, etc.)
- `#toolStats`: operation timing text

## Runtime Lifecycle

### 1. Browser Loads Assets

- Material Icons stylesheet is loaded from Google Fonts
- `css/style.css` is loaded for layout and theme tokens
- `js/theme.js` is loaded before the tool's inline script

### 2. `js/theme.js` Initializes Shared Theme Features

`js/theme.js` runs two immediately invoked function expressions:

- Theme/accent manager:
  - Reads `localStorage.theme` (default `dark`)
  - Reads `localStorage.accentColor` (default `#0d9488`)
  - Applies `data-theme` on `<html>`
  - Applies CSS variables `--accent` and `--accent-light`
  - Wires `#themeToggle` click and `#accentColor` change
- Seasonal snow manager:
  - Active only during holiday window (post-Thanksgiving through Jan 1)
  - Injects a `#snowToggle` button into `.controls`
  - Persists state in `localStorage.holiday_snow_enabled`
  - Renders animated snow on a fixed fullscreen canvas

Because Case Converter has the expected header structure (`.controls` plus theme controls), both shared behaviors attach automatically.

### 3. Inline Tool Script Binds Case Converter Logic

The inline script in `case-converter.html`:

- Caches DOM references by ID
- Declares helper functions
- Registers event listeners
- Calls `updateStats()` once for initial render

No framework is used. All state is managed directly in DOM values and labels.

## Internal State Model

There is no central state object. Effective state is stored in:

- Form controls:
  - `inputText.value`
  - `caseTypeSelect.value`
  - `outputText.value`
- UI labels:
  - `statusMessage.textContent` and class (`success` or `error`)
  - `toolStats.textContent`
  - stats labels (`inputStats`, `outputStats`)

Persisted cross-page state comes only from `js/theme.js`:

- `localStorage.theme`
- `localStorage.accentColor`
- `localStorage.holiday_snow_enabled` (seasonal only)

The Case Converter logic itself does not persist user text or selected case mode.

## Conversion Pipeline

Main function:

- `convertCase()`

Execution flow:

1. Read `inputText.value` and selected case from `#caseType`.
2. If input is empty:
   - clear output
   - call `updateStats()`
   - return
3. Start timer with `performance.now()`.
4. Dispatch to converter function via `switch(caseType)`.
5. Write result to output.
6. Set status to success and write processing time in milliseconds.
7. On exception:
   - write `Error: ...` to output
   - set error status
   - set `toolStats` to `Processing failed`
8. Call `updateStats()`.

## Converter Functions and Behavior Details

### `toUpperCase(text)`

- Uses `text.toUpperCase()`.
- Locale-insensitive default JavaScript case mapping.

### `toLowerCase(text)`

- Uses `text.toLowerCase()`.
- Locale-insensitive default JavaScript case mapping.

### `toTitleCase(text)`

- Uses regex: `text.replace(/\b\w/g, char => char.toUpperCase())`.
- Uppercases only characters at word boundaries.
- Does not lowercase remaining letters in each word.

Example:

- Input: `hELLo wORLD`
- Output: `HELLo WORLD`

### `toSentenceCase(text)`

- Uses: `text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()`.
- Only first character of full string is uppercased.
- Everything after first character is lowercased.
- Does not detect multiple sentences.

### `toCamelCase(text)`

Pipeline:

1. Regex transform: `/(?:^\w|[A-Z]|\b\w)/g`
   - first match lowercased
   - subsequent matches uppercased
2. Remove whitespace: `.replace(/\s+/g, '')`
3. Remove non-alphanumeric chars: `.replace(/[^a-zA-Z0-9]/g, '')`

Effects:

- Drops punctuation/symbols.
- Keeps digits.
- Can collapse separators aggressively.

### `toPascalCase(text)`

Pipeline:

1. Regex transform: `/(?:^\w|[A-Z]|\b\w)/g` -> uppercase all matches
2. Remove whitespace
3. Remove non-alphanumeric chars

Result starts with uppercase alphanumeric segment.

### `toSnakeCase(text)`

Pipeline:

1. Spaces to underscores: `.replace(/\s+/g, '_')`
2. Split lower->upper transitions: `.replace(/([a-z])([A-Z])/g, '$1_$2')`
3. Lowercase all
4. Remove disallowed chars: `.replace(/[^a-z0-9_]/g, '')`

Effects:

- Existing punctuation is removed (except underscore).
- Handles `camelCase` into `camel_case`.

### `toKebabCase(text)`

Same as snake-case logic but with hyphens:

1. Spaces to `-`
2. Split lower->upper transitions with `-`
3. Lowercase all
4. Remove disallowed chars: `.replace(/[^a-z0-9-]/g, '')`

### `invertCase(text)`

- Splits string into chars.
- For each char:
  - if `char === char.toUpperCase()`, use lowercase
  - else use uppercase
- Joins chars back.

Notes:

- Non-letters (digits, punctuation) usually remain unchanged because uppercase/lowercase forms are identical.

## Event Wiring and Interaction Model

### Real-time conversion on typing

- `input` event on `#inputText`:
  - `updateStats()`
  - `convertCase()`

This means conversion happens on every keystroke with no debounce.

### Re-convert on mode change

- `change` event on `#caseType` calls `convertCase()`.

### Copy output

- Click on `#copyOutput`:
  - No-op if output is empty
  - Uses `navigator.clipboard.writeText(outputText.value)`
  - On success:
    - status message: `Copied to clipboard!`
    - class: `success`
    - resets to `Ready` after 2 seconds
  - On failure:
    - status message: `Failed to copy`
    - class: `error`

### Clear fields

- Click on `#clearAll`:
  - clears both textareas
  - updates stats
  - status message `Cleared`
  - resets to `Ready` after 1.5 seconds

### Back navigation

- Click on `#backButton`:
  - `window.location.href = 'index.html'`

### Keyboard shortcut

- Document-level `keydown` listener:
  - if Ctrl/Cmd + Enter, prevent default and run `convertCase()`

## Status and Metrics Behavior

`#statusMessage` states used by script:

- `Ready`
- `Success`
- `Copied to clipboard!`
- `Failed to copy`
- `Cleared`
- `Error`

`#toolStats` content:

- default HTML text: `No operations yet`
- on successful conversion: `Processed in Xms`
- on conversion failure: `Processing failed`

Timing is measured only around conversion logic (`switch` and function call), not full event dispatch or rendering.

## Styling and Layout (`css/style.css`)

Case Converter relies on global utility/layout classes:

- Theme variables via `:root` and `[data-theme="light"]`
- Header and control styling (`header`, `.controls`, `.accent-selector`)
- Tool layout (`.tool-header`, `.tool-actions`, `.options-panel`, `.io-container`)
- Input/output styles (`textarea`, `.output`, `.stats`)
- Status styles (`.success`, `.warning`, `.error`)
- Responsive behavior:
  - `.io-container` collapses to single column at `max-width: 768px`
  - `.tool-header` stacks vertically on small screens

## How the Tool Interoperates with the Rest of the Site

### Dashboard entry (`index.html`)

- Tool metadata array includes:
  - `id: 'case-converter'`
  - name/icon/category/description
- Card links use pattern `${tool.id}.html`, which resolves to `case-converter.html`.

So the tool is discovered and opened through the homepage grid.

### Search engine/site indexing (`sitemap.xml`)

- Includes URL:
  - `https://text-utils.net/case-converter.html`

### Shared header behavior (`js/theme.js`)

- Theme and accent controls are common across tools.
- Seasonal snow toggle is injected into Case Converter header controls during holiday season.

## Important Edge Cases and Current Limitations

- Empty text line counts:
  - `updateStats()` uses `split('\n').length`, so empty string counts as 1 line.
- Title case is not strict title normalization:
  - it uppercases boundary letters but does not lowercase the rest.
- Sentence case only treats the whole text as one sentence.
- No locale-aware case transform options (for special language rules).
- No debounce/throttling for very large pasted input.
- Clear action does not reset `toolStats` to default text.
- Copy uses Clipboard API, which can fail in restricted contexts (permissions, insecure origin).

## Change-Safe Extension Points

When adding new conversion modes:

1. Add an `<option>` in `#caseType`.
2. Add function implementation in the inline script.
3. Add a `switch` case in `convertCase()`.
4. Verify:
   - typing conversion
   - dropdown conversion
   - Ctrl/Cmd + Enter conversion
   - stats/status behavior

If logic grows further, moving inline script into a dedicated JS module would improve maintainability, but current implementation is self-contained and easy to trace.

## Quick Behavioral Test Checklist

- Type text, ensure output updates per keystroke.
- Change conversion mode with existing input, ensure output re-renders.
- Click Copy with non-empty output, verify clipboard and status message transitions.
- Click Clear, verify both panes clear and status resets.
- Use Ctrl/Cmd + Enter with input focused and unfocused.
- Toggle theme and accent, refresh page, verify persistence.
- (Holiday window only) verify snow toggle appears and persists state.
