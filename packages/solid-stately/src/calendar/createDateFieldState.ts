/**
 * DateFieldState for Solid-Stately
 *
 * Provides state management for date field components with segment-based editing.
 * Based on @react-stately/datepicker useDateFieldState
 *
 * Editing is modeled with an {@link IncompleteDate} display value so that invalid
 * intermediate dates (e.g. February 31st, produced by editing the day before the
 * month) are held as-typed while the field is focused and only constrained on blur
 * via `confirmPlaceholder`, matching upstream behavior. Out-of-range values are
 * never snapped to `minValue`/`maxValue`; they are kept and reported as invalid.
 */

import { createSignal, createMemo, createEffect, type Accessor } from "solid-js";
import {
  type AnyDateTime,
  type Calendar,
  type CalendarDateTime,
  type DateValue,
  GregorianCalendar,
  today,
  getLocalTimeZone,
  DateFormatter,
  toCalendarDate as intlToCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";
import type { ValidationState } from "./createCalendarState";
import { IncompleteDate } from "./IncompleteDate";
import {
  createFormValidationState,
  DEFAULT_VALIDATION_RESULT,
  VALID_VALIDITY_STATE,
  type ValidationBehavior,
  type ValidationFunction,
  type ValidationResult,
  type ValidityState,
} from "../form";

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
  value?: number | null;
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
  /** Whether the value is invalid (controlled). */
  isInvalid?: boolean;
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
  /** Whether to force leading zeroes in month/day segments. */
  shouldForceLeadingZeros?: boolean;
  /** Validation state. */
  validationState?: MaybeAccessor<ValidationState | undefined>;
  /** Validation behavior mode. */
  validationBehavior?: ValidationBehavior;
  /** Custom validation function. */
  validate?: ValidationFunction<T>;
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
  /** Realtime validation results, including native and custom constraints. */
  realtimeValidation: Accessor<ValidationResult>;
  /** Currently displayed validation results. */
  displayValidation: Accessor<ValidationResult>;
  /** Updates the current validation result. */
  updateValidation: (result: ValidationResult) => void;
  /** Resets displayed validation to valid. */
  resetValidation: () => void;
  /** Commits realtime validation to displayed validation. */
  commitValidation: () => void;
  /** The locale. */
  locale: string;
  /** The time zone. */
  timeZone: string;
  /** The default value. */
  defaultValue: T | null;
}

type HourCycle = "h11" | "h12" | "h23" | "h24";

/**
 * Provides state management for a date field component.
 */
