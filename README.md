# Text Utils - Migration Guide

## Project Structure

```
text-utils/
??? index.html              # Main dashboard (SPA with inline tools)
??? tool-template.html      # Template for creating new standalone tool pages
??? case-converter.html     # Standalone Case Converter tool
??? css/
?   ??? style.css          # Shared styles (CSS variables, components)
??? js/
?   ??? theme.js           # Theme management (dark/light mode, accent colors)
??? README.md
```

## Architecture Overview

This project uses a **hybrid approach**:

1. **Main Dashboard** (`index.html`): Single-page application with all tools embedded
2. **Standalone Tool Pages**: Individual HTML files for each tool (e.g., `case-converter.html`)

### Why Both Approaches?

- **Dashboard**: Quick access to all tools, good for discovery
- **Standalone Pages**: Direct linking, bookmarking, better for specific workflows

## Shared Assets

### CSS (`css/style.css`)
Contains all styling including:
- CSS Variables for theming (dark/light mode)
- Layout components (header, sidebar, tool-container)
- Form controls (buttons, inputs, textareas)
- Responsive breakpoints

### JavaScript (`js/theme.js`)
Handles:
- Theme toggling (dark/light mode)
- Accent color selection
- LocalStorage persistence
- Color brightness adjustments

## Creating a New Tool (Migration Workflow)

### Step 1: Analyze the Old Tool
From the old Bootstrap-based repository, identify:
- Input fields (textareas, selects, checkboxes, radios)
- Output fields
- Transformation logic
- Any options/settings

### Step 2: Create the New File
1. Copy `tool-template.html` to `[tool-name].html`
2. Update the `<title>` tag
3. Update the tool icon and name in the header
4. Mark the appropriate category as `active` in the sidebar

### Step 3: Build the Options Panel
Add tool-specific options inside `#toolOptions`:

```html
<div class="options-panel" id="toolOptions">
    <div class="options-grid">
        <div class="option-group">
            <label for="optionId">Option Label</label>
            <select id="optionId">
                <option value="val1">Option 1</option>
                <option value="val2">Option 2</option>
            </select>
        </div>
    </div>
</div>
```

**Available Input Types:**
- `<select>` - Dropdowns
- `<input type="checkbox">` - Toggles
- `<input type="radio">` - Single choice
- `<input type="range">` - Sliders
- `<input type="text">` - Text inputs

### Step 4: Migrate the Logic
Extract the transformation functions from the old JS files and add them below the template's common code:

```javascript
// Tool-specific code goes below this line
// -------------------------------------------

function transformText(input, options) {
    // Your conversion logic here
    return result;
}

function runTool() {
    const input = inputText.value;
    const option = document.getElementById('optionId').value;
    
    try {
        const startTime = performance.now();
        const result = transformText(input, { option });
        const endTime = performance.now();
        
        outputText.value = result;
        statusMessage.textContent = 'Success';
        statusMessage.className = 'success';
        toolStats.textContent = `Processed in ${Math.round(endTime - startTime)}ms`;
    } catch (error) {
        outputText.value = `Error: ${error.message}`;
        statusMessage.textContent = 'Error';
        statusMessage.className = 'error';
    }
    
    updateStats();
}

// Auto-run on input change
inputText.addEventListener('input', runTool);
document.getElementById('optionId').addEventListener('change', runTool);
```

### Step 5: Update the Dashboard
Add the tool to `index.html`:

```javascript
// In the renderToolGrid function, add condition for your tool
if (tool.id === 'your-tool-id') {
    card.addEventListener('click', () => window.location.href = 'your-tool.html');
} else {
    card.addEventListener('click', () => openTool(tool.id));
}
```

## Case Converter Example

The **Case Converter** (`case-converter.html`) demonstrates best practices:

### Features Implemented:
- ? Auto-conversion on input (no "Run" button needed)
- ? Multiple case types (upper, lower, title, sentence, camel, pascal, snake, kebab, invert)
- ? Real-time character/line statistics
- ? Copy to clipboard
- ? Clear button
- ? Back navigation
- ? Keyboard shortcuts (Ctrl+Enter)
- ? Performance timing
- ? Error handling

