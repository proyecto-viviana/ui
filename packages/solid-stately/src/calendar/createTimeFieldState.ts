/**
 * TimeFieldState for Solid-Stately
 *
 * Faithful port of `@react-stately/datepicker` `useTimeFieldState`, which is a
 * thin wrapper over `useDateFieldState`: a time-only `Time` value is converted
 * to a `CalendarDateTime` (anchored on today's date, or a zoned date when the
 * value/default carries a time zone) and fed to the date-field state machine
 * with `maxGranularity: 'hour'` so the date segments drop away and only
 * hour/minute[/second]/dayPeriod remain. The returned state IS the
 * `DateFieldState`, plus a `timeValue` accessor holding the value back in the
 * `Time` domain. This means TimeField reuses the certified DateField segment
 * stack (`createDateSegment`, `DateInput`, `DateSegment`) exactly as RAC's
 * TimeField reuses `DateInput`/`DateSegment` — there is no parallel time
 * primitive.
 *
 * The `timeValue` is layered on with a Proxy rather than an object spread
 * because `DateFieldState`'s `calendar`/`dateFormatter`/`granularity`/
 * `maxGranularity`/`locale`/`timeZone` members are getters — spreading would
 * invoke and freeze them, breaking reactivity.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import {
  Time,
  type CalendarDate,
  type CalendarDateTime,
  type ZonedDateTime,
  type DateValue,
  getLocalTimeZone,
  today,
  toTime,
  toZoned,
  toCalendarDateTime,
  GregorianCalendar,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";
import type { ValidationState } from "./createCalendarState";
import type { ValidationBehavior, ValidationFunction } from "../form";
import {
  createDateFieldState,
  type DateFieldState,
  type DateSegment as DateSegmentInternal,
  type DateSegmentType as DateSegmentTypeInternal,
} from "./createDateFieldState";

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;

/**
 * TimeField reuses the DateField segment vocabulary (RAC TimeField reuses
 * `DateInput`/`DateSegment`); the legacy `TimeSegment`/`TimeSegmentType` names
 * are kept as aliases of the shared date-segment types.
 */
export type TimeSegmentType = DateSegmentTypeInternal;
export type TimeSegment = DateSegmentInternal;

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
  /** Whether to hide the time zone. */
  hideTimeZone?: boolean;
  /** Whether to force leading zeroes in the hour segment. */
  shouldForceLeadingZeros?: boolean;
  /** Validation state. */
  validationState?: MaybeAccessor<ValidationState | undefined>;
  /** Validation behavior mode. */
  validationBehavior?: ValidationBehavior;
  /** Custom validation function. */
  validate?: ValidationFunction<T | null>;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string;
  /** The placeholder value. */
  placeholderValue?: T;
  /** Whether dates outside the min/max range are unavailable. Added for API consistency. */
  isDateUnavailable?: (date: DateValue) => boolean;
}

/**
 * The TimeField state IS the certified DateField state (segments, validation,
 * increment/decrement, formatter, etc.) with a `timeValue` accessor added. The
 * `T` generic is retained for API back-compat with existing `TimeFieldState<T>`
 * consumers.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface TimeFieldState<T extends TimeValue = Time> extends DateFieldState {
  /** The current value in the `Time`/`CalendarDateTime`/`ZonedDateTime` domain. */
  timeValue: Accessor<TimeValue | null>;
}

/**
 * Anchors a `Time` onto a date so the date-field machine can edit it. Values
 * that already carry a date (`CalendarDateTime`/`ZonedDateTime`) pass through.
 * Mirrors `@react-stately/datepicker`'s `convertValue`.
 */
function convertValue(
  value: TimeValue | null | undefined,
  date: DateValue = today(getLocalTimeZone()),
): CalendarDateTime | ZonedDateTime | null {
  if (!value) {
    return null;
  }
  if ("day" in value) {
    return value as CalendarDateTime | ZonedDateTime;
  }
  return toCalendarDateTime(date as CalendarDate | CalendarDateTime | ZonedDateTime, value as Time);
}

/**
 * Provides state management for a time field component.
 */
