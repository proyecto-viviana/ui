---
id: 222
type: task
title: "Move MenuButton out of solid-spectrum and solidaria-components"
created: 2026-09-01
parent: 33
status: merged
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Removing MenuButton from solid-spectrum and solidaria-components barrels. MenuTrigger now forwards triggerProps onto Button. ui MenuButton stays as a documented local addition.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "MenuButton removed from RAC/S2 barrels. MenuTrigger+Button opens the menu. ui MenuButton stays as a documented local addition. apps/web showcase still uses it.",
    }
---

## Cause

Owner decision on #218 item 2. `MenuButton` (styled and headless) is a
Viviana convenience with no S2 or RAC counterpart
(`packages/solid-spectrum/src/menu/index.tsx:200-204`). S2 composes
`MenuTrigger` + `Button`.

## Work

Remove `MenuButton` from `@proyecto-viviana/solid-spectrum` and
`@proyecto-viviana/solidaria-components`. Keep it in `@proyecto-viviana/ui`
only if the product imports it (check `apps/web` and the owner's consumers);
otherwise delete it there too. Changeset with the removal; migration line in
the changeset body showing the `MenuTrigger` + `Button` composition.

## Done when

No public barrel outside `@proyecto-viviana/ui` exports `MenuButton`; if it
stays in `ui`, its barrel comment labels it a local addition.

## Relationship

Owner decision on #218 item 2. Part of #221's relocation pass.

## Proof

```bash
vp run guard:rac-parity
# PASS: every tracked symbol is export present on solidaria-components.

vp run guard:rac-export-gap
# PASS: no unlisted RAC value exports are missing. MenuButton is not an extra.

vp test run packages/solidaria-components/test/Menu.test.tsx packages/solidaria-components/test/FocusManagement.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/intl-strings.test.tsx packages/solidaria-components/test/Button.test.tsx
# 269 passed

# MenuTrigger + Button opens; MenuTrigger isDisabled disables the Button;
# context menu trigger has no popup ARIA; ActionMenu id/ARIA/data attrs stay live.
```
