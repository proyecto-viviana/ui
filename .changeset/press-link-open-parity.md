---
"@proyecto-viviana/solidaria": patch
---

`createPress` opens a link the way `usePress` does. It passes `false` for `openLink`'s `setOpening`, so a collection item's click guard (`if (!openLink.isOpening) e.preventDefault()`) suppresses the click the press path dispatched: Space on a role-overridden `<a href>` in a selectable collection now navigates once instead of twice under `linkBehavior: "selection"`. `onClick` gains upstream's matching `!openLink.isOpening` re-entry guard, and the "link already opened" mark moves off the element plus a `setTimeout` onto the keyup event itself, so a second activation of the same link inside the old window opens it instead of doing nothing.

The same `false` is on the shared keyup path, so it also changes the other link behaviors: under `linkBehavior: "override"` and `"action"`, Space on a role-overridden `<a href>` no longer navigates at all — it selects, and Enter navigates. That is what react-aria 3.52.0 does (`useSelectableItem` returns early from `onSelect` for `"override"` and only treats Enter as an action key), and `"override"` is a listbox's default whenever `selectionBehavior` is `"toggle"`, so most collections are in it. If you relied on Space navigating there, bind Enter.
