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
| picker-list            | 21   | list box 16px short — found        |
| popover-surface        | 13   | dark `light-dark()` leak — found   |
| form                   | 12   | Button drops Form size — found     |
| calendar               | 6    | dark paint, one cause — narrowed   |
| rangecalendar          | 5    | dark paint, same cause — narrowed  |
| picker-trigger         | 2    | ungraded                           |
| daterangepicker-motion | 2    | #582 — placement at capture        |
| datepicker-motion      | 2    | #582 — same defect                 |
| togglebutton           | 1    | ungraded                           |
| togglebuttongroup      | 1    | ungraded                           |
| tabs                   | 1    | ungraded                           |

169 total, of which **153 now have a named cause**, and **140 a named fix**:
37 toast, 44 date, 22 combobox, 21 picker-list, 13 popover-surface, 12 form,
4 date-picker motion, plus calendar's 11 narrowed to one shared dark-mode cause
but not yet to a line. Five rows are still ungraded. Drivers are uniform per
component — D1 and D3 fail
across the whole size x scheme matrix rather than scattering, which is what a
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

## picker-list, 21 rows — the list box is 16px short, every size, both schemes

Correcting an earlier reading of this shard: there is no colour in it. Every
failing row carries exactly one differing property, `height`, on part `target`:

```
-   "height": "88px"     +   "height": "72px"      size-s
-   "height": "112px"    +   "height": "96px"      size-m
-   "height": "136px"    +   "height": "120px"     size-l
```

A constant 16px at every size, identical in light and dark, is one missing
fixed block, not a size-driven token. `padding-top` and `padding-bottom` are in
the D1 allowlist and do **not** appear in any diff, so the 16px is not the
list box's own padding going missing — it is 16px of content or child margin
that upstream renders and we do not. The 21 rows are D1 6 + D3 6 + D9 6 (the
forced-colors re-run of the same capture) + D10 2 (RTL) + D8 1, so every one of
them is downstream of this single measurement. It needs a probe and a ticket.

## popover-surface, 13 rows — the dark `light-dark()` leak, again

All 13 rows are `dark`. Not one light row fails. The D1 diff is two properties:

```
-   "background-color": "rgb(34, 34, 34)"     +   "rgb(255, 255, 255)"
-   "outline-color": "rgb(50, 50, 50)"        +   "rgba(255, 255, 255, 0)"
```

We paint the **light** branch of a `light-dark()` fill on a surface the page has
put in dark. This is the known portal landmine: a portaled overlay resolves
`light-dark()` against the portal root, which carries no `color-scheme`, so the
downlevelled value falls back to light. The fix is the one already applied
elsewhere for this exact failure — set the colour scheme on the portal root —
not a new token.

## form, 12 rows — Button never inherits the Form's size

Shard 106194832288, all part `target`, all twelve rows one property pair. The
`<form>` grid is two rows: the TextField, then the submit `<button>`. Row 1
matches React exactly at every size. Row 2 does not:

| size | react row 2 | ours | form height react / ours |
| ---- | ----------- | ---- | ------------------------ |
| S    | 24px        | 32px | 108 / 116                |
| L    | 40px        | 32px | 172 / 164                |
| XL   | 48px        | 32px | 206 / 190                |

24 / 32 / 40 / 48 is the S2 button height ramp, and ours is pinned to the medium
stop at every size. `size-m` is the one size that passes, which is the tell.

The cause is prop-merge order in `packages/solid-spectrum/src/button/Button.tsx`.
`useFormProps` is a proxy that fills in only properties whose local value is
`undefined`. At `:63` the split of the context-merged props keeps six booleans
and drops `size`; at `:72-76` a `defaultProps` literal sets `size: "M"`; at
`:78` `useFormProps` is applied to the merge of that literal with the runtime
props. By then `size` is already defined, so the Form's context value can never
win. Upstream does it the other way round — `props = useFormProps(props)` at
`@react-spectrum/s2@1.7.0/src/Button.tsx:415`, then `size = 'M'` as a
destructuring default at `:417` — so context beats the default there and loses
here.

