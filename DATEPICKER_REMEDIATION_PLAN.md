# DatePicker Cross-Stack Remediation Plan

## Overview

Fix every behavioral, accessibility, and styling gap identified between React Spectrum and Solid Spectrum DatePicker across all four layers.

## Dependency Order

We fix bottom-up because each layer depends on the one below it:

1. **State** (`solid-stately`) — primitives that hooks consume
2. **Headless** (`solidaria`) — ARIA behavior hooks that components consume
3. **Components** (`solidaria-components`) — unstyled component assembly
4. **Styled** (`solid-spectrum`) — S2 design-system skin

---

## Current Bug Inventory (from full stack review)

| Severity  | Count | Layers Affected                     |
| --------- | ----- | ----------------------------------- |
| 🔴 High   | 21    | State, Headless, Components, Styled |
| 🟡 Medium | 24    | State, Headless, Components, Styled |
| 🟢 Low    | 9     | State, Headless, Components, Styled |

---

## Phase 1: State Layer (`solid-stately`)

### 1.1 Fix `createDatePickerState`

**File:** `packages/solid-stately/src/calendar/createDatePickerState.ts`

**What to fix:**

- Export `builtinValidation` in the return object so downstream layers can access min/max/unavailable validation.
- Fix `setDateValue` placeholder-time commit logic: when `hasTime && shouldClose`, only commit placeholder time if the user hasn't explicitly selected a time yet; otherwise preserve selected time.
- Fix `commitValue` to preserve `ZonedDateTime` timezone — don't use `toCalendarDateTime` blindly; check if value is zoned and reconstruct with timezone.
- Fix `setOpen(false)` auto-commit behavior: don't auto-commit partial date+time on close unless the user explicitly confirmed (e.g. via button press or date selection with shouldCloseOnSelect).
- Add `showEra` getter to expose era display flag.
- Preserve `defaultValue` for potential reset behavior.

**Validation:**

- Unit test: `builtinValidation` is exported and respects min/max/isDateUnavailable.
- Unit test: `setDateValue` with existing time value preserves the time portion.
- Unit test: `commitValue` preserves `ZonedDateTime` timezone.
- Unit test: `showEra` flag for BC dates.

### 1.2 Fix `createDateFieldState`

**File:** `packages/solid-stately/src/calendar/createDateFieldState.ts`

**What to fix:**

- Localize placeholder text using `DateFormatter` per locale instead of hardcoded English strings.
- Fix `clearSegment` to clear only the target segment, not the entire value.
- Fix `updateDatePart` to handle all `DateValue` types safely with type guards.
- Add `isDateUnavailable` check during segment setting and confirmPlaceholder.
- Fix `confirmPlaceholder` to clear partial state when date is unavailable.

**Validation:**

- Unit test: placeholder text changes with locale (e.g., Japanese uses localized format tokens).
- Unit test: `clearSegment` clears only the target segment.
- Unit test: `updateDatePart` with `CalendarDateTime` preserves time fields.
- Unit test: `isDateUnavailable` validation blocks confirmation.

### 1.3 Fix `createTimeFieldState`

**File:** `packages/solid-stately/src/calendar/createTimeFieldState.ts`

**What to fix:**

- Fix `updateTimePart` to handle `Time` objects and all `TimeValue` types consistently, not just ones with `.set()`.
- Add `defaultValue` preservation.

**Validation:**

- Unit test: `updateTimePart` with `Time` object.
- Unit test: `updateTimePart` with `CalendarDateTime`.

### 1.4 Update `solid-stately` index exports

**File:** `packages/solid-stately/src/datepicker/index.ts`

**What to add:**

- Export `createDatePickerState` (verify it exists).
- Export `DatePickerState`, `DatePickerStateOptions` types.

---

## Phase 2: Headless Layer (`solidaria`)

### 2.1 Fix `createDatePicker`

**File:** `packages/solidaria/src/datepicker/createDatePicker.ts`

**What to fix:**

