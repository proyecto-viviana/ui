/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/datepicker/useDateFieldState.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/datepicker/utils.ts

/**
 * DateFieldState for Solid-Stately
 *
 * Provides state management for date field components with segment-based editing.
 * Faithful port of @react-stately/datepicker useDateFieldState.
 *
 * Editing is modeled with an {@link IncompleteDate} display value so that invalid
 * intermediate dates (e.g. February 31st, produced by editing the day before the
 * month) are held as-typed while the field is focused and only constrained on blur
 * via `confirmPlaceholder`, matching upstream behavior. Out-of-range values are
 * never snapped to `minValue`/`maxValue`; they are kept and reported as invalid.
 *
 * The upstream "derived state during render" resync (which re-mints the display
 * value when the committed value / calendar / hour cycle changes) is ported to a
 * Solid `createComputed` so it runs synchronously before render effects — mirroring
 * React's render-phase setState rather than a post-render `createEffect`.
 */

import { createSignal, createMemo, createComputed, untrack, type Accessor } from "solid-js";
import {
  type Calendar,
  type CalendarDateTime,
  type CalendarIdentifier,
  type DateValue,
  GregorianCalendar,
  DateFormatter,
  Time,
  now,
  getLocalTimeZone,
  toCalendar,
  toCalendarDate,
  toCalendarDateTime,
  isEqualCalendar,
  createCalendar as intlCreateCalendar,
} from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils";
import type { ValidationState } from "./createCalendarState";
import { IncompleteDate } from "./IncompleteDate";
import { formatDateFieldError, getPlaceholder, type DateFieldErrorKey } from "./intl";
import {
  createFormValidationState,
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

type Granularity = "year" | "month" | "day" | "hour" | "minute" | "second";
type FieldGranularity = "day" | "hour" | "minute" | "second";

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
  granularity?: FieldGranularity;
  /** The maximum granularity (largest editable unit). Defaults to `year`. */
  maxGranularity?: "year" | "month" | "day" | "hour" | "minute";
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
  /** Resolves a calendar system by its Unicode identifier. */
  createCalendar?: (name: CalendarIdentifier) => Calendar;
  /** Whether a date is unavailable. */
  isDateUnavailable?: (date: DateValue) => boolean;
}

export interface DateFieldState<T extends DateValue = DateValue> {
  /** The current value, converted to the display calendar. */
  value: Accessor<DateValue | null>;
  /** The current value as a native JavaScript Date (may be partial during editing). */
  dateValue: Accessor<Date>;
  /** The display calendar system. */
  readonly calendar: Calendar;
  /** Sets the date value. */
  setValue: (value: T | null) => void;
  /** The segments that make up the date. */
  segments: Accessor<DateSegment[]>;
  /** The formatter used to render the field. */
  readonly dateFormatter: DateFormatter;
  /** Formats the current value with the given field options. */
  formatValue: (fieldOptions?: Intl.DateTimeFormatOptions) => string;
  /** Returns a formatter with the field's resolved options merged with the given ones. */
  getDateFormatter: (locale: string, formatOptions: FormatterOptions) => DateFormatter;
  /** Sets a segment value. */
  setSegment: (type: DateSegmentType, value: number) => void;
  /** Increments a segment by one. */
  increment: (type: DateSegmentType) => void;
  /** Decrements a segment by one. */
  decrement: (type: DateSegmentType) => void;
  /** Increments a segment by a larger page step. */
  incrementPage: (type: DateSegmentType) => void;
  /** Decrements a segment by a larger page step. */
  decrementPage: (type: DateSegmentType) => void;
  /** Sets a segment to its maximum value. */
  incrementToMax: (type: DateSegmentType) => void;
  /** Sets a segment to its minimum value. */
  decrementToMin: (type: DateSegmentType) => void;
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
  readonly granularity: FieldGranularity;
  /** The maximum granularity. */
  readonly maxGranularity: "year" | "month" | "day" | "hour" | "minute";
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
  readonly locale: string;
  /** The time zone. */
  readonly timeZone: string;
  /** The default value. */
  defaultValue: DateValue | null;
}

type HourCycle = "h11" | "h12" | "h23" | "h24";

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

