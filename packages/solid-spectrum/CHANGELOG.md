# @proyecto-viviana/solid-spectrum

## 0.8.0-rc.0

### Minor Changes

- 163f437: Compile, pack, and consume the public packages on Solid 2 (`solid-js` / `@solidjs/web` 2.0.0-rc.9, `@solidjs/vite-plugin` 3.0.0-next.44). Consumers must use `@solidjs/web` as `jsxImportSource` and spread `[...solid({ ssr: true })]`.

### Patch Changes

- 1a03671: ActionButton resolves `isDisabled` through the Form proxy, so `<Form isDisabled>` disables it and a `Skeleton` disables it even when it sets `isDisabled={false}`, as upstream does. An enclosing `ActionButtonGroup` stays the last resort, below the button's own prop, matching S2's `isDisabled={props.isDisabled ?? group.isDisabled}`, and a `NotificationBadge` inside the button greys out with it.

  ToggleButton reads the same way inside a `MenuTrigger`: the trigger no longer forces `isDisabled` over the Form or a `Skeleton`, and it stays below the button's own prop, so `<MenuTrigger isDisabled><ToggleButton isDisabled={false}>` opts out as upstream's does.

- 748070a: Breadcrumbs no longer seeds its overflow-measurement signal from `window`, so the client's first render matches the server's and the hidden measurement copy arrives in a post-hydration update instead of throwing `Hydration Mismatch. Unable to find DOM nodes for hydration key`.
- 7e93d23: Button, ActionButton, ToggleButton and LinkButton take their size (and the other Form props) from an enclosing `Form`. The size default no longer hides the Form's value, and ActionButton, ToggleButton and LinkButton now read the Form at all, as upstream does.
- c8e9e2a: ButtonGroup re-measures overflow when its children change, not only when a box resizes.
- 6e43c43: Calendar and RangeCalendar: the root no longer sets its own `color-scheme` from the provider variable. Upstream's `calendarStyles` inherit the scheme from the surrounding tree, as every non-overlay S2 component does; ours reset it to `var(--s2-color-scheme)`, so a calendar outside its Provider's subtree (a copied or detached node) resolved light ink on a dark ground.
- d33fefd: Size ComboBox checkmarks with the S2 token map instead of inline CSS pixels.
- b33a0a7: Drive ComboBox field-group focus-visible from the group's own keyboard modality, matching RAC Group, instead of copying the input ring.
- b33a0a7: Port S2 ComboBox loadingState: field spinner, list loadingMore, and table.loading empty text.
- d33fefd: Keep the ComboBox list open on input focus when menuTrigger is focus.
- b33a0a7: Keep ComboBox and Picker overlay options on one focus-visible answer, as RAC `ListBoxItem` hands the same value to `listboxItem` and `checkmark`: the row fill, the row ink and the selected checkmark all read what the option hands them, and `comboBoxCheckmark` stays plain `baseColor('accent')` with no `isFocused` variant of its own. That answer now comes from the headless live modality read, so an assistive-technology click and `element.click()` show the focus ring and a real mouse click does not.
- b33a0a7: Keep ComboBox option aria-labelledby pointing at the label slot after keyboard focus moves.
- 60d218a: Provide S2 ComboBoxItem and PickerItem Icon/Avatar/Text slot contexts, including Picker SelectValue providers.
- 686911d: Provide S2 ComboBox/Picker listbox Header, Heading, and description slot contexts.
- be6b2ca: Drop invented ComboBox and Picker listbox margin, padding, and list-style so the style map matches S2 `listbox`.
- b33a0a7: Render ComboBox empty state inside the listbox via `renderEmptyState`, matching RAC ListBox / S2 ComboBox.
- d3ccc7c: ContextualHelpTrigger builds its help and info icons inside components instead of binding them to module-scope `const`s. A module-scope JSX value is built when the module is evaluated: on a server that has already rendered a page, it reaches `ssrHydrationKey()` with no owner and throws `getNextContextId cannot be used under non-hydrating context`, so the whole menu module fails to evaluate and every route that imports anything from it serves an empty document with HTTP 200 — twenty of the docs app's 174 routes. In the browser the same binding is one DOM node shared by every trigger on the page, so a second trigger takes the first one's icon. Upstream renders its icon inside `UnavailableIconWrapper` for the same reason.
- 76f0e26: Honor ListLayout `estimatedRowHeight` and `padding`, observe measured row size, and position VirtualizerItem from layoutInfo. ComboBox and Picker listboxes match S2 `padding: 0` so the 8px inset lives in the layout, not CSS.
- b33a0a7: Name Menu and ActionMenu popover dialogs from the trigger via aria-labelledby, as RAC MenuTrigger does.
- c218a34: Keep ComboBox, Select, and ListBox option render-prop trees mounted across focus, and make generated ui-icon `class` reactive so the selected checkmark can toggle visibility without remounting the SVG.
- d2f9453: Toast: run the queue update inside the view transition instead of returning it.
  `startViewTransition` passed `() => fn` to `document.startViewTransition`, so the
  callback returned the mutation without calling it and no toast ever rendered in
  a browser with the View Transitions API. Both packages now mirror upstream S2's
  `() => flushSync(fn)` with Solid 2's `flush(fn)`, which drains the queue before
  the browser snapshots.
