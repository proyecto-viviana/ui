# Official Docs And Viewer Parity

The live official React Spectrum S2 component page is validation input, not
just background reading. If the official page exposes an example, option, state,
or accessibility note that our comparison route cannot represent, record that
as a gap. It is usually a signal that the route, fixture, or port is incomplete.

This gate is separate from upstream source parity and React-vs-Solid harness
parity. A component can match React in our route and still fail this gate if the
route is not the official docs/viewer experience users see.

Do not copy long prose from upstream docs into this repo. Extract the contract:
section names, example names, props, states, caveats, accessibility obligations,
and interactive viewer settings.

## What To Inventory

For the target S2 docs page, record the date and source used. Prefer the live
official page for examples and viewer controls; MCP or installed docs snapshots
are helper context and must be marked `docs-drift` when they disagree with the
live page or installed source.

Record:

- page sections and their purpose;
- every documented example and the props, children, and context it uses;
- every interactive viewer control, including prop name, option labels, option
  values, defaults, disabled or hidden combinations, and example content;
- every interactive viewer control's UI state: option order, selected/unselected
  default, reset behavior, and whether the default omits a prop rather than
  passing the option that looks like the default;
- every documented state: disabled, invalid, selected, open, pending/loading,
  quiet/emphasized, static color, density, size, orientation, placement, and
  composition variants;
- every documented slot, child component, context, icon, image, avatar, text,
  description, error, help text, collection item, and portal example;
- every accessibility, keyboard, internationalization, RTL, forced-colors,
  reduced-motion, or form note;
- every documented limitation or caveat.

If the page has no interactive viewer, record `interactive viewer: none found`
and inventory the static examples instead.

## How To Compare

Map each docs item to one of:

- `covered`: represented by the comparison route, source branch ledger, and at
  least one focused assertion or visual state;
- `route-gap`: official docs setting or example is not exposed by our
  comparison route;
- `port-gap`: route can express it, but Solid implementation differs or is
  missing;
- `docs-drift`: docs differ from installed upstream source or current React
  behavior; installed source/current React remains authority, but record the
  discrepancy;
- `not-applicable`: documented item is React-only or outside the Solid package
  surface, with a reason.

## Comparison Route Requirements

- Side-panel controls must use official S2 prop names and option values.
- Defaults must match the official viewer and installed upstream source. If
  they disagree, record the source authority used.
- The visible control surface must match the official viewer, including option
  labels, order, selected state, and absence of internal sentinel choices. A
  route may use an internal sentinel for `undefined`, but it must not appear as
  a public option unless the official viewer exposes it.
- Do not assume an option label named `auto`, `default`, or similar is the same
  as the omitted prop. Verify the live/current React behavior for both the
  no-query default and the explicit option value.
- Example content should match the official docs closely enough to exercise the
  same slots, child composition, labels, icons, images, and collections.
- The route must include every official viewer setting that changes behavior,
  style, accessibility, geometry, or child composition.
- A focused control test must prove each modeled setting changes mounted React
  and Solid DOM, not only serialized prop markers.
- The route must not maintain a separate hardcoded default source that can drift
  from `component-controls` or component demo defaults.
- Visual-state matrix rows should be created for documented examples or states
  that affect rendering.

## Evidence Template

Add a compact section like this to component validation notes:

```md
## Official Docs And Viewer Parity

| Docs item          | Official setting/example                 | Route/control             | Status  | Evidence                        |
| ------------------ | ---------------------------------------- | ------------------------- | ------- | ------------------------------- |
| Interactive viewer | `size`: `S`, `M`, `L`, `XL`; default `M` | side-panel `size` control | covered | control spec + size visual rows |
```

For controls with optional props, include the default-state distinction:

```md
| Viewer control | Official control state                                     | Route/control                              | Status  | Evidence               |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ | ------- | ---------------------- |
| `staticColor`  | options `white`, `black`, `auto`; none selected by default | side-panel radio omits prop until selected | covered | route-control contract |
```

Do not mark Task 13 accepted while any in-scope official docs/viewer checklist
item is unchecked, or while any in-scope official docs/viewer item is
`route-gap` or `port-gap`.
