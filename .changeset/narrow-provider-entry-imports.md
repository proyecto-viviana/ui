---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Import the narrow solidaria subpaths from the Provider, ProgressBar and
ProgressCircle sources instead of the `@proyecto-viviana/solidaria` root barrel.
An app that rendered only a `Provider` resolved the entire primitive surface
(90 solidaria modules) before rendering a single primitive; it now resolves 17.
No public API changes. `guard:entry-import-budget` holds the new ceilings.
