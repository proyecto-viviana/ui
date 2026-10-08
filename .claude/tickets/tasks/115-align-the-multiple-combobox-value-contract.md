---
id: 115
type: task
title: "Align the multiple ComboBox value contract"
created: 2026-08-20
parent: 33
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-73" }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "value, defaultValue, and onChange match upstream for single and multiple; the site combobox JSON stays on the public-face seat and still lists selectedKeys",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admit bounded qualification repair: packages/solid-stately/src/combobox/createComboBoxState.ts, packages/solidaria/src/combobox/createComboBox.ts, packages/solidaria-components/src/ComboBox.tsx; owning createComboBoxState, createComboBox and ComboBox tests; packages/solidaria-components/test-utils/combobox-props.typecheck.ts; one patch changeset and generated status/roadmap. Preserve the already approved public single/multiple contract; remaining full certification stays open.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Review: a frozen multiple input is not mutated and is not stored by identity. setValue copies into state and gives onChange a second mutable Key[]. Open-menu keydown forwards Solid's [handler, data] tuple as handler(data, event). The runtime test passes that order. Full upstream, forms, docs, and styled acceptance stays open.",
    }
---

Match the current upstream multiple-selection value type.

Upstream uses `ValueType<M> = readonly Key[]` for multiple mode. The local state
uses `selectedKeys?: Iterable<Key>` and does not expose the same `value` contract.
The owner must steer any public type change.

## Done when

Types, controlled and uncontrolled behavior, callbacks, forms, docs, and tests
match upstream for single and multiple modes. Part of #82.
