# Font Chooser Migration Notes

This document explains how the legacy Bootstrap/PHP Font Chooser was refigured for the new Text Utils design system.

## What changed
- Rebuilt the tool as a standalone page: `font-chooser.html`
- Uses shared assets only (`css/style.css`, `js/theme.js`, Material Icons)
- Replaces Bootstrap components with native elements styled by the design system
- Adds curated Google + system font lists, contrast checking, and CSS/SCSS export tabs
- Wired into the dashboard (`index.html`) as `Font Chooser`
- Removed the sidebar; header title now handles navigation back to the dashboard

## How to migrate a font tool into this codebase
1. **Copy the template**  
   Start from `tool-template.html` (or an existing tool) and set title, icon, and sidebar active category.
2. **Structure the UI**  
   - Left column: font source toggle, search, category filter, font list  
   - Right column: sizing/weight/spacing controls, color + contrast, sample text, preview pane, CSS tabs
3. **Use design tokens**  
   All colors and spacing come from CSS variables in `css/style.css` (`var(--bg-*)`, `var(--accent)`, etc.). No Bootstrap classes.
4. **Load fonts safely**  
   - Curate Google fonts with weight arrays  
   - Build the Google Fonts URL: `https://fonts.googleapis.com/css2?family=<Family>:wght@<weights>&display=swap`  
   - System fonts use local stacks (`-apple-system, 'Segoe UI', system-ui, sans-serif`) and skip imports
5. **Preview + contrast**  
   Apply the chosen stack, size, weight, line-height, letter-spacing, text color, and background to the preview.  
   Compute WCAG contrast ratio to show AA/AAA pass/fail.
6. **Generate code**  
   Produce three snippets: plain CSS (with optional `@import`), bare `@import` block, and SCSS variables. Bind copy buttons to clipboard.
7. **Wire dashboard navigation**  
   Add the tool entry to the `tools` array in `index.html` so the card links to `font-chooser.html`.
8. **Test**  
   - Theme toggle + accent color  
   - Selecting fonts from both sources  
   - Weight switching updates preview and code  
   - Color hex inputs stay in sync with pickers  
   - Contrast indicator updates  
   - Copy buttons populate clipboard

## Files touched in this migration
- `font-chooser.html` - new standalone tool (UI + logic)
- `index.html` - added `Font Chooser` card to the dashboard

Follow the same pattern for any future typography tools: keep dependencies minimal, rely on shared styles, and surface production-ready code blocks.
