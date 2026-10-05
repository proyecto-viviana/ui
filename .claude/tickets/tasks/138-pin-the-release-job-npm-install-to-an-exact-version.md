---
id: 138
type: task
title: "Pin the Release job npm install to an exact version"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-10-05,
      note: "Verified that .github/workflows/release.yml installs exact npm version 11.19.1 with the non-floating comment. Guarded by scripts/check-workflow-pins.mjs and tested by scripts/check-workflow-pins.test.ts (7/7 tests pass).",
    }
---

## Cause

The trusted-publish job runs `npm install -g npm@^11.5.1`. Every third-party
action in this repo is SHA-pinned. A later 11.x that satisfies the caret is
what actually publishes.

## Work

Owner picks an exact npm 11.x. Pin it in `.github/workflows/release.yml`.

## Done when

The Release job installs an exact npm version, with a comment that the range
must not float.

## Relationship

Not #133 (Node 20 action runtimes). F-SEC-004.
