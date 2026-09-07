---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Own compound Button and ActionButton pending props before interaction handlers
run. A compound `isPending={a() && b()}` compiles to a prop getter that creates
a memo on every read, so resolving it from a native press or hover handler
created that computation with no owner: Solid warned and never disposed it.
