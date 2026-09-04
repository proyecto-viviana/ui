---
id: 446
type: task
title: "Re-sync cardview and HelpText into viviana-ui"
created: 2026-09-03
parent: 443
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from Certification Gates 33825688013: guard layer-boundary reports 2 new forks; wrap/compose, no re-baseline",
    }
---

`guard layer-boundary` in Certification Gates run 33825688013 reports 2
new forks: `cardview/index.tsx`, `form/HelpText.tsx`. Direction is
wrap/compose, no re-baseline.

## Evidence

Certification Gates run 33825688013. New forks:
`packages/viviana-ui` copies of `cardview/index.tsx` and
`form/HelpText.tsx`.

## Done when

`vp exec tsx scripts/check-layer-boundary.ts` PASS, `vp run check`
green, and a changeset for `@proyecto-viviana/ui` if source changed.

## Relationship

Child of #443. Related to #1 (layer-boundary remainder). A task cannot
parent a task, so this is not a child of #1.
