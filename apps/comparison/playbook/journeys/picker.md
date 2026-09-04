# Picker (RAC Select) — interaction journeys (D13)

Route `/components/picker`. React panel: `@react-spectrum/s2` `Picker`. Solid
panel: `@proyecto-viviana/solid-spectrum` `Picker`. Pin: `react-spectrum`
`f56660b` (RAC 1.21.0 / S2 1.7.0). Ticket #246; driver #244; owner defect #248;
structural suspect #251.

Fact ids (`OC-002`, `TA-001`, `scr-6`, …) refer to the Picker ledger (312 rows,
cited to `react-aria-components/test/Select.test.js`, `Select.ssr.test.js`,
`react-aria/test/select/HiddenSelect.test.tsx`, `@react-spectrum/s2/test/Picker.test.tsx`,
`Picker.browser.test.tsx`, `@react-aria/test-utils/src/select.ts`, and the
`useSelect.ts` / `useSelectState.ts` / `useMenuTrigger.ts` / `useTypeSelect.ts` /
`HiddenSelect.tsx` / `s2/Picker.tsx` sources) and the shared overlay + selection
ledger (347 rows). Every fact carries a `file:line`; open it before writing the
step.

What makes Picker different from ComboBox (same machinery, different
configuration — see the table at the top of `shared-overlay.md`): the popover
is **modal** (`isNonModal` unset): `role="dialog"`, underlay, two Dismiss
buttons, `preventScroll`, `ariaHideOutside` with `inert`, **no close on
scroll**, `FocusScope contain`. The list uses **real DOM focus** on options
(`tabindex` 0/−1), never `aria-activedescendant`. Mouse opens on **press
start**; touch opens on **press up**. Closed-trigger `ArrowLeft/Right` change
the value without opening; closed-trigger typeahead selects without opening
(1000 ms buffer). S2 Picker omits `allowsEmptyCollection` (an empty collection
cannot open) and forces `isPressed={false}` on the trigger (no `data-pressed`
while open; the open state is a class). The S2 mobile tray is a commented TODO.

## Fixture matrix

Existing controls (`apps/comparison/src/data/picker-demo.ts`): `label`,
`selectedKey` (starter | pro | enterprise), `selectionMode` (single | multiple),
`selectionSource` (value | defaultValue), `placeholder`, `size`, `labelPosition`,
`labelAlign`, `necessityIndicator`, `description`, `errorMessage`, `name`,
`form`, `validationBehavior`, `direction`, `align`, `menuWidth`, `loadingState`
(idle | loading | loadingMore), `isQuiet`, `isDisabled`, `isRequired`,
`isInvalid`, `shouldFlip`, `disableEnterprise`, `withContextualHelp`,
`withRenderValue`, locale (en-US | ar-AE).

Controls to **add** to both fixtures (same change):