Two neighbours to check in the same pass, because this is a family and not one
file: upstream calls `useFormProps` in `ActionButton.tsx` and `ToggleButton.tsx`
and ours calls it in neither, and upstream's `LinkButton` (same file, `:540`)
calls it while our separate `LinkButton.tsx` does not. `ActionButton.tsx:136`,
`ToggleButton.tsx:131` and `LinkButton.tsx:87` each carry the same `size: "M"`
literal. Form's cert is the only unit that would ever have caught this, which is
why one ticket should cover all four.

## calendar 11 rows — one dark-mode paint cause, not yet a line

calendar 6 and rangecalendar 5, every row `dark`, every row D3 pixel and never
D1. The shared cause is visible in the numbers rather than inferred:
`calendar · default · dark` and `rangecalendar · disabled · dark` report the
identical mismatch, `0.03425179211469534` — 3058 of 89280 pixels — to the last
digit. Two different components, two different cases, the same pixel count is
one rendered difference, not two. The selected / invalid / unavailable cases run
higher (5.5% to 7.9%) because the selection fill adds area on top of it.

D1 passing while D3 fails means the difference is outside the captured parts.
The cert's own header says why that is possible: its D1 target is the day-3 cell
and the grid, and "the day-3 D1 target cannot see the header or the aria-hidden
strike", while D3 crops the whole root. Given popover-surface above, a dark
`light-dark()` branch is the first thing to rule in or out. Settling it needs
the two attached PNGs, which is a local step, not a log-reading one.

## date-picker motion, 4 rows — #582, and they do not ride along

This section replaces a guess. The census first left these four ungraded and
suggested they might come green with the `attr:` fix. They did not, and the
writer settled it while closing #581: with all 44 D1/D3/D7/D9/D10 date rows
green, `certified/datepicker certified/daterangepicker` reports 110 passed and 4
failed, and the 4 are exactly `D2 motion — DatePicker motion › open · open-enter`,
its reduced-motion twin, and the two DateRangePicker equivalents.

The cause is not the keyframe table. `packages/solid-spectrum/src/popover/index.tsx:118-130`
and `@react-spectrum/s2@1.7.0/src/Popover.tsx:123-132` agree to the digit —
`top` enters at `4`, `bottom` at `-4`. Ours records `0px -4px` and React's
`0px 4px`, so the two sides disagree about which placement the popover is in
when the driver captures, not about what that placement animates to. Filed as
**#582**.

## Still ungraded, 5 rows

picker-trigger 2 (D13 journeys), togglebutton 1 and togglebuttongroup 1 (D2
motion reduced, `hover-transition`), tabs 1 (D4 `arrow-next-from-selected`).
Their shard logs were not pulled.

## What this changes

Five fixes account for 127 of the 169, and none of them is large:

| fix                                          | rows | leaves |
| -------------------------------------------- | ---- | ------ |
| #578, landed — the toast view transition      | 37   | 132    |
| the eight `attr:` lines in `DatePicker.tsx`   | 44   | 88     |
| #497's `isFocusVisible` revert in ComboBox    | 22   | 66     |
| the popover portal root's colour scheme       | 13   | 53     |
| Button's prop-merge order (and its three kin) | 12   | 41     |

The 41 left are picker-list's 16px, calendar's dark paint, #582's four motion
rows, and the five still ungraded. Three of the five fixes restore an idiom or an
upstream ordering that already exists elsewhere in this repository.

Two of the five are landed as of 2026-09-21. #578 is in `d2f94530`. The `attr:`
lines are #581, proved locally by the writer — 110 passed and 4 failed on
`certified/datepicker certified/daterangepicker`, mutation-checked both ways, the
4 being #582. That is **169 → 88** on the writer's bench; CI has not yet run a
revision carrying both.

## CI has now read the 132 — run 35556441049, `eb109622`

The first row of the table above stops being a prediction. Certification Gates
run `35556441049` finished 2026-09-21 03:34Z on `eb109622`, which carries #578
and not #581, and its `certified report` job says:

> Totals: **2041 passed**, **132 failed**, **4 skipped**, **0 waived**, **1 flaky**.

132, exactly. And not merely in the total — component for component, across 14
components, the roster is the census minus toast:

