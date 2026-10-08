---
id: 84
type: task
title: "Port the drag-and-drop subsystem"
created: 2026-08-20
parent: 25
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task dnd-subsystem-port" }
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode T1 (#10156, #10157) is this ticket. Styled TreeView leaves dragAndDropHooks on the headless props and spreads them into HeadlessTree. useDragAndDrop is already exported from solidaria-components. The open work is row behavior (reorder, re-parent, drop indicator, keyboard drag, multi-select move), not a second ticket.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Tree rows reorder, reparent, and move a multi-selection from the keyboard, and the styled tree paints the drag handle, insertion line, and drop-target chrome. Touch long-press capture, TableView and GridList consumers, the drag preview card, and real mobile assistive-input evidence remain open.",
    }
---

Port the shared drag-and-drop subsystem before the collection certification
marches reach drag-and-drop states.

The starting export gap includes `useDragAndDrop`, `DragPreview`,
`DIRECTORY_DRAG_TYPE`, `isTextDropItem`, `isFileDropItem`, and
`isDirectoryDropItem`. TableView and TreeView also lack drag-and-drop rows.
Scope the implementation against upstream `@react-aria/dnd` and RAC
`useDragAndDrop` before coding.

The port must also close the selectable-item drag boundary. Upstream uses a
capture-phase drag-start handler to stop native drag after a touch long press.
The current `createSelectableItem` handler uses the bubble phase until this DnD
integration lands. Preserve handler chaining when the capture path replaces it.

The pinned Train 8 source adds two more required branches:

- Prefer an ancestor drop target over the nearest target by distance.
- Track pointer modality so Android TalkBack taps and iOS VoiceOver virtual
  input are not treated as physical drag gestures.

## Done when

The shared DnD behavior lives in the correct lower layers, the six S2 support
exports close, and TableView, TreeView, GridList, and other upstream consumers
have strict behavior and accessibility evidence. Touch long-press selection
must stop native drag before the shared DnD handler starts a drag operation.
Ancestor drop targets and Android/iOS assistive-input gestures must match the
pinned upstream source in real mobile-browser evidence.

## Relationship

Replaces `dnd-subsystem-port` from the retired debt ledger, owns upstream Train
8 items T-68 and T-88 for #82, and keeps the original external scope in GitHub
issue #25.
