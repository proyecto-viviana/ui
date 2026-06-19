---
"@proyecto-viviana/solidaria": patch
---

Autocomplete: treat IME composition input as forward typing

`createAutocomplete` now reads the input type from a `beforeinput` listener
(set before the input's `onChange` runs) and treats `insertCompositionText`
and `insertFromComposition` like `insertText`, so the first item still gains
virtual focus while composing CJK/IME text. Previously composition input fell
into the clear branch, dropping virtual focus mid-composition. Mirrors
`@react-aria/autocomplete` `useAutocomplete`.
