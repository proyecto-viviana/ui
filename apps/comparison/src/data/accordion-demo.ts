export const accordionSizeOptions = ["S", "M", "L", "XL"] as const;
export const accordionDensityOptions = ["compact", "regular", "spacious"] as const;
export const accordionDemoLocaleOptions = ["en-US", "ar-SA"] as const;

export type AccordionDemoSize = (typeof accordionSizeOptions)[number];
export type AccordionDemoDensity = (typeof accordionDensityOptions)[number];
export type AccordionDemoLocale = (typeof accordionDemoLocaleOptions)[number];

export interface AccordionDemoProps {
  size: AccordionDemoSize;
  density: AccordionDemoDensity;
  isQuiet: boolean;
  isDisabled: boolean;
  allowsMultipleExpanded: boolean;
}

export const accordionDemoDefaults: AccordionDemoProps = {
  size: "M",
  density: "regular",
  isQuiet: false,
  isDisabled: false,
  allowsMultipleExpanded: false,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanValue(value: unknown): boolean {
  return value === true || value === "true";
}

export function normalizeAccordionDemoProps(
  props: Partial<AccordionDemoProps> = {},
): AccordionDemoProps {
  return {
    size: isOneOf(props.size, accordionSizeOptions) ? props.size : accordionDemoDefaults.size,
    density: isOneOf(props.density, accordionDensityOptions)
      ? props.density
      : accordionDemoDefaults.density,
    isQuiet: booleanValue(props.isQuiet),
    isDisabled: booleanValue(props.isDisabled),
    allowsMultipleExpanded: booleanValue(props.allowsMultipleExpanded),
  };
}

export function accordionDemoPropsFromSearch(search: string): AccordionDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const density = params.get("density");

  return normalizeAccordionDemoProps({
    size: isOneOf(size, accordionSizeOptions) ? size : accordionDemoDefaults.size,
    density: isOneOf(density, accordionDensityOptions) ? density : accordionDemoDefaults.density,
    isQuiet: params.get("isQuiet") === "true",
    isDisabled: params.get("isDisabled") === "true",
    allowsMultipleExpanded: params.get("allowsMultipleExpanded") === "true",
  });
}

export function accordionDemoLocaleFromSearch(search: string): AccordionDemoLocale | undefined {
  const locale = new URLSearchParams(search).get("locale");
  return isOneOf(locale, accordionDemoLocaleOptions) ? locale : undefined;
}

export function accordionDemoPropsFromWindow(): AccordionDemoProps {
  if (typeof window === "undefined") {
    return accordionDemoDefaults;
  }

  return accordionDemoPropsFromSearch(window.location.search);
}

export function accordionDemoLocaleFromWindow(): AccordionDemoLocale | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return accordionDemoLocaleFromSearch(window.location.search);
}

export function serializeAccordionDemoProps(props: AccordionDemoProps): string {
  return JSON.stringify(normalizeAccordionDemoProps(props));
}