- d72df86: Apply S2 ui-icon token width/height on each generated asset and stop wrapping bare ui-icons with an invented flex-shrink. ComboBox Menu.checkmark no longer duplicates that size map.
- 44aa6fb: Stop createUIIcon from consuming IconContext. S2 ui-icons never pass through Icon.tsx, so ComboBox/Picker/Menu checkmarks stay raw svgs in the checkmark grid cell instead of inheriting the item IconContext wrapper.
- 7e7936d: Treat an untrusted `detail: 0` click as virtual interaction modality, as react-aria does, so an assistive-technology click and `element.click()` show a focus ring. The modality now notifies tracked readers only on keyboard, pointer-down, virtual focus and virtual click, never on a bare move. An option's focus-visible answer is now the live modality read `useOption` makes: the option is focused, the collection is focused, and the global modality is not pointer. ComboBox and Picker options take that answer from the option render props; a real mouse click stays pointer and does not paint the focus ring.
- Updated dependencies b33a0a7:
- Updated dependencies f3df1f1:
- Updated dependencies b33a0a7:
- Updated dependencies 69880d0:
- Updated dependencies b33a0a7:
- Updated dependencies 6399ea7:
- Updated dependencies 6e4840a:
- Updated dependencies b33a0a7:
- Updated dependencies b33a0a7:
- Updated dependencies 6c096b3:
- Updated dependencies b33a0a7:
- Updated dependencies b33a0a7:
- Updated dependencies 4bbdeff:
- Updated dependencies ef21edf:
- Updated dependencies eb75ee0:
- Updated dependencies 70a8d47:
- Updated dependencies 81affe3:
- Updated dependencies 7fe157e:
- Updated dependencies d77c494:
- Updated dependencies d0f095a:
- Updated dependencies 26ed035:
- Updated dependencies 096776d:
- Updated dependencies 76f0e26:
- Updated dependencies b33a0a7:
- Updated dependencies f13fd34:
- Updated dependencies 344e86d:
- Updated dependencies e6384f3:
- Updated dependencies 31bf358:
- Updated dependencies c218a34:
- Updated dependencies 870781a:
- Updated dependencies 6ad3d12:
- Updated dependencies 8bd07d6:
- Updated dependencies 39fb2b1:
- Updated dependencies 6e59ec1:
- Updated dependencies 0666ab9:
- Updated dependencies 5c8141e:
- Updated dependencies 495582e:
- Updated dependencies 413b2f2:
- Updated dependencies 163f437:
- Updated dependencies 2d0612e:
- Updated dependencies 002ea40:
- Updated dependencies 7e7936d:
- Updated dependencies 49efef8:
- Updated dependencies 41062bd:
- Updated dependencies 3f4f11b:
  - @proyecto-viviana/solidaria@0.6.0-rc.0
  - @proyecto-viviana/solid-stately@0.6.0-rc.0
  - @proyecto-viviana/solidaria-components@0.7.0-rc.0

