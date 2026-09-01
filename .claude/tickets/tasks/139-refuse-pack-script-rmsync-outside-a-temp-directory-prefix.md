---
id: 139
type: task
title: "Refuse pack-script rmSync outside a temp directory prefix"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`pack-local-chain.mjs` and `consume-pack-smoke.mjs` take output dirs from the
environment and `rmSync(..., { recursive: true })` with no prefix check.
Defaults are under `/tmp`.

## Work

Refuse resolved paths outside an allowed temp prefix.

## Done when

Setting `VIVIANA_PACK_OUT` to the repo root cannot delete the tree.

## Relationship

F-SEC-005. Local tooling, not a deployed surface.
