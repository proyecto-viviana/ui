---
id: 226
type: task
title: "Pack solid-stately per primitive with the existing solidaria entry names"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
---

## Cause

Owner decision on #219 item 2. `solid-stately` packs one 422,867-byte
`dist/index.js`; `solidaria` and `solidaria-components` pack per primitive;
Adobe ships one package per primitive.

## Work

Add per-primitive entries to `packages/solid-stately/vite.config.ts` and
`package.json` `exports`, reusing the directory names `solidaria` already
exposes as subpaths (no new names). Keep the root barrel. Pair with the DCE
proof (#212) so a barrel import of one primitive drops the rest. Update
`guard:package-artifacts` expectations and `ui:smoke` subpath counts.
Changeset (minor: additive entries).

## Done when

Every solid-stately primitive has a subpath matching solidaria's name for it;
`ui:smoke` covers them; #212's proof shows a single-primitive import excludes
the others.

## Relationship

Owner decision on #219 item 2. Depends on #212.
