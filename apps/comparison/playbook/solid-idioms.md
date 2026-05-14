# Solid Idioms And Reactivity

Use this checklist whenever a React source pattern is ported into Solid. The
goal is not to make the Solid code look like React; it is to preserve the
upstream behavior using Solid's lazy children, fine-grained reactivity, context
owner tree, and cleanup rules.

## Source Authority

- Solid context docs: <https://docs.solidjs.com/concepts/context>
- Solid `useContext` docs:
  <https://docs.solidjs.com/reference/component-apis/use-context>
- Solid `children` helper docs:
  <https://docs.solidjs.com/reference/component-apis/children>

## Checks

- Context-sensitive children stay lazy until they are under the provider that is
  supposed to affect them.
  - Do not pass `children: local.children` or `children: props.children` into a
    helper when that child may consume a provider created later in the same
    component.
  - Prefer a getter, e.g. `get children() { return local.children; }`, or call a
    child accessor only inside the provider boundary.
  - Test static JSX children and render-function children when upstream supports
    both.
- Context values remain live when they represent changing state.
  - Use accessors, getters, signals, stores, or provider values that preserve the
    same update behavior as upstream.
  - Do not replace a dynamic context value with a one-time object snapshot.
- Prop merging preserves Solid getters and descriptors.
  - Use the local merge helper or Solid `mergeProps` when dynamic props,
    provider props, or slot props are involved.
  - Avoid object spreads that freeze accessors unless the value is intentionally
    static.
- Render props and custom root props stay live through transitions.
  - Custom render APIs should receive getter-backed render state when the state
    can change after first render.
  - Tests should prove hover, press, focus, pending, selected, invalid, open, or
    disabled state changes update custom render output.
- Effects, timers, observers, and subscriptions have Solid cleanup.
  - Create them in a reactive owner and pair them with `onCleanup`.
  - Avoid module-level or one-time reads of props that are expected to update.
- Refs use Solid semantics.
  - Compose callback refs and element variables deliberately.
  - Do not assume React `RefObject` timing or `.current` ownership unless the
    Solid API explicitly accepts that shape.

## Evidence

Record a `Solid idioms` note in the component validation file when any of these
patterns apply. The note should name:

- the child/provider boundaries checked;
- dynamic props or contexts that must stay live;
- static JSX child tests added;
- render-function child tests added;
- dynamic transition tests added;
- any intentional Solid-specific deviation.

## Useful Searches

These searches are review aids, not automatic failures. Inspect each result in
context.

```bash
rg -n "children: (local|props)\\.children|const .*children.*=.*\\.children|splitProps\\(.*children" packages/solidaria-components/src packages/solid-spectrum/src
rg -n "\\.current|getBoundingClientRect|addEventListener|setTimeout|ResizeObserver|MutationObserver" packages/solidaria-components/src packages/solid-spectrum/src
rg -n "\\{ \\.\\.\\.(local|props|contextProps|slotProps)" packages/solidaria-components/src packages/solid-spectrum/src
```

## Acceptance

A React source pattern that relies on context, render props, dynamic props, or
runtime lifecycle is not accepted until the Solid port has tests for the
corresponding Solid idiom. If a React pattern cannot be represented directly,
record the Solid-specific reason and the public API consequence.
