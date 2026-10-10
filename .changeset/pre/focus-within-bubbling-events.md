---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Route createFocusWithin through bubbling onFocusIn and onFocusOut events so descendant focus reaches the focus-within container matching React synthetic event bubbling parity, remove createOverlay's invented document-level focusin close listener, and preserve grouped ToggleButton item id semantics without leaking selection keys as DOM ids.
