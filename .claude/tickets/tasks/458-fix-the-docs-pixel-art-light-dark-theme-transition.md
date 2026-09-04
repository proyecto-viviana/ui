---
id: 458
type: task
title: "Fix the docs pixel-art light/dark theme transition"
created: 2026-09-04
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as T9; owner-confirmed title; parent #26; implement after #449; grill go",
    }
---

The docs / Header / showcase theme toggle paints a full-viewport
`--surface-app` cover then reveal (`dualWipe` with a `pc===1` hold). Live
Header `toggleTheme` also leaves `data-theme` stale while
`data-color-scheme` flips.

One wipe, owned by `useTheme().toggleTheme`: rasterize the live old
viewport, overlay that bitmap, fire `onCovered` (apply + signal +
storage) under it, then one-pass Bayer 12px tiles so the live new page
shows through. Never full-viewport `fillRect` of `--surface-app`.
`chrome.tsx` deletes `wipeTheme` and uses `onPress={toggleTheme}`. Keep
the export name `dualWipe`. No View Transitions. No deploy, no changeset.

`apps/web` only. Research:
`.agents/vivianastack/docs-theme-transition/` (`plan.md`, `grill.md`
verdict `go`).

## Done when

Shared `toggleTheme` owns one one-pass Bayer wipe. `chrome.tsx` no
longer calls `dualWipe`. Coverage runs in `vp run a11y:smoke`. No View
Transitions. `applyTheme` writes both `data-theme` and
`data-color-scheme`.

## Relationship

Child of #26. Implement after #449 (same `apps/web` Header family).
Distinct from #456 (showcase topbar clip).
