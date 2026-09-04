---
id: 444
type: task
title: "Make the dependency audit survive registry slowness"
created: 2026-09-03
parent: 443
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from Release Readiness CI 33825688122: guard:dependency-security timed out on the npm advisories bulk endpoint",
    }
---

`guard:dependency-security` (`package.json`) timed out in CI run
33825688122 on `registry.npmjs.org/-/npm/v1/security/advisories/bulk`
(error 23, 3 attempts). There is no `.npmrc` and no fetch settings in
`pnpm-workspace.yaml`.

Fix: pnpm fetch settings (`fetchRetries`, `fetchTimeout`,
`fetchRetryMaxtimeout`) in `pnpm-workspace.yaml`, verified against pnpm
11.22 docs. The gate stays strict (no `--ignore-registry-errors`).

## Evidence

CI run 33825688122, advisories bulk timeout, error 23, three attempts.
No `.npmrc`. No fetch settings in `pnpm-workspace.yaml`.

## Done when

`vp run guard:dependency-security` passes locally and the Release
Readiness workflow passes the audit step on PR #33.

## Relationship

Child of #443. Related to #81 and #5.
