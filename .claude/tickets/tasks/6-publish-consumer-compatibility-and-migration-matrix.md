---
id: 6
type: task
title: "Publish the UI consumer compatibility and migration matrix"
created: 2026-08-02
parent: 32
status: open
history:
  - { state: open, at: 2026-08-02, note: "opened from the local ecosystem ticketing pass" }
---

Local consumers use materially different `@proyecto-viviana/ui` versions and
delivery mechanisms. A shared package can be authoritative while independently
released applications remain on different supported versions; the current
repository does not make that compatibility envelope easy to verify.

## Scope

- Inventory local consumers by package/version, import surface, styling/theme
  assumptions, delivery mechanism, framework/toolchain constraints, and
  representative tests.
- Publish a supported-version and migration matrix for
  `@proyecto-viviana/ui`, `solid-spectrum`, and any directly consumed lower
  layer.
- Mark breaking token, component, accessibility, or CSS/runtime changes and
  the conformance evidence required before a consumer upgrades.
- Add a read-only compatibility check or fixture that consumers and the
  Viviana CLI can invoke without sibling-workspace coupling.
- Keep release lanes independent when their supported contracts do not
  conflict.

## Done when

- Each inventoried consumer has a current, supported, deprecated, or unknown
  compatibility state.
- A consumer can determine its next safe migration without assuming the latest
  version is automatically compatible.
- Accessibility and shared behavior conformance is separate from
  application-specific composition and visual regression.
- Unsupported cross-layer combinations fail a local check before release.

## Non-goals

- Forcing every application onto one exact version.
- Moving application page composition into the UI repository.
- Collapsing the explicit package layer chain.

## Relationship

#1 governs the derivative boundary. #2 owns architecture-aware parity gates.
Viviana Cloud #114 owns the ecosystem manifest/doctor integration.
