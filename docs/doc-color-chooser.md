# Color Chooser Tool: Full Technical Walkthrough

This document explains how `color-chooser.html` works end to end, with a focus on implementation details and runtime behavior.

## Scope

Primary implementation:

- `color-chooser.html`

Shared dependencies and integration points:

- `js/theme.js`
- `css/style.css`
- `index.html`
- `sitemap.xml`

## What the Tool Does

Color Chooser lets users:

- pick from named CSS-style colors grouped by category
- enter custom colors via browser color input, manual code input, or Eyedropper API
- find closest named color for a custom value
- generate language-specific color snippets
- preview and export a PNG swatch with readable foreground text

## Page Composition (`color-chooser.html`)

The page has:

- shared site shell (header, network links, theme/accent controls, footer)
- tool layout container and actions (`Back`, `Copy`, `Save PNG`)
- left panel for selection/search/export controls
- right panel for snippet output and status
- inline script (single IIFE) containing all Color Chooser logic

### Key Interactive Elements

Shared header controls:

- `#themeToggle`
- `#accentColor`

Tool controls:

- `#colorCategory`
- `#colorName`
- `#languageSelect`
- `#customColorInput`
- `#eyedropperBtn`
- `#colorDisplay`
- `#colorInput`
- `#applySearchBtn`
- `#getCurrentColorBtn`
- `#pngWidth`
- `#pngHeight`
- `#pngFilename`
- `#copyBtn`
- `#savePngBtn`
- `#backButton`

Output/status:

- `#colorOutput`
- `#colorSearchResult`
- `#pngPreview`
- `#statusMessage`
- `#toolStats`

## Runtime Lifecycle

### 1. Assets load

- Material Icons stylesheet from Google Fonts
- global stylesheet `css/style.css`
- shared script `js/theme.js`
- inline Color Chooser script

### 2. Shared behavior initializes (`js/theme.js`)

Theme/accent module:

- reads and applies `localStorage.theme`
- reads and applies `localStorage.accentColor`
- populates accent dropdown values
- toggles `data-theme` and CSS variables (`--accent`, `--accent-light`)

Holiday snow module:

- active only from Thanksgiving window through January 1
- injects a `#snowToggle` button into `.controls`
- persists snow setting in `localStorage.holiday_snow_enabled`
- draws animated snowfall on a fullscreen canvas

### 3. Color Chooser initializes

The inline script runs inside an IIFE and calls `init()` on DOM-ready:

1. cache DOM references (`cacheDom`)
2. populate category and language dropdowns
3. default category to `All Colors`
4. populate color names for selected category
5. wire event listeners (`hookEvents`)
6. apply initial color (`#FFFFFF`) via `updateColor`
7. render PNG preview and set `Ready` status

## Internal Data Model

### `namedColors`

- object map: `name -> #RRGGBB`
- includes common CSS named colors and some synonyms (`Gray/Grey`, etc.)
- keys are canonical names used for dropdown labels and matching

### Category model

- `buildCategory(names)` creates subset maps from `namedColors`
- `colors` defines category buckets:
  - `All Colors`
  - `Reds & Pinks`
  - `Oranges & Browns`
  - `Yellows & Golds`
  - `Greens`
  - `Cyans & Aquas`
  - `Blues`
  - `Purples`
  - `Whites & Pastels`
  - `Grays & Blacks`

### Reverse mapping

- `nameToCategory` maps each color name to first matching non-`All Colors` bucket
- used by exact-match synchronization when selecting/searching custom color values

### Language map

- `languages` maps internal code keys (`css`, `python`, `c++`, etc.) to display labels
- dropdown is alphabetically sorted by label
- default selected language is `css`

### Mutable runtime state

- `currentColor` stores selected color string (initial `#FFFFFF`)
- `dom` stores element references

No central state library is used; state is DOM-driven plus `currentColor`.

## Core Algorithms and Functions

### Color parsing and conversion

`hexToRgb(hex)`:

- accepts `#RGB` and `#RRGGBB`
- expands short hex before parsing
- returns `{r, g, b}` or `null`

`rgbToHex(r, g, b)`:

- rounds channels and converts to uppercase `#RRGGBB`

`parseColorInput(input)` accepts:

