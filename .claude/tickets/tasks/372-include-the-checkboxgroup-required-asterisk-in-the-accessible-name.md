---
id: 372
type: task
title: "Include the CheckboxGroup required asterisk in the accessible name"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 checkboxgroup functional pass: URL ?isRequired=true paints an 8×8 asterisk on both (field 80×182); React Asterisk has aria-label (required) / aria-hidden=false so AX group is Notifications (required) with img (required); Solid aria-hidden=true / no aria-label so AX group is Notifications. S2 CheckboxGroup FieldLabel sets includeNecessityIndicatorInAccessibilityName",
    }
---

S2 CheckboxGroup renders `FieldLabel` with
`includeNecessityIndicatorInAccessibilityName`. The required
asterisk then gets `aria-label="(required)"` and
`aria-hidden={false}`, so the group's accessible name is
`Notifications (required)`.

Solid Spectrum CheckboxGroup always sets `aria-hidden="true"` on
`AsteriskIcon` and never implements that FieldLabel flag. The
asterisk still paints (same 8×8, field 80×182) but is dropped from
the AX tree. Assistive tech names the group `Notifications`.

TextField-family fields default that flag to false, so this is
CheckboxGroup-specific (Picker also sets the flag; not driven here).

## Evidence

`http://127.0.0.1:4341/components/checkboxgroup/?isRequired=true`,
islands mounted.

|               | React                                                 | Solid                               |
| ------------- | ----------------------------------------------------- | ----------------------------------- |
| asterisk      | 8×8, `aria-label="(required)"`, `aria-hidden="false"` | 8×8, no label, `aria-hidden="true"` |
| field         | 80×182                                                | 80×182                              |
| AX group name | `Notifications (required)`                            | `Notifications`                     |
| AX img        | `img "(required)"`                                    | omitted                             |

Live `{isRequired:true}` from the default route paints the same
asterisk split. `necessityIndicator=label` `(optional)` already
matches on both.

Installed S2 `CheckboxGroup.tsx` `FieldLabel` with
`includeNecessityIndicatorInAccessibilityName`. Solid
`packages/solid-spectrum/src/checkbox/index.tsx` AsteriskIcon.

## Done when

A required comparison-route CheckboxGroup includes `(required)` in
the group accessible name, matching S2. A walk fails if Solid AX
stays `group "Notifications"` while React is
`group "Notifications (required)"`.

## Relationship

Child of #24. Found by #260. Distinct from #198 (the
`label.(required)` string already formats for the label necessity
branch) and from decorative Checkmark AX. Do not start #254.