- Replace `onClick` with proper press behavior (keyboard activation via Enter/Space).
- Implement label click focusing first editable segment (needs focus manager ref access).
- Add `useDescription` equivalent: generate selected date description string and link via `aria-describedby`.
- Fix `calendarProps.onChange` to use proper typed callback instead of `(state as any).setValue`.
- Use `aria-disabled` instead of HTML `disabled` on button for ARIA compliance.
- Add `dialogProps` `aria-labelledby` linking to both label and button.
- Populate `validationDetails` with actual min/max/unavailable metadata.
- Fix `groupProps` to not spread `labelFieldProps` directly (may inject `for` onto div).
- Make `fieldProps` deeply reactive by returning accessors for nested values where needed.

**Validation:**

- Unit test: `fieldProps` contains `id`, `aria-describedby`, `onChange`.
- Unit test: button has `tabIndex: 0` and is keyboard-activatable.
- Unit test: `buttonProps` has `aria-labelledby` linking to label.
- Unit test: `calendarProps` has `autoFocus`, `value`, `onChange`.
- Unit test: label click focuses first segment.
- Unit test: selected date description is generated.
- Unit test: validation result includes details.

### 2.2 Fix `createDatePickerGroup`

**File:** `packages/solidaria/src/datepicker/createDatePickerGroup.ts`

**What to fix:**

- Replace `window.event` usage with event parameter passing.
- Ensure the hook is actually consumed by the component layer.

**Validation:**

- Unit test: Alt+ArrowDown opens calendar.
- Unit test: ArrowRight/ArrowLeft navigates segments with RTL support.
- Unit test: Click on empty field focuses first editable segment.
- Unit test: Click on field with partial value focuses last non-placeholder segment.

### 2.3 Fix `createDateField`

**File:** `packages/solidaria/src/datepicker/createDateField.ts`

**What to fix:**

- Fix `data-placeholder` to use `"true"` instead of `""` for CSS selector compatibility.
- Ensure container `onKeyDown` doesn't conflict with segment-level handlers.
- Integrate with `createDatePickerGroup` when inside a DatePicker.

**Validation:**

- Unit test: `inputProps` has `data-placeholder="true"`.
- Unit test: `inputProps` has `contentEditable: true`.
- Unit test: `inputProps` has `caretColor: transparent` in style.

### 2.4 Fix `createDateSegment`

**File:** `packages/solidaria/src/datepicker/createDateSegment.ts`

**What to fix:**

- Wire long press to pointer events (mouse down/up) in addition to keyboard.
- Replace deprecated `document.createRange` with `new Range()`.
- Fix `aria-valuetext` for placeholders: use empty string or segment label instead of literal placeholder text.
- Add `aria-controls` when inside datepicker.
- Ensure `data-placeholder` consistently uses `"true"`.

**Validation:**

- Unit test: segment has `data-type="year"` etc.
- Unit test: segment has `data-placeholder` when empty.
- Unit test: long press increments value repeatedly.
- Unit test: typing "12" in month segment moves focus to next segment.
- Unit test: text selection is managed on focus.

---

## Phase 3: Components Layer (`solidaria-components`)

### 3.1 Fix `DatePicker.tsx`

**File:** `packages/solidaria-components/src/DatePicker.tsx`

**What to fix:**

- Replace mutable `triggerRef` variable with a proper signal/reactive ref.
- Eliminate manual field+calendar state sync — use `createDatePickerState` as the single source of truth.
- Fix `DatePickerContent` focus-return: only return focus when overlay actually closes, not on every effect cleanup.
- Fix `isInvalid` to include `datePickerState.builtinValidation().isInvalid`.
- Fix `DateRangePicker` to use unified state instead of manual signals.
- Don't render `HiddenDateInput` when `name` is not provided.

**Validation:**

- Unit test: `isInvalid` propagates to `data-invalid` on root.
- Unit test: `validationState="invalid"` works.
- Unit test: value below `minValue` marks invalid.
- Unit test: Escape closes popover and returns focus to trigger.
- Unit test: selecting a date closes popover when `shouldCloseOnSelect` is true.

### 3.2 Fix `HiddenDateInput.tsx`

**File:** `packages/solidaria-components/src/HiddenDateInput.tsx`

