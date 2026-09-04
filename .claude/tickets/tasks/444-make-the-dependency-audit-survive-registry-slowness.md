---
id: 444
type: task
title: "Make the dependency audit survive registry slowness"
created: 2026-09-03
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from Release Readiness CI 33825688122: guard:dependency-security timed out on the npm advisories bulk endpoint",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "pnpm-workspace.yaml fetchRetries 4, fetchTimeout 120000; no ignore-registry-errors",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "workspace fetch settings live; local guard:dependency-security passed after two error-23 retries",
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

skip: small-task — research / plan / drill (implement + independent review).

pnpm 11.22.0 (`vp exec pnpm --version`). Settings honoured from
`pnpm-workspace.yaml` in camelCase: `fetchRetries`, `fetchRetryFactor`,
`fetchRetryMintimeout`, `fetchRetryMaxtimeout`, `fetchTimeout`
(https://pnpm.io/settings/network; `vp exec pnpm help config` says
`--location project` writes `pnpm-workspace.yaml`). Defaults in
`~/.vite-plus/package_manager/pnpm/11.22.0/pnpm/dist/pnpm.mjs` (approx.
168485–168489): `fetch-retries` 2, `fetch-retry-factor` 10,
`fetch-retry-maxtimeout` 60000, `fetch-retry-mintimeout` 10000,
`fetch-timeout` 60000. `pnpm audit` uses the same retry/timeout
(`createAuditNetworkOptions` → `fetchWithDispatcher`; retry log
`Will retry in` at 158069). Chosen values: `fetchRetries: 4`,
`fetchTimeout: 120000`, backoff pinned at docs defaults (factor 10,
min 10000, max 60000).

Arithmetic (one bulk POST, full outage): attempts = retries + 1 = 5.
Backoff `min(minTimeout × factor^i, maxTimeout)`: 10s + 60s + 60s + 60s
= 190s. Sum = 5 × 120s + 190s = 790s = 13m10s. That is ~12 minutes
(owner examples); still under the 30-minute `release-readiness` job so
a dead registry fails cleanly. The gate runs two audits; two full
outages would be 26m20s, still under 30m if earlier steps are short.
No `--ignore-registry-errors`, no skip.

Live proof, cwd `/home/emoporemilio/projects/viviana-hub/ui`, working
tree atop `3ca3a915` with the workspace yaml already edited:

- `vp pm config get fetch-timeout` → `120000`
- `vp pm config get fetch-retries` → `4`
- `vp pm config get fetch-retry-factor` → `10`
- `vp pm config get fetch-retry-mintimeout` → `10000`
- `vp pm config get fetch-retry-maxtimeout` → `60000`
- `vp run guard:dependency-security` exit 0, `elapsed_sec=411.35`
  (~6m51s). High audit: two error-23 retries (`Will retry in 10
  seconds. 4 retries left.` then `Will retry in 1 minute. 3 retries
  left.`), then `No known vulnerabilities found`. Prod audit: `No
  known vulnerabilities found`. Peers: none.

Independent review: camelCase names match pnpm 11.22 network docs;
`config get` and the `4 retries left` line prove audit honouring the
workspace file (ticket #5's silent-ignore concern). Gate stayed
strict. 13m10s is ~1 min over a strict 12-minute reading; kept the
named examples. No `.npmrc`, no `package.json` `pnpm` block.

CI proof lands with the next push of `audit-2026-09-round-2` (#448).

## Done when

`vp run guard:dependency-security` passes locally and the Release
Readiness workflow passes the audit step on PR #33.

## Relationship

Child of #443. Related to #81 and #5.
