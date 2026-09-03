---
id: 330
type: task
title: "Keep TreeView ActionBar reactive after live control changes"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: URL ?showActionBar=true paints both bars Archive1 selected; live showActionBar / comparison:controls-change paints React Archive 1 selected and leaves Solid with no ActionBar. Live selectionMode/highlight/empty/icons/buttonGroup still match; URL remount matches",
    }
---

TreeView `renderActionBar` updates on URL remount. A live control
change after mount updates React and leaves Solid on the first-paint
slots.

The comparison fixture exposes `renderActionBar` as a getter off
`demoProps().showActionBar`
(`apps/comparison/src/components/solid/fixtures/styled/treeview.tsx:168`).
The live `comparison:controls-change` listener does call `setDemoProps`.
React still paints the bar; Solid does not.

## Evidence

`http://127.0.0.1:4341/components/treeview/`, islands mounted.

URL `?showActionBar=true&selectionSource=selectedKeys&selectedKeys=weekly-report`:
both stacks render `[data-comparison-treeview-actionbar]` "Archive1
selected" (React 400×56, Solid 416×56) plus toolbar Archive and Clear
selection. Width 400 vs 416 is virtualizer chrome (**#65**), not this
ticket.

Live from the default route, dispatch `comparison:controls-change`
with `{ showActionBar: true }`:

| | React | Solid |
|---|---|---|
| ActionBar marker | Archive1 selected 400×56 | null |
| toolbar Actions | Archive, Clear selection | none |

Live `selectionMode` / `selectionStyle=highlight` / empty / icons /
`itemActionSlot=buttonGroup` still match. URL remount still paints
both.

## Done when

A live `showActionBar` switch paints the Solid ActionBar with "1
selected", matching React. A comparison-route walk fails if that live
switch leaves Solid on the mount-time slots.

## Relationship

Child of #24. Found by #260. Same snapshot class as #309 (ListView)
and #169 (SelectBox children), different export. Distinct from #102
(SSR slot classes). Do not start #254.
