import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const colorWheelValueSourceOptions = ["value", "defaultValue"] as const;
export const colorWheelSizeOptions = ["175", "192", "224", "256"] as const;

export type ColorWheelDemoValueSource = (typeof colorWheelValueSourceOptions)[number];
export type ColorWheelDemoSize = (typeof colorWheelSizeOptions)[number];

export interface ColorWheelDemoProps {
  ariaLabel: string;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  ariaDetails: string;
  id: string;
  slot: string;
  valueSource: ColorWheelDemoValueSource;
  value: string;
  defaultValue: string;
  size: ColorWheelDemoSize;
  name: string;
  form: string;
  isDisabled: boolean;
}

export const colorWheelDemoDefaults: ColorWheelDemoProps = {
  ariaLabel: "Hue",
  ariaLabelledBy: "",
  ariaDescribedBy: "",
  ariaDetails: "",
  id: "",
  slot: "",
  valueSource: "defaultValue",
  value: "hsl(0, 100%, 50%)",
  defaultValue: "hsl(0, 100%, 50%)",
  size: "192",
  name: "",
  form: "",
  isDisabled: false,
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

function stringProp(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

export function normalizeColorWheelDemoProps(
  props: Partial<ColorWheelDemoProps>,
): ColorWheelDemoProps {
  return {
    ariaLabel: stringProp(props.ariaLabel, colorWheelDemoDefaults.ariaLabel),
    ariaLabelledBy: stringProp(props.ariaLabelledBy, colorWheelDemoDefaults.ariaLabelledBy),
    ariaDescribedBy: stringProp(props.ariaDescribedBy, colorWheelDemoDefaults.ariaDescribedBy),
    ariaDetails: stringProp(props.ariaDetails, colorWheelDemoDefaults.ariaDetails),
    id: stringProp(props.id, colorWheelDemoDefaults.id),
    slot: stringProp(props.slot, colorWheelDemoDefaults.slot),
    valueSource: isOneOf(props.valueSource, colorWheelValueSourceOptions)
      ? props.valueSource
      : colorWheelDemoDefaults.valueSource,
    value: stringProp(props.value, colorWheelDemoDefaults.value) || colorWheelDemoDefaults.value,
    defaultValue:
      stringProp(props.defaultValue, colorWheelDemoDefaults.defaultValue) ||
      colorWheelDemoDefaults.defaultValue,
    size: isOneOf(props.size, colorWheelSizeOptions) ? props.size : colorWheelDemoDefaults.size,
    name: stringProp(props.name, colorWheelDemoDefaults.name),
    form: stringProp(props.form, colorWheelDemoDefaults.form),
    isDisabled: props.isDisabled === true,
  };
}

export function colorWheelDemoPropsFromSearch(search: string): ColorWheelDemoProps {
  const params = new URLSearchParams(search);
  const valueSource = params.get("valueSource");
  const size = params.get("size");

  return normalizeColorWheelDemoProps({
    ariaLabel: params.get("ariaLabel") ?? colorWheelDemoDefaults.ariaLabel,
    ariaLabelledBy: params.get("ariaLabelledBy") ?? colorWheelDemoDefaults.ariaLabelledBy,
    ariaDescribedBy: params.get("ariaDescribedBy") ?? colorWheelDemoDefaults.ariaDescribedBy,
    ariaDetails: params.get("ariaDetails") ?? colorWheelDemoDefaults.ariaDetails,
    id: params.get("id") ?? colorWheelDemoDefaults.id,
    slot: params.get("slot") ?? colorWheelDemoDefaults.slot,
    valueSource: isOneOf(valueSource, colorWheelValueSourceOptions)
      ? valueSource
      : colorWheelDemoDefaults.valueSource,
    value: params.get("value") ?? colorWheelDemoDefaults.value,
    defaultValue: params.get("defaultValue") ?? colorWheelDemoDefaults.defaultValue,
    size: isOneOf(size, colorWheelSizeOptions) ? size : colorWheelDemoDefaults.size,
    name: params.get("name") ?? colorWheelDemoDefaults.name,
    form: params.get("form") ?? colorWheelDemoDefaults.form,
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function colorWheelDemoPropsFromWindow(): ColorWheelDemoProps {
  if (typeof window === "undefined") {
    return colorWheelDemoDefaults;
  }
  return colorWheelDemoPropsFromSearch(window.location.search);
}

export function initialColorWheelDemoValue(props: ColorWheelDemoProps) {
  return props.valueSource === "defaultValue" ? props.defaultValue : props.value;
}

export function colorWheelDemoSizeNumber(props: Pick<ColorWheelDemoProps, "size">) {
  return Number(props.size) || Number(colorWheelDemoDefaults.size);
}

export function serializeColorWheelDemoProps(props: ColorWheelDemoProps) {
  return JSON.stringify({
    ariaLabel: props.ariaLabel,
    ariaLabelledBy: props.ariaLabelledBy,
    ariaDescribedBy: props.ariaDescribedBy,
    ariaDetails: props.ariaDetails,
    id: props.id,
    slot: props.slot,
    valueSource: props.valueSource,
    value: props.value,
    defaultValue: props.defaultValue,
    size: props.size,
    name: props.name,
    form: props.form,
    isDisabled: props.isDisabled,
  });
}