**What to fix:**

- Fix `value` prop type from `unknown` to `DateValue | null | undefined`.
- For `ZonedDateTime`, format with timezone offset or use `datetime-local` with offset to prevent time loss.

**Validation:**

- Unit test: hidden input has correct `name` attribute.
- Unit test: hidden input value updates when DatePicker value changes.
- Unit test: hidden input is disabled when DatePicker is disabled.

### 3.3 Fix `DateField.tsx`

**File:** `packages/solidaria-components/src/DateField.tsx`

**What to fix:**

- Remove duplicate `data-focused` from `DateSegment` span if already in `segmentProps`.
- Sync `DateInput` focus state with hook-level focus tracking.

---

## Phase 4: Styled Layer (`solid-spectrum`)

### 4.1 Fix `DatePicker.tsx`

**File:** `packages/solid-spectrum/src/calendar/DatePicker.tsx`

**What to fix:**

- **Remove `// @ts-nocheck`** and fix resulting type errors.
- **Add time support:** Render `TimeField` inside popover when `hasTime` is true (detect from value type or granularity prop).
- **Fix popover width:** Apply `popoverWidth` signal to the popover frame instead of hardcoding `304px`.
- **Fix calendar size passthrough:** Pass `size` prop to `Calendar` instead of hardcoding `size="md"`.
- **Fix animation:** Replaced `@keyframes vui-datepicker-popover-in` with `@keyframes s2-datepicker-popover-in` and updated all references. Deprecated `vui-` prefix in favor of `s2-`.
- **Fix field group click:** Use `createDatePickerGroup` behavior (focus last non-placeholder segment) instead of inline `focusFirst`.
- **Add missing props passthrough:** `maxVisibleMonths`, `shouldFlip`, `placeholderValue`, `firstDayOfWeek`, `isDateUnavailable`, `pageBehavior`, `hourCycle`, `hideTimeZone`, `onOpenChange`, `granularity`.
- **Fix button keyboard behavior:** Ensure button is focusable and activatable via Enter/Space.
- **Add label layout props:** `labelPosition`, `labelAlign`, `necessityIndicator`.
- **Fix `datePickerFieldGroupStyle` widths:** Make responsive instead of hardcoded pixel values.

**Validation:**

- Visual regression: compare field closed state.
- Visual regression: compare popover open state.
- Visual regression: compare with time field visible.
- Visual regression: compare disabled state.
- Visual regression: compare invalid state.
- Visual regression: compare all sizes (S, M, L, XL).

### 4.2 Fix `DateField.tsx` and `TimeField.tsx`

**Files:**

- `packages/solid-spectrum/src/calendar/DateField.tsx`
- `packages/solid-spectrum/src/calendar/TimeField.tsx`

**What to fix:**

- Ensure they use updated hooks from Phase 2.
- Add `data-*` attribute support for styling hooks.

---

## Phase 5: Testing Strategy

### 5.1 Existing Test Updates

#### `packages/solid-spectrum/test/DatePicker.test.tsx`

**Current:** 4 tests
**Add:**

- Button is keyboard-focusable (`tabIndex: 0`).
- `fieldProps` links label to input.
- `aria-describedby` includes selected date description.
- Calendar button has `aria-labelledby` linking to field label.

#### `packages/solidaria-components/test/DatePicker.test.tsx`

**Current:** 25 tests
**Add:**

- `HiddenDateInput` renders with correct name/value.
- `shouldCloseOnSelect` behavior.
- Time field appears when granularity includes time.
- `onOpenChange` callback fires.
- `data-focus-visible` on segment when keyboard focused.
- `data-hovered` on segment when mouse hovered.
- Long press increments segment.
- Alt+ArrowDown opens calendar.
- ArrowRight/ArrowLeft navigates segments.

### 5.2 New Test Files

#### `packages/solid-stately/test/createDatePickerState.test.ts`

- Controlled/uncontrolled value.
- Date+time commit logic.
- Granularity auto-detect.
- `shouldCloseOnSelect` function.
- `formatValue` with era.
- `builtinValidation`.

