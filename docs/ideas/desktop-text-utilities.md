# Desktop Text Utilities Idea

Date captured: 2026-06-21

## Core Idea

Some tools may be better as downloadable software than as static browser pages. Text Utilities can keep its browser-first tools for simple client-side transformations, but offer a small desktop app for workflows where the browser is the wrong place to do the job.

Two strong candidates:

- Dictation cleanup
- XML sitemap generation

## Why Desktop Software Helps

The browser is excellent for private text transformations, formatting, converters, and small generators. It becomes awkward when a tool needs OS integration, private API credentials, direct network crawling, clipboard workflows, hotkeys, local files, or background work.

A desktop app could:

- Store user API keys locally instead of exposing them in frontend JavaScript.
- Use global hotkeys and clipboard integration.
- Avoid browser speech-recognition limitations.
- Run direct HTTP requests without browser CORS restrictions.
- Offer local model support later.
- Save settings, histories, and output files locally.

## Candidate 1: Dictation Cleanup

The user dictates messy natural speech, then the app rewrites it into usable text. This could be a small GUI with an input box, output box, and a few rewrite buttons.

Useful desktop-specific features:

- Global shortcut to open the cleanup window.
- Paste from clipboard, clean, then copy result back.
- Optional direct capture from Windows dictation output.
- Local storage for an OpenAI API key or another LLM provider key.
- Optional local model support through something like Ollama.
- Presets such as paragraph, email, message, concise, and keep my voice.

Main reason it may be better as software:

The tool wants OS-level convenience and private AI credentials. A static web page cannot safely keep a paid API key, and browser-native dictation support is uneven.

## Candidate 2: XML Sitemap Generator

The user gives the app a site URL and the app crawls the site to produce `sitemap.xml`.

The current browser version has a URL-list mode, but that should be treated as a power-user escape hatch rather than the real product. A normal user should not have to install a separate link-grabber extension, crawl their site somewhere else, copy the exported URLs, paste them into Text Utilities, and then generate the sitemap. At that point Text Utilities is only doing the final formatting step, not solving the user's actual problem.

Useful desktop-specific features:

- Direct HTTP crawling without browser CORS blocking.
- Better status logs, retry handling, rate limiting, and download/save support.
- Respectful crawl settings such as max pages, max depth, delay, timeout, and same-host-only mode.
- Optional parsing of existing `robots.txt` and `sitemap.xml`.
- Optional handling for JavaScript-rendered pages through a bundled browser engine.
- Output to `sitemap.xml`, clipboard, or saved project file.

Main reason it may be better as software:

The browser is the thing making this tool unreliable. Native software still has to handle network errors, blocked sites, authentication, robots policies, rate limits, and JavaScript-heavy pages, but it is not stopped by browser CORS.

The user experience goal should be: enter a URL, click crawl, inspect results, save `sitemap.xml`. If the user must bring their own URL list, the downloadable app is probably the correct product shape.

## Possible Product Shape

A small desktop application called something like **Text Utilities Desktop**:

- Sidebar or launcher with separate utilities.
- Each utility is focused and small.
- Settings page for API keys, local model endpoints, crawl defaults, and save locations.
- Browser Text Utilities remains the free static site for simple tools.
- Desktop Text Utilities exists for tools that need OS access, private credentials, or direct networking.

## Possible Tech Choices

- **Tauri:** Smaller app size, Rust backend, web frontend. Good for local networking and system integration.
- **Electron:** Larger app size, easier JavaScript ecosystem, very flexible.
- **Python + Qt:** Good for quick desktop utilities, especially if the sitemap crawler becomes Python-heavy.
- **.NET / WinUI:** Good Windows-native fit if Windows is the main target.

## Open Questions

- Is this Windows-only at first, or cross-platform from the beginning?
- Should the desktop app be one small suite or separate tiny utilities?
- Should the sitemap generator use a simple HTTP crawler first, or include a browser engine for JavaScript-rendered pages?
- Should dictation cleanup require a cloud LLM, support local models, or both?
- Should this live in this repo, a sibling repo, or a separate product repo?

## Current Decision

Keep the browser sitemap tool only as a limited utility for pasted/exported URL lists and CORS-friendly sites. Treat XML sitemap generation as a strong desktop-software candidate because the primary user workflow requires crawling, and crawling is exactly what the browser-hosted version cannot reliably do.
