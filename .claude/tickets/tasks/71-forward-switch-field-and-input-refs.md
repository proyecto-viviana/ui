---
id: 71
type: task
title: "Forward Switch field and input refs"
created: 2026-08-20
parent: 33
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task headless-switch-ref-forwarding",
    }
  - {
      state: verified,
      at: 2026-09-25,
      note: "forwarded root and input refs across ToggleSwitch, SwitchField, SwitchButton, and styled ToggleSwitch with unit tests across all three packages",
    }
---

Add RAC-aligned `ref` and `inputRef` forwarding to headless `SwitchField` and
`SwitchButton`, then expose both through the styled Switch.

The field ref targets the root. The input ref targets the visually hidden
native input. Thread the relevant handle through `pressScale` as upstream does.
This is existing debt, not a certification regression.

## Relationship

Replaces `headless-switch-ref-forwarding` from
`.claude/current/tech-debt.md`.