| rows | component | drivers | owner |
| --- | --- | --- | --- |
| 22 | `datepicker` | D1 6, D3 6, D7 4, D9 6 | #581, landed in `eb75ee0e` |
| 22 | `daterangepicker` | D1 6, D3 6, D7 4, D9 6 | #581, landed in `eb75ee0e` |
| 22 | `combobox-list` | D1 6, D3 6, D7 2, D9 6, D10 2 | #497, reopened |
| 21 | `picker-list` | D1 6, D3 6, D8 1, D9 6, D10 2 | unticketed, the 16px list box |
| 13 | `popover-surface` | D1 6, D3 6, D7 1 | writer's queue, the dark portal root |
| 12 | `form` | D1 6, D3 6 | writer's queue, Button's prop-merge order |
| 6 | `calendar` | D3 6 | ungraded, one shared dark paint |
| 5 | `rangecalendar` | D3 5 | ungraded, the same |
| 2 + 2 | `datepicker-motion`, `daterangepicker-motion` | D2 | #582 |
| 2 | `picker-trigger` | D13 | ungraded |
| 1 | `tabs` | D4 | ungraded |
| 1 + 1 | `togglebutton`, `togglebuttongroup` | D2 | ungraded |

44 of those 132 are the date family's `attr:` rows, and `eb75ee0e` removes them.
**132 → 88** is therefore the number CI should print on the next push, and that
is the first honest reading of the suite this campaign will have produced.

### The report job is not fail-open, and that matters

Worth stating plainly, because the shape invites the opposite reading. The eight
`certified (n/8)` shard jobs carry `continue-on-error: true` and all eight
reported `success` while 132 cases failed underneath them. The job that carries
the signal is `certified report`, and it failed. It exits 1 on
`shardProblems || budgetProblems || waiverGateFails`
(`merge-certified-reports.ts:181-186`), and `waiverGateFails` is true whenever
anything is unwaived at all (`certified-waivers.ts:270`). So the 132 do fail the
gate. They are listed, by case, under `### Unwaived failures`.

The consequence for the release path is the hard one: `release.yml` runs on
`workflow_run` of Certification Gates with `if: conclusion == 'success'`, so
**Release stays dormant until this roster is empty**. The owner's decision of
2026-09-20 was recorded evidence, not waivers, which means the 132 go to 0 by
being fixed. There is no shorter road, and `0 waived` says nobody has tried to
take one.

### One flaky case fails the gate too, and nothing names it

The run reported a second, independent reason for its exit code:

> over-flaky: 1 cases passed only on a retry, budget 0

That is #194 slice 3 working as designed, and it will still be there the day the
132 reach zero. But the report cannot say which case it was. `checkRunBudgets`
is handed totals only (`certified-summary.ts:436-440`), and the component ×
driver table has no Flaky column — its header is Passed, Failed, Skipped,
Waived, while the flaky count is summed at `:286` and printed once, in the
totals line at `:325`. So a gate that fails on flakiness names neither the case
nor even the cell it sits in, and the fixer's only route to it is the uploaded
HTML report. A Flaky column is the whole fix. #194 owns it.

## Three of the ungraded rows, graded from the shard logs

The census projected 132 → 88 and named fourteen components. Three of the rows
it left ungraded are graded here, from the shard logs of run 35556441049, so the
next writer inherits a cause rather than a count.

### togglebutton D2 1 + togglebuttongroup D2 1 — a reduced-motion rule we invented

`D2 motion (reduced) — ToggleButton › default · hover-transition`, shard 8.
The driver's assertion is bare pair equality —
`expect(JSON.stringify(snaps.solid)).toBe(JSON.stringify(snaps.react))` at
`apps/comparison/e2e/drivers/motion.ts:207` — so received is ours and expected
is upstream. Upstream records two 150ms transitions under
`prefers-reduced-motion: reduce`, `background-color` and `color`, easing
`cubic-bezier(0.45, 0, 0.4, 1)`. We record `[]`. The unreduced variant of the
same case passes, so the divergence exists only under the media query: we kill
a hover colour transition that S2 keeps.

