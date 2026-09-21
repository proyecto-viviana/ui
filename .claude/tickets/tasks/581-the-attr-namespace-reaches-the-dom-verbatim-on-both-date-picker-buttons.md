---
id: 581
type: task
title: "The `attr:` namespace reaches the DOM verbatim on both date picker buttons, and it costs 44 certified rows"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "found by the conductor while grading the 169 from CI rather than from a local run, and filed before any fix because 44 certified rows should not close under a commit message alone. Receipt `.agents/certified-169-census-2026-09-21.md` at `eb109622`, from run 35554086311 on `1a98e250`; shard 106194832342 carries 132 `toHaveAttribute` failures, which is 44 rows times the three attempts each row gets, and its call log prints the element with the literal `attr:` inside the attribute name",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "taken by the close-gates writer immediately after #578's first cause landed at `d2f94530`. Handed over with three conditions: match the house idiom rather than making the namespace work, prove it by reverting the eight lines and showing the rows go red again, and grade `datepicker-motion` and `daterangepicker-motion` while in the file since the census leaves them ungraded and they are two rows each",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "eight props rewritten in the house idiom; `grep -rn 'attr:' packages/*/src/ apps/*/src/` now returns nothing. After `VIVIANA_GATE=1 vp run comparison:build`, `certified/datepicker certified/daterangepicker` reports 110 passed and 4 failed, and the 4 are exactly the D2 `open · open-enter` pair on each component - so all 44 D1/D3/D7/D9/D10 rows are green and the motion pairs do not ride along. They are graded and filed as #582: the style tables match upstream to the digit, the placement the popover resolves to does not. Mutation check, both halves rebuilt: reverted, `certified/datepicker.certified -g 'D1 state matrix'` is 4 passed / 6 failed; restored, the same slice is 10 passed / 0 failed. Unit guards added to both suites, and mutation-checked the same way - with the eight lines put back to `attr:` exactly 2 of 72 fail, both of them the new tests. `packages/solidaria-components/test/DatePicker.test.tsx` and `DateRangePicker.test.tsx` 72 passed; `vp run typecheck` clean",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`, finding `board-truth/581-merged-below-its-bar`, confirmed: this ticket is merged although its own Done-when demands zero failures and four remain. The skeptic narrowed it usefully - two of the four are #584's, not this ticket's. Related, and owned by #578: `578-census/attr-namespace-unguarded`, that nothing stops the `attr:` namespace from coming back, because the fix is two per-component assertions rather than a guard. Status not moved; the scheme has no edge back from `merged`, so this note is the record.",
    }
---

## The defect

`packages/solidaria-components/src/DatePicker.tsx:1068-1071` (DatePickerButton)
and `:1146-1149` (DateRangePickerButton) write eight props as:

```tsx
attr:data-focused={isFocused() ? "true" : undefined}
```

`attr:` is a Solid JSX namespace directive that is supposed to compile away and
leave `data-focused`. It does not here: it reaches the DOM as part of the
attribute _name_, so the rendered button carries `attr:data-focused="true"`.
Nothing selecting `data-focused` can match, and every certified driver that
waits on one of these four states times out.

The CI element, quoted from the shard's call log:

```
<button … attr:data-focused="true" … attr:data-focus-visible="true" …>
```

These are the only eight `attr:` props in the repository:
`grep -rn 'attr:' packages/*/src/ apps/*/src/` returns those lines and nothing
else.

## The repair

Match the siblings, do not make the namespace work. Every other component in
this package writes `data-focus-visible={dataAttr(isFocusVisible())}` —
DateField, Calendar, GridList, Slider, Switch, RadioGroup, Color, 34 sites for
`data-hovered` alone, not one of them prefixed. `dataAttr`
(`utils.tsx:442`) is `value ? "true" : undefined`, which is what these eight
ternaries already spell out by hand, and it is already imported in this file and
used two lines above each block.

One file, eight lines, no new concept.

## Work

1. Rewrite the eight props in the house idiom.
2. Re-run `certified/datepicker` and `certified/daterangepicker` — 44 rows.
3. Mutation-check it: revert the eight lines, re-run a slice, and show the rows
   go red again. An eight-line change that turns 44 rows green is exactly the
   result that deserves proof it was the change that did it.
4. Grade `datepicker-motion` and `daterangepicker-motion`, two rows each, which
   the census leaves ungraded. Say whether they ride along or are their own
   cause; do not assume.

## Done when

`certified/datepicker` and `certified/daterangepicker` report zero failures, the
mutation check is recorded, and the two motion pairs are graded either way.

## Relationship

Child of #544. Second cause of #578, which is the ticket holding the 169 and the
release bar; #578 stays open and this closes 44 of its rows. Sibling of #578's
first cause (the toast view transition, `d2f94530`) and of the combobox
regression the census names next, which is #497 red again at `b33a0a74`.
