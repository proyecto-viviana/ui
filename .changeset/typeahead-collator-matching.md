---
"@proyecto-viviana/solidaria": patch
---

createTypeSelect: match search text with a locale-aware collator

Type-to-select now compares the leading characters of each item against the
search string with an `Intl.Collator` (`usage: 'search'`, `sensitivity: 'base'`),
mirroring React Aria's `ListKeyboardDelegate.getKeyForSearch`. This makes
matching case- and diacritic-insensitive in a locale-aware way — for example,
typing an unaccented `e` now matches an item labelled "Éclair". Previously the
search used `textValue.toLowerCase().startsWith(...)`, which only handled ASCII
case folding and missed accented characters.
