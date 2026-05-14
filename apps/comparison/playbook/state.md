# State

State parity covers controlled/uncontrolled behavior, derived state, callbacks,
collection data, validation state, and open/close timelines.

## Checks

- Controlled props never update internal state except through callbacks.
- Uncontrolled defaults initialize once and preserve reset semantics when
  applicable.
- Derived state matches upstream for disabled, readonly, required, invalid,
  selected, focused, open, expanded, pressed, dragging, and loading flags.
- Callback order matches upstream for value changes, selection changes, input
  changes, open changes, validation changes, and commit/revert events.
- Open/close methods preserve trigger metadata when upstream exposes it.
- Selection state handles disabled keys, empty selection, multiple selection,
  and selected item text.
- Input-like state handles commit, revert, custom value, filtering, and blur.
- Date/time state preserves calendar, era, timezone, granularity, min/max, and
  unavailable-date validation.

## Useful Commands

```bash
rg -n "interface .*State|type .*State|function create.*State|export function use.*State" \
  apps/comparison/node_modules/@react-stately packages/solid-stately/src
rg -n "on[A-Z].*Change|set[A-Z]|commit|revert|open|close|toggle" \
  packages/solid-stately/src/<area>
```

## Tests

Add focused unit tests for:

- controlled and uncontrolled use;
- callback payloads and ordering;
- default value and reset behavior;
- disabled and readonly behavior;
- invalid or constraint-derived state;
- collection filtering, selected keys, and focused keys where applicable.
