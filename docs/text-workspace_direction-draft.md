# Text Utilities: editor-centered direction

Discussion draft · 21 October 2026

Ian asked to re-envision how the tasks should work, including whether an online text editor should form part of the experience. This is the proposed product direction, beyond the initial Jupiter visual rebuild. It is not a claim that the editor is implemented.

## Recommended experience

Make a browser text workspace the main surface for related text operations. A person opens or pastes text once, edits it, selects a passage or the whole document, chooses operations, reviews changes and applies them. Ordinary editing and transformations should share one undo/redo history. Keep the original available until changes are applied.

Document tabs represent independently open documents. Commands act on the active document or an explicitly labeled selection. A compact task panel holds relevant options, and an optional result/difference pane shows changes. Preview should be useful without permanently taking half of every screen.

Offer a searchable command list with familiar names: trim lines, remove duplicates, change case, replace with regex, format JSON, inspect text. Commands can also be discovered through task-oriented groups. Tool options should not discard the working document.

## Three related experiences

- **Text workspace:** editing, cleanup, line operations, case changes, extraction, encoding and inspection of the active document.
- **Format-aware views:** Markdown source with rendered preview; JSON formatting/validation with precise error locations; two-document comparison. They use the same document/session behavior with specialized views.
- **Design and reference tools:** colors, fonts, icons, gradients, clocks and external searches retain appropriate dedicated surfaces. Share the family shell and settings.

Keep quick standalone links for visitors arriving at existing tool URLs. They can open the relevant command or focused view without requiring the visitor to understand the entire workspace.

## Repeated work

Support ordered operation recipes after single operations are dependable. Show what each step does, preview the combined result, and let a person save/reuse a recipe. Operations preserve Unicode and newline/format semantics deliberately. Treat applying a recipe as one reversible editing transaction.

## Browser behavior

Process text in the browser by default. An editor does not inherently require accounts, uploads or a server. Provide explicit controls over saved drafts and session recovery; explain where text is retained. Large operations must remain cancellable and keep the interface responsive. Copy, download and opening local files belong in the common document workflow.

## First useful implementation

Prove one coherent path: paste/open a text document, edit/select, trim lines, remove blanks and duplicates, preview changes, apply, undo, copy/download. Then integrate regex/case transformations, followed by format-aware Markdown and JSON views. Choose the real editing component and buffer/undo ownership before expanding the command catalogue.

The in-chat concept demonstrates cleanup, whole-document/selection scope, preview, apply and undo. It is an interaction sketch, not the full editing engine or a replacement release.
