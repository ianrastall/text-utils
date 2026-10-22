# Workspace improvement passes

22 October 2026. Priorities: usability and computer-friendliness, stability/security, and useful editing workflows comparable to or beyond a desktop editor.

## 1. Preserve work

JSON formatting, minification and recursive key sorting share a token-preserving implementation. Numbers, escaped strings and duplicate keys retain their original spelling. Other JSON conversions reject numeric tokens that would change under JavaScript serialization; CSV numeric cells that cannot round-trip exactly remain strings.

Save file uses the browser file picker where supported and clears the modified marker only after the writable stream closes successfully. Download copy and the fallback download keep the marker. Line-ending changes count as modifications.

Draft storage version 2 stores one record per document and updates changed records atomically with session metadata. Version 1 recovery copies remain readable. Saving and recovery enforce 30 documents, 10 million characters per document, 30 million total. Recovery names skipped records and pauses saving so it cannot overwrite a partially recovered session. A failed transaction preserves the previous recovery copy. Startup failures expose reload and tool-directory links.

Validation: 25 unit tests; build/type check; focused browser checks for numeric preservation, cancelled/failed/successful saves, fallback download warnings, incremental drafts, legacy recovery, interrupted transactions and startup failure. Existing workspace checks also run during this pass.