## 0.7.0

### Minor Changes

- e92413b: Make ListBoxItem and ComboBoxItem the canonical names. ListBoxOption and ComboBoxOption stay as deprecated aliases.
- 8eb850f: Deprecate TabSwitch as a mapping wrapper over SegmentedControl. Migrate to SegmentedControl; TabSwitch is removed in a following breaking release.
- d4bfed2: Remove MenuButton from the RAC and S2 barrels. Compose MenuTrigger + Button, and keep the ui-package helper as a documented local addition.

  ```tsx
  <MenuTrigger>
    <Button>Actions</Button>
    <Menu>{/* items */}</Menu>
  </MenuTrigger>
  ```

### Patch Changes

- 0847c61: Do not copy pending ActionButton string children onto aria-label, matching S2.
- 3670691: Keyboard pickup drags every selected collection key. ActionBar enter holds the full translate for a paint, and announces only with scrollRef. Tree/List/CardView ActionBars follow live renderActionBar. Card href, isDisabled, size, and CardView grid packing match S2.
- 6a0af4d: Read Tab, ComboBox option, Picker item, StatusLight, and Kumo Button children once so hydration keys stay aligned.
- 41bc489: Align TabPanel sequential focus with React Aria. `createTabPanel` now returns
  `tabIndex: undefined` when a selected panel contains a tabbable descendant,
  widening the public prop type from `number` to `number | undefined`; panels
  without a tabbable descendant retain `tabIndex: 0`.
- ff895cc: GridList intra-row arrows, labelledby, and TableView live density, column min/max, Ctrl+A, and disabled skip match RAC.
- 1d988fd: Route Select and ComboBox field wiring through createField so description and error ids exist only when those slots render, and stop the styled layers from minting a parallel describedby path. HelpText now renders the RAC Text / FieldError slots the way S2 does.
- b038814: Compile ICU messages once in the headless string formatter. Catalog JSON stays verbatim; the dnd and S2 catalogs no longer compile locally.
- 088e048: ContextualHelp follows live placement and omits aria-haspopup; Dialog applies the trigger overlay id and S2 footer paddingTop 32.
- 87da0f7: NumberField announces focused value changes and omits aria-required under native validation. TextField, SearchField, Checkbox, DateField, and ColorField set native custom validity. Field ContextualHelp stays mounted and named. Checkbox ignores Enter and resizes the checkmark live. Switch live disabled paints data-disabled. ColorField PageUp/wheel match RAC and hex is uppercase.
- b90bece: DatePicker calendar popover matches S2 multi-month width, min/max paging, locale field segments, and Next/Previous focus plus grid names.
- 9129471: Match S2 RangeCalendar start/end `isFocusVisible` fills and apply the selected overlay-open fill after first paint, so DatePicker/DateRangePicker D2 open-enter records the same 150 ms 700→600 cell transition as React.
- 81237ca: Stop nested DatePicker trigger presses from focusing a field segment, and restore `data-pressed` on the DateRangePicker calendar button. `createPress` now stopPropagates an already-pressed pointerdown the way RAC `usePress` does; S2 `calendarButton` takes live `isPressed` from render props like `inputButton`.
- b90bece: DateRangePicker popover matches S2 FieldGroup anchoring, cell-gap width, keyboard range-start focus, min/max cell names, localized Dismiss, and a single-row time layout.
- f9b31aa: Add the exact upstream Adobe license header and source path to each reviewed
  Solid port. Keep the applicable Microsoft Tabster notice for the shadow-tree
  port. Remove three unused Solidaria state copies; the public exports already
  use the implementations from Solid Stately.

  Record exact S2 and flags source paths, and replace their local Adobe blocks
  with the exact headers from the pinned upstream files.

  Preserve exact source headers in runtime bundles and declaration-only outputs
  for all five Adobe-derived packages. Emit declaration maps so type-only source
  files stay connected to their published output.

  Replace four ambiguous source notes with exact primary paths, and apply their
  upstream Adobe headers.

  Classify the remaining styled-package source markers as four exact source
  adaptations and two guarded Toast composites.

  Record Grid State as a reviewed headerless exact mapping after checking its
  upstream form at the local port date and the pinned revision.

  Preserve each distinct upstream Adobe block and every exact source path in the
  27 reviewed composite ports.

  Regenerate both styled packages' S2 UI and workflow icons from pinned shipped
  modules. Record exact generator inputs and reject stale, missing, or unexpected
  generated output before release builds.