| control               | values                                                                                                                                                                                                                                                                                                                         | why                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectedKey`         | + `none`                                                                                                                                                                                                                                                                                                                       | unselected start                                                                                                                                                                                                 |
| `itemsPreset`         | `three` \| `sections` (Plans / Add-ons + S2 Divider) \| `many` (50 items, `Item 25` disabled) \| `empty` \| `link` (`href="#plan-docs"`) \| `typeahead` (the 8 Australian states/territories used upstream) \| `numeric` (ids `0,1,2`, labels `0`,`1`,`2`) \| `big` (320 items) \| `icons` (items with `slot="icon"` / avatar) | typeahead, falsy keys, >300 hidden inputs, S2 value slots                                                                                                                                                        |
| `layout`              | `default` \| `nearBottom` \| `inScroller` \| `inDialog`                                                                                                                                                                                                                                                                        | flip, no-scroll-close, dialog stacking                                                                                                                                                                           |
| `sentinels`           | on                                                                                                                                                                                                                                                                                                                             | `before` / `after` tabbables                                                                                                                                                                                     |
| `withForm`            | on                                                                                                                                                                                                                                                                                                                             | Submit/Reset + `data-comparison-submit-count`, `data-comparison-form-data`                                                                                                                                       |
| `withClearButton`     | on                                                                                                                                                                                                                                                                                                                             | extra button calling `setSelectedKey(null)` (SV-033)                                                                                                                                                             |
| `autoFocus`           | on                                                                                                                                                                                                                                                                                                                             | OC-048                                                                                                                                                                                                           |
| `shouldCloseOnSelect` | true \| false                                                                                                                                                                                                                                                                                                                  | OC-029–OC-032 (verify S2 exposes it; else `unit-only`)                                                                                                                                                           |
| `isOpen`              | controlled true/false                                                                                                                                                                                                                                                                                                          | OC-021–OC-024 (verify S2 exposes it; else `unit-only`)                                                                                                                                                           |
| `eventLog`            | on                                                                                                                                                                                                                                                                                                                             | `data-comparison-events`: `onOpenChange`, `onChange`, `onSelectionChange`, `onFocus`, `onBlur`, `onFocusChange`, `onLoadMore`; `data-comparison-load-more-count`; console warnings captured as `console` entries |

Default for this file: **`selectedKey=none`, `selectionSource=defaultValue`,
`itemsPreset=three`, `sentinels=on`, `eventLog=on`**, en-US, size M.

Driver extensions (★, to add in #246 or shared with #245): `focus(target)`,
`keyDown/keyUp(key)`, `touchDown/touchUp(target)`, `dispatch(target, type)`,
`control(name, value)`, `submit`, `reset`, `selectOption(hiddenSelect, value)`
(native `<select>` change, the autofill path), `ua(profile)`.

---

## A. Open / close

**PK-OC-01 click trigger (press start), click option (press up)** — fixture: default

1. observe → trigger `role=button`, text `Select…` (S2 placeholder), `aria-haspopup="listbox"`, `aria-expanded="false"`, no `aria-controls`, no `data-pressed`; wrapper no `data-open`; value node `data-placeholder`; no listbox; no underlay
2. `mouseDown(trigger)` → **already open**: listbox present (3 options, `aria-selected="false"`), overlay `role="dialog"`, `tabindex="-1"`, `data-trigger="Select"`, `data-placement="bottom"`; `aria-expanded="true"`; `aria-controls` = listbox id on the trigger; wrapper `data-open`; **no** `data-pressed` (S2 `isPressed={false}`); `focus.active` = **listbox** (no selection → `focusSafely(listbox)`, listbox `tabindex="0"`); underlay present; events `onOpenChange(true)`
3. `mouseUp(trigger)` → unchanged
4. `settle(300)` → overlay opacity `1`
5. `click(option "Pro")` → closed; trigger text `Pro`; value node no `data-placeholder`; `focus.active` = trigger; events `onChange("pro")` **then** `onSelectionChange("pro")`, then `onOpenChange(false)`; wrapper no `data-open`

- facts: OC-001, OC-002, OC-003, OC-027, OC-028 (S2 variant S2-022), OC-033, OC-051, SV-001, SV-015, SV-017, SV-018, SV-041, SV-042, SV-045, FB-008, AR-001, AR-002, AR-006, AR-007, NV-036, NV-037, EV-003, EV-005, EV-006, pos-rac-dialog-role, dis-rac-underlay, foc-press-focus-default

**PK-OC-02 keyboard open strategies** — fixture: default, then `selectedKey=pro`

1. `press(Tab)` → trigger focused; wrapper `data-focused`, `data-focus-visible`
2. `press(Enter)` → open; `focus.active` = option `Starter` (`tabindex="0"`, others `-1`); Enter `keydown` `defaultPrevented`
3. `press(Escape)` → closed; `focus.active` = trigger
4. `press(Space)` → open, `Starter` focused; `press(Escape)`
5. `press(ArrowDown)` → open, `Starter`; `press(Escape)`
6. `press(ArrowUp)` → open, **`Enterprise`** (last); `press(Escape)`
7. `press(Alt+ArrowDown)` → `Starter`; `press(Escape)`; `press(Alt+ArrowUp)` → `Enterprise`; `press(Escape)`
8. `control(selectedKey, pro)`; repeat Enter / Space / ArrowDown / ArrowUp / Alt+ArrowDown → **`Pro`** focused every time (selected key wins over first/last)

- facts: OC-004–OC-011, OC-015, OC-016, OC-043, NV-035, NV-039, FB-009, FB-013, EV-003, sel-2, sel-3, dis-7

**PK-OC-03 touch opens on press up** — fixture: default

1. ★`touchDown(trigger)` → **closed**
2. ★`touchUp(trigger)` → open; `focus.active` = listbox
3. `tap(trigger)` → closed; `focus.active` = trigger
4. `tap(trigger)`; `tap(option "Pro")` → selected; closed; focus trigger

- facts: OC-013, OC-014, TM-001, TM-002, TM-003, TM-006, TM-008, SV-002, sel-diff-origin; OC-012 (virtual pointer) `unit-only`

**PK-OC-04 dismissal: underlay click, right click, Escape** — fixture: default

1. `click(trigger)`; `mouseDown(outside)` → **still open** (close is on up/click)
2. `mouseUp(outside)` → closed; `focus.active` = trigger; events show `pointerdown`/`click` on the outside target (the underlay) — no selection change
3. `click(trigger)`; `click(outside, button: right)` → **still open**
4. `press(Escape)` → closed; focus trigger

- facts: OC-017, OC-043, dis-2, dis-src-interact-start, dis-src-right-click, dis-io-1, dis-io-2, dis-io-3, dis-rac-click-body, dis-rac-focus-restore, evt-1

**PK-OC-05 empty collection cannot open (S2)** — fixture: `itemsPreset=empty`

1. `click(trigger)` → closed; no `aria-controls`
2. `control(loadingState, loadingMore)`; `click(trigger)` → still closed (loader is not an item)

- facts: OC-018, OC-019, S2-025; OC-020, OC-038 (RAC `allowsEmptyCollection`) `unit-only`

**PK-OC-06 controlled `isOpen`** — fixture: `isOpen` (only if S2 exposes it)

1. `control(isOpen, true)` at load → open without gesture; `onOpenChange` not called
2. `press(Escape)` → `onOpenChange(false)`; **stays open** (parent holds `true`)
3. `control(isOpen, false)`; `click(trigger)` → `onOpenChange(true)`; stays closed

- facts: OC-021–OC-024; else `unit-only`

**PK-OC-07 `isDisabled`** — fixture: `isDisabled=on`, `name=plan`

1. observe → trigger `disabled`; wrapper `data-disabled`; hidden `select[name=plan]` `disabled`
2. `click(trigger)`, `press(Enter)`, `tap(trigger)`, `mouseDown(trigger)` → closed
3. `click(label)` → focus unchanged

- facts: OC-025, OC-034, OC-047, FM-006

**PK-OC-08 `shouldCloseOnSelect` and `selectionMode`** — fixture: `shouldCloseOnSelect=false` (if exposed), then `selectionMode=multiple`

1. `click(trigger)`; `click(option "Pro")` → selected; **stays open**; trigger text `Pro`
2. `control(shouldCloseOnSelect, default)`; `control(selectionMode, multiple)`; `click(trigger)`; `click(option "Pro")` → selected; **stays open** (multiple default); listbox `aria-multiselectable="true"`
3. `control(shouldCloseOnSelect, true)`; reopen; `click(option "Starter")` → **closes**

- facts: OC-029–OC-032, AR-008, NV-026

**PK-OC-09 closed-trigger ArrowLeft / ArrowRight move the value** — fixture: default, `disableEnterprise=on`

1. `press(Tab)`; `press(ArrowRight)` → **closed**; trigger `Starter`; `onChange("starter")`
2. `press(ArrowRight)` → `Pro`
3. `press(ArrowRight)` → stays `Pro` (`Enterprise` disabled is skipped, nothing after)
4. `press(ArrowLeft)` → `Starter`; `press(ArrowLeft)` → stays `Starter`
5. ★`keyDown(ArrowRight)`, `settle(600)`, ★`keyUp(ArrowRight)` → advanced by key repeat (`Pro`)
6. `control(selectionMode, multiple)`; `press(ArrowRight)` → no-op, closed, value unchanged
7. `control(locale, ar-AE)`; repeat 1–2 → same keys (Right = next, no RTL mirror)

- facts: OC-035, OC-036, OC-037, SV-010, SV-011, SV-012, SV-013, EV-013, NV-028, RL-002

**PK-OC-10 label click focuses the trigger with the keyboard ring** — fixture: default

1. `click(label)` → `focus.active` = trigger; **closed**; `focus.focusVisible` true (label is a `span`, no `for`; `setInteractionModality('keyboard')`)

- facts: OC-046, FB-014, AR-017

**PK-OC-11 `autoFocus`** — fixture: `autoFocus=on`

1. observe at load → `focus.active` = trigger; closed

- facts: OC-048, FB-003

**PK-OC-12 focus is contained while open** — fixture: default

1. `press(Tab)`, `press(Enter)` → `Starter` focused
2. `press(Tab)` → `focus.active` still **inside the overlay** (same element on both stacks); listbox still open
3. `press(Shift+Tab)` → still inside
4. `press(Escape)` → focus trigger

- facts: OC-045, NV-029, NV-030, port-src-focus, sel-tab, Overlay `shouldContainFocus`

**PK-OC-13 modal side effects; no close on scroll** — fixture: `layout=inScroller`

1. `click(trigger)` → `document.overflow == "hidden"` (documentElement) with `scrollbar-gutter: stable` or `padding-right` equal to the scrollbar width; `document.ariaHiddenSiblingCount` > 0 and the hidden nodes are `inert` where supported; **two** visually hidden `button[aria-label="Dismiss"]` (`tabindex="-1"`), one before and one after the listbox; underlay `position:fixed; inset:0`
2. ★`dispatch(scroller, "scroll")` → **still open**
3. `scrollPage(40)` → still open
4. `click(dismissButton(1))` → closed; `document.overflow` restored; `ariaHiddenSiblingCount` 0

- facts: OC-052, OC-053, OC-054, OV-012, OV-013 (negative), OV-015, OV-019, AR-012, AR-013, scr-6, scr-prevent-1, scr-prevent-src-standard, scr-popover-modal, hide-src-inert, hide-src-popover, dis-rac-dismiss-btns, dis-dismiss-1

**PK-OC-14 focus leaving the overlay closes it** — fixture: default

1. `click(trigger)`; ★`focus(after)` → closed (blur with an outside `relatedTarget`)

- facts: OC-044, dis-src-blur

**PK-OC-15 inside a dialog** — fixture: `layout=inDialog`

1. `click(dialogTrigger)`; `click(trigger)` → picker open, portaled into the dialog container, positioned on the trigger (`dx == 0`, `dy == 6`)
2. `press(Escape)` → picker closed, dialog open
3. `press(Escape)` → dialog closed

- facts: port-src-nested-dialog, dis-6, OC-016

## B. Navigation in the list

**PK-NV-01 arrows with real focus, no wrap** — fixture: default

1. `press(Tab)`, `press(Enter)` → `Starter` `tabindex="0"`, focused; `Pro`/`Enterprise` `tabindex="-1"`; listbox `tabindex="-1"`; **no** `aria-activedescendant` anywhere
2. `press(ArrowDown)` → `Pro` focused (`tabindex="0"`), `Starter` `-1`; no `aria-selected` change; no `onChange`
3. `press(ArrowDown)` → `Enterprise`; `press(ArrowDown)` → stays
4. `press(ArrowUp)` ×2 → `Starter`; `press(ArrowUp)` → stays
5. ★`keyDown(ArrowDown)`, `settle(600)`, ★`keyUp(ArrowDown)` → moved ≥ 1
6. `press(Escape)`; `click(trigger)` (listbox focused, no focused key); `press(ArrowDown)` → `Starter`; `press(Escape)`; `click(trigger)`; `press(ArrowUp)` → `Enterprise`

- facts: NV-001–NV-006, NV-011, NV-025, NV-028, NV-037, NV-040, sel-arrow-src-none, sel-virtual (real-focus branch), FB-016

**PK-NV-02 Home / End / PageUp / PageDown** — fixture: `itemsPreset=many`

1. `press(Tab)`, `press(Enter)` → `Item 01`
2. `press(End)` → `Item 50`, `list.focusedOptionInView`; `press(Home)` → `Item 01`
3. `press(PageDown)` → same key on both stacks, `list.scrollTop` > 0; `press(PageUp)` → `Item 01`
4. `control(itemsPreset, three)`; reopen; `press(PageDown)` → `Enterprise` (not scrollable → last); `press(PageUp)` → `Starter`

- facts: NV-007, NV-008, NV-009, NV-010, sel-6, sel-home-end, sel-page, sel-home-replace

**PK-NV-03 disabled items and section headers are skipped** — fixture: `itemsPreset=many`, then `sections`

1. open; `type("Item 2")` (list typeahead) → `Item 20` focused; `press(ArrowDown)` ×4 → `Item 24`; `press(ArrowDown)` → **`Item 26`**
2. `click(option "Item 25")` → no change; still open; `mousedown` `defaultPrevented`; `aria-disabled="true"`, no `tabindex`
3. `control(itemsPreset, sections)`; open → 2 `role=group` with `aria-labelledby` headers and a divider; `press(ArrowDown)` from `Pro` → `Support` (header skipped)

- facts: NV-013, NV-014, NV-016, S2-020, sel-disabled-all, sel-disabled-item-md; NV-015 `unit-only`

**PK-NV-04 hover moves real focus only in pointer modality** — fixture: default

1. `click(trigger)` (listbox focused); `hover(option "Pro")` → `Pro` focused; not selected; no `list.scrollTop` change
2. `hoverOut` → `Pro` still focused
3. `control(disableEnterprise, on)`; `hover(option "Enterprise")` → focus unchanged
4. `press(Escape)`; `press(Enter)` (keyboard modality); `hover(option "Enterprise")` → focus **unchanged** (`isFocusVisible()`)

- facts: NV-020, NV-021, NV-022, NV-024, TM-007, sel-hover, sel-focus-ring, foc-src-pointer

**PK-NV-05 posinset / setsize and the loader row** — fixture: `itemsPreset=three`

1. open → options `aria-posinset` 1..3, `aria-setsize="3"`
2. `control(loadingState, loadingMore)` → a trailing loader `role=option` without `aria-posinset`/`aria-setsize`; items keep `aria-setsize="3"`; `data-comparison-load-more-count` ≥ 1
3. `control(loadingState, idle)`; `control(itemsPreset, many)` → posinset 1..50
4. `control(loadingState, loadingMore)`, `control(loadingState, idle)`, `control(loadingState, loadingMore)` (sentinel re-intersects) → `data-comparison-load-more-count` == 2 for the two intersections

- facts: NV-017, NV-018, NV-019, S2-013, S2-014, S2-015, S2-027, TI-006, sel-virtualized

**PK-NV-06 keyboard focus scrolls into view** — fixture: `itemsPreset=many`

1. open; `press(ArrowDown)` ×15 → `list.scrollTop` > 0; `focusedOptionInView`

- facts: NV-023, TI-002, sel-scroll

**PK-NV-07 ArrowLeft/Right in the open list; Mod+A** — fixture: default, then `selectionMode=multiple`

1. open; `press(ArrowLeft)` / `press(ArrowRight)` → focus unchanged, still open, value unchanged
2. `press(Control+A)` (single) → nothing
3. `control(selectionMode, multiple)`; open; `press(Control+A)` → all `aria-selected="true"`; `onChange(["starter","pro","enterprise"])`

- facts: NV-027, NV-031, RL-001, RL-009 (negative), sel-arrow-h, sel-mod-a

**PK-NV-08 Escape closes without clearing** — fixture: `selectedKey=pro`

1. open (`Pro` focused); `press(Escape)` → closed; `Pro` still selected; no `onChange`

- facts: NV-032, NV-033, sel-esc

**PK-NV-09 mouse down on the listbox scrollbar** — fixture: `itemsPreset=many`

1. open; `mouseDown` at the listbox's scrollbar x (right edge − 6 px) → `mousedown` `defaultPrevented`; `focus.active` unchanged

- facts: NV-034, EV-008, sel-mousedown-sb, evt-5 (mark `flaky-candidate`: scrollbar hit-testing)

## C. Typeahead

**PK-TA-01 closed-trigger typeahead selects without opening** — fixture: `itemsPreset=typeahead`; class: timing

1. `press(Tab)`; `type("Northern Terr")` → **closed**; trigger `Northern Territory`; each matching `keydown` `defaultPrevented`; `onChange` sequence identical on both stacks (first `N` → `New South Wales`, `No` → `Northern Territory`, then stable)
2. `clock(999)`; `type("Q")` → search is `Northern TerrQ` → no match → buffer reset, value unchanged, `keydown` **not** `defaultPrevented`
3. `clock(1000)`; `type("Q")` → `Queensland`
4. `type("Q")` within 1000 ms → `QQ` → no match → reset; value stays `Queensland` (no same-letter cycling)

- facts: TA-001–TA-007, TA-015, TA-017, TI-001, EV-001, type-src-timeout, type-src-miss

**PK-TA-02 Space inside and outside a search** — fixture: `itemsPreset=typeahead`

1. `press(Tab)`; `type("New")`; `press(Space)` → still closed (space appended to the search); `type("S")` → `New South Wales`
2. `clock(1000)`; `press(Space)` → **opens** (empty search → menu trigger)

- facts: TA-008, TA-009, EV-002, type-src-space

**PK-TA-03 modifiers and named keys are not typeahead** — fixture: `itemsPreset=typeahead`

1. `press(Tab)`; `press(Control+n)` → no selection; closed
2. `press(ArrowDown)` → opens (not typeahead)

- facts: TA-010, TA-011, type-src-filter

**PK-TA-04 multiple has no closed-trigger typeahead** — fixture: `selectionMode=multiple`, `itemsPreset=typeahead`

1. `press(Tab)`; `type("Q")` → nothing selected; closed

- facts: TA-012

**PK-TA-05 list typeahead focuses, Enter selects** — fixture: `itemsPreset=typeahead`

1. `press(Tab)`, `press(Enter)`; `type("q")` → `Queensland` **focused**, not selected; still open
2. `press(Enter)` → selected; closed
3. `control(itemsPreset, many)`; open; `type("Item 25")` → focus lands on `Item 26`? — expected: typeahead skips the disabled `Item 25`; the first non-disabled prefix match of `Item 25` does not exist, so the search resets after `Item 2` + `5` → focus stays on the last prefix match (`Item 20`); both stacks equal

- facts: TA-013, TA-014, TA-016, NV-038

## D. Selection & value

**PK-SV-01 press origin: down on the trigger, up on an option** — fixture: default

1. `mouseDown(trigger)` → open
2. `moveTo(option "Pro")` → `Pro` focused (hover)
3. `mouseUp(option "Pro")` → **selected**; closed; trigger `Pro`

- facts: SV-001, sel-press-up, sel-diff-origin, NV-040 (`shouldSelectOnPressUp`, `allowsDifferentPressOrigin`)

**PK-SV-02 Enter / Space select on key down** — fixture: default

1. open via Enter; `press(ArrowDown)`; ★`keyDown(Enter)` → already selected and closing before key up; ★`keyUp(Enter)`
2. reopen; ★`keyDown(Space)` → same

- facts: SV-003, SV-004, SV-005, OC-055, EV-011

**PK-SV-03 reselecting the same key closes silently** — fixture: `selectedKey=pro`

1. open; `click(option "Pro")` → closed; **no** `onChange`, **no** `onSelectionChange`; validation committed (no observable change)
2. open; `click(option "Pro")` again → same

- facts: SV-006, SV-007, SV-008, SV-031

**PK-SV-04 falsy key `0`** — fixture: `itemsPreset=numeric`

1. `press(Tab)`; `press(ArrowRight)` → trigger `0`; `onSelectionChange(0)` (number)
2. `control(selectedKey, none)`; `click(trigger)`; `click(option "0")` → trigger `0`, not the placeholder

- facts: SV-009, SV-014, sel-falsy

**PK-SV-05 placeholder and value rendering** — fixture: default

1. observe → `Select…`; value node `data-placeholder`
2. `control(placeholder, Pick a plan)` → `Pick a plan`
3. `control(selectedKey, pro)` → `Pro`; no `data-placeholder`
4. `control(withRenderValue, on)`; no selection → `[data-testid=custom-value]` absent; `control(selectedKey, pro)` → custom value text `Pro`

- facts: SV-015, SV-016 (RAC default `unit-only`), SV-017, SV-018, SV-026, SV-045, S2-024; SV-019, SV-020, SV-024 (RAC custom `SelectValue`) `unit-only`

**PK-SV-06 multiple selection** — fixture: `selectionMode=multiple`, `withForm=on`, `name=plan`

1. open → `aria-multiselectable="true"`; `click(option "Starter")` → `aria-selected="true"`; stays open; `onChange(["starter"])`; trigger `Starter`
2. `click(option "Pro")` → `onChange(["starter","pro"])`; trigger **`2 items selected`** (S2 count string); `form.getAll("plan") == ["starter","pro"]`
3. `click(option "Starter")` → deselected; `onChange(["pro"])`; trigger `Pro`
4. `click(option "Pro")` → `onChange([])`; placeholder back
5. `press(Escape)` → closed; **no** `onSelectionChange` was ever logged in multiple mode
6. `control(selectionSource, value)` with `["pro","enterprise"]` → options `false,true,true`; trigger `2 items selected`

- facts: SV-021, SV-022, SV-023, SV-025, SV-030, SV-032, SV-034, SV-035, AR-008, RL-008 (en list formatter is bypassed by S2's count string; RAC `Cat and Dog` is `unit-only`)

**PK-SV-07 external clear** — fixture: `selectedKey=pro`, `withClearButton=on`

1. `click(clearButton)` → placeholder; `onSelectionChange(null)`

- facts: SV-033

**PK-SV-08 link items** — fixture: `itemsPreset=link`

1. open; `click(link option)` → `location.hash == "#plan-docs"`; closed; trigger text unchanged; the link option shows **no** checkmark (S2 `isLink`)
2. open; focus the link; `press(Enter)` → same

- facts: SV-040, SV-043, sel-link, evt-3, S2-019 (link branch)

**PK-SV-09 checkmark and value slots (S2)** — fixture: `selectedKey=pro`, then `itemsPreset=icons`

1. open → the selected option contains the checkmark icon; unselected do not (`dom` + `pixel`)
2. `control(selectionMode, multiple)`; open → each option has a checkbox box; selected shows the checkmark inside it
3. `control(itemsPreset, icons)`; select an item → the trigger value renders the icon/avatar slot and the label; other children hidden (`display:none`)

- facts: S2-010, S2-011, S2-019, S2-028

`unit-only` / hydrate suite: SV-027, SV-028, SV-029 (prop aliasing), SV-036
(SSR), SV-037, SV-038 (RAC render/data-attrs), SV-039 (asserted in PK-OC-01),
SV-044 (tester throw), OC-056 (S2 browser test skipped upstream).

## E. Focus & blur

**PK-FB-01 tab order and focus data attributes** — fixture: `withClearButton=on`

1. `press(Tab)` ×4 from `before` → before → trigger → clear → after
2. `press(Shift+Tab)` ×3 → clear → trigger → before
3. on the trigger: wrapper `data-focused`, `data-focus-visible`; events `onFocus`, `onFocusChange(true)`; `press(Tab)` → `onBlur`, `onFocusChange(false)` in that order
4. `click(trigger)` (pointer) → wrapper `data-focused` **without** `data-focus-visible`

- facts: FB-001, FB-002, FB-004, FB-005, FB-013, EV-004

**PK-FB-02 trigger blur into the list does not blur the field** — fixture: default

1. `press(Tab)`, `press(Enter)` → focus on `Starter`; **no** `onBlur` / `onFocusChange(false)`; wrapper still `data-focused`
2. `press(Escape)` → trigger; still no blur event
3. `press(Tab)` → `onBlur` now

- facts: FB-006, FB-007

**PK-FB-03 open does not scroll the page; popover never keeps focus itself** — fixture: `layout=nearBottom`

1. `scrollPage(0)`; `click(trigger)` → `window.scrollY` unchanged (`focusWithoutScrolling`); `focus.active` is the listbox or an option, **never** the `role=dialog` node

- facts: FB-010, FB-011

`unit-only`: FB-012 (tab-in to a standalone listbox), FB-015 is in PK-FM-04.

## F. Forms

**PK-FM-01 hidden select markup** — fixture: `name=plan`, `withForm=on`

1. observe → a visually hidden container (`aria-hidden="true"`, `data-a11y-ignore="aria-hidden-focus"`, `data-react-aria-prevent-focus`, `position:fixed; top:0; left:0`) wrapping `<label>{label}<select tabindex="-1" name="plan">` with a first `<option value="" label="\u00A0">` and one `<option value=key>` per item; `form["plan"] == ""`
2. `control(selectedKey, pro)` → `form["plan"] == "pro"` immediately (no interaction)
3. `control(form, external-form)` → `select[form=external-form]`

- facts: FM-001, FM-002, FM-003, FM-004, FM-005, FM-007, FM-011, FM-012, FM-013, FM-035, SV-036 (value on first paint)

**PK-FM-02 native change on the hidden select (autofill path)** — fixture: `name=plan`

1. ★`selectOption(hiddenSelect, "enterprise")` → `onSelectionChange("enterprise")`; trigger `Enterprise`
2. `control(selectionMode, multiple)`; ★`selectOption(hiddenSelect, ["starter","pro"])` → `onChange(["starter","pro"])`

- facts: FM-008, FM-009, FM-010, EV-010

**PK-FM-03 more than 300 items → hidden inputs** — fixture: `itemsPreset=big`, `name=plan`, `isRequired=on`, `withForm=on`

1. observe → **no** hidden `<select>`; hidden `input[name=plan]` (one per value, at least one when empty); with native required the first is `type="text"` `display:none` `required`
2. ★`submit` → blocked; `.react-aria-FieldError`-equivalent error text `Constraints not satisfied`
3. open; `click(option 1)`; `press(Escape)`; ★`submit` → submit count 1; error gone
4. `control(name, "")` → no hidden field at all

- facts: FM-014, FM-015, FM-016, FM-021, FM-022

**PK-FM-04 native required** — fixture: `isRequired=on`, `validationBehavior=native`, `name=plan`, `withForm=on`

1. observe → hidden select `required`; trigger **no** `aria-describedby` error; wrapper `data-required`, **not** `data-invalid`
2. ★`submit` → count 0; `focus.active` = trigger; `aria-describedby` resolves to `Constraints not satisfied`; wrapper `data-invalid`; `invalid` event `defaultPrevented`
3. open; `click(option "Starter")` → error gone; `data-invalid` gone
4. ★`submit` → count 1
5. ★`reset` → placeholder; `form["plan"] == ""`; ★`submit` → count still 1

- facts: FM-017, FM-018, FM-019, FM-020, FM-025, FM-026, FM-031, FM-032, FB-015, EV-007

**PK-FM-05 `validationBehavior=aria`** — fixture: `validationBehavior=aria`, `isRequired=on`, `isInvalid=on`

1. observe → hidden select **not** `required`; wrapper `data-invalid`; trigger has **no** `aria-invalid`; S2 shows the invalid icon in the button and the 2 px invalid border (pixel)

- facts: FM-023, FM-024, FM-032, S2-008, S2-009

**PK-FM-06 description and error ids** — fixture: `description=…`, `errorMessage=…`, `isInvalid=on`

1. observe → trigger `aria-describedby` → description then error; help text rendered below the button

- facts: FM-028, AR-005, S2-007

**PK-FM-07 contextual help** — fixture: `withContextualHelp=on`

1. observe → 2 buttons; first is help; `click(helpButton)` → dialog with heading + content; picker closed

- facts: S2-006

`unit-only`: FM-027 (Dialog + errorMessage slot), FM-029 (`autoComplete`
passthrough), FM-030 (no `isReadOnly` prop), FM-033 (`setCustomValidity`
message), FM-034 (empty array as null — asserted through PK-FM-04 in multiple).

## G. ARIA

**PK-AR-01 labelling chain** — fixture: default

1. observe → trigger `aria-labelledby` = `${valueId} ${labelId}` (value first); value node text `Select…`; label node text `Plan` with **no** `for`
2. open → listbox `aria-labelledby` = label id only (no value id); overlay `role=dialog` `aria-labelledby` from the listbox labelling
3. `control(selectedKey, pro)` → value node text `Pro` (so the trigger's accessible name is `Pro Plan`)

- facts: AR-001–AR-004, AR-006, AR-017, dis-trigger-aria

**PK-AR-02 loading spinner in the button (S2)** — fixture: `loadingState=loading`

1. observe closed → spinner inside the trigger; trigger `aria-describedby` includes the spinner id; chevron in loading colour
2. `click(trigger)` → spinner **hidden** while open

- facts: AR-014, S2-012, S2-015, S2-023

`unit-only`: AR-009, AR-016 (`clearContexts`), AR-010, AR-011 (aria-label/slot
variants), AR-015 (`selectionMode=none`).

## H. Overlay geometry and motion

**PK-OV-01 placement, offset, width, quiet** — fixture: default

1. `click(trigger)`, `settle(300)` → `placement == "bottom"`; `dx == 0`; `dy == 6` (S2 M); `widthDelta == 0`; `insideViewport`; `zIndex` unset + `isolation: isolate`
2. `control(size, S|L|XL)` → `dy` 6 / 7 / 8
3. `control(menuWidth, 400)` → overlay width 400
4. `control(isQuiet, on)` → overlay `minWidth == 192`; width == trigger width − 24; `dx == -12` (cross offset); `menuWidth` ignored while quiet
5. `control(direction, top)`, `control(align, end)` → `placement == "top"`; end edges aligned
6. `control(size, L)` while open → `--trigger-width` updated; still open

- facts: OV-001 (RAC), OV-002, OV-003, OV-004, OV-005, OV-006, OV-010, OV-011, OV-017, OV-018, S2-001 (offsets), S2-002, S2-016, S2-017, S2-018, RL-010, pos-s2-picker, pos-s2-zindex, pos-rac-trigger-width, pos-rac-data-placement, pos-rac-select-cfg; OV-009 (RAC default offset 8) `unit-only`

**PK-OV-02 flip and resize** — fixture: `layout=nearBottom`

1. `click(trigger)`, `settle(300)` → `placement == "top"`
2. `control(shouldFlip, off)`; reopen → `placement == "bottom"`
3. `control(layout, default)`; open; `resize(1280, 300)` → recomputed; still open

- facts: OV-007, OV-008, pos-3, pos-src-window-resize, pos-src-resizeobserver

**PK-OV-03 RTL** — fixture: locale `ar-AE`

1. open → overlay `dir="rtl"`, `lang` set (S2 popover sets both); start edge is the right edge
2. `control(isQuiet, on)` → `dx == +12`
3. placeholder text is the ar-AE S2 `picker.placeholder` string (not `Select…`)

- facts: RL-003, RL-004, RL-005, RL-007, pos-src-rtl; RL-006 (RAC `selectPlaceholder`) `unit-only`

**PK-OV-04 enter / exit / reopen-during-exit** — fixture: default; class: motion (the #248 proof)

1. `click(trigger)` → observe immediately: mounted, positioned on the trigger (never at the viewport origin), phase `entering` on both stacks (`data-entering`, opacity < 1, translateY −4 px)
2. `settle(300)` → phase `settled`: opacity `1`, translate `0`, `pointerEvents` auto
3. `press(Escape)` → phase `exiting` (`data-exiting`, opacity → 0, `pointerEvents: none`), still mounted, `FocusScope contain` released
4. `settle(300)` → unmounted (`Popover` returns null)
5. `press(Enter)`; `press(Escape)`; within 50 ms `press(Enter)` → `settled` immediately: `data-exiting` gone, **no** `data-entering`, opacity `1`
6. `control(direction, top)`; open → entering translate **+4 px**
7. fuzz 20× open/close with `Enter`/`Escape`/`click trigger`/`clickOutside` → never a settled overlay with opacity < 1; never mounted at the viewport origin

- facts: OV-014, OV-020, OC-039, TI-004, anim-src-enter, anim-src-exit, anim-src-reopen, anim-s2-keyframes, time-3, time-6, time-7, time-8, pos-src-initial-fixed, pos-src-reset-maxh, port-src-focus

**PK-OV-05 max height and scroll anchor** — fixture: `itemsPreset=many`, `layout=nearBottom`, `shouldFlip=off`

1. open, `settle(300)` → `maxHeight` clamps to the space below minus 12 px; list scrollable
2. `press(ArrowDown)` ×20; `resize(1280, 900)` → focused option still in view

- facts: pos-src-scroll-anchor, geometry contract

**PK-OV-06 no tray on narrow viewports (S2)** — fixture: default

1. `resize(375, 667)`; `click(trigger)` → still a popover with `role=dialog`; no tray

- facts: TM-005, pos-s2-mobile-tray

`unit-only` / not emulatable: OV-016 (RAC `isNonModal` Select), pos-1/2/4–8,
`pos-c-*` matrix, pos-src-vv-resize, pos-src-scale-freeze, port-1/2,
port-src-default/null-clear/sub, anim-1, anim-rac-hidden, TM-004 (S2 local
press scale — pixel-only at best).

## I. Fuzz alphabet (#247)

`click trigger`, `mouseDown trigger`, `mouseUp option(n)`, `click option(n)`,
`hover option(n)`, `clickOutside`, `press Enter/Space/ArrowDown/ArrowUp/
Alt+ArrowDown/Alt+ArrowUp/ArrowLeft/ArrowRight/Home/End/PageDown/PageUp/Escape/
Tab/Shift+Tab/Control+A`, `type` one of `S`, `P`, `E`, `N`, ` `, `clock 1000`,
`scrollPage 40`, `wheel listbox`, `resize 1280×300 / 1280×900 / 375×667`,
`settle 300`, `tap trigger`, `tap option(n)`. Invariants: a mounted overlay is
never at the viewport origin; after `settle(300)` an open overlay has opacity
`1`; while open, `focus.active` is inside the overlay; while closed and
focused, `focus.active` is the trigger; `aria-expanded` agrees with listbox
presence; `form["plan"]` equals the selected key(s) at every step.

---

## Coverage ledger

| rows                                                           | journey                                                                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| OC-001, OC-002, OC-003, OC-027, OC-028, OC-033, OC-051         | PK-OC-01                                                                                                        |
| OC-004–OC-011, OC-015, OC-016, OC-043                          | PK-OC-02                                                                                                        |
| OC-012                                                         | `unit-only` (virtual pointer)                                                                                   |
| OC-013, OC-014                                                 | PK-OC-03                                                                                                        |
| OC-017                                                         | PK-OC-04                                                                                                        |
| OC-018, OC-019                                                 | PK-OC-05                                                                                                        |
| OC-020, OC-038                                                 | `unit-only` (RAC `allowsEmptyCollection`)                                                                       |
| OC-021–OC-024                                                  | PK-OC-06 (if S2 exposes `isOpen`, else `unit-only`)                                                             |
| OC-025, OC-034, OC-047                                         | PK-OC-07                                                                                                        |
| OC-026                                                         | `unit-only` (RAC render props)                                                                                  |
| OC-029–OC-032                                                  | PK-OC-08                                                                                                        |
| OC-035–OC-037                                                  | PK-OC-09                                                                                                        |
| OC-039                                                         | PK-OV-04                                                                                                        |
| OC-040                                                         | PK-TA-01 (matching key does not open)                                                                           |
| OC-041                                                         | `unit-only` (slot)                                                                                              |
| OC-042                                                         | PK-OC-01, PK-OC-02, PK-OC-03 (tester protocols)                                                                 |
| OC-044                                                         | PK-OC-14                                                                                                        |
| OC-045                                                         | PK-OC-12                                                                                                        |
| OC-046                                                         | PK-OC-10                                                                                                        |
| OC-048                                                         | PK-OC-11                                                                                                        |
| OC-049, OC-050                                                 | not used by Select (longPress / contextMenu)                                                                    |
| OC-052, OC-053, OC-054                                         | PK-OC-13                                                                                                        |
| OC-055                                                         | PK-SV-02                                                                                                        |
| OC-056                                                         | `unit-only` (upstream skipped)                                                                                  |
| NV-001–NV-006, NV-011, NV-025, NV-028, NV-037, NV-040          | PK-NV-01                                                                                                        |
| NV-007–NV-010                                                  | PK-NV-02                                                                                                        |
| NV-012                                                         | `unit-only` (hypothetical wrap)                                                                                 |
| NV-013, NV-014, NV-016                                         | PK-NV-03                                                                                                        |
| NV-015                                                         | `unit-only`                                                                                                     |
| NV-017, NV-018, NV-019                                         | PK-NV-05                                                                                                        |
| NV-020–NV-022, NV-024                                          | PK-NV-04                                                                                                        |
| NV-023                                                         | PK-NV-06                                                                                                        |
| NV-026                                                         | PK-OC-08                                                                                                        |
| NV-027, NV-031                                                 | PK-NV-07                                                                                                        |
| NV-029, NV-030                                                 | PK-OC-12                                                                                                        |
| NV-032, NV-033                                                 | PK-NV-08                                                                                                        |
| NV-034                                                         | PK-NV-09                                                                                                        |
| NV-035, NV-036, NV-039                                         | PK-OC-01, PK-OC-02                                                                                              |
| NV-038                                                         | PK-TA-05                                                                                                        |
| TA-001–TA-007, TA-015, TA-017                                  | PK-TA-01                                                                                                        |
| TA-008, TA-009                                                 | PK-TA-02                                                                                                        |
| TA-010, TA-011                                                 | PK-TA-03                                                                                                        |
| TA-012                                                         | PK-TA-04                                                                                                        |
| TA-013, TA-014, TA-016                                         | PK-TA-05                                                                                                        |
| SV-001                                                         | PK-OC-01, PK-SV-01                                                                                              |
| SV-002                                                         | PK-OC-03                                                                                                        |
| SV-003, SV-004, SV-005                                         | PK-SV-02                                                                                                        |
| SV-006, SV-007, SV-008, SV-031                                 | PK-SV-03                                                                                                        |
| SV-009, SV-014                                                 | PK-SV-04                                                                                                        |
| SV-010–SV-013                                                  | PK-OC-09                                                                                                        |
| SV-015–SV-018, SV-026, SV-045                                  | PK-SV-05                                                                                                        |
| SV-019, SV-020, SV-024                                         | `unit-only`                                                                                                     |
| SV-021, SV-022, SV-023, SV-025, SV-030, SV-032, SV-034, SV-035 | PK-SV-06                                                                                                        |
| SV-027, SV-028, SV-029                                         | `unit-only`                                                                                                     |
| SV-033                                                         | PK-SV-07                                                                                                        |
| SV-036                                                         | PK-FM-01 + hydrate suite                                                                                        |
| SV-037, SV-038                                                 | `unit-only`                                                                                                     |
| SV-039                                                         | PK-OC-01                                                                                                        |
| SV-040, SV-043                                                 | PK-SV-08                                                                                                        |
| SV-041, SV-042                                                 | PK-OC-01                                                                                                        |
| SV-044                                                         | `unit-only` (tester)                                                                                            |
| FB-001, FB-002, FB-004, FB-005, FB-013                         | PK-FB-01                                                                                                        |
| FB-003                                                         | PK-OC-11                                                                                                        |
| FB-006, FB-007                                                 | PK-FB-02                                                                                                        |
| FB-008, FB-009                                                 | PK-OC-01, PK-OC-02                                                                                              |
| FB-010, FB-011                                                 | PK-FB-03                                                                                                        |
| FB-012                                                         | `unit-only`                                                                                                     |
| FB-014                                                         | PK-OC-10                                                                                                        |
| FB-015                                                         | PK-FM-04                                                                                                        |
| FB-016                                                         | PK-NV-01                                                                                                        |
| FM-001–FM-005, FM-007, FM-011, FM-012, FM-013, FM-035          | PK-FM-01                                                                                                        |
| FM-006                                                         | PK-OC-07                                                                                                        |
| FM-008, FM-009, FM-010                                         | PK-FM-02                                                                                                        |
| FM-014, FM-015, FM-016, FM-021, FM-022                         | PK-FM-03                                                                                                        |
| FM-017–FM-020, FM-025, FM-026, FM-031, FM-032                  | PK-FM-04                                                                                                        |
| FM-023, FM-024                                                 | PK-FM-05                                                                                                        |
| FM-027, FM-029, FM-030, FM-033, FM-034                         | `unit-only`                                                                                                     |
| FM-028                                                         | PK-FM-06                                                                                                        |
| AR-001–AR-004, AR-006, AR-017                                  | PK-AR-01                                                                                                        |
| AR-005                                                         | PK-FM-06                                                                                                        |
| AR-007                                                         | PK-OC-01                                                                                                        |
| AR-008                                                         | PK-OC-08, PK-SV-06                                                                                              |
| AR-009, AR-010, AR-011, AR-015, AR-016                         | `unit-only`                                                                                                     |
| AR-012, AR-013                                                 | PK-OC-13                                                                                                        |
| AR-014                                                         | PK-AR-02                                                                                                        |
| OV-001–OV-006, OV-010, OV-011, OV-017, OV-018                  | PK-OV-01                                                                                                        |
| OV-007, OV-008                                                 | PK-OV-02                                                                                                        |
| OV-009                                                         | `unit-only`                                                                                                     |
| OV-012, OV-013, OV-015, OV-019                                 | PK-OC-13                                                                                                        |
| OV-014, OV-020                                                 | PK-OV-04                                                                                                        |
| OV-016                                                         | `unit-only`                                                                                                     |
| TM-001, TM-002, TM-003, TM-006, TM-008                         | PK-OC-03                                                                                                        |
| TM-004                                                         | pixel-only (S2 press scale)                                                                                     |
| TM-005                                                         | PK-OV-06                                                                                                        |
| TM-007                                                         | PK-NV-04                                                                                                        |
| RL-001, RL-009                                                 | PK-NV-07                                                                                                        |
| RL-002                                                         | PK-OC-09                                                                                                        |
| RL-003, RL-004, RL-005, RL-007                                 | PK-OV-03                                                                                                        |
| RL-006                                                         | `unit-only`                                                                                                     |
| RL-008                                                         | PK-SV-06 (S2 count string branch)                                                                               |
| RL-010                                                         | PK-OV-01                                                                                                        |
| EV-001, EV-002                                                 | PK-TA-01, PK-TA-02                                                                                              |
| EV-003                                                         | PK-OC-02                                                                                                        |
| EV-004                                                         | PK-FB-01                                                                                                        |
| EV-005, EV-006                                                 | PK-OC-01                                                                                                        |
| EV-007                                                         | PK-FM-04                                                                                                        |
| EV-008                                                         | PK-NV-09                                                                                                        |
| EV-009                                                         | `unit-only` (stopPropagation not observable from a capture listener)                                            |
| EV-010                                                         | PK-FM-02                                                                                                        |
| EV-011                                                         | PK-SV-02                                                                                                        |
| EV-012, S2-026                                                 | PK-SV-05 with `withRenderValue` interactive child → `console` warning captured (add `console` to the event log) |
| EV-013                                                         | PK-OC-09                                                                                                        |
| TI-001                                                         | PK-TA-01                                                                                                        |
| TI-002                                                         | PK-NV-06                                                                                                        |
| TI-003                                                         | protocol note (fake timers → `clock`)                                                                           |
| TI-004                                                         | PK-OV-04                                                                                                        |
| TI-005, TI-007                                                 | `unit-only`                                                                                                     |
| TI-006                                                         | PK-NV-05                                                                                                        |
| S2-001, S2-002, S2-016, S2-017, S2-018                         | PK-OV-01                                                                                                        |
| S2-003, S2-004, S2-005, S2-021                                 | pixel (visual-state matrix, D5/D6)                                                                              |
| S2-006                                                         | PK-FM-07                                                                                                        |
| S2-007                                                         | PK-FM-06                                                                                                        |
| S2-008, S2-009                                                 | PK-FM-05                                                                                                        |
| S2-010, S2-011, S2-019, S2-028                                 | PK-SV-09                                                                                                        |
| S2-012, S2-015, S2-023                                         | PK-AR-02                                                                                                        |
| S2-013, S2-014, S2-027                                         | PK-NV-05                                                                                                        |
| S2-020                                                         | PK-NV-03                                                                                                        |
| S2-022                                                         | PK-OC-01                                                                                                        |
| S2-024                                                         | PK-SV-05                                                                                                        |
| S2-025                                                         | PK-OC-05                                                                                                        |

Shared-ledger rows proved here are listed in `shared-overlay.md`.

## Known Solid divergences already observed (feed #248)

From the #244 seed runs, Picker step 0 diverges on `field dom`: Solid overlay
root has no `aria-labelledby`; options use `aria-label` instead of
`aria-labelledby` and lack `aria-posinset` / `aria-setsize`; `aria-describedby`
resolves to a `p` (Solid) vs `span` (React); Solid renders an extra nameless
hidden `input`; `data-rac` / `data-selection-mode` missing. These are the
first fixes #248 has to land before any journey passes step 0.
