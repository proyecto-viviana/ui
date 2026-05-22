import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const colorSwatchPickerSizeOptions = ["XS", "S", "M", "L"] as const;
export const colorSwatchPickerDensityOptions = ["compact", "regular", "spacious"] as const;
export const colorSwatchPickerRoundingOptions = ["none", "default", "full"] as const;
export const colorSwatchPickerValueSourceOptions = ["value", "defaultValue"] as const;

export const colorSwatchPickerPalette = [
  { color: "#e11d48", colorName: "Rose" },
  { color: "#f97316", colorName: "Orange" },
  { color: "#eab308", colorName: "Yellow" },
  { color: "#22c55e", colorName: "Green" },
  { color: "#3b82f6", colorName: "Blue" },
  { color: "#8b5cf6", colorName: "Violet" },
  { color: "#ec4899", colorName: "Pink" },
] as const;

export type ColorSwatchPickerDemoSize = (typeof colorSwatchPickerSizeOptions)[number];
export type ColorSwatchPickerDemoDensity = (typeof colorSwatchPickerDensityOptions)[number];
export type ColorSwatchPickerDemoRounding = (typeof colorSwatchPickerRoundingOptions)[number];
export type ColorSwatchPickerDemoValueSource = (typeof colorSwatchPickerValueSourceOptions)[number];

export interface ColorSwatchPickerDemoProps {
  ariaLabel: string;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  ariaDetails: string;
  id: string;
  slot: string;
  valueSource: ColorSwatchPickerDemoValueSource;
  value: string;
  defaultValue: string;
  density: ColorSwatchPickerDemoDensity;
  size: ColorSwatchPickerDemoSize;
  rounding: ColorSwatchPickerDemoRounding;
}

export const colorSwatchPickerDemoDefaults: ColorSwatchPickerDemoProps = {
  ariaLabel: "Accent color",
  ariaLabelledBy: "",
  ariaDescribedBy: "",
  ariaDetails: "",
  id: "",
  slot: "",
  valueSource: "defaultValue",
  value: colorSwatchPickerPalette[0].color,
  defaultValue: colorSwatchPickerPalette[0].color,
  density: "regular",
  size: "M",
  rounding: "none",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function stringProp(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

export function normalizeColorSwatchPickerDemoProps(
  props: Partial<ColorSwatchPickerDemoProps>,
): ColorSwatchPickerDemoProps {
  return {
    ariaLabel: stringProp(props.ariaLabel, colorSwatchPickerDemoDefaults.ariaLabel),
    ariaLabelledBy: stringProp(props.ariaLabelledBy, colorSwatchPickerDemoDefaults.ariaLabelledBy),
    ariaDescribedBy: stringProp(
      props.ariaDescribedBy,
      colorSwatchPickerDemoDefaults.ariaDescribedBy,
    ),
    ariaDetails: stringProp(props.ariaDetails, colorSwatchPickerDemoDefaults.ariaDetails),
    id: stringProp(props.id, colorSwatchPickerDemoDefaults.id),
    slot: stringProp(props.slot, colorSwatchPickerDemoDefaults.slot),
    valueSource: isOneOf(props.valueSource, colorSwatchPickerValueSourceOptions)
      ? props.valueSource
      : colorSwatchPickerDemoDefaults.valueSource,
    value:
      stringProp(props.value, colorSwatchPickerDemoDefaults.value) ||
      colorSwatchPickerDemoDefaults.value,
    defaultValue:
      stringProp(props.defaultValue, colorSwatchPickerDemoDefaults.defaultValue) ||
      colorSwatchPickerDemoDefaults.defaultValue,
    density: isOneOf(props.density, colorSwatchPickerDensityOptions)
      ? props.density
      : colorSwatchPickerDemoDefaults.density,
    size: isOneOf(props.size, colorSwatchPickerSizeOptions)
      ? props.size
      : colorSwatchPickerDemoDefaults.size,
    rounding: isOneOf(props.rounding, colorSwatchPickerRoundingOptions)
      ? props.rounding
      : colorSwatchPickerDemoDefaults.rounding,
  };
}

export function colorSwatchPickerDemoPropsFromSearch(search: string): ColorSwatchPickerDemoProps {
  const params = new URLSearchParams(search);
  const valueSource = params.get("valueSource");
  const density = params.get("density");
  const size = params.get("size");
  const rounding = params.get("rounding");

  return normalizeColorSwatchPickerDemoProps({
    ariaLabel: params.get("ariaLabel") ?? colorSwatchPickerDemoDefaults.ariaLabel,
    ariaLabelledBy: params.get("ariaLabelledBy") ?? colorSwatchPickerDemoDefaults.ariaLabelledBy,
    ariaDescribedBy: params.get("ariaDescribedBy") ?? colorSwatchPickerDemoDefaults.ariaDescribedBy,
    ariaDetails: params.get("ariaDetails") ?? colorSwatchPickerDemoDefaults.ariaDetails,
    id: params.get("id") ?? colorSwatchPickerDemoDefaults.id,
    slot: params.get("slot") ?? colorSwatchPickerDemoDefaults.slot,
    valueSource: isOneOf(valueSource, colorSwatchPickerValueSourceOptions)
      ? valueSource
      : colorSwatchPickerDemoDefaults.valueSource,
    value: params.get("value") ?? colorSwatchPickerDemoDefaults.value,
    defaultValue: params.get("defaultValue") ?? colorSwatchPickerDemoDefaults.defaultValue,
    density: isOneOf(density, colorSwatchPickerDensityOptions)
      ? density
      : colorSwatchPickerDemoDefaults.density,
    size: isOneOf(size, colorSwatchPickerSizeOptions) ? size : colorSwatchPickerDemoDefaults.size,
    rounding: isOneOf(rounding, colorSwatchPickerRoundingOptions)
      ? rounding
      : colorSwatchPickerDemoDefaults.rounding,
  });
}

export function colorSwatchPickerDemoPropsFromWindow(): ColorSwatchPickerDemoProps {
  if (typeof window === "undefined") {
    return colorSwatchPickerDemoDefaults;
  }
  return colorSwatchPickerDemoPropsFromSearch(window.location.search);
}

export function initialColorSwatchPickerDemoValue(props: ColorSwatchPickerDemoProps) {
  return props.valueSource === "defaultValue" ? props.defaultValue : props.value;
}

export function serializeColorSwatchPickerDemoProps(props: ColorSwatchPickerDemoProps) {
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
    density: props.density,
    size: props.size,
    rounding: props.rounding,
  });
}