- 6a0af4d: Export `./package.json` from the package maps so exhaustive resolvers can read the manifest.
- ead40e9: Export remaining solid-spectrum subpaths so consumers can deep-import barrel names without loading the package root.
- 0847c61: Recover styled package types after the flags-split merge.
- 5fb9d99: Form validationBehavior="aria" no longer leaves native required on S2 TextField.
- 0847c61: Chain context and local event handlers in styled merges instead of last-wins.
- 5224b7f: Re-read popover dismiss, Icon, and hidden-select after mount so later values are not frozen at setup.
- ff895cc: Menu Popover contains Tab like RAC, createMenu wraps by default, and live direction/align updates overlay placement.
- a2cf9f0: Match the pinned React Aria and React Spectrum menu-trigger behavior.

  Menu triggers now preserve first-item and last-item focus strategies. They also
  match press timing, localized long-press instructions, disabled input,
  context-menu activation and positioning, and the S2 long-press affordance.

- 5b0f4f6: Wire Meter labels through the shared headless Label context. Styled Meters now
  use the headless Meter and preserve explicit accessible-name precedence.
- fa7d78d: Import the narrow solidaria subpaths from the Provider, ProgressBar and
  ProgressCircle sources instead of the `@proyecto-viviana/solidaria` root barrel.
  An app that rendered only a `Provider` resolved the entire primitive surface
  (90 solidaria modules) before rendering a single primitive; it now resolves 17.
  No public API changes. `guard:entry-import-budget` holds the new ceilings.
- 3670691: HelpText follows live isInvalid from field context. NumberField PageUp/PageDown step once, the focused input wheels, and steppers repeat while held.
- 9156bc6: NumberField calls createFormValidation and native min/max/step validity so isInvalid and out-of-range values block submit, matching RAC useNumberField.
- 8e50934: Read Table, BreadcrumbItem, and TreeItemContent children once; allocate the Breadcrumbs measure id with createUniqueId; discard fonts.ready thenables explicitly.
- 7af9af0: ComboBox and Picker list selected checkmarks match S2 focused accent stops after a pointer open. ComboBox options align `isFocusVisible` to the focused row so pointer-open matches S2's spread `listboxItem` classes; the checkmark still takes `{ isSelected, isFocused, size }` only.
- 03aa4cf: Own compound Button and ActionButton pending props before interaction handlers
  run. A compound `isPending={a() && b()}` compiles to a prop getter that creates
  a memo on every read, so resolving it from a native press or hover handler
  created that computation with no owner: Solid warned and never disposed it.
- a2447e1: Drop invented `data-open` from the Picker trigger chevron so the glyph matches S2.
- ff895cc: Overlay mouse-open focuses the Picker dialog; the selected option keeps roving tabindex without taking DOM focus.
- 179e19c: Own Popover enter/exit animation in the headless Popover as RAC does (`data-entering` / `data-exiting`, mount until exit `getAnimations().finished`), drive S2 opacity/translate from those render props, and delete the ActionMenu timers and DatePicker duplicate animation machines.
- f952b16: Preserve accurate source maps when the package build removes generated macro
  CSS imports from JSX output. Package builds now fail if a transform reports a
  broken source map.
- 1af6eb7: Stop nonessential Button and ActionButton hover and press transitions when reduced motion is requested, while preserving the normal 150 ms interaction transitions and the upstream-compatible pressed transform geometry.
- abafbd4: Keep direct reactive Button text children live after hydration, and keep
  authored workflow icons hidden when Button pending state becomes visible.
- 2e83cdb: Keep direct reactive children live in ComboBox option, Picker item, StatusLight,
  and Kumo Button: the single children read is a tracked memo, so hydration keys
  stay aligned and `{label()}` content follows its signal.
