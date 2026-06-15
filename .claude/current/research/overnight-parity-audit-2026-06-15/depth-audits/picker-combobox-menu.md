# Depth audit — Picker / ComboBox / SelectBoxGroup / Menu / ListBox / Popover

## Stage

This is a first depth-first source audit slice after the breadth map. It is research-only and records source deltas and proof obligations.

## Scope audited

Local Solid surfaces:

- `packages/solid-spectrum/src/picker/index.tsx`
- `packages/solid-spectrum/src/combobox/index.tsx`
- `packages/solid-spectrum/src/selectboxgroup/index.tsx`
- `packages/solid-spectrum/src/menu/index.tsx`
- `packages/solid-spectrum/src/listbox/index.tsx`
- `packages/solid-spectrum/src/popover/index.tsx`
- `packages/solidaria-components/src/ComboBox.tsx`
- `packages/solidaria-components/src/Select.tsx`
- `packages/solidaria-components/src/Popover.tsx`
- `packages/solidaria/src/combobox/createComboBox.ts`

Upstream surfaces:

- `@react-spectrum/s2/src/Picker.tsx`
- `@react-spectrum/s2/src/ComboBox.tsx`
- `@react-spectrum/s2/src/SelectBoxGroup.tsx`
- `@react-spectrum/s2/src/Menu.tsx`
- `@react-spectrum/s2/src/ListBox.tsx`
- `@react-spectrum/s2/src/Popover.tsx`

## Findings

### PCM-001 — Picker is structurally close, but async/loading parity is not proven

- Local Picker uses the headless Solid `Select` stack, S2 field layout, trigger-width measurement, non-arrow popover, direction/align placement, and the same menu offset size map (`S/M = 6`, `L = 7`, `XL = 8`).
- Upstream S2 Picker adds loading-specific behavior: button spinner when `loadingState === "loading"`, spinner id in `aria-describedby`, localized loading label, and a load-more item for `loadingMore`.
- The audited local Picker excerpt did not show direct S2-like `spinnerId`, button `aria-describedby`, or `ListBoxLoadMoreItem` wiring for Picker loading states.
- Required proof/fix: targeted audit and tests for `loading`, `loadingMore`, `filtering`, `sorting`, error state, spinner accessible name, `aria-describedby`, and `onLoadMore`.

### PCM-002 — ComboBox public API appears broader than upstream S2 and narrower in async handling

- Upstream S2 ComboBox shapes the underlying RAC ComboBox into a single-selection API and explicitly omits several selection/value props before adding `SingleSelection` semantics.
- Local headless ComboBox supports multiple-selection fields (`selectionMode`, `selectedKeys`, `defaultSelectedKeys`, `onSelectionChangeMultiple`).
- Local S2 ComboBox imports tag-related pieces, suggesting local multi-select/tag support not present in upstream S2 ComboBox.
- Upstream S2 implements 500 ms delayed spinners for `loading`/`filtering`, resets on input change, and appends a load-more row for `loadingMore`.
- The audited local S2 wrapper did not show equivalent explicit loading-state handling.
- Required proof/fix: public type diff, owner classification of multi-select/tag APIs, async loading parity tests, and wrapper-level API narrowing unless local additions are explicit.

### PCM-003 — SelectBoxGroup is visually close but relies on a Solid static-child registration adapter

- Local and upstream share the high-level ListBox-backed grid shape, orientation, single/multiple selection, disabled propagation, dimensions, and slot styling goals.
- Local static children are rendered once to register options, then re-rendered from the registered collection.
- Local slot styling is post-processed through DOM mutation (`applySlotClasses`) rather than upstream React context slot styling.
- Risk: ordering, reactive updates, SSR/hydration, dynamic insertion/removal, child side effects, and focus-visible modality may diverge.
- Required proof/fix: hydration, dynamic child, keyboard orientation, multiple selection, group/item disabled, and slot-style parity tests.

### PCM-004 — Menu styling is close, but MenuTrigger/MenuButton behavior diverges

