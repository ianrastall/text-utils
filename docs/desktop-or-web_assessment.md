# Text Utilities: desktop or website?

Assessment · 21 October 2026 · Recommendation, not an approved conversion

## Recommendation

For Ian's personal workflow, a **desktop Text Utilities workbench is a strong candidate**. Retain the public website for quick, installation-free tools and browser/design helpers. Organize both as one conceptual tool family if that direction is selected, rather than committing to two complete copies of every feature.

The value of desktop would come from a better connected workflow: open text files, apply a useful sequence of transformations, preview changes/differences, undo, and save or export results. Folder/batch work and saved processing presets could be later capabilities if Ian wants them. Native packaging alone does not make individual case conversion or JSON formatting more useful.

## Evidence from the existing project

Inspected: D:\GitHub\text-utils\src\pages, src/data/tools.ts and representative tool markup for line operations, Markdown formatting and Gutenberg cleaning. Tool metadata and page presence indicate current feature shape; no application or browser tests were run in this assessment.

The site's categories are already Write, Convert, Inspect and Design. The name Text Utilities therefore covers several kinds of tools rather than one homogeneous text-processing engine.

| Existing capabilities | Desktop opportunity | Website role |
| --- | --- | --- |
| Line operations, regex extraction/testing, text diff and text statistics | Strong common workspace: real files, staged changes, undo and reusable processing sequences | Keep quick paste-and-copy versions where useful |
| JSON/CSV conversion, JSON formatting/tools, pretty printing, encoding/hashing | File-oriented preparation and inspection; batch only if wanted | Useful immediately in a browser for small inputs |
| Gutenberg cleaning, HTML tag removal/entities, curly quotes and case conversion | Candidate text/ebook-preparation workflow; preserve meaningful source content and require clear transform semantics | Lightweight one-off tools remain useful |
| Markdown formatting/preview and syntax highlighting | Useful supporting functions, but define overlap with MDEdit and md-viewer before adding another full editor | Public preview/format helpers can remain |
| Color/gradient/CSS-unit tools, web font and icon choosers | Add only if a concrete native workflow justifies them | Natural browser/design helpers; not required in a first desktop workbench |
| Archive search and IP information | Distinct network/reference utilities; not core text processing | Keep their independent tool purposes and disclose network behavior |
| Snippets, generators and symbol choosers | Optional helpers after the main workflow is clear | Often adequate as small browser tools |

## File access and privacy

Browsers can process local files. File-system access is permission-based and browser support varies; that is different from saying a website cannot work with files. WinUI offers desktop file/folder APIs suitable for a native workflow. This makes desktop a good fit for sustained multi-file operation, but does not prove a speed advantage. [MDN File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API), [Windows file management](https://learn.microsoft.com/en-us/windows/apps/develop/files/)

Local browser transformations need not upload text. Do not advertise desktop as the only private option or claim every current website tool is offline: some existing helpers use network resources. Check actual data flow per tool and explain it plainly.

## Proposed product boundary

Keep **Text Utilities** as the working family name while the decision is open:

- **Website:** accessible quick tools and public discovery/reference; Astro/TypeScript on Pages.
- **Possible desktop workbench:** focused text/file transformations; WinUI/C# surface over the shared Rust command/query core, with CLI access if batch automation is wanted.
- **Existing document apps:** MDEdit remains a manuscript-editing candidate and md-viewer a document-reading/conversion candidate. Text Utilities should not accidentally become a second full manuscript editor.
- **Bookstacks:** semantic TEI editing and authoritative literary source work stay explicit. A generic cleaner must not silently define Bookstacks' editorial rules.

## Keep maintenance manageable

Do not immediately port every TypeScript tool to Rust or build a web/native UI for every operation. First capture the wanted semantics and existing useful fixtures, then select a focused desktop workflow.

Where the same substantive operation is later offered in multiple shells, choose an explicit authority and reuse strategy. A Rust core could have C ABI/CLI adapters and a separately justified WebAssembly adapter; ordinary browser-only presentation helpers can stay TypeScript. Existing web code remains useful until a deliberate migration is ready. A shared name is not proof that different parsing, Unicode, regular-expression or Markdown implementations produce identical results.

## Sensible first milestone if desktop is chosen

One file or pasted text → a small set of line/cleanup operations → preview/diff → undo → save as a separate output. Use standard menus and a compact command bar. Determine encoding/newline handling and what constitutes a reversible change before implementing it. Add folder-wide processing and stored multi-step recipes only after that single-document workflow is useful.

The open product decision is whether this file-oriented workbench is something Ian would use regularly. This assessment recommends considering it; it does not authorize a rewrite, remove the website or set a final app/suite boundary.

## Lucy integration candidate

Ian asked whether the desktop Text Utilities capabilities would fit the existing Lucy editor. **Yes: this is a stronger consolidation candidate than creating another general text editor/workbench.** It is a recommendation pending a product decision, not a code/repository merge.

Local source inspection found Lucy at D:\GitHub\lucy with document tabs, file/session services, dirty-state handling, encoding and newline metadata, syntax highlighting, editor selection and undo commands, navigation/search, and an HTML Tidy service. Some menu commands, including Replace, still route to a planned-feature notice; menu presence does not establish implementation. No build or interactive behavior was tested.

Proposed division:

- **Lucy:** editor workspace and document lifecycle; text transformations operate on a selection or whole document through a consistent command surface.
- **Text Utilities processing component:** pure operations with explicit input/options/output and errors. Under Jupiter, substantive reusable domain logic belongs behind the Rust command/query API. It can remain a module/crate in the retained product repository; a separate repository is not required.
- **Public Text Utilities site:** retain useful browser tools. Web fonts/icons/CSS helpers and network/reference tools do not need to become Lucy commands.

A coherent starting menu could be File, Edit, Search, Transform, View, Tools and Help. Group line operations, case/quotes, markup cleanup, data formatting and encoding under Transform rather than creating a separate page for every former website tool. Apply an operation as one undoable edit; respect selection/document scope, preserve encoding/newline intent, and use preview or a new document for substantial conversions. Guard late results against editing a newer document revision.

**Stack distinction:** the inspected Lucy project currently targets net10.0-windows with UseWPF=true and AvalonEdit 6.3.1.120. It has no Rust core in the inspected solution. Its existing view models also expose WPF/editor-specific types, so the shell is not cleanly interchangeable. Folding in feature scope is sensible, but adopting Jupiter's WinUI/Rust architecture requires a planned shell/core transition and selection of a compatible editor control. Do not assume AvalonEdit is a drop-in WinUI control or that its UI can simply be copied.

Before a merge decision, define Lucy's role alongside MDEdit and md-viewer: general text/code editing with transformations, manuscript-specific Markdown editing, and document reading/conversion are useful candidate distinctions. The immediate benefit would be eliminating an additional generic text-workbench commitment; it does not settle the entire document-tools group or automatically increase Lucy's priority.
