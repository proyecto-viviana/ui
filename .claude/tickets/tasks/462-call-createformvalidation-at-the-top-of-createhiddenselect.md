---
id: 462
type: task
title: "Call createFormValidation at the top of createHiddenSelect"
created: 2026-09-04
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from the 2026-09-04 overnight adversarial audit. createHiddenSelect calls createFormValidation inside a createEffect gated on p.validationState. Select.tsx never passes validationState, so the effect is dead. Hook-inside-effect also leaks inner createEffects if the outer effect re-runs. Upstream HiddenSelect.tsx:96-103 calls useFormValidation unconditionally at hook top level.",
    }
---

Solid `createHiddenSelect` can call `createFormValidation`, but it does it
**inside** a `createEffect` (`createHiddenSelect.tsx:147-159`) gated on
`p.validationState`. `Select.tsx` never passes `validationState`. The
effect is dead. Select then hand-rolls `onInvalid`. Hook-inside-effect
also leaks inner `createEffect`s if the outer effect re-runs (Solid does
not dispose inner effects created during an effect unless they are owned).

Upstream `HiddenSelect.tsx:96-103` calls `useFormValidation`
unconditionally at hook top level.

## Done when

`createFormValidation` runs at hook top level like RAC. Select native
required / isInvalid blocks submit. The effect-gated call is gone. A
package test fails if Select submits while invalid.

## Relationship

Child of #24. Found by the 2026-09-04 overnight audit. Distinct from #376
(Radio) and #351 (TextField).
