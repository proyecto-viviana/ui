---
id: 149
type: task
title: "Treat export-map edits as publish drift"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-10-05,
      note: "Added vite.config.ts pack config to publishedPaths in scripts/check-publish-drift.mjs alongside package.json and README.md. Added unit test cases in scripts/check-publish-drift.test.ts verifying that an export condition change in package.json and a vite.config.ts pack configuration change fail the drift guard unless covered by a changeset naming the package (26/26 tests passing). Added changeset for recent package features and fixes. Verified vp run ci:changesets passes with exit 0.",
    }
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