export function createDateFieldState<T extends DateValue = DateValue>(
  props: DateFieldStateProps<T> = {},
): DateFieldState<T> {
  const timeZone = getLocalTimeZone();
  const locale = props.locale ?? "en-US";
  const granularity = props.granularity ?? "day";
  const calendar: Calendar = new GregorianCalendar();
  const hourCycle = resolveHourCycle(locale, props.hourCycle);
  const displaySegments = computeDisplaySegments(granularity, hourCycle);

  const getPlaceholderValue = (): DateValue => {
    const base = props.placeholderValue ?? today(timeZone);
    return granularity === "day" ? intlToCalendarDate(base) : toCalendarDateTime(base);
  };

  const toSource = (v: DateValue | null): Partial<Omit<AnyDateTime, "copy">> | null =>
    (v as Partial<Omit<AnyDateTime, "copy">> | null) ?? null;

  // State signals
  const initialValue = props.defaultValue ?? null;
  const [internalValue, setInternalValue] = createSignal<T | null>(initialValue);

  // Controlled vs uncontrolled committed value
  const value = createMemo<T | null>(() => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
  });

  // The display override: holds the (possibly invalid/incomplete) value being edited.
  const [displayValue, setDisplayValue] = createSignal<IncompleteDate>(
    new IncompleteDate(calendar, hourCycle, toSource(value())),
  );

  // Reset the display override whenever the committed value changes from the outside
  // (e.g. a controlled `value` prop update).
  let lastSyncedValue = value();
  createEffect(() => {
    const v = value();
    if (v !== lastSyncedValue) {
      lastSyncedValue = v;
      setDisplayValue(new IncompleteDate(calendar, hourCycle, toSource(v)));
    }
  });

  // Derived states
  const isDisabled = createMemo(() => access(props.isDisabled) ?? false);
  const isReadOnly = createMemo(() => access(props.isReadOnly) ?? false);
  const isRequired = createMemo(() => access(props.isRequired) ?? false);
  const explicitValidationState = createMemo(() => access(props.validationState));
  const validationBehavior = () => props.validationBehavior ?? "native";
  const builtinValidation = createMemo<ValidationResult>(() => {
    const v = value();
    if (!v) return DEFAULT_VALIDATION_RESULT;

    const minValue = access(props.minValue);
    const maxValue = access(props.maxValue);
    const validationDetails: ValidityState = { ...VALID_VALIDITY_STATE };
    const validationErrors: string[] = [];

    if (minValue && v.compare(minValue) < 0) {
      validationDetails.rangeUnderflow = true;
      validationErrors.push("Value is below the minimum date.");
    }

    if (maxValue && v.compare(maxValue) > 0) {
      validationDetails.rangeOverflow = true;
      validationErrors.push("Value is above the maximum date.");
    }

    if (props.isDateUnavailable?.(v)) {
      validationDetails.customError = true;
      validationErrors.push("Date is unavailable.");
    }

    if (validationErrors.length === 0) {
      return DEFAULT_VALIDATION_RESULT;
    }

    validationDetails.valid = false;
    return {
      isInvalid: true,
      validationDetails,
      validationErrors,
    };
  });
  const validation = createFormValidationState<T>({
    get value() {
      return value();
    },
    get isInvalid() {
      return props.isInvalid;
    },
    get validationState() {
      return explicitValidationState();
    },
    get validationBehavior() {
      return validationBehavior();
    },
    get validate() {
      return props.validate;
    },
    get builtinValidation() {
      return builtinValidation();
    },
  });
  const isInvalid = createMemo(() => validation.displayValidation().isInvalid);
  const validationState = createMemo<ValidationState | undefined>(
    () => explicitValidationState() ?? (isInvalid() ? "invalid" : undefined),
  );

  // The effective date value, derived from the display override.
  const dateValue = createMemo<DateValue | null>(() => {
    const v = value();
    if (v) return v;
    const dv = displayValue();
    if (dv.isCleared(displaySegments)) return null;
    return dv.toValue(getPlaceholderValue());
  });

  // Generate segments from the display override (so invalid intermediate values render as typed).
  const segments = createMemo<DateSegment[]>(() => {
    const dv = displayValue();
    const base = value() ?? getPlaceholderValue();
    const resolved = dv.toValue(base);
    const jsDate = resolved.toDate(timeZone);

    const shouldForceLeadingZeros = props.shouldForceLeadingZeros === true;
    const formatOptions = buildFormatOptions(granularity, shouldForceLeadingZeros, props.hourCycle);
    const formatter = new DateFormatter(locale, formatOptions);
    const resolvedOptions = formatter.resolvedOptions() as unknown as Record<string, string>;
    const parts = formatter.formatToParts(jsDate);

    const numberFormatter = new Intl.NumberFormat(locale, { useGrouping: false });
    const twoDigitFormatter = new Intl.NumberFormat(locale, {
      useGrouping: false,
      minimumIntegerDigits: 2,
    });

    const result: DateSegment[] = [];
    for (const part of parts) {
      const type = mapPartType(part.type);

      if (type === "literal") {
        result.push({
          type: "literal",
          text: part.value,
          isEditable: false,
          isPlaceholder: false,
          placeholder: part.value,
        });
        continue;
      }
      if (!type) continue;

      const editable = isEditableSegment(type);
      const rawValue = rawSegmentValue(dv, type);
      const isPlaceholder = editable && rawValue == null;
      const limits = dv.getSegmentLimits(type);
      const placeholderText = getPlaceholderText(
        type,
        locale,
        granularity,
        shouldForceLeadingZeros,
      );

      // For numeric date/time segments, render the raw edited value (e.g. "31" even
      // when the resolved date is Feb 28) using a NumberFormatter, mirroring upstream.
      let text = part.value;
      if (
        (type === "year" || type === "month" || type === "day" || type === "hour") &&
        typeof rawValue === "number"
      ) {
        const numeric = rawValue ?? 0;
        text =
          resolvedOptions[type] === "2-digit"
            ? twoDigitFormatter.format(numeric)
            : numberFormatter.format(numeric);
      }

      result.push({
        type,
        text: isPlaceholder ? placeholderText : text,
        value: limits?.value,
        minValue: limits?.minValue,
        maxValue: limits?.maxValue,
        isEditable: editable && !isDisabled() && !isReadOnly(),
        isPlaceholder,
        placeholder: placeholderText,
      });
    }

    return result;
  });

  // Commit a concrete value (updates the controlled/uncontrolled value and fires onChange).
  const commitDate = (newValue: T | null) => {
    const controlled = access(props.value);
    if (controlled === undefined) {
      lastSyncedValue = newValue;
      setInternalValue(() => newValue);
    }
    props.onChange?.(newValue);
  };

  // Set value with the upstream split: complete + valid commits eagerly; an incomplete
  // or invalid (e.g. Feb 31) value is held as a display override until blur.
  const setValue = (newValue: T | IncompleteDate | null) => {
    if (isDisabled() || isReadOnly()) return;

    if (newValue == null || (newValue instanceof IncompleteDate && newValue.isCleared(displaySegments))) {
      commitDate(null);
      setDisplayValue(new IncompleteDate(calendar, hourCycle, null));
      return;
    }

    if (!(newValue instanceof IncompleteDate)) {
      commitDate(newValue);
      setDisplayValue(new IncompleteDate(calendar, hourCycle, toSource(newValue)));
      return;
    }

    // If the new value is complete and valid, trigger onChange eagerly. If it represents
    // an incomplete or invalid value (e.g. February 30th), wait until blur to trigger onChange.
    if (newValue.isComplete(displaySegments)) {
      const resolved = newValue.toValue(value() ?? getPlaceholderValue());
      if (newValue.validate(resolved, displaySegments)) {
        const committed = value();
        if (!committed || resolved.compare(committed) !== 0) {
          setDisplayValue(new IncompleteDate(calendar, hourCycle, toSource(resolved)));
          commitDate(resolved as T);
          return;
        }
      }
    }

    // Incomplete/invalid value. Set temporary display override.
    setDisplayValue(newValue);
  };

  const adjustSegment = (type: DateSegmentType, amount: number) => {
    if (isDisabled() || isReadOnly()) return;
    setValue(displayValue().cycle(type, amount, getPlaceholderValue(), displaySegments));
  };

  // Set a specific segment value
  const setSegment = (type: DateSegmentType, newValue: number) => {
    if (isDisabled() || isReadOnly()) return;
    setValue(displayValue().set(type, newValue, getPlaceholderValue()));
  };

  const incrementSegment = (type: DateSegmentType) => adjustSegment(type, 1);
  const decrementSegment = (type: DateSegmentType) => adjustSegment(type, -1);

  // Clear a segment, reverting it to its placeholder.
  const clearSegment = (type: DateSegmentType) => {
    if (isDisabled() || isReadOnly()) return;
    let dv = displayValue();
    if (type !== "timeZoneName" && type !== "literal") {
      dv = dv.clear(type);
    }
    setValue(dv);
  };

  // When the field is blurred, constrain a complete-but-invalid display value
  // (e.g. February 31st -> February 28th) and emit onChange. Out-of-range values
  // are left as-is and reported via validation rather than being snapped.
  const confirmPlaceholder = () => {
    if (isDisabled() || isReadOnly()) return;
    const dv = displayValue();
    if (!dv.isComplete(displaySegments)) return;

    const resolved = dv.toValue(value() ?? getPlaceholderValue());
    const committed = value();
    const needsCommit = !committed || resolved.compare(committed) !== 0;
    if (needsCommit) {
      commitDate(resolved as T);
    }

    // Reset the display override so a constrained value (e.g. February 31st ->
    // February 28th) renders. Only touch the signal when the displayed raw value
    // diverged from the resolved value, or when we committed — otherwise leave it
    // untouched so blur (which fires on every focus move) does not churn the
    // segments and drop focus.
    if (needsCommit || !dv.validate(resolved, displaySegments)) {
      setDisplayValue(new IncompleteDate(calendar, hourCycle, toSource(value() ?? resolved)));
    }
  };

  // Format the current value
  const formatValue = (fieldOptions?: Intl.DateTimeFormatOptions): string => {
    const v = value();
    if (!v) return "";

    const options: Intl.DateTimeFormatOptions = fieldOptions ?? {
      year: "numeric",
      month: props.shouldForceLeadingZeros === true ? "2-digit" : "numeric",
      day: props.shouldForceLeadingZeros === true ? "2-digit" : "numeric",
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
    realtimeValidation: validation.realtimeValidation,
    displayValidation: validation.displayValidation,
    updateValidation: validation.updateValidation,
    resetValidation: validation.resetValidation,
    commitValidation: validation.commitValidation,
    locale,
    timeZone,
  };
}

