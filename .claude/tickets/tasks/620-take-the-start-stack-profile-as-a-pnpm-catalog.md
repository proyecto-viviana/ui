---
id: 620
type: task
title: "Take the Start stack profile as a pnpm catalog"
created: 2026-10-02
status: open
history:
  - {
      state: open,
      at: 2026-10-02,
      note: "Projects #137 step 5; Start 0.3.0 profile, Projects decision 042 (`../viviana-projects/decisions/042-one-stack-owned-by-start.md`); requested by the hub session 2026-10-02",
    }
---

Hold the shared stack's versions in one pnpm `catalog:` written by Start
(`viviana-start/packages/start/stack-profile.json`, Start 0.3.0), so a
profile bump is one `planUpgrade` run (recipe `start/stack-catalog`). That
run writes only the `catalog:` and `allowBuilds:` blocks of
`pnpm-workspace.yaml`. Manifests move to `catalog:` in ui's own edit. Use
Start at or after its commit `146fe95` (#22, the receipt-scan fix for
workspace members' `node_modules`). Worked example: viviana-mails
`9484d64`, ticket 12.

## Drift

The hub reported this on 2026-10-02 (`stack-drift`). Re-measure before the
work.

Behind: vite-plus and vite 0.2.9 (profile 1.0.0), vitest 4.1.11 (profile
5.0.3), wrangler ^4.124.0 (profile 4.147.0), typescript 6.0.3 (profile
7.0.2).

Ahead: solid-js 2.0.0-rc.9, and `@tanstack/solid-router` and solid-start
2.0.0-rc.8. The profile is Solid 1.9.15 and TanStack 1.x.

## Exception

The ahead set stays as a dated exception on this ticket, not a downgrade.
Whether the profile moves to Solid 2 is an owner call on the hub queue.

## Notes

This repo already has a `catalog:` for vite and vitest, and an
`overrides:` block, both in `pnpm-workspace.yaml`. Every version move is
a dependency change that needs the owner's go at the time of the work.
The TypeScript 7 and vitest 5 majors need the full gates ladder.
