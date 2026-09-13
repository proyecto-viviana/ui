---
id: 453
type: task
title: "Consume published `import` condition in comparison chrome islands"
created: 2026-09-04
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (e); owner-confirmed title; chrome-only. Parent is #136 (a task cannot parent a task).",
    }
  - {
      state: merged,
      at: 2026-09-12,
      note: "Implemented comparisonChromePublishedConditionPlugin for safe chrome layout islands (DocsSidebar, DocsTopBar, DocsFooter, DocsToc, CatalogueOverview, IndexHero, ComponentDetailHero, ComponentDetailMeta, MarketingHero, MarketingCta). Target packages resolve to compiled dist/*.js via published import condition; ComponentExampleSection, ComponentExampleControls, fixtures, and D12 islands strictly excluded on source condition. No duplicate Provider under #example. Verified comparison:build, fixture-registry-split.test.ts, client-router.test.ts, chrome-published-condition.test.ts, and guard:comparison-atom-css.",
    }
---

Chrome islands only. vite-plugin-solid prepends the `solid` condition, so
subpaths resolve to `dist/*.jsx` unless chrome importers use
`["import","default"]`. Skip this slice if it would put two `Provider`
modules under `#example`.

Safe chrome importers: DocsSidebar, DocsTopBar, DocsFooter, DocsToc,
CatalogueOverview, IndexHero, ComponentDetailHero, ComponentDetailMeta,
MarketingHero, MarketingCta. Explicitly excluded: ComponentExampleSection,
ComponentExampleControls, fixtures, D12 islands.

Do not cite `ui:consume-smoke` as solid-spectrum `import` coverage.

## Done when

Chrome network URLs for TopBar/Sidebar are `.js`; fixture URLs remain
`.jsx`. Two `Provider` modules under `#example` is a fail — skip the slice
instead and record the skip on this ticket. Pair/contract/certified stay
green.

## Relationship

Child of #136. Slice (e) of #255. After #452. Optional; skip is an owner
decision, not a silent pass. Distinct from #451's file list.

## Evidence

- Source: `apps/comparison/scripts/chrome-published-condition.mjs` implements `comparisonChromePublishedConditionPlugin` with `enforce: "pre"`. Configured in `apps/comparison/astro.config.mjs`.
- Safe chrome layout islands: `DocsSidebar`, `DocsTopBar`, `DocsFooter`, `DocsToc`, `CatalogueOverview`, `IndexHero`, `ComponentDetailHero`, `ComponentDetailMeta`, `MarketingHero`, `MarketingCta`, plus their mount scripts and compiled dist dependencies.
- Target packages (`@proyecto-viviana/solid-spectrum`, `@proyecto-viviana/ui`, `@proyecto-viviana/solidaria`, `@proyecto-viviana/solidaria-components`) resolve to compiled `dist/*.js` using `["import", "default"]` export conditions.
- Strict exclusions: `ComponentExampleSection`, `ComponentExampleControls`, `ComponentExampleFiles`, `ComponentExamplePreview`, fixtures (`fixtures/styled/*`, `fixture-registries/*`), and D12 islands (`SolidButtonIsland`, `SolidMeterIsland`, `/d12/*`) strictly fall through to source/JSX conditions.
- Invariant: Exactly one `Provider` module loaded under `#example` (source condition `packages/solid-spectrum/src/Provider.ts`).
- Verification:
  - `vp run comparison:build`: 91 pages built cleanly in 21.51s.
  - `node scripts/check-comparison-atom-css.mjs`: ok — 1578 referenced atoms across 225 files all defined.
  - `vp test run apps/comparison/src/data/fixture-registry-split.test.ts`: 7 passed.
  - `vp test run apps/comparison/src/data/client-router.test.ts`: 8 passed.
  - `vp test run apps/comparison/src/data/chrome-published-condition.test.ts`: 5 passed.
  - `vp run --filter @proyecto-viviana/comparison guard:chrome-published-condition`: ok.
