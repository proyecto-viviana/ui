---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-stately": patch
---

Focus overlay menus the way React Aria does: `createMenuTrigger` forwards `autoFocus`, `createMenu` focuses the menu after paint, and FocusScope re-collects children so contain/auto-focus still work when the overlay DOM lands after the first paint. Contain restore after `blur()` to body waits a frame, matching RAC `onBlur`, instead of pulling focus back on body `focusin`.
