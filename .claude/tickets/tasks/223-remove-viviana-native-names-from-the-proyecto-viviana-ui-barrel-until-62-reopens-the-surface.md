---
id: 223
type: task
title: "Remove viviana-native names from the @proyecto-viviana/ui barrel until #62 reopens the surface"
created: 2026-09-01
parent: 33
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
---

## Cause

`architecture.md` says no viviana-native names are on the public barrel until
the owner reopens that surface (#62 / #145). The `@proyecto-viviana/ui`
barrel still exports `Well`, about thirty `Pixel*` icons, `typeRoles`, and
`meshStrip`. The owner confirmed on 2026-09-01 (#218 item 3) that the
document records the intent.

## Work

Remove those names from `packages/viviana-ui/src/index.ts` (and any subpath
that re-exports them). Keep the source files if #62 will want them back;
delete them if nothing internal uses them. Changeset (major-adjacent removal
for `@proyecto-viviana/ui`; the owner sets the bump). Confirm
`architecture.md`'s status line is then true without its caveat and remove
the caveat.

## Done when

`rg -n 'Well|Pixel|typeRoles|meshStrip' packages/viviana-ui/src/index.ts`
returns nothing; `ui:smoke` and `guard:api-reference` are green;
`architecture.md` no longer needs the "still exports" caveat.

## Relationship

Owner decision on #218 item 3. #62 owns reopening the surface.
