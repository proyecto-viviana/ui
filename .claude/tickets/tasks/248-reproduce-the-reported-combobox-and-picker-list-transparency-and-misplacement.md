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
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "headless ComboBox/Picker ARIA parity landed (1d988fd9); step-0 round 2 lands field wiring through createField, the S2 HelpText shape, data-focus-within and no synthesized aria-label",
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

## Step-0 round 2 landed

Did not commit or stage. Changeset: `.changeset/combobox-picker-list-markup.md` (patch `solidaria`, `solidaria-components`, `solid-spectrum`, `@proyecto-viviana/ui`). Pin `scripts/upstream-pin.json` → `f56660b`.

RAC `useField.ts:51-60` concatenates **description id, then error id, then the user `aria-describedby`** (not error-first). The port matches that order.

### Upstream file:line → Solid file:line

1. **Select/ComboBox field wiring through `useField` / `useSlotId`**
   - RAC: `react-aria/src/select/useSelect.ts:181-186` (`useField({ …, labelElementType: 'span' })`); `react-aria/src/label/useField.ts:38-72`; `react-aria/src/utils/useId.ts:135-149` (`useSlotId` via `useValueEffect`: yield id, then probe). RAC ComboBox reaches the same through `useTextField` → `useField`.
   - Solid: `packages/solidaria/src/label/createField.ts:86-139` (`createSlotId` deps + describedby join); `packages/solidaria/src/ssr/index.tsx:116-143` (`createSlotId` yield-then-probe); `packages/solidaria/src/select/createSelect.ts:141-171` (`createField`, `labelElementType: "span"`); `packages/solidaria/src/combobox/createComboBox.ts:199-228` (`createField`, `labelElementType: "label"`). Deleted hand-built `${id}-description` / `${id}-error` and the trigger overwrite of `aria-describedby`.
   - Composition: `packages/solidaria-components/src/Select.tsx:731-751` (`TextContext` description/errorMessage slots — RAC `Select.tsx:267-274`). Deleted `errorMessageId` / `triggerDescribedBy` stitching. `packages/solidaria-components/src/ComboBox.tsx:605-703` provides `FieldErrorContext` (RAC `ComboBox.tsx:359`).
   - `packages/solidaria-components/src/Text.tsx:39-54` forwards `slot` onto the DOM (RAC `Text.tsx:28-31`). `packages/solidaria-components/src/FieldError.tsx:105-118` renders `<Text slot="errorMessage">` with no `role="alert"` (RAC `FieldError.tsx:67-72`).

2. **Styled layers stop compensating**
   - Deleted Picker `descriptionId` / `selectDescribedBy` / `<p id={descriptionId}>` / `HeadlessFieldError` in `packages/solid-spectrum/src/picker/index.tsx` and the viviana-ui twin. Renders `<HelpText>`. Keep `labelId`.
   - Deleted ComboBox Description/ErrorMessage + passing description/errorMessage into HeadlessComboBox in `packages/solid-spectrum/src/combobox/index.tsx` and the viviana-ui twin. Renders `<HelpText>`.

3. **`HelpText` takes S2's shape**
   - S2: `s2/Field.tsx:407-468` (`<Text slot="description">` when valid, `<FieldError>` when invalid, no wrapper).
   - Solid: `packages/solid-spectrum/src/form/HelpText.tsx:81-119` and viviana-ui twin.
   - Call sites switched to shared `HelpText` (S2 counterparts use `HelpText`): TextField, TextArea, SearchField, NumberField, ColorField, Picker, ComboBox (`packages/solid-spectrum/src/{textfield,searchfield,numberfield,color,picker,combobox}` + viviana-ui twins).
   - **Kept explicit id path** (no headless `TextContext` slot):
     - `packages/solid-spectrum/src/form/Field.tsx:103-110` — layout wrapper, no `TextContext`; still `<p role="alert">` / `<p>`.
     - Checkbox / CheckboxGroup / RadioGroup / Switch — already `Text` slots; groups use explicit WeakMap ids because group-level `TextContext` is inert (`RadioGroup.tsx` `port-context-slots`).
     - calendar / DatePicker — concurrent lane; not touched.
     - `contextualhelp` — style name only.

4. **Group `data-focused` → `data-focus-within`**
   - RAC: `Group.tsx:129` (`data-focus-within` / `data-focus-visible`, no `data-focused`).
   - Solid: `packages/solid-spectrum/src/combobox/index.tsx` field group (and viviana-ui twin). S2 ComboBox style macro reads `isFocusWithin`.

