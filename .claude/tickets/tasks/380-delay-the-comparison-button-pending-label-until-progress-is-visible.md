---
id: 380
type: task
title: "Delay the comparison Button pending label until progress is visible"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 button functional pass: ?isPending=true and live isPending hide the Solid label and drop AX name Save immediately, while React keeps Save visible/named until the 1s spinner. Solid fixture applies s2ButtonText({ isProgressVisible: props.isPending }); React passes a string / Spectrum Text so S2 TextContext waits for isProgressVisible. Spinner delay matches when both start together. ActionButton fixture already uses SolidSpectrumText / raw string",
    }
---

S2 pending buttons keep the label (and accessible name) for 1s, then
swap it for the indeterminate spinner. The Solid comparison Button
fixture hides the label as soon as `isPending` is true.

`apps/comparison/src/components/solid/fixtures/styled/button.tsx`
wraps children in a `<span class={s2ButtonText({ isProgressVisible:
props.isPending })}>`. That class is the delayed-progress token, but
the fixture feeds it `isPending` instead of `isProgressVisible`.
React passes a string (default) or `SpectrumText` (icon start), so
S2 `TextContext` waits for the 1000 ms `usePendingState` flag.

The styled Solid Button already delays string children in
`ResolvedContent` via `createPendingState`. This route never hits
that path because the fixture always supplies a pre-classed span.
ActionButton already does the right thing: raw string for `none`,
`SolidSpectrumText` for `start`.

## Evidence

`http://127.0.0.1:4341/components/button/?isPending=true`, islands
mounted. Isolated remount and live `comparison:controls-change`
`isPending=true` after both panels are ready:

| t | React | Solid |
|---|---|---|
| 0 ms | text Save vis visible, AX `button "Save" [disabled]`, spinner hidden, bg `rgb(41, 41, 41)` | text vis hidden, innerText empty, AX `button [disabled]`, spinner hidden, same bg |
| 200 ms (URL remount) | still Save, spinner hidden | spinner visible (Solid island started the 1s timer earlier; not a delay-length bug) |
| 1150 ms live | both spinner 18×18 vis visible, label hidden, AX `button [disabled]` + `progressbar "pending"`, bg `rgb(233, 233, 233)` | same |

`?iconPlacement=only&isPending=true` keeps `aria-label=Save` on both
at t0 and t1150 (no fixture text span). Press is suppressed on both
(`actionCount` stays 0, no `onPress*` callbacks) while pending.

## Done when

The Solid Button fixture composes children the way the React fixture
and the ActionButton Solid fixture do: string children for
`iconPlacement=none`, `Text` for `start`. A pending walk on
`/components/button/?isPending=true` keeps AX `button "Save"
[disabled]` and a visible Save label until the spinner appears on
both stacks. A walk fails if Solid innerText/AX name is already
empty at t0 while React still shows Save.

## Relationship

Child of #26. Found by #260. Fixture-only; not a Button port defect
(`createPendingState` still delays 1000 ms when the Button owns the
text). Distinct from #135 / #187 (authored-icon pending visibility
on the wrapper). Do not start #254.
