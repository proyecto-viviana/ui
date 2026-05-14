# Source Branch Coverage

Source branch coverage is the line-by-line proof that a component pass did not
miss behavior hidden inside upstream files. It is required for Task 4 and is
kept in the component validation notes.

## Rule

Every relevant upstream file from the source map needs a branch ledger before a
component can be accepted. A same-named Solid file, matching export, passing
visual row, or route render is not enough.

## What Counts As A Branch

Record each upstream branch that can affect users or downstream components:

- public props, aliases, defaults, value normalization, and omitted props;
- native element choice, DOM shape, IDs, labels, descriptions, roles, hidden
  elements, and portal structure;
- event paths: pointer, mouse, keyboard, touch, virtual click, cancellation,
  propagation, and consumer handler composition;
- focus, focus-visible, focus return, modality, and disabled/read-only paths;
- controlled/uncontrolled state, validation, collection keys, async loading,
  selection, open/closed, expanded/collapsed, and reset behavior;
- render props, slots, context providers/consumers, child cloning/wrapping,
  refs, imperative handles, and custom root paths;
- effects, timers, observers, media queries, measurements, cleanup, and
  SSR/hydration branches;
- S2 style conditions, tokens, static colors, forced colors, reduced motion,
  RTL, density, size, variant, icon, geometry, and animation branches;
- cross-component branches where this component provides context, props, refs,
  slots, state, or styling to another component.

Skip only branches proven private to React implementation mechanics and not
observable in Solid. Record the reason as `not-applicable`.

## Ledger Template

Add a section like this to component validation notes:

```md
## Source Branch Coverage

| Layer      | Upstream branch                                            | Solid owner    | Class         | Observable | Status  | Evidence                                              |
| ---------- | ---------------------------------------------------------- | -------------- | ------------- | ---------- | ------- | ----------------------------------------------------- |
| ARIA hooks | `useButton`: non-native `elementType` role/tabIndex branch | `createButton` | a11y/behavior | yes        | matched | `createButton.test.tsx`: non-native button role/focus |
```

Use a compact branch name, but include enough detail that a reviewer can find
the upstream code without guessing. Use file paths and symbols when a branch is
not obvious from the component name.

## Status Values

- `matched`: Solid implements the same user-observable behavior and has
  evidence.
- `ported-differently`: Solid uses a different shape or idiom with equivalent
  behavior and has evidence.
- `not-applicable`: the upstream branch is React-only or irrelevant, with a
  reason.
- `gap`: behavior is missing or unproven.
- `deferred-gap`: out of current scope, with the future component note or issue
  where it is recorded.

## Evidence Bar

For user-observable behavior, style, and accessibility branches, `matched` and
`ported-differently` require one of:

- focused package test;
- Playwright runtime assertion;
- computed-style, geometry, accessibility snapshot, or exact current pair-diff
  assertion;
- a linked existing test that directly exercises the branch.

Inspection alone is allowed only for non-observable branches such as type-only
aliases, React-only ref timing, or internal helper shape. Mark those with a
short reason in `Evidence`.

## Dependency Map

When a branch wires one input into a visible subpart, add a row to
`Interaction Dependency Map` in the component notes. Examples:

- `Button staticColor -> pending ProgressCircle stroke`;
- `ActionButton staticColor -> NotificationBadge staticColor`;
- `DatePicker open state -> Popover + Calendar visibility/focus`;
- `SelectBox selected/disabled -> checkmark, illustration, description slots`.

The test strategy should compare the React delta to the Solid delta rather than
enumerating every prop combination. Start from a baseline, toggle the source
input, and assert that the affected subpart changes in the same way on both
sides. Only add a broader matrix when upstream source nests multiple axes in the
same branch.

## Layer Closeout

Before leaving each layer task, update the ledger:

- Task 6 closes state branches.
- Task 7 closes ARIA hook branches.
- Task 8 closes headless RAC branches.
- Task 9 closes styled S2 branches.
- Task 10 closes browser lifecycle and accessibility branches.
- Task 12 attaches strict comparison evidence to visual/style branches.

Task 13 cannot mark acceptance while any in-scope branch is `gap` or while any
`deferred-gap` lacks a destination note.
