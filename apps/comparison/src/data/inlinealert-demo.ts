export const inlineAlertVariantOptions = [
  "neutral",
  "informative",
  "positive",
  "notice",
  "negative",
] as const;
export const inlineAlertFillStyleOptions = ["border", "subtleFill", "boldFill"] as const;

export type InlineAlertDemoVariant = (typeof inlineAlertVariantOptions)[number];
export type InlineAlertDemoFillStyle = (typeof inlineAlertFillStyleOptions)[number];

export interface InlineAlertDemoProps {
  variant: InlineAlertDemoVariant;
  fillStyle: InlineAlertDemoFillStyle;
  autoFocus: boolean;
}

export const inlineAlertDemoDefaults: InlineAlertDemoProps = {
  variant: "neutral",
  fillStyle: "border",
  autoFocus: false,
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

export function normalizeInlineAlertDemoProps(
  props: Partial<InlineAlertDemoProps> = {},
): InlineAlertDemoProps {
  return {
    variant: isOneOf(props.variant, inlineAlertVariantOptions)
      ? props.variant
      : inlineAlertDemoDefaults.variant,
    fillStyle: isOneOf(props.fillStyle, inlineAlertFillStyleOptions)
      ? props.fillStyle
      : inlineAlertDemoDefaults.fillStyle,
    autoFocus: props.autoFocus ?? inlineAlertDemoDefaults.autoFocus,
  };
}

export function inlineAlertDemoPropsFromSearch(search: string): InlineAlertDemoProps {
  const params = new URLSearchParams(search);
  const variant = params.get("variant");
  const fillStyle = params.get("fillStyle");

  return normalizeInlineAlertDemoProps({
    variant: isOneOf(variant, inlineAlertVariantOptions)
      ? variant
      : inlineAlertDemoDefaults.variant,
    fillStyle: isOneOf(fillStyle, inlineAlertFillStyleOptions)
      ? fillStyle
      : inlineAlertDemoDefaults.fillStyle,
    autoFocus: params.has("autoFocus")
      ? booleanParam(params.get("autoFocus"))
      : inlineAlertDemoDefaults.autoFocus,
  });
}

export function inlineAlertDemoPropsFromWindow(): InlineAlertDemoProps {
  if (typeof window === "undefined") {
    return inlineAlertDemoDefaults;
  }

  return inlineAlertDemoPropsFromSearch(window.location.search);
}

export function serializeInlineAlertDemoProps(props: InlineAlertDemoProps): string {
  return JSON.stringify(normalizeInlineAlertDemoProps(props));
}
