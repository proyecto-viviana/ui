# Lens 4b — Site Code Examples Compilation & Exports Audit

## Coverage

### Examined
- **Routes Scope:** All 142 route files under `apps/web/src/routes/**/docs/**`:
  - `apps/web/src/routes/docs/components/*.tsx` (84 component API reference wrapper routes delegating to `ApiReference`)
  - `apps/web/src/routes/docs/index.tsx` and `apps/web/src/routes/docs/route.tsx`
  - `apps/web/src/routes/solid-spectrum/docs/**` (50 files: 44 component docs, 2 hook docs, `index.tsx`, `installation.tsx`, `route.tsx`)
  - `apps/web/src/routes/viviana-ui/docs/**` (6 files: 1 component doc, 2 hook docs, `index.tsx`, `installation.tsx`, `route.tsx`)
- **Code Examples Scope:** Every code example shown to the reader (strings, template literals, `<code>`/`<pre>` blocks, CodeBlock props):
  - 50 `importCode` template literals passed to `DocPage`
  - 20 `<Code>` code blocks in `installation.tsx` (10 in `solid-spectrum`, 10 in `viviana-ui`)
  - 9 `<pre><code>` code blocks across `toast.tsx`, `create-button.tsx`, `create-press.tsx`, `index.tsx`, `installation.tsx`
  - 186 `code={\`...\`}` template literals passed to `Example` components
  - Total code example snippets inspected: 265
- **Imports Examined:** 88 distinct `import` statements identified across the code examples.
- **Export Verification:**
  - `@proyecto-viviana/solid-spectrum`: Verified against `packages/solid-spectrum/src/index.ts` (633 exported symbols following `export *`) and subpath exports in `package.json`.
  - `@proyecto-viviana/ui`: Verified against `packages/viviana-ui/src/index.ts` (728 exported symbols following `export *`) and subpath exports in `package.json`.
  - `@proyecto-viviana/solidaria`: Verified against `packages/solidaria/src/index.ts` (594 exported symbols following `export *`).
  - `@proyecto-viviana/solidaria-components`: Verified against `packages/solidaria-components/src/index.ts` (869 exported symbols following `export *`).
  - `@proyecto-viviana/solid-stately`: Verified against `packages/solid-stately/src/index.ts` (348 exported symbols following `export *`).
- **Solid 2 Checks:** Scanned all code examples for imports from `solid-js/web` or `solid-js/store` and any use of removed/relocated APIs: `onMount`, `createResource`, `Suspense`, `splitProps`.

### Skipped and Why
- Files outside `apps/web/src/routes/**/docs/**` (e.g. `apps/web/src/components/**`, `apps/web/src/data/**`, `/showcase`, `/theme`) — outside explicit task scope.
- `.env*` files — strictly skipped per security/audit hard rules.

---

## Code Examples Import & Export Verification Table