- hex with optional `#` (`RGB` or `RRGGBB`)
- comma RGB forms like `255,0,0`
- optional loose wrapper like `rgb(255,0,0)` / `rgba(255,0,0)` but alpha is ignored

Rejected values return `null`.

### Nearest color matching

`findClosestColor(targetHex)`:

- converts target to RGB
- iterates all `namedColors`
- computes Euclidean distance in RGB space:
  - `sqrt((dr^2) + (dg^2) + (db^2))`
- returns nearest `{name, hex, category}`

Complexity is linear in number of named colors (`O(n)`), which is small enough for immediate UI response.

### UI update pipeline

`updateColor(hex, source)`:

1. parse and validate color
2. set `currentColor`
3. update swatch and color input control
4. if source is not `nameSelect`, try to sync category/name dropdowns for exact named match
5. regenerate snippet
6. refresh PNG preview
7. set success status

### Snippet generation

`generateSnippet()`:

- reads current language + `currentColor`
- derives RGB values
- selects template from `formats` map
- writes snippet to `#colorOutput`
- writes summary to `#toolStats`

Supported templates include CSS, JS/TS, Python, C/C++, C#, Java, Go, Rust, SQL, JSON, Shell, PowerShell, and others.

### Search workflow

`applySearch()`:

1. parse value from `#colorInput`
2. on invalid input, show inline error block
3. apply parsed color with `updateColor`
4. compute closest named color
5. render result message showing selected and closest/exact match

### PNG preview and export

`getContrast(r, g, b)`:

- computes brightness using weighted channels
- returns black text for light backgrounds, white text for dark backgrounds

`updatePngPreview()`:

- clamps width/height to `[10, 2000]`
- creates a preview canvas scaled to fit roughly `80-260px`
- fills with current color
- overlays hex text when preview is large enough

`savePng()`:

- creates full-size canvas (not scaled preview)
- fills with `currentColor`
- overlays readable hex text
- sanitizes filename to word chars/hyphen/underscore
- triggers download using data URL

## Event Wiring

The script binds:

- category `change` -> repopulate names
- named color `change` -> `updateColor`
- language `change` -> regenerate snippet
- custom color input `input` -> `updateColor`
- Eyedropper click -> browser `EyeDropper` API (if available)
- Apply click -> `applySearch`
- Use Current click -> copy `currentColor` into search input only
- Copy click -> clipboard write of snippet output
- Save PNG click -> `savePng`
- PNG width/height `input` -> live preview refresh
- Back click -> navigate to `index.html`

## Status and UX Messaging

Status text is written through `setStatus(message, type)` by changing:

- `#statusMessage.textContent`
- `#statusMessage.className`

Used status types include:

- `success`
- `warning`
- `error`
- `info`

`css/style.css` defines colors for `success`, `warning`, and `error`. There is no dedicated `.info` class in current shared CSS.

`#toolStats` reports snippet context (for example, `CSS snippet for #FFFFFF`).

## Site Integration

`index.html`:

- includes metadata entry:
  - `id: 'color-chooser'`
  - card route resolves to `color-chooser.html`

`sitemap.xml`:

- includes `https://text-utils.net/color-chooser.html`

## Current Limitations and Edge Cases

- nearest-color logic is RGB-distance based, not perceptual (Lab/DeltaE)
- search result HTML uses utility classes (`alert`, `mx-2`) that are not defined in `css/style.css`
- color input accepts 3-digit hex values, but browser `<input type="color">` UI is naturally 6-digit-focused
- `rgba(...)` parsing path ignores alpha channel entirely
- `Use Current` only fills search input; it does not auto-run Apply
- clipboard and Eyedropper APIs depend on browser support and secure context
- no persistence for selected tool color/language between page loads

## Extension Points

1. Add or remove named colors by editing `namedColors`.
2. Adjust category groupings in the `colors` object.
3. Add snippet targets by extending `languages` and `formats`.
4. Replace RGB nearest matching with perceptual color-space matching.
5. Add persistent user preferences (color, language, PNG dimensions) via localStorage.

## Quick Verification Checklist

- choose category and named color, confirm swatch/snippet update
- type custom hex and RGB input, confirm parsing and output
- run search with non-exact color, confirm closest match rendering
- switch snippet language and verify template change
- export PNG with custom dimensions and filename
- test theme/accent toggles and seasonal snow button behavior
- test in browser without Eyedropper support and confirm graceful warning
