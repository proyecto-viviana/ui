---
"@proyecto-viviana/solidaria": patch
---

`createPress` opens a link the way `usePress` does. It passes `false` for `openLink`'s `setOpening`, so a collection item's click guard (`if (!openLink.isOpening) e.preventDefault()`) suppresses the click the press path dispatched: Space on a role-overridden `<a href>` in a selectable collection now navigates once instead of twice. `onClick` gains upstream's matching `!openLink.isOpening` re-entry guard, and the "link already opened" mark moves off the element plus a `setTimeout` onto the keyup event itself, so a second activation of the same link inside the old window opens it instead of doing nothing.
