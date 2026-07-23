---
"@proyecto-viviana/solid-stately": minor
---

Derive item text from the conventional display fields, and let a ComboBox with a
selection be typed in again.

`createListState` and `createListCollection` fell back to `String(item)`, which
is right for a primitive item but yields `[object Object]` for a plain one — it
surfaced verbatim in a ComboBox/Picker input for `{ id, name }`-shaped items.
They now read `textValue`/`label`/`name`/`title` and fall back to the item's key.
`name` and `title` join `CollectionItemLike`.

The effect syncing a ComboBox's input to its selection read `inputValue()`
inline, which in Solid subscribes the effect to the input signal: it re-ran on
every keystroke and, while any selection was active, reset the field back to the
selected item's text — the user could neither type nor delete. The comparison is
unchanged; the read is now untracked.
