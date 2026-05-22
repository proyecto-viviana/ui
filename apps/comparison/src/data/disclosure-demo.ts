export const disclosureSizeOptions = ["S", "M", "L", "XL"] as const;
export const disclosureDensityOptions = ["compact", "regular", "spacious"] as const;
export const disclosurePanelRoleOptions = ["group", "region"] as const;
export const disclosureTitleLevelOptions = ["2", "3", "4"] as const;
export const disclosureDemoLocaleOptions = ["en-US", "ar-SA"] as const;

export type DisclosureDemoSize = (typeof disclosureSizeOptions)[number];
export type DisclosureDemoDensity = (typeof disclosureDensityOptions)[number];
export type DisclosurePanelRole = (typeof disclosurePanelRoleOptions)[number];
export type DisclosureTitleLevel = (typeof disclosureTitleLevelOptions)[number];
export type DisclosureDemoLocale = (typeof disclosureDemoLocaleOptions)[number];

export interface DisclosureDemoProps {
  size: DisclosureDemoSize;
  density: DisclosureDemoDensity;
  isQuiet: boolean;
  isDisabled: boolean;
  isExpanded: boolean;
  withHeaderAction: boolean;
  panelRole: DisclosurePanelRole;
  titleLevel: DisclosureTitleLevel;
}

export const disclosureDemoDefaults: DisclosureDemoProps = {
  size: "M",
  density: "regular",
  isQuiet: false,
  isDisabled: false,
  isExpanded: true,
  withHeaderAction: true,
  panelRole: "group",
  titleLevel: "3",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanValue(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function normalizeDisclosureDemoProps(
  props: Partial<DisclosureDemoProps> = {},
): DisclosureDemoProps {
  return {
    size: isOneOf(props.size, disclosureSizeOptions) ? props.size : disclosureDemoDefaults.size,
    density: isOneOf(props.density, disclosureDensityOptions)
      ? props.density
      : disclosureDemoDefaults.density,
    isQuiet: booleanValue(props.isQuiet),
    isDisabled: booleanValue(props.isDisabled),
    isExpanded:
      props.isExpanded == null ? disclosureDemoDefaults.isExpanded : booleanValue(props.isExpanded),
    withHeaderAction:
      props.withHeaderAction == null
        ? disclosureDemoDefaults.withHeaderAction
        : booleanValue(props.withHeaderAction),
    panelRole: isOneOf(props.panelRole, disclosurePanelRoleOptions)
      ? props.panelRole
      : disclosureDemoDefaults.panelRole,
    titleLevel: isOneOf(props.titleLevel, disclosureTitleLevelOptions)
      ? props.titleLevel
      : disclosureDemoDefaults.titleLevel,
  };
}

export function disclosureDemoPropsFromSearch(search: string): DisclosureDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const density = params.get("density");
  const panelRole = params.get("panelRole");
  const titleLevel = params.get("titleLevel");

  return normalizeDisclosureDemoProps({
    size: isOneOf(size, disclosureSizeOptions) ? size : disclosureDemoDefaults.size,
    density: isOneOf(density, disclosureDensityOptions) ? density : disclosureDemoDefaults.density,
    isQuiet: booleanValue(params.get("isQuiet")),
    isDisabled: booleanValue(params.get("isDisabled")),
    isExpanded:
      params.get("isExpanded") == null
        ? disclosureDemoDefaults.isExpanded
        : booleanValue(params.get("isExpanded")),
    withHeaderAction:
      params.get("withHeaderAction") == null
        ? disclosureDemoDefaults.withHeaderAction
        : booleanValue(params.get("withHeaderAction")),
    panelRole: isOneOf(panelRole, disclosurePanelRoleOptions)
      ? panelRole
      : disclosureDemoDefaults.panelRole,
    titleLevel: isOneOf(titleLevel, disclosureTitleLevelOptions)
      ? titleLevel
      : disclosureDemoDefaults.titleLevel,
  });
}

export function disclosureDemoLocaleFromSearch(search: string): DisclosureDemoLocale | undefined {
  const locale = new URLSearchParams(search).get("locale");
  return isOneOf(locale, disclosureDemoLocaleOptions) ? locale : undefined;
}

export function disclosureDemoPropsFromWindow(): DisclosureDemoProps {
  if (typeof window === "undefined") {
    return disclosureDemoDefaults;
  }

  return disclosureDemoPropsFromSearch(window.location.search);
}

export function disclosureDemoLocaleFromWindow(): DisclosureDemoLocale | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return disclosureDemoLocaleFromSearch(window.location.search);
}

export function serializeDisclosureDemoProps(props: DisclosureDemoProps): string {
  return JSON.stringify(normalizeDisclosureDemoProps(props));
}