- 649852a: Absorb S2 1.7.0 icon `1lh` sizing, vertical ActionButtonGroup width, color-scheme media query, and CloseButton overlay contrast. Regenerate the icon inventory from the 1.7.0 pin (Tag workflow icon geometry follows upstream).
- 38b18a3: Synchronize the shared style-macro and typography foundation with the pinned React Spectrum S2 1.6 oracle, including the `16` class postfix, prose cascade-layer reservation, conditional font weights, and reusable typography maps.
- a9bfb8d: Match Spectrum 2 Dialog by copying the RAC description slot onto ContentContext so AlertDialog's Content is the accessible description.
- 8f5245e: Wrap the ComboBox and Picker popover listboxes in Virtualizer with ListLayout and the S2 loader-row height table, so options publish aria-posinset/aria-setsize the way Spectrum 2 does.
- a61a020: Compose the Spectrum 2 Popover in ComboBox, Picker, Menu, ActionMenu, and TabsPicker so overlay surface and enter/exit motion come from one style source, matching S2.
- 9829314: Port the full S2 intl catalog (34 locales, 47 keys) and route styled English literals through `createStringFormatter(s2IntlStrings, "@react-spectrum/s2")`.
- 72ec915: Resolve SegmentedControl item children inside the icon provider so workflow
  icons inherit the Spectrum slot, baseline wrapper, and matching item geometry.
- 146d06a: Ship each package's local MIT license and its applicable upstream license or
  notice in the published archive. Correct the project attribution list to
  include the Spectrum-derived part of `@proyecto-viviana/ui`, and guard all six
  package manifests and license files before release.
- 6a0af4d: Point CSS `default` export conditions at the built `dist/` sheets instead of the `src/` stubs.
- 0847c61: Pin `@adobe/spectrum-tokens` 14.15.0 to match React Spectrum S2 1.7.0.
- 507411a: Select a completed StepList step on click and Enter through DefaultStep `setSelectedKey`. Space stays a no-op; DefaultStep does not wrap HeadlessStep.
- 91c7991: Match RAC Select All state transitions. The shared grid state now recognizes an
  explicit full selection and can deselect a row from the `"all"` selection. The
  native checkbox also reapplies `indeterminate` after `checked` writes so
  Chromium keeps `[checked=mixed]`.
