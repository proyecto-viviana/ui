# Public API

Public API parity covers props, slots, exported symbols, aliases, refs, and
consumer-visible defaults.

## Checks

- Compare root exports for the package being changed.
- Compare component prop names, types, requiredness, default values, and omitted
  upstream props against installed upstream source.
- Compare supported slots/subcomponents.
- Compare context exports and provider slots.
- Compare user handler, event payload, `preventDefault`, propagation, and
  callback ordering contracts.
- Compare ref behavior and imperative methods.
- Compare omitted inherited DOM/global props, ARIA props, focus props, form
  props, unsafe style props, and branded style types. A Solid-specific type
  shape must be recorded as `ported-differently` with the preserved public
  behavior.
- Compare generated ID, SSR/hydration, custom element, portal provider, and form
  owner behavior when public.
- Compare aliases, deprecated names, and intentionally extra Solid exports.
- Confirm unsupported props are intentionally absent and documented in the gap
  report or package README.
- Do not mark API parity `matched` because a hand-maintained `apiProps` list
  names the prop. `apiProps` is route/documentation inventory until an upstream
  type/source diff proves the contract.

## Type Diff Evidence

Until an automated upstream-vs-Solid prop diff exists, record a manual diff in
the component note for every public component touched:

- upstream prop interface and owner file;
- Solid prop interface and owner file;
- props with identical public behavior;
- props intentionally ported differently;
- unsupported props and reason;
- extra Solid-only props and reason;
- ref target and imperative API;
- context/provider-provided props;
- default values and omitted-prop behavior.

The diff must distinguish viewer control coverage from public API coverage. A
route may expose only a few useful controls, but the public API gate still needs
source-backed evidence for every supported prop family.

## Commands

```bash
vp run guard:rac-export-gap
vp run comparison:report:exports
rg -n "export .*<Component>|<Component>Context|type <Component>" packages/*/src/index.ts
rg -n "interface <Component>Props|type <Component>Props|<Component>Context" \
  apps/comparison/node_modules/@react-spectrum/s2/src packages/solid-spectrum/src
```

## Evidence

For a component PR, record whether the change affects:

- `solid-stately` state exports;
- `solidaria` hook exports;
- `solidaria-components` headless component exports;
- `solid-spectrum` styled component exports;
- comparison app support exports or fixture-only helpers.
