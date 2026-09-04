---
id: 146
type: task
title: "Run packed-consumer smoke over every public package in CI"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`consume-pack-smoke.mjs` forbids `/src/` export targets and requires a
self-contained `dist/styles.css`, but it only inspects installed `ui` and
`kumo`. `ui:smoke` is in no GitHub workflow. Spectrum's CSS `default` → `src`
stub was invisible.

## Work

Walk all six public packages. Run the smoke on Certification Gates or Release
Readiness.

## Done when

A Spectrum CSS `default` pointing at `src/` fails CI.

## Relationship

F-PACKAGING-002. Delta on #32. The Spectrum CSS default itself was fixed in
the audit pass.

## Round-2 note (2026-09-01)

Round 2: `pack-local-chain` packs six tarballs but the consumer depends only on `ui` and `kumo`; the solid-spectrum tarball is never extracted and solid-stately/solidaria/solidaria-components export maps are not walked. Done-when should read: any public export target containing `/src/` fails CI. The Spectrum CSS example in Cause is already fixed. #212 adds a DCE assertion to the same smoke.
