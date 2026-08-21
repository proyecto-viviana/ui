---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Add the exact upstream Adobe license header and source path to each reviewed
Solid port. Keep the applicable Microsoft Tabster notice for the shadow-tree
port. Remove three unused Solidaria state copies; the public exports already
use the implementations from Solid Stately.

Record exact S2 and flags source paths, and replace their local Adobe blocks
with the exact headers from the pinned upstream files.

Preserve exact source headers in styled-package runtime bundles and
declaration-only outputs.

Replace four ambiguous source notes with exact primary paths, and apply their
upstream Adobe headers.

Classify the remaining styled-package source markers as four exact source
adaptations and two guarded Toast composites.
