---
id: 309
type: task
title: "Keep ListView ActionBar and item slots reactive after live control changes"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 listview functional pass: URL ?showActionBar=true paints both bars; live showActionBar / comparison:controls-change paints React Archive 1 selected and leaves Solid with no ActionBar. Live hideLinkOutIcon and selectionStyle=highlight also leave Solid slots stale; URL remount matches",
    }
---

ListView `renderActionBar`, `hideLinkOutIcon`, and `selectionStyle` update
on URL remount. A live control change after mount updates React and
leaves Solid on the first-paint slots.

The comparison fixture exposes `renderActionBar` as a getter off
`demoProps().showActionBar`
(`apps/comparison/src/components/solid/fixtures/styled/listview.tsx:148`).
The live `comparison:controls-change` listener does call `setDemoProps`.
React still paints the bar; Solid does not.

## Evidence

`http://127.0.0.1:4341/components/listview/`, islands mounted.

URL `?showActionBar=true&selectionSource=selectedKeys&selectedKeys=project-brief`:
both stacks render `[data-comparison-listview-actionbar]` "Archive1
selected" (React 398×56, Solid 416×56) plus toolbar Archive and Clear
selection.

Live from the default route, click `showActionBar` or dispatch
`comparison:controls-change` with `{ showActionBar: true }`:

| | React | Solid |
|---|---|---|
| ActionBar marker | Archive1 selected 398×56 | null |
| toolbar Actions | Archive 66×32 | null |

Same class on later live switches (URL remount matches both):

- `hideLinkOutIcon`: React drops the extra trailing svg; Solid keeps it.
- `selectionStyle=highlight`: React drops the checkbox; Solid keeps an
  opacity-0 Select checkbox and checkmark svg.

Live `selectionMode` / `itemCount` / empty still match.

## Done when

A live `showActionBar` switch paints the Solid ActionBar with "1
selected", live `hideLinkOutIcon` removes the extra trailing svg, and live
`selectionStyle=highlight` removes the checkbox, matching React. A
comparison-route walk fails if those live switches leave Solid on the
mount-time slots.

## Relationship

Child of #24. Found by #260. Same snapshot class as #169 (SelectBox
children) and #168 (styled children), different export. Distinct from #102
(SSR slot classes). Do not start #254.
