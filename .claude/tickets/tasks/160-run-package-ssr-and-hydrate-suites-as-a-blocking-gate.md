---
id: 160
type: task
title: "Run package SSR and hydrate suites as a blocking gate"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "scripts, Certification Gates step, and #134 it.fails envelope landed; pending orchestrator verification",
    }
---

## Cause

Default Vitest excludes `*.ssr.test.*` and `*.hydrate.test.*`. `test:run` and
Certification Gates never invoke those configs. SSR tests write `output/*.html`
and hydrate tests read them, with no orchestrator. The ListView hydrate test
that #134 already knows fails cannot redden CI.

## Work

Add `test:ssr` / `test:hydrate` (ssr then hydrate). Put them on the blocking
ladder once known reds have tickets.

## Done when

A failing hydrate test fails Certification Gates.

## Relationship

F-TEST-001 and F-TEST-014. #134 / #131 / #135 own the component bugs.

## Round-2 note (2026-09-01)

Round-2 cost: with the suites run once, hydrate is red on `Form+TextField (profile shape)` (#184) as well as #134. Prerequisites before this gate can be blocking: `noDiscovery` on the hydrate/ssr configs (landed round 2), shared `sharedConfig` reset and the Kumo reader (#191), and tickets for both reds.

## Landed

- Root scripts `test:ssr` and `test:hydrate` run `vitest.ssr.config.ts` then
  `vitest.hydrate.config.ts`.
- Both sit on `ci:release-readiness` after `test:run`, and as blocking
  Certification Gates steps after `vp check` (summary env + table rows; no
  `continue-on-error`).
- The #134 ListView interactive hydrate case is wrapped in `it.fails` so the
  gate is green today and goes red the day the product bug is fixed.
- Gate-ladder paragraph in `.claude/current/tooling.md` lists the two scripts
  as blocking.