- Local Menu uses generated S2 menu styles, headless Menu, popover/submenu popovers, text/heading/keyboard/link-out/submenu/unavailable/selection contexts, and offsets aligned with upstream.
- Upstream S2 MenuTrigger has a special mouse press override that clears pressed state on document `pointerup` because RAC opens menus on press start.
- Implementation follow-up advanced: local headless `MenuTrigger` now owns the same mouse-only pressed override, exposes it through `MenuTriggerContext`, and `MenuButton` uses it for render props and `data-pressed` until document `pointerup`. Headless and S2 Menu tests assert pointer-down keeps pressed styling/data and document pointer-up clears it.
- Local `MenuButton` still uses hand-authored Tailwind-like classes and `variant` props; upstream S2 MenuTrigger delegates trigger children rather than defining this local button variant system.
- Remaining proof/fix: classify MenuButton as local addition or align it with upstream; test submenu, unavailable, link-out, selection, RTL chevrons, and React-vs-Solid pointer press routes.

### PCM-005 — standalone `solid-spectrum` ListBox is not currently an S2-style-macro port

- The audited local ListBox uses hand-authored utility-style class strings and local icons.
- This does not follow the S2 generated style macro/source-of-truth pattern used elsewhere.
- Risk: standalone ListBox should not be considered certified S2 parity.
- Required proof/fix: re-port standalone ListBox from upstream S2 `ListBox.tsx` or explicitly document it as a local non-S2 component; add visual and ARIA parity tests.

### PCM-006 — Popover is structurally close, but public props leak lower-level behavior knobs

- Local Popover and upstream S2 both default placement to bottom, compute offset as `(offset ?? 8) + (hideArrow ? 0 : 8)`, pass arrow refs, and apply S2 popover state.
- Upstream S2 omits many lower-level RAC/ARIA popover props such as `arrowSize`, `isNonModal`, `arrowBoundaryOffset`, `isKeyboardDismissDisabled`, `shouldCloseOnInteractOutside`, and `shouldUpdatePosition`.
- Local `PopoverProps` extends headless popover props while only omitting class/style/children, so low-level behavior knobs may leak through the S2 surface.
- Required proof/fix: generated type comparison; narrow S2 public props or document additions; tests for arrow offset, hideArrow, lang/dir propagation, focus restoration, dismiss buttons, modal/submenu behavior.

## Highest-risk blockers from this slice

1. ComboBox S2 API drift around multi-selection/tag support.
2. Missing/unproven Picker and ComboBox async loading behavior.
3. MenuTrigger missing upstream mouse press override.
4. Standalone ListBox not following S2 style source-of-truth.
5. Popover low-level prop leakage.
6. SelectBoxGroup static-child registration and DOM-mutating slot adapter.

## Suggested test matrix

- Picker: closed/open ARIA, keyboard open/commit/close, loading button spinner, loadingMore row, default width, `menuWidth`, quiet crossOffset, RTL crossOffset.
- ComboBox: input value/selected key/custom value/filtering, menu trigger modes, delayed spinner, loadingMore row, blur/click handling, S2 API guard for multi-select/tag props.
- SelectBoxGroup: static child order, dynamic changes, single/multiple selection, horizontal/vertical keyboard, disabled group/item, illustration/label/description slots.
- Menu: root placement, submenu offset, pointerup press state, selection indicators, link-out icon, unavailable help, RTL submenu chevron.
- Popover: arrow/hideArrow offset, modal/non-modal roles, Escape/dismiss buttons, locale `lang`/`dir`, omitted prop surface.

## Commands used by the depth-audit agent

- `rg -n "Picker|ComboBox|SelectBoxGroup|ListBox|Menu|Popover" packages apps -g '!dist'`
- `find packages/solid-spectrum/src -maxdepth 3 -type f | rg '/(Picker|ComboBox|SelectBoxGroup|Menu|ListBox|Popover)|picker|combobox|select|menu|listbox|popover'`
- `sed -n <ranges> packages/solid-spectrum/src/{picker,combobox,selectboxgroup,menu,listbox,popover}/index.tsx`
- `rg -n "function (Picker|ComboBox|SelectBoxGroup|SelectBox|MenuTrigger|MenuButton|Menu\\b|MenuItem|Popover)|export function|useComboBox|allowsEmptyCollection|isNonModal|offset|crossOffset|renderEmptyState|UNSAFE|size|labelPosition|menuWidth" <upstream and local files>`
- `nl -ba <audited files> | sed -n <ranges>`
- `git status --short --branch`
