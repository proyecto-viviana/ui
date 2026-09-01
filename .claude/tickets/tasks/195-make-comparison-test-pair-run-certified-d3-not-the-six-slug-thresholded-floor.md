---
id: 195
type: task
title: "Make comparison test pair run certified D3 not the six-slug thresholded floor"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`certification.md:85-86` labels `vp run comparison:test:pair` "React-vs-Solid
pair diffs". The script runs only `default-state-pair-diff.spec.ts` over six
default canvases (`apps/comparison/e2e/default-state-cases.ts:11-42`).
ButtonGroup is allowed `maxMismatchRatio: 0.4`, Provider 0.34,
ActionButtonGroup 24px of size drift. Both canvases are screenshotted with
`Promise.all` on one page, which `harness-evidence-integrity.md:41-44` says
captures must not do. `diffScreenshots` compares `min(width) x min(height)`
and judges the uncompared strip only by `maxDimensionDelta`
(`visual-diff.ts:582-617`), so a missing row or a pending spinner in a 24px
strip is not in the ratio. Certified D3 walks one panel per `goto` at
`exactPairDiff`; this CI job is a floor sitting in front of it.

## Work

Point the CI pair job at the certified D3 walk (or a D3 subset), retire the
thresholded six-slug spec or move it out of the certified vocabulary, and
correct `certification.md`'s description of the command.

## Done when

`comparison:test:pair` fails on a one-LSB React/Solid divergence outside the
registered #75/#77/#105 floors, and no CI job labeled "pair" allows a 40%
mismatch.

## Relationship

F-HARNESS-003. Not #75/#77/#105 (measured D3 floors).
