---
id: 651
type: task
title: "Read signal-driven props where they can update"
created: 2026-10-12
parent: 531
priority: high
status: merged
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
  - {
      state: in-progress,
      at: 2026-10-12,
      note: "Second slice: mergeProps marks its one-time walk and combines reactive class and style lazily; ref reads through splitProps are one-time. 199 warnings on the probe page are now 148; the field and toggle hook bodies remain.",
    }
  - {
      state: merged,
      at: 2026-10-12,
      note: "Third slice: context props stay live, field and toggle hooks read seeds once and everything else lazily. The probe page logs 1 warning, down from 199; ColorSchemeContext is left for an owner decision. VisualMode's startup log verifies after rc.2.",
    }
  - {
      state: merged,
      at: 2026-10-13,
      note: "Fourth slice, owner decision 2026-10-13: ColorSchemeContext carries an accessor in both styled packages. The probe page logs no warning.",
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
   `for…in`, `getOwnPropertyDescriptor` and the eager read of event handler,
   `class` and `style` keys all read reactive sources in the calling component
   body. Fixed in the second slice, with the `ref` read every component makes
   through `splitProps`.

A page of eleven `@proyecto-viviana/ui` components (ToggleButton, Button,
ActionButton, SearchField, Switch, SegmentedControl, MenuTrigger,
DialogTrigger, TextField, Checkbox, TooltipTrigger) logged 199 warnings at
mount before this ticket, 179 after the first slice and 148 after the second.
None of the 148 comes from the `mergeProps` walk. They come from group 4, by
the getter that is read: `viviana-ui/src/form/index.tsx` and
`solidaria-components/src/TextField.tsx` (the TextField, Label and Input
bodies reading `createTextField` results), `Switch.tsx`, `Checkbox.tsx`,
`SearchField.tsx`, `createTextField.ts`, `createSearchField.ts`,
`createField.ts`, `createToggle.ts`, `createFormValidation.ts`; and from
group 3: `Dialog.tsx`, `viviana-ui/src/provider/index.tsx`.

## Scope

Move each read into a tracking scope, or wrap a deliberate one-time read in
`untrack`, one group at a time, lowest owner first. Groups 3 and 4 remain,
per file. No blanket `untrack` around a component body, no scheduler
workaround, no new public name, no dependency.

`mergeProps` (owner left the choice open, 2026-10-12): the walk is marked, not
made lazy. A lazy merge would have to chain event handlers at read time, which
either mints a new function on every read or returns a wrapper where today's
result is `undefined`; both change what callers test and bind. Instead:

- Values were already lazy for every key but event handlers, `class` and
  `style`. `class` and `style` now join at read time too when either side is a
  getter, so they keep updating.
- What is left of the walk is the key set and the handlers it chains. Inside a
  tracking scope those reads still subscribe the scope, which re-runs the
  merge, exactly as before. In a component body nothing can re-run the merge,
  so the walk runs under `untrack`. Handler identity and the key set are
  taken once there, as they always were.

## Done when

The eleven-component page above mounts with no `STRICT_READ_UNTRACKED`
warning, and each prop a slice touches still updates the DOM when its signal
changes. VisualMode's `/canvas` and `/world` startup logs none that name a
library frame.

## Proof

`packages/solidaria-components/test/reactive-props.test.tsx`, four cases:

```bash
vp test run packages/solidaria-components/test/reactive-props.test.tsx
```

- A ToggleButton with signal-driven `isSelected` and `isDisabled` mounts with
  no `STRICT_READ_UNTRACKED` warning and updates `aria-pressed` and `disabled`.
- A ToggleButton follows `isSelected` once the caller starts supplying it.
- A signal-driven `class` and `style` on ToggleButton, and `class` on
  Checkbox, reach the element again.

- A ToggleButton given its props as a spread of signal-driven values mounts
  with no warning and still updates `aria-pressed` and `class` (second slice).

`packages/solidaria/test/mergeProps.test.ts`, "reactive sources": a
signal-driven `class` and `style` merged between static ones change when the
signal does; a memo that merges a signal-driven handler re-runs and calls the
new handler.

Each case but the last fails on the source before its slice and passes after
it; the last guards the tracked path, which the change must not alter. The
full unit suite (`vp run test:run`: 424 files, 8296 passed, 1 expected
failure) and `vp run check` pass with both slices.

Each later slice adds its component to that file with the same two
assertions: no warning at mount, and the prop still updates.

## Relationship

Child of #531. Covers the `STRICT_READ_UNTRACKED` part of #641 (VisualMode
D26). Related: #617 (reactive `filterDOMProps`), #533 (stately accessors).
Patch Changesets `.changeset/reactive-class-style-and-toggle-state.md` and
`.changeset/mergeprops-one-time-walk.md` cover solidaria and
solidaria-components.

