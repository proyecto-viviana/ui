---
id: 57
type: task
title: "Move group help text to RAC slots"
created: 2026-08-20
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task describedby-slots-group-redesign",
    }
---

Remove `description` and `errorMessage` props from the RAC-layer
`RadioGroup`, `CheckboxGroup`, `Select`, and `ColorField`. Provide
`TextContext` and `FieldErrorContext` slots instead.

This breaking change is owner-authorized because upstream parity takes
priority. Mint a slot ID in each group hook and bind `aria-describedby`
reactively. Do not change shared `createField`. Work one component at a time
and run its gates before continuing.

## Relationship

Replaces `describedby-slots-group-redesign` from
`.claude/current/tech-debt.md`. Depends on #56.
