# Cross-cutting architecture findings

## Findings

### ARCH-001 — green catalogue coverage is not full certification

Reports show 69/69 catalogue, route, controls, validation-note, and evidence coverage, but certification requires every user-observable upstream branch to be held by a failing test. Treat reports as a floor, not acceptance.

### ARCH-002 — export parity needs classification, not only counts

The export report's 22 missing S2 support exports and 69 extra Solid exports require owner-aware classification. Extra exports can be valid local additions only when explicit and documented; silent drift violates the mirror-upstream rule.

### ARCH-003 — source authority resolution is split

Installed package source is available for S2/RAC/RA/RS, but RAC guard scripts still assume a vendored `react-spectrum/` source tree. This makes some guards environment-sensitive and should be resolved structurally.

### ARCH-004 — component families need shared branch matrices

Button family, date/time fields, collection components, overlays, color components, and picker/select/combobox share underlying upstream branches. Their audits should create family branch matrices to avoid patch-by-patch certification.

### ARCH-005 — layer-boundary audit must be explicit

For each component, record whether state lives in `solid-stately`, ARIA/focus/keyboard in `solidaria`, composition/render props/data attributes in `solidaria-components`, and S2 styling in `solid-spectrum`. Any upper-layer behavioral fork should be a blocking architecture finding unless source-backed as a wrapper-only concern.

## Recommended future implementation order after research

1. Fix guard infrastructure/source authority so RAC parity guards are dependable in this checkout.
2. Investigate virtualizer keyboard fallback failure because it is a direct failed guard.
3. Classify missing and extra S2 exports with owner review for public names/local additions.
4. Convert asserted visual states to strict pair-diff/computed contracts by component family.
5. Finish known partial component blockers: Picker, Card/CardView, Provider.
6. Sweep remaining current-gate-normalized components through full acceptance gates.

## Continuation findings from xhigh depth slices

1. **Virtualizer is a certification boundary, not an optimization.** Picker, ComboBox, ListView, TableView, TreeView, CardView, and TagGroup still have wrappers that do not consistently mirror upstream S2 virtualized/layout architecture. Large data, row measurement, scroll geometry, load-more rows, and action-bar integration cannot be certified with static small-list screenshots.
2. **Hard-coded English strings are widespread.** Date/time labels, color-control labels, collection labels, RangeSlider thumb labels, TagGroup empty/action labels, and Picker/ComboBox loading/required labels need upstream localization parity and non-English accessible-name tests.
3. **Overlay portal locale must be proven at the portal node.** Provider root `lang`/`dir` does not prove Dialog/Popover/Tooltip/ContextualHelp portals inherit or set the correct locale/direction when mounted outside the provider DOM subtree.
4. **Upper-layer behavior patches remain suspicious.** ActionButton trigger ARIA synchronization, RangeSlider state/keyboard/pointer logic, and some ActionBar role/live-announcement choices sit above the intended ARIA/state layers and need either migration or owner-approved documentation.
5. **Type suppression hides public API drift.** `// @ts-nocheck` in certified component wrappers should be treated as a parity blocker because prop/default/context/ref/export mismatches must become visible.
6. **Assistive-technology proof is still missing.** Axe and pair screenshots do not prove segmented fields, calendars, range calendars, two-dimensional color sliders, toast focus recovery, live announcements, dialog labelling, or collection selection announcements.

7. **Form-control certification needs an inheritance matrix.** Form-level size, label placement/alignment, necessity, required/disabled/read-only, and validation behavior must be proven for each consumer and for child override branches; otherwise `useFormProps` parity remains assumed rather than certified.
8. **Public refs are part of API parity.** TextField-style focus/select/input access needs tests across text, textarea, search, and number fields; Solid root refs alone do not prove upstream S2 ref behavior.
