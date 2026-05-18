/**
 * RangeCalendarState for Solid-Stately
 *
 * Provides state management for range calendar components.
 * Based on @react-stately/calendar useRangeCalendarState
 */
import { type Accessor } from "solid-js";
import {
  type Calendar as InternationalizedCalendar,
  type CalendarDate,
  type CalendarIdentifier,
  type DateValue,
} from "@internationalized/date";
import { type MaybeAccessor } from "../utils";
import type { CalendarDayOfWeek, ValidationState } from "./createCalendarState";
type RangeCalendarSelectionAlignment = "start" | "center" | "end";
type RangeCalendarPageBehavior = "single" | "visible";
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
  onChange?: (value: RangeValue<T> | null) => void;
  /** The minimum allowed date. */
  minValue?: MaybeAccessor<DateValue | undefined>;
  /** The maximum allowed date. */
  maxValue?: MaybeAccessor<DateValue | undefined>;
  /** Whether the calendar is disabled. */
  isDisabled?: MaybeAccessor<boolean>;
  /** Whether the calendar is read-only. */
  isReadOnly?: MaybeAccessor<boolean>;
  /** The date that is focused when the calendar first mounts. */
  focusedValue?: MaybeAccessor<DateValue | null | undefined>;
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
  /** Controls how the initial visible months are aligned around the current value. */
  selectionAlignment?: RangeCalendarSelectionAlignment;
  /** Controls whether pagination moves by one month or the visible month count. */
  pageBehavior?: RangeCalendarPageBehavior;
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
  visibleRange: Accessor<{
    start: CalendarDate;
    end: CalendarDate;
  }>;
  /** The timezone used for date calculations. */
  timeZone: string;
  /** The locale used for formatting and locale-specific week starts. */
  locale: Accessor<string>;
  /** The explicitly requested first weekday, or undefined for the locale default. */
  firstDayOfWeek: Accessor<CalendarDayOfWeek | undefined>;
  /** The validation state. */
  validationState: Accessor<ValidationState | undefined>;
  /** Whether the current value is invalid according to validation state. */
  isValueInvalid: Accessor<boolean>;
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
  /** Whether the previous visible range would be outside the allowed date range. */
  isPreviousVisibleRangeInvalid: () => boolean;
  /** Whether the next visible range would be outside the allowed date range. */
  isNextVisibleRangeInvalid: () => boolean;
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
export declare function createRangeCalendarState<T extends DateValue = CalendarDate>(
  props?: RangeCalendarStateProps<T>,
): RangeCalendarState<T>;
//# sourceMappingURL=createRangeCalendarState.d.ts.map
