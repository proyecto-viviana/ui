---
id: 289
type: task
title: "Set autocomplete autocorrect spellcheck and enterKeyHint on the Autocomplete SearchField"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 autocomplete functional pass: RAC search input is autocomplete=off autocorrect=off spellcheck=false enterkeyhint=go; Solid omits all four",
    }
---

RAC Autocomplete puts `autoComplete="off"`, `autoCorrect="off"`,
`spellCheck="false"`, and `enterKeyHint="go"` on the composed SearchField
input (browser autofill, autocorrect, spellcheck, and the mobile enter
glyph). `createAutocomplete` already returns those on `inputProps`. Solid
`SearchFieldInput` only forwards `aria-controls`, `aria-autocomplete`, and
`aria-activedescendant` from Autocomplete context
(`packages/solidaria-components/src/SearchField.tsx` `autocompleteInputAttrs`).

RAC `Autocomplete.test` / `AriaAutocompleteTests` assert the four attributes
on the searchbox.

## Evidence

`http://127.0.0.1:4341/components/autocomplete/`, `data-islands-mounted`,
`input[type=search]` named "Search fruits":

| attr                | React          | Solid          |
| ------------------- | -------------- | -------------- |
| `autocomplete`      | `off`          | missing        |
| `autocorrect`       | `off`          | missing        |
| `spellcheck`        | `false`        | missing        |
| `enterkeyhint`      | `go`           | missing        |
| `aria-autocomplete` | `list`         | `list`         |
| `aria-controls`     | listbox Fruits | listbox Fruits |

Same at rest and after typing. `aria-autocomplete` / `aria-controls` already
match.

## Done when

The comparison Autocomplete search input carries the same four attributes as
RAC. A package or comparison test fails if Solid omits `autocomplete`,
`autocorrect`, `spellcheck`, or `enterkeyhint` while React has them.

## Relationship

Child of #24. Found by #260. Distinct from #288 (visible option filtering)
and from ComboBox `autocomplete=off` on the combobox input, which already
matches. Do not start #254.
