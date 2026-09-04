---
id: 447
type: task
title: "Record Kumo npm and trusted-publisher evidence"
created: 2026-09-03
parent: 443
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "npm side completed 2026-09-04; remaining work is release-prerequisites.json plus kumo publishConfig.access",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "skip: small-task; recording registry evidence and kumo publishConfig.access",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "release-prerequisites.json satisfied; packages/kumo publishConfig.access public",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 3ca3a915; Done-when proved: guard:release-prerequisites and ci:changesets pass",
    }
---

npm side completed 2026-09-04:
`@proyecto-viviana/kumo@0.0.0-bootstrap.0` published public (created
2026-09-04T02:14:43.024Z, deprecated `Name reservation only. Use >=0.1.0.`),
trusted publisher `type: github`, `id: b211877d-f6ae-4e99-81c9-671a5482a729`,
`file: release.yml`, `repository: proyecto-viviana/ui`,
`permissions: publish, stage publish`. Owner matched the MFA/publishing-access
page to solid-stately.

Recorded both in `scripts/release-prerequisites.json` (`satisfied: true`,
evidence strings) and added `publishConfig.access: "public"` to
`packages/kumo/package.json` for sibling parity.

## Evidence

research/plan/drill: skip: small-task

cwd: `/home/emoporemilio/projects/viviana-hub/ui`
revision at proof: `e38823d35b2a52fdde4ae844db902d033e4574c0` plus named working-tree edits

- Source: passed. `scripts/release-prerequisites.json` both prerequisites
  `satisfied: true` with evidence strings; `packages/kumo/package.json`
  declares `"publishConfig": { "access": "public" }` after `exports`.
- Local: passed.
  - `npm view @proyecto-viviana/kumo name version time dist-tags deprecated --json`
    (public read, no auth) →
    `name=@proyecto-viviana/kumo version=0.0.0-bootstrap.0 time.created=2026-09-04T02:14:43.024Z time.modified=2026-09-04T02:26:27.063Z time[0.0.0-bootstrap.0]=2026-09-04T02:14:43.291Z dist-tags.latest=0.0.0-bootstrap.0 dist-tags.bootstrap=0.0.0-bootstrap.0 deprecated="Name reservation only. Use >=0.1.0."`
  - `vp run guard:release-prerequisites` →
    `SKIP: @proyecto-viviana/kumo@0.0.0 is not a publish candidate.` then
    `release prerequisites — PASS` (exit 0).
  - Fail-closed `/tmp` copy of the guard + manifests, kumo version `0.1.0`,
    evidence intact → `release prerequisites — PASS` (exit 0).
  - Same `/tmp` copy with `satisfied: false` → FAIL (exit 1) for both
    `npm-package-registered` and `trusted-publisher-registered`.
  - `vp exec tsx scripts/check-changeset-required.mjs` →
    `Changeset covers every changed package: ... @proyecto-viviana/kumo ...`
    (exit 0). No new `.changeset/*.md`: existing kumo changeset already names
    the package.
  - `vp exec tsx scripts/check-changeset-status.mjs` → packages to be bumped
    include `@proyecto-viviana/kumo` (exit 0).
  - `guard:publish-drift` (`scripts/check-publish-drift.mjs`) is read-only
    (git log/diff + pending changesets; no writes). `vp run ci:changesets` →
    exit 0; tree left clean.
- Release: passed (registry). Public package
  https://www.npmjs.com/package/@proyecto-viviana/kumo
  `@proyecto-viviana/kumo@0.0.0-bootstrap.0`.
- Provider: owner-captured. `npm trust list @proyecto-viviana/kumo` at
  2026-09-04T02:23Z (2FA-gated, not re-run): `type: github`,
  `id: b211877d-f6ae-4e99-81c9-671a5482a729`, `file: release.yml`,
  `repository: proyecto-viviana/ui`, `permissions: publish, stage publish`.
  First OIDC publish from `release.yml` is the independent confirmation.
- Integration / Deployment / Human: not required for this slice.

## Done when

`vp run guard:release-prerequisites` and `vp run ci:changesets` pass.

## Relationship

Child of #443. Related to #37 (kumo package baseline remainder). A task
cannot parent a task, so this is not a child of #37.
