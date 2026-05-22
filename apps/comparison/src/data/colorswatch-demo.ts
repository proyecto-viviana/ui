import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const colorSwatchSizeOptions = ["XS", "S", "M", "L"] as const;
export const colorSwatchRoundingOptions = ["default", "none", "full"] as const;

export type ColorSwatchDemoSize = (typeof colorSwatchSizeOptions)[number];
export type ColorSwatchDemoRounding = (typeof colorSwatchRoundingOptions)[number];

export interface ColorSwatchDemoProps {
  ariaLabel: string;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  ariaDetails: string;
  id: string;
  slot: string;
  color: string;
  colorName: string;
  size: ColorSwatchDemoSize;
  rounding: ColorSwatchDemoRounding;
}

export const colorSwatchDemoDefaults: ColorSwatchDemoProps = {
  ariaLabel: "Background color",
  ariaLabelledBy: "",
  ariaDescribedBy: "",
  ariaDetails: "",
  id: "",
  slot: "",
  color: "#ff6600",
  colorName: "",
  size: "M",
  rounding: "default",
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

export function normalizeColorSwatchDemoProps(
  props: Partial<ColorSwatchDemoProps>,
): ColorSwatchDemoProps {
  return {
    ariaLabel: stringProp(props.ariaLabel, colorSwatchDemoDefaults.ariaLabel),
    ariaLabelledBy: stringProp(props.ariaLabelledBy, colorSwatchDemoDefaults.ariaLabelledBy),
    ariaDescribedBy: stringProp(props.ariaDescribedBy, colorSwatchDemoDefaults.ariaDescribedBy),
    ariaDetails: stringProp(props.ariaDetails, colorSwatchDemoDefaults.ariaDetails),
    id: stringProp(props.id, colorSwatchDemoDefaults.id),
    slot: stringProp(props.slot, colorSwatchDemoDefaults.slot),
    color: stringProp(props.color, colorSwatchDemoDefaults.color),
    colorName: stringProp(props.colorName, colorSwatchDemoDefaults.colorName),
    size: isOneOf(props.size, colorSwatchSizeOptions) ? props.size : colorSwatchDemoDefaults.size,
    rounding: isOneOf(props.rounding, colorSwatchRoundingOptions)
      ? props.rounding
      : colorSwatchDemoDefaults.rounding,
  };
}

export function colorSwatchDemoPropsFromSearch(search: string): ColorSwatchDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const rounding = params.get("rounding");

  return normalizeColorSwatchDemoProps({
    ariaLabel: params.get("ariaLabel") ?? colorSwatchDemoDefaults.ariaLabel,
    ariaLabelledBy: params.get("ariaLabelledBy") ?? colorSwatchDemoDefaults.ariaLabelledBy,
    ariaDescribedBy: params.get("ariaDescribedBy") ?? colorSwatchDemoDefaults.ariaDescribedBy,
    ariaDetails: params.get("ariaDetails") ?? colorSwatchDemoDefaults.ariaDetails,
    id: params.get("id") ?? colorSwatchDemoDefaults.id,
    slot: params.get("slot") ?? colorSwatchDemoDefaults.slot,
    color: params.get("color") ?? colorSwatchDemoDefaults.color,
    colorName: params.get("colorName") ?? colorSwatchDemoDefaults.colorName,
    size: isOneOf(size, colorSwatchSizeOptions) ? size : colorSwatchDemoDefaults.size,
    rounding: isOneOf(rounding, colorSwatchRoundingOptions)
      ? rounding
      : colorSwatchDemoDefaults.rounding,
  });
}

export function colorSwatchDemoPropsFromWindow(): ColorSwatchDemoProps {
  if (typeof window === "undefined") {
    return colorSwatchDemoDefaults;
  }
  return colorSwatchDemoPropsFromSearch(window.location.search);
}

export function serializeColorSwatchDemoProps(props: ColorSwatchDemoProps) {
  return JSON.stringify({
    ariaLabel: props.ariaLabel,
    ariaLabelledBy: props.ariaLabelledBy,
    ariaDescribedBy: props.ariaDescribedBy,
    ariaDetails: props.ariaDetails,
    id: props.id,
    slot: props.slot,
    color: props.color,
    colorName: props.colorName,
    size: props.size,
    rounding: props.rounding,
  });
}
