---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Overnight parity audit research pack (2026-06-15)

> **Stage status:** this pack currently contains the completed **breadth-mapping / audit-seeding stage**. It is not the finished overnight deep audit. The next stage is depth-first source comparison by component family, with concrete upstream-vs-local deltas recorded as findings.

This directory is analysis-only research output. It intentionally records mappings, evidence gaps, and recommended future fixes without changing implementation code.

## Documents

- [Upstream/local source map](./upstream-local-map.md)
- [Component audit matrix](./component-audit-matrix.md)
- [Evidence gap ledger](./evidence-gap-ledger.md)
- [Cross-cutting architecture findings](./cross-cutting-architecture-findings.md)
- [Research session log](./research-session-log.md)
- [Per-component audit seeds](./components/)
- [Stage status](./stage-status.md)
- [Depth audit slices](./depth-audits/)
- [External standards obligations](./external-standards-obligations.md)

## Current headline

- Official S2 catalogue entries mapped: **69**.
- Components with at least one local implementation path found by automated map: **66/69**.
- Components with upstream S2 paths found: **69/69**.
- Components with component-specific comparison e2e specs found: **53/69**.
- Strict comparison parity report is green, but gap report shows only **56/349** visual states currently held by strict pair-diff tests and **113/349** with current React/Solid visual evidence.

## Audit rule

A component should not be considered newly certified by this pack alone. These documents are a breadth map plus source-backed audit queue; each component still needs the per-component playbook gates closed with behavior tests that can fail for the intended branch.
