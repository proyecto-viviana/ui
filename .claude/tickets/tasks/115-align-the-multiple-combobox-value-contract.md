---
id: 115
type: task
title: "Align the multiple ComboBox value contract"
created: 2026-08-20
parent: 33
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-73" }
---

Match the current upstream multiple-selection value type.

Upstream uses `ValueType<M> = readonly Key[]` for multiple mode. The local state
uses `selectedKeys?: Iterable<Key>` and does not expose the same `value` contract.
The owner must steer any public type change.

## Done when

Types, controlled and uncontrolled behavior, callbacks, forms, docs, and tests
match upstream for single and multiple modes. Part of #82.
