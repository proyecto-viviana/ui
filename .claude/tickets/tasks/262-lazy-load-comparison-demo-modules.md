---
id: 262
type: task
title: "Lazy-load per-slug demo modules in comparison component-controls"
created: 2026-09-03
parent: 26
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "production leftover of #250 / overlap with #255 item 3: component-controls.ts still statically imports 64 *-demo modules on every component page",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; slice (b) after (a) #451. No ticket-session. HEAD 01b41323.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "per-slug () => import(\"./<slug>-demo\") loaders; getComponentControlGroup async; catalogue/hero off the controls graph.",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 85c5ea1e; per-slug demo loaders; Button demoHitCount 1 / coverage 0.",
    }
---

`apps/comparison/src/data/component-controls.ts` statically imports **64**
`*-demo` modules. `component-example-section-mount.tsx` always imports
`initializeComparisonControls` before the lazy `react-mount` / `solid-mount`.
Every component page hydrates a controls chunk that knows every slug's demo
defaults.

## Why

#250 cut giant `react-mount` / `solid-mount` chunks. Preview JS is still
2.12 MB / 265 files on picker because the controls graph is not per-slug.
#255 named this as a **dev** work item; the production effect is this ticket.

## Do not

- Fold this into #255 or start #255 without the owner.
- Patch S2 styling to hide the cost.

## Done when

A Button page does not parse ComboBox/TableView/ColorWheel demo modules.
Production preview JS request count for one slug is recorded against today's
265-file picker baseline.

## Relationship

Child of #26. Production sibling of #255 item 3. Surfaced by #259.
Slice (b) of comparison-app-route-load. After #451. Distinct from #261 /
#255 (d)(e)(f).

## Evidence

Artifacts: `.agents/vivianastack/comparison-app-route-load/` (`plan.md` slice
(b), `grill.md` verdict `go`). Cwd
`/home/emoporemilio/projects/viviana-hub/ui`. Baseline HEAD `01b41323`.

Source: `component-demo-loaders.ts` is `Record<slug, () => import("./<slug>-demo")>`
(69 keys, 64 demo files; family slugs merge). `getComponentControlGroup` is
async and loads one slug. IndexHero / CatalogueOverview / coverage.astro /
IndexHeroFallback use `coverage.ts` + comparison-manifest only. SSR fallbacks
`await` the current slug. Guard `demo-control-split` fails
`^import .* from "./.*-demo"` in `component-controls.ts`. No changeset
(comparison app is not published). `apps/web` untouched. Not #261 CSS,
optimizeDeps, import-condition, or ClientRouter.

Local: `vp run comparison:test:demo-control-split` 4 passed (cwd ui).
`vp run --filter @proyecto-viviana/comparison guard:demo-control-split`
`demo control split: ok`. `git diff --check` exit 0. Node smoke:
`loadComponentControlGroups()` 69 groups; button 8 controls.

Live measure: implementer `astro dev` `http://127.0.0.1:4350` (not owner
`:4321`). Playwright CDP `/-demo\.(ts|js)/` on `/components/button/`:
`demoHitCount === 1` (`src/data/button-demo.ts` only); ComboBox / TableView /
ColorWheel demo URLs empty. `/coverage/`: `demoHitCount === 0`. Production
preview JS request count vs 265-file picker baseline: not run (`comparison:build`
not run).
