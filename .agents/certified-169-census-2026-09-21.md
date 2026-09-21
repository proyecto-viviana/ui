# The 169 certified reds, graded from CI

Source: `Certification Gates` run
[35554086311](https://github.com/proyecto-viviana/ui/actions/runs/35554086311)
on `1a98e250`, job `certified report` (106198411498) and the eight `certified`
shards. Read on 2026-09-21. Nothing here was fixed by this seat; the seat is
the conductor and this is evidence handed to the writer.

Totals, quoted from the merge job: **2004 passed, 169 failed, 4 skipped, 0
waived, 0 flaky**. That is the same 169 the writer measured on WSL, so the
failure set is not environment-specific and nothing here is a compositor
artifact. All eight shards completed; they are `continue-on-error`, so the
merge job is the only one carrying signal, and it is the job that fails.

Each row is attempted three times, so a shard's raw error count is 3x its row
count. That arithmetic is what ties each shard to its components below.

## Census

| component              | rows | cause                              |
| ---------------------- | ---- | ---------------------------------- |
| toast                  | 25   | #578 — found, fix in flight        |
| toast-icon             | 12   | #578 — same defect                 |
| datepicker             | 22   | `attr:` leak — found, unticketed   |
| daterangepicker        | 22   | `attr:` leak — same defect         |
| combobox-list          | 22   | **#497 regressed** — found         |
| picker-list            | 21   | own defect — ungraded              |
| popover-surface        | 13   | ungraded                           |
| form                   | 12   | ungraded                           |
| calendar               | 6    | ungraded                           |
| rangecalendar          | 5    | ungraded                           |
| picker-trigger         | 2    | ungraded                           |
| daterangepicker-motion | 2    | ungraded                           |
| datepicker-motion      | 2    | ungraded                           |
| togglebutton           | 1    | ungraded                           |
| togglebuttongroup      | 1    | ungraded                           |
| tabs                   | 1    | ungraded                           |

169 total, of which **103 now have a named cause and a named fix**: 37 toast,
44 date, 22 combobox. Drivers are uniform per component — D1 and D3 fail across
the whole size x scheme matrix rather than scattering, which is what a
whole-surface or whole-token miss looks like and what per-cell drift does not.

## toast, 37 rows — #578, confirmed in CI

Shard 106194832323 carries 111 identical errors, `getByRole('alertdialog')` …
`Error: element(s) not found`. 111 is 37 rows times three attempts, exactly, so
the shard is fully explained by this one defect. The region never renders, on
GitHub's runners, which settles the question of whether #578 was a WSL
artifact: it is not.

## date family, 44 rows — a Solid 2 `attr:` namespace leak

Shard 106194832342 carries 132 `toHaveAttribute` failures — 44 rows times three
— and the call log prints the element it gave up on:

```
<button … attr:data-focused="true" … attr:data-focus-visible="true" …>
```

The literal string `attr:` is part of the attribute *name*. `attr:` is a Solid
JSX namespace directive that is supposed to compile away and leave
`data-focused`; here it reaches the DOM verbatim, so no selector matching
`data-focused` can ever match, and the driver times out.

There are exactly eight such props in the entire repository, all in one file,
`packages/solidaria-components/src/DatePicker.tsx:1068-1071` and `:1146-1149`:

```tsx
attr:data-focused={isFocused() ? "true" : undefined}
```

Every sibling writes the house idiom instead — `data-focused={dataAttr(isFocused())}`
in Slider, Switch, RadioGroup and Color, 34 sites for `data-hovered` alone, and
none of them prefixed. So the repair is to match the siblings, not to make the
namespace work: eight lines, one file, no new concept. It is unticketed.

## combobox-list, 22 rows — #497 regressed at `b33a0a74`

#497 closed `merged` on 2026-09-07. Its body records the divergence as React
`rgb(39, 77, 234)` vs Solid `rgb(59, 99, 251)` light, React `rgb(105, 149, 254)`
vs Solid `rgb(86, 129, 255)` dark, and D7 contrast 14.21 vs 11.13 light and
11.45 vs 9.26 dark. Shard 106194832417 reports those same four pairs today, 126
occurrences of each colour, under the same inner label
`default · checkmarkSelected`. Same numbers, same label, ticket marked merged:
the board disagrees with the tree.

It is not token drift, which is worth writing down because that is the
expensive hypothesis to chase. Our mapping is byte-identical to upstream —
`accent: colorToken('accent-content-color-default')` at
`packages/solid-spectrum/src/style/spectrum-theme.ts:834` and
`@react-spectrum/s2@1.7.0/style/spectrum-theme.ts:743` — and the value we paint
is exactly what the pinned `@adobe/spectrum-tokens@14.15.0` gives for that
token. #240 is not implicated.

What React paints is `accent-color-1000`, reached through
`accent-content-color-key-focus`. Upstream's checkmark is `color: baseColor('accent')`
(`s2/src/Menu.tsx:262`) and so is ours, so the divergence is which state the row
is in, not which token it names: React's pointer-opened row keeps
`data-focus-visible` and selects the key-focus stop; ours does not.

Picker still carries both halves of #497's fix — the checkmark's `isFocused:
baseColor("accent").isFocusVisible` at
`packages/solid-spectrum/src/picker/index.tsx:489`, and `isFocusVisible:
renderProps.isFocused || renderProps.isFocusVisible` at `:1178`. ComboBox has
neither. `b33a0a74` (2026-09-15, "combobox: match RAC keyboard, first-open
announce, and field paint") replaced the second with

```ts
const isFocusVisible = () => isFocused() && isFocusVisibleModality();
```

at `packages/solid-spectrum/src/combobox/index.tsx:672`. On a pointer-open the
modality is false, the attribute is dropped, and the checkmark falls back to the
default stop. `git log -S isFocusVisibleModality` names that commit and no
other. Picker is the control that makes this readable: same suite, same driver,
fix intact, failing for an unrelated reason.

## picker-list, 21 rows — a different defect

Shard 106194832358 fails on part `target`, not `checkmarkSelected`, and no
accent colour appears in its diffs. The values are `rgb(34, 34, 34)` expected
against `rgb(255, 255, 255)` received, three widths short by exactly 16px each
(112 to 96, 88 to 72, 136 to 120), and one attribute present upstream and empty
here. A uniform 16px is a missing grid column, not a paint miss. Ungraded; it
needs its own probe and its own ticket.

## Still ungraded, 45 rows

popover-surface 13, form 12 (shard 106194832288, all part `target`), calendar 6
(shard 106194832320), rangecalendar 5 (shard 106194832345), picker-trigger 2,
the two motion pairs, and the three singles. The D1+D3 uniformity above says to
expect few causes rather than many.

## What this changes

#578 takes 169 to 132. The eight `attr:` lines take it to 88. #497's revert
takes it to 66. None of those three is a large change, and two of them are
restoring an idiom that already exists elsewhere in the same repository.
