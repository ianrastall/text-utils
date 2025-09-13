# Text Utilities Project Guidelines

## Project Overview

Text Utilities is a collection of interactive web-based tools and educational tutorials for text processing, programming, and developer productivity. The project uses vanilla JavaScript, HTML, and Bootstrap for a responsive, mobile-friendly UI.

## Architecture & Structure

- **Component-Based Design**: The site uses a simple component system with shared header/footer via `ComponentLoader`.
- **Tool Configuration**: All tools are registered in `config/tools.json` with metadata like name, icon, and description.
- **Vanilla JS Philosophy**: Each tool is implemented as a standalone module with its own HTML and JS files.
- **Bootstrap 5**: Used for responsive layout and UI components.

## Key Development Patterns

### Adding a New Tool

1. Create a new HTML file following the pattern in existing tools (e.g., `case-converter.html`).
2. Create a corresponding JS file in the `js/` directory.
3. Add the tool's metadata to `config/tools.json`.
4. Use common patterns from existing tools:
   ```javascript
   // Standard initialization pattern
   function init() {
     cacheDOM();      // Cache DOM elements
     bindEvents();    // Attach event listeners
     bindSidebar();   // Load sidebar dynamically
     bindHeaderFooter(); // Load shared components
   }
   ```

### Working with Components

- Use `ComponentLoader.loadAll()` to load header/footer components.
- Components are loaded from `components/header-content.html` and `components/footer-content.html`.
- Example:
  ```javascript
  ComponentLoader.loadComponent('header-placeholder', 'components/header-content.html');
  ```

### Tutorials Structure

- Tutorials are organized by language in the `tutorials/` directory.
- Each language has an `index.json` file that lists the tutorial files.
- Tutorial content is written in Markdown (`.md` files).
- To fix Markdown formatting issues, use `fix_markdown_lint.py` script.

## Critical Development Workflows

### Local Development Setup

- Run a local web server to avoid CORS issues with file loading:
  ```
  # Python 3
  python -m http.server 8000
  
  # Node.js
  npx http-server -p 8000
  ```
- Access the site at `http://localhost:8000/`

### Adding New Tutorial Content

1. Create Markdown files in the appropriate language directory (e.g., `tutorials/ada/`).
2. Update the language's `index.json` to include the new files.
3. Run `fix_markdown_lint.py` to ensure proper Markdown formatting.

## Implementation Notes

### UI Conventions

- Dark theme UI with Bootstrap components.
- Material Design icons for consistency.
- Toast notifications for user feedback (see `showToast()` in JS files).

### Data Management

- Configuration files in `config/` directory.
- Data files in `includes/` directory.
- Icon categories in dedicated directories.

## Common Patterns to Follow

- Use modular JavaScript with ES6 features.
- Follow consistent error handling with user-friendly toast notifications.
- Structure tools with clear separation between UI interactions and core functionality.
- For new tools, study existing implementations like `case-converter.js` as reference.

## Example: Tool Structure

A typical tool follows this pattern:
```
tool-name.html             # The UI and HTML structure
js/tool-name.js            # The core functionality
config/tools.json          # Entry in the tools registry
```

Apply this structure when adding new tools or modifying existing ones.