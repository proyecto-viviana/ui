---
id: 651
type: task
title: "Read signal-driven props where they can update"
created: 2026-10-12
parent: 531
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "VisualMode logs STRICT_READ_UNTRACKED about 1,200 times at /canvas startup and 2,300 at /world, from inside the library.",
    }
  - {
      state: in-progress,
      at: 2026-10-12,
      note: "First slice: class and style getters across solidaria-components, lazy ToggleButton controlled state, plain SelectionIndicator context values. Hook bodies and mergeProps remain.",
    }
---

## Cause

Solid 2's dev build logs `[STRICT_READ_UNTRACKED] Reactive value read directly
in <X> will not update` when a component body reads a reactive value outside a
tracking scope. VisualMode sees it for `<ToggleButton>`, `<Button>`,
`<SharedElement>`, `<SearchFieldInput>` and `<SwitchField>` on solidaria
0.6.0-rc.0, solidaria-components 0.7.0-rc.0 and ui 0.8.0-rc.0. `main` still
does it. Minimal reproduction, headless, no spread:

```tsx
const [on, setOn] = createSignal(false);
render(() => (
  <ToggleButton isSelected={on()} isDisabled={on()}>
    Pin
  </ToggleButton>
));
// two warnings at mount
```

Some of these reads are real defects, not noise. Before this ticket a
signal-driven `class` or `style` on ToggleButton or Checkbox never updated:
`class={on() ? "on" : "off"}` stayed `off`.

The reads fall into five groups:

1. `class: local.class` and `style: local.style` handed to `useRenderProps` as
   values: read once in the component body. 245 reads in 50 files of
   `packages/solidaria-components/src`. Fixed here.
2. `createToggleButton` decided controlled or uncontrolled once, from
   `props.isSelected` in its body. Fixed here.
3. A context provider given `memo()` as its value: the provider reads it once.
   `SelectionIndicatorContext` in eight components is fixed here; the value was
   already a stable object of accessors. Remaining:
   `packages/solidaria-components/src/Dialog.tsx` (`PopoverTriggerContext`,
   `DialogTriggerContext`) and `packages/viviana-ui/src/provider/index.tsx`
   (`ColorSchemeContext`).
4. Hook bodies that read props at setup: `createTextField.ts`,
   `createSearchField.ts`, `createToggle.ts`, `createField.ts`,
   `createLabel.ts`, `createCheckbox.ts`, `createFormValidation.ts`,
   `createOverlayPosition.ts`, and the component bodies that call them
   (`TextField.tsx`, `SearchField.tsx`, `Checkbox.tsx`, `Switch.tsx`).
5. `mergeProps` in `packages/solidaria/src/utils/mergeProps.ts` walks its
   arguments when called. Given a props proxy built from a JSX spread, the
   `for…in`, `getOwnPropertyDescriptor` and the deliberate eager read of event
   handler, `class` and `style` keys all read reactive sources in the calling
   component body.

A page of eleven `@proyecto-viviana/ui` components (ToggleButton, Button,
ActionButton, SearchField, Switch, SegmentedControl, MenuTrigger,
DialogTrigger, TextField, Checkbox, TooltipTrigger) logged 199 warnings at
mount before this slice and logs 179 after it. By innermost library frame the
179 are: `mergeProps.ts` 88, `TextField.tsx` 43, `createTextField.ts` 15,
`Checkbox.tsx` 8, `createSearchField.ts` 5, `createField.ts` 4,
`SearchField.tsx` 3, and 13 across eight other files. Most of the
`mergeProps.ts` frames are merged getters read by a group 4 hook body.

## Scope

Move each read into a tracking scope, or wrap a deliberate one-time read in
`untrack`, one group at a time, lowest owner first. Groups 3 and 4 are
mechanical per file. Group 5 needs a decision first: keep the eager walk and
`untrack` it, with the frozen key set and handler identity it implies, or
make the merge lazy. No blanket `untrack` around a component body, no
scheduler workaround, no new public name, no dependency.

## Done when

The eleven-component page above mounts with no `STRICT_READ_UNTRACKED`
warning, and each prop a slice touches still updates the DOM when its signal
changes. VisualMode's `/canvas` and `/world` startup logs none that name a
library frame.

## Proof

`packages/solidaria-components/test/reactive-props.test.tsx`, three cases:

```bash
vp test run packages/solidaria-components/test/reactive-props.test.tsx
```

- A ToggleButton with signal-driven `isSelected` and `isDisabled` mounts with
  no `STRICT_READ_UNTRACKED` warning and updates `aria-pressed` and `disabled`.
- A ToggleButton follows `isSelected` once the caller starts supplying it.
- A signal-driven `class` and `style` on ToggleButton, and `class` on
  Checkbox, reach the element again.

All three fail on the source before this slice and pass after it. The full
unit suite (`vp run test:run`) and `vp run check` pass with the slice.

Each later slice adds its component to that file with the same two
assertions: no warning at mount, and the prop still updates.

## Relationship

Child of #531. Covers the `STRICT_READ_UNTRACKED` part of #641 (VisualMode
D26). Related: #617 (reactive `filterDOMProps`), #533 (stately accessors).
Patch Changeset `.changeset/reactive-class-style-and-toggle-state.md` covers
solidaria and solidaria-components.
