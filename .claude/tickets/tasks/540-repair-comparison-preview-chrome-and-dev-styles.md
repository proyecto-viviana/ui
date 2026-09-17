---
id: 540
type: task
title: "Repair comparison preview chrome, canvas alignment, and dev-style persistence"
created: 2026-09-17
status: merged
history:
  - {
      state: open,
      at: 2026-09-17,
      note: "Filed after the fact. The work landed in c9419d5f, 95d30443, and 16acc9c7 without an owning ticket; this ticket records it.",
    }
  - {
      state: merged,
      at: 2026-09-17,
      note: "c9419d5f disables the Astro dev toolbar in the comparison app and fixes Geist Button fixture hydration. 95d30443 balances the preview canvas alignment and removes the empty space around it. 16acc9c7 preserves Vite dev styles across ClientRouter navigations.",
    }
---

Fix three comparison-harness defects that made the preview unusable in
development: the Astro dev toolbar overlaying fixtures, an unbalanced
preview canvas, and Vite dev styles dropping on client-side navigation.

## Scope

- `apps/comparison` harness chrome and its global stylesheet.
- Harness only. This does not touch fixture markup that a certified cell
  measures, and it patches no component styling.

## Done when

The comparison preview renders without the dev toolbar, the canvas is
centred with no dead space, and a ClientRouter navigation keeps its
styles in development.

## Relationship

Harness hygiene under #243's comparison app. Not a certification change:
no certified cell result moves because of it. Confirm against #194 before
any certified rerun is read as evidence.

## Proof

Working directory: `ui`.

| Kind   | Command                               | Result                                                                      |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| source | `git show c9419d5f 95d30443 16acc9c7` | `apps/comparison` harness chrome and CSS                                    |
| local  | `pnpm run check`                      | exit 0; 4258 files formatted, 0 lint findings in 3111, `tsc --noEmit` clean |
