/**
 * DateFieldState for Solid-Stately
 *
 * Provides state management for date field components with segment-based editing.
 * Based on @react-stately/datepicker useDateFieldState
 */
import { type Accessor } from "solid-js";
import { type CalendarDate, type DateValue } from "@internationalized/date";
import { type MaybeAccessor } from "../utils";
import type { ValidationState } from "./createCalendarState";
import { type ValidationBehavior, type ValidationFunction, type ValidationResult } from "../form";
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
/**
 * Provides state management for a date field component.
 */
export declare function createDateFieldState<T extends DateValue = CalendarDate>(
  props?: DateFieldStateProps<T>,
): DateFieldState<T>;
//# sourceMappingURL=createDateFieldState.d.ts.map
