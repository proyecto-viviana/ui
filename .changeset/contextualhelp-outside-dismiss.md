---
"@proyecto-viviana/solidaria-components": patch
---

Close ContextualHelpTrigger on outside interaction. The jsx-preserving build had DCE'd the document mousedown handler because `let` refs look unassigned; dismiss now uses signal refs and createInteractOutside.
