---
id: 248
type: task
title: "Reproduce the reported ComboBox and Picker list transparency and misplacement"
created: 2026-09-02
parent: 243
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
---

## Cause

Owner report (2026-09-02): on ComboBox or Picker the popover list "gets
transparent, or appears somewhere else". Static open state is pixel-certified,
so the defect is a step-N state: reopen after close, open during or after
page scroll, viewport resize while open, filtering that empties and refills
the list, or an enter transition that never clears (`opacity: 0` while the
`data-entering` state is stuck). Popover color-scheme wiring mirrors S2
(`ColorSchemeContext` → `setColorScheme()` on the popover root), so a static
missing background is unlikely; check the transition and positioning paths
first.

## Work

Drive the D13 seed journeys (#244) and the reopen / scroll / resize / filter
rows of #245 and #246 against the comparison app and the docs routes in
`apps/web`; capture the first divergent step. Root-cause in `solidaria`
(`usePopover` / `useOverlayPosition` port) or `solid-spectrum` Popover
transition state; fix in the lowest layer; the failing journey stays as the
regression test.

## Done when

The journey that reproduces it fails before the fix and passes after, on both
styled packages; ticket names the root cause with file:line.

## Hypotheses and the journeys that decide them (2026-09-02)

From the shared overlay ledger (`apps/comparison/playbook/journeys/shared-overlay.md`,
"Geometry contract"):

1. **Transparent list** = `isEntering` / `isExiting` stuck. Upstream
   `useEnterAnimation` returns `isEntering && isReady` with `isReady = !!placement`,
   and both hooks complete on `element.getAnimations().finished` (no timers).
   S2 styles `opacity: 0` while either flag is set and `pointer-events: none`
   while exiting. The port's `Popover` has no such state and `ActionMenu`
   hand-rolls it with `setTimeout`/rAF (#251) — a stale flag leaves a mounted
   list at opacity 0. Decided by `CB-OV-05` / `PK-OV-04` steps 1–5 and the 20×
   open/close fuzz (never a settled overlay with opacity < 1).
2. **List somewhere else** = the pre-placement frame
   (`position: fixed; top: 0; left: 0`, `useOverlayPosition.ts:400-409`)
   painted, or a stale position after a portal-container change. Decided by
   `CB-OV-05` / `PK-OV-04` step 1 (never observed at the viewport origin),
   `CB-OC-12` / `PK-OC-15` (portal into a dialog container), `CB-OV-02` /
   `PK-OV-02` (resize recompute), `CB-OV-06` / `PK-OV-05` (maxHeight + scroll
   anchor).

Before either can run, step 0 must pass: the #244 seed runs already diverge on
option ARIA (`aria-label` + `aria-describedby="(missing)"` vs `aria-labelledby`

- `aria-posinset`/`aria-setsize`), missing `data-layout`/`data-orientation`,
  Solid input `aria-haspopup`, `data-focused` vs `data-focus-within`, Picker
  overlay `aria-labelledby` missing, an extra nameless hidden `input`. Those are
  the first fixes on this ticket (lowest layer: `solidaria` `useOption` /
  `useListBox` / `useComboBox` / `useSelect`).

## Relationship

Child of #243. Feeds #245 / #246. Related: #135 / #184 (post-hydration
state classes), #234 (iOS 26 visualViewport positioning in RAC 1.21).

## Landed

In-lane list-markup parity for the #244 seed journeys (step 0 `field dom`).
Did not commit or stage. Changeset: `.changeset/combobox-picker-list-markup.md`
(patch `solidaria` + `solidaria-components`).

### Per divergence

1. **Option ARIA (labelledby / describedby / posinset / setsize / data-selection-mode)**
   - RAC: `react-aria/src/listbox/useOption.ts:117-134` (`useSlotId` for label + description; posinset/setsize only when `isVirtualized`); RAC `ListBox.tsx:628-640` (`data-selection-mode`).
   - Solid: `packages/solidaria/src/listbox/createOption.ts:173-215` (`createSlotId`; labelledby/describedby only when the slot is in the DOM); `packages/solidaria-components/src/ListBox.tsx:1178`, `ComboBox.tsx:1282`, `Select.tsx:1396` (`data-selection-mode`); ComboBox/Select listboxes forward `isVirtualized` from `useCollectionRenderer` (`ComboBox.tsx:1009-1016`, `Select.tsx:1041-1056`).
   - Tests: `option does not reference a description id when no description slot is rendered`; `option does not reference a label id when no label slot is rendered`; `option points aria-describedby at a rendered description slot`; `option exposes data-selection-mode`; `omits aria-posinset/aria-setsize when not virtualized` / `sets aria-posinset/aria-setsize when virtualized`.

2. **Listbox root `data-layout` / `data-orientation` / `data-focused`**
   - RAC: `ListBox.tsx:411-416` (`data-focused`/`data-focus-visible` from `useFocusRing` on the listbox; `data-layout` default `stack`; `data-orientation`).
   - Solid: `packages/solidaria-components/src/ListBox.tsx:384-390,900-905`; ComboBox listbox `ComboBox.tsx:1020-1093`; Select listbox `Select.tsx:1061-1158`. Virtual-focus ComboBox listbox does not emit `data-focused`.
   - Tests: `listbox exposes data-layout and data-orientation`.

3. **ComboBox input `aria-haspopup`**
   - RAC: `useComboBox.ts:520-526` (input gets `aria-expanded`/`aria-controls`, not `aria-haspopup`; button keeps it).
   - Solid: `packages/solidaria/src/combobox/createComboBox.ts:666-670` (input); button still `711`.
   - Tests: `combobox input does not carry aria-haspopup`.

4. **ComboBox field group `data-focused` vs `data-focus-within`** — out of lane (below).

5. **Picker overlay `aria-labelledby`**
   - RAC: `Select.tsx:255-263` passes `menuProps['aria-labelledby']` into `PopoverContext`; `Popover.tsx:343` renders it.
   - Solid: `packages/solidaria-components/src/Popover.tsx:325-328,624` reads `SelectContext.menuProps['aria-labelledby']` (Solid Select does not inject RAC `PopoverContext`; S2 Picker already passes `isOpen` from SelectContext).
   - Test: `overlay root carries aria-labelledby from the select menu`.

6. **Picker extra hidden `<input>`**
   - RAC: `HiddenSelect.tsx:172-244` (≤300: `<select>` in `<label>` in visually hidden container; hidden `<input>`s only when `size > 300` and `name` is set; empty selection still renders one input).
   - Solid: `packages/solidaria/src/select/createHiddenSelect.tsx:284-325`; `packages/solidaria-components/src/Select.tsx:630-680`.
   - Test: `hidden select renders no extra input`.

7. **`data-rac`**
   - Solid does not emit it. `apps/comparison/e2e/drivers/dom-oracle.ts:3-9` adds `ORACLE_IGNORED_DATA_ATTRIBUTES = ["data-rac"]`. The live D13 allow-list is `RAC_STATE_DATA_ATTRIBUTES` in `journeys.ts` (out of lane); that list already omits `data-rac`.

8. **Picker `aria-describedby` `p` vs `span`** — out of lane (below).

### Seed journeys (after in-lane fixes)

`vp run comparison:build` passed. Four D13 seeds (`COMPARISON_PORT=4332`, grep `D13 journey —`) all still fail **step 0 `field dom`**. First message each:

- ComboBox `open-arrow-enter-reopen-scroll-escape`: `Error: open-arrow-enter-reopen-scroll-escape step 0 (click trigger) field dom` — remaining: option `aria-label` (Solid still synthesizes it), missing `aria-posinset`/`aria-setsize` (no Virtualizer), field group `data-focused` vs React `data-focus-within`, extra `data-open`/`data-focus-visible` on input/button, overlay `form` vs React `template`, extra `input[aria-hidden]`.
- ComboBox `keyboard-only`: `Error: keyboard-only step 0 (Tab to trigger) field dom` — remaining: field group `data-focused` vs `data-focus-within`; chevron `data-focused`.
- Picker `open-arrow-enter-reopen-scroll-escape`: `Error: open-arrow-enter-reopen-scroll-escape step 0 (click trigger) field dom` — remaining: missing `aria-posinset`/`aria-setsize`, `aria-describedby` `p:Choose the billing plan.` vs `span:…`, extra `svg` child on the trigger, extra `data-focused`/`data-open` on the button.
- Picker `keyboard-only`: `Error: keyboard-only step 0 (Tab to trigger) field dom` — remaining: `aria-describedby` `p:` vs `span:`; Solid missing a React wrapper `div` with `data-focus-visible`/`data-focused`.

In-lane option labelledby (no missing describedby id), listbox `data-layout`/`data-orientation`, no input `aria-haspopup`, no extra nameless HiddenSelect input, and `data-selection-mode` are no longer the first-diff attributes.

### Out of lane

- Picker description `p` vs `span`: `packages/solid-spectrum/src/form/HelpText.tsx:62,67` still render `<p>`. S2 `Field.tsx:416-426` HelpText uses `<Text slot="description">` (a `<span>`). Change those two tags to `<span>`.
- ComboBox field group `data-focused` vs `data-focus-within`: `packages/solid-spectrum/src/combobox/index.tsx:630` emits `data-focused`. RAC `Group.tsx:129` emits `data-focus-within` (from `useFocusWithin`). Change `data-focused` to `data-focus-within`. No RAC Group lives in this lane (`Collection.tsx` Group is a section primitive).
- ComboBox option synthesized `aria-label`: `packages/solid-spectrum/src/combobox/index.tsx:1091` `aria-label={headlessProps["aria-label"] ?? textLabel()}`. RAC ListBoxItem only forwards an explicit `aria-label`. Drop the `?? textLabel()` fallback.
- S2 ComboBox/Picker Virtualizer: S2 wraps ListBox in `<Virtualizer>` (`@react-spectrum/s2/src/ComboBox.tsx:796`, `Picker.tsx:457`). Solid-spectrum does not. `isVirtualized` is forwarded in-lane but stays false without a Virtualizer parent, so journeys still miss `aria-posinset`/`aria-setsize`.
- `data-rac` comparison wiring: `apps/comparison/e2e/drivers/journeys.ts` `RAC_STATE_DATA_ATTRIBUTES` already excludes `data-rac`. `ORACLE_IGNORED_DATA_ATTRIBUTES` in `dom-oracle.ts` is unused by `journeys-observe.ts` (allow-list is passed from `journeys.ts`).

### Verification

- `vp test run packages/solidaria/test/createListBox.test.tsx packages/solidaria/test/createComboBox.test.tsx packages/solidaria/test/createHiddenSelect.test.tsx packages/solidaria/test/createSelect.test.tsx packages/solidaria-components/test/ListBox.test.tsx packages/solidaria-components/test/ComboBox.test.tsx packages/solidaria-components/test/Select.test.tsx packages/solidaria-components/test/Popover.test.tsx` — 8 files, 435 passed.
- `vp run typecheck` — pass (after dropping `selectionMode() === "none"` on Select options; Select mode is `"single" | "multiple"`).
- `vp run guard:layer-boundary` — PASS.
- `vp run guard:rac-parity` — PASS.
- `vp check --fix` on owned files — pass; `git diff --check` on owned files — clean.

## Remaining step-0 items after the headless lane (orchestrator, 2026-09-02)

Still diffed at step 0 `field dom` on all four seeds, all in the styled layer:

- `solid-spectrum/src/form/HelpText.tsx:62,67` renders the description as `<p>`; S2 `Field.tsx:416-426` renders `<span>` (Picker `aria-describedby` resolves to `p:` vs `span:`).
- `solid-spectrum/src/combobox/index.tsx:630` field group emits `data-focused`; RAC `Group.tsx:129` emits `data-focus-within` (plus `data-focus-visible`).
- `solid-spectrum/src/combobox/index.tsx:1091` synthesizes `aria-label` from the label text (`?? textLabel()`); S2 passes the user prop only.
- Options lack `aria-posinset`/`aria-setsize` because the Solid listbox is never virtualized — #252.

The first three land with #198 (same files) or directly after it; the twins in `@proyecto-viviana/ui` follow the layer-boundary rule.

Root cause behind the Picker `p:` description (orchestrator, 2026-09-02): RAC `useSelect.ts:181` builds its field wiring with `useField` (slot ids via `useSlotId`; trigger `aria-describedby` = error id when invalid + description id + the user prop, only for rendered slots — `useField.ts:38-57`). Solid `createSelect.ts:123-124,404,470-477` hand-builds `${id}-description` / `${id}-error`, never folds them into the trigger `aria-describedby`, and ignores whether the slot rendered. `solidaria/src/label/createField.ts` already implements the RAC logic. `solid-spectrum/src/picker/index.tsx:892-905,1005,1086` compensates by minting its own `descriptionId`, stitching `aria-describedby`, and rendering a `<p>` instead of `<Text slot="description">` through the Select `TextContext` (`Select.tsx:738-751`). Fix in the lowest layer: `createSelect` (and `createComboBox` if it does the same) go through `createField`; the Picker/ComboBox styled layers drop the manual ids and render the S2 `HelpText` shape (`Text slot="description"` / `FieldError`). Bundle with the three styled items above.
