# @proyecto-viviana/solid-spectrum

## 0.6.0

### Minor Changes

- 237ed4a: Surface `CenterBaseline` as a public export

  `CenterBaseline` is now exported from the package root and from a dedicated
  `@proyecto-viviana/solid-spectrum/CenterBaseline` subpath, mirroring
  `@react-spectrum/s2`'s promotion of the component to a documented public
  export. It was previously internal-only (consumed by radio/calendar/color/
  searchfield/picker). The `centerBaseline` factory and `centerBaselineBefore`
  helper stay internal, matching upstream's public surface.

- 14aec15: Remove invented Picker/TreeView props to restore upstream parity (breaking)

  `Picker` and `TreeView` each carried a small set of props that have no
  counterpart in React Spectrum S2. They are removed so the public API matches
  upstream exactly (parity is the rule):
  - **Picker** — dropped the legacy controlled-value aliases `value`,
    `defaultValue`, and `onChange`, along with the `PickerValue` type and the
    internal `value`⇄key translation helpers. Use the real S2 selection props
    instead: `selectedKey`/`defaultSelectedKey`/`onSelectionChange` for single
    selection and `selectedKeys`/`defaultSelectedKeys`/`onSelectionChangeKeys` for
    `selectionMode="multiple"`. The real S2 `renderValue` prop is unchanged.
  - **TreeView** — dropped the invented `overflowMode` prop (and the
    `TreeOverflowMode` type and `data-overflow-mode` attribute). S2's TreeView has
    no overflow mode; the tree label/description now always truncate, matching
    upstream. The real S2 props `onAction`, `renderActionBar`, and `selectionStyle`
    are unchanged. (`GridList`/`ListView`/`Table` keep their own legitimate
    `overflowMode` — only the tree's invented copy is gone.)

  Migration: replace `value`/`defaultValue`/`onChange` on `Picker` with the
  matching `selectedKey*`/`onSelectionChange*` props, and remove `overflowMode`
  from any `TreeView` usage.

- 7e0fcaa: Close the React Spectrum S2 support-export gap

  `solid-spectrum` now re-exports the full set of S2 support names that were
  missing from its public surface, matching pinned upstream S2 1.5.0
  (`comparison:report:exports` reports no missing S2 support exports):
  - **Helpers / hooks / collection data:** `mergeStyles`, `Autocomplete`,
    `useLocale`, and the list-data primitives under their upstream `use*` names
    (`useListData`, `useTreeData`, `useAsyncList`, backed by our `create*`
    equivalents).
  - **Slotted-props contexts** — each component now defines, consumes, and exports
    its own `SpectrumContextValue`-typed context, mirroring the established
    `DividerContext`/`CheckboxContext` pattern: `ColorSchemeContext`,
    `DateFieldContext`, `DatePickerContext`, `DateRangePickerContext`,
    `TimeFieldContext`, `NumberFieldContext`, `SwitchContext`, `TextFieldContext`,
    `TextAreaContext`, `TagGroupContext`, `PickerContext`, `TableContext`, plus the
    already-present `RadioGroupContext` and `ComboBoxContext`. Consumption is a
    no-op by default (`getSlottedContextProps(null, …)` returns `null`), so the
    default render path is unchanged.
  - **Section components:** `PickerSection` and `ComboBoxSection` — each wraps a
    headless list-box section followed by a size-matched `<Divider>`, reading size
    from the internal picker/combobox context (mirrors upstream `Picker.tsx` /
    `ComboBox.tsx`).

  For the three form fields that apply the form/Skeleton disabled-force
  (`TextField`, `DateField`, `TimeField`), the slotted context is merged **below**
  explicit props and `useFormProps`/`useProviderProps` wrap the result, so the
  Skeleton disabled-force stays outermost — matching upstream's
  `useSpectrumContextProps` → `useFormProps` order.

  The public `TableContext` is distinct from the table's internal
  row/density state context, which is renamed `InternalTableContext`.

  Still unported (left as notes, not invented): `LabeledValue`/`LabeledValueContext`,
  `DragPreview`, and the drag-and-drop helpers (`useDragAndDrop`,
  `isFileDropItem`, …) — these track unported components/subsystems.

### Patch Changes

- c3041bf: Breadcrumbs: invoke `onAction` with the item key only

  The collapsed-overflow menu forwarded its `onAction` straight to the inner
  `Menu`, which calls `onAction(key, value)`. That leaked the menu item's value
  as a second argument to the consumer. `Breadcrumbs.onAction` is key-only
  (matching upstream React Spectrum), so the breadcrumb menu now drops the value
  before invoking the handler.

- 9a7c865: ButtonGroup: cap the group at its container width so overflow can trigger

  `ButtonGroup`'s overflow detection (switch to a vertical stack when the buttons
  don't fit) could never fire: the `inline-flex` group had no width constraint, so
  it simply grew to fit its buttons and no child ever extended past the group's
  own edge. Added `maxWidth: 'full'` to the group style — matching upstream S2's
  `ButtonGroup` — so the group is bounded by its container and the existing
  overflow measurement (and the `orientation` switch to `'vertical'`) becomes
  effective.

- 4439c99: Parity fixes: Breadcrumbs current item as div, ContextualHelp no arrow, Disclosure role passthrough

  **solid-spectrum / Breadcrumbs**: pass `elementType="div"` for the current (last) breadcrumb item so the headless layer renders a non-interactive `<div>` instead of an `<a>`. Upstream React Spectrum S2 `Breadcrumbs.tsx` renders the current item as a `<div>` and non-current items as `<Link>` — our headless `BreadcrumbItem` was defaulting to `<a>` for every item including the current one.

  **solid-spectrum / ContextualHelp and ContextualHelpPopover**: add `hideArrow` to the `<Popover>` in both components. Upstream React Spectrum S2 `ContextualHelp.tsx` uses `<ContextualHelpPopover hideArrow>` — the contextual help popover is a plain card with no directional arrow tip.

  **solid-spectrum / DisclosurePanel**: stop stripping the `role` prop with `splitProps` before forwarding to `HeadlessDisclosurePanel`. Upstream react-aria-components `DisclosurePanel` accepts a `role` prop that allows callers to override the default `role="group"` (e.g. `role="region"` for a landmark). Stripping the prop silently prevented this override.

- 6aaca3e: DateRangePicker: widen the internal `isDateUnavailable` annotation to the anchor-aware form

  The S2 `DateRangePicker`'s internal display helper annotated `isDateUnavailable`
  as the old single-argument `(date) => boolean`, even though it already forwards
  the now anchor-aware callback straight through to the embedded `RangeCalendar` at
  runtime. The signature is now `(date, anchorDate) => boolean`, matching upstream's
  `useRangeCalendarState` / `DateRangePicker` and the `RangeCalendarStateProps`
  callback it forwards to (the second argument is the in-progress range's anchor
  date, `null` outside an active selection).

  Type fidelity only — the public `DateRangePickerProps` already exposed the
  two-argument form by inheritance, and a one-argument callback stays assignable, so
  there is no API or behavior change. Existing tests already cover the forwarding
  (an unavailable day renders `aria-disabled` in the popover calendar).

- 065427a: Disclosure: route `DisclosureTitle`'s `styles` to the trigger button, font-restricted

  `DisclosureTitle.styles` is meant to let callers tweak only the heading's
  typography (`font`, `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`). It was
  being merged onto the outer `<Heading>` wrapper, which doesn't carry the title's
  own font — so a font override never took effect, and any non-font override leaked
  through unfiltered.

  It now applies to the trigger `Button` as a `style()` override, gated by
  `getAllowedOverrides({ font: true })` — matching upstream S2's `DisclosureTitle`.
  An allowed font property overrides the button's base typography; a disallowed
  property (e.g. padding) is dropped. The prop type is narrowed to
  `StylesPropWithFont`. Adds the `font` option to the internal `getAllowedOverrides`
  helper plus the `fontProperties` / `StylesPropWithFont` exports it relies on.

- 3514b40: Fields: add a custom `prefix` slot (port of upstream S2 field prefixes)

  Upstream S2 hosts `prefix?: ReactNode` on the shared `FieldGroup`
  (`s2/src/Field.tsx`) — a baseline-aligned visual rendered before the input,
  associated to the input via a `prefixId` appended to `aria-labelledby`. It is
  threaded into `ColorField`, `ComboBox`, `NumberField`, and `TextField`
  (prefix-only; there is no `suffix`).

  We have no shared `FieldGroup` — each field composes its own group/input from
  its headless context — so the port adds a small shared helper
  (`field/prefix.tsx`): `FieldPrefix` renders the prefix in a baseline-centered,
  icon-styled container with a stable `id`, and `PrefixInputProvider` re-provides
  the field's own context through a proxy that appends that `id` to the input's
  `aria-labelledby` (preserving reactivity and each context's `inputProps` shape).
  `CenterBaseline` gained an optional `id`. Each of the four fields now accepts
  `prefix?: JSX.Element`; with no prefix the render path is unchanged.

  4 new tests (one per field) assert the prefix renders before the input and is
  referenced by the input's `aria-labelledby`.

- a6aa0af: Route GridList, Tree, and Table row selection/actions through the shared selectable item press path, including replace-mode secondary actions, focused-row keyboard activation, and disabled-for-selection rows. Align S2 TableView's default selection timing with upstream RAC by leaving normal rows on pointer-down selection unless drag selection requests pointer-up timing.
- 5db5585: Menu parity fixes: shouldCloseOnSelect, mouse pressed state, ActionMenu rich items, roving focus

  **solidaria / createMenu**: gate `onClose` on `shouldCloseOnSelect !== false` so keyboard-activated items with that prop set do not close the menu — mirrors `@react-aria/menu` `useMenuItem` line 231.

  **solidaria / createMenuItem**: rename `_ref` to `ref` and wire a `createEffect` that imperatively calls `focusSafely` when the item becomes the focused key and real DOM focus has not already landed there. Completes the roving-tabindex loop: the declarative tabIndex 0/-1 swap is now backed by an actual focus call, matching `@react-aria/selection` `useSelectableItem`.

  **solidaria-components / Menu**: fix `shouldCloseOnSelect` splitProps grouping (was in `local`, now in `stateProps`) so the value reaches `createMenu`; add `MenuItemCloseRegistryContext` for per-item override; add `get shouldCloseOnSelect()` getter on `ariaProps`; wire mouse-pressed signal into `MenuTriggerContextValue` so `MenuButton` reflects pointer-down state correctly.

  **solid-spectrum / ActionMenu**: replace the internal `HeadlessMenuItem` usage with the full `MenuItem` component; surface description, shortcut, icon, `isDisabled`, and link props (`href`/`target`/`rel`/`download`) matching the upstream S2 `ActionMenu` API.

  **solid-spectrum / menu/index**: extract `MenuItemContents` as a named SolidJS component to allow reuse by `ActionMenu`.

- 7e7fe8c: NumberField a11y: render the input as a textbox, not a spinbutton

  **solidaria / createNumberField**: mirror upstream `useNumberField`, which wraps `useSpinButton` but deliberately overrides its output — `role: null` plus `aria-valuenow/min/max/text: null` — because a `spinbutton` cannot be focused with VoiceOver. The input is now a plain `textbox` inside the existing `role=group` wrapper, with `aria-roledescription="number field"`; the formatted value is announced through the input's own value. Previously we leaked the raw spinbutton semantics (`role="spinbutton"` + `aria-value*`), diverging from `@react-aria/numberfield` `useNumberField.ts`.

  **solidaria-components / NumberField** and **solid-spectrum / NumberField** inherit the corrected contract: their rendered input now exposes `role=textbox` (queryable as such) rather than `spinbutton`. Date/time-segment spinbuttons are unaffected.

- 5f77a00: SearchField a11y: expose the field shell as a `role="group"`

  Mirror S2's `SearchField`, whose field shell is a `FieldGroup` — a RAC
  `<Group>` that defaults to `role="group"` — wrapping the search icon, input,
  and clear button. Our solid-spectrum `SearchField` rendered that shell as a
  plain `<div>` (with the focus-within and click-to-focus behavior) but omitted
  the role, so the grouping was invisible to assistive technology. The group is
  intentionally unnamed; the searchbox continues to carry the field label.

- 2a24e59: Tabs / SegmentedControl: freeze the selection indicator under `prefers-reduced-motion`

  The animated selection indicator in `Tabs` (the line that slides to the active
  tab) and `SegmentedControl` (the pill that slides to the selected segment)
  transitioned its `translate`/`width`(/`height`) unconditionally. Upstream S2
  gates that transition behind `'@media (prefers-reduced-motion: reduce)': 'none'`
  on both indicators, so users who ask for reduced motion get an instant move
  instead of a slide.

  Both `style()` macro blocks now mirror upstream: the `transition` is the object
  form with a `reduce → none` override, matching the existing precedent in our
  `Disclosure`. No change for users without the reduced-motion preference.

- f1cb8f3: Thin the solid-spectrum `.` barrel and serve the JSX-free style modules as `.js`

  `solid-spectrum`'s `dist/index.jsx` re-exported the whole library inline (~520 KB)
  and the JSX-free `dist/style/index.jsx` weighed ~1.26 MB — both over the 500 KB
  Babel `compact` deopt threshold. Any consumer of the `@proyecto-viviana/ui` root
  barrel (which re-exports solid-spectrum) therefore tripped the Solid-compiler
  "code generator has deoptimised … exceeds 500KB" warning, even though the two
  lower packages were already split (UC-05).

  The build now promotes every barrel re-export target to its own entry, so
  `dist/index.jsx` is a thin re-export (~11 KB) and the largest emitted `.jsx` is
  ~54 KB. `src/icon/index.tsx` stays inlined on purpose so its unused 410-icon
  `s2wfIcons` namespace tree-shakes away rather than being rooted by an entry.
  `./style` and `./style/runtime` carry no Solid template code, so their `solid`
  export condition now points at the prebuilt `.js` (the `.jsx` is no longer
  emitted) — the `style()` macro still expands at the consumer build. No public
  export was removed; this is internal build shape plus a condition change, so
  existing imports keep working — a root-barrel `@proyecto-viviana/ui` import now
  builds with no deopt warning.

- e820a54: Avoid materializing the full upstream Spectrum token JSON as a TypeScript literal
  during declaration emit.

  The style layer still imports Adobe's `@adobe/spectrum-tokens` JSON at runtime,
  but the build tsconfig now resolves that JSON to a compact declaration file. This
  keeps generated token values faithful to upstream while preventing
  `tsc -p tsconfig.build.json` from stalling in the comparison build.

- af687ed: Typecheck the style layer: drop `@ts-nocheck` from the six `style/` files

  The styled layer (`tokens.ts`, `spectrum-theme.ts`, `style-macro.ts`,
  `index.ts`, plus the runtime/types helpers) shipped under `@ts-nocheck`, so the
  whole macro/token surface was excluded from `tsc`. Removing the directive
  surfaces the type errors our stricter config catches that upstream's tsconfig
  silently suppresses: upstream sets `noImplicitAny: false`, which mutes every
  `TS7053` string-index and `TS7006` implicit-any-parameter site; we run
  `strict: true`.

  Each surfaced site is reconciled faithfully rather than re-suppressed
  file-wide:
  - The implicit-`any` index lookups (font-size index map, base-color mapping,
    property/condition/value tables in the style macro) get minimal
    loose-lookup casts at the access point. Every one is already runtime
    null-checked, so this mirrors upstream's effective `any` semantics without
    loosening behavior.
  - `tokens.ts` no longer self-references its own `default` key: the
    `import * as` namespace carries a synthetic `default` (esModuleInterop), so
    the token key space now excludes it (`Exclude<keyof …, "default">`), fixing
    the `TS2345` that the previous `default`-unwrap ternary introduced.
  - The three `process.env` reads (`runtime.ts`, `style-macro.ts`,
    `spectrum-theme.ts`) now go through the build-safe `globalThis` cast already
    used in `image/` and `statuslight/`, instead of the bare `typeof process`
    form. `tsconfig.typecheck.json` declares `types: ["node"]` but the dts build
    (`tsconfig.build.json`) does not, so the bare form type-checked but broke the
    declaration emit with `TS2591: Cannot find name 'process'`.

  No runtime or API change — the emitted CSS and token values are identical; the
  layer is now covered by `vp run typecheck` and the dts build (`tsc -p
tsconfig.build.json`).

- c6fbde7: Table: hide the highlight-mode row divider under a selected row

  In highlight selection style the gray row divider is drawn as the row's
  box-shadow (a real `<tr>` border is ignored under `border-collapse: separate`,
  so the upstream row `borderBottom` has no real-DOM equivalent). It was only
  suppressed when the _next_ row was selected, so a lone selected row — or the
  bottom row of a selected block — still painted a stray gray line underneath its
  rounded blue highlight-block border.

  The divider now also collapses when the row itself is selected, mirroring
  upstream `TableView`'s divider `borderColor` going `transparent` on both
  `isSelected` and `isNextSelected`. In every selected case the blue block border
  paints that edge instead, so the gray line no longer doubles up.

- b0a822c: Table: add `EditableCell` (port of `@react-spectrum/s2`'s editable TableView cell)

  S2's `TableView` lets a cell host an inline editor: an `edit` action button opens
  a form, and on a fine pointer the form lives in a popover anchored to the cell,
  while on touch it opens as a full-screen dialog. This ports that cell to our
  styled Table as `EditableCell` (exported as `EditableCell` / `EditableCellProps`),
  mirroring upstream's two-path behaviour in one component.

  The path is chosen by a new `createMediaQuery` primitive
  (`src/utils/createMediaQuery.ts`, a Solid port of `@react-spectrum/utils`'
  `useMediaQuery`): it returns `false` during SSR and before mount so server and
  first client render agree, then resolves `(hover: hover) and (pointer: fine)` on
  the client. Desktop renders the editor in a `Popover`; like upstream RAC a modal
  popover is exposed as `role="dialog"`, labelled from the new `table.editCell`
  string, with icon-only save/cancel `ActionButton`s (`Checkmark`/`Cross`, labelled
  `table.save` / `table.cancel`). Touch renders a `DialogContainer` > `CustomDialog`
  with a text-button `ButtonGroup`. Both submit the form on dismiss-by-interacting-
  outside and cancel on Escape, matching `EditableTableView`.

  Adds the `table.editCell` / `table.save` / `table.cancel` strings (en-US, es-ES).

- edd9453: TableView: draw the highlight-selection block border + grouped row dividers

  Completes the virtualizer-only polish that `table-selection-style-highlight.md`
  left as a tracked follow-up. In `selectionStyle="highlight"`, a contiguous run of
  selected rows now renders as a single rounded blue "block": the 1px blue border
  and 5px corner radii only appear on the group's outer edges, and the gray divider
  between two selected rows is suppressed.

  This mirrors upstream S2's `TableView` faithfully:
  - The block border is a `::before` overlay, because the `style()` macro can't
    express a pseudo-element. The macro sets per-row custom properties
    (`--borderColor`, `--borderTopWidth`/`--borderBottomWidth`,
    `--borderTopRadius`/`--borderBottomRadius`, …) and a shared stylesheet —
    injected once on first highlight render, like upstream's `highlightSelectionBorder`
    raw css — reads them. Inner edges/corners are zeroed via two new
    `isNextSelected` / `isPrevSelected` row conditions, computed from the headless
    table state's `selectedKeys` and `collection.getKeyAfter`/`getKeyBefore`.
  - The gray row divider moves from the cell's bottom border to the row's
    `box-shadow` in highlight mode (suppressed within a selected block by
    `isNextSelected`). Upstream draws this divider as a row `borderBottom`, which a
    real `<table>` can't use — `border-collapse: separate` makes CSS ignore borders
    set on `<tr>` — so the box-shadow is its faithful real-DOM realization. Checkbox
    mode keeps the divider on the cell, so it stays byte-for-byte unchanged.

  The one upstream detail intentionally dropped is `z-index: 3` on the overlay — it
  exists only to paint above the S2 virtualizer's sticky cells, which our real-DOM
  `<table>` doesn't have. The default `selectionStyle="checkbox"` is unaffected.

- 4b2e5e1: TableView: add `selectionStyle="highlight"` (port of upstream S2 highlight selection)

  Upstream S2's `TableView` exposes `selectionStyle?: 'checkbox' | 'highlight'`
  (default `'checkbox'`). Highlight selection swaps the underlying selection
  behavior from `toggle` to `replace` and drops the selection checkboxes, so a
  plain click selects a whole row (and replaces the prior selection) instead of
  toggling a checkbox. Our `TableView` only exposed the raw `selectionBehavior`,
  so the styled highlight mode was missing.

  `TableView` now accepts `selectionStyle`, mirroring the same prop we already
  ship on `TreeView`:
  - `selectionStyle="highlight"` derives `selectionBehavior="replace"` for the
    underlying headless table (an explicit `selectionBehavior` still overrides),
    matching upstream's `selectionStyle === 'highlight' ? 'replace' : 'toggle'`.
  - Both the select-all column header and the per-row selection checkboxes are
    gated on `selectionStyle === 'checkbox'` with `toggle` behavior, exactly like
    upstream — highlight mode renders neither.
  - Selected rows pick up the blue-tinted highlight background
    (`color-mix(gray-25, blue-900, 10%)`, `15%` on hover/press) instead of the
    gray checkbox-mode fill, with `Highlight`/`HighlightText` forced-colors
    fallbacks. The style change is scoped to the highlight path, so the default
    checkbox style is byte-for-byte unchanged.
  - The grid carries `data-selection-style` for styling/testing parity with
    `TreeView`.

  The default remains `'checkbox'`, so existing tables are unaffected. The
  virtualized-grid polish from upstream's `TableView` — contiguous-selection-block
  rounded corners and box-shadow row dividers driven by `isNextSelected` /
  `isPrevSelected` — is tied to the S2 virtualizer's sticky-cell z-index layering
  and is **not** part of this change for our real-DOM `<table>`; it remains a
  tracked follow-up, matching the fidelity bar of the shipped `TreeView` highlight
  port.

- 187b74b: TableView: render the S2 expand/collapse chevron and tree-column indentation

  The headless tree-grid stack already shipped; this closes the last gap by
  porting upstream `@react-spectrum/s2` TableView's `ExpandableRowChevron` and
  `treeColumnStyles` into our styled `TableView`, so a tree-grid table looks like
  S2 rather than relying on the consumer to draw the chevron themselves.
  - The styled `TableCell` now auto-renders the expand/collapse chevron in the
    tree column of rows that have children (`hasChildItems && isTreeColumn`),
    matching the gating S2's `Cell` uses. It is the **headless** Button on the
    row's `chevron` slot (so it picks up the press-to-toggle/`Expand`/`Collapse`
    props), wrapped in a flex container _inside_ the real `<td>` — making the td
    itself a flex container would break our fixed table-layout column widths.
  - The chevron draws the ui-icon `Chevron` glyph and rotates 90° when expanded.
    Upstream rotates the button via `transform`; we use the `rotate` shorthand to
    match our `TreeView` chevron idiom and, as elsewhere in our codebase, omit the
    RTL branch.
  - Tree-column cells indent by nesting depth: a leaf reserves the chevron's
    footprint (`--treeColumnPadding` 36 vs 16) so its content lines up with
    sibling rows that show a chevron, and each level adds `--indent` (16) via the
    cell's `paddingStart` calc, reading the `--table-row-level` the headless row
    already sets.

  Flat (non-tree) tables are unchanged: the chevron and the indentation calc only
  engage for `isTreeColumn` cells, so `paddingStart` stays at the existing 16.

- 394f4da: TableView now mirrors React Spectrum S2's focus-ring overlay geometry.

  Focused rows publish the upstream `--topFocusRing` and `--bottomPosition` custom
  properties and draw the raw row `::after` focus indicator. Focused headers, body
  cells, selection cells, and editable cells render the presentational
  `CellFocusRing` child, so non-first body cell focus rings overlap the divider
  above by 1px like upstream.

- 6381499: Align Toast queue/viewer behavior, dismiss labeling, and Solid S2 button text-slot handling with upstream parity.
- 75a40f6: Only render the toast stack "Show all" expand affordance when a `ToastContainer`
  provides the expand/collapse context. A bare `ToastRegion` (the low-level
  region, which has no container context) previously rendered a "Show all" button
  whose press handler was a no-op, so the collapsed stack could never expand.
  `Toast` now gates the affordance on a `canExpand` flag that `ToastRegion` sets
  from the presence of a `ToastContainer` — mirroring the upstream split where the
  S2 `ToastContainer`, not the low-level region, owns stack expansion.
- cfc0432: Let styled ToastRegion callers own viewport placement so Solid Spectrum Toasts center from the full viewport instead of inheriting headless inline geometry.
- e63d870: Toast: animate enter/exit/restack via the View Transitions API (port of the S2 toast animations)

  Previously our S2 `Toast` set `translate`/`opacity` instantly, so adding,
  removing, expanding, or restacking toasts snapped into place with no animation.
  Upstream `@react-spectrum/s2` animates every queue mutation through the View
  Transitions API, with a `prefers-reduced-motion` fallback. This ports that
  faithfully across two layers:
  - **`solid-stately`** — `ToastQueue` gains a generic `wrapUpdate(fn, action)`
    hook (mirroring `@react-stately/toast`), where `action` is the `ToastAction`
    (`'add' | 'remove' | 'clear'`) that triggered the update. The new visible
    toasts are still computed synchronously; only the subscriber fan-out that
    drives the re-render runs inside `wrapUpdate`, so it can be wrapped in a view
    transition without changing what the queue resolves to. A `setWrapUpdate`
    method lets a shared queue (e.g. the global one) attach the wrapper after
    construction. With no wrapper installed the queue notifies exactly as before.
  - **`solid-spectrum`** — `ToastContainer` installs a `wrapUpdate` that runs each
    global-queue mutation, plus stack expand/collapse, inside
    `document.startViewTransition()` (the queue mutation is applied via Solid's
    `batch` so the post-state is captured synchronously, the analog of upstream's
    `flushSync`). It adds a `toast-<action>` class to `<html>` so the injected CSS
    can target the transition, tracks `prefers-reduced-motion` (with a
    `PRIVATE_forceReducedMotion` test hook) into the reduced-motion path, and
    tags each toast with a `view-transition-name` / `view-transition-class`
    matching upstream — the numeric queue keys are prefixed (`toast-<key>`) so they
    are valid CSS idents, and background stack toasts gain a per-index suffix under
    reduced motion so the list cross-fades instead of sliding. The upstream
    `Toast.module.css` keyframes, `::view-transition-group()` rules, and global
    `html.toast-*` selectors — none of which the atomic `style()` macro can
    express — are injected once at runtime as a guarded `<style>`, the same idiom
    `solidaria` already uses for `createPress` / `createPreventScroll`.

  Where the View Transitions API is unavailable (SSR, jsdom, older browsers) the
  mutation runs synchronously, so behavior is unchanged.

- 6588833: TreeView: dim disabled rows with the high-contrast-aware color from the latest S2 designs

  Our S2 `TreeView` already applied `disabledBehavior` and a disabled content
  color, but it diverged from upstream `@react-spectrum/s2` in Windows High
  Contrast Mode: the disabled color had no `forcedColors` fallback, and the
  expand/collapse chevron set its own `neutral-subdued` color instead of
  inheriting the row's. This ports upstream's `treeCellGrid` / `expandButton`
  colors faithfully:
  - the merged row/cell color now carries `isDisabled: { default: 'disabled',
forcedColors: 'GrayText' }` (so disabled labels dim too, not only the
    description — previously a disabled label kept the enabled `neutral-subdued`
    color because the label `inherit`s a row color that had no disabled branch),
    plus the `forcedColors: 'ButtonText'` base and the `selectionStyle.highlight`
    `forcedColors: 'HighlightText'` that upstream sets on `treeCellGrid`;
  - the disabled description color gains the matching `forcedColors: 'GrayText'`;
  - the chevron defaults to `inherit` (tracking the row's text color) and its
    disabled color gains `forcedColors: 'GrayText'`.

  Behavior outside High Contrast Mode is unchanged apart from disabled labels now
  dimming to the same `disabled` color as disabled descriptions.

- 7fcb1d6: Virtualizer: virtualize collections that scroll with the page (port of react-aria-components 1.18 window scrolling)

  React Aria's `ScrollView` does not assume a virtualized collection has its own
  scroll container. It computes the visible rect as the intersection of the scroll
  view's content size with the browser window viewport, tracking how far the scroll
  view has been pushed above the viewport by page (or ancestor) scrolling. React
  Aria Components enables this by default — `CollectionRoot` hard-codes
  `allowsWindowScrolling: true` — so a `ListBox`, `Table`, `Tree`, etc. rendered at
  its natural height inside a normally scrolling page still only mounts the rows
  that are actually on screen.

  Previously our `Virtualizer` measured only its own element: the visible window
  was the element's `clientHeight` and the offset was the element's `scrollTop`. A
  collection that grew to its full height and scrolled with the page therefore
  rendered every row, defeating virtualization.

  The `Virtualizer` now mirrors upstream:
  - The effective viewport height is the scroll view's height intersected with the
    window viewport (`max(0, min(elementHeight - viewportOffset, window.innerHeight))`).
  - The visible-range offset is the element's own scroll position plus
    `viewportOffset` — how far the scroll view's top edge sits above the window
    viewport, derived from `getBoundingClientRect()`.
  - A single document-level capturing `scroll` listener updates the local scroll
    position when the scroll view itself scrolls, and the window offset when an
    ancestor or the page scrolls, matching `ScrollView`'s capturing listener.

  A new `allowsWindowScrolling` prop (default `true`) opts out: set it to `false`
  to restrict virtualization to the element's own scroll container, which is the
  previous behavior. An explicit `viewportSize` layout option still takes
  precedence over the measured window viewport.

  For a fixed-height collection that sits entirely within the viewport this is
  behavior-preserving — the `window ∩ element` math reduces to the element's own
  scroll — so existing collections are unaffected unless they actually scroll with
  the page.

  Two parts of upstream `ScrollView` are intentionally left as follow-ups and do
  not affect window-scroll correctness: the `isScrolling` state (which toggles
  `pointer-events: none` on the content while scrolling) and the imperative
  `scrollToItem`/`scrollToRect` API.

- d0ae46e: Regenerate the S2 workflow icons against the vendored upstream (T-22). Copies the 8 icons that landed upstream since the last sync — `ArrowCurvedIcon`, `ArrowUpSendIcon`, `BookmarkSingleFilledIcon`, `PremiumIconIcon`, `StopProcessingIcon`, `ZoomFitToHeightIcon`, `ZoomFitToScreenIcon`, `ZoomFitToWidthIcon` — and reruns the icon codegen, bringing the `s2wf-icons` set to 410. Each is exported from the `s2wfIcons` namespace.
- Updated dependencies 597a1b7:
- Updated dependencies bc4b395:
- Updated dependencies 1e480e9:
- Updated dependencies bcf6826:
- Updated dependencies 1fb52f6:
- Updated dependencies c0a8ec9:
- Updated dependencies 6e1d7bb:
- Updated dependencies 83c9a6f:
- Updated dependencies 5bc7d29:
- Updated dependencies d99d486:
- Updated dependencies 69d7ee4:
- Updated dependencies 1a55ba7:
- Updated dependencies 71e1220:
- Updated dependencies a4cbc85:
- Updated dependencies 47e25bd:
- Updated dependencies b4fa490:
- Updated dependencies 535be08:
- Updated dependencies 58a62d5:
- Updated dependencies 7de4ea8:
- Updated dependencies a6aa0af:
- Updated dependencies d03dac4:
- Updated dependencies b0da42f:
- Updated dependencies b4fa490:
- Updated dependencies 64c454e:
- Updated dependencies d9e36f3:
- Updated dependencies ad5d929:
- Updated dependencies 18ec24f:
- Updated dependencies cd0219b:
- Updated dependencies 9645db5:
- Updated dependencies 5a741e0:
- Updated dependencies 7b221a4:
- Updated dependencies 220ba68:
- Updated dependencies 3b20e14:
- Updated dependencies 5db5585:
- Updated dependencies 7e7fe8c:
- Updated dependencies 92c0cc2:
- Updated dependencies aee055a:
- Updated dependencies 4d7f2c1:
- Updated dependencies 7c1708c:
- Updated dependencies 229dbed:
- Updated dependencies f7df649:
- Updated dependencies 1896fe4:
- Updated dependencies cc47204:
- Updated dependencies 6b50770:
- Updated dependencies 58904aa:
- Updated dependencies ebb1a3c:
- Updated dependencies 5e6c0b8:
- Updated dependencies 30512d3:
- Updated dependencies ddd697d:
- Updated dependencies b113196:
- Updated dependencies 608a401:
- Updated dependencies c2b8c5e:
- Updated dependencies f658a4c:
- Updated dependencies 7fcc93e:
- Updated dependencies 649371e:
- Updated dependencies b0a822c:
- Updated dependencies f7c038d:
- Updated dependencies 228f14a:
- Updated dependencies 736ad7d:
- Updated dependencies 6381499:
- Updated dependencies 389f600:
- Updated dependencies cfc0432:
- Updated dependencies e63d870:
- Updated dependencies 8cc7ecc:
- Updated dependencies 727b16b:
- Updated dependencies 2befbed:
- Updated dependencies dfd4d37:
- Updated dependencies 6d2dbfa:
- Updated dependencies 430a55f:
- Updated dependencies 2fc94b6:
- Updated dependencies 7fcb1d6:
  - @proyecto-viviana/solidaria@0.4.0
  - @proyecto-viviana/solid-stately@0.4.0
  - @proyecto-viviana/solidaria-components@0.4.0

## 0.5.4

### Patch Changes

- 3a740bb: Fix TextField label hydration during SSR and republish the Viviana UI package chain against the fixed components.
- Updated dependencies 3a740bb:
  - @proyecto-viviana/solidaria-components@0.3.3

## 0.5.3

### Patch Changes

- Expose button, provider, form, input, segmented control, switch, and icon component subpaths for direct Viviana UI imports.

## 0.5.2

### Patch Changes

- [`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Keep Button and ActionButton dynamic aria trigger props reactive, and export BellIcon from the root Spectrum/Viviana surface.

- Updated dependencies [[`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327)]:
  - @proyecto-viviana/solidaria-components@0.3.2

## 0.5.1

### Patch Changes

- Updated dependencies []:
  - @proyecto-viviana/solidaria-components@0.3.1

## 0.5.0

### Minor Changes

- [`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Build with tsdown (Rolldown/Oxc) and adopt the standard Solid-library
  JSX-preserve layout.

  The `solid` export condition now resolves to a built, JSX-preserved `dist/*.jsx`
  entry that the consumer compiles per-environment, alongside a compiled
  `dist/*.js` `default` fallback — replacing the dual DOM+SSR bundle (whose SSR
  half was never wired into `exports`). SSR consumers can now resolve the packages
  from `node_modules` without recompiling first-party source. solid-spectrum's
  `style()` macro still runs at build time (emitting `styles.css`), so consumers
  don't need the macro plugin. viviana-ui ships its first real dist (a thin
  re-export of solid-spectrum).

### Patch Changes

- Updated dependencies [[`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a)]:
  - @proyecto-viviana/solidaria-components@0.3.0
  - @proyecto-viviana/solid-stately@0.3.0
  - @proyecto-viviana/solidaria@0.3.0

## 0.4.2

### Patch Changes

- [#34](https://github.com/proyecto-viviana/proyecto-viviana/pull/34) [`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611)]:
  - @proyecto-viviana/solid-stately@0.2.7
  - @proyecto-viviana/solidaria@0.2.8
  - @proyecto-viviana/solidaria-components@0.2.9

## 0.4.1

### Patch Changes

- [#29](https://github.com/proyecto-viviana/proyecto-viviana/pull/29) [`e19344c`](https://github.com/proyecto-viviana/proyecto-viviana/commit/e19344ca740ae3db4d6a990caa465b5093704288) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.

- [#32](https://github.com/proyecto-viviana/proyecto-viviana/pull/32) [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`e19344c`](https://github.com/proyecto-viviana/proyecto-viviana/commit/e19344ca740ae3db4d6a990caa465b5093704288), [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76)]:
  - @proyecto-viviana/solidaria-components@0.2.8
  - @proyecto-viviana/solid-stately@0.2.6
  - @proyecto-viviana/solidaria@0.2.7

## 0.4.0

### Minor Changes

- Refactor theme.css: update dark mode palette from void-black to blue-grey tinted aesthetic. Add new CSS custom properties (primary-dim, accent-dim, header-bg, glow effects, fusion-glow, semantic bg tints) with light-mode overrides. This is the canonical source of truth for colors across all apps.

### Patch Changes

- e19344c: Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.
- Updated dependencies [e19344c]
  - @proyecto-viviana/solidaria-components@0.2.6
