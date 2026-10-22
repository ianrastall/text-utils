# text-utils: project brief

Working brief · 21 October 2026

## Purpose and priority

Provide dependable transformations, inspection and preparation of text/markup/data, plus small developer/design helpers.

Priority: important. Ordering within the five important projects remains open.

## Product track

Existing Astro website; desktop companion under consideration.

One conceptual tool family may have a website and a desktop application. This is a recommendation to evaluate, not approval to create and maintain two complete feature-identical products.

## Preserve

Useful current tool behavior, test fixtures, public URLs and the simple paste/transform/copy workflow. Preserve Unicode and format-specific semantics explicitly.

## First planning outcome

Separate text-processing workflows from web/design/reference helpers. Decide whether a desktop workbench should become the main personal tool while the public site retains quick utilities.

## Evidence of readiness for a technical scaffold

The tool matrix identifies desktop candidates, browser-natural tools and overlaps with MDEdit/md-viewer/Bookstacks. Confirm the desired personal workflow before choosing a desktop first milestone.

## Existing-work note

Desktop can provide file/folder workflows, saved operation sequences and batch jobs. Do not add every existing page to a native suite merely to reproduce the website.

Current source candidates:

- [D:/GitHub/text-utils](<D:/GitHub/text-utils>)

The source map records associated inventory entries; grouping is a review relationship, not automatic ownership or permission to move every related folder.

## Staged progression

1. Confirm the useful workflow and source/data boundaries.
2. Record broad navigation and domain responsibilities.
3. Review a visual concept where an interface is needed.
4. Define interface states and skeleton behavior.
5. Prepare an isolated, meaningful technical proof from the retained source.
6. Migrate/expand only with data and existing behavior preserved.

The original brief did not authorize implementation. Ian subsequently authorized the website rebuild on 21 October 2026: Text Utilities is the first Jupiter website, with Chess Nerd and Bookstacks to follow. The checkout is now `D:/jupiter/text-utils`, copied with history from the clean `D:/GitHub/text-utils` source. Preserve existing tools, public URLs and custom domain while implementing the shared web conventions. See [implementation notes](jupiter-web.md). The desktop editor remains a separate track.

## Desktop assessment

The [desktop-or-web assessment](desktop-or-web_assessment.md) recommends considering a focused native text/file workbench while retaining the public website. This is a recommendation in response to Ian's question, not a decision to convert or duplicate all tools.

## Consolidation candidate: Lucy

Consider Lucy as the desktop host for Text Utilities' document/selection transformations, preserving the public website. This reduces overlap with another standalone generic workbench. Lucy is currently WPF/AvalonEdit, so a Jupiter WinUI/Rust version requires a deliberate transition rather than a direct UI merge. See the assessment for inspected evidence and candidate boundaries. No merger is decided or implemented.

## Current direction: companion editors

Ian's next proposal is a general text editor with appropriate Text Utilities operations, accompanied by PGN and Markdown editors. See the [editor family architecture](../../_planning/editors-family_architecture.md). Recommended organization: three independently usable apps, shared document/session/transform infrastructure and specialist format modules. Lucy and MDEdit are retained source candidates; repository consolidation and the editor control remain undecided. No second standalone generic Text Utilities editor is presumed necessary.

## Latest clarification: fresh editor

Ian explicitly requested a fresh dark-mode text-editor design rather than revising an older program. The [fresh editor vision](../../_planning/text-editor_product-vision.md) supersedes earlier Lucy source/port assumptions. Text Utilities supplies candidate operations, not mandatory old UI or feature parity.
