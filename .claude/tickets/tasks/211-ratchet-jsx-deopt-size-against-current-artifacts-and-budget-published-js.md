---
id: 211
type: task
title: "Ratchet jsx-deopt-size against current artifacts and budget published js"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`guard:jsx-deopt-size` fails only when a `.jsx` exceeds 500,000 bytes
(`scripts/check-jsx-deopt-size.ts:23-41, 67-80`). Largest published `.jsx`
today is `packages/solidaria/dist/_chunk/dnd.jsx` at 134,350 bytes (3.7×
headroom, no high-water mark). `.js` artifacts are not scanned, so
`packages/viviana-ui/dist/style/index.js` (971,881 bytes),
`packages/solid-spectrum/dist/style/index.js` (966,401) and
`packages/solid-stately/dist/index.js` (422,867) have no ceiling; the style
modules were moved to `.js` specifically to escape the deopt. Certification
Gates comments that the guard "measures the published package artifacts"; it
does not.

## Work

Record the current per-file maximum and fail on growth beyond a stated
tolerance; give `.js` artifacts their own budget. Do not add a `KNOWN_LARGE`
waiver for the style files.

## Done when

A 10% growth of any published artifact fails the guard; the workflow comment
matches what it measures.

## Relationship

F-PERF-002. Leftover of #148's decision; #219 decides the oracle.
