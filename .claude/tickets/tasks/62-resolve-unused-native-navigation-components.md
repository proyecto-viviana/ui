---
id: 62
type: task
title: "Resolve unused native navigation components"
created: 2026-08-20
parent: 32
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task dead-natives" }
  - {
      state: open,
      at: 2026-09-01,
      note: "owner 2026-09-01: absorbed #145 archive/custom names; seven components are not public; Header, NavHeader, LateralNav, Logo, and PageLayout remain the public-name question",
    }
  - {
      state: merged,
      at: 2026-09-01,
      note: "deleted the twelve archive/custom implementations; current work is the Solid Spectrum API, not new viviana-native components",
    }
  - { state: verified, at: 2026-09-01, note: "owner 2026-09-01: delete those is fine" }
---

Decide whether `Header`, `NavHeader`, `LateralNav`, `Logo`, and `PageLayout`
belong on the public `@proyecto-viviana/ui` barrel as `viviana-native`
components.

Owner 2026-09-01: delete the archive surface. Current work is the Solid
Spectrum API, not new Viviana components. Do not add these names to the
public barrel until the owner reopens that surface.

## Relationship

Replaces `dead-natives` from `.claude/current/tech-debt.md`. Closed together
with #145.
