---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Keep context-supplied props live in slotted components: `useContextProps` no longer copies a parent's context getters into fixed values, so a Label, Input or other slotted part follows its field after mount. Field, toggle, search and dialog-trigger internals no longer read signal-driven props once in a component body, which also ends their `STRICT_READ_UNTRACKED` reports.