## Third slice — 2026-10-12

The eleven-component page logs 1 warning at mount: 199 before the ticket, 179
and 148 after the first two slices. What the 147 were:

- `useContextProps` (`packages/solidaria-components/src/utils.tsx`) took a
  parent's context apart with a rest-spread. A field's context is an object of
  getters over its live state, so the spread read every one of them in the
  slotted component's body and handed it fixed values: a Label kept the `for`
  and `id` it mounted with. It now splits the context, and the merged props
  stay getters. This was a stale-prop defect, and most of the count.
- `Input` and `SearchFieldInput` read `context.inputProps.ref`, which computes
  every input prop, to take a ref. A ref is taken once; the read is marked.
- `createTextFieldState`, `createToggleState` and `createToggleGroupState`
  seed uncontrolled state from the props in their body, and `createTextField`
  snapshots its reset value as upstream does. Seeds by definition; marked.
- `createTextField` passed `onFocus`, `onBlur`, `onFocusChange`, `onKeyDown`
  and `onKeyUp` to `createFocusable` as values; they are getters now.
  `createFocusable` settles which handlers exist once, because the hooks under
  it attach a listener only for a handler they are given, and calls the
  current handler when the event arrives.
- Imperative reads inside effect callbacks: `syncInputCustomValidity`,
  `updateValidation` in `createFormValidationState`, the validation facade in
  `createToggle`, the indeterminate write in `createCheckbox`, and
  `updatePosition` in `createOverlayPosition`. Each needs the value as it
  stands when it runs, and its effect's compute function is what subscribes.
- `Dialog.tsx` gave `PopoverTriggerContext` and `DialogTriggerContext` a memo's
  value; both are stable objects with getters now.
- The SegmentedControl's `DefaultSelectionTracker`, in both skins, settles at
  mount whether the caller chose the first selection.

Not made live: a caller that swaps an event handler prop after mount.
`mergeProps` and the component layers above `createFocusable` still take
handler identity once, as before this ticket.

Three more cases in `reactive-props.test.tsx` (seven in all): ToggleSwitch and
Checkbox follow signal-driven selection and disability; a TextField keeps its
value, disability, input `id` and the Label's `for` live through context; a
SearchField keeps its value and disability live. Each mounts with no
`STRICT_READ_UNTRACKED` report, and each fails on the source before this
slice.

Patch Changeset `.changeset/field-and-toggle-reads-stay-live.md`.

## Fourth slice — 2026-10-13

`ColorSchemeContext` in `packages/viviana-ui/src/provider/index.tsx` and its
`solid-spectrum` twin held the scheme string itself. A provider reads its
`value` once, so the context carried the scheme at mount: a consumer did not
see a later scheme change, and the read was the last report on the probe page.
The owner approved the public type change on 2026-10-13. The context is now
`Context<Accessor<ColorScheme> | null>` and the provider hands it the scheme
memo. A consumer calls the value: `useContext(ColorSchemeContext)?.()`.

Nothing in this repository read the context: no package, `apps/web`,
`apps/comparison` or documentation example. VisualMode's `src` does not read
it either; its `useTheme` is its own, in `src/shared/theme.ts`.

`packages/viviana-ui/test/Provider.test.tsx`: a consumer under a Provider and
one under a nested Provider follow a scheme change; the context reads `null`
outside a Provider; and the eleven-component page, with signal-driven props on
the eight controls and static props on the three triggers, mounts with no
`STRICT_READ_UNTRACKED` report. The first and third fail on the source before
this slice, the third with exactly the one `<ColorSchemeContext>` report.
`packages/solid-spectrum/test/ProviderParity.test.tsx` holds the consumer case
for the twin.

```bash
vp test run packages/viviana-ui/test/Provider.test.tsx packages/solid-spectrum/test/ProviderParity.test.tsx
```

The page's triggers take static props. A signal-driven `isOpen` on MenuTrigger
and signal-driven `isDisabled` or `isOpen` on TooltipTrigger still report, and
still update; #658 owns them.

Minor Changeset `.changeset/color-scheme-context-accessor.md` for
`solid-spectrum` and `ui`, with the consumer change.
