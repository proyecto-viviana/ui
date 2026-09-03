---
id: 381
type: task
title: "Do not set aria-label on pending ActionButton string children"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actionbutton functional pass: live isPending string children, after the 1s spinner hides the label, Chromium AX is unnamed button [disabled] on S2 and button \"Inspect\" [disabled] on Solid. Solid pendingAccessibleLabel copies the string into aria-label; S2 ActionButton does not. Icon-start pending (non-string children) unnamed on both; icon-only keeps the consumer aria-label on both",
    }
---

S2 `ActionButton` does not put `aria-label` on the host when
`isPending` and children are a string. It wraps the string in
`Text` and, after the 1s pending delay, sets that text
`visibility: hidden`. Chromium then drops the accessible name.

Solid `pendingAccessibleLabel()` copies the string onto
`aria-label` whenever `isPending` and `typeof children ===
"string"`. Headless `Button` then also sets `aria-labelledby` to
`${buttonId} ${progressId}`. After the spinner mounts, Solid AX
stays `button "Inspect" [disabled]`; S2 is unnamed
`button [disabled]` with a nested `progressbar "pending"`.

Before the spinner, both AX snapshots are still
`button "Inspect" [disabled]` (visible text). D6 captures that
120ms pre-spinner moment, so certified green does not hold this
fork. Icon-start pending (icon + `Text`, not a string) is unnamed
on both. Icon-only pending keeps the fixture `aria-label` on both.

The ActionButton comparison fixture already passes a raw string
(unlike the Button fixture on #380), so both stacks keep the
visible Inspect label until the spinner. This ticket is the
post-spinner name fork only.

## Evidence

`http://127.0.0.1:4341/components/actionbutton/`, islands mounted,
one panel at a time. Live `{isPending:true}` from default Inspect.

| | React | Solid |
|---|---|---|
| 0–120ms `aria-label` | omitted | `Inspect` |
| 0–120ms AX | `button "Inspect" [disabled]` | same |
| 1100ms label `visibility` | `hidden` | same |
| 1100ms spinner | 18×18 `pending` | same |
| 1100ms AX | `button [disabled]` + `progressbar "pending"` | `button "Inspect" [disabled]` + `progressbar "pending"` |

`packages/@react-spectrum/s2/src/ActionButton.tsx` spreads
`props` onto `RACButton` with no pending `aria-label`. Solid
`packages/solid-spectrum/src/button/ActionButton.tsx`
`pendingAccessibleLabel` (same helper in `viviana-ui`).

## Done when

A pending ActionButton whose children are a string matches S2
after the spinner: no host `aria-label` unless the consumer
passed one, and Chromium AX is unnamed `button [disabled]` with
the nested pending progressbar. A walk fails if Solid still
exposes `aria-label="Inspect"` on the default comparison route.

## Relationship

Child of #24. Found by #260. Distinct from #380 (Button fixture
hides the label at t0). Distinct from #168 (mixed-text hydration)
and from consumer `aria-label` on icon-only. Do not start #254.
