---
id: 41
type: task
title: "Align the kumo-solidaria proposal with the Button pilot and repository boundary"
created: 2026-08-20
parent: 29
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task kumo-sibling-proposal-sync" }
---

Update the sibling proposal so that it matches the proved Button pilot and the repository layer boundary.

This is a separate-repository documentation change. It must not copy runtime
source or create a filesystem dependency.

## Done when

- The proposal names `Button`, `@proyecto-viviana/kumo`, and the exact
  `@cloudflare/kumo@2.11.0` oracle.
- It points to the implementation revision and reports unit, tarball,
  comparison, browser, and visual evidence separately.
- It says this repository owns the Solid implementation and
  `../kumo-solidaria` owns Cloudflare-facing review and governance context.
- It lists current gaps and does not describe the experiment as a port.
- It adds no Solid runtime source, workspace link, or file dependency.

## Relationship

Depends on #37. Replaces the legacy sibling-proposal task specification.
