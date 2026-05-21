/**
 * TimeFieldState for Solid-Stately
 *
 * Provides state management for time field components with segment-based editing.
 * Based on @react-stately/datepicker useTimeFieldState
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import {
  type Time,
  type CalendarDateTime,
  type ZonedDateTime,
  type DateValue,
  getLocalTimeZone,
  DateFormatter,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";
import type { ValidationState } from "./createCalendarState";
import {
  createFormValidationState,
  DEFAULT_VALIDATION_RESULT,
  VALID_VALIDITY_STATE,
  type ValidationBehavior,
  type ValidationFunction,
  type ValidationResult,
  type ValidityState,
} from "../form";

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;

export type TimeSegmentType = "hour" | "minute" | "second" | "dayPeriod" | "literal";

export interface TimeSegment {
  /** The type of segment. */
  type: TimeSegmentType;
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

export interface TimeFieldStateProps<T extends TimeValue = Time> {
  /** The current value (controlled). */
  value?: MaybeAccessor<T | null>;
  /** The default value (uncontrolled). */
  defaultValue?: T | null;
  /** Handler called when the value changes. */
  onChange?: (value: T | null) => void;
  /** The minimum allowed time. */
  minValue?: MaybeAccessor<TimeValue | undefined>;
  /** The maximum allowed time. */
  maxValue?: MaybeAccessor<TimeValue | undefined>;
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
  /** The granularity (hour, minute, second). */
  granularity?: "hour" | "minute" | "second";
  /** Whether to show 12 or 24 hour format. */
  hourCycle?: 12 | 24;
  /** Whether to force leading zeroes in the hour segment. */
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
  /** The placeholder value. */
  placeholderValue?: T;
  /** Whether dates outside the min/max range are unavailable. Added for API consistency. */
  isDateUnavailable?: (date: DateValue) => boolean;
}

export interface TimeFieldState<T extends TimeValue = Time> {
  /** The current value. */
  value: Accessor<T | null>;
  /** The default value. */
  defaultValue: T | null;
  /** Sets the value. */
  setValue: (value: T | null) => void;
  /** The segments that make up the time. */
  segments: Accessor<TimeSegment[]>;
  /** Sets a segment value. */
  setSegment: (type: TimeSegmentType, value: number) => void;
  /** Increments a segment. */
  incrementSegment: (type: TimeSegmentType) => void;
  /** Decrements a segment. */
  decrementSegment: (type: TimeSegmentType) => void;
  /** Clears a segment. */
  clearSegment: (type: TimeSegmentType) => void;
  /** Whether the field is disabled. */
  isDisabled: Accessor<boolean>;
  /** Whether the field is read-only. */
  isReadOnly: Accessor<boolean>;
  /** Whether the field is required. */
  isRequired: Accessor<boolean>;
  /** The validation state. */
  validationState: Accessor<ValidationState | undefined>;
  /** The granularity. */
  granularity: "hour" | "minute" | "second";
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
  /** The hour cycle. */
  hourCycle: 12 | 24;
}

/**
 * Provides state management for a time field component.
 */
