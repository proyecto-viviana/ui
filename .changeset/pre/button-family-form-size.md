---
"@proyecto-viviana/solid-spectrum": patch
---

Button, ActionButton, ToggleButton and LinkButton take their size (and the other Form props) from an enclosing `Form`. The size default no longer hides the Form's value, and ActionButton, ToggleButton and LinkButton now read the Form at all, as upstream does.
