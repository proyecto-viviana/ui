---
id: 70
type: task
title: "Extract the faithful S2 field composite"
created: 2026-08-20
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task helptext-fielderror-visual-port",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 checkbox: URL ?isInvalid=true and live isInvalid with empty errorMessage paint React FieldError icon row (field 109×52, 20×20 aria-hidden img, helpCount 1, empty error slot); Solid stays 99×18 with no HelpText. Remaining work already names missing invalid cases for Checkbox. Native custom validity is #355, not this. No new id.",
    }
---

Extract the shared S2 `FieldLabel` and `HelpText`/`FieldError` composite. Replace
the independent field and group copies with that component while preserving
the certified output.

## Evidence already complete

- CheckboxGroup and RadioGroup each pass 43/43 with single-source description
  IDs threaded to every input.
- TextField and TextArea each pass 35/35 for their covered states.
- The canonical TextField invalid composite passes 30/30. The shared help-text
  styles, error icon, error slot, ARIA wiring, and paint match upstream.
- Input-family visual wrappers must use `role="presentation"`, not
  `role="group"`.

## Remaining work

Use the certified output as the reference for the shared extraction. Add the
missing invalid cases for Checkbox, CheckboxGroup, RadioGroup, TextArea,
NumberField, and SearchField when each component is next touched. Keep Select
and ColorField slot work coordinated with #57.

## Done when

The field family uses one upstream-shaped composite, the per-component invalid
branches have strict evidence, and no former hand-roll remains as a second
source.

## Relationship

Replaces `helptext-fielderror-visual-port` from
`.claude/current/tech-debt.md`.
