---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Own Popover enter/exit animation in the headless Popover as RAC does (`data-entering` / `data-exiting`, mount until exit `getAnimations().finished`), drive S2 opacity/translate from those render props, and delete the ActionMenu timers and DatePicker duplicate animation machines.
