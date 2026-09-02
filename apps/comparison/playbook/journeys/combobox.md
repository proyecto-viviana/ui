# ComboBox — interaction journeys (D13)

Route `/components/combobox`. React panel: `@react-spectrum/s2` `ComboBox`.
Solid panel: `@proyecto-viviana/solid-spectrum` `ComboBox`. Pin: `react-spectrum`
`f56660b` (RAC 1.21.0 / S2 1.7.0). Ticket #245; driver #244; owner defect #248;
structural suspect #251.

Fact ids (`OC001`, `NAV013`, `pos-src-initial-fixed`, …) refer to the upstream
ledgers extracted for this initiative: the ComboBox ledger (345 rows, cited to
`react-aria-components/test/ComboBox.test.js`, `ComboBox.browser.test.tsx`,
`ComboBox.ssr.test.js`, `react-aria/test/combobox/useComboBox.test.js`,
`@react-spectrum/s2/test/Combobox.test.tsx`, `Combobox.browser.test.tsx`,
`@react-aria/test-utils/src/combobox.ts`, and the `useComboBox.ts` /
`useComboBoxState.ts` / `s2/ComboBox.tsx` sources) and the shared overlay +
selection ledger (347 rows). Every fact carries a `file:line`; the journey
author opens the line before writing the step.

S2 constraints that shape this file (`s2/ComboBox.tsx:113-117, 402-404`): S2
always passes `allowsEmptyCollection`; it omits `selectionMode` (no multiple)
and `defaultFilter` (always `contains`, `sensitivity: 'base'`). `shouldFocusWrap`,
`shouldCloseOnBlur`, `formValue`, `autoFocus`, `menuTrigger`, `allowsCustomValue`,
`isReadOnly`, `prefix`, `loadingState`, `onLoadMore`, `menuWidth`, `direction`,
`align`, `shouldFlip` pass through. The S2 mobile tray is a commented TODO
(`s2/Popover.tsx:215-218`) — never port S1 `MobileComboBox`.

Correction to the ledger, verified against `react-aria-components/src/Popover.tsx:353-357`:
row **OV020** ("no DismissButton before/after") is wrong. The leading
`DismissButton` is skipped when `isNonModal`; the **trailing** one is always
rendered. `dis-rac-dismiss-btns` is the correct row.

## Fixture matrix

Existing controls (`apps/comparison/src/data/combobox-demo.ts`): `label`,
`selectedKey` (starter | pro | enterprise), `selectionSource`
(selectedKey | defaultSelectedKey), `inputValue`, `inputSource`
(inputValue | defaultInputValue), `placeholder`, `size`, `labelPosition`,
`labelAlign`, `necessityIndicator`, `description`, `errorMessage`, `name`,
`form`, `formValue`, `validationBehavior`, `menuTrigger`, `direction`, `align`,
`menuWidth`, `isDisabled`, `isReadOnly`, `isRequired`, `isInvalid`,
`allowsCustomValue`, `shouldFlip`, `disableEnterprise`, `withContextualHelp`,
locale (en-US | ar-AE). Items: Starter/`starter`, Pro/`pro`,
Enterprise/`enterprise`.

Controls to **add** to both fixtures (React and Solid, same change):

