---
"@proyecto-viviana/solidaria": patch
---

`FocusScope`: make focus containment descendant-scope aware

A modal `FocusScope` (`contain`) used to pull focus back whenever it landed on
an element outside its DOM subtree — including a nested overlay (e.g. a menu
opened from inside a modal popover) rendered in a portal. That yank tore the
nested overlay down before it could render, so a menu only opened cleanly inside
a *non-modal* outer popover.

Mirror `@react-aria/focus`'s `focusScopeTree`: each `FocusScope` now registers
itself in a parent/child tree keyed by its scope-elements accessor, with the
parent resolved through context (which Solid propagates across portals). The
containment `focusin` handler consults `isElementInChildScope`, so focus moving
into a portaled descendant scope is treated as "inside" and left in place
instead of being restored. Containment of true escapes (focus leaving to an
unrelated element) is unchanged. The tree's `activeScope`/`shouldContainFocus`
arbitration between multiple nested *contained* scopes and tree-aware focus
restoration remain unported (not needed for this case).
