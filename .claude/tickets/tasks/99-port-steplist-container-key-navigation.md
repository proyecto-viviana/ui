---
id: 99
type: task
title: "Port StepList container key navigation"
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

The current `createStepListState` is hand-rolled and does not use the shared
selection-manager or collection spine. The certified walk covers Tab, Enter,
and Space, but it defers container Home, End, and typeahead behavior.

## Scope

- Read the applicable vendored StepList and React Stately source first.
- Put state in `solid-stately` and keyboard behavior in `solidaria`.
- Route StepList through the shared collection spine where upstream does.
- Add browser evidence for each supported key branch, focus result, selection
  result, and disabled or read-only branch.

## Done when

StepList container navigation matches the selected upstream boundary, and the
certified driver no longer defers these keyboard branches.