export function createTimeFieldState<T extends TimeValue = Time>(
  props: TimeFieldStateProps<T> = {},
): TimeFieldState<T> {
  const timeZone = getLocalTimeZone();
  const locale = props.locale ?? "en-US";
  const granularity = props.granularity ?? "minute";
  const hourCycle = props.hourCycle ?? 12;

  const initialValue = props.defaultValue ?? null;

  // State signals
  const [internalValue, setInternalValue] = createSignal<T | null>(initialValue);

  // Track partial values during editing
  const [placeholderParts, setPlaceholderParts] = createSignal<Partial<TimeParts>>({});

  // Controlled vs uncontrolled value
  const value = createMemo<T | null>(() => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
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

    if (minValue && compareTime(v, minValue) < 0) {
      validationDetails.rangeUnderflow = true;
      validationErrors.push("Value is below the minimum time.");
    }

    if (maxValue && compareTime(v, maxValue) > 0) {
      validationDetails.rangeOverflow = true;
      validationErrors.push("Value is above the maximum time.");
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

  // Generate segments based on granularity
  const segments = createMemo<TimeSegment[]>(() => {
    const v = value();
    const parts = placeholderParts();
    const segs: TimeSegment[] = [];

    // Determine format options
    const shouldForceLeadingZeros = props.shouldForceLeadingZeros === true;
    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: shouldForceLeadingZeros ? "2-digit" : "numeric",
      minute: "2-digit",
      hourCycle: hourCycle === 12 ? "h12" : "h23",
    };

    if (granularity === "second") {
      formatOptions.second = "2-digit";
    }

    // Use a base date for formatting
    const baseDate = new Date();
    if (v) {
      baseDate.setHours(getHour(v), getMinute(v), getSecond(v));
    }

    const formatter = new DateFormatter(locale, formatOptions);
    const formattedParts = formatter.formatToParts(baseDate);

    for (const part of formattedParts) {
      const type = mapTimePartType(part.type);

      if (type === "literal") {
        segs.push({
          type: "literal",
          text: part.value,
          isEditable: false,
          isPlaceholder: false,
          placeholder: part.value,
        });
      } else if (type) {
        const segValue = getTimeSegmentValue(v, type);
        const partValue = parts[type as keyof TimeParts];
        const hasValue = v !== null || partValue !== undefined;

        segs.push({
          type,
          text: hasValue ? part.value : getTimePlaceholderText(type),
          value: segValue ?? partValue,
          minValue: getTimeMinValue(type, hourCycle),
          maxValue: getTimeMaxValue(type, hourCycle),
          isEditable: !isDisabled() && !isReadOnly(),
          isPlaceholder: !hasValue,
          placeholder: getTimePlaceholderText(type),
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

    setPlaceholderParts({});
  };

  // Set a specific segment value
  const setSegment = (type: TimeSegmentType, newValue: number) => {
    if (isDisabled() || isReadOnly()) return;
    if (type === "literal") return;

    const v = value();

    if (v) {
      const updated = updateTimePart(v, type, newValue, hourCycle);
      setValue(updated as T);
    } else {
      setPlaceholderParts((prev) => ({
        ...prev,
        [type]: newValue,
      }));
    }
  };

  // Increment a segment
  const incrementSegment = (type: TimeSegmentType) => {
    if (isDisabled() || isReadOnly()) return;
    if (type === "literal") return;

    const v = value();
    const current = v ? getTimeSegmentValue(v, type) : placeholderParts()[type as keyof TimeParts];
    const max = getTimeMaxValue(type, hourCycle);
    const min = getTimeMinValue(type, hourCycle);

    if (type === "dayPeriod") {
      // Toggle AM/PM
      const currentHour = v ? getHour(v) : (placeholderParts().hour ?? 0);
      const newHour = currentHour >= 12 ? currentHour - 12 : currentHour + 12;
      setSegment("hour", newHour);
      return;
    }

    const newValue = current !== undefined ? current + 1 : min;
    setSegment(type, newValue > max ? min : newValue);
  };

  // Decrement a segment
  const decrementSegment = (type: TimeSegmentType) => {
    if (isDisabled() || isReadOnly()) return;
    if (type === "literal") return;

    const v = value();
    const current = v ? getTimeSegmentValue(v, type) : placeholderParts()[type as keyof TimeParts];
    const max = getTimeMaxValue(type, hourCycle);
    const min = getTimeMinValue(type, hourCycle);

    if (type === "dayPeriod") {
      // Toggle AM/PM
      const currentHour = v ? getHour(v) : (placeholderParts().hour ?? 0);
      const newHour = currentHour >= 12 ? currentHour - 12 : currentHour + 12;
      setSegment("hour", newHour);
      return;
    }

    const newValue = current !== undefined ? current - 1 : max;
    setSegment(type, newValue < min ? max : newValue);
  };

  // Clear a segment
  const clearSegment = (type: TimeSegmentType) => {
    if (isDisabled() || isReadOnly()) return;

    const v = value();
    if (v) {
      setValue(null);
    } else {
      setPlaceholderParts((prev) => {
        const next = { ...prev };
        delete next[type as keyof TimeParts];
        return next;
      });
    }
  };

  return {
    value,
    defaultValue: initialValue,
    setValue,
    segments,
    setSegment,
    incrementSegment,
    decrementSegment,
    clearSegment,
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
    hourCycle,
  };
}

interface TimeParts {
  hour?: number;
  minute?: number;
  second?: number;
}

function mapTimePartType(type: Intl.DateTimeFormatPartTypes): TimeSegmentType | null {
  switch (type) {
    case "hour":
      return "hour";
    case "minute":
      return "minute";
    case "second":
      return "second";
    case "dayPeriod":
      return "dayPeriod";
    case "literal":
      return "literal";
    default:
      return null;
  }
}

function getHour(time: TimeValue): number {
  if ("hour" in time) {
    return time.hour;
  }
  return 0;
}

function getMinute(time: TimeValue): number {
  if ("minute" in time) {
    return time.minute;
  }
  return 0;
}

function getSecond(time: TimeValue): number {
  if ("second" in time) {
    return time.second;
  }
  return 0;
}

function getTimeSegmentValue(time: TimeValue | null, type: TimeSegmentType): number | undefined {
  if (!time) return undefined;

  switch (type) {
    case "hour":
      return getHour(time);
    case "minute":
      return getMinute(time);
    case "second":
      return getSecond(time);
    case "dayPeriod":
      return getHour(time) >= 12 ? 1 : 0;
    default:
      return undefined;
  }
}

function getTimeMinValue(type: TimeSegmentType, hourCycle: number): number {
  switch (type) {
    case "hour":
      return hourCycle === 12 ? 1 : 0;
    case "minute":
      return 0;
    case "second":
      return 0;
    case "dayPeriod":
      return 0;
    default:
      return 0;
  }
}

function getTimeMaxValue(type: TimeSegmentType, hourCycle: number): number {
  switch (type) {
    case "hour":
      // In 12-hour mode, the spinbutton displays 1–12, so aria-valuemax is 12.
      return hourCycle === 12 ? 12 : 23;
    case "minute":
      return 59;
    case "second":
      return 59;
    case "dayPeriod":
      return 1;
    default:
      return 0;
  }
}

function getTimePlaceholderText(type: TimeSegmentType): string {
  switch (type) {
    case "hour":
      return "––";
    case "minute":
      return "––";
    case "second":
      return "––";
    case "dayPeriod":
      return "AM";
    default:
      return "";
  }
}

function updateTimePart(
  time: TimeValue,
  type: TimeSegmentType,
  value: number,
  _hourCycle: number,
): TimeValue {
  if (!time) return time;

  // All TimeValue types in @internationalized/date have a .set() method
  const settable = time as { set(props: Record<string, number>): TimeValue };
  if (typeof settable.set !== "function") {
    return time;
  }

  switch (type) {
    case "hour":
      return settable.set({ hour: value });
    case "minute":
      return settable.set({ minute: value });
    case "second":
      return settable.set({ second: value });
    case "dayPeriod": {
      // dayPeriod 0 = AM, 1 = PM. Adjust hour by +/- 12 based on desired period.
      const currentHour = getHour(time);
      const isPM = value === 1;
      const isCurrentlyPM = currentHour >= 12;
      if (isPM && !isCurrentlyPM) {
        return settable.set({ hour: currentHour + 12 });
      }
      if (!isPM && isCurrentlyPM) {
        return settable.set({ hour: currentHour - 12 });
      }
      return time;
    }
    default:
      return time;
  }
}

function compareTime(a: TimeValue, b: TimeValue): number {
  const aHour = getHour(a);
  const bHour = getHour(b);
  if (aHour !== bHour) return aHour - bHour;

  const aMinute = getMinute(a);
  const bMinute = getMinute(b);
  if (aMinute !== bMinute) return aMinute - bMinute;

  const aSecond = getSecond(a);
  const bSecond = getSecond(b);
  return aSecond - bSecond;
}
