---
id: 222
type: task
title: "Move MenuButton out of solid-spectrum and solidaria-components"
created: 2026-09-01
parent: 33
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
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
