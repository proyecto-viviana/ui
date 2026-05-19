/**
 * DateFieldState for Solid-Stately
 *
 * Provides state management for date field components with segment-based editing.
 * Based on @react-stately/datepicker useDateFieldState
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import {
  CalendarDate,
  type CalendarDateTime,
  type DateValue,
  today,
  getLocalTimeZone,
  DateFormatter,
  toCalendarDate as intlToCalendarDate,
  toCalendarDateTime,
  endOfMonth,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";
import type { ValidationState } from "./createCalendarState";

export type DateSegmentType =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "dayPeriod"
  | "era"
  | "timeZoneName"
  | "literal";

export interface DateSegment {
  /** The type of segment. */
  type: DateSegmentType;
  /** The text content of the segment. */
  text: string;
  /** The numeric value of the segment (if applicable). */
  value?: number;
  /** The minimum value for the segment. */
  minValue?: number;
  /** The maximum value for the segment. */
  maxValue?: number;
  /** Whether this segment is editable. */
  isEditable: boolean;
  /** Whether this segment is a placeholder. */
  isPlaceholder: boolean;
  /** A placeholder string for the segment. */
  placeholder: string;
}

export interface DateFieldStateProps<T extends DateValue = DateValue> {
  /** The current value (controlled). */
  value?: MaybeAccessor<T | null>;
  /** The default value (uncontrolled). */
  defaultValue?: T | null;
  /** Handler called when the value changes. */
  onChange?: (value: T | null) => void;
  /** The minimum allowed date. */
  minValue?: MaybeAccessor<DateValue | undefined>;
  /** The maximum allowed date. */
  maxValue?: MaybeAccessor<DateValue | undefined>;
  /** Whether the field is disabled. */
  isDisabled?: MaybeAccessor<boolean>;
  /** Whether the field is read-only. */
  isReadOnly?: MaybeAccessor<boolean>;
  /** Whether the field is required. */
  isRequired?: MaybeAccessor<boolean>;
  /** The locale to use for formatting. */
  locale?: string;
  /** The granularity of the date/time (day, hour, minute, second). */
  granularity?: "day" | "hour" | "minute" | "second";
  /** Whether to show the hour in 12 or 24 hour format. */
  hourCycle?: 12 | 24;
  /** Whether to hide the time zone. */
  hideTimeZone?: boolean;
  /** The placeholder date (determines segment structure). */
  placeholderValue?: DateValue;
  /** Validation state. */
  validationState?: MaybeAccessor<ValidationState | undefined>;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string;
  /** Whether dates outside the min/max range are allowed. */
  allowsNonContiguousRanges?: boolean;
  /** Whether to create a date or datetime. */
  createCalendar?: (name: string) => unknown;
  /** Whether a date is unavailable. */
  isDateUnavailable?: (date: DateValue) => boolean;
}

export interface DateFieldState<T extends DateValue = DateValue> {
  /** The current value. */
  value: Accessor<T | null>;
  /** The date value (may be partial during editing). */
  dateValue: Accessor<DateValue | null>;
  /** Sets the date value. */
  setValue: (value: T | null) => void;
  /** The segments that make up the date. */
  segments: Accessor<DateSegment[]>;
  /** The format string. */
  formatValue: (fieldOptions?: Intl.DateTimeFormatOptions) => string;
  /** Sets a segment value. */
  setSegment: (type: DateSegmentType, value: number) => void;
  /** Increments a segment. */
  incrementSegment: (type: DateSegmentType) => void;
  /** Decrements a segment. */
  decrementSegment: (type: DateSegmentType) => void;
  /** Clears a segment. */
  clearSegment: (type: DateSegmentType) => void;
  /** Confirms the value (after typing). */
  confirmPlaceholder: () => void;
  /** Whether the field is disabled. */
  isDisabled: Accessor<boolean>;
  /** Whether the field is read-only. */
  isReadOnly: Accessor<boolean>;
  /** Whether the field is required. */
  isRequired: Accessor<boolean>;
  /** The validation state. */
  validationState: Accessor<ValidationState | undefined>;
  /** The granularity. */
  granularity: "day" | "hour" | "minute" | "second";
  /** Whether the value is invalid. */
  isInvalid: Accessor<boolean>;
  /** The locale. */
  locale: string;
  /** The time zone. */
  timeZone: string;
  /** The default value. */
  defaultValue: T | null;
}

