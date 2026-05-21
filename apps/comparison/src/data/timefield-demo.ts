import { parseTime, type TimeValue } from "@proyecto-viviana/solid-stately";
import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const timeFieldSizeOptions = ["S", "M", "L", "XL"] as const;
export const timeFieldLabelPositionOptions = ["top", "side"] as const;
export const timeFieldLabelAlignOptions = ["start", "end"] as const;
export const timeFieldNecessityIndicatorOptions = ["icon", "label"] as const;
export const timeFieldGranularityOptions = ["hour", "minute", "second"] as const;
export const timeFieldHourCycleOptions = ["", "12", "24"] as const;
export const timeFieldLocaleOptions = ["", "fr-FR", "ar-AE", "hi-IN"] as const;
export const timeFieldValidationBehaviorOptions = ["", "native", "aria"] as const;

export type TimeFieldDemoSize = (typeof timeFieldSizeOptions)[number];
export type TimeFieldLabelPosition = (typeof timeFieldLabelPositionOptions)[number];
export type TimeFieldLabelAlign = (typeof timeFieldLabelAlignOptions)[number];
export type TimeFieldNecessityIndicator = (typeof timeFieldNecessityIndicatorOptions)[number];
export type TimeFieldGranularity = (typeof timeFieldGranularityOptions)[number];
export type TimeFieldHourCycle = (typeof timeFieldHourCycleOptions)[number];
export type TimeFieldLocale = (typeof timeFieldLocaleOptions)[number];
export type TimeFieldValidationBehavior = (typeof timeFieldValidationBehaviorOptions)[number];

