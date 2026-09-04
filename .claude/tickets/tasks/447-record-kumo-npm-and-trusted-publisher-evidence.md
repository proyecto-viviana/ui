---
id: 447
type: task
title: "Record Kumo npm and trusted-publisher evidence"
created: 2026-09-03
parent: 443
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "npm side completed 2026-09-04; remaining work is release-prerequisites.json plus kumo publishConfig.access",
    }
---

npm side completed 2026-09-04:
`@proyecto-viviana/kumo@0.0.0-bootstrap.0` published public (created
2026-09-04T02:14:43.024Z, deprecated "Name reservation only. Use
>=0.1.0."), trusted publisher `type: github`,
`id: b211877d-f6ae-4e99-81c9-671a5482a729`, `file: release.yml`,
`repository: proyecto-viviana/ui`, `permissions: publish, stage publish`.
Owner matched the MFA/publishing-access page to solid-stately.

Remaining: record both in `scripts/release-prerequisites.json`
(`satisfied: true`, evidence strings), add
`publishConfig.access: "public"` to `packages/kumo/package.json` for
sibling parity.

## Evidence

npm package `@proyecto-viviana/kumo@0.0.0-bootstrap.0` created
2026-09-04T02:14:43.024Z, public, deprecated as name reservation.
Trusted publisher id `b211877d-f6ae-4e99-81c9-671a5482a729` on
`proyecto-viviana/ui` `release.yml`.

## Done when

`vp run guard:release-prerequisites` and `vp run ci:changesets` pass.

## Relationship

Child of #443. Related to #37 (kumo package baseline remainder). A task
cannot parent a task, so this is not a child of #37.
