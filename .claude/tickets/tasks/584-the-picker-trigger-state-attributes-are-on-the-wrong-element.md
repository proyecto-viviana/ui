---
id: 584
type: task
title: "The picker trigger's state attributes are on the wrong element, and half of them serialise to an empty string"
created: 2026-09-21
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "graded by the conductor from shard 5 of Certification Gates run 35556441049. Two D13 rows, one file, and that file already contains the correct idiom forty lines below the wrong one. Not folded into #497: that one is the combobox checkmark accent and this is Select's data attributes",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: 'attribute slice landed in Select.tsx; D13 not yet green, three more causes named below. Root data-* go through dataAttr. The trigger drops data-open (createSelect''s triggerProps stamp it too, stripped in cleanTriggerProps) and takes data-focused from its own createFocusRing, as RAC''s trigger Button does; the state-level isFocused stays on the root. The option''s data-focus-visible now comes from its own ring (RAC useOption), not the trigger''s, which blurs once the option takes focus. After VIVIANA_GATE=1 vp run comparison:build, certified/picker.certified is 60 passed / 2 failed, both D13 rows, and neither fails on dom any more: open-arrow step 0 fails on focus, keyboard-only step 1 on events. Mutation: with the trigger half and the option ring put back, -g D13 fails both journeys at dom again (open-arrow step 0, keyboard-only step 1). Serialisation half: with root data-open back to a raw boolean the unit suite reads data-open="" and fails 1 of 88. The new option-ring unit guard fails 1 of 89 with the old source restored. Select.test.tsx 89 passed; Select+ComboBox+solid-spectrum picker 217 passed; vp run typecheck clean. Menu, DatePicker, ComboBox and ActionBar carry no raw-boolean data-* emitters',
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`. Two findings on this element, and the survey note above holds - its Menu/Link challenge was refuted, because solidaria's mergeProps coerces boolean data-* to the string true (`domAttrs.ts:62-70`) and Menu's `:1620` value is shadowed by a later spread. `r2-certified-a/r2a-5`, medium, confirmed: the trigger now carries no `data-pressed` at all, where RAC's carries it for the whole time the popover is open - `dist/private/Select.mjs:157-163` feeds the trigger Button `isPressed: state.isOpen` and `dist/private/Button.mjs:97` emits `data-pressed`. Ours computes `isPressed` into render values only (`packages/solidaria-components/src/Select.tsx:894-900`) and the button at `:932-957` emits none, and `data-pressed` is in the compared allowlist (`apps/comparison/e2e/drivers/journeys.ts:78`). A missing state attribute is the other direction of this ticket's own defect and the Done-when covers it: emit `data-pressed={dataAttr(isPressed())}`. Note the D13 evidence is weaker than the entry above reads - open-arrow step 0 already fails on focus, so the later steps, the ones where the popover is open, are never reached and cannot have been compared (`journeys.ts:238-275`). `r2-certified-a/r2a-4`, low, partly: the cure was applied at the component, not at the hook - `packages/solidaria/src/select/createSelect.ts:450-452` still invents `data-open`, `data-disabled` and `data-focus-visible`, pinned by `packages/solidaria/test/createSelect.test.tsx:98`, and solidaria is published, so any consumer spreading `triggerProps` gets attributes react-aria's `useSelect` never emits. The tail of this ticket already discloses it; this is the note that owns it. The auditor's empty-string reading is wrong - the shipped value is the string true - and #254 already names the trigger `data-open` under an owner gate, so drop the three at the hook and retire the pinning test rather than leaving the strip in `cleanTriggerProps` as the only defence",
    }
  - {
      state: in-progress,
      at: 2026-09-22,
      note: "widened to cover every cause the two waived D13 rows carry, because #578's review found the waiver disclosing only one of them. `apps/comparison/e2e/certified-waivers.json` waives `D13 journey — open-arrow-enter-reopen-scroll-escape` and `… — keyboard-only` against this ticket, one entry per case since 2026-09-22, and a waiver comes out only when the case it names goes green - so this ticket's Done-when has to be the whole case, not the attribute slice. The causes, each already measured below or in the round-2 note: pointer-open focus (open-arrow step 0 `focus`, ours the popover dialog where React has the selected option), keyboard-open focus order (keyboard-only step 1 `events`, the dialog's `focusin`/`focusout` pair), overlay entry motion behind cause 1 (opacity 0.41, dy 34 against React's 1 and 36, same family as #582), and the trigger's missing `data-pressed`, which is in the journey's compared attribute allowlist (`journeys.ts:78`) and is latent only because both journeys stop before the open popover is compared. The Done-when below now names all four, and the two waiver reasons name them too. The `expires` moved with that review from `2026-12-31` to `2026-10-21`; #610 owns binding the date to the release itself instead of to a horizon. One measurement that bears on the rows themselves and is not re-run here: `8361daba` (#608) changed `e2e/drivers/journeys-steps.ts`, which declares these two cases, after the run the waiver was written from - so the next `certified report` at or past `90297632` is what says whether they still fail the same way",
    }
---

## The defect

`D13 journeys — Picker trigger`, both cases —
`open-arrow-enter-reopen-scroll-escape` and `keyboard-only` — failing at step 0,
`click trigger`, field `dom`, at `journeys.ts:275`.

Two halves of one story.

On the `<button>` (`aria-haspopup: "listbox"`, `aria-expanded: "true"`), ours
carries `data-focused: "true"` and `data-open: "true"`. Upstream carries
`data: {}` — nothing at all.

On the root `<div>`, ours carries `data-focused: ""` and `data-open: ""`.
Upstream carries `"true"` and `"true"`.

RAC puts these on the root only. `react-aria-components/src/Select.tsx:284` is
`data-open={state.isOpen || undefined}`, and there is no other `data-open` in
the file. So `data-open` on our trigger button is an attribute upstream does not
render anywhere, and `data-focused` surviving on it after the click says our
focus tracking does not release the trigger when focus moves into the listbox.

The empty strings are the second half, and they are a serialisation bug.
`packages/solidaria-components/src/Select.tsx:776-782` builds the root props
with raw booleans — `"data-focused": isFocused() || undefined` — and a boolean
spread onto an element writes `""`, where React writes `"true"`. Forty lines
down, `:943-947` does it correctly with the helper this repository already has:
`dataAttr` at `packages/solidaria-components/src/utils.tsx:442`, typed
`"true" | undefined`. One file, two idioms, and the wrong one is on the element
the oracle reads.

## Scope

`packages/solidaria-components/src/Select.tsx`.

1. Root props at `:776-782`: route every `data-*` through `dataAttr` so the
   attribute is `"true"` or absent, never `""`.
2. Trigger button at `:943-947`: drop `data-open`, which RAC does not render on
   this element.
3. `data-focused` on the trigger: find why it is still true after the popover
   takes focus, and make it follow the focused element the way RAC's does.
   Fixing this by deleting the attribute is not the fix — `data-focused` is a
   documented RAC selector and consumers style on it.

Non-goal: the other emitters. `Menu.tsx:1681`, `DatePicker.tsx` (four sites),
`ComboBox.tsx` and `ActionBar.tsx:202` already use `dataAttr`; check them for
the same raw-boolean shape while here, but do not change behaviour that the
certified roster is not calling out.

## Done when

`certified/picker` D13 is green on both journeys, the root carries `"true"`,
and the trigger button carries what RAC's does and nothing more — which now
means `data-pressed` present while the popover is open, since RAC's Button
emits it and the journey compares it.

Both journeys are waived under #578, one entry per case, so this Done-when is
also the condition for removing those entries and it has to name every cause
the rows carry, not only the attribute slice:

1. Pointer-open focus — open-arrow step 0 `focus`.
2. Keyboard-open focus order — keyboard-only step 1 `events`.
3. Overlay entry motion, which only surfaces once 1 is fixed (#582's family;
   if the fix belongs there, say so on both tickets rather than waiving twice).
4. `data-pressed` on the trigger, latent until 1 and 2 stop truncating the
   comparison.

A row leaves `certified-waivers.json` when a `certified report` job shows its
case passing, not when this ticket's body is updated.

## Proof

`certified/picker`, with the counts recorded here, and the D13 `dom` field
diffed to empty on both cases. Mutation-prove the serialisation half by putting
a raw boolean back on one attribute and watching the `""` return.

## Relationship

Child of #544. One of the fourteen components in
`.agents/certified-169-census-2026-09-21.md`. Sibling of #585, which is the
same component's list box and a different cause; sibling of #497, which is the
combobox checkmark and neither of these.

## Remaining, 2026-09-21

The attribute slice is proved; D13 still fails for three more reasons:

1. **Pointer-open focus, open-arrow step 0 `focus`.** After a real click React's
   active element is the selected option; ours is the popover dialog, because
   `SelectListBox` skips `focusSafely` on a non-keyboard open (`77f0de27`).
   Taking that skip out makes D13 match and breaks D5/D10 `arrow-roving`, where
   React keeps the dialog. The reason is upstream: D5 opens with `clickLocator`,
   whose scripted `el.click()` (detail 0) switches react-aria's modality to
   `virtual`, so `focusSafely` defers and gives way to the dialog. Ours ignores
   that click: `handleClickEvent` in
   `packages/solidaria/src/interactions/createInteractionModality.ts:114`
   returns on `!e.isTrusted`, which `useFocusVisible.mjs` in react-aria 3.52.0
   does not do (`61b7b7f4`). Fixing it changes global modality for every
   certified spec that opens through `clickLocator`, which is beyond this file.
2. **Keyboard-open focus order, keyboard-only step 1 `events`.** React emits
   `focusin`/`focusout` on the dialog before the option takes focus; ours
   focuses the option directly.
3. **Overlay motion.** With cause 1 removed, open-arrow step 0 then fails on
   `overlay`: our popover observed mid-entry (opacity 0.41, dy 34) where React
   reads 1 and 36. Same family as #582.

`createSelect`'s triggerProps still emit invented `data-open`,
`data-disabled` and `data-focus-visible` as raw booleans, and
`packages/solidaria/test/createSelect.test.tsx:96` pins `data-open`.
`SelectTrigger` strips or overrides all three; the hook itself is left alone.
