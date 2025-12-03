# Text Utils - Style Guide

## ?? Design System Reference

This guide ensures all tools maintain visual consistency and use the new theme correctly.

## Color Palette

### CSS Variables

Always use CSS variables instead of hardcoded colors:

```css
/* Background Colors */
var(--bg-primary)      /* #121212 (dark) / #ffffff (light) - Main background */
var(--bg-secondary)    /* #1e1e1e (dark) / #f8fafc (light) - Cards, containers */
var(--bg-tertiary)     /* #252525 (dark) / #f1f5f9 (light) - Input fields */

/* Text Colors */
var(--text-primary)    /* #e0e0e0 (dark) / #1e293b (light) - Main text */
var(--text-secondary)  /* #a0a0a0 (dark) / #64748b (light) - Labels, hints */

/* UI Colors */
var(--border-color)    /* #333 (dark) / #e2e8f0 (light) - Borders */
var(--accent)          /* User-selected accent color */
var(--accent-light)    /* Lighter version of accent */

/* Status Colors */
var(--success)         /* #059669 - Success messages */
var(--warning)         /* #d97706 - Warning messages */
var(--error)           /* #dc2626 - Error messages */
```

### ? Don't Do This:
```css
background: #1e1e1e;  /* Hardcoded color */
color: #e0e0e0;       /* Won't adapt to theme changes */
```

### ? Do This:
```css
background: var(--bg-secondary);
color: var(--text-primary);
```

## Typography

### Font Families
```css
/* Body Text */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Code/Monospace */
font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
```

### Font Sizes
```css
/* Headers */
h1: 1.5rem (24px)
h2: 1.25rem (20px)
h3: 1rem (16px)
h4: 0.875rem (14px)

/* Body */
body: 1rem (16px)
small: 0.875rem (14px)
label: 0.875rem (14px)

/* Stats */
.stats: 0.75rem (12px)
```

### Font Weights
- Normal: 400
- Medium: 500
- Semibold: 600

## Components

### Buttons

```html
<!-- Primary Action -->
<button class="btn btn-primary">
    <span class="material-icons">play_arrow</span>
    Run
</button>

<!-- Secondary Action -->
<button class="btn btn-secondary">
    <span class="material-icons">content_copy</span>
    Copy
</button>
```

**Sizes:**
- Padding: `0.5rem 1rem`
- Font size: `0.875rem`
- Border radius: `4px`
- Gap (icon + text): `0.5rem`

**States:**
- Hover: `transform: translateY(-1px)` + shadow
- Active: Normal state
- Disabled: Add `opacity: 0.5` and `cursor: not-allowed`

### Text Areas

```html
<textarea id="inputText" placeholder="Paste your text here..."></textarea>
```

**Styling:**
- Min-height: `300px`
- Padding: `1rem`
- Background: `var(--bg-tertiary)`
- Border: `1px solid var(--border-color)`
- Border radius: `4px`
- Font: Monospace
- Font size: `0.875rem`
- Line height: `1.4`
- Resize: `vertical`

**Focus State:**
- Border color: `var(--accent)`
- No outline

### Select Dropdowns

```html
<select id="optionId">
    <option value="val1">Option 1</option>
    <option value="val2">Option 2</option>
</select>
```

**Styling:**
- Padding: `0.25rem 0.5rem`
- Background: `var(--bg-secondary)`
- Border: `1px solid var(--border-color)`
- Border radius: `4px`
- Color: `var(--text-primary)`

### Checkboxes & Radio Buttons

```html
<input type="checkbox" id="option">
<label for="option">Option Label</label>
```

**Styling:**
- Width: `auto`
- Cursor: `pointer`
- Uses native browser styling
- Inherits accent color

### Option Groups

```html
<div class="option-group">
    <label for="optionId">Option Label</label>
    <select id="optionId">...</select>
</div>
```

**Layout:**
- Display: `flex`
- Direction: `column`
- Gap: `0.5rem`

**Label Styling:**
- Font size: `0.875rem`
- Color: `var(--text-secondary)`

### Options Grid

```html
<div class="options-grid">
    <div class="option-group">...</div>
    <div class="option-group">...</div>
</div>
```

**Layout:**
- Display: `grid`
- Columns: `repeat(auto-fill, minmax(200px, 1fr))`
- Gap: `1rem`

## Layout

### Container
- Max width: `1400px`
- Margin: `0 auto`
- Padding: `1rem`

### Main Grid
- Desktop: `250px 1fr` (sidebar + content)
- Mobile: `1fr` (stacked)
- Gap: `2rem`

### Sidebar
- Background: `var(--bg-secondary)`
- Border radius: `8px`
- Padding: `1rem`
- Position: `sticky`
- Top: `1rem`

### Tool Container
- Background: `var(--bg-secondary)`
- Border radius: `8px`
- Padding: `1.5rem`

## Icons

### Material Icons
```html
<span class="material-icons">icon_name</span>
```

**Common Icons:**
- `text_format` - Text tools
- `code` - Code/data tools
- `swap_horiz` - Converters
- `auto_awesome` - Generators
- `play_arrow` - Run/execute
- `content_copy` - Copy
- `delete` - Clear
- `arrow_back` - Back
- `dark_mode` / `light_mode` - Theme toggle
- `palette` - Color picker

**Sizing:**
- Default: 24px
- In buttons: Inherits button font size
- In headers: 1.25rem

## Spacing

