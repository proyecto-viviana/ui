---
"@proyecto-viviana/solidaria-components": minor
---

Port the context/slot machinery from React Aria (spine keystone 3)

Makes the headless `utils.tsx` context helpers faithful to
react-aria-components, so collection/field components can consume slotted
contexts and merge refs the way upstream's `useContextProps(props, ref, ctx)`
does. Additive — there are no functional consumers yet (every component still
uses native `Context.Provider`), so existing behavior and snapshots are
unchanged; the `migrate-*-spine` tasks wire components onto this.

- **`Provider`** — was a no-op; now nests each `[Context, value]` pair around the
  children, last pair outermost (matching upstream's wrap-in-iteration-order).
  Children render through a lazy getter inside the innermost provider so child
  components are *created* within every provider's owner — Solid binds
  `useContext` at component-execution time, so eager children would miss the
  providers.
- **`useSlottedContext(context, slot)`** — resolves a `slots` record: `slot`
  (or `DEFAULT_SLOT`) is looked up and throws on an unknown name; an explicit
  `null` slot opts out of the context; a bare (non-slotted) value passes through.
- **`useContextProps(props, ref, context)`** — resolves the context for
  `props.slot`, merges context props under the component's own (props win,
  handlers chain via the reactive `mergeProps`, so prop changes keep flowing),
  and merges the component ref with the context ref into one callback.
- **`useSlot`** — ref callback + accessor reporting whether slotted content was
  rendered, for the `aria-label` fallback pattern.
- Adds `RefLike` / `WithRef` / `SlottedValue` / `SlottedContextValue` types,
  `assignRef` / `mergeRefs`, and re-typed `ContextValue<T, E>` to upstream's
  slotted-with-ref shape. `DEFAULT_SLOT` stays the string `"default"` (upstream
  uses `Symbol('default')`) so slot records remain `Record<string, …>`, matching
  the styled-layer `SpectrumContextValue` contract.
