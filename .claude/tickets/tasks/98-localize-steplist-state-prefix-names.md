---
id: 98
type: task
title: "Localize StepList state-prefix names"
created: 2026-08-20
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "recovered from a certified-driver comment that the legacy debt ledger did not represent",
    }
---

StepList exposes localized state prefixes in accessible names. The current
certified fixture uses a fixed container label and does not compare that branch.

## Scope

- Read the applicable upstream hooks, strings, and tests first.
- Match each state-prefix branch and locale fallback.
- Add React-versus-Solid accessibility-tree evidence for the localized names.
- Keep the owner-approved local StepList boundary explicit where S2 has no
  styled oracle.

## Done when

Localized StepList state names have branch-complete accessibility evidence and
the certified driver no longer defers this surface.