- 8ab06db: TagGroup matches RAC selection, remove-focus, Tab, Escape, Ctrl+A, onAction, and keyboard focus rings. TreeView typeahead, collapse focus, intra-row arrows, Shift+Arrow extend, Tab out, and no sibling expand on *. Collection last-in-level drop indicators skip content nodes. ListView no longer treats a Show accessor as always-true.
- 5b0f4f6: TextField paints native validation after a blocked required submit from displayValidation, matching RAC useTextField.
- 18257e5: Match RAC ToastContent: the toast message is `role="alert"` (aria-atomic, hidden until mounted). S2 and Viviana render the headless ToastContent instead of a raw div.
- 5634db2: ActionMenu passes autoFocus to the headless Button. Link keeps its derived tag last so a stray tag cannot redirect the element.
- 52ab0c5: Make Virtualizer context-only as RAC does: the collection element is the scroller, CollectionRoot owns the scroll view and a single content div, and the extra `[data-virtualizer]` wrapper is gone.
- Updated dependencies 30d22af:
- Updated dependencies db6ac74:
- Updated dependencies 38b18a3:
- Updated dependencies 15746be:
- Updated dependencies 8e40905:
- Updated dependencies ad4f303:
- Updated dependencies e92413b:
- Updated dependencies 3670691:
- Updated dependencies c794444:
- Updated dependencies facd76e:
- Updated dependencies f5ae7b1:
- Updated dependencies 34bc0eb:
- Updated dependencies 41bc489:
- Updated dependencies 668845d:
- Updated dependencies b15a04b:
- Updated dependencies ff895cc:
- Updated dependencies ff895cc:
- Updated dependencies e84eeb1:
- Updated dependencies 74d4282:
- Updated dependencies ff895cc:
- Updated dependencies 1d988fd:
- Updated dependencies b038814:
- Updated dependencies 088e048:
- Updated dependencies 6de6aa8:
- Updated dependencies 87da0f7:
- Updated dependencies b90bece:
- Updated dependencies 9129471:
- Updated dependencies 81237ca:
- Updated dependencies b90bece:
- Updated dependencies 0ea2ca7:
- Updated dependencies f9b31aa:
- Updated dependencies 6a0af4d:
- Updated dependencies 08d94a4:
- Updated dependencies 67a6659:
- Updated dependencies 67a6659:
- Updated dependencies 5fb9d99:
- Updated dependencies 6a933af:
- Updated dependencies b7257bc:
- Updated dependencies bd85197:
- Updated dependencies 38b18a3:
- Updated dependencies 5eb22cd:
- Updated dependencies e97bb6f:
- Updated dependencies ff895cc:
- Updated dependencies 1ea67d3:
- Updated dependencies 5224b7f:
- Updated dependencies 622175f:
- Updated dependencies 8e50934:
- Updated dependencies 0e2b70f:
- Updated dependencies ff02dc0:
- Updated dependencies ff895cc:
- Updated dependencies 9ec33c6:
- Updated dependencies ff895cc:
- Updated dependencies 668845d:
- Updated dependencies a2cf9f0:
- Updated dependencies 5b0f4f6:
- Updated dependencies ff895cc:
- Updated dependencies 3670691:
- Updated dependencies 9156bc6:
- Updated dependencies 8e50934:
- Updated dependencies 67a6659:
- Updated dependencies f390cc3:
- Updated dependencies 03aa4cf:
- Updated dependencies d13ac37:
- Updated dependencies ff895cc:
- Updated dependencies 179e19c:
- Updated dependencies b790e84:
- Updated dependencies b90bece:
- Updated dependencies 6383939:
- Updated dependencies 03edb8e:
- Updated dependencies 72cf23f:
- Updated dependencies 829fd40:
- Updated dependencies eefb351:
- Updated dependencies cdbd580:
- Updated dependencies 8e40905:
- Updated dependencies e97bb6f:
- Updated dependencies 7b1e706:
- Updated dependencies cbf06ac:
- Updated dependencies 49b825e:
- Updated dependencies d4bfed2:
- Updated dependencies 38b18a3:
- Updated dependencies e1b0fdf:
- Updated dependencies 51c9a10:
- Updated dependencies a149d53:
- Updated dependencies e966ba5:
- Updated dependencies 61f82d7:
- Updated dependencies 38b18a3:
- Updated dependencies 8e40905:
- Updated dependencies 6852386:
- Updated dependencies ab9a432:
- Updated dependencies 38b18a3:
- Updated dependencies 146d06a:
- Updated dependencies 9281d46:
- Updated dependencies 9ec33c6:
- Updated dependencies 8dfbbbd:
- Updated dependencies b90bece:
- Updated dependencies 1a02e88:
- Updated dependencies ca4c415:
- Updated dependencies 91c7991:
- Updated dependencies 842cfdc:
- Updated dependencies d91b34a:
- Updated dependencies 8ab06db:
- Updated dependencies 5b0f4f6:
- Updated dependencies 18257e5:
- Updated dependencies 7db95c5:
- Updated dependencies 5634db2:
- Updated dependencies 52ab0c5:
- Updated dependencies e7a5326:
- Updated dependencies 43d2aa2:
- Updated dependencies 38b18a3:
  - @proyecto-viviana/solidaria@0.5.0
  - @proyecto-viviana/solidaria-components@0.6.0
  - @proyecto-viviana/solid-stately@0.5.2

## 0.6.4

### Patch Changes

- 82965fe: Fix Form SSR hydration: do not reify `props.children` into FormContext.

  Solid's `props.children` is a create-on-read getter. Spreading full Form props into FormContext (safe in React Aria Components) double-created the child tree and desynced `createUniqueId` hydration keys — Form + sole Spectrum Button blanked consumer routes (effect-latam /perfil, /foros). Context now carries only `validationBehavior`. Spectrum / viviana-ui Form leave children as lazy headless props (no forced render-prop wrapper). Guarded by Form SSR + hydrate fixtures.

