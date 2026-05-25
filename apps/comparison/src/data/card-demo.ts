import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const cardSizeOptions = ["XS", "S", "M", "L", "XL"] as const;
export const cardDensityOptions = ["compact", "regular", "spacious"] as const;
export const cardVariantOptions = ["primary", "secondary", "tertiary", "quiet"] as const;

export type CardSize = (typeof cardSizeOptions)[number];
export type CardDensity = (typeof cardDensityOptions)[number];
export type CardVariant = (typeof cardVariantOptions)[number];

export interface CardDemoProps {
  title: string;
  description: string;
  size: CardSize;
  density: CardDensity;
  variant: CardVariant;
  showPreview: boolean;
  showFooter: boolean;
  isDisabled: boolean;
  href: string;
  textValue: string;
  skeleton: boolean;
}

export const cardDemoDefaults: CardDemoProps = {
  title: "Apollo",
  description: "Active",
  size: "M",
  density: "regular",
  variant: "primary",
  showPreview: true,
  showFooter: false,
  isDisabled: false,
  href: "",
  textValue: "Apollo",
  skeleton: false,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | boolean | null | undefined, fallback = false) {
  if (value == null) {
    return fallback;
  }

  return value === true || value === "true" || value === "on" || value === "1";
}

function textProp(value: string | null | undefined, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function normalizeCardDemoProps(props: Partial<CardDemoProps> = {}): CardDemoProps {
  const title = textProp(props.title, cardDemoDefaults.title);

  return {
    title,
    description: textProp(props.description, cardDemoDefaults.description),
    size: isOneOf(props.size, cardSizeOptions) ? props.size : cardDemoDefaults.size,
    density: isOneOf(props.density, cardDensityOptions) ? props.density : cardDemoDefaults.density,
    variant: isOneOf(props.variant, cardVariantOptions) ? props.variant : cardDemoDefaults.variant,
    showPreview: props.showPreview !== false,
    showFooter: props.showFooter === true,
    isDisabled: props.isDisabled === true,
    href: typeof props.href === "string" ? props.href : cardDemoDefaults.href,
    textValue: textProp(props.textValue, title),
    skeleton: props.skeleton === true,
  };
}

export function cardDemoPropsFromSearch(search: string): CardDemoProps {
  const params = new URLSearchParams(search);

  return normalizeCardDemoProps({
    title: params.get("title") ?? cardDemoDefaults.title,
    description: params.get("description") ?? cardDemoDefaults.description,
    size: isOneOf(params.get("size"), cardSizeOptions)
      ? (params.get("size") as CardSize)
      : cardDemoDefaults.size,
    density: isOneOf(params.get("density"), cardDensityOptions)
      ? (params.get("density") as CardDensity)
      : cardDemoDefaults.density,
    variant: isOneOf(params.get("variant"), cardVariantOptions)
      ? (params.get("variant") as CardVariant)
      : cardDemoDefaults.variant,
    showPreview: booleanParam(params.get("showPreview"), true),
    showFooter: booleanParam(params.get("showFooter")),
    isDisabled: booleanParam(params.get("isDisabled")),
    href: params.get("href") ?? cardDemoDefaults.href,
    textValue: params.get("textValue") ?? cardDemoDefaults.textValue,
    skeleton: booleanParam(params.get("skeleton")),
  });
}

export function cardDemoPropsFromWindow(): CardDemoProps {
  if (typeof window === "undefined") {
    return cardDemoDefaults;
  }

  return cardDemoPropsFromSearch(window.location.search);
}

export function serializeCardDemoProps(props: CardDemoProps): string {
  return JSON.stringify(normalizeCardDemoProps(props));
}
