---
id: 46
type: task
title: "Remove invented utility styling from library code"
created: 2026-08-20
parent: 32
status: verified
history:
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "migrated from legacy task invented-tailwind-utility-styling",
    }
  - {
      state: merged,
      at: 2026-08-20,
      note: "source audit found the app CSS removal in a06c8f27 and the completed library conversions on main",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "invented-utility guard and packed installed-consumer smoke pass on the current worktree",
    }
---

Remove the library dependency on the hand-written Tailwind-style vocabulary in
`apps/web/src/local-utilities.css`.

## Original gap

The repository has no Tailwind build. The web app defines the utility names as
plain CSS, but library components emit those names. Those components therefore
lose their styling in the comparison app and in external consumers.

Affected library areas include ActionGroup, Select, Menu, ListBox, StepList,
Landmark, LogicButton, Switch, Viviana Chip/Logo/TimelineItem, and the
`solidaria-components` Breadcrumbs implementation.

## Verified evidence

- Commit `a06c8f27` deleted `apps/web/src/local-utilities.css`.
- No live app or package source imports that file.
- The library source scan finds no invented semantic utility tokens.
- `vp run guard:invented-utilities` passes and blocks their return.
- `vp run ui:smoke` installs the packed package set outside the workspace. Its
  DOM, SSR, exports, and CSS contracts pass.

## Relationship

Replaces the stale legacy utility-styling task and the retired Tailwind-removal
plan.