It is ours, and it is invented. `@react-spectrum/s2@1.7.0/src/ActionButton.tsx:141`
is a plain `transition: 'default',` with no media branch, and `Button.tsx:116`
is the same. Ours are
`packages/solid-spectrum/src/button/s2-action-button-styles.ts:112-113` and
`packages/solid-spectrum/src/button/s2-button-styles.ts:57-58`, both

    transition: { default: "default", "@media (prefers-reduced-motion: reduce)": "none" }

`ToggleButton.tsx:13` imports `btnStyles` from `./ActionButton`, which is why
the roster lands the rows on togglebutton rather than on button.

The pattern itself is not wrong everywhere — the other four sites are faithful
and should not be touched: `disclosure/index.tsx:358` ↔ `Disclosure.tsx:357`,
`tabs/index.tsx:389` ↔ `Tabs.tsx:375`, `segmentedcontrol/index.tsx:165` ↔
`SegmentedControl.tsx:131`, and the two runtime ones, `skeleton/index.tsx:95` ↔
`Skeleton.tsx:34` and `toast/index.tsx:871` ↔ `Toast.tsx:410`. Upstream applies
it to moving indicators and chevrons, never to a control surface. Someone
carried it one element too far. Deleting the two branches is the fix.

### picker-trigger D13 2 — the trigger's state attributes are on the wrong element

`D13 journeys — Picker trigger`, shard 5, both cases, failing at step 0 of the
journey — `click trigger`, field `dom`. Two halves of one defect, and the file
already contains both idioms.

On the `<button>`, ours carries `data-focused: "true"` and `data-open: "true"`;
upstream carries `data: {}`. On the root `<div>`, ours carries `data-focused: ""`
and `data-open: ""`; upstream carries `"true"` and `"true"`.

RAC puts these on the root only — `react-aria-components/src/Select.tsx:284`,
`data-open={state.isOpen || undefined}`, and there is no other `data-open` in
the file. So `data-open` on our trigger button is an attribute upstream does not
render at all, and `data-focused` surviving on it after the click says our focus
tracking does not clear the trigger when focus moves into the listbox.

The empty strings are the second half. `packages/solidaria-components/src/Select.tsx:776-782`
builds the root props with raw booleans — `"data-focused": isFocused() || undefined`
— and a boolean spread onto an element writes `""`, where React writes `"true"`.
Forty lines down, `:943-947` does it correctly with the helper this repository
already has, `dataAttr` at `utils.tsx:442`, typed `"true" | undefined`. One file,
two idioms, and the wrong one is on the element the oracle reads.

### tabs D4 1 — the roving tabindex flips one event late

Graded earlier from shard 7: `arrow-next-from-selected` records `"Overview"` at
`tabindex: "0"` where upstream has `-1`, and `"Parity"` at `-1` where upstream
has `0`. The move is registered, the tabindex is not yet.

### calendar D3 6 + rangecalendar D3 5 — dark only, whole grid, and D1 does not see it

Shard 1, all eleven rows. Every failing case is `· dark`; not one `· light`
case fails, in either component. The cases are Calendar default, selected,
unavailable, invalid, multimonth, disabled and RangeCalendar default,
unavailable, invalid, multimonth, disabled — which is to say every case the
scenario has, so nothing about the individual states is implicated.

The reading is the same in all eleven:

> calendar · default · dark · default screenshot mismatch ratio 0.03425179211469534
> exceeded 0 (3058/89280 pixels, bounds {"left":39,"top":41,"right":248,"bottom":267})

3.4% of pixels, spread over bounds that are the whole month grid rather than a
corner of it. `maxMismatchRatio` for this scenario is 0, so any difference at
all fails; the size says it is not a stray pixel.

The useful half is what is *not* failing. D1 state matrix passes for both
components in the same shard, on the same cases, in dark. D1 samples computed
styles, so whatever differs is something it does not read: anti-aliasing, a
gradient or shadow, a sub-pixel border, or an element outside its selector set
such as a today marker or a cell pseudo-element. A token value would have taken
D1 down with it, and did not.

That makes this unlike popover-surface's 13, which is also dark-only but shows
up in D1 as `background-color` `rgb(34,34,34)` against `rgb(255,255,255)`. These
two are not the same defect and should not be filed together. Settling them
needs the two attached PNGs from the run artifacts, not more log reading.

Nothing in the roster is ungraded after this.
