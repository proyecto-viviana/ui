# Public API

Public API parity covers props, slots, exported symbols, aliases, refs, and
consumer-visible defaults.

## Checks

- Compare root exports for the package being changed.
- Compare component prop names, default values, and omitted upstream props.
- Compare supported slots/subcomponents.
- Compare context exports and provider slots.
- Compare user handler, event payload, `preventDefault`, propagation, and
  callback ordering contracts.
- Compare ref behavior and imperative methods.
- Compare generated ID, SSR/hydration, custom element, portal provider, and form
  owner behavior when public.
- Compare aliases, deprecated names, and intentionally extra Solid exports.
- Confirm unsupported props are intentionally absent and documented in the gap
  report or package README.

## Commands

```bash
vp run guard:rac-export-gap
vp run comparison:report:exports
rg -n "export .*<Component>|<Component>Context|type <Component>" packages/*/src/index.ts
```

## Evidence

For a component PR, record whether the change affects:

- `solid-stately` state exports;
- `solidaria` hook exports;
- `solidaria-components` headless component exports;
- `solid-spectrum` styled component exports;
- comparison app support exports or fixture-only helpers.
