---
"@proyecto-viviana/solidaria": patch
---

createTypeSelect: search starts at the focused key and allows Alt

Type-to-select now mirrors React Aria's `useTypeSelect` /
`ListKeyboardDelegate.getKeyForSearch`. The search begins *at* the currently
focused item (inclusive) and scans to the end with no internal wrap; when
nothing at or after the focus matches, it retries from the top. Previously the
search started at the item *after* the focus and wrapped internally, so typing a
prefix the focused item already matched would skip past it to a later match
(e.g. typing "F" while "Foo" was focused jumped to a subsequent "Foo Bar").

The keydown guard no longer blocks `altKey`, matching upstream — AltGr produces
printable characters on many keyboard layouts, so those keystrokes now reach the
search. `ctrlKey` and `metaKey` combinations remain ignored.