#### `packages/solidaria/test/createDatePickerGroup.test.ts`

- Alt+ArrowDown opens calendar.
- Arrow key segment navigation.
- Click-to-focus behavior.
- RTL geometric navigation.

#### `packages/solidaria/test/createDatePicker.test.ts`

- `fieldProps` is not empty.
- `buttonProps` has `tabIndex: 0`.
- `buttonProps` has `aria-labelledby`.
- `calendarProps` has `autoFocus`, `value`, `onChange`.
- Label click focuses first segment.
- Selected date description.

#### `packages/solidaria/test/createDateSegment.test.ts`

- `data-*` attributes.
- Long press increment.
- Typing moves focus to next segment.
- Text selection management.

---

## Phase 6: Acceptance Criteria

### State Layer

- [ ] `builtinValidation` is exported and functional.
- [ ] `ZonedDateTime` timezone is preserved on commit.
- [ ] Placeholder text is locale-aware.
- [ ] `clearSegment` clears only the target segment.

### Headless Layer

- [ ] `fieldProps` is never empty.
- [ ] Button is keyboard-activatable (Enter/Space).
- [ ] Alt+ArrowDown opens calendar.
- [ ] Arrow keys navigate segments.
- [ ] Label click focuses first segment.
- [ ] Calendar receives `autoFocus`, `value`, `onChange`.
- [ ] Selected date description is announced.

### Components Layer

- [ ] `HiddenDateInput` exists and submits forms correctly.
- [ ] `DatePickerContent` doesn't steal focus from calendar.
- [ ] Escape closes popover and returns focus to button.
- [ ] `shouldCloseOnSelect` works for both date-only and datetime.
- [ ] `triggerRef` is reactive.

### Styled Layer

- [ ] `// @ts-nocheck` is removed.
- [ ] TimeField appears in popover when value has time.
- [ ] Popover width matches trigger width.
- [ ] Calendar size matches DatePicker `size` prop.
- [ ] Animation is either implemented or removed.
- [ ] All missing props are passed through.

### Comparison App

- [ ] Visual diff for closed field: mismatch ratio ≤ existing threshold.
- [ ] Visual diff for open popover: mismatch ratio ≤ existing threshold.
- [ ] Keyboard behavior matches React: Alt+ArrowDown, arrows, Escape, Tab.
- [ ] Screen reader labels match: button labeled by label+button text.

---

## Risk Mitigation

- **State shape changes:** Keep old properties as aliases with `@deprecated` where possible.
- **Hook API changes:** Additive only; don't remove existing properties.
- **Button tabIndex change:** From `-1` to `0` is correct behavior; update tests accordingly.
- **Performance:** Debounce resize observer; memoize focus manager.
- **SSR:** Keep DOM access only in components; no `document` in state/hooks.

---

## Estimated Effort

| Phase               | Files Changed | New Files | Tests Added | Estimated Time  |
| ------------------- | ------------- | --------- | ----------- | --------------- |
| Phase 1: State      | 3             | 0         | 10-15       | 3-4 hours       |
| Phase 2: Headless   | 4             | 0         | 15-20       | 4-6 hours       |
| Phase 3: Components | 3             | 0         | 10-15       | 3-4 hours       |
| Phase 4: Styled     | 1             | 0         | 5-10        | 3-4 hours       |
| Phase 5: Tests      | 4             | 4         | 40-60       | 4-6 hours       |
| Phase 6: Validation | 0             | 0         | 5-10        | 2-3 hours       |
| **Total**           | **15**        | **4**     | **85-125**  | **19-27 hours** |

---

## Success Metrics

1. **All existing tests pass** (or updated where intentionally changed).
2. **New test coverage > 90%** for datepicker modules.
3. **Visual regression mismatch ratio** for field and popover ≤ current thresholds.
4. **Lighthouse accessibility score** for comparison page DatePicker section ≥ 95.
5. **Keyboard navigation** matches React Spectrum exactly.
6. **Screen reader output** matches React Spectrum.
7. **Zero `// @ts-nocheck`** in DatePicker files.