const EDITABLE_SEGMENTS: Record<string, boolean> = {
  year: true,
  month: true,
  day: true,
  hour: true,
  minute: true,
  second: true,
  dayPeriod: true,
  era: true,
};

function isEditableSegment(type: DateSegmentType): boolean {
  return EDITABLE_SEGMENTS[type] === true;
}

function rawSegmentValue(dv: IncompleteDate, type: DateSegmentType): number | string | null {
  switch (type) {
    case "era":
      return dv.era;
    case "year":
      return dv.year;
    case "month":
      return dv.month;
    case "day":
      return dv.day;
    case "hour":
      return dv.hour;
    case "minute":
      return dv.minute;
    case "second":
      return dv.second;
    case "dayPeriod":
      return dv.dayPeriod;
    default:
      return null;
  }
}

function resolveHourCycle(locale: string, hourCycle?: 12 | 24): HourCycle {
  const formatter = new DateFormatter(locale, {
    hour: "numeric",
    hour12: hourCycle != null ? hourCycle === 12 : undefined,
  });
  return (formatter.resolvedOptions().hourCycle as HourCycle) ?? "h23";
}

function computeDisplaySegments(
  granularity: "day" | "hour" | "minute" | "second",
  hourCycle: HourCycle,
): DateSegmentType[] {
  const is12HourClock = hourCycle === "h11" || hourCycle === "h12";
  const segments: DateSegmentType[] = [
    "era",
    "year",
    "month",
    "day",
    "hour",
    ...(is12HourClock ? (["dayPeriod"] as const) : []),
    "minute",
    "second",
  ];
  // We never expose era as an editable segment, so the maximum displayed unit is the year.
  const minIndex = segments.indexOf("era");
  const maxIndex = segments.indexOf(
    granularity === "hour" && is12HourClock ? "dayPeriod" : granularity,
  );
  return segments.slice(minIndex, maxIndex + 1);
}

function buildFormatOptions(
  granularity: "day" | "hour" | "minute" | "second",
  shouldForceLeadingZeros: boolean,
  hourCycle?: 12 | 24,
): Intl.DateTimeFormatOptions {
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: shouldForceLeadingZeros ? "2-digit" : "numeric",
    day: shouldForceLeadingZeros ? "2-digit" : "numeric",
  };

  if (granularity !== "day") {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    if (granularity === "second") {
      formatOptions.second = "2-digit";
    }
    if (hourCycle) {
      formatOptions.hourCycle = hourCycle === 12 ? "h12" : "h23";
    }
  }

  return formatOptions;
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

function getPlaceholderText(
  type: DateSegmentType,
  locale: string,
  granularity: "day" | "hour" | "minute" | "second",
  shouldForceLeadingZeros = false,
): string {
  if (type === "literal") return "";
  if (type === "dayPeriod") return "AM";

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: shouldForceLeadingZeros ? "2-digit" : "numeric",
    day: shouldForceLeadingZeros ? "2-digit" : "numeric",
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
      return part.value.replace(/\d/g, (_d) => {
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

// Re-export so existing imports of CalendarDateTime keep resolving through this module.
export type { CalendarDateTime };