| control             | values                                                                                                                                                                                                                                                       | why                                                                                                                                                                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectedKey`       | + `none`                                                                                                                                                                                                                                                     | most upstream journeys start unselected                                                                                                                                                                                                                                                                                    |
| `itemsSource`       | `defaultItems` (new default for filter journeys) \| `items`                                                                                                                                                                                                  | `items` (controlled) skips the local filter (`useComboBoxState.ts:297-303`, FIL006); the fixture today passes `items`, so typing filters nothing on either stack                                                                                                                                                           |
| `itemsPreset`       | `three` \| `sections` (Plans: Starter, Pro / Add-ons: Support, Enterprise + S2 Divider) \| `many` (50 items, `Item 01`…`Item 50`, `Item 25` disabled) \| `empty` \| `link` (item with `href="#plan-docs"`) \| `textValue` (label "Dog", `textValue="Puppy"`) | sections, virtualizer/scroll, empty state, links, textValue filter                                                                                                                                                                                                                                                         |
| `layout`            | `default` \| `nearBottom` (field pinned so space below < list height) \| `inScroller` (field inside a 140 px `overflow:auto` ancestor with a sibling scroller) \| `inDialog` (inside `DialogTrigger` → `Dialog isDismissible`)                               | flip, scroll-close, dialog stacking                                                                                                                                                                                                                                                                                        |
| `sentinels`         | on                                                                                                                                                                                                                                                           | `before` / `after` tabbable buttons around the field                                                                                                                                                                                                                                                                       |
| `withForm`          | on                                                                                                                                                                                                                                                           | wraps in `<form>` with Submit + Reset buttons; exposes `data-comparison-submit-count`, `data-comparison-form-data` (JSON of `FormData`)                                                                                                                                                                                    |
| `loadingState`      | idle \| loading \| filtering \| loadingMore \| error                                                                                                                                                                                                         | S2 spinner + sentinel; exposes `data-comparison-load-more-count`                                                                                                                                                                                                                                                           |
| `autoFocus`         | on                                                                                                                                                                                                                                                           | FB013                                                                                                                                                                                                                                                                                                                      |
| `shouldFocusWrap`   | on                                                                                                                                                                                                                                                           | NAV007                                                                                                                                                                                                                                                                                                                     |
| `shouldCloseOnBlur` | off                                                                                                                                                                                                                                                          | FB004                                                                                                                                                                                                                                                                                                                      |
| `prefix`            | text                                                                                                                                                                                                                                                         | ARIA010                                                                                                                                                                                                                                                                                                                    |
| `eventLog`          | on                                                                                                                                                                                                                                                           | `data-comparison-events`: ordered `onOpenChange(isOpen, trigger)`, `onSelectionChange(key)`, `onInputChange(text)`, `onFocus`, `onBlur`, `onFocusChange`, `onLoadMore`, `onAction`; fully-controlled mode must follow the documented contract (SEL047 / EVT011): selection → set both key and text; typing → set text only |

Fully controlled (`selectionSource=selectedKey` + `inputSource=inputValue`) and
uncontrolled (`defaultSelectedKey` + `defaultInputValue`) are two different
state machines upstream (`useComboBoxState.ts:448-461, 533-545`); journeys name
which one they run under. Default for this file: **uncontrolled, `selectedKey=none`,
`itemsSource=defaultItems`, `itemsPreset=three`, `sentinels=on`, `eventLog=on`**
unless the journey says otherwise.

Driver extensions used below (★, to add in #245): `focus(target)`,
`keyDown/keyUp(key)`, `touchDown/touchUp(target)`, `dispatch(target, type)`,
`control(name, value)`, `submit`, `reset`, `tapAt(target, dx, dy)` (touch at an
offset from the target centre), `ua(profile)` (journey setup only).

Settle rule: after any step that opens or closes the overlay, the driver's
observation runs after the step resolves (layout effects done). Steps that
read opacity or `data-entering` / `data-exiting` are `class: motion`; steps that
need exact opacity are preceded by `settle(300)` (S2 transition is 200 ms,
`s2/Popover.tsx:150`).

---

## A. Open / close

**CB-OC-01 click trigger, click option** — fixture: default

1. observe → `dom`: `input` role `combobox`, `aria-autocomplete="list"`, `aria-expanded="false"`, no `aria-controls`, no `aria-activedescendant`; trigger `aria-haspopup="listbox"`, `aria-expanded="false"`, tabindex −1 (excluded from tab order); no listbox; field has no `data-open`; input `autocomplete="off"`, `autocorrect="off"`, `spellcheck="false"`
2. `click(trigger)` → listbox present with 3 `role=option`, `aria-selected="false"` each; input `aria-expanded="true"`, `aria-controls` = listbox id; trigger `aria-expanded="true"`, `aria-controls` = listbox id; field `data-open`; `focus.active` = input; `focus.activeDescendant` = null (mouse open does not highlight); overlay `data-trigger="ComboBox"`, `data-placement="bottom"`; trigger has **no** `data-pressed` (S2 forces `isPressed={false}`, `s2/ComboBox.tsx:731-735`); events: `onOpenChange(true, "manual")`
3. `settle(300)` → overlay opacity `1`, transform none
4. `click(option "Starter")` → listbox gone; input value `Starter`; `focus.active` = input; events: `onSelectionChange("starter")`, `onOpenChange(false)` (no second arg); field no `data-open`

- facts: OC001, OC002 (S2 variant ARIA032 vs RAC ARIA031), OC046, OC047, OC048, SEL002, ARIA001, ARIA002, ARIA003, ARIA004, ARIA006, ARIA012, ARIA013, ARIA024, FB010, FB011, FB019, EVT013, dis-trigger-aria

**CB-OC-02 input click keeps open; trigger toggles** — fixture: default

1. `click(trigger)` → open; events `onOpenChange` ×1
2. `click(input)` → still open; `focus.active` = input; `onOpenChange` still ×1
3. `click(trigger)` → closed; `focus.active` = input (never left); `onOpenChange(false)` (×2 total)
4. `click(trigger)` → open again; `onOpenChange(true, "manual")` (×3)

- facts: OC004, OC005, FB024, OC043, FB005

**CB-OC-03 typing opens (`menuTrigger=input`) and filters** — fixture: default

1. `press(Tab)` from `before` → input focused; listbox absent; events `onFocus` then `onFocusChange(true)`; field `data-focused`, `data-focus-visible`
2. `type("S")` → open; `onOpenChange(true, "input")`; 1 option `Starter`; `focus.activeDescendant` = null (typing clears virtual focus)
3. `type("x")` → input `Sx`; **still open** (S2 `allowsEmptyCollection`); 1 option with text `No results`
4. `press(Backspace)` → `S`; option `Starter` back
5. `press(Escape)` → closed; input reverts to `` (no selection, custom value off); `onOpenChange(false)`

- facts: OC011, OC025, OC027, OC049, FIL001, FIL005, FIL007, FIL011, FIL018 (idle branch), FIL025, OC020, FB009, FB014, EVT018, SEL012

**CB-OC-04 `menuTrigger=focus`** — fixture: `menuTrigger=focus`

1. `press(Tab)` → open on focus; `onOpenChange(true, "focus")`; all 3 options (no filter applied yet, input empty)
2. `press(Tab)` → closed; focus on `after`; commit happened (input ``); `onOpenChange(false)`
3. `click(input)` → open again (`focus` trigger via pointer)
4. `clickOutside` → closed; `onBlur` then `onFocusChange(false)` order in events

- facts: OC012, OC015, OC017, OC019 (touch variant in CB-TCH-01), FB002, FB003, EVT017

**CB-OC-05 `menuTrigger=manual`** — fixture: `menuTrigger=manual`

1. `press(Tab)` → closed
2. `type("S")` → input `S`; **closed**; `onOpenChange` not called
3. `press(ArrowDown)` → open; `onOpenChange(true, "manual")`; `focus.activeDescendant` = first option (`Starter`, the only match … the list shows **all** items: manual open sets `showAllItems`, FIL008) — expected: 3 options, activedescendant = `Starter`
4. `press(Escape)` → closed
5. `click(trigger)` → open, activedescendant null

- facts: OC013, OC014, OC016, OC022, FIL008 (step 3), OC028

**CB-OC-06 `isReadOnly`** — fixture: `isReadOnly=on`, `selectedKey=pro`, then `menuTrigger=focus` variant

1. observe → input `readonly`; trigger `disabled`; field `data-readonly`
2. `click(trigger)` → closed
3. `click(input)` then `type("One")` → value still `Pro`; closed
4. `press(ArrowDown)` → closed
5. `control(menuTrigger, focus)`, `press(Tab)` ×2 (out and back in) → closed

- facts: OC006, OC010, OC033, OC045, FB012, FB015, ARIA035, EVT009

**CB-OC-07 `isDisabled`** — fixture: `isDisabled=on`

1. observe → input `disabled`; trigger `disabled`; field `data-disabled`
2. `click(trigger)`, `click(input)`, `type("x")` → closed; value unchanged; no events

- facts: OC009, FB012, FB016, ARIA035, EVT019

**CB-OC-08 ArrowDown / ArrowUp / Alt+Arrow on the input** — fixture: default

1. `press(Tab)`, `press(ArrowDown)` → open; `onOpenChange(true, "manual")`; activedescendant = `Starter`; DOM focus stays on input; options have no `tabindex`
2. `press(Escape)` → closed
3. `press(ArrowUp)` → open; activedescendant = `Enterprise` (last)
4. `press(Escape)`; `press(Alt+ArrowDown)` → open; activedescendant = `Starter` (input handler ignores Alt — `useComboBox.ts:247-256`; the Alt+Arrow branch of `useMenuTrigger` is on the trigger button, which is not tabbable)

- facts: OC007, OC028, OC030, NAV001, NAV002, NAV003, NAV004, NAV033, ARIA005, sel-arrow-src-none, sel-virtual; OC029 is `unit-only` (button-side Alt+Arrow)

**CB-OC-09 mouse press-start vs touch press-up** — fixture: default

1. `mouseDown(trigger)` → **already open** (`onPressStart`, mouse); `focus.active` = input
2. `mouseUp(trigger)` → still open
3. `press(Escape)`
4. ★`touchDown(trigger)` → **closed** (touch opens on press, not press start)
5. ★`touchUp(trigger)` → open; `focus.active` = input

- facts: OC008, TCH001, TCH002, OC018, sel-diff-origin

**CB-OC-10 ancestor scroll closes and commits** — fixture: `selectedKey=pro` uncontrolled

1. `click(trigger)`, `type("St")` → open, input `St`
2. `scrollPage(40)` → **closed**; input reverts to `Pro` (`state.close` is `commitValue`, no custom value); `onOpenChange(false)`
3. `click(trigger)`; ★`dispatch(input, "scroll")` → still open (input/textarea scroll ignored)
4. `control(layout, inScroller)`; `click(trigger)`; ★`dispatch(scroller, "scroll")` → closed
5. `click(trigger)`; ★`dispatch(siblingScroller, "scroll")` → still open
6. `control(itemsPreset, many)`; `click(trigger)`; `wheel(0, 120, listbox)` → still open; `list.scrollTop` > 0

- facts: OC035, OC036, OC037, OC041, OV012, OV013, OV017, scr-1, scr-2, scr-3, scr-src-nonmodal, scr-src-inside-overlay, scr-src-input, scr-src-gate, pos-src-close-while-resize (negative: no resize in flight); OC038 (shadow DOM) is `unit-only`

**CB-OC-11 outside click is a blur-commit, not an interact-outside** — fixture: `selectedKey=pro`

1. `click(trigger)`, `type("St")` → open
2. `mouseDown(outside)` → still open (ComboBox popover `isDismissable=false`; no `onInteractOutsideStart`)
3. `mouseUp(outside)` → closed via input blur → `commitValue`; input `Pro`; events show `onBlur` before `onFocusChange(false)`; **no** `pointerdown` with `defaultPrevented` in `events`
4. `click(trigger)`; `click(outside, button: right)` → same as left (blur decides, not `useInteractOutside`)

- facts: OC042, FB003, FB007 (no button variant `unit-only`), dis-5, dis-io-6, dis-io-src-trigger, dis-src-right-click, OV019, EVT017

**CB-OC-12 dialog stacking** — fixture: `layout=inDialog`

1. `click(dialogTrigger)` → dialog open
2. `click(trigger)` → combobox open inside dialog; overlay portaled into the dialog's container (`port-src-nested-dialog`); positioned relative to the trigger (`overlay.dx == 0`, `dy == triggerHeight + 6`)
3. `click(dialogBackdrop)` → combobox **closed**, dialog **open**
4. `click(dialogBackdrop)` → dialog closed

- facts: OC039, OV018, port-src-nested-dialog, dis-6, dis-src-interact-start

**CB-OC-13 empty collection still opens (S2)** — fixture: `itemsPreset=empty`

1. `click(trigger)` → open; 1 option `No results`; listbox `data-empty`
2. `control(loadingState, loading)` → option text `Loading…`

- facts: OC027, OC049, FIL018; OC021 / OC023 / OC024 (RAC `allowsEmptyCollection=false`) are `unit-only`

**CB-OC-14 button open shows all items despite the filter** — fixture: `inputSource=defaultInputValue`, `inputValue=P`

1. `click(trigger)` → 3 options (unfiltered snapshot)
2. `type("r")` → input `Pr`; 1 option `Pro`; activedescendant null
3. `control(itemsSource, items)`, reopen → `click(trigger)` shows the controlled list unchanged; `type` does not filter on either stack

- facts: OC022, FIL006, FIL008, FIL009, FIL026

**CB-OC-15 last collection frozen while exiting** — fixture: default; class: motion

1. `click(trigger)`, `type("St")` → 1 option
2. `press(Escape)` → observe immediately: overlay `data-exiting`, still 1 option (not 3, not 0)
3. `settle(300)` → unmounted

- facts: FIL010, anim-src-exit, OV009

**CB-OC-16 `shouldCloseOnBlur=false`** — fixture: `shouldCloseOnBlur=off`

1. `click(trigger)`; `press(Tab)` → focus on `after`; menu **may stay open** until the overlay's own blur logic runs — expected: listbox still present after Tab (`setFocused(false)` does not commit); `clickOutside` then closes it

- facts: FB004, OC012 (branch)

## B. Navigation

**CB-NAV-01 arrows, bounds, no wrap** — fixture: default

1. `press(Tab)`, `press(ArrowDown)` → activedescendant `Starter`
2. `press(ArrowDown)` → `Pro`; `aria-selected` unchanged (`false` everywhere)
3. `press(ArrowDown)` → `Enterprise`
4. `press(ArrowDown)` → `Enterprise` (no wrap)
5. `press(ArrowUp)` ×3 → `Starter`, then stays `Starter`
6. ★`keyDown(ArrowDown)`, `settle(600)`, ★`keyUp(ArrowDown)` → activedescendant advanced by repeat (≥ `Pro`)
7. `control(shouldFocusWrap, on)`; at `Enterprise` `press(ArrowDown)` → `Starter`; at `Starter` `press(ArrowUp)` → `Enterprise`

- facts: NAV005, NAV006, NAV007, NAV015, NAV041, sel-5

**CB-NAV-02 disabled option skipped and marked** — fixture: `itemsPreset=many`

1. `press(Tab)`, `press(ArrowDown)`; `press(End)` … use `type("Item 2")` → options `Item 20`…`Item 29`; `Item 25` has `aria-disabled="true"`, `aria-selected="false"`
2. `press(ArrowDown)` ×5 from `Item 20` → activedescendant `Item 24`
3. `press(ArrowDown)` → `Item 26` (25 skipped)
4. `click(option "Item 25")` → no selection change; still open; input unchanged; `mousedown` on the option is `defaultPrevented`

- facts: NAV008, NAV045, ARIA033, sel-disabled-all, sel-disabled-item-md

**CB-NAV-03 Home / End / PageUp / PageDown** — fixture: `itemsPreset=many`

1. `click(trigger)` → open, activedescendant null
2. `press(PageDown)` → no navigation (requires a focused key)
3. `press(Shift+Home)` → no navigation
4. `press(ArrowDown)` → `Item 01`; `press(End)` → `Item 50`; `list.focusedOptionInView` true; `press(Home)` → `Item 01`
5. `press(PageDown)` → activedescendant moved by roughly one list viewport (same key on both stacks); `press(PageUp)` → back to `Item 01`
6. `press(Escape)`; ★`focus(input)`; `type("abc")`; `press(Home)` → `input.selectionStart == 0` (caret, not list)

- facts: NAV009, NAV010, NAV011, NAV012, NAV032, sel-home-end, sel-page, sel-6

**CB-NAV-04 ArrowLeft / ArrowRight clear the active descendant** — fixture: default, then locale `ar-AE`

1. `press(Tab)`, `type("P")`, `press(ArrowDown)` → activedescendant `Pro`
2. `press(ArrowLeft)` → activedescendant **absent**; `input.selectionStart` moved to 0; `keydown` **not** `defaultPrevented`; `focus.focusVisible` true on the input (virtual focus dispatched back)
3. `press(ArrowDown)` → `Pro` again
4. `press(ArrowRight)` → absent again
5. `control(locale, ar-AE)` and repeat 1–4 → identical (vertical list has no left/right delegate; no RTL swap)

- facts: NAV013, NAV014, NAV034, EVT010, TIM007, RTL003, RTL004, sel-arrow-h

**CB-NAV-05 hover, press-up, focus never leaves the input** — fixture: default

1. `click(trigger)` → activedescendant null
2. `hover(option "Pro")` → activedescendant `Pro`; `focus.active` = input; option `data-focused` (not `data-focus-visible`)
3. `hoverOut` → activedescendant stays `Pro`
4. `mouseDown(option "Enterprise")` → activedescendant `Enterprise`; **no** selection yet; `mousedown` `defaultPrevented`; `focus.active` = input
5. `mouseUp(option "Enterprise")` → selected; closed; input `Enterprise`
6. `press(ArrowDown)` (keyboard modality) → open, activedescendant `Enterprise` (selected key wins over `first`? — for ComboBox `listBoxProps.autoFocus` is the focus strategy `'first'` and the collection autofocus prefers a selected key, `useSelectableCollection.ts:607-623`) — expected: `Enterprise`
7. `hover(option "Starter")` → activedescendant **unchanged** (`isFocusVisible()` true blocks hover focus)

- facts: NAV020, NAV021, NAV022, NAV023, EVT006, sel-hover, sel-press-up, sel-diff-origin, sel-virt-press, sel-3, foc-press-prevent, foc-src-pointer

**CB-NAV-06 letters filter, never typeahead** — fixture: default

1. `click(trigger)`, `type("E")` → 1 option `Enterprise`; activedescendant null (not jumped to Enterprise)

- facts: NAV016, NAV017

**CB-NAV-07 sections** — fixture: `itemsPreset=sections`

1. `click(trigger)` → 2 `role=group`, each `aria-labelledby` → its header text; a divider between (not an option); 4 options
2. `click(section(1) header)` → still open; nothing selected
3. `type("Sup")` → 1 group (`Add-ons`), 1 option `Support`; the empty section and its divider are gone
4. `press(ArrowDown)` → activedescendant `Support`

- facts: NAV024, NAV025, NAV026, NAV042, NAV043, ARIA012

**CB-NAV-08 many items: virtualizer, scroll into view, posinset** — fixture: `itemsPreset=many`

1. `click(trigger)` → `list.optionCount` < 50 (virtualized) and equal on both stacks; each option `aria-posinset` / `aria-setsize="50"`
2. `press(ArrowDown)` ×12 → `list.scrollTop` > 0; `focusedOptionInView` true (rAF scroll)
3. `hover(option n)` on a visible option → **no** scroll change (pointer modality does not scroll into view)

- facts: NAV018, NAV019, NAV029, NAV031, NAV032, ARIA015, TIM005, sel-scroll, sel-virtualized, sel-6

**CB-NAV-09 link items** — fixture: `itemsPreset=link`

1. `press(Tab)`, `press(ArrowDown)` to the link option, `press(Enter)` → closed; `location.hash == "#plan-docs"`; input **not** set to the link text; no `onSelectionChange`
2. reopen; navigate to the link; `press(Tab)` → closed; focus on `after`; hash unchanged
3. reopen; `click(link option)` → `click` on the anchor `defaultPrevented` on both stacks unless the router opens; closed

- facts: NAV036, NAV037, SEL004, sel-link, evt-3; NAV035 / NAV038 / SEL038 / SEL039 / EVT020 (`onAction` items, `UNSTABLE_itemBehavior`) are `unit-only` (S2 ComboBox does not expose them)

**CB-NAV-10 load more (S2)** — fixture: `loadingState=loadingMore`, `itemsPreset=three`

1. `click(trigger)` → 3 options + 1 loader row (`role=option`, contains a progressbar `aria-label="Loading more…"`, `tabindex=-1`, no `aria-posinset`); `aria-setsize="3"` on the items; `data-comparison-load-more-count` ≥ 1 (sentinel is visible at open in a short list)
2. `press(ArrowDown)` ×3 → activedescendant never lands on the loader
3. `control(loadingState, idle)` → loader progressbar gone; sentinel row still mounted

- facts: FIL016, FIL017, TIM013, ARIA034, NAV030 (count is `ua:apple`, see CB-AX-02)

## C. Filtering

**CB-FIL-01 contains, base sensitivity** — fixture: default

1. `press(Tab)`, `type("ro")` → 1 option `Pro`
2. select-all + `type("PRO")` → `Pro`
3. select-all + `type(" ")` → `No results` (space matches nothing), still open

- facts: FIL001, FIL002, FIL003 (`startsWith` `unit-only`, S2 has no `defaultFilter`), FIL004, FIL029

**CB-FIL-02 empty query shows all; clearing text clears the selection** — fixture: `menuTrigger=focus`, `selectedKey=pro` uncontrolled

1. `press(Tab)` → open; all 3; `Pro` `aria-selected="true"`
2. `press(Control+A)`, `press(Backspace)` → input ``; still open; 3 options; **no** `aria-selected="true"`; events `onSelectionChange(null)`
3. `control(selectionSource, selectedKey)`, `control(inputSource, inputValue)` (fully controlled), repeat 1–2 → `onInputChange("")` only; `Pro` stays selected (app must clear)

- facts: FIL012, SEL031, SEL032, SEL047

**CB-FIL-03 filter by `textValue`** — fixture: `itemsPreset=textValue`

1. `type("Pup")` → option labelled `Dog` present
2. select-all, `type("Dog")` → `No results`

- facts: FIL030

**CB-FIL-04 S2 loading spinner timing** — fixture: default; class: timing

1. `click(trigger)`; `control(loadingState, filtering)`; `clock(499)` → no field spinner
2. `clock(1)` → field spinner present, `aria-label="Loading…"`, its id in the input's `aria-describedby`
3. `control(loadingState, idle)` → spinner gone immediately
4. `control(loadingState, filtering)`; `clock(300)`; `type("x")`; `clock(300)` → still no spinner (timer reset on input); `clock(200)` → spinner
5. `press(Escape)` (closed); `control(loadingState, filtering)`; `clock(500)` → **no** spinner (filtering only shows while open for `menuTrigger=input`)
6. `control(loadingState, loading)`; `clock(500)` → spinner while closed
7. `control(menuTrigger, manual)`; `control(loadingState, filtering)`; `clock(500)` → spinner while closed (manual shows it)

- facts: FIL019, FIL020, FIL021, FIL022, TIM001, TIM002, TIM003, TIM016 (unmount cleanup `unit-only`)

**CB-FIL-05 selected text follows async items when not focused** — fixture: `selectedKey=pro`, `itemsSource=items`, class: default

1. `control(itemsPreset, relabel)` (add: same keys, Pro → `Pro (annual)`) while the input is **not** focused → input `Pro (annual)`
2. `press(Tab)` (focused); `control(itemsPreset, three)` → input **unchanged**

- facts: FIL027, FIL028, FIL023

## D. Selection & value

**CB-SEL-01 keyboard select** — fixture: default

1. `press(Tab)`, `press(ArrowDown)`, `press(ArrowDown)` → activedescendant `Pro`
2. `press(Enter)` → `onSelectionChange("pro")`; input `Pro`; closed; `keydown` Enter `defaultPrevented` (open)
3. `press(Enter)` (closed) → **not** `defaultPrevented`; with `withForm=on` the submit count increments

- facts: SEL001, SEL011, SEL043, SEL044, EVT001, EVT002, NAV027, NAV028

**CB-SEL-02 reselecting the same key still fires** — fixture: `selectedKey=pro` uncontrolled

1. `click(trigger)`, `type("Pr")`, `click(option "Pro")` → `onSelectionChange("pro")` fired again; input `Pro`; closed
2. `press(ArrowDown)` (opens on `Pro`), `press(Enter)` → fires again (`shouldForceSelectionChange`)

- facts: SEL009, SEL010, SEL041, EVT014

**CB-SEL-03 custom text discarded; Escape propagation** — fixture: `selectedKey=pro`, `layout=inDialog`

1. open dialog; `click(trigger)`, `type("Zed")`, `press(Enter)` → input `Pro`; closed; dialog open
2. `type("Zed")`, `press(Tab)` → input `Pro`
3. `type("Zed")`, `press(Escape)` → combobox closed; input `Pro`; **dialog still open** (Escape consumed because selection non-empty)
4. `control(selectedKey, none)`; `press(Escape)` with input `` and menu closed → **dialog closes** (nothing to revert → propagation continues)

- facts: SEL012, SEL025, SEL026, SEL028, SEL046, EVT004

**CB-SEL-04 `allowsCustomValue`** — fixture: `allowsCustomValue=on`, `selectedKey=none`, `withForm=on`, `layout=inDialog`

1. observe → **no** hidden input; the visible input has `name="plan"` (formValue forced to `text`)
2. `click(trigger)`, `type("Zed")`, `press(Enter)` → input stays `Zed`; closed; `onSelectionChange(null)` not needed (already null); `form["plan"] == "Zed"`
3. `type("!")`, `press(Escape)` → input `Zed!`; **dialog closes too** (custom-value Escape does not stop propagation)
4. reopen dialog; `control(selectedKey, pro)`; `press(Backspace)` ×2 → `P`; `press(Escape)` → input `Pro` (selected key present → commitSelection)
5. `type("Starter")` exactly, `press(Enter)` → selects `starter` (text equals an item)

- facts: SEL013, SEL014, SEL027, SEL029, SEL030, SEL042, FRM003, EVT004

**CB-SEL-05 fully controlled: no extra selection events on blur** — fixture: `selectionSource=selectedKey`, `inputSource=inputValue`

1. `click(trigger)`, `click(option "Starter")` → `onSelectionChange` ×1
2. `click(after)` → still ×1
3. reopen, select `Pro` (×2), `press(Tab)` → still ×2

- facts: SEL006, SEL007, SEL008, EVT011, EVT012, EVT015

**CB-SEL-06 Enter with no focused option commits, does not pick** — fixture: `selectedKey=pro`

1. `click(trigger)` (activedescendant null), `type("St")`, `press(Enter)` → input `Pro` (revert), **not** `Starter`

- facts: SEL049

**CB-SEL-07 touch select** — fixture: default

1. `tap(trigger)` → open; `focus.active` = input
2. `tap(option "Pro")` → selected; closed; input `Pro`; `focus.active` = input

- facts: SEL050, TCH005, TCH006, TCH012, sel-7 (toggle semantics `unit-only` for multi)

**CB-SEL-08 defaults render the selected text** — fixture: `selectionSource=defaultSelectedKey`, `selectedKey=pro`

1. observe → input `Pro` (text from the item, before any interaction; on an SSR'd route this is also the server HTML)
2. `control(inputSource, defaultInputValue)`, `control(inputValue, Hello)` → input `Hello`; `Pro` still `aria-selected="true"` when opened

- facts: SEL036, SEL037, SEL034, SEL045; SEL035 / TIM017 (SSR/hydration) are proved by the package hydrate suite

`unit-only` (RAC-only surface, S2 omits `selectionMode`): SEL003, SEL015, SEL016,
SEL017–SEL024, SEL033, SEL040 (S2 browser test skipped upstream), NAV039,
ARIA014, ARIA027, ARIA028, FB022, FRM004, FRM005, FRM017, FRM018, FRM019,
FRM026, FRM027, RTL007, TIM008, TIM012, TIM018.

## E. Focus & blur

**CB-FB-01 tab order and Tab-commit** — fixture: `selectedKey=pro`

1. `press(Tab)` from `before` → input; trigger skipped
2. `press(Tab)` → `after` (menu closed → no commit event)
3. `press(Shift+Tab)` → input; `type("St")` (open); `press(Tab)` → closed; input `Pro`; focus `after`; Tab `keydown` **not** `defaultPrevented`
4. `press(Shift+Tab)` → input; `press(Shift+Tab)` → `before`

- facts: FB001, FB002, FB019, EVT003, sel-tab

**CB-FB-02 label click** — fixture: default

1. `click(label)` → `focus.active` = input; menu closed (S2 label is a native `<label for>`, so the RAC span-label `onClick` branch is not taken: `focus.focusVisible` false)

- facts: FB017, FB018 (native branch)

**CB-FB-03 blur into the trigger / popover does not commit** — fixture: `selectedKey=pro`

1. `press(Tab)`, `type("St")` → open
2. `click(trigger)` → closed by toggle, **input still `St`** (blur to the button is ignored, no revert)
3. `click(trigger)` → open; `control(itemsPreset, sections)`; `click(section(1) header)` → open; input unchanged

- facts: FB005, FB006, OC043, OC044

**CB-FB-04 `autoFocus`** — fixture: `autoFocus=on`

1. observe at load → `focus.active` = input; menu closed

- facts: FB013

**CB-FB-05 aria-hide outside and no scroll lock** — fixture: default

1. `click(trigger)` → `document.ariaHiddenSiblingCount` > 0 (everything outside input + popover); `document.overflow` unchanged (no `overflow:hidden`, no padding-right); **no** underlay element
2. `press(Escape)` → `ariaHiddenSiblingCount` 0

- facts: FB025, FB026, FB027, ARIA023, hide-src-popover, hide-src-keepvisible, scr-prevent-4, scr-popover-modal, dis-rac-underlay, OV011

## F. Forms

**CB-FRM-01 `formValue` key vs text, `form` attribute** — fixture: `selectedKey=pro`, `withForm=on`, `form=external-form`

1. observe → hidden `input[type=hidden][name=plan][value=pro]`; visible input has **no** `name`; both carry `form="external-form"`; `form["plan"] == "pro"`
2. `control(formValue, text)` → visible input `name="plan"`; hidden input gone; `form["plan"] == "Pro"`

- facts: FRM001, FRM002, FRM008, FRM009, FRM020, FRM023, SEL048

**CB-FRM-02 reset restores the default key** — fixture: `selectionSource=defaultSelectedKey`, `selectedKey=pro`, `withForm=on`

1. `click(trigger)`, `click(option "Starter")` → input `Starter`; `form["plan"] == "starter"`
2. ★`reset` → input `Pro`; `form["plan"] == "pro"`

- facts: FRM006, FRM007

**CB-FRM-03 native required validation** — fixture: `isRequired=on`, `validationBehavior=native`, `withForm=on`

1. observe → input `required`; no `aria-required`; no `aria-describedby` error; field `data-required`, **not** `data-invalid`
2. ★`submit` → submit count unchanged; `focus.active` = input; `aria-describedby` resolves to `Constraints not satisfied`; field `data-invalid`; `invalid` event `defaultPrevented`
3. `type("S")`, `click(option "Starter")` → `data-invalid` still present until blur; validity valid
4. `press(Tab)` → `aria-describedby` error gone; `data-invalid` gone
5. `control(validationBehavior, aria)`, `control(isInvalid, on)` → no `required`; `aria-required="true"`; `aria-invalid="true"`

- facts: FB020, FB021, FRM010, FRM011, FRM012, FRM013, FRM014, FRM025, ARIA029, evt-7 (negative)

**CB-FRM-04 description and error ids** — fixture: `description=…`, `errorMessage=…`, `isInvalid=on`

1. observe → input `aria-describedby` resolves, in order, to the description text then the error text

- facts: FRM015, FRM016

**CB-FRM-05 contextual help** — fixture: `withContextualHelp=on`

1. observe → 2 buttons; the second is the trigger (`aria-haspopup="listbox"`)
2. `click(helpButton)` → dialog visible with heading and content; combobox closed

- facts: FRM024

`unit-only`: FRM021 (browser autofill), FRM022 / TCH009 (`inputMode` passthrough).

## G. ARIA and announcements

**CB-ARIA-01 closed and open attribute baseline** — fixture: `prefix=USD`

1. observe → label `for` = input id; input `aria-labelledby` starts with the label id and includes the prefix id second; trigger `aria-label="Show suggestions"` + `aria-labelledby` includes the label id
2. `click(trigger)` → listbox `aria-label="Suggestions"` and `aria-labelledby` = `${listboxId} ${labelId}`; every option `aria-selected` is a string boolean; data attributes live on the field root only (one `data-comparison-control-root`)

- facts: ARIA001, ARIA007, ARIA008, ARIA009, ARIA010, ARIA013, ARIA025, RTL006 (en-US strings)

**CB-AX-01 VoiceOver focus announcements** — fixture: `itemsPreset=sections`; class: ua:apple

1. `press(Tab)`, `press(ArrowDown)` → `ax.live` last text `Entered group Plans, with 2 options. Starter`
2. `press(ArrowDown)` → `Pro`
3. `press(ArrowDown)` → `Entered group Add-ons, with 2 options. Support`
4. `press(Enter)` → `Support, selected`
5. same steps without `ua:apple` → no live text

- facts: ARIA016, ARIA017, ARIA018, ARIA019, ARIA021, ARIA022, TIM014

**CB-AX-02 option count announcements** — fixture: default; class: ua:apple

1. `click(trigger)` → `ax.live` `3 options available.`
2. `type("P")` → `1 option available.`
3. `control(loadingState, loadingMore)`, reopen → count excludes the loader (`3 options available.`)
4. without `ua:apple`: `press(ArrowDown)` to open → **no** count (focused key set); `click(trigger)` → count announced (focused key null)

- facts: FIL013, FIL014, FIL015, ARIA020, NAV030

`unit-only`: ARIA011 (slot), ARIA026 (render fn), ARIA030 (`clearContexts`),
ARIA031 (RAC pressed vs S2 ARIA032 — the S2 branch is asserted in CB-OC-01).

## H. Overlay geometry and motion

**CB-OV-01 placement, offset, width** — fixture: default

1. `click(trigger)`, `settle(300)` → `overlay.placement == "bottom"`; `dx == 0` (start-aligned to the field group); `dy == 6` (S2 size M offset); `widthDelta == 0` (`minWidth`/`width` = `--trigger-width`); `insideViewport`; `zIndex` unset with `isolation: isolate`; `--trigger-anchor-point` present
2. `control(size, S|L|XL)` → `dy` 6 / 7 / 8
3. `control(menuWidth, 400)` → overlay width 400; `minWidth` still the trigger width
4. `control(direction, top)`, `control(align, end)` → `placement == "top"`; right edges aligned (`dx` measured from the end edge = 0)
5. `control(size, L)` while open → `--trigger-width` updated without closing

- facts: OV001, OV002, OV003, OV004, OV005, OV006, OV021, OV022, TIM015, pos-s2-combobox, pos-s2-zindex, pos-s2-popover-offset-arrow, pos-rac-trigger-width, pos-rac-combobox-width, pos-rac-data-placement, pos-src-dom-write, pos-src-arrow-size

**CB-OV-02 flip** — fixture: `layout=nearBottom`

1. `click(trigger)`, `settle(300)` → `placement == "top"`; `insideViewport`
2. `control(shouldFlip, off)`, reopen → `placement == "bottom"`; `insideViewport` false is allowed and must match
3. `control(layout, default)`; `click(trigger)`; `resize(1280, 300)` → position recomputed (`placement` may become `top`), still open

- facts: OV007, OV008, OV014, pos-3, pos-src-window-resize, pos-src-resizeobserver, pos-src-layout-deps

**CB-OV-03 RTL** — fixture: locale `ar-AE`

1. `click(trigger)`, `settle(300)` → overlay `dir="rtl"`; start edge is the **right** edge (`dx` from the right = 0); `placement == "bottom"`
2. `control(align, end)` → left edges aligned
3. `pixel` of the closed field → chevron orientation identical on both stacks (S2 rotates 90° regardless of direction)

- facts: OV016, RTL001, RTL002, RTL008, RTL009, pos-src-rtl, RL-004

**CB-OV-04 non-modal popover surface** — fixture: default

1. `click(trigger)` → overlay has **no** `role="dialog"`, no `tabindex`; **no** underlay; exactly **one** visually hidden `button[aria-label="Dismiss"]` (trailing); `focus.active` = input (popover not auto-focused)
2. ★`focus(dismissButton)` is impossible (tabindex −1) — instead `click(dismissButton)` via its DOM position → closed

- facts: OV011, OV020 (corrected), dis-rac-dismiss-btns, dis-rac-underlay, dis-dismiss-1, pos-rac-dialog-role, port-src-focus, AR-012 analogue

**CB-OV-05 enter / exit / reopen-during-exit** — fixture: default; class: motion (the #248 proof)

1. `click(trigger)` → observe **immediately**: overlay mounted, positioned relative to the trigger (`dy == 6`, never at the viewport origin), phase `entering` on both stacks (`data-entering`, opacity < 1, translateY −4 px)
2. `settle(300)` → phase `settled`: no `data-entering`, opacity `1`, translate `0`, `pointerEvents` auto
3. `press(Escape)` → observe immediately: phase `exiting` (`data-exiting`, opacity → 0, `pointerEvents: none`), still mounted
4. `settle(300)` → unmounted
5. `press(ArrowDown)`; `press(Escape)`; within 50 ms `press(ArrowDown)` → phase `settled` immediately: `data-exiting` removed, **no** `data-entering` (no second enter), opacity `1`, clickable
6. `control(direction, top)`; `click(trigger)` → entering translate is **+4 px** for top placement
7. repeat 1–4 twenty times in fuzz (`alphabet: click trigger, Escape, ArrowDown`) → never a settled state with opacity < 1, never a mounted overlay at `dx/dy` of the viewport origin

- facts: OV009, TIM006, anim-1 (prop override `unit-only`), anim-src-enter, anim-src-enter-empty, anim-src-exit, anim-src-reopen, anim-s2-keyframes, time-3, time-6, time-7, pos-src-initial-fixed, pos-src-reset-maxh, time-8

**CB-OV-06 max height and list scroll anchor** — fixture: `itemsPreset=many`, `layout=nearBottom`, `shouldFlip=off`

1. `click(trigger)`, `settle(300)` → overlay `maxHeight` clamps to the space below minus 12 px container padding; `list.scrollHeight > list.clientHeight`
2. `press(ArrowDown)` ×20; `resize(1280, 900)` → focused option still in view after reposition (`focusedOptionInView` true)

- facts: OV017 (context), pos-src-scroll-anchor, geometry contract (`containerPadding` 12, `maxHeight` formula), pos-5 (user `maxHeight` `unit-only`)

**CB-OV-07 no tray on narrow viewports (S2)** — fixture: default

1. `resize(375, 667)`; `click(trigger)` → still a popover (`data-trigger="ComboBox"`); no tray, no second input, no tray dismiss/clear buttons

- facts: OC050, TCH007, pos-s2-mobile-tray

`unit-only` / not emulatable: OV015, TCH010, pos-src-vv-resize, pos-src-scale-freeze,
pos-src-webkit-pinch (visualViewport / pinch), TCH011 (iOS body touch scroll),
scr-prevent-src-ios*, pos-1/2/4/6/7/8 and the `pos-c-*` `calculatePosition`
matrix (hook unit tests, proved in `solidaria` `useOverlayPosition` /
`calculatePosition` tests), port-1/2/port-src-* (portal providers — the
`inDialog` layout covers `port-src-nested-dialog`), anim-rac-hidden.

## I. Touch and VoiceOver virtual click

**CB-TCH-01 VoiceOver centre touch-end toggles; 500 ms debounce** — fixture: default; class: timing

1. ★`tapAt(input, 0, 0)` (exact centre) → open; `focus.active` = input; `touchend` `defaultPrevented`
2. `clock(499)`; ★`tapAt(input, 0, 0)` → **still open** (debounced), `defaultPrevented`
3. `clock(1)`; ★`tapAt(input, 0, 0)` → closed
4. ★`tapAt(input, -40, 0)` (off centre) → no toggle; not `defaultPrevented` by this handler
5. `control(isReadOnly, on)`; ★`tapAt(input, 0, 0)` → nothing
6. `control(menuTrigger, focus)`; `tap(input)` → open (touch + focus trigger)

- facts: OC031, OC032, OC033, OC034, OC019, TCH003, TCH004, TCH008, TIM004, EVT007

## J. Fuzz alphabet (#247)

`click trigger`, `click input`, `click option(n)`, `hover option(n)`,
`mouseDown/Up option(n)`, `clickOutside`, `press ArrowDown/ArrowUp/Home/End/
PageDown/PageUp/Enter/Escape/Tab/Shift+Tab/ArrowLeft/ArrowRight/Backspace`,
`type` one of `S`, `P`, `E`, `x`, ` `, `Control+A`, `scrollPage 40`,
`wheel listbox`, `resize 1280×300 / 1280×900 / 375×667`, `clock 500`,
`settle 300`, `tap trigger`, `tap option(n)`. Invariants checked after every
generated step (in addition to React == Solid): a mounted overlay is never
positioned at the viewport origin; after `settle(300)` an open overlay has
opacity `1`; `focus.active` is always the input while the field is focused
(virtual focus); `aria-expanded` on input and trigger always agree with the
listbox presence.

---

## Coverage ledger

Every ComboBox-ledger row → journey (or `unit-only` with the owning suite).

| rows                                                | journey                                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| OC001, OC002, OC046, OC047, OC048                   | CB-OC-01                                                                |
| OC003                                               | `unit-only` (RAC render props)                                          |
| OC004, OC005                                        | CB-OC-02                                                                |
| OC006, OC010, OC045                                 | CB-OC-06                                                                |
| OC007, OC008                                        | CB-OC-08, CB-OC-09                                                      |
| OC009                                               | CB-OC-07                                                                |
| OC011                                               | CB-OC-03                                                                |
| OC012, OC015, OC017                                 | CB-OC-04                                                                |
| OC013, OC014, OC016                                 | CB-OC-05                                                                |
| OC018                                               | CB-OC-09                                                                |
| OC019                                               | CB-TCH-01                                                               |
| OC020                                               | CB-OC-03                                                                |
| OC021, OC023, OC024                                 | `unit-only` (RAC `allowsEmptyCollection=false`)                         |
| OC022                                               | CB-OC-05, CB-OC-14                                                      |
| OC025, OC027, OC049                                 | CB-OC-03, CB-OC-13                                                      |
| OC026                                               | CB-OC-03 (S2 empty state)                                               |
| OC028, OC030                                        | CB-OC-08                                                                |
| OC029                                               | `unit-only` (trigger-button Alt+Arrow)                                  |
| OC031–OC034                                         | CB-TCH-01                                                               |
| OC035, OC036, OC037, OC041                          | CB-OC-10                                                                |
| OC038                                               | `unit-only` (shadow DOM)                                                |
| OC039                                               | CB-OC-12                                                                |
| OC040                                               | CB-OC-01 (single select closes)                                         |
| OC042, OC043, OC044                                 | CB-OC-11, CB-FB-03                                                      |
| OC050                                               | CB-OV-07                                                                |
| NAV001–NAV004                                       | CB-OC-08                                                                |
| NAV005–NAV007, NAV015, NAV041                       | CB-NAV-01                                                               |
| NAV008, NAV045                                      | CB-NAV-02                                                               |
| NAV009–NAV012, NAV032                               | CB-NAV-03                                                               |
| NAV013, NAV014, NAV034                              | CB-NAV-04                                                               |
| NAV016, NAV017                                      | CB-NAV-06                                                               |
| NAV018, NAV019, NAV029, NAV031                      | CB-NAV-08                                                               |
| NAV020–NAV023                                       | CB-NAV-05                                                               |
| NAV024–NAV026, NAV042, NAV043                       | CB-NAV-07                                                               |
| NAV027, NAV028                                      | CB-SEL-01                                                               |
| NAV030                                              | CB-AX-02                                                                |
| NAV033                                              | CB-OC-08                                                                |
| NAV035, NAV038                                      | `unit-only` (`onAction` items)                                          |
| NAV036, NAV037                                      | CB-NAV-09                                                               |
| NAV039                                              | `unit-only` (multiple)                                                  |
| NAV040, NAV044                                      | CB-OC-01                                                                |
| FIL001, FIL002, FIL004, FIL029                      | CB-FIL-01                                                               |
| FIL003                                              | `unit-only` (`defaultFilter`)                                           |
| FIL005, FIL007, FIL011                              | CB-OC-03                                                                |
| FIL006, FIL008, FIL009, FIL026                      | CB-OC-14                                                                |
| FIL010                                              | CB-OC-15                                                                |
| FIL012                                              | CB-FIL-02                                                               |
| FIL013–FIL015                                       | CB-AX-02                                                                |
| FIL016, FIL017                                      | CB-NAV-10                                                               |
| FIL018                                              | CB-OC-03, CB-OC-13                                                      |
| FIL019–FIL022                                       | CB-FIL-04                                                               |
| FIL023, FIL027, FIL028                              | CB-FIL-05                                                               |
| FIL024                                              | not observable (`completionMode` hardcoded)                             |
| FIL025                                              | CB-OC-03                                                                |
| FIL030                                              | CB-FIL-03                                                               |
| SEL001, SEL011                                      | CB-SEL-01                                                               |
| SEL002                                              | CB-OC-01                                                                |
| SEL003, SEL015–SEL024, SEL033, SEL040               | `unit-only`                                                             |
| SEL004                                              | CB-NAV-09                                                               |
| SEL005                                              | CB-SEL-01, CB-OC-01, CB-SEL-07                                          |
| SEL006–SEL008                                       | CB-SEL-05                                                               |
| SEL009, SEL010, SEL041                              | CB-SEL-02                                                               |
| SEL012, SEL025, SEL026, SEL028, SEL046              | CB-SEL-03                                                               |
| SEL013, SEL014, SEL027, SEL029, SEL030, SEL042      | CB-SEL-04                                                               |
| SEL031, SEL032, SEL047                              | CB-FIL-02                                                               |
| SEL034, SEL036, SEL037, SEL045                      | CB-SEL-08                                                               |
| SEL035                                              | package hydrate suite                                                   |
| SEL038, SEL039                                      | `unit-only`                                                             |
| SEL043, SEL044                                      | CB-SEL-01                                                               |
| SEL048                                              | CB-FRM-01                                                               |
| SEL049                                              | CB-SEL-06                                                               |
| SEL050                                              | CB-SEL-07                                                               |
| FB001, FB002                                        | CB-FB-01                                                                |
| FB003                                               | CB-OC-11                                                                |
| FB004                                               | CB-OC-16                                                                |
| FB005, FB006                                        | CB-FB-03                                                                |
| FB007                                               | `unit-only` (no button)                                                 |
| FB008                                               | CB-OC-02 (focus dedupe implied: single `onFocus`)                       |
| FB009                                               | CB-OC-03                                                                |
| FB010, FB011, FB019                                 | CB-OC-01                                                                |
| FB012, FB015, FB016                                 | CB-OC-06, CB-OC-07                                                      |
| FB013                                               | CB-FB-04                                                                |
| FB014                                               | CB-OC-03                                                                |
| FB017, FB018                                        | CB-FB-02                                                                |
| FB020, FB021                                        | CB-FRM-03                                                               |
| FB022                                               | `unit-only`                                                             |
| FB023                                               | `unit-only` (RAC Dialog + errorMessage slot; no throw)                  |
| FB024                                               | CB-OC-02                                                                |
| FB025–FB027                                         | CB-FB-05                                                                |
| FRM001, FRM002, FRM008, FRM009, FRM020, FRM023      | CB-FRM-01                                                               |
| FRM003                                              | CB-SEL-04                                                               |
| FRM004, FRM005, FRM017–FRM019, FRM026, FRM027       | `unit-only`                                                             |
| FRM006, FRM007                                      | CB-FRM-02                                                               |
| FRM010–FRM014, FRM025                               | CB-FRM-03                                                               |
| FRM015, FRM016                                      | CB-FRM-04                                                               |
| FRM021, FRM022                                      | `unit-only`                                                             |
| FRM024                                              | CB-FRM-05                                                               |
| ARIA001–ARIA004, ARIA006, ARIA012, ARIA013, ARIA024 | CB-OC-01                                                                |
| ARIA005                                             | CB-OC-08                                                                |
| ARIA007–ARIA010, ARIA025                            | CB-ARIA-01                                                              |
| ARIA011, ARIA026, ARIA030                           | `unit-only`                                                             |
| ARIA014, ARIA027, ARIA028                           | `unit-only` (multiple)                                                  |
| ARIA015                                             | CB-NAV-08                                                               |
| ARIA016–ARIA019, ARIA021, ARIA022                   | CB-AX-01                                                                |
| ARIA020                                             | CB-AX-02                                                                |
| ARIA023                                             | CB-FB-05                                                                |
| ARIA029                                             | CB-FRM-03                                                               |
| ARIA031, ARIA032                                    | CB-OC-01                                                                |
| ARIA033                                             | CB-NAV-02                                                               |
| ARIA034                                             | CB-NAV-10                                                               |
| ARIA035                                             | CB-OC-06, CB-OC-07                                                      |
| OV001–OV006, OV021, OV022                           | CB-OV-01                                                                |
| OV007, OV008, OV014                                 | CB-OV-02                                                                |
| OV009                                               | CB-OV-05                                                                |
| OV010                                               | CB-OC-01                                                                |
| OV011, OV020 (corrected)                            | CB-OV-04                                                                |
| OV012, OV013, OV017                                 | CB-OC-10                                                                |
| OV015                                               | not emulatable (visualViewport)                                         |
| OV016                                               | CB-OV-03                                                                |
| OV018                                               | CB-OC-12                                                                |
| OV019                                               | CB-OC-11                                                                |
| TCH001, TCH002                                      | CB-OC-09                                                                |
| TCH003, TCH004, TCH008                              | CB-TCH-01                                                               |
| TCH005, TCH006, TCH012                              | CB-SEL-07                                                               |
| TCH007                                              | CB-OV-07                                                                |
| TCH009, TCH010, TCH011                              | `unit-only` / not emulatable                                            |
| RTL001, RTL002, RTL008, RTL009                      | CB-OV-03                                                                |
| RTL003, RTL004                                      | CB-NAV-04                                                               |
| RTL005                                              | CB-FIL-01 under `ar-AE` (same steps)                                    |
| RTL006                                              | CB-ARIA-01                                                              |
| RTL007                                              | `unit-only` (multiple)                                                  |
| EVT001, EVT002                                      | CB-SEL-01                                                               |
| EVT003                                              | CB-FB-01                                                                |
| EVT004                                              | CB-SEL-03, CB-SEL-04                                                    |
| EVT005                                              | CB-OC-08 (ArrowDown `defaultPrevented` compared)                        |
| EVT006                                              | CB-NAV-05                                                               |
| EVT007                                              | CB-TCH-01                                                               |
| EVT008, EVT009                                      | CB-OC-06 (readonly chain) / CB-OC-08                                    |
| EVT010                                              | CB-NAV-04                                                               |
| EVT011, EVT012, EVT015                              | CB-SEL-05                                                               |
| EVT013                                              | CB-OC-01                                                                |
| EVT014                                              | CB-SEL-02                                                               |
| EVT016                                              | `unit-only` (button keydown guard)                                      |
| EVT017, EVT018                                      | CB-OC-04, CB-OC-11                                                      |
| EVT019                                              | CB-OC-07                                                                |
| EVT020                                              | `unit-only`                                                             |
| TIM001–TIM003                                       | CB-FIL-04                                                               |
| TIM004                                              | CB-TCH-01                                                               |
| TIM005                                              | CB-NAV-08                                                               |
| TIM006                                              | CB-OV-05                                                                |
| TIM007                                              | CB-NAV-04                                                               |
| TIM008, TIM012, TIM018                              | `unit-only`                                                             |
| TIM009                                              | CB-OC-03 (single-effect: no intermediate step observed)                 |
| TIM010, TIM011                                      | protocol notes (fake timers / +100 ms) → `clock` / `settle` conventions |
| TIM013                                              | CB-NAV-10                                                               |
| TIM014                                              | CB-AX-01                                                                |
| TIM015                                              | CB-OV-01                                                                |
| TIM016                                              | `unit-only`                                                             |
| TIM017                                              | package hydrate suite                                                   |

Shared-ledger rows proved here are listed in `shared-overlay.md`.

## Known Solid divergences already observed (feed #248)

From the #244 seed runs, step 0 of every ComboBox journey already diverges on
`field dom`: Solid options use `aria-label` + `aria-describedby="(missing)"`
where React uses `aria-labelledby` + `aria-posinset` / `aria-setsize`; Solid
listbox lacks `data-layout` / `data-orientation`; Solid input emits
`aria-haspopup="listbox"` (React does not); Solid field group uses
`data-focused` where React uses `data-focus-within`. These must be fixed (or
explicitly allow-listed as framework markers in the oracle's `data-*` policy,
`data-rac` only) before any journey can get past step 0.
