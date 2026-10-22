# Text Utilities

33 browser tools for writing, converting, inspecting and designing text. The first working Jupiter website specimen, located at `D:/jupiter/text-utils`.

## Stack

- Astro for static HTML output
- TypeScript for tool logic
- Plain browser APIs for runtime behavior
- GitHub Actions for build and deploy

GitHub Pages can host the generated HTML, CSS, JavaScript, and assets. It cannot run server-side Ruby, Python, PHP, or Node code for visitors.

## Local Development

Use Node 24.13.0 (`.nvmrc`).

```powershell
npm ci
npm run dev
```

## Build

```powershell
npm run build
npm test
npx playwright install chromium
npm run test:browser
npm run audit
```

The deployed custom domain is configured through `public/CNAME`.

## Jupiter web conventions

Astro static output, TypeScript, plain CSS semantic tokens, Lucide interface icons and native browser APIs. The shared shell provides category navigation, a searchable catalogue and consistent appearance settings. Dark is the first-run default; a saved light preference is retained. Automatic accent uses the system color when the browser exposes it, with a family fallback, custom override and explicit reset.

All existing tool URLs and processing behavior are retained. Tools accessing online services display a notice. See [Jupiter implementation notes](docs/jupiter-web.md) for architecture, privacy, relocation and browser accent limitations. The deployment workflow runs unit tests, audit, build and browser checks before publishing to GitHub Pages.

## Support

If this software saved you a few hours of work, or is something you would have paid $5 for, consider throwing something my way.

[Buy me a coffee on Ko-fi](https://ko-fi.com/ianrastall)
