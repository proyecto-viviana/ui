---
"@proyecto-viviana/solid-spectrum": minor
---

Close the React Spectrum S2 support-export gap

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
