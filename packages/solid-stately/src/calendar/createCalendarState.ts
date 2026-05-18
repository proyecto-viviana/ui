/**
 * CalendarState for Solid-Stately
 *
 * Provides state management for calendar components.
 * Based on @react-stately/calendar useCalendarState
 */

import { createSignal, createMemo, createEffect, type Accessor } from "solid-js";
import {
  type CalendarDate,
  type DateValue,
  today,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  getWeeksInMonth,
  DateFormatter,
  toCalendarDate as intlToCalendarDate,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";

export type ValidationState = "valid" | "invalid";
export type CalendarPageBehavior = "single" | "visible";
export type CalendarSelectionAlignment = "start" | "center" | "end";
export type CalendarDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const dayOfWeekNames: CalendarDayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export interface CalendarStateProps<T extends DateValue = DateValue> {
  /** The current value (controlled). */
  value?: MaybeAccessor<T | null>;
  /** The default value (uncontrolled). */
  defaultValue?: T | null;
  /** Handler called when the value changes. */
  onChange?: (value: T) => void;
  /** The minimum allowed date. */
  minValue?: MaybeAccessor<DateValue | undefined>;
  /** The maximum allowed date. */
  maxValue?: MaybeAccessor<DateValue | undefined>;
  /** Whether the calendar is disabled. */
  isDisabled?: MaybeAccessor<boolean>;
  /** Whether the calendar is read-only. */
  isReadOnly?: MaybeAccessor<boolean>;
  /** Whether dates outside the visible range are automatically focused. */
  autoFocus?: boolean;
  /** The date that is focused when the calendar first mounts. */
  focusedValue?: MaybeAccessor<DateValue | undefined>;
  /** The default focused date (uncontrolled). */
  defaultFocusedValue?: DateValue;
  /** Handler called when the focused date changes. */
  onFocusChange?: (date: CalendarDate) => void;
  /** The locale to use for formatting. */
  locale?: MaybeAccessor<string | undefined>;
  /** Callback that is called for each date in the calendar to determine if it is unavailable. */
  isDateUnavailable?: (date: DateValue) => boolean;
  /** The number of months to display at once. */
  visibleMonths?: number;
  /** Controls whether paging advances by one month or by the visible month range. */
  pageBehavior?: CalendarPageBehavior;
  /** Determines how the visible months align around the initial focused date. */
  selectionAlignment?: CalendarSelectionAlignment;
  /** Whether to automatically focus the calendar when it is mounted. */
  autoFocusOnMount?: boolean;
  /** Controls which days are disabled. */
  isDateDisabled?: (date: DateValue) => boolean;
  /** Validation state. */
  validationState?: MaybeAccessor<ValidationState | undefined>;
  /** Error message. */
  errorMessage?: string;
  /** The first day of the week (0 = Sunday, 1 = Monday, etc.). */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface CalendarState<T extends DateValue = DateValue> {
  /** The currently selected date. */
  value: Accessor<T | null>;
  /** Sets the selected date. */
  setValue: (value: T | null) => void;
  /** The currently focused date. */
  focusedDate: Accessor<CalendarDate>;
  /** Sets the focused date. */
  setFocusedDate: (date: CalendarDate) => void;
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
  /** Whether a date is selected. */
  isSelected: (date: DateValue) => boolean;
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
  /** Whether the calendar is paginating (for animations). */
  isPaginating: Accessor<boolean>;
}

/**
 * Provides state management for a calendar component.
 */
export function createCalendarState<T extends DateValue = CalendarDate>(
  props: CalendarStateProps<T> = {},
): CalendarState<T> {
  const timeZone = getLocalTimeZone();
  const locale = createMemo(() => access(props.locale) ?? "en-US");
  const visibleMonths = props.visibleMonths ?? 1;
  const firstDayOfWeekName = (): CalendarDayOfWeek | undefined =>
    props.firstDayOfWeek == null ? undefined : dayOfWeekNames[props.firstDayOfWeek];

  const selectionAlignmentOffset = (): number => {
    switch (props.selectionAlignment) {
      case "end":
        return Math.max(visibleMonths - 1, 0);
      case "center": {
        let halfDuration = Math.floor(visibleMonths / 2);
        if (halfDuration > 0 && visibleMonths % 2 === 0) {
          halfDuration--;
        }
        return halfDuration;
      }
      case "start":
      default:
        return 0;
    }
  };

  const alignVisibleRangeStart = (date: CalendarDate): CalendarDate => {
    const offset = selectionAlignmentOffset();
    return startOfMonth(offset > 0 ? date.subtract({ months: offset }) : date);
  };

  const visibleRangeEnd = (start: CalendarDate): CalendarDate => {
    let end = endOfMonth(start);

    for (let i = 1; i < visibleMonths; i++) {
      end = endOfMonth(end.add({ months: 1 }));
    }

    return end;
  };

  const constrainDate = (date: CalendarDate): CalendarDate => {
    const minValue = access(props.minValue);
    const maxValue = access(props.maxValue);

    let constrained = date;

    if (minValue && date.compare(toCalendarDate(minValue)) < 0) {
      constrained = toCalendarDate(minValue);
    }
    if (maxValue && date.compare(toCalendarDate(maxValue)) > 0) {
      constrained = toCalendarDate(maxValue);
    }

    return constrained;
  };

  // Determine the initially focused date
  const getInitialFocusedDate = (): CalendarDate => {
    const controlledFocused = access(props.focusedValue);
    if (controlledFocused) {
      return toCalendarDate(controlledFocused);
    }
    if (props.defaultFocusedValue) {
      return toCalendarDate(props.defaultFocusedValue);
    }
    const controlledValue = access(props.value);
    if (controlledValue) {
      return toCalendarDate(controlledValue);
    }
    if (props.defaultValue) {
      return toCalendarDate(props.defaultValue);
    }
    return today(timeZone);
  };

  // State signals
  const initialFocusedDate = getInitialFocusedDate();
  const [internalValue, setInternalValue] = createSignal<T | null>(props.defaultValue ?? null);
  const [focusedDate, setFocusedDateInternal] = createSignal<CalendarDate>(initialFocusedDate);
  const [visibleRangeStart, setVisibleRangeStart] = createSignal<CalendarDate>(
    alignVisibleRangeStart(initialFocusedDate),
  );
  const [isFocused, setFocused] = createSignal(false);
  const [isPaginating, setIsPaginating] = createSignal(false);

  // Controlled vs uncontrolled value
  const value = createMemo<T | null>(() => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
  });

  // Derived states
  const isDisabled = createMemo(() => access(props.isDisabled) ?? false);
  const isReadOnly = createMemo(() => access(props.isReadOnly) ?? false);
  const validationState = createMemo(() => access(props.validationState));

  // Visible range based on the paged range start.
  const visibleRange = createMemo(() => {
    const start = visibleRangeStart();
    const end = visibleRangeEnd(start);

    return { start, end };
  });

  createEffect(() => {
    const controlledFocused = access(props.focusedValue);
    if (!controlledFocused) {
      return;
    }

    const nextFocusedDate = constrainDate(toCalendarDate(controlledFocused));
    const range = visibleRange();

    if (!isSameDay(nextFocusedDate, focusedDate())) {
      setFocusedDateInternal(nextFocusedDate);
    }

    if (nextFocusedDate.compare(range.start) < 0) {
      setVisibleRangeStart(startOfMonth(nextFocusedDate.subtract({ months: visibleMonths - 1 })));
    } else if (nextFocusedDate.compare(range.end) > 0) {
      setVisibleRangeStart(startOfMonth(nextFocusedDate));
    }
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
    });
    return formatter.format(focusedDate().toDate(timeZone));
  });

  // Set value with onChange callback
  const setValue = (newValue: T | null) => {
    if (isDisabled() || isReadOnly()) return;

    const controlled = access(props.value);
    if (controlled === undefined) {
      setInternalValue(() => newValue);
    }

    if (newValue && props.onChange) {
      props.onChange(newValue);
    }
  };

  // Set focused date with constraints
  const setFocusedDate = (date: CalendarDate) => {
    const constrained = constrainDate(date);
    const range = visibleRange();

    if (constrained.compare(range.start) < 0) {
      setVisibleRangeStart(startOfMonth(constrained.subtract({ months: visibleMonths - 1 })));
    } else if (constrained.compare(range.end) > 0) {
      setVisibleRangeStart(startOfMonth(constrained));
    }

    setFocusedDateInternal(constrained);
    props.onFocusChange?.(constrained);
  };

  // Check if a date is selected
  const isSelected = (date: DateValue): boolean => {
    const v = value();
    if (!v) return false;
    return isSameDay(toCalendarDate(date), toCalendarDate(v));
  };

  // Check if a date is focused
  const isCellFocused = (date: DateValue): boolean => {
    return isSameDay(toCalendarDate(date), focusedDate());
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
    const calDate = toCalendarDate(date);

    if (minValue && calDate.compare(toCalendarDate(minValue)) < 0) return true;
    if (maxValue && calDate.compare(toCalendarDate(maxValue)) > 0) return true;

    return false;
  };

  // Check if a date is outside the visible range
  const isOutsideVisibleRange = (date: DateValue): boolean => {
    const range = visibleRange();
    const calDate = toCalendarDate(date);
    return !isSameMonth(calDate, range.start) && !isSameMonth(calDate, range.end);
  };

  // Check if a date is invalid
  const isInvalid = (date: DateValue): boolean => {
    return isCellDisabled(date) || isCellUnavailable(date);
  };

  // Navigation methods
  const focusPreviousPage = () => {
    setIsPaginating(true);
    const pageMonths = props.pageBehavior === "single" ? 1 : visibleMonths;
    const nextFocusedDate = constrainDate(focusedDate().subtract({ months: pageMonths }));
    setFocusedDateInternal(nextFocusedDate);
    setVisibleRangeStart(startOfMonth(visibleRangeStart().subtract({ months: pageMonths })));
    props.onFocusChange?.(nextFocusedDate);
    setIsPaginating(false);
  };

  const focusNextPage = () => {
    setIsPaginating(true);
    const pageMonths = props.pageBehavior === "single" ? 1 : visibleMonths;
    const nextFocusedDate = constrainDate(focusedDate().add({ months: pageMonths }));
    setFocusedDateInternal(nextFocusedDate);
    setVisibleRangeStart(startOfMonth(visibleRangeStart().add({ months: pageMonths })));
    props.onFocusChange?.(nextFocusedDate);
    setIsPaginating(false);
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
    const date = focusedDate();
    if (!isCellDisabled(date) && !isCellUnavailable(date)) {
      setValue(date as unknown as T);
    }
  };

  const selectDate = (date: CalendarDate) => {
    if (isReadOnly() || isDisabled()) return;
    if (!isCellDisabled(date) && !isCellUnavailable(date)) {
      setValue(date as unknown as T);
      setFocusedDate(date);
    }
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
      // Only include dates that are in the same month
      if (isSameMonth(date, startDate)) {
        week.push(date);
      } else {
        week.push(date); // Still include for proper grid alignment
      }
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
    isDisabled,
    isReadOnly,
    visibleRange,
    timeZone,
    locale,
    firstDayOfWeek: firstDayOfWeekName,
    validationState,
    isSelected,
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
    isPaginating,
  };
}

/**
 * Converts a DateValue to a CalendarDate.
 */
function toCalendarDate(date: DateValue): CalendarDate {
  // Use the library function to convert
  return intlToCalendarDate(date);
}
