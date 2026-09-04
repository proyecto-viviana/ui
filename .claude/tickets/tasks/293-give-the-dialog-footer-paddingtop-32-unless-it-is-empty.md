---
id: 293
type: task
title: "Give the Dialog footer paddingTop 32 unless it is empty"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 dialog functional pass: AlertDialog with ButtonGroup is 162px tall on Solid vs 194px on React; footer paddingTop is 0 instead of S2's 32 / :empty 0",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "dialogFooterWrapper paddingTop is 32 with :empty 0 in solid-spectrum and viviana-ui, matching S2 Dialog.tsx.",
    }
---

On `/components/dialog/?role=alertdialog`, the settled modal box is 480×194
on React and 480×162 on Solid. Heading, body, Cancel/Save sizes, and the
error/warning Alert icon match. The missing 32px is the footer wrapper's
`padding-top`.

S2 `Dialog.tsx` (installed `@react-spectrum/s2/src/Dialog.tsx:223-235`):

```
paddingBottom: { default: 32 },
paddingTop: { default: 32, ':empty': 0 }
```

The port hardcodes `paddingTop: 0` in `dialogFooterWrapper`
(`packages/solid-spectrum/src/dialog/Dialog.tsx:519-531` and the
`viviana-ui` twin). A dismissible Dialog with no ButtonGroup still matches
because React's `:empty` also yields 0. AlertDialog (and any Dialog that
keeps ButtonGroup) does not.

## Evidence

`http://127.0.0.1:4341/components/dialog/?role=alertdialog`, one panel at a
time, `data-islands-mounted`. Pointer open, wait until opacity 1.

|              | React                                                  | Solid                              |
| ------------ | ------------------------------------------------------ | ---------------------------------- |
| overlay      | 480×194 @ y 353                                        | 480×162 @ y 369                    |
| footer child | h 96, padding `32px 32px 32px 32px`                    | h 64, padding `0px 32px 32px 32px` |
| buttons      | Cancel 80×32, Save 62×32                               | same                               |
| AX           | `alertdialog "Review Changes"` heading + Cancel + Save | identical                          |

Same 32px gap for `variant=error|warning|information|destructive`,
`size=XL` (folded to L, width 640 both), omitted `cancelLabel`, and live
`role=alertdialog`. Default dismissible Dialog (no ButtonGroup) stays
480×130 on both.

## Done when

A Dialog whose footer contains ButtonGroup (AlertDialog on this route) has
the same overlay height as React. A comparison-route walk on
`/components/dialog/?role=alertdialog` fails if Solid's footer
`padding-top` is 0 while React's is 32px. Fix the `style()` token in both
styled packages (ADR 0001); do not patch comparison CSS.

## Relationship

Child of #24. Found by #260. Distinct from #141 (harness
`comparison-spectrum-*` class names) and from Modal size widths (S/M/L/XL
already match). Do not start #254.
