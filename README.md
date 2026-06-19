# Text Utilities

A fresh static rebuild of Text Utilities for GitHub Pages.

## Stack

- Astro for static HTML output
- TypeScript for tool logic
- Plain browser APIs for runtime behavior
- GitHub Actions for build and deploy

GitHub Pages can host the generated HTML, CSS, JavaScript, and assets. It cannot run server-side Ruby, Python, PHP, or Node code for visitors.

## Local Development

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
npm test
```

The deployed custom domain is configured through `public/CNAME`.