### Standard Scale
```css
0.125rem = 2px   (xs)
0.25rem  = 4px   (sm)
0.5rem   = 8px   (md)
0.75rem  = 12px  (lg)
1rem     = 16px  (xl)
1.5rem   = 24px  (2xl)
2rem     = 32px  (3xl)
```

### Margins
- Between sections: `1.5rem` to `2rem`
- Between elements: `0.5rem` to `1rem`
- In cards: `1rem` to `1.5rem`

### Padding
- Buttons: `0.5rem 1rem`
- Inputs: `0.5rem` to `1rem`
- Containers: `1.5rem`

## Borders

### Border Radius
- Small (inputs): `4px`
- Medium (cards): `8px`
- Large (tool icons): `8px`

### Border Width
- Default: `1px`
- Focus: `1px` (change color only)

## Transitions

### Standard
```css
transition: all 0.2s;
```

### Hover Effects
```css
/* Buttons */
transform: translateY(-1px);
box-shadow: 0 2px 4px rgba(0,0,0,0.2);

/* Cards */
border-color: var(--accent);
transform: translateY(-2px);
```

## Status Messages

```html
<div id="statusMessage" class="success">Ready</div>
<div id="statusMessage" class="warning">Warning message</div>
<div id="statusMessage" class="error">Error message</div>
```

**Colors:**
- Success: `var(--success)` (#059669)
- Warning: `var(--warning)` (#d97706)
- Error: `var(--error)` (#dc2626)

## Responsive Breakpoints

```css
/* Desktop First */
@media (max-width: 768px) {
    /* Tablet and mobile styles */
    .main-grid {
        grid-template-columns: 1fr;
    }
    
    .io-container {
        grid-template-columns: 1fr;
    }
}
```

### Mobile Adjustments
- Stack sidebar above content
- Stack input/output vertically
- Reduce padding/margins
- Make buttons full-width if needed

## Code Style

### HTML
- Use semantic HTML5 elements
- IDs for JavaScript targets
- Classes for styling
- Proper nesting and indentation
- Close all tags

### CSS
- Use CSS variables
- Mobile-first when appropriate
- Consistent naming (kebab-case)
- Group related properties
- Comment sections

### JavaScript
- Use ES6+ features
- `const` for non-reassigned variables
- `let` for variables that change
- Arrow functions for callbacks
- Descriptive function names
- Comment complex logic

## Accessibility

### Labels
```html
<label for="inputId">Label Text</label>
<input id="inputId" type="text">
```

### ARIA (when needed)
```html
<button aria-label="Copy to clipboard">
    <span class="material-icons">content_copy</span>
</button>
```

### Focus States
- Always visible
- Use `outline` or border color change
- Never `outline: none` without alternative

### Keyboard Navigation
- Tab order should be logical
- Enter key submits forms
- Escape key closes modals
- Arrow keys for selections

## Performance

### Optimization Tips
- Minimize DOM manipulation
- Use `requestAnimationFrame` for animations
- Debounce rapid input changes if needed
- Cache DOM queries in variables
- Use event delegation when appropriate

### Timing Display
```javascript
const startTime = performance.now();
// ... processing ...
const endTime = performance.now();
toolStats.textContent = `Processed in ${Math.round(endTime - startTime)}ms`;
```

## Naming Conventions

### IDs (camelCase)
- `inputText`
- `outputText`
- `statusMessage`
- `toolOptions`
- `caseType`

### Classes (kebab-case)
- `btn-primary`
- `option-group`
- `tool-card`
- `io-panel`

### Files (kebab-case)
- `case-converter.html`
- `json-formatter.html`
- `style.css`
- `theme.js`

## Don'ts (Common Mistakes)

### ? Bootstrap Classes
```html
<!-- OLD - Don't use -->
<div class="container-fluid bg-dark">
    <button class="btn btn-dark">Click</button>
    <input class="form-control">
</div>
```

### ? Inline Styles
```html
<!-- Bad -->
<div style="background: #1e1e1e; color: white;">
```

### ? Hardcoded Colors
```css
/* Bad */
.my-element {
    background: #1e1e1e;
    color: #e0e0e0;
}
```

### ? jQuery
```javascript
// Bad
$('#inputText').val();
```

## Do's (Best Practices)

### ? Use Template
```bash
cp tool-template.html new-tool.html
```

### ? CSS Variables
```css
.my-element {
    background: var(--bg-secondary);
    color: var(--text-primary);
}
```

### ? Vanilla JS
```javascript
const inputText = document.getElementById('inputText');
const value = inputText.value;
```

### ? Error Handling
```javascript
try {
    const result = processData(input);
    statusMessage.textContent = 'Success';
    statusMessage.className = 'success';
} catch (error) {
    statusMessage.textContent = `Error: ${error.message}`;
    statusMessage.className = 'error';
}
```

---

## Quick Reference Card

```
COLORS:      var(--bg-primary), var(--text-primary), var(--accent)
SPACING:     0.5rem (8px), 1rem (16px), 1.5rem (24px)
BORDER:      4px radius, 1px width, var(--border-color)
BUTTONS:     .btn .btn-primary / .btn-secondary
INPUTS:      Native styling with CSS variables
ICONS:       <span class="material-icons">name</span>
GRID:        250px sidebar, 1fr content, 2rem gap
RESPONSIVE:  @media (max-width: 768px)
```

---

Follow this guide to ensure your tools match the design system perfectly! ??
