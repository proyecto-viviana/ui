---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria-components": patch
---

Report one Picker choice once. Scalar onChange and onSelectionChange share one changed-request decision, including a later retry while a controlled value stays refused. A listbox option click selects through press handling only, in single and multiple mode, and does not queue a second request.