export interface TimeFieldDemoProps {
  label: string;
  size: TimeFieldDemoSize;
  labelPosition: TimeFieldLabelPosition;
  labelAlign: TimeFieldLabelAlign;
  necessityIndicator: TimeFieldNecessityIndicator;
  withContextualHelp: boolean;
  value: string;
  granularity: TimeFieldGranularity;
  shouldForceLeadingZeros: boolean;
  hourCycle: TimeFieldHourCycle;
  hideTimeZone: boolean;
  locale: TimeFieldLocale;
  name: string;
  form: string;
  validationBehavior: TimeFieldValidationBehavior;
  description: string;
  errorMessage: string;
  constrainRange: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const timeFieldDemoDefaults: TimeFieldDemoProps = {
  label: "Start time",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  withContextualHelp: false,
  value: "09:30:00",
  granularity: "minute",
  shouldForceLeadingZeros: false,
  hourCycle: "",
  hideTimeZone: false,
  locale: "",
  name: "",
  form: "",
  validationBehavior: "",
  description: "Enter the start time.",
  errorMessage: "Enter a valid start time.",
  constrainRange: false,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isInvalid: false,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function timeFieldTimeFromString(value: string): TimeValue | null {
  if (!value) {
    return null;
  }

  try {
    return parseTime(value);
  } catch {
    return null;
  }
}

export function timeFieldValueFromDemo(props: Pick<TimeFieldDemoProps, "value">): TimeValue | null {
  return timeFieldTimeFromString(props.value);
}

export function serializeTimeFieldValue(value: TimeValue | null): string {
  return value ? String(value) : "";
}

export function timeFieldMinValue(): TimeValue {
  return parseTime("08:00:00");
}

export function timeFieldMaxValue(): TimeValue {
  return parseTime("18:00:00");
}

function getTimePart(value: TimeValue, part: "hour" | "minute" | "second"): number {
  return part in value ? Number(value[part]) : 0;
}

function compareTimeValues(a: TimeValue, b: TimeValue): number {
  const hour = getTimePart(a, "hour") - getTimePart(b, "hour");
  if (hour !== 0) return hour;

  const minute = getTimePart(a, "minute") - getTimePart(b, "minute");
  if (minute !== 0) return minute;

  return getTimePart(a, "second") - getTimePart(b, "second");
}

export function isTimeFieldDemoValueInvalid(
  props: Pick<TimeFieldDemoProps, "constrainRange">,
  value: TimeValue | null,
): boolean {
  if (!value || !props.constrainRange) {
    return false;
  }

  return (
    compareTimeValues(value, timeFieldMinValue()) < 0 ||
    compareTimeValues(value, timeFieldMaxValue()) > 0
  );
}

export function normalizeTimeFieldDemoProps(
  props: Partial<TimeFieldDemoProps>,
): TimeFieldDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : timeFieldDemoDefaults.label,
    size: isOneOf(props.size, timeFieldSizeOptions) ? props.size : timeFieldDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, timeFieldLabelPositionOptions)
      ? props.labelPosition
      : timeFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, timeFieldLabelAlignOptions)
      ? props.labelAlign
      : timeFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, timeFieldNecessityIndicatorOptions)
      ? props.necessityIndicator
      : timeFieldDemoDefaults.necessityIndicator,
    withContextualHelp: props.withContextualHelp === true,
    value: typeof props.value === "string" ? props.value : timeFieldDemoDefaults.value,
    granularity: isOneOf(props.granularity, timeFieldGranularityOptions)
      ? props.granularity
      : timeFieldDemoDefaults.granularity,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros === true,
    hourCycle: isOneOf(props.hourCycle, timeFieldHourCycleOptions)
      ? props.hourCycle
      : timeFieldDemoDefaults.hourCycle,
    hideTimeZone: props.hideTimeZone === true,
    locale: isOneOf(props.locale, timeFieldLocaleOptions)
      ? props.locale
      : timeFieldDemoDefaults.locale,
    name: typeof props.name === "string" ? props.name : timeFieldDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : timeFieldDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, timeFieldValidationBehaviorOptions)
      ? props.validationBehavior
      : timeFieldDemoDefaults.validationBehavior,
    description:
      typeof props.description === "string" ? props.description : timeFieldDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : timeFieldDemoDefaults.errorMessage,
    constrainRange: props.constrainRange === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function timeFieldDemoPropsFromSearch(search: string): TimeFieldDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const necessityIndicator = params.get("necessityIndicator");
  const granularity = params.get("granularity");
  const hourCycle = params.get("hourCycle");
  const locale = params.get("locale");
  const validationBehavior = params.get("validationBehavior");

  return normalizeTimeFieldDemoProps({
    label: params.get("label") || timeFieldDemoDefaults.label,
    size: isOneOf(size, timeFieldSizeOptions) ? size : timeFieldDemoDefaults.size,
    labelPosition: isOneOf(labelPosition, timeFieldLabelPositionOptions)
      ? labelPosition
      : timeFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, timeFieldLabelAlignOptions)
      ? labelAlign
      : timeFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(necessityIndicator, timeFieldNecessityIndicatorOptions)
      ? necessityIndicator
      : timeFieldDemoDefaults.necessityIndicator,
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
    value: params.get("value") ?? timeFieldDemoDefaults.value,
    granularity: isOneOf(granularity, timeFieldGranularityOptions)
      ? granularity
      : timeFieldDemoDefaults.granularity,
    shouldForceLeadingZeros: booleanParam(params.get("shouldForceLeadingZeros")),
    hourCycle: isOneOf(hourCycle, timeFieldHourCycleOptions)
      ? hourCycle
      : timeFieldDemoDefaults.hourCycle,
    hideTimeZone: booleanParam(params.get("hideTimeZone")),
    locale: isOneOf(locale, timeFieldLocaleOptions) ? locale : timeFieldDemoDefaults.locale,
    name: params.get("name") ?? timeFieldDemoDefaults.name,
    form: params.get("form") ?? timeFieldDemoDefaults.form,
    validationBehavior: isOneOf(validationBehavior, timeFieldValidationBehaviorOptions)
      ? validationBehavior
      : timeFieldDemoDefaults.validationBehavior,
    description: params.get("description") ?? timeFieldDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? timeFieldDemoDefaults.errorMessage,
    constrainRange: booleanParam(params.get("constrainRange")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function timeFieldDemoPropsFromWindow(): TimeFieldDemoProps {
  if (typeof window === "undefined") {
    return timeFieldDemoDefaults;
  }

  return timeFieldDemoPropsFromSearch(window.location.search);
}

export function serializeTimeFieldDemoProps(props: TimeFieldDemoProps) {
  return JSON.stringify({
    label: props.label,
    size: props.size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    necessityIndicator: props.necessityIndicator,
    withContextualHelp: props.withContextualHelp,
    value: props.value,
    granularity: props.granularity,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros,
    hourCycle: props.hourCycle,
    hideTimeZone: props.hideTimeZone,
    locale: props.locale,
    name: props.name,
    form: props.form,
    validationBehavior: props.validationBehavior,
    description: props.description,
    errorMessage: props.errorMessage,
    constrainRange: props.constrainRange,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
