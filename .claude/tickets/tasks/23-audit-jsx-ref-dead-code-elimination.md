---
id: 23
type: task
title: "Audit JSX refs for package-build dead-code elimination"
created: 2026-08-20
parent: 27
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the ContextualHelpTrigger package-build failure review",
    }
---

The JSX-preserving package build removed ContextualHelpTrigger behavior because
it treated a `let` ref as never assigned. JSX `ref={value}` was not visible to
the optimizer as a JavaScript write. The source tree contains many more local
element refs with the same syntax. Their observable reads have not been
classified against built output.

## Scope

- Inventory package-source `let` refs that JSX assigns directly.
- Classify refs by whether runtime behavior reads them after assignment.
- Compare source-mode and built-package behavior for every risky class.
- Prefer a structural build or ref-registration fix over one component patch.
- Add a negative fixture that fails if the optimizer removes an observable ref
  read, callback, focus action, or close action.
- Add browser regressions for affected keyboard, focus, overlay, and form
  behavior.
- Remove safe false positives from the inventory with a recorded reason.

Do not replace every local ref mechanically. Prove which build pattern fails
and correct the structure that permits it.

## Done when

The built packages preserve each observable JSX-ref behavior, and a guard fails
when the known dead-code pattern returns.

## Relationship

Extends the latest ContextualHelpTrigger fix. Component evidence contributes to
ticket #11.
