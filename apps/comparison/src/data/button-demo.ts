export const buttonVariantOptions = [
  "primary",
  "secondary",
  "accent",
  "negative",
  "premium",
  "genai",
] as const;

export const buttonFillStyleOptions = ["fill", "outline"] as const;
export const buttonSizeOptions = ["S", "M", "L", "XL"] as const;
export const buttonStaticColorOptions = ["white", "black", "auto"] as const;
export const buttonIconPlacementOptions = ["none", "start", "only"] as const;
export const buttonDemoLocaleOptions = ["en-US", "ar-SA"] as const;

export type ButtonDemoVariant = (typeof buttonVariantOptions)[number];
export type ButtonDemoFillStyle = (typeof buttonFillStyleOptions)[number];
export type ButtonDemoSize = (typeof buttonSizeOptions)[number];
export type ButtonDemoStaticColor = (typeof buttonStaticColorOptions)[number];
export type ButtonDemoIconPlacement = (typeof buttonIconPlacementOptions)[number];
export type ButtonDemoLocale = (typeof buttonDemoLocaleOptions)[number];

export interface ButtonDemoProps {
  children: string;
  variant: ButtonDemoVariant;
  fillStyle: ButtonDemoFillStyle;
  size: ButtonDemoSize;
  staticColor?: ButtonDemoStaticColor;
  iconPlacement: ButtonDemoIconPlacement;
  isDisabled: boolean;
  isPending: boolean;
}

export const buttonDemoDefaults: ButtonDemoProps = {
  children: "Save",
  variant: "primary",
  fillStyle: "fill",
  size: "M",
  staticColor: undefined,
  iconPlacement: "none",
  isDisabled: false,
  isPending: false,
};

export const comparisonControlsEvent = "comparison:controls-change";

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function buttonDemoPropsFromSearch(search: string): ButtonDemoProps {
  const params = new URLSearchParams(search);
  const variant = params.get("variant");
  const fillStyle = params.get("fillStyle");
  const size = params.get("size");
  const staticColor = params.get("staticColor");
  const iconPlacement = params.get("iconPlacement");

  return {
    children: params.get("children") || buttonDemoDefaults.children,
    variant: isOneOf(variant, buttonVariantOptions) ? variant : buttonDemoDefaults.variant,
    fillStyle: isOneOf(fillStyle, buttonFillStyleOptions)
      ? fillStyle
      : buttonDemoDefaults.fillStyle,
    size: isOneOf(size, buttonSizeOptions) ? size : buttonDemoDefaults.size,
    staticColor: isOneOf(staticColor, buttonStaticColorOptions) ? staticColor : undefined,
    iconPlacement: isOneOf(iconPlacement, buttonIconPlacementOptions)
      ? iconPlacement
      : buttonDemoDefaults.iconPlacement,
    isDisabled: booleanParam(params.get("isDisabled")),
    isPending: booleanParam(params.get("isPending")),
  };
}

export function buttonDemoLocaleFromSearch(search: string): ButtonDemoLocale | undefined {
  const locale = new URLSearchParams(search).get("locale");
  return isOneOf(locale, buttonDemoLocaleOptions) ? locale : undefined;
}

export function buttonDemoPropsFromWindow(): ButtonDemoProps {
  if (typeof window === "undefined") {
    return buttonDemoDefaults;
  }

  return buttonDemoPropsFromSearch(window.location.search);
}

export function buttonDemoLocaleFromWindow(): ButtonDemoLocale | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return buttonDemoLocaleFromSearch(window.location.search);
}

export function serializeButtonDemoProps(props: ButtonDemoProps) {
  return JSON.stringify({
    children: props.children,
    variant: props.variant,
    fillStyle: props.fillStyle,
    size: props.size,
    staticColor: props.staticColor,
    iconPlacement: props.iconPlacement,
    isDisabled: props.isDisabled,
    isPending: props.isPending,
  });
}
