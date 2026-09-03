---
id: 344
type: task
title: "Keep CardView ActionBar reactive after live control changes"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 cardview functional pass: URL ?showActionBar=true paints both Archive1 selected; live showActionBar / comparison:controls-change paints React Archive1 selected and leaves Solid with no ActionBar. URL remount Clear via evaluate empties both. Playwright locator.click on Solid Clear hits comparison-island.js-solid-mount (harness, not this ticket)",
    }
---

CardView `renderActionBar` updates on URL remount. A live control
change after mount updates React and leaves Solid on the first-paint
slots (no bar).

The comparison fixture exposes `renderActionBar` as a getter off
`demoProps().showActionBar`
(`apps/comparison/src/components/solid/fixtures/styled/cardview.tsx`).
The live `comparison:controls-change` listener does call
`setDemoProps`. React still paints the bar; Solid does not.

## Evidence

`http://127.0.0.1:4341/components/cardview/`, islands mounted.

URL `?showActionBar=true&selectionSource=selectedKeys&selectedKeys=apollo`:
both stacks render `[data-comparison-cardview-actionbar]` "Archive1
selected" (React 344×56, Solid 360×56) plus toolbar Archive and
Clear selection. `element.click()` on Clear empties `selectedKeys`
and hides the bar on both.

Live from the default route, click `showActionBar` or dispatch
`comparison:controls-change` with `{ showActionBar: true }`:

|                  | React                    | Solid |
| ---------------- | ------------------------ | ----- |
| ActionBar marker | Archive1 selected 344×56 | null  |
| toolbar Actions  | Archive, Clear selection | none  |

Live `selectionMode` still matches. Playwright
`locator.click` on Solid Clear is intercepted by
`.comparison-island.js-solid-mount` — harness, not this ticket.

## Done when

A live `showActionBar` switch paints the Solid ActionBar with "1
selected", matching React. A comparison-route walk fails if that
live switch leaves Solid on the mount-time slots.

## Relationship

Child of #24. Found by #260. Same snapshot class as #309 (ListView)
and #330 (TreeView), different export. Distinct from #102 (SSR slot
classes). Do not start #254.