| Location | Context | Package | Imported Names | Exported by `src/index.ts`? | Flags |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [`accordion.tsx:50`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/accordion.tsx#L50) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Accordion`, `AccordionItem`, `AccordionItemHeader`, `AccordionItemTitle`, `AccordionItemPanel` | Yes | — |
| [`actionbar.tsx:25`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/actionbar.tsx#L25) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ActionBar`, `ActionBarContainer`, `ActionButton` | Yes | — |
| [`actiongroup.tsx:28`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/actiongroup.tsx#L28) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ActionGroup` | Yes | — |
| [`alertdialog.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/alertdialog.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `AlertDialog`, `Button` | Yes | — |
| [`badge.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/badge.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Badge` | Yes | — |
| [`breadcrumbs.tsx:64`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/breadcrumbs.tsx#L64) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Breadcrumbs`, `BreadcrumbItem` | Yes | — |
| [`button.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/button.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Button`, `Link` | Yes | — |
| [`calendar.tsx:42`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/calendar.tsx#L42) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Calendar` | Yes | — |
| [`calendar.tsx:42`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/calendar.tsx#L42) | `importCode` | `@proyecto-viviana/solid-stately` | `CalendarDateClass` | Yes | — |
| [`checkbox.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/checkbox.tsx#L27) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Checkbox`, `CheckboxGroup` | Yes | — |
| [`color.tsx:74`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/color.tsx#L74) | `importCode` | `@proyecto-viviana/solidaria-components` | `ColorSlider`, `ColorSliderTrack`, `ColorSliderThumb` | Yes | — |
| [`color.tsx:74`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/color.tsx#L74) | `importCode` | `@proyecto-viviana/solidaria-components` | `ColorArea`, `ColorAreaGradient`, `ColorAreaThumb` | Yes | — |
| [`color.tsx:74`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/color.tsx#L74) | `importCode` | `@proyecto-viviana/solidaria-components` | `ColorWheel`, `ColorWheelTrack`, `ColorWheelThumb` | Yes | — |
| [`color.tsx:74`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/color.tsx#L74) | `importCode` | `@proyecto-viviana/solidaria-components` | `ColorField`, `ColorFieldInput`, `ColorSwatch` | Yes | — |
| [`color.tsx:74`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/color.tsx#L74) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ColorSwatchPicker`, `ColorSwatchPickerItem`, `ColorEditor` | Yes | — |
| [`color.tsx:74`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/color.tsx#L74) | `importCode` | `@proyecto-viviana/solid-stately` | `parseColor`, `Color` | Yes | — |
| [`combobox.tsx:41`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/combobox.tsx#L41) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ComboBox`, `ComboBoxOption`, `defaultContainsFilter` | Yes | — |
| [`contextualhelp.tsx:23`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/contextualhelp.tsx#L23) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ContextualHelp`, `Heading`, `Content` | Yes | — |
| [`datefield.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/datefield.tsx#L27) | `importCode` | `@proyecto-viviana/solid-spectrum` | `DateField` | Yes | — |
| [`datefield.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/datefield.tsx#L27) | `importCode` | `@proyecto-viviana/solid-stately` | `CalendarDateClass` | Yes | — |
| [`datepicker.tsx:31`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/datepicker.tsx#L31) | `importCode` | `@proyecto-viviana/solid-spectrum` | `DatePicker` | Yes | — |
| [`datepicker.tsx:31`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/datepicker.tsx#L31) | `importCode` | `@proyecto-viviana/solid-stately` | `CalendarDateClass` | Yes | — |
| [`daterangepicker.tsx:39`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/daterangepicker.tsx#L39) | `importCode` | `@proyecto-viviana/solid-spectrum` | `DateRangePicker` | Yes | — |
| [`daterangepicker.tsx:39`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/daterangepicker.tsx#L39) | `importCode` | `@proyecto-viviana/solid-stately` | `CalendarDateClass`, `DateValue`, `RangeValue` | Yes | — |
| [`dialog.tsx:32`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/dialog.tsx#L32) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Dialog`, `DialogTrigger`, `DialogFooter` | Yes | — |
| [`disclosure.tsx:91`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/disclosure.tsx#L91) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Disclosure`, `DisclosureGroup`, `DisclosureTrigger`, `DisclosurePanel` | Yes | — |
| [`dropzone.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/dropzone.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `DropZone` | Yes | — |
| [`filetrigger.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/filetrigger.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `FileTrigger`, `Button` | Yes | — |
| [`gridlist.tsx:74`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/gridlist.tsx#L74) | `importCode` | `@proyecto-viviana/solidaria-components` | `GridList`, `GridListItem` | Yes | — |
| [`link.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/link.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Link` | Yes | — |
| [`menu.tsx:76`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/menu.tsx#L76) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Menu`, `MenuItem`, `MenuTrigger`, `Button`, `MenuSeparator` | Yes | — |
| [`meter.tsx:41`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/meter.tsx#L41) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Meter` | Yes | — |
| [`numberfield.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/numberfield.tsx#L27) | `importCode` | `@proyecto-viviana/solid-spectrum` | `NumberField` | Yes | — |
| [`picker.tsx:38`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/picker.tsx#L38) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Picker`, `PickerItem` | Yes | — |
| [`popover.tsx:30`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/popover.tsx#L30) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Popover`, `PopoverTrigger`, `PopoverHeader`, `PopoverFooter` | Yes | — |
| [`progressbar.tsx:46`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/progressbar.tsx#L46) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ProgressBar` | Yes | — |
| [`provider.tsx:22`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/provider.tsx#L22) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Provider` | Yes | — |
| [`provider.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/provider.tsx#L27) | `code` | `@proyecto-viviana/solid-spectrum` | `Provider` | Yes | — |
| [`provider.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/provider.tsx#L27) | `code` | `@proyecto-viviana/solid-spectrum/styles.css` | *(side-effect)* | Yes (subpath export) | — |
| [`provider.tsx:102`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/provider.tsx#L102) | `code` | `@proyecto-viviana/solid-spectrum` | `useTheme` | Yes | — |
| [`rangecalendar.tsx:51`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/rangecalendar.tsx#L51) | `importCode` | `@proyecto-viviana/solid-spectrum` | `RangeCalendar` | Yes | — |
| [`rangecalendar.tsx:51`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/rangecalendar.tsx#L51) | `importCode` | `@proyecto-viviana/solid-stately` | `CalendarDateClass`, `DateValue`, `RangeValue` | Yes | — |
| [`searchfield.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/searchfield.tsx#L27) | `importCode` | `@proyecto-viviana/solid-spectrum` | `SearchField` | Yes | — |
| [`select.tsx:60`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/select.tsx#L60) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Select`, `SelectTrigger`, `SelectValue`, `SelectListBox`, `SelectOption` | Yes | — |
| [`separator.tsx:23`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/separator.tsx#L23) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Separator` | Yes | — |
| [`slider.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/slider.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Slider` | Yes | — |
| [`switch.tsx:27`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/switch.tsx#L27) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ToggleSwitch` | Yes | — |
| [`table.tsx:80`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/table.tsx#L80) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Table`, `TableHeader`, `TableColumn`, `TableBody`, `TableRow`, `TableCell` | Yes | — |
| [`tabs.tsx:56`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/tabs.tsx#L56) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Tabs`, `TabList`, `Tab`, `TabPanel` | Yes | — |
| [`taggroup.tsx:66`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/taggroup.tsx#L66) | `importCode` | `@proyecto-viviana/solid-spectrum` | `TagGroup` | Yes | — |
| [`textarea.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/textarea.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `TextArea` | Yes | — |
| [`textfield.tsx:26`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/textfield.tsx#L26) | `importCode` | `@proyecto-viviana/solid-spectrum` | `TextField` | Yes | — |
| [`timefield.tsx:36`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/timefield.tsx#L36) | `importCode` | `@proyecto-viviana/solid-spectrum` | `TimeField` | Yes | — |
| [`timefield.tsx:36`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/timefield.tsx#L36) | `importCode` | `@proyecto-viviana/solid-stately` | `TimeValue` | Yes | — |
| [`toast.tsx:31`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/toast.tsx#L31) | `importCode` | `@proyecto-viviana/solid-spectrum` | `ToastProvider`, `ToastRegion`, `toastSuccess`, `toastError`, `toastWarning`, `toastInfo` | Yes | — |
| [`toolbar.tsx:22`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/toolbar.tsx#L22) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Toolbar`, `ActionButton` | Yes | — |
| [`tooltip.tsx:23`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/tooltip.tsx#L23) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Tooltip`, `TooltipTrigger`, `ActionButton` | Yes | — |
| [`tree.tsx:78`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/tree.tsx#L78) | `importCode` | `@proyecto-viviana/solid-spectrum` | `Tree`, `TreeItem` | Yes | — |
| [`virtualizer.tsx:69`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/components/virtualizer.tsx#L69) | `importCode` | `@proyecto-viviana/solidaria-components` | `Virtualizer`, `ListLayout`, `GridLayout`, `WaterfallLayout`, `TableLayout` | Yes | — |
| [`create-button.tsx:25`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/hooks/create-button.tsx#L25) | `importCode` | `@proyecto-viviana/solidaria` | `createButton` | Yes | — |
| [`create-press.tsx:46`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/hooks/create-press.tsx#L46) | `importCode` | `@proyecto-viviana/solidaria` | `createPress` | Yes | — |
| [`index.tsx:93`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/index.tsx#L93) | `<pre>` | `@proyecto-viviana/solid-spectrum` | `Button` | Yes | — |
| [`installation.tsx:139`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L139) | `<Code>` | `@proyecto-viviana/ui/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:197`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L197) | `<Code>` | `@proyecto-viviana/solid-spectrum/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:205`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L205) | `<Code>` | `@proyecto-viviana/ui` | `Provider`, `Button` | Yes | — |
| [`installation.tsx:205`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L205) | `<Code>` | `@proyecto-viviana/ui/TextField` | `TextField` | Yes (subpath export) | — |
| [`installation.tsx:205`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L205) | `<Code>` | `@proyecto-viviana/ui/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:236`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L236) | `<Code>` | `tailwindcss` | *(side-effect)* | N/A (external) | — |
| [`installation.tsx:236`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L236) | `<Code>` | `@proyecto-viviana/ui/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:254`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L254) | `<Code>` | `@proyecto-viviana/ui/style` | `style` | Yes (subpath export) | — |
| [`installation.tsx:256`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L256) | `<Code>` | `vite` | `defineConfig` | N/A (external) | — |
| [`installation.tsx:256`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L256) | `<Code>` | `vite-plugin-solid` | `solid` | N/A (external) | — |
| [`installation.tsx:256`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/solid-spectrum/docs/installation.tsx#L256) | `<Code>` | `@proyecto-viviana/ui/vite` | `vivianaMacros` | Yes (subpath export) | — |
| [`button.tsx:25`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/components/button.tsx#L25) | `importCode` | `@proyecto-viviana/ui` | `Button` | Yes | — |
| [`create-button.tsx:25`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/hooks/create-button.tsx#L25) | `importCode` | `@proyecto-viviana/solidaria` | `createButton` | Yes | — |
| [`create-press.tsx:46`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/hooks/create-press.tsx#L46) | `importCode` | `@proyecto-viviana/solidaria` | `createPress` | Yes | — |
| [`index.tsx:92`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/index.tsx#L92) | `<pre>` | `@proyecto-viviana/ui` | `Button` | Yes | — |
| [`installation.tsx:139`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L139) | `<Code>` | `@proyecto-viviana/ui/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:197`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L197) | `<Code>` | `@proyecto-viviana/solid-spectrum/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:205`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L205) | `<Code>` | `@proyecto-viviana/ui` | `Provider`, `Button` | Yes | — |
| [`installation.tsx:205`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L205) | `<Code>` | `@proyecto-viviana/ui/TextField` | `TextField` | Yes (subpath export) | — |
| [`installation.tsx:205`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L205) | `<Code>` | `@proyecto-viviana/ui/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:236`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L236) | `<Code>` | `tailwindcss` | *(side-effect)* | N/A (external) | — |
| [`installation.tsx:236`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L236) | `<Code>` | `@proyecto-viviana/ui/components.css` | *(side-effect)* | Yes (subpath export) | — |
| [`installation.tsx:254`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L254) | `<Code>` | `@proyecto-viviana/ui/style` | `style` | Yes (subpath export) | — |
| [`installation.tsx:256`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L256) | `<Code>` | `vite` | `defineConfig` | N/A (external) | — |
| [`installation.tsx:256`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L256) | `<Code>` | `vite-plugin-solid` | `solid` | N/A (external) | — |
| [`installation.tsx:256`](file:////home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/viviana-ui/docs/installation.tsx#L256) | `<Code>` | `@proyecto-viviana/ui/vite` | `vivianaMacros` | Yes (subpath export) | — |

---

## Broken Code Examples

### HIGH Missing `createSignal` import in primary `solid-spectrum` getting-started example
- where: `apps/web/src/routes/solid-spectrum/docs/index.tsx:93`
- what: The getting started code example uses `createSignal(false)` in its component body but only imports `Button` from `@proyecto-viviana/solid-spectrum`, omitting `import { createSignal } from "solid-js";`.
- proof: Inspecting `apps/web/src/routes/solid-spectrum/docs/index.tsx` lines 93-104 reveals:
  ```tsx
  <code>{`import { Button } from '@proyecto-viviana/solid-spectrum';\n\nfunction App() {\n  const [pressed, setPressed] = createSignal(false);\n\n  return (\n    <Button onPress={() => setPressed(true)}>\n      {pressed() ? 'Pressed' : 'Click me'}\n    </Button>\n  );\n}`}</code>
  ```
  Copying and pasting this snippet into any consumer TypeScript/JavaScript project immediately fails compilation with `Cannot find name 'createSignal'`.
- expected: Standalone getting-started examples must import all referenced runtime primitives:
  ```tsx
  import { createSignal } from 'solid-js';\n  import { Button } from '@proyecto-viviana/solid-spectrum';\n  ```
- blast radius: Any new user onboarding to `@proyecto-viviana/solid-spectrum` via the documentation homepage.

### HIGH Missing `DateValue` type import in `importCode` for date components
- where: `apps/web/src/routes/solid-spectrum/docs/components/calendar.tsx:42` (and 2 twins: `apps/web/src/routes/solid-spectrum/docs/components/datefield.tsx:27`, `apps/web/src/routes/solid-spectrum/docs/components/datepicker.tsx:31` — count: 3)
- what: The `importCode` displayed at the top of the Calendar, DateField, and DatePicker doc pages imports only `CalendarDateClass as CalendarDate` from `@proyecto-viviana/solid-stately`, but the first code example on each page uses `createSignal<DateValue | null>(null)`, referencing `DateValue` which is not imported.
- proof:
  In `calendar.tsx`:
  - Line 42: `importCode={\`import { Calendar } from '@proyecto-viviana/solid-spectrum';\\nimport { CalendarDateClass as CalendarDate } from '@proyecto-viviana/solid-stately';\`}`
  - Line 48: `code={\`const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null); ...\`}`
  In `datefield.tsx`:
  - Line 27: `importCode={\`import { DateField } from '@proyecto-viviana/solid-spectrum';\\nimport { CalendarDateClass as CalendarDate } from '@proyecto-viviana/solid-stately';\`}`
  - Line 33: `code={\`const [date, setDate] = createSignal<DateValue | null>(null); ...\`}`
  In `datepicker.tsx`:
  - Line 31: `importCode={\`import { DatePicker } from '@proyecto-viviana/solid-spectrum';\\nimport { CalendarDateClass as CalendarDate } from '@proyecto-viviana/solid-stately';\`}`
  - Line 37: `code={\`const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null); ...\`}`
  Contrast with `daterangepicker.tsx:39`, which correctly imports `type DateValue, type RangeValue`. A user following the docs and pairing `importCode` with the `Basic Usage` example will encounter `Cannot find name 'DateValue'`.
- expected: `importCode` should include `type DateValue` from `@proyecto-viviana/solid-stately`:
  ```tsx
  import { CalendarDateClass as CalendarDate, type DateValue } from '@proyecto-viviana/solid-stately';
  ```
- blast radius: Consumers implementing `Calendar`, `DateField`, and `DatePicker` from `@proyecto-viviana/solid-spectrum`.

### MEDIUM Missing companion component imports in `importCode` for composite examples
- where: `apps/web/src/routes/solid-spectrum/docs/components/virtualizer.tsx:69` (and 7 twins: `table.tsx:80`, `badge.tsx:26`, `dialog.tsx:32`, `popover.tsx:30`, `dropzone.tsx:26`, `progressbar.tsx:46`, `provider.tsx:22` — count: 8)
- what: The `importCode` block at the top of composite component pages omits companion components required by the page's code examples.
- proof:
  - `virtualizer.tsx:69`: `importCode` only imports `Virtualizer` and layouts (`ListLayout`, `GridLayout`, etc.), but code examples on lines 80, 132, 187 require `<ListBox>` and `<ListBoxOption>`.
  - `table.tsx:80`: `importCode` imports `Table, TableHeader, TableColumn, TableBody, TableRow, TableCell`, but the Selectable Rows example on lines 137-156 requires `<TableSelectAllCheckbox />` and `<TableSelectionCheckbox />`.
  - `badge.tsx:26`: `importCode` imports only `Badge`, but the \"Typical Usage\" example on line 64 requires `<Button>`.
  - `dialog.tsx:32`: `importCode` imports `Dialog, DialogTrigger, DialogFooter`, but examples require `<Button>` and `<TextField>`.
  - `popover.tsx:30`: `importCode` imports `Popover, PopoverTrigger, PopoverHeader, PopoverFooter`, but examples require `<Button>`.
  - `dropzone.tsx:26`: `importCode` imports only `DropZone`, but examples require `<Text>`.
  - `progressbar.tsx:46`: `importCode` imports only `ProgressBar`, but examples require `<Button>`.
  - `provider.tsx:22`: `importCode` imports only `Provider`, but examples require `<Button>`.
- expected: `importCode` or the respective examples should explicitly show where companion components are imported from (e.g. `Button` from `@proyecto-viviana/solid-spectrum`, `ListBox` from `@proyecto-viviana/solidaria-components`).
- blast radius: Developer ergonomics when adopting composite components; examples cannot be copied verbatim without investigating missing component sources.

### LOW Non-compilable pseudo-code ellipsis (`...`) in JSX attribute positions
- where: `apps/web/src/routes/solid-spectrum/docs/components/combobox.tsx:90` (and 2 twins: `combobox.tsx:114`, `combobox.tsx:151` — count: 3)
- what: Code examples in `ComboBox` documentation include raw ellipses `...` inside JSX opening tags (e.g. `<ComboBox items={foods} ...>`), making the code snippet invalid JSX/TSX syntax rather than valid compilable code.
- proof:
  `combobox.tsx:90`:
  ```tsx
  <ComboBox items={foods} size=\"sm\" label=\"Small\" placeholder=\"Filter...\" ...>
  ```
  `combobox.tsx:118`:
  ```tsx
  <ComboBox
    label=\"Required Food\"
    isInvalid
    errorMessage=\"Please select a food item\"
    ...
  />
  ```
  `combobox.tsx:151`:
  ```tsx
  <ComboBox isDisabled defaultSelectedKey=\"apple\" label=\"Disabled\" ...>
  ```
  TypeScript parsing of these strings fails with `Identifier expected`, `JSX element 'ComboBox' has no corresponding closing tag`.
- expected: Valid JSX without raw pseudo-code ellipses in attribute position, or formatted as comments (`{/* ... */}`).
- blast radius: Readers copying the example snippet verbatim into a TypeScript JSX file.

---

## Verdict

**Would you ship an RC from this tree?**
**CONDITIONAL YES** (from the lens of documentation code examples and exported symbols).

Every single exported symbol referenced in the documentation's `importCode` and example import statements is genuinely exported by the packages' `src/index.ts` entry points and `package.json` subpaths (100% export integrity across 88 import statements). There are zero phantom exports and zero deprecated Solid 1 API imports (`onMount`, `createResource`, `Suspense`, `splitProps`, `solid-js/web`, `solid-js/store`) in the examples shown to the reader.

However, several code examples suffer from omitted imports (`createSignal`, `DateValue`, companion components like `ListBox` / `TableSelectAllCheckbox`) and pseudo-code syntax errors (`...` in JSX) that prevent copy-paste compilation for users following the docs.

### The Three Things to Fix First
1. **Fix the solid-spectrum index example import:** Add `import { createSignal } from 'solid-js';` to the primary getting-started example in `apps/web/src/routes/solid-spectrum/docs/index.tsx:93`.
2. **Add `type DateValue` to `importCode` in Date components:** Update `importCode` in `calendar.tsx:42`, `datefield.tsx:27`, and `datepicker.tsx:31` to include `type DateValue` from `@proyecto-viviana/solid-stately`, matching `daterangepicker.tsx:39`.
3. **Include companion components in `importCode` or example snippets:** In `virtualizer.tsx`, `table.tsx`, `dialog.tsx`, and `badge.tsx`, document the imports for companion components (`ListBox`, `ListBoxOption`, `TableSelectAllCheckbox`, `Button`) so that example code blocks compile self-consistently.