/**
 * Provides state management for a date field component.
 */
export function createDateFieldState<T extends DateValue = CalendarDate>(
  props: DateFieldStateProps<T> = {},
): DateFieldState<T> {
  const timeZone = getLocalTimeZone();
  const locale = props.locale ?? "en-US";
  const granularity = props.granularity ?? "day";

  // State signals
  const initialValue = props.defaultValue ?? null;
  const [internalValue, setInternalValue] = createSignal<T | null>(initialValue);

  // Track partial values during editing
  const [placeholderDate, setPlaceholderDate] = createSignal<Partial<DateParts>>({});

  // Controlled vs uncontrolled value
  const value = createMemo<T | null>(() => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
  });

  // The effective date value
  const dateValue = createMemo<DateValue | null>(() => {
    const v = value();
    if (v) return v;

    // Build from placeholder parts
    const parts = placeholderDate();
    const placeholder = props.placeholderValue ?? today(timeZone);

    if (Object.keys(parts).length === 0) return null;

    // Create a date from the parts
    const year = parts.year ?? placeholder.year;
    const month = parts.month ?? placeholder.month;
    const day = parts.day ?? placeholder.day;

    if (granularity === "day") {
      return intlToCalendarDate(placeholder).set({ year, month, day });
    }

    // For time granularities
    const hour = parts.hour ?? 0;
    const minute = parts.minute ?? 0;
    const second = parts.second ?? 0;

    return toCalendarDateTime(placeholder).set({
      year,
      month,
      day,
      hour,
      minute,
      second,
    }) as unknown as T;
  });

  // Derived states
  const isDisabled = createMemo(() => access(props.isDisabled) ?? false);
  const isReadOnly = createMemo(() => access(props.isReadOnly) ?? false);
  const isRequired = createMemo(() => access(props.isRequired) ?? false);
  const validationState = createMemo(() => access(props.validationState));

  // Check if value is invalid
  const isInvalid = createMemo(() => {
    const v = value();
    if (!v) return false;

    const minValue = access(props.minValue);
    const maxValue = access(props.maxValue);

    if (minValue && v.compare(minValue) < 0) return true;
    if (maxValue && v.compare(maxValue) > 0) return true;
    if (props.isDateUnavailable?.(v)) return true;

    return validationState() === "invalid";
  });

  // Generate segments based on granularity and locale
  const segments = createMemo<DateSegment[]>(() => {
    const v = value();
    const placeholder = props.placeholderValue ?? today(timeZone);
    const parts = placeholderDate();

    const segs: DateSegment[] = [];

    // Determine format options based on granularity
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    if (granularity !== "day") {
      formatOptions.hour = "2-digit";
      formatOptions.minute = "2-digit";
      if (granularity === "second") {
        formatOptions.second = "2-digit";
      }
      if (props.hourCycle) {
        formatOptions.hourCycle = props.hourCycle === 12 ? "h12" : "h23";
      }
    }

    const formatter = new DateFormatter(locale, formatOptions);
    const dateToFormat = v ?? placeholder;
    const formattedParts = formatter.formatToParts(dateToFormat.toDate(timeZone));

    for (const part of formattedParts) {
      const type = mapPartType(part.type);

      if (type === "literal") {
        segs.push({
          type: "literal",
          text: part.value,
          isEditable: false,
          isPlaceholder: false,
          placeholder: part.value,
        });
      } else if (type) {
        const segValue = getSegmentValue(v, type);
        const partValue = parts[type as keyof DateParts];
        const hasValue = v !== null || partValue !== undefined;

        segs.push({
          type,
          text: hasValue ? part.value : getPlaceholderText(type, locale, granularity),
          value: segValue ?? partValue,
          minValue: getMinValue(type),
          maxValue: getMaxValue(type, v ?? placeholder),
          isEditable: !isDisabled() && !isReadOnly(),
          isPlaceholder: !hasValue,
          placeholder: getPlaceholderText(type, locale, granularity),
        });
      }
    }

    return segs;
  });

  // Set value with onChange callback
  const setValue = (newValue: T | null) => {
    if (isDisabled() || isReadOnly()) return;

    const controlled = access(props.value);
    if (controlled === undefined) {
      setInternalValue(() => newValue);
    }

    if (props.onChange) {
      props.onChange(newValue);
    }

    // Clear placeholder parts
    setPlaceholderDate({});
  };

  // Set a specific segment value
  const setSegment = (type: DateSegmentType, newValue: number) => {
    if (isDisabled() || isReadOnly()) return;

    const v = value();

    if (v) {
      // Update existing value
      const updated = updateDatePart(v, type, newValue);
      setValue(updated as T);
    } else {
      // Update placeholder parts
      setPlaceholderDate((prev) => ({
        ...prev,
        [type]: newValue,
      }));
    }
  };

  // Increment a segment
  const incrementSegment = (type: DateSegmentType) => {
    if (isDisabled() || isReadOnly()) return;

    const v = value();
    const current = v ? getSegmentValue(v, type) : placeholderDate()[type as keyof DateParts];
    const max = getMaxValue(type, v ?? props.placeholderValue ?? today(timeZone));
    const min = getMinValue(type);

    const newValue = current !== undefined ? current + 1 : min;
    setSegment(type, newValue > max ? min : newValue);
  };

  // Decrement a segment
  const decrementSegment = (type: DateSegmentType) => {
    if (isDisabled() || isReadOnly()) return;

    const v = value();
    const current = v ? getSegmentValue(v, type) : placeholderDate()[type as keyof DateParts];
    const max = getMaxValue(type, v ?? props.placeholderValue ?? today(timeZone));
    const min = getMinValue(type);

    const newValue = current !== undefined ? current - 1 : max;
    setSegment(type, newValue < min ? max : newValue);
  };

  // Clear a segment
  const clearSegment = (type: DateSegmentType) => {
    if (isDisabled() || isReadOnly()) return;
    if (type === "literal") return;

    const v = value();
    if (v) {
      // Reset only the target segment to its minimum value instead of clearing the entire value
      const min = getMinValue(type);
      const updated = updateDatePart(v, type, min);
      setValue(updated as T);
    } else {
      setPlaceholderDate((prev) => {
        const next = { ...prev };
        delete next[type as keyof DateParts];
        return next;
      });
    }
  };

  // Confirm placeholder value
  const confirmPlaceholder = () => {
    if (isDisabled() || isReadOnly()) return;

    const minValue = access(props.minValue);
    const maxValue = access(props.maxValue);
    const constrain = (candidate: DateValue): DateValue => {
      if (minValue && candidate.compare(minValue) < 0) {
        return minValue;
      }
      if (maxValue && candidate.compare(maxValue) > 0) {
        return maxValue;
      }
      return candidate;
    };

    const parts = placeholderDate();
    if (Object.keys(parts).length > 0) {
      const dv = dateValue();
      if (dv) {
        const candidate = constrain(dv);
        // Commit even if unavailable so isInvalid can flag it; don't leave field stuck
        setValue(candidate as T);
      }
      return;
    }

    const current = value();
    if (current) {
      const constrained = constrain(current);
      // Apply min/max constraints even if unavailable; isInvalid will flag unavailable dates
      if (constrained.compare(current) !== 0) {
        setValue(constrained as T);
      }
    }
  };

  // Format the current value
  const formatValue = (fieldOptions?: Intl.DateTimeFormatOptions): string => {
    const v = value();
    if (!v) return "";

    const options: Intl.DateTimeFormatOptions = fieldOptions ?? {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    if (granularity !== "day") {
      options.hour = "2-digit";
      options.minute = "2-digit";
      if (granularity === "second") {
        options.second = "2-digit";
      }
    }

    const formatter = new DateFormatter(locale, options);
    return formatter.format(v.toDate(timeZone));
  };

  return {
    value,
    defaultValue: initialValue,
    dateValue,
    setValue,
    segments,
    formatValue,
    setSegment,
    incrementSegment,
    decrementSegment,
    clearSegment,
    confirmPlaceholder,
    isDisabled,
    isReadOnly,
    isRequired,
    validationState,
    granularity,
    isInvalid,
    locale,
    timeZone,
  };
}

