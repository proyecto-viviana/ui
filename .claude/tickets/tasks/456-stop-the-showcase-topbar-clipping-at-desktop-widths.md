---
id: 456
type: task
title: "Stop the showcase topbar clipping at desktop widths"
created: 2026-09-04
parent: 26
status: verified
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from the 2026-09 train: showcase topbar clips at desktop widths; distinct from T9 theme transition",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; wrap .gls-topbar-nav above 820px",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "wrap strip above 820; overflow visible; a11y:smoke overflow contract",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 026016ac; wrap strip above 820; a11y:smoke overflow contract.",
    }
---

The `/showcase` topbar clips at desktop widths. Measure `.gls-topbar-nav`
overflow and stop the clip without changing the docs theme transition.

`apps/web` only. Not `apps/comparison`. Not a package.

## Evidence

cwd `/home/emoporemilio/projects/viviana-hub/ui`, parent `85c5ea1e`.

`.gls-topbar-nav` wraps above 820px (`flex-wrap`, `overflow: visible`,
`min-width: 0`); hidden `overflow-x: auto` scrollbar rules dropped.
`.gls-nav-select` still swaps in at `@media (width <= 820px)`. No
`--gls-nav-collapse`. Chrome comment no longer cites that phantom token.

`CI=1 vp exec --filter @proyecto-viviana/web -- playwright test e2e/showcase-topbar.spec.ts --reporter=line --workers=1 --retries=0` PASS (2): 1280 `/showcase` strip shown, `scrollWidth` not greater than `clientWidth`, no displayed `.gls-navlink` outside `.gls-topbar`; 820 strip `display:none`, select visible. Every PANELS slug + parity is a link or a select option. Hooked on `a11y:smoke`.

Owned-file `vp check` PASS. `git diff --check` PASS.
No wrangler/deploy. No changeset. `apps/comparison` untouched.

## Done when

The showcase topbar does not clip at desktop widths. The overflow is
measured before and after. Distinct from the pixel-art light/dark theme
transition (T9, unminted).

## Relationship

Child of #26. Distinct from #449 (viviana-ui docs entry) and from T9
(docs theme transition). Grill of T9 is unrelated.
