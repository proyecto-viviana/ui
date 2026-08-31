---
id: 89
type: task
title: "Decide the TableView native-table boundary"
created: 2026-08-20
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from adversarial finding A-006 and the remaining-work census",
    }
---

The Solid TableView uses a native `<table>` with spacer-row virtualization.
Upstream Spectrum S2 uses `div[role="grid"]`. Current evidence excludes major
structure, virtualization, focus, and interaction branches because of this
difference.

## Owner decision required

Choose one direction before changing the public or accessibility contract:

- ratify the native-table design as an explicit local architecture and define
  its complete semantic and evidence contract; or
- converge on the upstream structure and behavior.

Do not treat the current exclusions as full certification.

## Done when

The owner decision is documented in a stable specification or ADR. The
implementation and every applicable acceptance gate match that decision.

## Relationship

Preserves adversarial finding A-006 and the older T-87 decision point.
