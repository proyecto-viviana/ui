---
id: 612
type: task
title: "Give a virtual click the virtual modality upstream gives it"
created: 2026-09-22
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-09-22,
      note: 'opened from the review of #497''s commit `d997d01f`, which corrected the paint in the styled layer and named this as the cause. `packages/solidaria/src/interactions/createInteractionModality.ts:113-115` opens `handleClickEvent` with `if (!e.isTrusted) return;`, added by `61b7b7f4` with no comment. react-aria 3.52.0 `useFocusVisible.ts` has no such guard — read from the pinned source map, `node_modules/.pnpm/react-aria@3.52.0…/dist/private/interactions/useFocusVisible.js.map`: `function handleClickEvent(e) { if (!openLink.isOpening && isVirtualClick(e)) { hasEventBeforeFocus = true; currentModality = ''virtual''; currentPointerType = ''virtual''; } }`. Upstream checks `isTrusted` in `handleFocusEvent` and deliberately not in `handleWindowBlur`, so the placement is considered, not accidental. `isVirtualClick` is upstream''s inference for `detail === 0`, and its own comment says what that covers: `Keyboards, Assistive Technologies, and element.click() all produce a "virtual" click event`. So an AT click puts upstream in `virtual` modality and focus-visible, and leaves ours in `pointer`. That single difference is all of the #497 ComboBox miss: our `createOption` computes the same expression as `useOption` (`createOption.ts:242`, `isFocused && isFocusVisible()`), and under a keyboard open it reaches the same answer because `ListBox` mirrors the focused key onto the option with `moveVirtualFocus` (`packages/solidaria-components/src/ListBox.tsx:676`), whose synthetic focus event arms the option''s ring. Measured in jsdom on this tree: with the styled remap removed, a keyboard-opened option still carries `data-focus-visible`, while a pointer-opened one does not.',
    }
---

## Scope

Delete the `isTrusted` guard from `handleClickEvent` in
`packages/solidaria/src/interactions/createInteractionModality.ts:113-115`, so
a `detail: 0` click reaches `isVirtualClick` as it does upstream, then delete
the two styled call sites that exist only to compensate for it:

- `packages/solid-spectrum/src/utils/option-focus-visible.ts`, the whole file,
- its call in `packages/solid-spectrum/src/combobox/index.tsx` (`ComboBoxOption`,
  both atoms) and in `packages/solid-spectrum/src/picker/index.tsx`
  (`pickerOption`),
- `pickerCheckmark`'s `isFocused: baseColor("accent").isFocusVisible` override
  (`packages/solid-spectrum/src/picker/index.tsx:489`), which lifts the Picker
  checkmark by a second, non-S2 mechanism; upstream's `checkmark` reads the
  spread render props only.

The styled guard in `packages/solid-spectrum/test/ComboBox.test.tsx` ("paints a
pointer-focused option…" and "does not treat a pointer-opened selected option as
focus-visible") pins today's two answers and has to move with them: after this,
a synthetic click carries `data-focus-visible` and the paint follows it, while a
real mouse click carries neither.

Blast radius, measured on this tree today: `fireEvent.click` appears 220 times
across 51 test files in `packages/*`, and 11 of those files also assert
focus-visible or `data-focus-visible`. Every one of those synthetic clicks
currently leaves the modality at `pointer` and would move to `virtual`. The
guard sits in two published headless packages, so this is a behaviour change
for consumers and owes a changeset naming `@proyecto-viviana/solidaria`.

viviana-ui moves too, without a line changing in it: its `comboBoxCheckmark` is
plain `baseColor("accent")` (`packages/viviana-ui/src/combobox/index.tsx:543`),
so the register's checkmark sits at the default stop under today's pointer
modality and will lift to the focus stop once a synthetic click reads as
virtual. The register has no pair oracle to catch it; look at it by eye.

Non-goals: the per-element `createFocusRing()` in `createOption`, which is
faithful and already arms under virtual focus; any change to what the ComboBox
or Picker atoms declare.

## Done when

`handleClickEvent` matches react-aria 3.52.0 line for line, the three styled
compensations above are gone, and both the ComboBox and Picker certified list
shards stay green on a named run — the same
`e2e/certified/{combobox,picker}.certified.spec.ts` `list` cases #497 proved,
which pass today only because the styled remap stands in for this fix.

## Proof

The solidaria and solidaria-components suites, the solid-spectrum and viviana-ui
suites, `vp run guard:layer-boundary`, and the two certified list shards. Each
of the 11 focus-visible test files is read before it is re-run, since a
synthetic click changing modality is exactly what they assert around.

## Relationship

Child of #31, the headless spine. Cause of
[#497](./497-match-combobox-and-picker-list-selected-checkmark-accent.md), whose
styled correction is the debt this repays; the divergence it leaves standing is
the pointer-modality entry in `.claude/current/certification-debt.md`. The guard
arrived in `61b7b7f4` with the Picker/ComboBox open-menu alignment, so read that
commit before assuming it guarded nothing.
