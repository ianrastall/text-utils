# Text Utilities

Text Utilities is a static, browser-based toolbox with standalone pages for text, data, and formatting workflows.

Live site: https://text-utils.net/

## Current Tool Set

The dashboard (`index.html`) currently exposes these tools:

| Tool | File | Category | Description |
| --- | --- | --- | --- |
| Case Converter | `case-converter.html` | Text | Convert text between different letter cases. |
| Text Info | `text-info.html` | Text | Show detailed text metrics and readability info. |
| Line Operations | `line-operations.html` | Text | Sort, filter, and transform lines of text. |
| Find & Replace | `find-replace.html` | Text | Search and replace text with regex support. |
| Font Chooser | `font-chooser.html` | Text | Preview fonts, contrast, and CSS snippets. |
| IP Info | `ip-info.html` | Data | Show public IP, provider, location, and device details. |
| Font Awesome Chooser | `font-awesome-chooser.html` | Data | Browse Font Awesome icons and generate snippets. |
| Google Icons Chooser | `google-icons-chooser.html` | Data | Browse Material icons and generate snippets. |
| Color Chooser | `color-chooser.html` | Data | Pick colors, match closest named colors, and export snippets/PNG. |
| CSS Unit Converter | `css-unit-converter.html` | Convert | Convert CSS units (`px`, `em`, `rem`, `%`, `pt`, `vw`, `vh`). |
| Date/Time Info | `date-time-info.html` | Data | Display date/time formats, calendar views, and timezone output. |
| Random Number Generator | `random-numbers.html` | Data | Generate random numbers with range/uniqueness/sorting options. |
| Hashing Tool | `hashing-tool.html` | Convert | Hash, encode, and decode text with multiple algorithms. |
| JSON Tool | `json-tool.html` | Data | Format, validate, and convert JSON/JSONL. |
| XML Sitemap Generator | `sitemap-generator.html` | Data | Crawl a site and generate `sitemap.xml` output. |

## Run Locally (Recommended)

This project is static HTML/CSS/JS, so there is no build step.  
Run a local server from the repo root instead of opening files directly cnfile://`.

### Python 3

```powershell
cd <path-to-repo>/text-utils
python -m http.server 8000
```

If `python` is not on PATH on Windows:

```powershell
py -m http.server 8000
```

Then open:

- `http://localhost:8000/`
- `http://localhost:8000/index.html`

Stop the server with `Ctrl+C`.

## Why Use a Local Server Instead of `file://`

Serving from `http://localhost` avoids common browser security restrictions:

- Clipboard APIs (`navigator.clipboard`) are more reliable in secure contexts.
- Web Crypto (`crypto.subtle`) used by `hashing-tool.html` requires secure context for SHA hashing.
- Fetch/network behavior is more consistent for tools that call remote APIs (`ip-info.html`, `sitemap-generator.html`).
- Local storage and asset loading behave more consistently across browsers.

## Project Structure

```text
.
|- index.html
|- *.html                    # standalone tool pages
|- css/style.css             # shared design system
|- js/theme.js               # theme, accent, and seasonal UI behavior
|- js/font-awesome-data.js   # bundled Font Awesome icon data
|- js/google-icons-data.js   # bundled Google icon data
|- docs/                     # detailed tool walkthroughs
|- scripts/                  # helper scripts for targeted code dumps
|- img/                      # site assets/icons
|- sitemap.xml
|- tool-template.html
```

## Development Notes

- Stack: vanilla HTML, CSS, and JavaScript.
- No package manager or build tooling is required.
- Theme and accent controls are shared through `js/theme.js`.
- Most logic is client-side per page, with shared layout/styles from `css/style.css`.

## Adding a New Tool

1. Copy `tool-template.html` to a new file (for example, `my-tool.html`).
2. Add a new tool entry in the `tools` array in `index.html`.
3. Ensure shared assets are referenced (`css/style.css`, `js/theme.js`, Material Icons).
4. Add the new page to `sitemap.xml` if it should be indexed on the deployed site.
5. Optionally add docs under `docs/`.

## Helper Scripts

The repo includes maintenance scripts for targeted context/code dumps:

- `scripts/code-dump-case-converter.ps1`
- `scripts/code-dump-color-chooser.py`

Outputs are written to the `context/` folder by default.

## Network and External Dependencies

- Material Icons: loaded from Google Fonts.
- Google Analytics tag: present in pages.
- Font Awesome Chooser: loads Font Awesome CSS from CDN.
- IP Info and Sitemap Generator: depend on external network requests and may be limited by CORS rules.

## License

MIT. See `LICENSE`.
