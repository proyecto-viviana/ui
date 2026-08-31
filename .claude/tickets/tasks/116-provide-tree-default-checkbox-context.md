---
id: 116
type: task
title: "Provide Tree default Checkbox context"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-77" }
---

Match RAC Tree selection composition for an unslotted Checkbox.

Upstream provides `CheckboxContext` through `DEFAULT_SLOT` with the row selection
state. The local Tree only provides `TreeSelectionCheckbox`.

## Done when

Slotted and unslotted checkboxes receive the correct selection, disabled, ARIA,
keyboard, and form behavior without moving state above its owner. Part of #82.
