/**
 * DatePickerState for Solid-Stately
 *
 * Provides unified state management for DatePicker components.
 * Based on @react-stately/datepicker useDatePickerState
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import {
  type DateValue,
  type CalendarDateTime,
  Time,
  DateFormatter,
  toCalendarDate,
  toCalendarDateTime,
  toZoned,
  getLocalTimeZone,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";
import type { ValidationState } from "./createCalendarState";
import type { TimeValue } from "./createTimeFieldState";

export type Granularity = "day" | "hour" | "minute" | "second";

export type DatePickerStateProps<T extends DateValue = DateValue> = DatePickerStateOptions<T>;

export interface DatePickerStateOptions<T extends DateValue = DateValue> {
  value?: MaybeAccessor<T | null>;
  defaultValue?: T | null;
  onChange?: (value: T | null) => void;
  minValue?: MaybeAccessor<DateValue | undefined>;
  maxValue?: MaybeAccessor<DateValue | undefined>;
  isDisabled?: MaybeAccessor<boolean>;
  isReadOnly?: MaybeAccessor<boolean>;
  isRequired?: MaybeAccessor<boolean>;
  granularity?: Granularity;
  hourCycle?: 12 | 24;
  hideTimeZone?: boolean;
  placeholderValue?: DateValue;
  shouldCloseOnSelect?: boolean | (() => boolean);
  isDateUnavailable?: (date: DateValue) => boolean;
  validationState?: MaybeAccessor<ValidationState | undefined>;
}

export interface DatePickerState<T extends DateValue = DateValue> {
  value: Accessor<T | null>;
  defaultValue: T | null;
  setValue: (value: T | null) => void;
  dateValue: Accessor<DateValue | null>;
  setDateValue: (value: DateValue) => void;
  timeValue: Accessor<TimeValue | null>;
  setTimeValue: (value: TimeValue) => void;
  granularity: Granularity;
  hasTime: boolean;
  isOpen: Accessor<boolean>;
  open: () => void;
  close: () => void;
  setOpen: (isOpen: boolean) => void;
  isInvalid: Accessor<boolean>;
  validationState: Accessor<ValidationState | undefined>;
  builtinValidation: Accessor<{ isInvalid: boolean }>;
  showEra: Accessor<boolean>;
  formatValue: (locale: string, fieldOptions?: Intl.DateTimeFormatOptions) => string;
  getDateFormatter: (locale: string, formatOptions?: Intl.DateTimeFormatOptions) => DateFormatter;
}

/**
 * Provides unified state management for a DatePicker component.
 */
