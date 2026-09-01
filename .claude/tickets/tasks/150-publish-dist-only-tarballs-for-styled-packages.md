---
id: 150
type: task
title: "Publish dist-only tarballs for styled packages"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Public packages set `"files": ["dist", "src", …]`. Styled `src/` includes
generated icon trees (888 / 923 files). JS/JSX exports already target `dist`.

## Work

Prove source maps still work without shipping `src`. Narrow `files` after that
proof.

## Done when

Published styled tarballs do not include generated icon source.

## Relationship

F-PACKAGING-008. Delta on #32. Needs packed-tarball evidence, not a
manifest-only edit.
