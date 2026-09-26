---
id: 99
type: task
title: "Port StepList container key navigation"
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
      state: open,
      at: 2026-09-03,
      note: "#260 steplist: progress Tab Details→Select offers→Fallback offer→After matches; from Details, React ArrowDown moves focus (two downs land on Fallback offer), End stays on last selectable, Home returns to Details, typeahead s focuses Select offers without selecting; Solid stays on Details for all four. Default (only step 1 selectable) arrows/Home/End/typeahead are no-ops both. ArrowRight no-op both (vertical). Did not waive.",
    }
  - {
      state: verified,
      at: 2026-09-26,
      note: "createStepListState routed through SingleSelectListState collection spine; createStepList and createStep hooked to createSelectableList and createSelectableItem with allowsTabNavigation. Certified container key walks across default and progress pass pair diffing with React oracle.",
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
