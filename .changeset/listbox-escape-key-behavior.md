---
"@proyecto-viviana/solidaria": patch
---

`createListBox`: add the `escapeKeyBehavior` prop

Mirror `useSelectableCollection`'s `escapeKeyBehavior: 'clearSelection' | 'none'`
(default `'clearSelection'`). The Escape handler previously hard-coded the
clear-selection path; it now only clears (and swallows the event) when
`escapeKeyBehavior` is `'clearSelection'`. Setting `'none'` opts out so Escape
neither clears the selection nor stops propagation — for when Escape is handled
externally or shouldn't clear selection contextually. The headless `ListBox`
component already forwards the prop to the hook via its props rest-spread.