interface DateParts {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

function mapPartType(type: Intl.DateTimeFormatPartTypes): DateSegmentType | null {
  switch (type) {
    case "year":
      return "year";
    case "month":
      return "month";
    case "day":
      return "day";
    case "hour":
      return "hour";
    case "minute":
      return "minute";
    case "second":
      return "second";
    case "dayPeriod":
      return "dayPeriod";
    case "era":
      return "era";
    case "timeZoneName":
      return "timeZoneName";
    case "literal":
      return "literal";
    default:
      return null;
  }
}

function getSegmentValue(date: DateValue | null, type: DateSegmentType): number | undefined {
  if (!date) return undefined;

  switch (type) {
    case "year":
      return date.year;
    case "month":
      return date.month;
    case "day":
      return date.day;
    case "hour":
      return "hour" in date ? (date as CalendarDateTime).hour : undefined;
    case "minute":
      return "minute" in date ? (date as CalendarDateTime).minute : undefined;
    case "second":
      return "second" in date ? (date as CalendarDateTime).second : undefined;
    default:
      return undefined;
  }
}

function getMinValue(type: DateSegmentType): number {
  switch (type) {
    case "year":
      return 1;
    case "month":
      return 1;
    case "day":
      return 1;
    case "hour":
      return 0;
    case "minute":
      return 0;
    case "second":
      return 0;
    default:
      return 0;
  }
}

function getMaxValue(type: DateSegmentType, date: DateValue): number {
  switch (type) {
    case "year":
      return 9999;
    case "month":
      return 12;
    case "day":
      // Get days in month
      return endOfMonth(date).day;
    case "hour":
      return 23;
    case "minute":
      return 59;
    case "second":
      return 59;
    default:
      return 0;
  }
}

function getPlaceholderText(
  type: DateSegmentType,
  locale: string,
  granularity: "day" | "hour" | "minute" | "second",
): string {
  if (type === "literal") return "";
  if (type === "dayPeriod") return "AM";

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  if (granularity !== "day") {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    if (granularity === "second") {
      formatOptions.second = "2-digit";
    }
  }

  const formatter = new DateFormatter(locale, formatOptions);
  // Use a reference date with recognizable digits
  const refDate = new Date(2222, 10, 22, 22, 22, 22);
  const parts = formatter.formatToParts(refDate);

  for (const part of parts) {
    const mappedType = mapPartType(part.type);
    if (mappedType === type) {
      return part.value.replace(/\d/g, (d) => {
        if (type === "year") return "y";
        if (type === "month") return "m";
        if (type === "day") return "d";
        return "–";
      });
    }
  }

  switch (type) {
    case "year":
      return "yyyy";
    case "month":
      return "mm";
    case "day":
      return "dd";
    case "hour":
      return "––";
    case "minute":
      return "––";
    case "second":
      return "––";
    default:
      return "";
  }
}

function updateDatePart(date: DateValue, type: DateSegmentType, value: number): DateValue {
  if (typeof (date as { set?: unknown }).set !== "function") {
    return date;
  }

  switch (type) {
    case "year":
      return date.set({ year: value });
    case "month":
      return date.set({ month: value });
    case "day":
      return date.set({ day: value });
    case "hour":
      return date.set({ hour: value });
    case "minute":
      return date.set({ minute: value });
    case "second":
      return date.set({ second: value });
    default:
      return date;
  }
}
