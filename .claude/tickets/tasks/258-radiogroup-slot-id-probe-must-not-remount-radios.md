---
id: 258
type: task
title: "RadioGroup group-level TextContext must carry description/error slots"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "surfaced by #248 step-0 round 2: createField now uses createSlotId; RadioGroup nested GroupChildren remounts radios when describedby probes, and group-level TextContext is still inert",
    }
  - {
      state: open,
      at: 2026-09-02,
      note: "first work item landed: radios stay mounted across the createSlotId probe; ref tests green. Remaining: replace the WeakMap id path with group-level TextContext slots",
    }
---

## Cause

Group-level `TextContext` is still inert (`RadioGroup.tsx` `port-context-slots`).
Groups keep an explicit WeakMap id path (`createRadioGroup` / `createRadio`).
`createRadio` skips a WeakMap id that `document.getElementById` cannot find,
matching consumer-side `useSlotId`, because the WeakMap snapshot is not a
signal. Getters on the WeakMap entry looped when tried during #248.

RAC `RadioGroup` re-reads `useField` every render (`useField.ts:66-70`) and
exposes description/error through `TextContext` slots. Solid must do the same
and then drop the parallel WeakMap.

## Landed (do not redo)

Radio child instances stay stable across the `createSlotId` probe. The remount
path was `createRadioGroup(() => ({ ...ariaProps }))`: `ariaProps` still held
the compiled `children` getter (`() => <Radio />`). Every `createSlotId` probe
re-ran that getter, constructed a new detached `Radio`, and left refs pointing
at the first node. Fix: `splitProps` takes `children` so the reactive aria
object never re-creates radios; `RadioGroupDefaultRoot` reads describedby as
an attribute; `createRadio` exposes `inputDescribedBy` off `inputProps` so the
input spread does not track the probe. The three ref tests are green.

## Work

Wire group-level `TextContext` slots the way RAC does (`RadioGroup.tsx`
description/errorMessage), then drop the explicit WeakMap path. Make group
description/error ids what radios track (accessors, not a re-snapshotted
WeakMap — getters on the WeakMap entry looped during #248).

## Done when

A radio with no group description has no dangling `aria-describedby`. Group
`<Text slot="description">` receives the id the group references, without a
parallel WeakMap.