5. **ComboBox `aria-label` synthesis dropped**
   - Deleted `?? textLabel()` on options; `aria-label={headlessProps["aria-label"]}` only (RAC ListBoxItem forwards an explicit prop).

### createField getters (forced by slot ids)

Destructuring `createField`'s `fieldProps` froze the first-paint slot ids. Un-destructured in `createTextField.ts`, `createRadioGroup.ts`, `createCheckboxGroup.ts` so they re-read `createSlotId` like RAC `useField` every render. `createRadioGroup` now passes `aria-describedby` into `createField` so slot ids concatenate with the user prop instead of overwriting it (`useField.ts:51-60`).

### Tests

- `createSelect field slot ids` — trigger describedby only when the description slot renders; error id when invalid and the error slot renders; preserves user `aria-describedby`; `descriptionProps.id` undefined when no description is rendered (RAC `useField.ts:38-60` / `useSlotId` `useId.ts:135-149`; RAC `Select.test.js:75-82`).
- `solidaria-components` Select/ComboBox — `<Text slot="description">` id is the one the trigger/input references (RAC `Select.test.js:75-82`, `ComboBox.test.js:82-89`).
- `solid-spectrum` Picker/ComboBox — `span[slot=description]` not `p`; error `span[slot=errorMessage]` without `role="alert"`; trigger/input describedby resolves; ComboBox group `data-focus-within` and no `data-focused`; labelled ComboBox input has no synthesized `aria-label`.
- **NEW test-parity suspects** (orchestrator: `--allow-growth 248`, do not write the baseline): `combobox|role|alert`, `select|role|alert` — RAC `FieldError.tsx:67-72` renders `<Text slot="errorMessage">` with no `role="alert"`; the new tests assert that, and the oracle counts the token.

Red-then-green (pre-slot-forward / pre-FieldErrorContext / pre-createField):

- Picker/ComboBox: `Expected slot="description", Received: null`
- ComboBox invalid: `Unable to find an element with the text: Selection is required`
- Select help text: `expected null to be 'description'`
- Select validation: `Expected aria-describedby, Received: null` while FieldError was in the DOM without an id

`solid-spectrum/test/regression.test.tsx` snapshots: no diff this round (passed without update).

### Verification

- `vp test run packages/solidaria/test packages/solidaria-components/test packages/solid-spectrum packages/viviana-ui` — **1 failed | 246 passed (247 files); 3 failed | 4974 passed | 1 expected fail | 6 skipped (4984)**. The 3 failures are RadioGroup ref identity after `createSlotId` probe remounts nested `GroupChildren` — #258. No Popover/ActionMenu/DatePicker failures in this run.
- `vp run typecheck` — pass.
- `vp run guard:layer-boundary` — PASS; NEW forks 0; twins same-hunk (viviana-ui picker is a baselined divergence).
- `vp run guard:attribution-headers` — PASS. Changed reviewed locals: `Text.tsx`, `FieldError.tsx`, `createField.ts`, `ssr/index.tsx` (headers already matched; orchestrator does not need to re-record).
- `vp run guard:upstream-test-parity` — suspects 152 → 154 (Δ+2), coverageGaps 47 → 47, upstreamOnly 18 → 18. **NEW suspects** (do not write the baseline; orchestrator can absorb with `--allow-growth 248`): `combobox|role|alert`, `select|role|alert` — our new Picker/ComboBox tests assert the error span has **no** `role="alert"`, matching RAC `FieldError.tsx:67-72` (renders `<Text slot="errorMessage">`, no alert). The oracle counts the token.
- `vp run test:ssr` — 12 files, 26 passed.
- `vp run test:hydrate` — 12 files, 28 passed | 1 expected fail (run **after** SSR so `output/*.html` matches HelpText `<span>`). Parallel SSR+hydrate races on stale markup.
- Playwright not run (headless Chromium `requestAnimationFrame` never fires on this machine).
- `vp check --fix` on owned files — pass; `git diff --check` — clean.

### Remaining for D13 seeds

Field-DOM items in this round are done (`p` → `span[slot=description]`, error `span[slot=errorMessage]` without `role="alert"`, `data-focus-within`, no synthesized ComboBox `aria-label`, trigger/input describedby from `createField`). What should still remain at step 0:

