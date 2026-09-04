---
id: 436
type: task
title: "Match React Aria LandmarkManager F6 capture and landmark focus target"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 toast functional pass: isolated React F6 from Before and from Show Neutral Toast stays on the start; isolated Solid F6 focuses the alertdialog toast. RAC LandmarkManager listens on document capture, setupIfNeeded only after addLandmark, preventDefault only if handled, and focuses the landmark element (the region, tabIndex -1) unless lastFocused. Solid LandmarkManager startListening() in the constructor on window capture, preventDefault()s every F6 even with 0 landmarks, and focusLandmark prefers the first tabbable (alertdialog tabIndex 0). Window capture runs before document, so the still-loaded Solid island steals F6 from S2 on the comparison page",
    }
---

Solid `LandmarkManager` does not match React Aria's F6 contract.

RAC (`react-aria` `useLandmark` LandmarkManager):

- listens on **document** capture
- `setupIfNeeded` only after `addLandmark`
- `preventDefault` **only if handled**
- focuses the landmark element (Toast region, `tabIndex=-1`) unless
  `lastFocused` is still connected

Solid (`packages/solidaria/src/landmark/createLandmark.ts`):

- `startListening()` in the **constructor** on **window** capture
- `preventDefault()` on **every** F6, including `landmarks.length === 0`
- `focusLandmark` prefers `findFirstFocusable` (`[tabindex]:not([tabindex="-1"])`),
  so a toast `alertdialog` (`tabIndex=0`) wins over the region

Window capture runs before document capture. On the comparison page
both islands load, so Solid's listener steals F6 from S2 even when
the React stack is isolated (`visibility:hidden` + `inert`) and Solid
has zero registered landmarks (empty `ToastContainer`, no region).

The comparison-route observation is React F6 no-op vs Solid F6 to the
toast. Both miss S2: React never hears F6, Solid focuses the
alertdialog instead of the region.

#177 is the Landmark **export** note exception (local addition, no S2
oracle). This ticket is `createLandmark` used by Toast's region.

## Evidence

`http://127.0.0.1:4341/components/toast/`, islands mounted, isolated
`?activeSide=` per stack, one Neutral toast.

From Before (and from Show Neutral Toast):

|          | React          | Solid                             |
| -------- | -------------- | --------------------------------- |
| F6       | stays on start | **alertdialog** "Toast available" |
| F6 again | stays on start | same alertdialog                  |

S2 should move to the Notifications **region**.

## Repro

1. Open `http://127.0.0.1:4341/components/toast/?activeSide=react`.
2. Wait for `data-islands-mounted="true"`. Hide the Solid
   `.s2-framework-panel` (`visibility:hidden` + `inert`).
3. Click Show Neutral Toast. Focus Before, press F6: focus stays on
   Before.
4. Repeat with `?activeSide=solid` (hide React): F6 from Before lands
   on the alertdialog, not the region.

## Done when

`createLandmark` matches RAC: document listener, attach only while
landmarks exist, `preventDefault` only when F6 is handled, focus the
landmark element (Toast region) unless `lastFocused` applies. On the
comparison toast route, isolated React F6 and isolated Solid F6 both
move to the Notifications region. A walk fails if F6 is a no-op on
S2 or lands on the alertdialog on Solid. Do not start #254.

## Relationship

Child of #24. Found by #260. The comparison dual-island collision is
the evidence surface; the owner is LandmarkManager, not a fixture
memo. Not #177 (Landmark export note exception). Not #434 (Show all /
Collapse focus). Do not start #254.