### Key Functions:
- `toUpperCase()`, `toLowerCase()` - Basic conversions
- `toTitleCase()` - Capitalizes first letter of each word
- `toSentenceCase()` - Capitalizes first letter only
- `toCamelCase()` - Remove spaces, capitalize words except first
- `toPascalCase()` - Like camel but capitalize first word too
- `toSnakeCase()` - Replace spaces with underscores, lowercase
- `toKebabCase()` - Replace spaces with hyphens, lowercase
- `invertCase()` - Swap upper/lower case

## Styling Guidelines

### DO:
? Use CSS variables from `style.css`:
- `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-tertiary)`
- `var(--text-primary)`, `var(--text-secondary)`
- `var(--accent)`, `var(--accent-light)`
- `var(--border-color)`
- `var(--success)`, `var(--warning)`, `var(--error)`

? Use existing classes:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.option-group`, `.options-grid`
- `.io-panel`, `.io-label`
- `.success`, `.warning`, `.error`

### DON'T:
? Add inline styles
? Use Bootstrap classes (`.btn-dark`, `.form-control`, etc.)
? Create tool-specific CSS (use shared classes)
? Hardcode colors

## Common Patterns

### Auto-Run on Input:
```javascript
inputText.addEventListener('input', convertCase);
```

### Button-Triggered Run:
```javascript
const runButton = document.createElement('button');
runButton.className = 'btn btn-primary';
runButton.innerHTML = '<span class="material-icons">play_arrow</span> Run';
runButton.addEventListener('click', runTool);
```

### Multiple Options:
```javascript
const option1 = document.getElementById('option1').value;
const option2 = document.getElementById('option2').checked;
const result = transformText(input, { option1, option2 });
```

## Testing Checklist

Before considering a tool complete, verify:

- [ ] Theme toggle works (dark/light mode)
- [ ] Accent color selection works
- [ ] Input statistics update correctly
- [ ] Output statistics update correctly
- [ ] Copy to clipboard works
- [ ] Clear button resets everything
- [ ] Back button returns to dashboard
- [ ] Tool processes input correctly
- [ ] Error handling shows meaningful messages
- [ ] Performance timing displays
- [ ] Mobile responsive (test at 768px width)
- [ ] Keyboard shortcuts work (Ctrl+Enter if applicable)

## ?? Next Tools to Migrate (Priority Order)

Based on common usage:
1. ? **Case Converter** - DONE
2. ? **Text Info** - DONE
3. ? **Character Counter** - Simple (30 min)
4. ? **JSON Formatter** - Medium (1 hour)
5. ? **Base64 Encoder/Decoder** - Simple (30 min)
6. ? **Password Generator** - Complex (2 hours)
7. ? **URL Encoder/Decoder** - Simple (30 min)
8. ? **Hash Generator** - Medium (1 hour)
9. ? **Lorem Ipsum Generator** - Simple (30 min)
10. ? **Line Sorter** - Simple (30 min)
11. ? **Text Diff** - Complex (2 hours)

### Estimated Total Migration Time: 10-15 hours

## Tips for Success

1. **Start with the template**: Always copy `tool-template.html` first
2. **Test incrementally**: Add one option at a time
3. **Preserve the logic**: Don't rewrite working algorithms, just adapt them
4. **Keep it simple**: If the old tool had Bootstrap modals/tabs, simplify to single-page
5. **Use Material Icons**: Keep the icon set consistent
6. **Auto-run when possible**: Reduces clicks for user
7. **Add keyboard shortcuts**: Power users will thank you

## Troubleshooting

### CSS not loading
- Check path: `<link rel="stylesheet" href="css/style.css">`
- Verify file exists in `css/` directory

### Theme not persisting
- Check if `js/theme.js` is loaded
- Verify localStorage is enabled in browser

### Tool not converting
- Check browser console for JavaScript errors
- Verify event listeners are attached
- Ensure function is called on input/change

## Resources

- [Material Icons](https://fonts.google.com/icons)
- [CSS Variables Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
