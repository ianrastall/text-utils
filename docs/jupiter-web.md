# Jupiter web implementation: Text Utilities

21 October 2026 · First working website specimen

## Structure

Text Utilities is the first rebuild in the three-site sequence: Text Utilities, Chess Nerd, Bookstacks. It uses Astro static pages, TypeScript, plain CSS semantic tokens, Lucide interface icons, native browser APIs, Vitest and Playwright. Tool-specific icon/font previews remain domain content.

`src/layouts/BaseLayout.astro` owns the family masthead, website links, category navigation, related-tool navigation, skip link and footer. `src/components/jupiter/` holds the appearance panel and searchable catalogue. `src/styles/global.css` holds the semantic palette and shared controls; `src/lib/` holds transformations and appearance contrast calculations. These are the initial reusable conventions for the other websites, with site-specific navigation/content. Extract a shared package after the other sites establish its actual boundaries.

## Appearance

Warm charcoal surfaces, system UI fonts, compact labeled controls, quiet borders and restrained accents. Dark is the first-run default; an explicitly saved light preference is preserved. Settings opens a keyboard-accessible native modal with Theme and Accent color controls. Choices apply immediately, persist per browser/site and include an explicit reset.

Automatic accent uses CSS `AccentColor` where supported, with `#C8A96B` as the family fallback. Browsers can supply their own accent for privacy or platform reasons, so the site cannot promise an exact Windows personalization color match. A custom picker is always available. System color resources remain live; derived text contrast refreshes while the page is visible. Forced colors take priority.

References: [CSS system colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color), [Astro styling](https://docs.astro.build/en/guides/styling/).

## Compatibility and privacy

All 33 tool routes and four category URLs retain their `.html` paths. Older JSON pages still redirect to JSON Tools. `public/CNAME` retains `text-utils.net`. Existing transformations and data are retained. Search filters the rendered catalogue locally; navigation and descriptions remain available without JavaScript. Interactive tools need JavaScript. Settings tolerate unavailable browser storage.

Most text processing stays in the browser. Notices identify Internet Archive search, IP lookup services, Google font/icon previews and optional sitemap crawling. Domain previews retain their own palettes independently of interface styling. No analytics or text upload service has been added.

## Toolchain and release checks

Node 24.13.0 is pinned in `.nvmrc` and consumed by the Pages workflow. Direct dependency versions and the npm lockfile are pinned. Astro 7.4.2 replaces the vulnerable 6.x baseline.

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run audit
```

Browser checks cover every tool route at desktop/mobile widths, catalogue search, preference persistence/reset, keyboard dismissal, blocked storage, JavaScript-disabled browsing, legacy redirects and representative transformations. Remote services are blocked during route checks to test local behavior independently of service availability. Live results still depend on those providers.

GitHub Actions repeats the tests, audit, build and browser checks before deploying the generated artifact to GitHub Pages. No new hosting service or domain transfer is involved.

## Local relocation

The previous clean checkout was `D:/GitHub/text-utils`; `D:/dev/proj/text-utils` was absent. Git metadata and sources were copied into `D:/jupiter/text-utils` before editing. The old checkout remains as a fallback; use Jupiter for subsequent work. The planning README is preserved in `docs/workspace/planning-readme.md`; the project brief and source map remain in `docs/`.
