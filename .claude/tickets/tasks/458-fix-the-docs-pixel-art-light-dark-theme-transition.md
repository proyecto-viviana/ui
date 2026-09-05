---
id: 458
type: task
title: "Fix the docs pixel-art light/dark theme transition"
created: 2026-09-04
parent: 26
status: verified
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
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "review changes-required; replace --surface-app tile fill with old-page snapshot",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "old-page layout overlay + Bayer tiles; fill-only wipe fails the spec",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 01b41323; old-page overlay + Bayer tiles; fill-only wipe fails the spec.",
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

cwd `/home/emoporemilio/projects/viviana-hub/ui`, parent `de696c30`.
Review changes-required on `622bc7af`: overlay was a 12×12 `--surface-app` fill
after swap. Follow-up: `dualWipe` snapshots the live old chrome (header / nav /
labels) as the overlay, never a `--surface-app` fill. Failed / empty snapshot
takes the no-canvas path. SVG-as-image foreignObject of this CSS hangs (filters

- url() raster); getContext during the click evaluate never returns.

`CI=1 vp exec --filter @proyecto-viviana/web -- playwright test e2e/theme-wipe.spec.ts --reporter=line --workers=1 --retries=0` PASS (3): Header toggle on `/solid-spectrum/docs` mounts wipe canvas and flips both attrs; `/showcase` wipe records >2 non-surface colors and never a covering 12×12 `--surface-app` `fillRect`; `prefers-reduced-motion` skips canvas and still flips scheme.

Owned-file `vp check` PASS. `vp run typecheck` PASS. `git diff --check` PASS.
Full `vp run check` not clean: #451 comparison files fail format (untouched).
No wrangler/deploy. No changeset. `apps/comparison` untouched. No View Transitions.

## Done when

Shared `toggleTheme` owns one one-pass Bayer wipe. `chrome.tsx` no
longer calls `dualWipe`. Coverage runs in `vp run a11y:smoke`. No View
Transitions. `applyTheme` writes both `data-theme` and
`data-color-scheme`.

## Relationship

Child of #26. Implement after #449 (same `apps/web` Header family).
Distinct from #456 (showcase topbar clip).
