---
id: 453
type: task
title: "Consume published `import` condition in comparison chrome islands"
created: 2026-09-04
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (e); owner-confirmed title; chrome-only. Parent is #136 (a task cannot parent a task).",
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