const PAGE_STEP: Record<string, number> = {
  year: 5,
  month: 2,
  day: 7,
  hour: 2,
  minute: 15,
  second: 15,
};

const TYPE_MAPPING: Record<string, string> = {
  // Node seems to convert everything to lowercase...
  dayperiod: "dayPeriod",
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts#named_years
  relatedYear: "year",
  yearName: "literal",
  unknown: "literal",
};

/**
 * Provides state management for a date field component.
 */
export function createDateFieldState<T extends DateValue = DateValue>(
  props: DateFieldStateProps<T> = {},
): DateFieldState<T> {
  const locale = (): string => props.locale ?? "en-US";
  const createCalendarFn = (name: CalendarIdentifier): Calendar =>
    (props.createCalendar ?? intlCreateCalendar)(name);

  // The initial resolved value (used only for its calendar identity and defaults).
  const v0 = (): DateValue | null =>
    access(props.value) ?? props.defaultValue ?? props.placeholderValue ?? null;

  // Compute default granularity and time zone from the value, keeping the last
  // values when the value becomes null (mirrors useDefaultProps).
  const initialDefaults = untrack(() => {
    const v = v0();
    return {
      granularity: (v && "minute" in v ? "minute" : "day") as Granularity,
      timeZone: v && "timeZone" in v ? (v as { timeZone: string }).timeZone : undefined,
    };
  });
  const [lastDefaults, setLastDefaults] = createSignal<{
    granularity: Granularity;
    timeZone: string | undefined;
  }>(initialDefaults);
  createComputed(() => {
    const v = v0();
    if (!v) return;
    const defaultGranularity = ("minute" in v ? "minute" : "day") as Granularity;
    const defaultTimeZone = "timeZone" in v ? (v as { timeZone: string }).timeZone : undefined;
    const last = untrack(lastDefaults);
    if (last.granularity !== defaultGranularity || last.timeZone !== defaultTimeZone) {
      setLastDefaults({ granularity: defaultGranularity, timeZone: defaultTimeZone });
    }
  });
  const granularity = (): FieldGranularity => {
    if (props.granularity) return props.granularity;
    const v = v0();
    if (v) return ("minute" in v ? "minute" : "day") as FieldGranularity;
    return lastDefaults().granularity as FieldGranularity;
  };
  const defaultTimeZone = (): string | undefined => {
    const v = v0();
    return v
      ? "timeZone" in v
        ? (v as { timeZone: string }).timeZone
        : undefined
      : lastDefaults().timeZone;
  };
  const timeZone = (): string => defaultTimeZone() || "UTC";

  // Resolve default hour cycle and calendar system.
  const calendarAndHourCycle = createMemo<[Calendar, HourCycle]>(() => {
    const formatter = new DateFormatter(locale(), {
      dateStyle: "short",
      timeStyle: "short",
      hour12: props.hourCycle != null ? props.hourCycle === 12 : undefined,
    });
    const opts = formatter.resolvedOptions();
    return [createCalendarFn(opts.calendar as CalendarIdentifier), opts.hourCycle as HourCycle];
  });
  const calendar = (): Calendar => calendarAndHourCycle()[0];
  const hourCycle = (): HourCycle => calendarAndHourCycle()[1];

  // Controlled vs uncontrolled committed value.
  const [internalValue, setInternalValue] = createSignal<T | null>(props.defaultValue ?? null);
  const rawValue = createMemo<T | null>(() => {
    const controlled = access(props.value);
    return controlled !== undefined ? controlled : internalValue();
  });
  const setDate = (v: T | null) => {
    if (access(props.value) === undefined) setInternalValue(() => v);
    props.onChange?.(v);
  };

  // The current value, converted to the display calendar.
  const calendarValue = createMemo<DateValue | null>(
    () => convertValue(rawValue(), calendar()) ?? null,
  );

  const initialValue = untrack(calendarValue);

  // The display override: holds the (possibly invalid/incomplete) value being edited.
  const [displayValue, setDisplayValue] = createSignal<IncompleteDate>(
    untrack(() => new IncompleteDate(calendar(), hourCycle(), untrack(calendarValue))),
  );

  // Render-phase resync: whenever the committed value, calendar, or hour cycle changes
  // from the outside, re-mint the display override. Ported to createComputed so it runs
  // synchronously (like React's render-phase setState), never leaving a stale frame.
  let lastValue = untrack(calendarValue);
  let lastCalendar = untrack(calendar);
  let lastHourCycle = untrack(hourCycle);
  createComputed(() => {
    const cv = calendarValue();
    const cal = calendar();
    const hc = hourCycle();
    if (cv !== lastValue || hc !== lastHourCycle || !isEqualCalendar(cal, lastCalendar)) {
      lastValue = cv;
      lastCalendar = cal;
      lastHourCycle = hc;
      setDisplayValue(new IncompleteDate(cal, hc, cv));
    }
  });

  const showEra = (): boolean => calendar().identifier === "gregory" && displayValue().era === "BC";
  const maxGranularity = (): "year" | "month" | "day" | "hour" | "minute" =>
    props.maxGranularity ?? "year";

  const placeholderDate = createMemo<DateValue>(() =>
    createPlaceholderDate(props.placeholderValue, granularity(), calendar(), defaultTimeZone()),
  );

  const formatOpts = createMemo<FormatterOptions>(() => ({
    granularity: granularity(),
    maxGranularity: maxGranularity(),
    timeZone: defaultTimeZone(),
    hideTimeZone: props.hideTimeZone,
    hourCycle: props.hourCycle,
    showEra: showEra(),
    shouldForceLeadingZeros: props.shouldForceLeadingZeros,
  }));

  const dateFormatter = createMemo(
    () => new DateFormatter(locale(), getFormatOptions({}, formatOpts())),
  );
  const resolvedOptions = createMemo(() => dateFormatter().resolvedOptions());

  const displaySegments = createMemo<DateSegmentType[]>(() => {
    const hc = hourCycle();
    const is12HourClock = hc === "h11" || hc === "h12";
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
    const minIndex = segments.indexOf((maxGranularity() as DateSegmentType) || "era");
    const maxIndex = segments.indexOf(
      granularity() === "hour" && is12HourClock ? "dayPeriod" : granularity(),
    );
    return segments.slice(minIndex, maxIndex + 1);
  });

  // The effective date value as a native Date, derived from the display override.
  const dateValue = createMemo<Date>(() => {
    const v = displayValue().toValue(calendarValue() ?? placeholderDate());
    return v.toDate(timeZone());
  });

  const segments = createMemo<DateSegment[]>(() =>
    processSegments(
      dateValue(),
      displayValue(),
      dateFormatter(),
      resolvedOptions() as unknown as Record<string, string>,
      calendar(),
      locale(),
      granularity(),
    ),
  );

  // Set value with the upstream split: complete + valid commits eagerly; an incomplete
  // or invalid (e.g. Feb 31) value is held as a display override until blur.
  const setValue = (newValue: T | IncompleteDate | null) => {
    if (access(props.isDisabled) || access(props.isReadOnly)) return;

    const cv = calendarValue();
    const cal = calendar();
    const hc = hourCycle();
    const v = v0();

    if (
      newValue == null ||
      (newValue instanceof IncompleteDate && newValue.isCleared(displaySegments()))
    ) {
      setDisplayValue(new IncompleteDate(cal, hc, cv));
      setDate(null);
    } else if (!(newValue instanceof IncompleteDate)) {
      // The display calendar should not have any effect on the emitted value.
      // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
      const emitted = toCalendar(
        newValue as DateValue,
        (v as { calendar?: Calendar } | null)?.calendar || new GregorianCalendar(),
      );
      setDisplayValue(new IncompleteDate(cal, hc, cv));
      setDate(emitted as T);
    } else {
      // If the new value is complete and valid, trigger onChange eagerly. If it represents
      // an incomplete or invalid value (e.g. February 30th), wait until blur to trigger onChange.
      if (newValue.isComplete(displaySegments())) {
        const dv = newValue.toValue(cv ?? placeholderDate());
        if (newValue.validate(dv, displaySegments())) {
          const newDateValue = toCalendar(
            dv,
            (v as { calendar?: Calendar } | null)?.calendar || new GregorianCalendar(),
          );
          const committed = rawValue();
          if (!committed || newDateValue.compare(committed) !== 0) {
            setDisplayValue(new IncompleteDate(cal, hc, cv)); // reset in case prop isn't updated
            setDate(newDateValue as T);
            return;
          }
        }
      }
      // Incomplete/invalid value. Set temporary display override.
      setDisplayValue(newValue);
    }
  };

  const adjustSegment = (type: DateSegmentType, amount: number) => {
    setValue(displayValue().cycle(type, amount, placeholderDate(), displaySegments()));
  };

  const builtinValidation = createMemo<ValidationResult>(() =>
    getValidationResult(
      rawValue(),
      access(props.minValue),
      access(props.maxValue),
      props.isDateUnavailable,
      formatOpts(),
    ),
  );

  const isDisabled = createMemo(() => access(props.isDisabled) ?? false);
  const isReadOnly = createMemo(() => access(props.isReadOnly) ?? false);
  const isRequired = createMemo(() => access(props.isRequired) ?? false);
  const explicitValidationState = createMemo(() => access(props.validationState));
  const validationBehavior = () => props.validationBehavior ?? "native";

  const validation = createFormValidationState<T>({
    get value() {
      return rawValue();
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

  return {
    ...validation,
    value: calendarValue,
    defaultValue: props.defaultValue ?? initialValue,
    dateValue,
    get calendar() {
      return calendar();
    },
    setValue,
    segments,
    get dateFormatter() {
      return dateFormatter();
    },
    validationState,
    isInvalid,
    get granularity() {
      return granularity();
    },
    get maxGranularity() {
      return maxGranularity();
    },
    isDisabled,
    isReadOnly,
    isRequired,
    increment(part) {
      adjustSegment(part, 1);
    },
    decrement(part) {
      adjustSegment(part, -1);
    },
    incrementPage(part) {
      adjustSegment(part, PAGE_STEP[part] || 1);
    },
    decrementPage(part) {
      adjustSegment(part, -(PAGE_STEP[part] || 1));
    },
    incrementToMax(part) {
      const max =
        part === "hour" && hourCycle() === "h12"
          ? 11
          : displayValue().getSegmentLimits(part)?.maxValue;
      if (max != null) setValue(displayValue().set(part, max, placeholderDate()));
    },
    decrementToMin(part) {
      const min =
        part === "hour" && hourCycle() === "h12"
          ? 12
          : displayValue().getSegmentLimits(part)?.minValue;
      if (min != null) setValue(displayValue().set(part, min, placeholderDate()));
    },
    setSegment(part, value) {
      setValue(displayValue().set(part, value, placeholderDate()));
    },
    confirmPlaceholder() {
      if (access(props.isDisabled) || access(props.isReadOnly)) return;
      // If the display value is complete but invalid, constrain it and emit onChange on blur.
      if (displayValue().isComplete(displaySegments())) {
        const cv = calendarValue();
        const dv = displayValue().toValue(cv ?? placeholderDate());
        const v = v0();
        const newDateValue = toCalendar(
          dv,
          (v as { calendar?: Calendar } | null)?.calendar || new GregorianCalendar(),
        );
        const committed = rawValue();
        if (!committed || newDateValue.compare(committed) !== 0) setDate(newDateValue as T);
        setDisplayValue(new IncompleteDate(calendar(), hourCycle(), cv));
      }
    },
    clearSegment(part) {
      let value = displayValue();
      if (part !== "timeZoneName" && part !== "literal") value = displayValue().clear(part);
      setValue(value);
    },
    formatValue(fieldOptions) {
      if (!calendarValue()) return "";
      const formatOptions = getFormatOptions(fieldOptions, formatOpts());
      const formatter = new DateFormatter(locale(), formatOptions);
      return formatter.format(dateValue());
    },
    getDateFormatter(loc, formatOptions) {
      const newOptions = { ...formatOpts(), ...formatOptions };
      const newFormatOptions = getFormatOptions({}, newOptions);
      return new DateFormatter(loc, newFormatOptions);
    },
    get locale() {
      return locale();
    },
    get timeZone() {
      return timeZone();
    },
  };
}

// ---------------------------------------------------------------------------
// Segment processing
// ---------------------------------------------------------------------------

function processSegments(
  dateValue: Date,
  displayValue: IncompleteDate,
  dateFormatter: DateFormatter,
  resolvedOptions: Record<string, string>,
  calendar: Calendar,
  locale: string,
  granularity: FieldGranularity,
): DateSegment[] {
  const timeValue = ["hour", "minute", "second"];
  const parts = dateFormatter.formatToParts(dateValue) as Array<{
    type: string;
    value: string;
  }>;

  // Allow formatting temporarily invalid dates during editing (e.g. February 30th) by
  // rendering numeric segments directly from raw numbers. On blur they are constrained.
  const numberFormatter = new Intl.NumberFormat(locale, { useGrouping: false });
  const twoDigitFormatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
    minimumIntegerDigits: 2,
  });

  for (const segment of parts) {
    if (
      segment.type === "year" ||
      segment.type === "month" ||
      segment.type === "day" ||
      segment.type === "hour"
    ) {
      const value =
        (displayValue[segment.type as keyof IncompleteDate] as number | null | undefined) ?? 0;
      if (resolvedOptions[segment.type] === "2-digit") {
        segment.value = twoDigitFormatter.format(value);
      } else {
        segment.value = numberFormatter.format(value);
      }
    }
  }

  const processedSegments: DateSegment[] = [];
  for (const segment of parts) {
    const type = (TYPE_MAPPING[segment.type] || segment.type) as DateSegmentType;
    let isEditable = EDITABLE_SEGMENTS[type] === true;
    if (type === "era" && calendar.getEras().length === 1) isEditable = false;
    const isPlaceholder =
      EDITABLE_SEGMENTS[type] === true &&
      displayValue[segment.type as keyof IncompleteDate] == null;
    const placeholder = EDITABLE_SEGMENTS[type] ? getPlaceholder(type, segment.value, locale) : "";
    const limits = displayValue.getSegmentLimits(type);
    const dateSegment: DateSegment = {
      type,
      text: isPlaceholder ? placeholder : segment.value,
      value: limits?.value ?? undefined,
      minValue: limits?.minValue,
      maxValue: limits?.maxValue,
      isPlaceholder,
      placeholder,
      isEditable,
    };

    // There is an issue in RTL languages where time fields render (minute:hour) instead of
    // (hour:minute). To force LTR on the time field, wrap the time segments in LRI/PDI
    // (left-to-right isolate) unicode marks. See
    // https://www.w3.org/International/questions/qa-bidi-unicode-controls.
    if (type === "hour") {
      processedSegments.push({
        type: "literal",
        text: "⁦",
        value: undefined,
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      });
      processedSegments.push(dateSegment);
      if (type === granularity) {
        processedSegments.push({
          type: "literal",
          text: "⁩",
          value: undefined,
          isPlaceholder: false,
          placeholder: "",
          isEditable: false,
        });
      }
    } else if (timeValue.includes(type) && type === granularity) {
      processedSegments.push(dateSegment);
      processedSegments.push({
        type: "literal",
        text: "⁩",
        value: undefined,
        isPlaceholder: false,
        placeholder: "",
        isEditable: false,
      });
    } else {
      processedSegments.push(dateSegment);
    }
  }

  return processedSegments;
}

// ---------------------------------------------------------------------------
// Utilities ported from @react-stately/datepicker utils
// ---------------------------------------------------------------------------

interface FormatterOptions {
  timeZone?: string;
  hideTimeZone?: boolean;
  granularity?: Granularity;
  maxGranularity?: "year" | "month" | "day" | "hour" | "minute";
  hourCycle?: 12 | 24;
  showEra?: boolean;
  shouldForceLeadingZeros?: boolean;
}

const DEFAULT_FIELD_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
};

