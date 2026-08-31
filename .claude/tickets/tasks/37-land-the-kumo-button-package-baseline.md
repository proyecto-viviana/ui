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

- The package remains at the deliberate non-candidate version `0.0.0`.
- The pending Changeset includes Kumo.
- `scripts/release-prerequisites.json` records npm package and trusted-publisher
  registration as unsatisfied.
- Release checks skip the deliberate `0.0.0` version and fail any nonzero Kumo
  version until both external prerequisites have verified evidence.
- Negative contract fixtures hold the fail-closed behavior.

## Resume here

Do not change either prerequisite to satisfied from a written claim alone.
Register and verify the npm package and trusted publisher independently. Then
run the release-prerequisite guard and packed-package checks.

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
