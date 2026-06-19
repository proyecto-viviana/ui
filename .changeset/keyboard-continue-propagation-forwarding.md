---
"@proyecto-viviana/solidaria": patch
---

createKeyboard: forward `continuePropagation` to a parent-wrapped event

When `createEventHandler` wraps an event that a parent `createEventHandler`
already wrapped (nested keyboard handlers), continuing propagation now also
calls the parent's `continuePropagation`, mirroring `@react-aria/interactions`
`createEventHandler`. Previously the inner wrapper overwrote the parent's
`continuePropagation` (our port mutates the event via `Object.assign` rather
than upstream's object spread), so continuing in the inner handler stopped at
the inner wrapper and never let the outer handler continue. We now capture the
prior `continuePropagation` before overwriting and invoke it from the new one.
