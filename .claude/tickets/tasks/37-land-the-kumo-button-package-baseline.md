---
id: 37
type: task
title: "Land the experimental Kumo Button package as a releasable workspace sibling"
created: 2026-08-20
parent: 29
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "migrated from legacy task kumo-button-package-baseline",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "recorded the fail-closed first-publish prerequisite and current package evidence",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: '#447 recorded both release prerequisites as satisfied. npm-package-registered: 2026-09-04 public read npm view @proyecto-viviana/kumo name version time dist-tags deprecated --json → name=@proyecto-viviana/kumo version=0.0.0-bootstrap.0 time.created=2026-09-04T02:14:43.024Z time.modified=2026-09-04T02:26:27.063Z time[0.0.0-bootstrap.0]=2026-09-04T02:14:43.291Z dist-tags.latest=0.0.0-bootstrap.0 dist-tags.bootstrap=0.0.0-bootstrap.0 deprecated="Name reservation only. Use >=0.1.0." public https://www.npmjs.com/package/@proyecto-viviana/kumo. trusted-publisher-registered: 2026-09-04T02:23Z owner-captured (2FA-gated, not re-run) npm trust list @proyecto-viviana/kumo → type: github, id: b211877d-f6ae-4e99-81c9-671a5482a729, file: release.yml, repository: proyecto-viviana/ui, permissions: publish, stage publish. First OIDC publish from release.yml is the independent confirmation.',
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "rewrote Current evidence and Resume here to match 3ca3a915: both Kumo prerequisites satisfied; remaining work is this ticket's Done-when",
    }
---

Land the Kumo Button package as a releasable sibling in the workspace.

The original plan started on 2026-08-13. Its target was open.

## Scope

- Keep Kumo as a styled sibling that depends on `solidaria-components`.
- Keep the public slice limited to `Button` and its Kumo-shaped API.
- Keep the source pin, Cloudflare MIT attribution, Changeset, build order,
  tarball pack, DOM and SSR smoke, and repository guards in the change.
- Document the unsupported surface: tooltip `title`, `LinkButton`,
  `RefreshButton`, public `Loader`, `buttonVariants`, and React object refs.
- Do not publish as part of this ticket.

## Current evidence

- The workspace package remains the deliberate non-candidate version `0.0.0`.
- The pending Changeset includes Kumo.
- `scripts/release-prerequisites.json` records both prerequisites as satisfied
  at `3ca3a915` (#447).
  - `npm-package-registered`: 2026-09-04 public `npm view` of
    `@proyecto-viviana/kumo@0.0.0-bootstrap.0` (created
    2026-09-04T02:14:43.024Z). Deprecated:
    `Name reservation only. Use >=0.1.0.`
    Public: https://www.npmjs.com/package/@proyecto-viviana/kumo
  - `trusted-publisher-registered`: 2026-09-04T02:23Z owner-captured
    (2FA-gated, not re-run) `npm trust list @proyecto-viviana/kumo` →
    type: github, id: b211877d-f6ae-4e99-81c9-671a5482a729, file:
    release.yml, repository: proyecto-viviana/ui, permissions: publish,
    stage publish. First OIDC publish from `release.yml` is the independent
    confirmation.
- `guard:release-prerequisites` skips the deliberate `0.0.0` version and
  still fails any nonzero Kumo version if that evidence is missing.
- Negative contract fixtures hold the fail-closed behavior.

## Resume here

Both npm-package and trusted-publisher prerequisites are recorded and
satisfied. Do not re-open them from a written claim. Remaining work is this
ticket's Done-when: unit tests, packed-package surface, repository guards,
and the named `vp run` gates. The first real (nonzero) Kumo publish is
still not this ticket.

## Done when

- Unit tests name pointer, keyboard, disabled, loading, icon, shape, size,
  variant, ref, and attribute-forwarding failure modes.
- The packed package exposes the root, Button deep import, CSS, types, Solid
  condition, DOM use, and SSR use.
- Repository guards include the sixth releasable package without weakening an
  existing budget.
- `vp run build:kumo`, the focused Kumo test, `vp run ui:smoke`,
  `vp run test:ci-guard-contracts`, and `vp run ci:changesets` pass.

## Relationship

Replaces the legacy `kumo-button-package-baseline` task specification.
