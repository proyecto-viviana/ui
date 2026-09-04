---
id: 254
type: task
title: "Decide: RAC context composition for ComboBox and Select instead of compound components"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "owner decision needed; surfaced while tracing why the headless ComboBox listbox has no renderEmptyState (#198 out-of-lane item)",
    }
---

## Finding (evidence, no decision taken)

RAC's ComboBox and Select are composed from plain primitives that read their
props from context. `react-aria-components/src/ComboBox.tsx:312-360` provides
`ComboBoxStateContext`, `LabelContext`, `ButtonContext`, `InputContext`,
`GroupContext`, `OverlayTriggerStateContext`, `PopoverContext`,
`ListBoxContext`, `ListStateContext`, `TextContext` (description /
errorMessage slots), `FieldErrorContext`, `ComboBoxValueContext`; a consumer
writes `<ComboBox><Label/><Input/><Button/><Popover><ListBox><ListBoxItem/>`.
`Select.tsx` does the same with `SelectValue`, `Button`, `Popover`, `ListBox`.
Every upstream ComboBox/Select test, the S2 `ComboBox` / `Picker`
implementations, and the RAC docs compose this way.

The port instead ships bespoke compound components:
`ComboBoxInput`, `ComboBoxButton`, `ComboBoxListBox`, `ComboBoxOption`
(`packages/solidaria-components/src/ComboBox.tsx:167, 271-276`; barrel
`index.ts:471-496`) and `SelectTrigger`, `SelectListBox`, `SelectOption`.
`ComboBox.tsx:604-689` provides only `ComboBoxContext`,
`ComboBoxStateContext` and `TextContext`; a plain `ListBox`, `Input`, `Button`
or `Popover` placed inside receives nothing. `solid-spectrum`'s ComboBox
(`src/combobox/index.tsx:40-55`) is built on the compound components, so
S2-shape parity goes through wrappers RAC does not have.

Consequences already observed:

- `ComboBoxListBox` has no `renderEmptyState`; S2 `ComboBox.tsx:806-810`
  passes it to a plain `ListBox`. #198 could only show `combobox.noResults`
  for `items=[]`, not for a filtered-empty list (the S2 behavior).
- Upstream ComboBox / Select suites cannot be ported line-for-line; each test
  is re-expressed against the compound API, which is where the step-0 D13
  divergences (#248) accumulated (dangling `aria-describedby`, synthesized
  `aria-label`, `aria-haspopup` on the input).
- #224 (canonical item names) and #221 (styled barrel) rename exports but
  leave the composition model as is.

## Decision needed (owner)

Whether `solidaria-components` ComboBox and Select adopt RAC's context
composition — provide the same contexts, so plain `Input` / `Button` /
`Popover` / `ListBox` / `ListBoxItem` / `SelectValue` compose exactly as
upstream — with the compound components kept as thin, `@deprecated` sugar
over that (or removed), and `solid-spectrum` ComboBox / Picker rebuilt on the
plain primitives the way S2 is. This has reach: public exports, docs, every
consumer example, and the shape of every ComboBox/Select test.

Orchestrator opinion, labeled as such: the context model is the upstream
structure; keeping the compound components as the primary API guarantees a
permanent parity tax on the two components the owner reported bugs in.

## Wave-3 D13 evidence (2026-09-02, not a decision)

Certified `d13-journeys.txt` step 0 still diffs DOM shape that the compound
API cannot match line-for-line with RAC's context composition:

- ComboBox trigger button emits `data-open` / `data-pressed` / `data-focused`
  that RAC's plain `Button` from `ButtonContext` would get from shared Button
  render props; the port's `ComboBoxButton` is a separate component.
- Picker keyboard-only step 0: React has an extra wrapper div carrying
  `data-focus-visible` / `data-focused` around the trigger; Solid's
  `SelectTrigger` is the button itself. S2 Picker composes RAC `Button`, not
  a SelectTrigger.
- ComboBox `renderEmptyState` on a plain ListBox (#198 leftover) stays
  blocked until this composition lands.

Seeds cannot decide #248 H1/H2 until step 0 is either green or the remaining
diffs are explicitly owned here / on #209 / on HiddenSelect.

## Relationship

Child of #136. Informs #221, #224, #245, #246, #248, #252. Not started until
the owner decides.
