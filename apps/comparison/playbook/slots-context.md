# Slots And Context

Slots and context parity covers compound component structure, provider values,
slot inheritance, and render-prop state.

## Checks

- JSX tree and slot names match upstream S2 and RAC composition.
- Context values are provided at the same boundaries.
- Solid context-sensitive children are not read before the provider that should
  affect them; use the
  [Solid Idioms And Reactivity](./solid-idioms.md) checklist for child laziness.
- Nested components consume slot props from the expected parent.
- Render-prop values expose the same state names and truth conditions.
- Static JSX children and render-function children both work when upstream
  supports both.
- Event handlers, class names, IDs, and refs merge like upstream composition
  helpers; user handlers are not dropped by internal slot props.
- Data attributes on root, trigger, field, option, cell, row, tab, or item nodes
  match upstream semantics.
- Provider context props, form context props, locale/direction, and color scheme
  inheritance flow through the styled component.
- Component-specific contexts such as Icon, Text, Header, Heading, Avatar, or
  SelectionIndicator are provided when upstream does.
- When the current component provides context or slot behavior to a child
  component whose own pass has not happened yet, create or update that child
  component's validation notes immediately under `Incoming Cross-Component
Findings`.
- Custom rendered elements, aliases, and imperative refs preserve the same
  consumer-facing behavior as upstream.

## Evidence

Record the upstream tree and the Solid tree in the validation notes when a
component has more than one slot or context provider.

For cross-component findings, record:

- the current pass where the finding was discovered;
- the upstream owner that provides the context or slot;
- the affected child component API or context;
- the validation the child component must perform during its own pass.
