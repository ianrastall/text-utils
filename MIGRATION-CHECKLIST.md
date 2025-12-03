# Tool Migration Checklist

Use this checklist when migrating each tool from the old Bootstrap repository to the new custom theme.

## ?? Pre-Migration

- [ ] Identify the old tool file (e.g., `old-repo/tool-name.html`)
- [ ] Identify the old JS file (e.g., `old-repo/js/tool-name.js`)
- [ ] Document all input fields the tool uses
- [ ] Document all output fields
- [ ] Document any special options or settings
- [ ] Test the old tool to understand its behavior

## ??? File Setup

- [ ] Copy `tool-template.html` to `[tool-name].html`
- [ ] Update `<title>` tag to "[Tool Name] - Text Utils"
- [ ] Update `#toolIcon` to appropriate Material Icon
- [ ] Update `#toolName` to tool's display name
- [ ] Mark appropriate category as `active` in sidebar
- [ ] Add tool to "Quick Tools" section in sidebar

## ?? Options Panel

- [ ] Create `<div class="options-grid">` inside `#toolOptions`
- [ ] Add each option as `<div class="option-group">`
- [ ] Use proper HTML input types:
  - [ ] `<select>` for dropdowns
  - [ ] `<input type="checkbox">` for toggles
  - [ ] `<input type="radio">` for exclusive choices
  - [ ] `<input type="range">` for sliders
  - [ ] `<input type="text">` for text inputs
- [ ] Assign unique IDs to each input
- [ ] Add descriptive labels
- [ ] Set sensible default values

## ?? JavaScript Logic

### Core Functions
- [ ] Extract transformation logic from old JS file
- [ ] Create main processing function (e.g., `convertText()`, `formatData()`)
- [ ] Add error handling with try/catch
- [ ] Add performance timing with `performance.now()`
- [ ] Update `statusMessage` on success/error
- [ ] Update `toolStats` with processing time
- [ ] Call `updateStats()` after processing

### Event Listeners
- [ ] Attach input event to `inputText` if auto-run desired
- [ ] Attach change events to all option inputs
- [ ] Add keyboard shortcut for Ctrl+Enter (optional)
- [ ] Verify copy/clear/back buttons work

## ?? Testing

### Functionality
- [ ] Test with empty input
- [ ] Test with sample data
- [ ] Test with edge cases (very long text, special characters)
- [ ] Test with invalid input (should show error message)
- [ ] Test all option combinations
- [ ] Verify output is correct

### UI/UX
- [ ] Input stats update correctly (chars, lines)
- [ ] Output stats update correctly
- [ ] Copy button copies to clipboard
- [ ] Clear button resets everything
- [ ] Back button returns to dashboard
- [ ] Status messages display correctly
- [ ] Processing time shows

### Theming
- [ ] Theme toggle switches dark/light mode correctly
- [ ] Accent color changes apply to tool
- [ ] All colors use CSS variables
- [ ] No hardcoded colors in inline styles
- [ ] Theme preference persists on reload

### Responsive
- [ ] Test at 1400px (desktop)
- [ ] Test at 768px (tablet)
- [ ] Test at 375px (mobile)
- [ ] Sidebar behavior correct on mobile
- [ ] Buttons don't overflow on small screens
- [ ] Textareas resize properly

### Accessibility
- [ ] All inputs have labels
- [ ] Labels have `for` attribute matching input ID
- [ ] Buttons have meaningful text or icons
- [ ] Tab order is logical
- [ ] Focus states are visible

## ?? Dashboard Integration

### Update index.html
- [ ] Add tool to `tools` array if using inline version
- [ ] OR add link condition in `renderToolGrid()` for standalone
- [ ] Test card click navigates correctly
- [ ] Test search finds the tool
- [ ] Test category filter includes the tool

### Metadata
- [ ] Tool has correct category (text/data/convert/generate)
- [ ] Tool has descriptive name
- [ ] Tool has helpful description
- [ ] Tool has appropriate Material Icon

## ?? Documentation

- [ ] Add tool to "Next Tools to Migrate" list in README
- [ ] Mark as completed once done
- [ ] Document any special features or gotchas
- [ ] Add examples of input/output if helpful

## ?? Final Review

- [ ] Code is clean (no commented-out Bootstrap classes)
- [ ] No console errors in browser DevTools
- [ ] Performance is acceptable (< 100ms for typical input)
- [ ] User experience is smooth
- [ ] Matches design system consistently

## ?? Commit

- [ ] Git add the new file
- [ ] Commit with message: "feat: migrate [Tool Name] to new theme"
- [ ] Update README checklist

---

## Example: Case Converter ?

The Case Converter (`case-converter.html`) is a complete example that checks all these boxes. Refer to it when migrating new tools.

### Key Features Demonstrated:
- Auto-run on input (no button needed)
- Multiple options in dropdown
- Real-time statistics
- Error handling
- Performance timing
- Keyboard shortcuts
- All standard buttons (copy, clear, back)

---

Copy this checklist for each tool you migrate to ensure consistency and quality.