export function createTimeFieldState<T extends TimeValue = Time>(
  props: TimeFieldStateProps<T> = {},
): TimeFieldState<T> {
  const placeholderValue: TimeValue = props.placeholderValue ?? new Time();

  // Controlled/uncontrolled Time value (mirrors useControlledState).
  const [internalValue, setInternalValue] = createSignal<T | null>(props.defaultValue ?? null);
  const value = (): T | null => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
  };

  const defaultValueTimeZone =
    props.defaultValue && "timeZone" in props.defaultValue
      ? (props.defaultValue as ZonedDateTime).timeZone
      : undefined;

  const v = (): TimeValue => value() || placeholderValue;
  const day = (): DateValue | undefined => {
    const current = v();
    return current && "day" in current ? (current as CalendarDateTime | ZonedDateTime) : undefined;
  };

  const placeholderDate = createMemo<CalendarDateTime | ZonedDateTime | null>(() => {
    const current = v();
    const valueTimeZone =
      current && "timeZone" in current ? (current as ZonedDateTime).timeZone : undefined;
    const zone = valueTimeZone || defaultValueTimeZone;
    if (zone && placeholderValue) {
      return toZoned(convertValue(placeholderValue) as CalendarDateTime, zone);
    }
    return convertValue(placeholderValue);
  });

  const minDate = createMemo(() => convertValue(access(props.minValue), day()) ?? undefined);
  const maxDate = createMemo(() => convertValue(access(props.maxValue), day()) ?? undefined);

  const timeValue = createMemo<TimeValue | null>(() => {
    const current = value();
    return current && "day" in current
      ? toTime(current as CalendarDateTime | ZonedDateTime)
      : current;
  });
  const dateTime = createMemo<DateValue | null>(() => {
    const current = value();
    return current == null ? null : convertValue(current);
  });
  const defaultDateTime = props.defaultValue == null ? null : convertValue(props.defaultValue);

  // Route the inner date-field onChange back into the Time domain, mirroring
  // upstream: keep the CalendarDateTime when the value carries a date/zone,
  // otherwise collapse to a plain Time.
  const onChange = (newValue: DateValue | null): void => {
    const converted = (
      day() || defaultValueTimeZone
        ? newValue
        : newValue && toTime(newValue as CalendarDateTime | ZonedDateTime)
    ) as T | null;
    if (access(props.value) === undefined) {
      setInternalValue(() => converted);
    }
    props.onChange?.(converted);
  };

  const dateState = createDateFieldState({
    get value() {
      return dateTime();
    },
    defaultValue: defaultDateTime,
    onChange,
    get minValue() {
      return minDate();
    },
    get maxValue() {
      return maxDate();
    },
    get isDisabled() {
      return access(props.isDisabled);
    },
    get isReadOnly() {
      return access(props.isReadOnly);
    },
    get isRequired() {
      return access(props.isRequired);
    },
    get isInvalid() {
      return props.isInvalid;
    },
    get locale() {
      return props.locale;
    },
    get granularity() {
      return props.granularity || "minute";
    },
    maxGranularity: "hour",
    get hourCycle() {
      return props.hourCycle;
    },
    get hideTimeZone() {
      return props.hideTimeZone;
    },
    get placeholderValue() {
      return placeholderDate() ?? undefined;
    },
    get shouldForceLeadingZeros() {
      return props.shouldForceLeadingZeros;
    },
    createCalendar: () => new GregorianCalendar(),
    get validationState() {
      return access(props.validationState);
    },
    get validationBehavior() {
      return props.validationBehavior;
    },
    validate: props.validate ? () => props.validate?.(value()) : undefined,
    get description() {
      return props.description;
    },
    get errorMessage() {
      return props.errorMessage;
    },
    get isDateUnavailable() {
      return props.isDateUnavailable;
    },
  });

  // Add `timeValue` without spreading (spread would freeze DateFieldState's
  // getter members). The same proxy identity is threaded to createTimeField and
  // the field/segment contexts so `hookData` WeakMap keying stays consistent.
  return new Proxy(dateState, {
    get(target, prop, receiver) {
      if (prop === "timeValue") {
        return timeValue;
      }
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      return prop === "timeValue" || Reflect.has(target, prop);
    },
  }) as unknown as TimeFieldState<T>;
}
