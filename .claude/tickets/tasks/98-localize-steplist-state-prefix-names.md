---
id: 98
type: task
title: "Localize StepList state-prefix names"
created: 2026-08-20
parent: 31
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "recovered from a certified-driver comment that the legacy debt ledger did not represent",
    }
  - {
      state: verified,
      at: 2026-09-26,
      note: "Ported 34 upstream locale catalogs for StepList strings. StepList container aria-label, state prefixes ('current', 'completed', 'notCompleted'), and step marker numbers localized via createStringFormatter and createNumberFormatter. Certified under D6 AX across default, progress, disabled, readonly, localized-es, and localized-ar.",
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