- a0f3cc8: Give every package the metadata npm renders.

  None of the five set `homepage` or `bugs`, so the npm page had no link to
  documentation and no way to report a problem. `homepage` now points at the docs
  site — https://ui.proyectoviviana.org — and `bugs` at the shared issue tracker.

  `@proyecto-viviana/ui` also had no keywords at all — it could not be found by
  search — and a description written for a maintainer rather than a user ("a
  reskinned fork of @proyecto-viviana/solid-spectrum: the styled top layer is
  duplicated and remapped to the Viviana v2 register"). It now says what the
  package is: the Viviana design system for SolidJS, accessible and themeable, on
  a headless ARIA foundation.

  `guard:outbound-links` checks all of it, so a new package cannot publish
  anonymously.

- 20fb616: Raise placeholder, secondary text, link, interactive-fill, and semantic bold-fill contrast across light and dark Viviana themes.

  Match React Aria's Select trigger naming when consumers provide `aria-label`, so the visible placeholder or selected value remains part of the computed accessible name.

- 2356117: Let `Flex` take an inline `style`, the way `Grid` already does.

  The same gap that was just closed in `@proyecto-viviana/ui`'s `Flex`, in the
  register that shipped it first. `Grid` splits `style` out of its props and merges
  it into the declarations it generates; `Flex` declared no such prop, so anything
  passed landed in `rest` and was then overwritten by the `style={flexStyle()}`
  assignment on the container — it vanished with no type error and no warning.

  `style` is now merged first and the derived flex declarations are applied after
  it, mirroring `Grid`'s ordering, so `direction`, `gap`, `wrap`, `alignItems` and
  `justifyContent` still win over a hand-written override of the same property.

- 71371d6: Correct the README's CSS import and refresh its parity evidence.

  The install example imported `styles.css`, but this package's `theme.css` is a
  stub and `components.css` is the file that carries the font faces alongside the
  generated rules — following the README left Geist unloaded. The README now
  imports `components.css`, says outright that the import is required (components
  inject no styles of their own), and notes that `font-faces.css` must precede
  other rules because CSS drops an `@import` that anything precedes.

  The "Current Parity Evidence" block was also two months stale, reporting 69
  catalogue entries with 33 live and 36 missing. The catalogue gap has since
  closed: 78 entries, 78 live on both sides. The only remaining export gap is the
  seven drag-and-drop and `LabeledValueContext` names, which are now listed
  explicitly instead of summarized as "80 missing".

- Updated dependencies 82965fe:
- Updated dependencies a0f3cc8:
- Updated dependencies 20fb616:
  - @proyecto-viviana/solidaria-components@0.5.1
  - @proyecto-viviana/solid-stately@0.5.1
  - @proyecto-viviana/solidaria@0.4.3

## 0.6.3

### Patch Changes

- eea8910: Restore the upstream `--lightningcss-light` / `--lightningcss-dark` space-toggle
  atoms in `setColorScheme`.

  lightningcss downlevels `light-dark()` ahead of time, so it cannot see a
  `color-scheme` supplied through a CSS variable and picks the wrong branch. S2
  carries these two transform atoms for exactly that case (and for a component
  compiled against an older S2 embedded in a newer provider); dropping them was a
  divergence from the pin, not a simplification.

- Updated dependencies eea8910:
- Updated dependencies eea8910:
  - @proyecto-viviana/solid-stately@0.5.0
  - @proyecto-viviana/solidaria-components@0.5.0
  - @proyecto-viviana/solidaria@0.4.2

## 0.6.2

### Patch Changes

- 95be403: Route component styling off invented Tailwind-style utility classes and through the S2 `style()`/`css()` macro so it ships as emitted atomic CSS to consumers. Field primitives, `Well`, `Separator`/`FieldError`/`Popover` chrome, `ClearButton`/`FieldButton`/`LogicButton`, `Modal`/`Tray`/`UIIcon`/`ListBox`/`Select`, the menu wrappers, `Flex`/`Grid` layout primitives, `ColorPicker`/`StepList`/`TabSwitch`, `ColorEditor`/`ContextualHelpTrigger`, landmark styling, and the story error boundary now emit their rules through the macro rather than relying on utilities that never shipped. No public export or API changes; the emitted CSS grows because previously-invented utilities are now real atomic rules.

## 0.6.1

### Patch Changes

- 8060dff: Keep TextField and TextArea public `onChange` callbacks string-only by preventing
  field-wrapper event leakage, with controlled and uncontrolled hydration coverage.
- 63dddb3: Bring DateField, TimeField, DatePicker, and DateRangePicker into upstream parity across state, ARIA, headless composition, and Spectrum styling. This release restores the segmented spinbutton and internationalized date-field behavior, composes the picker surfaces from their upstream component units, and adds strict React-versus-Solid regression coverage for observable behavior and appearance.
- Updated dependencies 515ed20:
- Updated dependencies 8060dff:
- Updated dependencies 63dddb3:
  - @proyecto-viviana/solidaria-components@0.4.1
  - @proyecto-viviana/solid-stately@0.4.1
  - @proyecto-viviana/solidaria@0.4.1

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

- e847071: ActionButton/ToggleButton: static-color text uses `transparent-overlay-1000`

  The shared static-color style (`s2ActionButtonStaticColor`) had
  `baseColor("transparent-overlay-800")` as its default text color; upstream S2
  uses a state-invariant `'transparent-overlay-1000'` (selected state is
  `'auto'`, disabled `'transparent-overlay-400'` — both already matched).
  Surfaced by the comparison app's staticColor contract test once the installed
  upstream deps were aligned to the pinned S2 1.5.1.

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

- 247990a: Button: static-color secondary/outline text uses `transparent-overlay-1000`

  Ported the S2 1.5.1 `Button.tsx` fix: under `staticColor`, the secondary-fill
  text color and the outline-fill default text color are now
  `transparent-overlay-1000` across default/hover/focus-visible/pressed states.
  Our port had `baseColor("transparent-overlay-800")` here (default -800 bumping
  to -900 on interaction), which matched neither the 1.5.0 value (`white`) nor
  the corrected 1.5.1 one — static-color buttons are deliberately state-invariant
  in upstream's fix.

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
- 0a99e94: Menu/ActionMenu: restore SR-operable focus + item descriptions (D5/D6 backfill)

  Three faithful parity fixes surfaced by adding the focus-trail (D5) and
  AX-tree (D6) pair-oracle drivers to the Menu/ActionMenu certifications:
  - **Roving tabindex** (`createMenu`): the menu container's `tabIndex` was
    hard-coded to `0`; upstream `useMenu` binds `focusedKey == null ? 0 : -1`.
    Restored as a getter that survives `mergeProps`, so real DOM focus follows
    `focusedKey` instead of leaving a phantom tab stop on the container.
  - **Item accessible description** (`createMenuItem` + `Menu` + solid-spectrum
    `menu`): menu items exposed no accessible description — the item's
    `aria-describedby` was stripped and the description/keyboard-shortcut elements
    never received ids. Restored via `createSlotId` (matching upstream
    `useSlotId`, so a description-less item drops the reference instead of
    dangling) with the ids threaded through the render-props data channel into the
    S2 `TextContext`/`KeyboardContext` slots. Shared `Text`/`Keyboard` untouched,
    so no field-family regression.
  - **Element-type parity**: the menu list/items render as `div`s (role-driven),
    matching upstream, instead of `ul`/`li`.

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

- 6a10baa: Pin `@adobe/spectrum-tokens` to exact `14.0.0` — the version the pinned
  upstream S2 (1.5.1) builds against. The previous `^14.5.0` range had drifted
  five minor releases ahead of the oracle: 357 of the token values our style
  macro consumes differed from what upstream ships, silently diverging rendered
  colors. A new `guard:spectrum-tokens-pin` fails the gate ladder if the
  declared, installed, and pinned-oracle versions ever disagree again.
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
- Updated dependencies 0a99e94:
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
