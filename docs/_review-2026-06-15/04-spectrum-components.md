# Agent 04 — solid-spectrum components: API / props / variants / behavior parity audit

Scope: `packages/solid-spectrum/src/**` except `src/style/**` and `*.css` (Agent 5's lane).
Standard: AGENTS.md Rules #1 (certified), #2 (mirror, don't invent), #4 (no ARIA/state fork in upper layers), #5 (structure not patches), #7 (tests can fail).
Upstream truth: `react-spectrum/packages/@react-spectrum/s2/src/<Component>.tsx` (pinned `@react-spectrum/s2` 1.1.0), and `react-spectrum/packages/react-aria-components/src/**`.

Styling values/tokens/macros are explicitly NOT audited here — only behavior/composition forks are flagged.

Counts: Critical 4 · High 6 · Medium 6 · Low 2.

---

### [Critical] `@ts-nocheck` disables type contracts on ~30 component files, including the highest-surface ones

- Evidence: `// @ts-nocheck` at line 1 of `packages/solid-spectrum/src/picker/index.tsx:1`, `combobox/index.tsx:1`, `slider/index.tsx:1`, `slider/RangeSlider.tsx:1`, `calendar/index.tsx:1` + all 5 sibling calendar files (`DateField`, `DatePicker`, `DateRangePicker`, `RangeCalendar`, `TimeField`), `card/index.tsx:1`, `cardview/index.tsx:1`, `checkbox/index.tsx:1`, `radio/index.tsx:1`, `numberfield/index.tsx:1`, `searchfield/index.tsx:1`, `switch/ToggleSwitch.tsx:1`, `tabs/TabsPicker.tsx:1`, `tag-group/index.tsx:1`, `textfield/index.tsx:1`, `textfield/TextArea.tsx:1`, `gridlist/index.tsx:1`. (`rg -l "@ts-nocheck" packages/solid-spectrum/src` → 29 files; non-style component files listed above.) Upstream S2 ships fully typed (e.g. `Picker.tsx` declares `PickerProps<T extends object, M extends SelectionMode>` with no suppression).
- Why: Rule #1/#7. Type contracts are a user-observable surface that must be able to fail. `@ts-nocheck` blanket-silences every prop-name, generic, and signature error in these files, so the compiler can no longer catch the prop drift documented below; "as tested and certified as possible" is impossible when a whole file opts out of typechecking. The TableView and Menu by contrast are clean — proving the codebase can be typed.
- Fix: Remove `@ts-nocheck`; replace with narrowly-scoped `@ts-expect-error` on the specific lines that genuinely need it (each one then fails if the underlying issue is fixed), and fix the rest. Treat any file that still needs file-wide suppression as not-yet-certified.

### [Critical] ActionMenu re-implements the popover lifecycle and the whole Menu render pipeline instead of composing `MenuTrigger` + `ActionButton` + `Menu`

- Evidence: `packages/solid-spectrum/src/menu/ActionMenu.tsx` is 627 lines; upstream `react-spectrum/packages/@react-spectrum/s2/src/ActionMenu.tsx:53-79` is `<MenuTrigger><ActionButton><MoreIcon/></ActionButton><Menu items=… size={menuSize}>{children}</Menu></MenuTrigger>` (~25 lines of body). The Solid `ActionMenuPopover` (lines 437-627) hand-rolls entrance/exit state (`isEntering`/`isExiting`, lines 443-444), a 200ms exit timeout (`ACTION_MENU_POPOVER_TRANSITION_DURATION`, line 435; `setTimeout`, line 529), Escape-key tracking + focus restoration (lines 489-537), and rebuilds the entire `HeaderContext`/`HeadingContext`/`TextContext` + `HeadlessMenu` pipeline (lines 578-618) plus imports menu styling internals (`menuFrame`, `menuPopover`, `menuSectionHeader`, `menuItemLabel`, `ActionMenu.tsx:47-53`). The headless `Popover` already provides `isEntering`/`isExiting` (`packages/solidaria-components/src/Popover.tsx:55,59,146,148`) and focus restore (`Popover.tsx:558` `<FocusScope … restoreFocus>`). The sibling `Menu` component does NOT do any of this — it just renders `<HeadlessPopover trigger="MenuTrigger">` (`menu/index.tsx:530-547`).
- Why: Rule #4 (behavior belongs in solidaria-components / solid-stately; the S2 layer must not re-implement overlay timing/focus) and Rule #5 (this is patch-as-structure — a parallel overlay machine). It also forks behavior _within the port_: ActionMenu and Menu now animate/focus-restore differently for the same conceptual dropdown, so parity tests for one don't cover the other.
- Fix: Make ActionMenu compose the existing `MenuTrigger`, `ActionButton`, and `Menu` (passing `items`/`children`/`size`/`onAction`/`disabledKeys`), exactly like upstream. Delete the bespoke `ActionMenuPopover`; let the entrance/exit/focus behavior come from `Menu`'s popover path so both share one source.

### [Critical] Picker invents a `value`/`defaultValue`/`onChange` controlled API and `renderValue`, not present in upstream

- Evidence: `packages/solid-spectrum/src/picker/index.tsx:99-104` declares `value?: PickerValue; defaultValue?: PickerValue; onChange?: (value: PickerValue) => void; … renderValue?: (selectedItems: T[]) => JSX.Element` (`PickerValue = Key | Key[] | null`, line 68). Upstream `Picker.tsx:100-127` extends `AriaSelectProps<T, M>` and exposes only the Aria contract — `selectedKey`/`defaultSelectedKey`/`onSelectionChange` (single) and `selectedKeys`/`onSelectionChange` (multiple). There is no `value`/`onChange`/`renderValue` on the upstream `PickerProps`. The Solid version then adapts its invented props back onto `selectedKey`/`selectedKeys` internally (lines 812-870), so two parallel controlled APIs coexist with the invented one as the documented public surface.
- Why: Rule #2 — a Solid-only public API with no upstream counterpart that is not labelled a "local addition" is silent drift; consumers wiring `value`/`onChange` write code that no upstream Picker example or doc describes, and any future S2 change to selection semantics won't map. Combined with `@ts-nocheck` (above) the divergence is invisible to the compiler.
- Fix: Mirror upstream — expose `selectedKey`/`onSelectionChange`/`selectedKeys` directly. If a `value`/`onChange`/`renderValue` convenience layer is wanted, keep it but mark it explicitly as a documented local addition (JSDoc + index note) and keep the Aria props as the primary, tested API.

### [Critical] TreeView invents `selectionStyle`, `renderActionBar`, `overflowMode`, `loadingState`, `label`, `description` — copying CardView's API onto a component whose only S2-specific prop is `onAction`

- Evidence: `packages/solid-spectrum/src/tree/index.tsx:84-105` adds `selectionStyle?: TreeSelectionStyle` (`"checkbox" | "highlight"`, line 65), `overflowMode`, `loadingState`, `renderActionBar`, `label`, `description`, and drives selection from it (`selectionBehavior={selectionStyle() === "highlight" ? "replace" : "toggle"}`, line 874; `data-selection-style`, line 886). Upstream `react-spectrum/packages/@react-spectrum/s2/src/TreeView.tsx:48-51` defines `interface S2TreeProps { onAction?: (key: Key) => void }` — that is the _entire_ S2-specific surface; `TreeViewProps` otherwise just re-exposes RAC `TreeProps` minus style props. `selectionStyle`/`renderActionBar` live on **CardView** (`CardView.tsx:62,71`), not TreeView. Upstream TreeView has no `renderActionBar` (`rg renderActionBar TreeView.tsx` → no match) and no `selectionStyle`.
- Why: Rule #2. This isn't an alias — it grafts a different component's behavior (highlight selection, action bar, overflow mode) onto TreeView, changing its selection model and DOM. None is marked a local addition.
- Fix: Reduce `TreeProps` to the RAC tree surface plus `onAction` (+ `UNSAFE_*`/`styles` per the S2 wrapper convention). If highlight-selection or an action bar on a tree is a deliberate Viviana feature, document it as a local addition and prove it with a test; otherwise remove it.

---

### [High] TableView invents `variant` (striped/bordered), `size`, `title`, `description`

- Evidence: `packages/solid-spectrum/src/table/index.tsx:60-61,112-118` declares `TableVariant = "default" | "striped" | "bordered"`, `TableSize = "sm" | "md" | "lg"`, and props `title?`, `description?`, `size?`, `variant?`. Upstream `TableView.tsx` `S2TableProps`/`TableViewProps` (lines ~82-121) expose `isQuiet`, `density` (`'compact' | 'spacious' | 'regular'`), `overflowMode`, `onAction`, `onResize`/`onResizeStart`/`onResizeEnd`, `renderActionBar` — and **no** `variant`, `size`, `title`, or `description`. (Tables in S2 have no striped/bordered variant.) The good parts (`density`, `overflowMode`, `onResize*`, `onAction`, `renderActionBar`) are present and correctly wired (`table/index.tsx:122-136,719,736`).
- Why: Rule #2 — `variant: 'striped'|'bordered'` and `size` imply visual/behavioral modes S2 tables don't have; `title`/`description` duplicate `aria-label`/`aria-labelledby` with a non-S2 shape.
- Fix: Drop `variant`/`size`/`title`/`description` (or gate behind documented local-addition status). Keep the density/overflow/resize surface, which already matches.

### [High] Menu `MenuItem` flattens `icon`, `shortcut`, `isDestructive` into props; upstream uses composition only

- Evidence: `packages/solid-spectrum/src/menu/index.tsx:160-168` adds `icon?: () => JSX.Element`, `shortcut?: string`, `isDestructive?: boolean` to `MenuItemProps`. Upstream `Menu.tsx:441-446` `MenuItemProps` is `Omit<AriaMenuItemProps, …> & StyleProps` with only `children: ReactNode`; icon/keyboard/value come purely via composed children + slots (`<Text slot="…">`, `<Keyboard>`, `IconContext`, `Menu.tsx:480-533`). There is no `icon`, `shortcut`, or `isDestructive` prop upstream. (`isDestructive` is not an S2 Menu concept at all.)
- Why: Rule #2. Flat convenience props are a different authoring API than the documented S2 slot composition; `isDestructive` invents a state with no upstream styling/semantic contract.
- Fix: Remove the flat props (or mark as local additions). Author destructive/icon/shortcut via the same slot composition upstream uses, which the component already supports through `TextContext`/`IconContext`/`Keyboard`.

### [High] `MenuButton` with `variant: 'primary' | 'secondary' | 'quiet'` and hand-rolled size/variant class tables is wholly invented

- Evidence: `packages/solid-spectrum/src/menu/index.tsx:122-127` (`MenuButtonProps.variant`), `183-213` (`buttonSizeStyles`, `buttonVariants` literal class maps), and `349-398` (`MenuButton` builds class strings by hand from `isPressed`/`isFocusVisible`). Upstream S2 has no `MenuButton` and no menu-trigger `variant`: the trigger is an arbitrary child of `MenuTrigger` (typically `<ActionButton>`/`<Button>`), `Menu.tsx:545-596`. RAC also has no `MenuButton` primitive — the headless layer's `MenuButton` (`packages/solidaria-components/src/Menu.tsx`) is itself a Solid-only addition.
- Why: Rule #2 (invented variant + component) and Rule #4-adjacent (re-implements pressed/focus class logic the headless `Button` render-props already expose). It also bypasses the S2 styling source by hand-authoring button classes (which then becomes Agent 5's problem too).
- Fix: Drop `MenuButton`'s `variant` and bespoke class tables; document `MenuButton` as a thin local convenience over `MenuTrigger` + `Button`/`ActionButton`, or remove it and use `ActionButton` as the trigger like upstream.

### [High] Solid `MenuSection` omits the trailing divider that upstream renders; `MenuSeparator` hand-rolls a `<li>` instead of composing `Separator`/`Divider`

- Evidence: `packages/solid-spectrum/src/menu/index.tsx:766-778` — `MenuSection` renders only `<HeadlessMenuSection>` with no following divider. Upstream `Menu.tsx:426-439` renders `<AriaMenuSection>` **followed by `<Divider />`** so sections are visually separated, and exports `Divider` (the S2 menu divider) rather than a `MenuSeparator`. The Solid `MenuSeparator` (`menu/index.tsx:788-790`) returns `<li role="separator" class="my-1 border-t border-primary-600 …">` — a hand-authored element. A headless `Separator` exists and is exported (`packages/solidaria-components/src/Separator.tsx`).
- Why: Rule #2/#4 — sections silently lose their separators (a real composition/behavior gap, not just a style value), and the separator element is hand-rolled instead of composing the headless `Separator`, forking the DOM/role plumbing the headless layer owns.
- Fix: Have `MenuSection` emit a trailing `Divider` like upstream; replace `MenuSeparator`'s hand-rolled `<li>` with the composed `Separator` + S2 menu-divider styling, and align the export name with upstream's `Divider`.

### [High] Slider invents `showOutput` / `showMinMax`; S2 Slider always renders output and has no min/max labels

- Evidence: `packages/solid-spectrum/src/slider/index.tsx:67-68` `showOutput?: boolean; showMinMax?: boolean`, defaulting `showOutput` to `true` (line 459) and gating output/min-max rendering (lines 627, 650, 662). Upstream `Slider.tsx` always renders the output value (`output({direction, labelPosition, …})`, line 370) with no toggle, and renders no min/max labels at all (`rg "showOutput|showMinMax|showValue|minValue" Slider.tsx` → only the internal `minValue`/`maxValue` _defaults_ at 336-337 used for label-width sizing, never as visible min/max labels). `size`, `isEmphasized`, `trackStyle` (`'thin'|'thick'`), `thumbStyle` (`'default'|'precise'`), `fillOffset`, `labelPosition`, `labelAlign`, `contextualHelp` are all correctly mirrored (`Slider.tsx:42-67`), and `variant` is properly flagged "Legacy alias. Prefer S2 isEmphasized" (`slider/index.tsx`).
- Why: Rule #2 — `showOutput`/`showMinMax` are undocumented inventions (RSP v3 had `showValueLabel`; S2 dropped it). A min/max label feature that S2 doesn't have is net-new behavior.
- Fix: Remove `showOutput`/`showMinMax`, or mark explicitly as local additions; default behavior should match S2 (output always shown, no min/max labels).

### [High] ActionMenu adds `class`/`label` "legacy" props and leaks internal state via `data-*` attributes not present upstream

- Evidence: `packages/solid-spectrum/src/menu/ActionMenu.tsx:69-72` (`class?`, `label?` "Legacy alias"), and `392-396` emits `data-size`, `data-quiet`, `data-action-menu-align`, `data-action-menu-direction`, `data-action-menu-should-flip` on the trigger button. Upstream `ActionMenu.tsx:27-38` builds `ActionMenuProps` from `Pick<MenuTriggerProps,…> & Pick<MenuProps,…> & Pick<ActionButtonProps,…> & StyleProps & DOMProps & AriaLabelingProps` and adds only `menuSize`; it emits none of these `data-*` attributes and has no `class`/`label` alias (label comes from `aria-label`).
- Why: Rule #2. The `data-action-menu-*` attributes are an invented DOM contract (used to drive CSS positioning) that consumers and tests can observe; `class`/`label` are undocumented aliases.
- Fix: Drop `class`/`label` (use `styles`/`UNSAFE_className` and `aria-label`, like upstream) and the `data-action-menu-*` attributes; positioning should flow through the popover `placement` props, not DOM data attributes.

---

### [Medium] Pervasive lowercase `sm`/`md`/`lg` size aliases on 18 components — no S2 component accepts them

- Evidence: `rg '"S" | "M" | "L" | "XL" | "sm" | "md" | "lg"'` matches `checkbox`, `radio`, `badge`, `combobox`, `switch/ToggleSwitch`, `slider` (+ `RangeSlider`), `searchfield`, `textfield` (+ `TextArea`), `dialog/Dialog`, `color`, and all 5 `calendar` files (e.g. `badge/index.tsx:27`, `combobox/index.tsx:78`, `switch/ToggleSwitch.tsx:33`). Upstream S2 sizes are uppercase `'S' | 'M' | 'L' | 'XL'` only (`rg "'sm' | 'md'" s2/src/*.tsx` → no matches).
- Why: Rule #2 — an alias surface S2 never exposes, applied broadly and (mostly) without "local addition" labelling. Low individual risk but systemic.
- Fix: Either drop the lowercase aliases or document them once as a deliberate cross-cutting local addition with a normalization helper, and ensure JSDoc on each public size type says so.

### [Medium] `ListView` and `TabsPicker` exported publicly though absent from the S2 public surface

- Evidence: `ListView` is exported (`packages/solid-spectrum/src/ListView.ts`, `index.ts`) but is a Spectrum v3 component with no `@react-spectrum/s2` public export (`rg ListView s2/src/index.ts` → absent; S2 replaced it with TableView/CardView). `TabsPicker` is exported publicly but upstream `TabsPicker.tsx` exists only as an **internal** file, not in `s2/src/index.ts`.
- Why: Rule #2 — publishing components S2 doesn't publish, without a local-addition note, presents them as parity.
- Fix: If kept, label `ListView`/`TabsPicker` (and `LogicButton`, `FieldButton`, `TabSwitch` — also Solid-only) as documented local additions in `index.ts`/CREDITS; otherwise drop or make internal.

### [Medium] `LogicButton`, `FieldButton`, `TabSwitch` are Solid-only with no local-addition documentation

- Evidence: `rg LogicButton|FieldButton|TabSwitch s2/src/index.ts` → absent upstream. Exported via `button/index.ts` and `switch/index.ts` (`TabSwitch`, `switch/index.tsx:32`). No "local addition"/"Solid-only" annotation in `packages/solid-spectrum/src/index.ts` (`rg "local addition|Solid-only" index.ts` → none).
- Why: Rule #2 requires Solid-only exports to be explicit and documented.
- Fix: Add a clear local-addition note (JSDoc + index grouping) for each, or remove if not intended for parity scope.

### [Medium] Picker's quiet/multiple selection surface diverges from S2's typed `PickerProps<T, M>` model

- Evidence: Solid `PickerProps` (`picker/index.tsx:77-106`) is `PickerProps<T>` (single generic) and routes "multiple" through `selectionMode` read off an untyped `propsRecord()` (lines 811, 842-870). Upstream models it as `PickerProps<T extends object, M extends SelectionMode = 'single'>` (`Picker.tsx:100,276`) so multi-select is a typed, first-class variant.
- Why: Rule #2/#1 — the typed selection-mode contract is lost (made worse by `@ts-nocheck`), so multi-select correctness can't be enforced by types.
- Fix: Mirror the `<T, M>` generic so single vs multiple selection is type-checked, and remove the untyped `propsRecord()` shims.

### [Medium] Breadcrumbs `variant`/`showSeparator` are non-S2 (correctly noted, but still shipped as public)

- Evidence: `packages/solid-spectrum/src/breadcrumbs/index.tsx` declares `variant?: BreadcrumbsVariant` ("Legacy visual variant alias … S2 Breadcrumbs has no variant") and `showSeparator?: boolean` ("Legacy separator toggle"). Upstream `Breadcrumbs.tsx` has neither.
- Why: Rule #2 — these are at least labelled, but they're public props that mimic parity. Lower severity because the JSDoc is honest.
- Fix: Keep only if they're intentional local additions; consider deprecating toward removal so the public surface matches S2.

---

### [Low] `Avatar` keeps no-op deprecated props `online` / `fallback`

- Evidence: `packages/solid-spectrum/src/avatar/index.tsx` `online?` and `fallback?` are JSDoc'd `@deprecated … no-op compatibility prop`. Upstream `Avatar.tsx` has neither. (`size` default 24, `isOverBackground` match upstream.)
- Why: Rule #2 — dead props on the public surface; low risk since they're documented no-ops.
- Fix: Remove in the next breaking pass; they can't be certified (a no-op prop has no failing test).

### [Low] Badge keeps backward-compat `count` prop not in S2

- Evidence: `packages/solid-spectrum/src/badge/index.tsx` `count?: number` ("Backward-compatible count content. Prefer children"). Upstream `Badge.tsx:30-48` (`BadgeStyleProps`) has only `size`/`variant`/`fillStyle`/`overflowMode` + children — all of which the Solid Badge mirrors exactly (variants list, `fillStyle` default `'bold'`, `overflowMode` default `'wrap'`). `count` is the lone extra.
- Why: Rule #2 — minor invented prop; labelled, so low risk.
- Fix: Drop `count` (use children) or keep as a documented local addition.

---

## SolidJS idiom & reactivity

Overall the interactive components follow Solid hygiene well — **no destructuring of `props` in any interactive component** (the only `const { … } = props` sites are static SVG icon files, e.g. `icon/ui-icons/Chevron.tsx:14`, which extract+rest and are acceptable). `splitProps`/`mergeProps`/accessor-returning getters are used consistently, and slot styles are passed as thunks (`() => menuItemLabel({ size })`).

The reactivity concerns that matter are structural, not destructuring:

- **ActionMenu's hand-rolled effect-driven overlay machine** (`menu/ActionMenu.tsx:251-257` autofocus effect; `475-538` the entrance/exit/escape/focus-restore `createEffect` with manual `setTimeout`/`requestAnimationFrame`, `onCleanup` at 540-547). This duplicates state the headless `Popover` already derives reactively (`solidaria-components/src/Popover.tsx:55-59,558`). Re-deriving overlay timing in an effect is exactly the Rule #4 fork called out above; it also risks SSR/timing divergence from `Menu`, which uses none of it. Fold this back into the composed `Menu` path (see Critical #2).
- **Manual `ResizeObserver` trigger-width measurement in Picker** (`picker/index.tsx:548-585`) is a reasonable Solid pattern, but it's bespoke to Picker; ComboBox solves the same "match trigger width" problem separately. Not a defect on its own — flag only because the same concern is re-solved per component rather than in one shared popover-width primitive (Rule #5 drift risk).
- **No misuse found** of signals-as-values vs accessors in the high-surface files reviewed; render-prop children are correctly invoked as functions (e.g. `menu/index.tsx:646-648`).

---

## Suspected (unconfirmed)

- **ComboBox controlled API**: ComboBox extends `HeadlessComboBoxProps` directly (`combobox/index.tsx:84-108`) and appears NOT to invent a `value`/`onChange` layer (unlike Picker) — looks more faithful. Did not fully trace `menuTrigger`/`allowsCustomValue`/`formValue` wiring against `ComboBox.tsx:82,358,469`. Suspected OK; confirm.
- **Calendar `validationState` + `isInvalid` double surface** (`calendar/index.tsx`): Solid keeps both `isInvalid` and a legacy `validationState` ("for backward-compatible Solid Stately callers"). S2 Calendar uses `isInvalid`. Suspected minor drift; not confirmed whether `validationState` is wired to anything or is dead.
- **Color components `size`/`showValue` deprecations** (`color/index.tsx` ColorSlider `size`/`showValue` marked deprecated; ColorWheel `size?: number`): upstream ColorSlider has a fixed track and ColorWheel takes a numeric `size` — needs a line-by-line check that the deprecations match S2's actual surface. Suspected mostly-faithful.
- **Tabs/SegmentedControl `selectedKey` singularization** (`segmentedcontrol/index.tsx` exposes `selectedKey`/`onSelectionChange(id)` over a ToggleButtonGroup): plausibly mirrors S2 SegmentedControl, but I did not open upstream `SegmentedControl.tsx` to confirm the exact prop shape. Suspected OK.
- **`@ts-nocheck` hiding additional drift**: because 30 files opt out of typechecking, there may be further prop-name/generic mismatches not visible to inspection. The four Criticals above are confirmed by reading upstream; others may surface once types are restored.
