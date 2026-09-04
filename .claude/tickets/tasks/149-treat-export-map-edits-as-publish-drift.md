---
id: 149
type: task
title: "Treat export-map edits as publish drift"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`guard:publish-drift` diffs only `src/` since the last CHANGELOG commit. An
export-map or `vite.config.ts` pack-entry change with no `src/` edit does not
look like drift. That is the `ui@0.6.0` class of failure.

## Work

Count `package.json` and pack config as unreleased surface.

## Done when

Changing a CSS export condition without a changeset fails the drift guard.

## Relationship

F-PACKAGING-007. Delta on #32.
