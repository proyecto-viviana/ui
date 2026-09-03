---
id: 435
type: task
title: "Keep ToastRegion aria-label live after the region mounts"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: 'filed from the #260 toast functional pass: live comparison:controls-change {"aria-label":"Alerts"} updates data-comparison-control-props on BOTH panels; React region aria-label and AX become Alerts; Solid stays Notifications. URL ?aria-label=Inbox remounts and matches Inbox on both. Live placement/children/action already update. Solid ToastContainer stays mounted; headless ToastRegion regionContent() plus createToastRegion landmark default "Notifications" snapshot when hasToasts first flips true',
    }
---

ToastContainer `aria-label` should follow the live prop the way S2
does. After a toast is already on screen, a
`comparison:controls-change` that sets `"aria-label":"Alerts"`
updates Solid's fixture JSON but leaves the landmark named
`Notifications`.

URL remount (`?aria-label=Inbox`) matches both stacks. Live
`placement` / `children` / action already update. Solid
`ToastContainer` stays mounted when the stack is inactive; React
unmounts it. Headless `ToastRegion` builds `regionContent()` when
`hasToasts` is true (`packages/solidaria-components/src/Toast.tsx`
~347–376) and `createToastRegion` defaults the landmark label to
`"Notifications"` (`packages/solidaria/src/toast/createToastRegion.ts`
~81).

## Evidence

`http://127.0.0.1:4341/components/toast/`, islands mounted, isolated
`?activeSide=` per stack, one Neutral toast, then
`comparison:controls-change` `{"aria-label":"Alerts"}`.

|                           | React      | Solid             |
| ------------------------- | ---------- | ----------------- |
| fixture JSON `aria-label` | Alerts     | Alerts            |
| region DOM `aria-label`   | **Alerts** | **Notifications** |
| region AX name            | **Alerts** | **Notifications** |

`?aria-label=Inbox` rest: both region name Inbox.

## Repro

1. Open `http://127.0.0.1:4341/components/toast/?activeSide=solid`.
2. Wait for `data-islands-mounted="true"`.
3. Click Show Neutral Toast.
4. Dispatch `comparison:controls-change` with `{"aria-label":"Alerts"}`.
5. Diff the `[role=region]` host: Solid `aria-label` is still
   Notifications; React (same steps with `?activeSide=react`) is
   Alerts.

## Done when

A live `aria-label` change on the comparison route updates Solid's
toast region name and AX to match S2 without a remount. A walk fails
if the fixture JSON says Alerts and the landmark is still
Notifications. URL remount must keep working. Do not start #254.

## Relationship

Child of #24. Found by #260. Same live-name class as #410
(ProgressCircle `createLabel` snapshot) and #413 (ColorSwatchPicker
host name); this ticket is the ToastRegion landmark surface. Not #200
(intl catalogs). Do not start #254.
