---
id: 73
type: task
title: "Localize NumberField role and stepper labels"
created: 2026-08-20
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task intl-roledescription-hardcodes",
    }
---

Replace the hardcoded NumberField strings `Number field`, `Increase`, and
`Decrease` with `createStringFormatter` lookups that mirror React Aria.

The en-US output already matches. The divergence appears only under another
locale.

## Done when

NumberField uses the upstream locale dictionaries and non-English/RTL contract
coverage asserts the role description and stepper labels.

## Relationship

Replaces `intl-roledescription-hardcodes` from
`.claude/current/tech-debt.md`.
