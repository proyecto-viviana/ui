---
"@proyecto-viviana/solidaria-components": patch
---

Keep StepList `isDisabled`, `isReadOnly`, and `disabledKeys` live after mount. `createStepListState` receives staying-mounted getters instead of a one-shot `stateProps()` snapshot.
