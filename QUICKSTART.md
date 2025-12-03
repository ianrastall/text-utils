# Text Utils - Quick Start

## ?? Setup Complete!

Your Text Utils project has been successfully migrated to the new custom theme architecture.

## ?? What Was Created

### Core Files
- ? `css/style.css` - Shared styles with CSS variables
- ? `js/theme.js` - Theme management (dark/light, colors)
- ? `tool-template.html` - Template for creating new tools
- ? `case-converter.html` - First migrated tool (Case Converter)
- ? `README.md` - Complete migration documentation

### Updated Files
- ? `index.html` - Dashboard now links to standalone Case Converter

## ?? Getting Started

### View in Browser
Simply open any of these files in your browser:
- `index.html` - Main dashboard
- `case-converter.html` - Case Converter tool

**No build process required!** It's pure HTML/CSS/JS.

### Test the Features
1. **Theme Toggle**: Click the moon/sun icon to switch dark/light mode
2. **Accent Colors**: Use the palette dropdown to change accent color
3. **Case Converter**: Type text and watch it convert in real-time
4. **Copy Button**: Click to copy output to clipboard
5. **Clear Button**: Reset input and output

## ?? Design System

### CSS Variables (Dark Mode)
```css
--bg-primary: #121212
--bg-secondary: #1e1e1e
--bg-tertiary: #252525
--text-primary: #e0e0e0
--text-secondary: #a0a0a0
--accent: #0d9488 (customizable)
```

### Available Accent Colors
- Teal (default)
- Blue
- Purple
- Emerald
- Amber
- Red

## ?? Creating Your Next Tool

### Option 1: Copy the Template
```bash
cp tool-template.html your-tool.html
```

### Option 2: Follow the Pattern
See `case-converter.html` for a complete example with:
- Custom options panel
- Auto-run on input
- Error handling
- Performance timing

## ?? Case Converter Features

The Case Converter demonstrates best practices:

### Conversion Types
1. **UPPERCASE** - ALL CAPS
2. **lowercase** - all lowercase
3. **Title Case** - First Letter Of Each Word
4. **Sentence case** - First letter only
5. **camelCase** - nospacesCamelCase
6. **PascalCase** - NoSpacesPascalCase
7. **snake_case** - underscores_between_words
8. **kebab-case** - hyphens-between-words
9. **InVeRt CaSe** - sWaPs CaSe

### Auto-Features
- ? Real-time conversion (no button needed)
- ? Character and line counting
- ? Performance metrics
- ? Keyboard shortcuts (Ctrl+Enter)

## ?? Next Steps

### Migrate More Tools
Use the workflow in `README.md` to migrate:
1. Character Counter
2. JSON Formatter
3. Base64 Encoder
4. Password Generator
5. [Your other tools...]

### Customize the Design
All colors are in CSS variables - change them in `css/style.css`:
```css
:root {
    --accent: #your-color-here;
    --bg-primary: #your-bg-color;
}
```

## ?? Key Differences from Bootstrap Version

### Old Way (Bootstrap)
```html
<div class="container bg-dark">
    <button class="btn btn-primary">Click</button>
    <textarea class="form-control"></textarea>
</div>
```

### New Way (Custom Theme)
```html
<div class="container">
    <button class="btn btn-primary">Click</button>
    <textarea></textarea>
</div>
```

**Benefits:**
- ? No Bootstrap dependency
- ? Smaller file size
- ? Custom theming
- ? Dark mode by default
- ? Better mobile responsive

## ?? Troubleshooting

### Styles not loading?
Check the file path in your HTML:
```html
<link rel="stylesheet" href="css/style.css">
```

### Theme not saving?
- Enable cookies/localStorage in browser
- Check browser console for errors

### Tool not working?
- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Verify all IDs match between HTML and JS

## ?? Documentation

For detailed information, see:
- `README.md` - Complete migration guide
- `tool-template.html` - Starter template
- `case-converter.html` - Working example

## ?? Bonus Features

The new design includes:
- Material Icons integration
- LocalStorage for preferences
- URL hash navigation (on dashboard)
- Keyboard shortcuts
- Mobile responsive layout
- Copy to clipboard
- Processing time metrics

## ?? Pro Tips

1. **Auto-run Tools**: Add `inputText.addEventListener('input', runTool)` for instant results
2. **Validation**: Check input before processing to avoid errors
3. **Status Messages**: Use the status bar to give user feedback
4. **Keyboard Shortcuts**: Power users love Ctrl+Enter
5. **Mobile First**: Test on small screens (sidebars collapse)

---

**Happy Coding! ??**

Need help? Check `README.md` for the complete guide.
