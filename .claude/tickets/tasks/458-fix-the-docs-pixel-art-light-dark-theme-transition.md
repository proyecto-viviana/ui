---
id: 458
type: task
title: "Fix the docs pixel-art light/dark theme transition"
created: 2026-09-04
parent: 26
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as T9; owner-confirmed title; parent #26; implement after #449; grill go",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; one dualWipe on shared toggleTheme",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "one-pass Bayer wipe on toggleTheme; chrome wipeTheme deleted; applyTheme writes both attrs",
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

## Evidence

cwd `/home/emoporemilio/projects/viviana-hub/ui`, parent `ead40e9f`.
Plan/grill: `.agents/vivianastack/docs-theme-transition/` (grill `go`).
No wrangler/deploy. No changeset. `packages/solid-spectrum` untouched.

`CI=1 vp exec --filter @proyecto-viviana/web -- playwright test e2e/theme-wipe.spec.ts --reporter=line --workers=1` PASS (3): Header toggle on `/solid-spectrum/docs` mounts wipe canvas and flips both attrs; `/showcase` never viewport `fillRect` of `--surface-app`; `prefers-reduced-motion` skips canvas and still flips scheme.

`vp run check` PASS. `git diff --check` PASS.

Full `vp run a11y:smoke` not run; the new spec is listed on that script. No View Transitions.

## Done when

Shared `toggleTheme` owns one one-pass Bayer wipe. `chrome.tsx` no
longer calls `dualWipe`. Coverage runs in `vp run a11y:smoke`. No View
Transitions. `applyTheme` writes both `data-theme` and
`data-color-scheme`.

## Relationship

Child of #26. Implement after #449 (same `apps/web` Header family).
Distinct from #456 (showcase topbar clip).
