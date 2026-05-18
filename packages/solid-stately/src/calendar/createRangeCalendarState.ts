/**
 * RangeCalendarState for Solid-Stately
 *
 * Provides state management for range calendar components.
 * Based on @react-stately/calendar useRangeCalendarState
 */

import { createSignal, createMemo, createEffect, type Accessor } from "solid-js";
import {
  type Calendar as InternationalizedCalendar,
  type CalendarDate,
  type CalendarIdentifier,
  type DateValue,
  GregorianCalendar,
  today,
  getLocalTimeZone,
  isEqualCalendar,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  getWeeksInMonth,
  DateFormatter,
  createCalendar as intlCreateCalendar,
  toCalendar as intlToCalendar,
  toCalendarDate as intlToCalendarDate,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";
import type { CalendarDayOfWeek, ValidationState } from "./createCalendarState";

const dayOfWeekNames: CalendarDayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export interface RangeValue<T> {
  start: T;
  end: T;
}

export interface RangeCalendarStateProps<T extends DateValue = DateValue> {
  /** The current value (controlled). */
  value?: MaybeAccessor<RangeValue<T> | null>;
  /** The default value (uncontrolled). */
  defaultValue?: RangeValue<T> | null;
  /** Handler called when the value changes. */
  onChange?: (value: RangeValue<T>) => void;
  /** The minimum allowed date. */
  minValue?: MaybeAccessor<DateValue | undefined>;
  /** The maximum allowed date. */
  maxValue?: MaybeAccessor<DateValue | undefined>;
  /** Whether the calendar is disabled. */
  isDisabled?: MaybeAccessor<boolean>;
  /** Whether the calendar is read-only. */
  isReadOnly?: MaybeAccessor<boolean>;
  /** The date that is focused when the calendar first mounts. */
  focusedValue?: MaybeAccessor<DateValue | undefined>;
  /** The default focused date (uncontrolled). */
  defaultFocusedValue?: DateValue;
  /** Handler called when the focused date changes. */
  onFocusChange?: (date: CalendarDate) => void;
  /** The locale to use for formatting. */
  locale?: MaybeAccessor<string | undefined>;
  /** Creates a calendar object for a locale calendar identifier. */
  createCalendar?: (identifier: CalendarIdentifier) => InternationalizedCalendar;
  /** Callback to determine if a date is unavailable. */
  isDateUnavailable?: (date: DateValue) => boolean;
  /** The number of months to display at once. */
  visibleMonths?: number;
  /** Controls which days are disabled. */
  isDateDisabled?: (date: DateValue) => boolean;
  /** Validation state. */
  validationState?: MaybeAccessor<ValidationState | undefined>;
  /** Whether to allow selecting the same date for start and end. */
  allowsNonContiguousRanges?: boolean;
  /** The first day of the week (0 = Sunday, 1 = Monday, etc.). */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface RangeCalendarState<T extends DateValue = DateValue> {
  /** The currently selected date range. */
  value: Accessor<RangeValue<T> | null>;
  /** Sets the selected date range. */
  setValue: (value: RangeValue<T> | null) => void;
  /** The currently focused date. */
  focusedDate: Accessor<CalendarDate>;
  /** Sets the focused date. */
  setFocusedDate: (date: CalendarDate) => void;
  /** The anchor date when selecting a range (first click). */
  anchorDate: Accessor<CalendarDate | null>;
  /** Sets the anchor date. */
  setAnchorDate: (date: CalendarDate | null) => void;
  /** The highlighted range during selection. */
  highlightedRange: Accessor<RangeValue<CalendarDate> | null>;
  /** Whether the calendar is disabled. */
  isDisabled: Accessor<boolean>;
  /** Whether the calendar is read-only. */
  isReadOnly: Accessor<boolean>;
  /** The visible date range (first and last day of visible month(s)). */
  visibleRange: Accessor<{ start: CalendarDate; end: CalendarDate }>;
  /** The timezone used for date calculations. */
  timeZone: string;
  /** The locale used for formatting and locale-specific week starts. */
  locale: Accessor<string>;
  /** The explicitly requested first weekday, or undefined for the locale default. */
  firstDayOfWeek: Accessor<CalendarDayOfWeek | undefined>;
  /** The validation state. */
  validationState: Accessor<ValidationState | undefined>;
  /** Whether a date is within the selected range. */
  isSelected: (date: DateValue) => boolean;
  /** Whether a date is the start of the selection. */
  isSelectionStart: (date: DateValue) => boolean;
  /** Whether a date is the end of the selection. */
  isSelectionEnd: (date: DateValue) => boolean;
  /** Whether a date is focused. */
  isCellFocused: (date: DateValue) => boolean;
  /** Whether a date is unavailable. */
  isCellUnavailable: (date: DateValue) => boolean;
  /** Whether a date is disabled. */
  isCellDisabled: (date: DateValue) => boolean;
  /** Whether a date is outside the visible range. */
  isOutsideVisibleRange: (date: DateValue) => boolean;
  /** Whether a date is invalid. */
  isInvalid: (date: DateValue) => boolean;
  /** Moves focus to the previous page (month). */
  focusPreviousPage: () => void;
  /** Moves focus to the next page (month). */
  focusNextPage: () => void;
  /** Moves focus to the previous section (year). */
  focusPreviousSection: () => void;
  /** Moves focus to the next section (year). */
  focusNextSection: () => void;
  /** Moves focus to the previous day. */
  focusPreviousDay: () => void;
  /** Moves focus to the next day. */
  focusNextDay: () => void;
  /** Moves focus to the previous week. */
  focusPreviousWeek: () => void;
  /** Moves focus to the next week. */
  focusNextWeek: () => void;
  /** Moves focus to the start of the month. */
  focusPageStart: () => void;
  /** Moves focus to the end of the month. */
  focusPageEnd: () => void;
  /** Selects the focused date. */
  selectFocusedDate: () => void;
  /** Selects a specific date. */
  selectDate: (date: CalendarDate) => void;
  /** Whether focus is currently within the calendar. */
  isFocused: Accessor<boolean>;
  /** Sets whether focus is within the calendar. */
  setFocused: (focused: boolean) => void;
  /** Gets the dates for a week in the visible range. */
  getDatesInWeek: (weekIndex: number, monthStartDate?: CalendarDate) => (CalendarDate | null)[];
  /** Gets the number of weeks in a month. */
  getWeeksInMonth: (date?: CalendarDate) => number;
  /** The week day headers. */
  weekDays: Accessor<string[]>;
  /** The title for the calendar (formatted month and year). */
  title: Accessor<string>;
  /** The number of visible months. */
  visibleMonths: number;
  /** Whether the user is currently selecting a range. */
  isDragging: Accessor<boolean>;
  /** Sets whether the user is dragging to select. */
  setDragging: (dragging: boolean) => void;
}

/**
 * Provides state management for a range calendar component.
 */
export function createRangeCalendarState<T extends DateValue = CalendarDate>(
  props: RangeCalendarStateProps<T> = {},
): RangeCalendarState<T> {
  const timeZone = getLocalTimeZone();
  const locale = createMemo(() => access(props.locale) ?? "en-US");
  const resolvedOptions = createMemo(() => new DateFormatter(locale()).resolvedOptions());
  const calendar = createMemo(() =>
    (props.createCalendar ?? intlCreateCalendar)(resolvedOptions().calendar as CalendarIdentifier),
  );
  const visibleMonths = props.visibleMonths ?? 1;
  const firstDayOfWeekName = (): CalendarDayOfWeek | undefined =>
    props.firstDayOfWeek == null ? undefined : dayOfWeekNames[props.firstDayOfWeek];

  const toDisplayCalendarDate = (date: DateValue): CalendarDate =>
    intlToCalendar(toCalendarDate(date), calendar());

  const constrainDate = (date: CalendarDate): CalendarDate => {
    const minValue = access(props.minValue);
    const maxValue = access(props.maxValue);

    let constrained = date;

    if (minValue && constrained.compare(toDisplayCalendarDate(minValue)) < 0) {
      constrained = toDisplayCalendarDate(minValue);
    }
    if (maxValue && constrained.compare(toDisplayCalendarDate(maxValue)) > 0) {
      constrained = toDisplayCalendarDate(maxValue);
    }

    return constrained;
  };

  // Determine the initially focused date
  const getInitialFocusedDate = (): CalendarDate => {
    const controlledFocused = access(props.focusedValue);
    if (controlledFocused) {
      return toDisplayCalendarDate(controlledFocused);
    }
    if (props.defaultFocusedValue) {
      return toDisplayCalendarDate(props.defaultFocusedValue);
    }
    const controlledValue = access(props.value);
    if (controlledValue?.start) {
      return toDisplayCalendarDate(controlledValue.start);
    }
    if (props.defaultValue?.start) {
      return toDisplayCalendarDate(props.defaultValue.start);
    }
    return intlToCalendar(today(timeZone), calendar());
  };

  // State signals
  const [internalValue, setInternalValue] = createSignal<RangeValue<T> | null>(
    props.defaultValue ?? null,
  );
  const [focusedDate, setFocusedDateInternal] = createSignal<CalendarDate>(getInitialFocusedDate());
  const [anchorDate, setAnchorDate] = createSignal<CalendarDate | null>(null);
  const [isFocused, setFocused] = createSignal(false);
  const [isDragging, setDragging] = createSignal(false);

  // Controlled vs uncontrolled value
  const sourceValue = createMemo<RangeValue<T> | null>(() => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
  });
  const value = createMemo<RangeValue<T> | null>(() => {
    const currentValue = sourceValue();
    if (!currentValue) {
      return null;
    }

    return {
      start: toDisplayCalendarDate(currentValue.start) as unknown as T,
      end: toDisplayCalendarDate(currentValue.end) as unknown as T,
    };
  });

  // Derived states
  const isDisabled = createMemo(() => access(props.isDisabled) ?? false);
  const isReadOnly = createMemo(() => access(props.isReadOnly) ?? false);
  const validationState = createMemo(() => access(props.validationState));

  // Highlighted range during selection
  const highlightedRange = createMemo<RangeValue<CalendarDate> | null>(() => {
    const anchor = anchorDate();
    if (!anchor) {
      const v = value();
      if (v) {
        return {
          start: toDisplayCalendarDate(v.start),
          end: toDisplayCalendarDate(v.end),
        };
      }
      return null;
    }

    const focused = focusedDate();
    if (anchor.compare(focused) <= 0) {
      return { start: anchor, end: focused };
    }
    return { start: focused, end: anchor };
  });

  // Visible range based on focused date
  const visibleRange = createMemo(() => {
    const focused = focusedDate();
    const start = startOfMonth(focused);
    let end = endOfMonth(focused);

    for (let i = 1; i < visibleMonths; i++) {
      end = endOfMonth(end.add({ months: 1 }));
    }

    return { start, end };
  });

  createEffect(() => {
    const currentFocusedDate = focusedDate();
    const nextFocusedDate = toDisplayCalendarDate(currentFocusedDate);

    if (isEqualCalendar(currentFocusedDate.calendar, nextFocusedDate.calendar)) {
      return;
    }

    setFocusedDateInternal(nextFocusedDate);
  });

  // Format week days for headers
  const weekDays = createMemo(() => {
    const formatter = new DateFormatter(locale(), { weekday: "narrow" });
    const days: string[] = [];
    const weekStart = startOfWeek(today(timeZone), locale(), firstDayOfWeekName());

    for (let i = 0; i < 7; i++) {
      const day = weekStart.add({ days: i });
      days.push(formatter.format(day.toDate(timeZone)));
    }

    return days;
  });

  // Title (formatted month/year)
  const title = createMemo(() => {
    const formatter = new DateFormatter(locale(), {
      month: "long",
      year: "numeric",
      calendar: focusedDate().calendar.identifier,
    });
    const date = focusedDate();
    const formattableMonth = date.calendar.getFormattableMonth?.(date) ?? date;
    return formatter.format(formattableMonth.toDate(timeZone));
  });

  // Set value with onChange callback
  const setValue = (newValue: RangeValue<T> | null) => {
    if (isDisabled() || isReadOnly()) return;

    const oldValue = sourceValue();
    const nextValue = newValue
      ? {
          start: convertValue(
            constrainDate(toDisplayCalendarDate(newValue.start)),
            oldValue?.start,
          ) as T,
          end: convertValue(constrainDate(toDisplayCalendarDate(newValue.end)), oldValue?.end) as T,
        }
      : null;

    const controlled = access(props.value);
    if (controlled === undefined) {
      setInternalValue(() => nextValue);
    }

    if (nextValue && props.onChange) {
      props.onChange(nextValue);
    }
  };

  // Set focused date with constraints
  const setFocusedDate = (date: CalendarDate) => {
    const constrained = constrainDate(date);

    setFocusedDateInternal(constrained);
    props.onFocusChange?.(constrained);
  };

  // Check if a date is within the selected range
  const isSelected = (date: DateValue): boolean => {
    const range = highlightedRange();
    if (!range) return false;

    const calDate = toDisplayCalendarDate(date);
    return calDate.compare(range.start) >= 0 && calDate.compare(range.end) <= 0;
  };

  // Check if a date is the start of the selection
  const isSelectionStart = (date: DateValue): boolean => {
    const range = highlightedRange();
    if (!range) return false;
    return isSameDay(toDisplayCalendarDate(date), range.start);
  };

  // Check if a date is the end of the selection
  const isSelectionEnd = (date: DateValue): boolean => {
    const range = highlightedRange();
    if (!range) return false;
    return isSameDay(toDisplayCalendarDate(date), range.end);
  };

  // Check if a date is focused
  const isCellFocused = (date: DateValue): boolean => {
    return isSameDay(toDisplayCalendarDate(date), focusedDate());
  };

  // Check if a date is unavailable
  const isCellUnavailable = (date: DateValue): boolean => {
    return props.isDateUnavailable?.(date) ?? false;
  };

  // Check if a date is disabled
  const isCellDisabled = (date: DateValue): boolean => {
    if (isDisabled()) return true;
    if (props.isDateDisabled?.(date)) return true;

    const minValue = access(props.minValue);
    const maxValue = access(props.maxValue);
    const calDate = toDisplayCalendarDate(date);

    if (minValue && calDate.compare(toDisplayCalendarDate(minValue)) < 0) return true;
    if (maxValue && calDate.compare(toDisplayCalendarDate(maxValue)) > 0) return true;

    return false;
  };

  // Check if a date is outside the visible range
  const isOutsideVisibleRange = (date: DateValue): boolean => {
    const range = visibleRange();
    const calDate = toDisplayCalendarDate(date);
    return !isSameMonth(calDate, range.start) && !isSameMonth(calDate, range.end);
  };

  // Check if a date is invalid
  const isInvalid = (date: DateValue): boolean => {
    return isCellDisabled(date) || isCellUnavailable(date);
  };

  // Navigation methods
  const focusPreviousPage = () => {
    setFocusedDate(focusedDate().subtract({ months: 1 }));
  };

  const focusNextPage = () => {
    setFocusedDate(focusedDate().add({ months: 1 }));
  };

  const focusPreviousSection = () => {
    setFocusedDate(focusedDate().subtract({ years: 1 }));
  };

  const focusNextSection = () => {
    setFocusedDate(focusedDate().add({ years: 1 }));
  };

  const focusPreviousDay = () => {
    setFocusedDate(focusedDate().subtract({ days: 1 }));
  };

  const focusNextDay = () => {
    setFocusedDate(focusedDate().add({ days: 1 }));
  };

  const focusPreviousWeek = () => {
    setFocusedDate(focusedDate().subtract({ weeks: 1 }));
  };

  const focusNextWeek = () => {
    setFocusedDate(focusedDate().add({ weeks: 1 }));
  };

  const focusPageStart = () => {
    setFocusedDate(startOfMonth(focusedDate()));
  };

  const focusPageEnd = () => {
    setFocusedDate(endOfMonth(focusedDate()));
  };

  // Selection methods
  const selectFocusedDate = () => {
    if (isReadOnly() || isDisabled()) return;
    selectDate(focusedDate());
  };

  const selectDate = (date: CalendarDate) => {
    if (isReadOnly() || isDisabled()) return;
    if (isCellDisabled(date) || isCellUnavailable(date)) return;

    const anchor = anchorDate();

    if (!anchor) {
      // First click - set anchor
      setAnchorDate(date);
      setDragging(true);
    } else {
      // Second click - complete selection
      let start: CalendarDate;
      let end: CalendarDate;

      if (date.compare(anchor) < 0) {
        start = date;
        end = anchor;
      } else {
        start = anchor;
        end = date;
      }

      setValue({
        start: start as unknown as T,
        end: end as unknown as T,
      });
      setAnchorDate(null);
      setDragging(false);
    }

    setFocusedDate(date);
  };

  // Get dates in a specific week
  const getDatesInWeek = (
    weekIndex: number,
    monthStartDate?: CalendarDate,
  ): (CalendarDate | null)[] => {
    const startDate = monthStartDate ?? visibleRange().start;

    const monthStart = startOfMonth(startDate);
    const weekStart = startOfWeek(monthStart, locale(), firstDayOfWeekName());

    const week: (CalendarDate | null)[] = [];
    const firstDayOfWeek = weekStart.add({ weeks: weekIndex });

    for (let i = 0; i < 7; i++) {
      const date = firstDayOfWeek.add({ days: i });
      week.push(date);
    }

    return week;
  };

  // Get number of weeks in a month
  const getWeeksInMonthFn = (date?: CalendarDate): number => {
    const monthDate = date ?? focusedDate();
    return getWeeksInMonth(monthDate, locale(), firstDayOfWeekName());
  };

  return {
    value,
    setValue,
    focusedDate,
    setFocusedDate,
    anchorDate,
    setAnchorDate,
    highlightedRange,
    isDisabled,
    isReadOnly,
    visibleRange,
    timeZone,
    locale,
    firstDayOfWeek: firstDayOfWeekName,
    validationState,
    isSelected,
    isSelectionStart,
    isSelectionEnd,
    isCellFocused,
    isCellUnavailable,
    isCellDisabled,
    isOutsideVisibleRange,
    isInvalid,
    focusPreviousPage,
    focusNextPage,
    focusPreviousSection,
    focusNextSection,
    focusPreviousDay,
    focusNextDay,
    focusPreviousWeek,
    focusNextWeek,
    focusPageStart,
    focusPageEnd,
    selectFocusedDate,
    selectDate,
    isFocused,
    setFocused,
    getDatesInWeek,
    getWeeksInMonth: getWeeksInMonthFn,
    weekDays,
    title,
    visibleMonths,
    isDragging,
    setDragging,
  };
}

/**
 * Converts a DateValue to a CalendarDate.
 */
function toCalendarDate(date: DateValue): CalendarDate {
  return intlToCalendarDate(date);
}

function convertValue(newValue: CalendarDate, oldValue?: DateValue | null): DateValue {
  const localValue = intlToCalendar(newValue, oldValue?.calendar ?? new GregorianCalendar());

  if (oldValue && "hour" in oldValue) {
    return oldValue.set(localValue);
  }

  return localValue;
}
