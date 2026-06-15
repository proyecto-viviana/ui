# Depth audit slice: collections, tabs, tags, and button-family follow-up

## Scope and authority

This slice records xhigh follow-up on `Button`, `ActionButton`, `ToggleButton`, button groups, `Picker`, `ComboBox`, `SelectBoxGroup`, `ListView`, `TableView`, `TreeView`, `TagGroup`, and `Tabs`. It updates the initial breadth map with line-oriented risk findings and corrections.

## Findings

### CTT-001 — Button family is mostly strong; ActionButton has an upper-layer behavior patch

Button, ActionButton, ToggleButton, ButtonGroup, ActionButtonGroup, and ToggleButtonGroup largely track upstream source and React Aria behavior. A later source pass narrows the earlier concern about single-select `ToggleButtonGroup`: the radiogroup branch matches React Aria's `useToggleButtonGroup` model closely enough that the remaining issue is proof coverage, not an obvious behavior mismatch.

Remaining structural concern: ActionButton contains menu-trigger ARIA/behavior synchronization in the S2 wrapper. That logic belongs in the lower headless/ARIA layer unless it is proven to be styling-only composition.

### CTT-002 — Picker and ComboBox are not certified: API, i18n, and virtualization gaps remain

Local Picker and ComboBox wrappers expose local convenience aliases and broad headless props, carry type suppression, and hardcode English strings for required/optional/loading states. Upstream S2 narrows the public surface, supports async-loadable behavior, and wraps collection bodies with Virtualizer/layout support. Tests must cover async load-more, empty state, progress indicator, virtualized layout, API-surface parity, localized labels, form validation, and focus restoration.

### CTT-003 — Collection wrappers lack upstream S2 virtualization architecture

ListView, TableView, TreeView, Picker, and ComboBox render headless collection bodies directly in local S2 wrappers while upstream S2 relies on Virtualizer/layout integration for the certified architecture. Local lower-layer Virtualizer exists, but the S2 wrappers are not wired through it. This is a structural blocker for large collections, scroll geometry, action bar integration, row measurement, and visual parity.

### CTT-004 — Collection strings and advanced TableView branches are incomplete

Local collection wrappers hardcode English strings such as select/empty/loading/load-more labels. TableView also lacks or has not proven advanced upstream branches including editable cells, column menus/resizing, tree-column chevrons, row checkbox injection, and public export parity for editable-cell support.

### CTT-005 — TagGroup has maxRows, link/action, form, and i18n drift

Local TagGroup approximates `maxRows` with overflow clipping, while upstream measures rows and exposes show-more/show-less behavior through action controls. Link-like tags, group action labels, empty-state labels, form props, and localization need source-equivalent proof. `TagGroup` also carries type suppression.

### CTT-006 — Tabs are close but need stress and overflow proof

Tabs comparatively mirror upstream overflow collapse and accessible labeling, but `TabsPicker` carries type suppression and needs proof for all-disabled sets, long localized labels, RTL overflow, dynamic insertion/removal, focus restoration, forced colors, and responsive picker handoff.

### CTT-007 — `// @ts-nocheck` is a parity smell in certified components

Picker, ComboBox, GridList/ListView paths, TagGroup, TabsPicker, Card/CardView, RangeSlider, and related wrappers include type suppression in areas that should be line-by-line certified. Removing type suppression is not just cleanup: it forces public prop/default/context/ref/export mismatches to become compile-time facts instead of undocumented drift.

## Priority proof queue

1. Wire collection S2 wrappers through the intended Virtualizer architecture or document the owner-approved alternative.
2. Add API-surface comparison tests for Picker, ComboBox, TableView, TagGroup, and TabsPicker.
3. Replace hard-coded English collection labels with localized upstream strings.
4. Add async load-more, empty state, progress, and virtualized scroll geometry tests.
5. Add TagGroup measured maxRows/show-more/show-less/link/form tests.
6. Add Tabs overflow, RTL, dynamic, all-disabled, and forced-colors tests.
