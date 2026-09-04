---
id: 56
type: task
title: "Complete the aria-describedby slot migration"
created: 2026-08-20
parent: 31
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "migrated from legacy task migrate-describedby-slots",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: keep in-progress; done-when is #57 and #58 complete, and those children are still open",
    }
---

Complete the shared `aria-describedby` slot path across field and toggle
components.

The ten `*Field` components are complete: seven hybrid components retain props
and add slots, while `SwitchField`, `CheckboxField`, and `RadioField` use slots
only. Tickets #57 and #58 hold the remaining parity divergences.

Keep the shared `createField` hook conditional on props. Replacing it with
`createSlotId` would leave non-reactive consumers with dangling references.

## Done when

#57 and #58 are complete and the affected description/error associations have
reactive browser evidence.

## Relationship

Replaces `migrate-describedby-slots`. Its
legacy context-slot prerequisite is complete.