- #256 Virtualizer wrapper nodes (`data-virtualizer` ancestor; listbox is not the scroller).
- #251 animation attributes / `isEntering` on the overlay.
- #252 `aria-posinset` / `aria-setsize` (no Virtualizer parent, `isVirtualized` stays false).
- #258 group-level `TextContext` still inert (WeakMap id path). Radio remount/ref identity is landed.

### Wave-3 regression fix — ColorField description

Wave-3 D6 AX (`e2e/certified/colorfield.certified.spec.ts`, ColorField › default):
React's textbox "Color" has description "Enter a hex color"; Solid's had none.

**Root cause.** Commit 2ac31ca9 switched S2 `HelpText` to RAC `<Text slot="description">` /
`<FieldError slot="errorMessage">` (S2 `Field.tsx` shape). ColorField kept the old
id path:

- `packages/solidaria/src/color/createColorField.ts:41-43` (pre-fix) minted
  description/error ids with `createId()` and never routed through `createField`
  / `createSlotId`. Input `aria-describedby` was only the user-supplied value.
- `packages/solidaria-components/src/Color.tsx:1591-1617` (pre-fix) hand-built
  `aria-describedby` from the `description` / `errorMessage` _props_ and never
  provided RAC `TextContext` / `FieldErrorContext`. HelpText's
  `<span slot="description">` therefore had no `id`, so the AX tree could not
  resolve the description (input pointed at `solidaria-cl-N`, the span had no
  id). TextField/NumberField/SearchField already wrap children in `TextContext`
  slots from `createField`.

**Fix.** Owning layer: `createColorField` now calls `createField` (RAC
`useColorField` → `useFormattedTextField` → `useTextField` → `useField`).
Headless ColorField (`Color.tsx`) provides `TextContext` slots +
`FieldErrorContext` like RAC `ColorField.tsx:258-282`. S2/viviana-ui ColorField
already compose HelpText the same way as TextField; no twin source edit.

**Test (red → green).**

- `solidaria-components` ColorField slots: `<Text slot="description">` /
  `<Text slot="errorMessage">` ids are the ones `aria-describedby` references
  (RAC `ColorField.test.js` "provides slots"). Before: `aria-describedby`
  missing / `expected '' to be 'Enter a hex color'`. After: pass.
- `solid-spectrum` ColorField: description resolves to "Enter a hex color";
  `errorMessage` + invalid resolves to the error text. Before:
  `getElementById(describedBy[0])` was `null` (span had `slot` but no `id`).
  After: pass.

**Gates.** `vp test run packages/solidaria packages/solidaria-components packages/solid-spectrum packages/viviana-ui` — 248 files, 5003 passed | 1 expected fail | 6 skipped. `vp run typecheck` — pass. `vp run typecheck:apps` — 0 errors. `vp run guard:layer-boundary` — PASS; NEW forks 0. `vp run guard:upstream-test-parity` — suspects 155 → 155 (Δ0), coverageGaps 47 → 47, upstreamOnly 18 → 18 (did not write). `vp run guard:attribution-headers` — PASS. `vp check --fix` on owned files — pass. `git diff --check` — clean. Playwright certified ColorField/Avatar and `comparison:test:journeys-driver` not run (orchestrator owns the browser slot and shared `dist`). No changeset (behavior restored to the pre-2ac31ca9 HelpText contract; same wave).

Orchestrator (2026-09-02 Preview 1): certified `colorfield` **green** (D6 describedby included). Avatar D1 is #240 (no-store delay, 22/22).

## Wave-3 D13 step-0 remaining (orchestrator split, 2026-09-02)

Certified `output/audit-2026-09/wave-3/failures/d13-journeys.txt`. Field-DOM
items from round 2 (`p` vs `span`, `data-focus-within`, describedby) are
landed. What still fails at step 0, by owner:

| Diff                                                                                                                      | Owner                                                               |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `data-open` / `data-pressed` / `data-focused` on ComboBox input and trigger button                                        | #209                                                                |
| Extra wrapper div with `data-focus-visible`/`data-focused` on Picker keyboard-only; plain RAC `Button` vs `SelectTrigger` | #254 (owner decision, do not start)                                 |
| Dismiss button Solid has `aria-hidden="true"`, React does not                                                             | this ticket (overlay/Dismiss)                                       |
| React `<template>` vs Solid `<form>`; extra hidden `<input>`                                                              | this ticket (HiddenSelect / React 19 Activity vs Solid form markup) |

H1/H2 journeys stay blocked until step 0 is green. Do not patch the journey
driver to ignore these.
