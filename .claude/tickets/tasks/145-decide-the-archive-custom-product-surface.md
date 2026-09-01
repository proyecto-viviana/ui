---
id: 145
type: task
title: "Decide the archive custom product surface"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: comparison must not deep-import archive/; seven components are not public; remaining public names stay on #62",
    }
  - {
      state: merged,
      at: 2026-09-01,
      note: "deleted packages/viviana-ui/archive/, comparison fixtures, custom catalogue entries, and the twelve certified specs",
    }
  - {
      state: verified,
      at: 2026-09-01,
      note: "owner 2026-09-01: delete those is fine; current work is the Solid Spectrum API",
    }
---

## Cause

`packages/viviana-ui/archive/custom/` held twelve components. Comparison
compiled them through a six-level relative path.

## Decision

Owner 2026-09-01: delete the archive surface. Comparison is the S2 harness.
Current work is the Solid Spectrum API, not new viviana-native components.

## Done when

Comparison reaches only public package exports.

## Relationship

F-ARCH-005. Closed together with #62. Recorded in `steering.md` and
`glasselated-port.md`.
