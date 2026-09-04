---
id: 289
type: task
title: "Set autocomplete autocorrect spellcheck and enterKeyHint on the Autocomplete SearchField"
created: 2026-09-03
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 autocomplete functional pass: RAC search input is autocomplete=off autocorrect=off spellcheck=false enterkeyhint=go; Solid omits all four",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "SearchFieldInput autocompleteInputAttrs copies ARIA only; createAutocomplete already returns the four native attrs",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "SearchFieldInput last-wins autoComplete/autoCorrect/spellCheck/enterKeyHint over SearchField undefined getters. Fruits searchbox test fails if any of the four is omitted while ARIA still matches.",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at e966ba50; SearchFieldInput last-wins four native attrs. Tester 15/15.",
    }
---

RAC Autocomplete puts `autoComplete="off"`, `autoCorrect="off"`,
`spellCheck="false"`, and `enterKeyHint="go"` on the composed SearchField
input (browser autofill, autocorrect, spellcheck, and the mobile enter
glyph). `createAutocomplete` already returns those on `inputProps`. Solid
`SearchFieldInput` now last-wins the four native attrs from Autocomplete
context after SearchField's createTextField getters
(`packages/solidaria-components/src/SearchField.tsx` `autocompleteInputAttrs`
inside `mergedInputProps`). Do not re-emit them in the hook.

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

Local (2026-09-04), cwd `/home/emoporemilio/projects/viviana-hub/ui`,
parent `ff02dc06`. Source: `autocompleteInputAttrs` copies the four native
attrs and spreads last in `mergedInputProps` so SearchField getters at
`:412:428` (`undefined`) cannot wipe them. Named SearchField+ListBox fruits
test failed on missing `autocomplete` while ARIA still matched. After
last-win:

`vp test run packages/solidaria-components/test/Autocomplete.test.tsx`
PASS (15): searchbox `autocomplete=off` `autocorrect=off` `spellcheck=false`
`enterkeyhint=go` at rest and after typing `a`; ARIA still matches. Stub
`TestList` filter stayed green. #288 unmount fruits stayed green.

Owned-file `vp check` PASS. `git diff --check` PASS on named paths.
Repo-wide `vp run check` not run. Comparison walk not run. #86 / #427 /
#428 not started.

## Done when

The comparison Autocomplete search input carries the same four attributes as
RAC. A package or comparison test fails if Solid omits `autocomplete`,
`autocorrect`, `spellcheck`, or `enterkeyhint` while React has them.

## Relationship

Child of #24. Found by #260. Distinct from #288 (visible option filtering)
and from ComboBox `autocomplete=off` on the combobox input, which already
matches. Do not start #254.
