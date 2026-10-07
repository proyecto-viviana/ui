---
id: 96
type: task
title: "Remove generated-detail snapshot coupling"
created: 2026-08-20
parent: 24
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-025" }
  - {
      state: verified,
      at: 2026-10-07,
      note: "Regression snapshots already rewrite generated classes and drop empty style attributes. TextArea Chrome baseline coverage now checks that Chrome adds field classes, and the comparison page checks computed ::before padding and textarea alignment against React.",
    }
---

Toolchain migration changed generated S2 class names and empty serialized style
attributes. Some snapshots failed even though user behavior did not change.

## Scope

- Find snapshots that assert generated class names or empty serialization
  details.
- Replace those assertions with observable structure, state, or behavior.
- Keep exact styling checks in computed or React-versus-Solid browser evidence.
- Preserve a snapshot only when its exact serialized output is the contract.

## Done when

Generated naming changes do not break behavior tests, and styling drift still
fails a relevant computed or paired browser check.
