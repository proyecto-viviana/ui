# External standards obligations for depth parity audit

## Purpose

This file adds the external accessibility authority layer that the breadth map did not yet contain. It is not a substitute for upstream React Spectrum / React Aria source. It is the standards checklist that every depth-audit slice must map to source branches, runtime behavior, and failing tests.

## Sources consulted

- W3C WAI-ARIA Authoring Practices Guide (APG) patterns index: https://www.w3.org/WAI/ARIA/apg/patterns/
- W3C WAI-ARIA 1.2 Recommendation: https://www.w3.org/TR/wai-aria-1.2/
- W3C WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- W3C APG Date Picker Dialog Example: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
- W3C APG Date Picker Combobox Example: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/
- W3C APG Combobox Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- W3C APG Dialog Modal Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- W3C Understanding WCAG 2.5.7 Dragging Movements: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html

## Cross-cutting WCAG 2.2 obligations

| Obligation | Components affected | Proof required |
|---|---|---|
| Keyboard operation and no keyboard trap | all interactive components; especially overlays, menus, listboxes, grids, sliders, drag/drop, date/color pickers | Playwright keyboard tests for entry, operation, exit, focus restoration, and disabled/unavailable branches. |
| Visible focus and focus not obscured | all focusable components; especially popovers/dialogs/tooltips/menus and scrollable collection components | Computed focus-visible assertions and viewport/scroll tests proving focus indicator remains visible and not hidden by overlays/sticky regions. |
| Target size minimum | Button family, TagGroup removers, color handles, sliders, calendar cells, menu/list items, tree/table rows | Computed bounding-box tests at every size/density/static-color branch. |
| Dragging Movements 2.5.7 | DropZone, drag-and-drop collections, sliders/range sliders/color sliders/color area/color wheel where pointer drag is primary | Non-drag alternatives by keyboard or single pointer; tests proving equivalent value/order changes without drag gestures where required. |
| Name/Role/Value | all custom widgets | Browser accessibility tree or computed role/name/value assertions for every state branch. |
| Status messages / announcements | pending buttons, loading listboxes, async combobox/picker, validation errors, toasts/live regions | Announcement tests using real browser APIs or app-level live-region observation; axe alone is insufficient. |
| Error identification and input assistance | forms, text fields, date/time fields, number fields, combo/picker, search, color fields | Required/invalid/error/help text association tests plus native form submission/reset tests. |

## Pattern-specific obligations

### Button / toggle / toolbar

- Buttons must expose button semantics, disabled/pending state, accessible name, keyboard activation, and no duplicate press/click firing.
- Toggle buttons must expose selected state with the same role/state model as upstream RAC; do not silently switch to radio semantics unless upstream does.
- Toolbars/action groups must preserve focus order, orientation, keyboard movement, and disabled item handling.

### Checkbox / switch / radio

- Checkbox supports checked, unchecked, and mixed where applicable.
- Radio groups expose group name and mutually exclusive selection.
- Switch must expose state and name consistently with upstream; any checkbox-vs-switch role choice must be upstream-backed.

### Combobox / picker / select / listbox

- Combobox/listbox must expose accessible name distinct from value, required/invalid state, popup relationship, active option, expanded/collapsed state, selection state, and correct keyboard model.
- Select-like Picker must not be audited as a menu button if upstream treats it as value-bearing combobox/listbox/select semantics.
- Async loading states must expose loading status and preserve navigation/selection behavior while loading/filtering/loadingMore.

### Menu / submenu

- Menu triggers, menus, menuitems, separators, sections, disabled/unavailable items, selection indicators, keyboard shortcuts, and submenus must match upstream roles, names, keyboard behavior, and focus restoration.
- Pointer press behavior must be tested because upstream S2 has trigger-specific press-state handling.

### Dialog / popover / tooltip / contextual help

- Modal dialogs must trap focus, label/describe correctly, restore focus, close via expected keyboard/pointer paths, and prevent background interaction.
- Popovers must expose the same modal/non-modal behavior and omitted public prop surface as upstream S2.
- Tooltips must not take focus and must be associated with the trigger by description semantics matching upstream.

### Calendar / date / time

- Date pickers that use a dialog+grid pattern must prove grid roles, selected/current/unavailable/disabled state, keyboard movement, month/year navigation, focus placement on open, and focus return/close behavior.
- Date/time fields must prove segment spinbutton names/values, edit keys, locale segment order, hour cycle, calendar systems, validation, and hidden input form behavior.

### Collection widgets: table/list/tree/grid/tag

- Collection widgets must prove row/item/treeitem/gridcell roles, selection state, disabled/unavailable state, roving focus or aria-activedescendant behavior, typeahead where upstream provides it, drag/drop keyboard parity, and virtualizer fallback navigation.

### Slider / range slider / color widgets

- Range widgets must expose role/name/value/min/max/text, keyboard increments, pointer behavior, RTL/direction effects, disabled/read-only state, and non-drag alternatives required by WCAG 2.5.7 where relevant.

## Audit rule for standards

Each component depth file must include a section named `External standards obligations`. Every row in that section must be one of:

- `source-backed and tested`,
- `source-backed but test missing`,
- `upstream unknown; inspect React source`,
- `not applicable`, or
- `parity gap`.

A component cannot be marked certified from this research until all applicable external-obligation rows are source-backed and held by tests that can fail.