export function createDatePickerState<T extends DateValue = DateValue>(
  props: DatePickerStateOptions<T> = {},
): DatePickerState<T> {
  const timeZone = getLocalTimeZone();

  // Internal signals for value and overlay state
  const [internalValue, setInternalValue] = createSignal<T | null>(props.defaultValue ?? null);
  const [isOpen, setIsOpen] = createSignal(false);

  // Transient selections for date and time
  const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);
  const [selectedTime, setSelectedTime] = createSignal<TimeValue | null>(null);

  // Controlled vs uncontrolled value
  const value = createMemo<T | null>(() => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
  });

  // Granularity: auto-detect from value type if not provided
  const granularity = createMemo<Granularity>(() => {
    if (props.granularity) return props.granularity;
    const v = value();
    if (v && "hour" in v) {
      if ("second" in v) return "second";
      return "minute";
    }
    return "day";
  });

  const hasTime = createMemo(() => {
    const g = granularity();
    return g === "hour" || g === "minute" || g === "second";
  });

  // Derived states
  const isDisabled = createMemo(() => access(props.isDisabled) ?? false);
  const isReadOnly = createMemo(() => access(props.isReadOnly) ?? false);
  const validationState = createMemo(() => access(props.validationState));

  // Date and time portions of the current value
  const dateValue = createMemo<DateValue | null>(() => {
    const v = value();
    if (!v) return null;
    return toCalendarDate(v);
  });

  const timeValue = createMemo<TimeValue | null>(() => {
    const v = value();
    if (!v || !("hour" in v)) return null;
    return v as unknown as TimeValue;
  });

  // Helper to resolve placeholder time (midnight fallback)
  const getPlaceholderTime = (): TimeValue => {
    const placeholder = props.placeholderValue;
    if (placeholder && "hour" in placeholder) {
      return placeholder as TimeValue;
    }
    return new Time(0, 0, 0);
  };

  // Commit combined date + time value
  const commitValue = (date: DateValue, time: TimeValue | null) => {
    if (isDisabled() || isReadOnly()) return;

    let combined: DateValue;
    if (time && hasTime()) {
      combined = toCalendarDateTime(date, time);
    } else {
      combined = date;
    }

    // Preserve ZonedDateTime timezone if the current committed value has one
    const current = value();
    if (current && "timeZone" in current && !("timeZone" in combined)) {
      combined = toZoned(combined as CalendarDateTime, current.timeZone);
    }

    // Clear transient states
    setSelectedDate(null);
    setSelectedTime(null);

    // Update internal state if uncontrolled
    const controlled = access(props.value);
    if (controlled === undefined) {
      setInternalValue(() => combined as T);
    }

    if (props.onChange) {
      props.onChange(combined as T);
    }
  };

  // Set the full value directly
  const setValue = (newValue: T | null) => {
    if (isDisabled() || isReadOnly()) return;

    const controlled = access(props.value);
    if (controlled === undefined) {
      setInternalValue(() => newValue);
    }

    if (props.onChange) {
      props.onChange(newValue);
    }

    // Clear transient states
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Select a date (may commit if time is already selected or shouldCloseOnSelect)
  const setDateValue = (date: DateValue) => {
    if (isDisabled() || isReadOnly()) return;

    const currentTime = selectedTime();
    const currentValue = value();
    const shouldClose =
      typeof props.shouldCloseOnSelect === "function"
        ? props.shouldCloseOnSelect()
        : (props.shouldCloseOnSelect ?? true);

    if (hasTime() && (currentTime || shouldClose)) {
      // Preserve existing time from committed value if user hasn't explicitly selected a new time
      const existingTime =
        currentTime ??
        (currentValue && "hour" in currentValue ? (currentValue as unknown as TimeValue) : null);
      const timePart = existingTime ?? getPlaceholderTime();
      commitValue(date, timePart);

      if (shouldClose) {
        setIsOpen(false);
      }
    } else if (hasTime()) {
      // Store date transiently, waiting for time selection
      setSelectedDate(date);
    } else {
      // No time needed, commit immediately
      commitValue(date, null);

      if (shouldClose) {
        setIsOpen(false);
      }
    }
  };

  // Select a time (may commit if date is already selected)
  const setTimeValue = (time: TimeValue) => {
    if (isDisabled() || isReadOnly()) return;

    const currentDate = selectedDate();
    const currentValue = value();

    if (currentDate) {
      // We have a transient date, commit combined
      commitValue(currentDate, time);
    } else if (currentValue && hasTime()) {
      // We have an existing value with time, update the time portion
      const datePart = toCalendarDate(currentValue);
      commitValue(datePart, time);
    } else {
      // Store time transiently, waiting for date selection
      setSelectedTime(time);
    }
  };

  // Open / close helpers
  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const setOpen = (openValue: boolean) => {
    if (openValue) {
      setIsOpen(true);
    } else {
      // When closing, only commit if both date and time are available (when time is required).
      // Don't auto-commit partial selections with placeholder time to avoid phantom values.
      const currentValue = value();
      const currentDate = selectedDate();
      const currentTime = selectedTime();

      if (!currentValue && currentDate && hasTime() && currentTime) {
        // Both date and time explicitly selected — safe to commit
        commitValue(currentDate, currentTime);
      }

      // Clear any remaining transient state
      setSelectedDate(null);
      setSelectedTime(null);
      setIsOpen(false);
    }
  };

  // Builtin validation against minValue, maxValue, and isDateUnavailable
  const builtinValidation = createMemo(() => {
    const v = value();
    if (!v) return { isInvalid: false };

    const minValue = access(props.minValue);
    const maxValue = access(props.maxValue);

    if (minValue && v.compare(minValue) < 0) return { isInvalid: true };
    if (maxValue && v.compare(maxValue) > 0) return { isInvalid: true };
    if (props.isDateUnavailable?.(v)) return { isInvalid: true };

    return { isInvalid: false };
  });

  const isInvalid = createMemo(() => {
    return builtinValidation().isInvalid || validationState() === "invalid";
  });

  // Show era for BC dates
  const showEra = createMemo(() => {
    const v = value();
    return v ? v.year < 1 : false;
  });

  // Format the current value using DateFormatter with era support for BC dates
  const formatValue = (locale: string, fieldOptions?: Intl.DateTimeFormatOptions): string => {
    const v = value();
    if (!v) return "";

    const options: Intl.DateTimeFormatOptions = { ...fieldOptions };

    // Add era for BC dates
    if (v.year < 1) {
      options.era = "short";
    }

    const formatter = new DateFormatter(locale, options);
    return formatter.format(v.toDate(timeZone));
  };

  // Get a DateFormatter instance
  const getDateFormatter = (
    locale: string,
    formatOptions?: Intl.DateTimeFormatOptions,
  ): DateFormatter => {
    return new DateFormatter(locale, formatOptions);
  };

  return {
    value,
    defaultValue: props.defaultValue ?? null,
    setValue,
    dateValue,
    setDateValue,
    timeValue,
    setTimeValue,
    get granularity() {
      return granularity();
    },
    get hasTime() {
      return hasTime();
    },
    isOpen,
    open,
    close,
    setOpen,
    isInvalid,
    validationState,
    builtinValidation,
    showEra,
    formatValue,
    getDateFormatter,
  };
}