const TWO_DIGIT_FIELD_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export function getFormatOptions(
  fieldOptions: Intl.DateTimeFormatOptions | undefined,
  options: FormatterOptions,
): Intl.DateTimeFormatOptions {
  const defaultFieldOptions = options.shouldForceLeadingZeros
    ? TWO_DIGIT_FIELD_OPTIONS
    : DEFAULT_FIELD_OPTIONS;
  const merged: Record<string, unknown> = { ...defaultFieldOptions, ...fieldOptions };
  const granularity = options.granularity || "minute";
  const keys = Object.keys(merged);
  let startIdx = keys.indexOf(options.maxGranularity ?? "year");
  if (startIdx < 0) startIdx = 0;
  let endIdx = keys.indexOf(granularity);
  if (endIdx < 0) endIdx = 2;
  if (startIdx > endIdx) throw new Error("maxGranularity must be greater than granularity");
  const opts: Record<string, unknown> = keys
    .slice(startIdx, endIdx + 1)
    .reduce((acc: Record<string, unknown>, key) => {
      acc[key] = merged[key];
      return acc;
    }, {});
  if (options.hourCycle != null) opts.hour12 = options.hourCycle === 12;
  opts.timeZone = options.timeZone || "UTC";
  const hasTime = granularity === "hour" || granularity === "minute" || granularity === "second";
  if (hasTime && options.timeZone && !options.hideTimeZone) opts.timeZoneName = "short";
  if (options.showEra && startIdx === 0) opts.era = "short";
  return opts as Intl.DateTimeFormatOptions;
}

