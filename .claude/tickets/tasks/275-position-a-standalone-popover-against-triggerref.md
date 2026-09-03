---
id: 275
type: task
title: "Position a standalone Popover against triggerRef"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 popover functional pass: customAnchor click leaves the Solid overlay at position:fixed; left:0; top:0; opacity 0; data-entering for 2000ms, while React sits on the anchor",
    }
---

S2 Popover documents a standalone `triggerRef` + `isOpen` path (no
`DialogTrigger`). On `/components/popover/?triggerMode=customAnchor` the
React overlay positions on the "Popover anchor" div. Solid mounts a
`role="dialog"` that never leaves the pre-position frame
(`position:fixed; left:0; top:0`), stays `data-entering` with opacity 0,
does not take focus, and does not close on Escape.

The comparison Solid fixture already passes `triggerRef: () => anchorElement`
into public `Popover` (`apps/comparison/src/components/solid/fixtures/styled/popover.tsx`).
Headless `getTriggerRef` reads `local.triggerRef()`
(`packages/solidaria-components/src/Popover.tsx`). DialogTrigger mode on
the same route positions correctly, so this is the standalone ref path.

## Evidence

`http://127.0.0.1:4341/components/popover/?triggerMode=customAnchor&showForm=false&shouldFlip=false`

One panel at a time, click "Open Feedback", wait 2000ms:

|                 | React                                      | Solid                            |
| --------------- | ------------------------------------------ | -------------------------------- |
| trigger text    | Close Feedback                             | Close Feedback                   |
| overlay         | `position:absolute` left/top on the anchor | `position:fixed; left:0; top:0`  |
| dx/dy to anchor | 0 / 47                                     | −738 / −440 (viewport origin)    |
| opacity         | 1                                          | 0                                |
| data-entering   | false                                      | true                             |
| focus           | dialog "Feedback"                          | body                             |
| Escape + 800ms  | overlay gone, focus on Open Feedback       | overlay still present, opacity 0 |

URL `isOpen=true` with both panels open is a matching trap (Solid's origin
overlay loses the closest-dialog pick to React's placed overlay). Isolate
per stack.

## Done when

Clicking Open on the comparison custom-anchor route places the Solid
popover on the anchor with opacity 1, matching React's dx/dy, and Escape
closes it. A Playwright walk fails if the overlay is still
`position:fixed; left:0; top:0` with opacity 0 after settle.

## Relationship

Child of #24. Found by #260. Distinct from #251 (DialogTrigger enter/exit
already paints; this overlay never leaves the origin frame) and from #248
(ComboBox/Picker list). Do not start #254.
