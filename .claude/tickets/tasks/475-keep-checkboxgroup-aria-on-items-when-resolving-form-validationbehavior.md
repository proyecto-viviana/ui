---
id: 475
type: task
title: "Keep CheckboxGroup aria on items when resolving Form validationBehavior"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "test:run: S2 CheckboxGroup validationBehavior=aria + isRequired set native required on descendant inputs. #472 passed resolveValidationBehavior's native default into createCheckboxGroupItem, which prefers props over group.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Group items pass local ?? Form only. createCheckboxGroupItem still does props ?? group ?? native. Standalone Checkbox keeps the RAC native default.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "S2 Checkbox.test.tsx + headless Checkbox/Form 121 passed. Group aria-required without native required.",
    }
---

#472 resolved Form `validationBehavior` after splitProps so SSR
TextField no longer threw. On a Checkbox inside a CheckboxGroup it
also filled `?? "native"` when there was no Form. `createCheckboxGroupItem`
then preferred that native over the group's `aria`, so `isRequired`
set the native `required` attribute.

RAC `useCheckboxGroupItem` is `props.validationBehavior ?? group`. An
item that does not set the prop must keep the group's value.

## Done when

S2 `CheckboxGroup validationBehavior="aria"` plus `isRequired` does not
set native `required` on descendant inputs. The existing package test
fails if `required` comes back.

## Relationship

Child of #443. Remainder of #472 (same inherit, group-item default).
Distinct from #355 (Checkbox native custom validity). Do not restyle
S2 tokens.