function convertValue(
  value: DateValue | null | undefined,
  calendar: Calendar,
): DateValue | null | undefined {
  if (value === null) return null;
  if (!value) return undefined;
  return toCalendar(value, calendar);
}

function createPlaceholderDate(
  placeholderValue: DateValue | undefined,
  granularity: string,
  calendar: Calendar,
  timeZone: string | undefined,
): DateValue {
  if (placeholderValue) return convertValue(placeholderValue, calendar) as DateValue;
  const date = toCalendar(
    now(timeZone ?? getLocalTimeZone()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
    calendar,
  );
  if (granularity === "year" || granularity === "month" || granularity === "day") {
    return toCalendarDate(date);
  }
  if (!timeZone) return toCalendarDateTime(date);
  return date;
}

/** The placeholder time, used by time-only fields. */
export function getPlaceholderTime(placeholderValue?: DateValue): Time | DateValue {
  if (placeholderValue && "hour" in placeholderValue) return placeholderValue;
  return new Time();
}

function getValidationLocale(): string {
  let locale =
    (typeof navigator !== "undefined" &&
      ((navigator.language as string) ||
        (navigator as unknown as { userLanguage?: string }).userLanguage)) ||
    "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }
  return locale;
}

export function getValidationResult(
  value: DateValue | null,
  minValue: DateValue | undefined,
  maxValue: DateValue | undefined,
  isDateUnavailable: ((date: DateValue) => boolean) | undefined,
  options: FormatterOptions,
): ValidationResult {
  const rangeOverflow = value != null && maxValue != null && value.compare(maxValue) > 0;
  const rangeUnderflow = value != null && minValue != null && value.compare(minValue) < 0;
  const isUnavailable = (value != null && isDateUnavailable?.(value)) || false;
  const isInvalid = rangeOverflow || rangeUnderflow || isUnavailable;
  const errors: string[] = [];
  if (isInvalid) {
    const locale = getValidationLocale();
    const dateFormatter = new DateFormatter(locale, getFormatOptions({}, options));
    const timeZone = dateFormatter.resolvedOptions().timeZone;
    if (rangeUnderflow && minValue != null) {
      errors.push(
        formatError(locale, "rangeUnderflow", {
          minValue: dateFormatter.format(minValue.toDate(timeZone)),
        }),
      );
    }
    if (rangeOverflow && maxValue != null) {
      errors.push(
        formatError(locale, "rangeOverflow", {
          maxValue: dateFormatter.format(maxValue.toDate(timeZone)),
        }),
      );
    }
    if (isUnavailable) errors.push(formatError(locale, "unavailableDate"));
  }
  const validationDetails: ValidityState = {
    ...VALID_VALIDITY_STATE,
    badInput: isUnavailable,
    rangeOverflow,
    rangeUnderflow,
    valid: !isInvalid,
  };
  return {
    isInvalid,
    validationErrors: errors,
    validationDetails,
  };
}

function formatError(
  locale: string,
  key: DateFieldErrorKey,
  args?: { minValue?: string; maxValue?: string },
): string {
  return formatDateFieldError(locale, key, args);
}

// Re-export so existing imports of CalendarDateTime keep resolving through this module.
export type { CalendarDateTime };
