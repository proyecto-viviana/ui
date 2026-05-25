import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const cardViewLayoutOptions = ["grid", "waterfall"] as const;
export const cardViewSizeOptions = ["S", "M", "L", "XL", "XS"] as const;
export const cardViewDensityOptions = ["compact", "regular", "spacious"] as const;
export const cardViewVariantOptions = ["secondary", "primary", "tertiary", "quiet"] as const;
export const cardViewSelectionModeOptions = ["single", "multiple", "none"] as const;
export const cardViewSelectionStyleOptions = ["highlight", "checkbox"] as const;
export const cardViewSelectionSourceOptions = ["selectedKeys", "defaultSelectedKeys"] as const;

export type CardViewLayout = (typeof cardViewLayoutOptions)[number];
export type CardViewSize = (typeof cardViewSizeOptions)[number];
export type CardViewDensity = (typeof cardViewDensityOptions)[number];
export type CardViewVariant = (typeof cardViewVariantOptions)[number];
export type CardViewSelectionMode = (typeof cardViewSelectionModeOptions)[number];
export type CardViewSelectionStyle = (typeof cardViewSelectionStyleOptions)[number];
export type CardViewSelectionSource = (typeof cardViewSelectionSourceOptions)[number];

export interface CardViewDemoItem {
  id: string;
  title: string;
  status: string;
}

export const cardViewItems: readonly CardViewDemoItem[] = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

export const cardViewKeyOptions = cardViewItems.map((item) => item.id);
export const cardViewDisabledItemOptions = ["none", ...cardViewKeyOptions] as const;

export type CardViewKey = (typeof cardViewKeyOptions)[number];
export type CardViewDisabledItem = (typeof cardViewDisabledItemOptions)[number];

export interface CardViewDemoProps {
  ariaLabel: string;
  layout: CardViewLayout;
  size: CardViewSize;
  density: CardViewDensity;
  variant: CardViewVariant;
  selectionMode: CardViewSelectionMode;
  selectionStyle: CardViewSelectionStyle;
  selectionSource: CardViewSelectionSource;
  selectedKeys: string;
  defaultSelectedKeys: string;
  disabledKeys: string;
  disabledItem: CardViewDisabledItem;
  showDescriptions: boolean;
  showActionBar: boolean;
}

export const cardViewDemoDefaults: CardViewDemoProps = {
  ariaLabel: "Projects",
  layout: "grid",
  size: "S",
  density: "compact",
  variant: "secondary",
  selectionMode: "single",
  selectionStyle: "highlight",
  selectionSource: "selectedKeys",
  selectedKeys: "apollo",
  defaultSelectedKeys: "apollo",
  disabledKeys: "",
  disabledItem: "none",
  showDescriptions: true,
  showActionBar: false,
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

export function cardViewKeysFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: CardViewSelectionMode,
) {
  if (selectionMode === "none") {
    return new Set<string>();
  }

  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter((key): key is CardViewKey => isOneOf(key, cardViewKeyOptions));
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function serializeCardViewKeys(keys: Set<string | number>) {
  return Array.from(keys, String).join(",");
}

export function initialCardViewSelectedKeys(props: CardViewDemoProps) {
  return cardViewKeysFromValue(
    props.selectionSource === "defaultSelectedKeys"
      ? props.defaultSelectedKeys
      : props.selectedKeys,
    [cardViewDemoDefaults.selectedKeys],
    props.selectionMode,
  );
}

export function normalizeCardViewDemoProps(
  props: Partial<CardViewDemoProps> = {},
): CardViewDemoProps {
  const selectionMode = isOneOf(props.selectionMode, cardViewSelectionModeOptions)
    ? props.selectionMode
    : cardViewDemoDefaults.selectionMode;

  return {
    ariaLabel: textProp(props.ariaLabel, cardViewDemoDefaults.ariaLabel),
    layout: isOneOf(props.layout, cardViewLayoutOptions)
      ? props.layout
      : cardViewDemoDefaults.layout,
    size: isOneOf(props.size, cardViewSizeOptions) ? props.size : cardViewDemoDefaults.size,
    density: isOneOf(props.density, cardViewDensityOptions)
      ? props.density
      : cardViewDemoDefaults.density,
    variant: isOneOf(props.variant, cardViewVariantOptions)
      ? props.variant
      : cardViewDemoDefaults.variant,
    selectionMode,
    selectionStyle: isOneOf(props.selectionStyle, cardViewSelectionStyleOptions)
      ? props.selectionStyle
      : cardViewDemoDefaults.selectionStyle,
    selectionSource: isOneOf(props.selectionSource, cardViewSelectionSourceOptions)
      ? props.selectionSource
      : cardViewDemoDefaults.selectionSource,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? serializeCardViewKeys(cardViewKeysFromValue(props.selectedKeys, [], selectionMode))
        : selectionMode === "none"
          ? ""
          : cardViewDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      typeof props.defaultSelectedKeys === "string" && props.defaultSelectedKeys.trim()
        ? serializeCardViewKeys(cardViewKeysFromValue(props.defaultSelectedKeys, [], selectionMode))
        : selectionMode === "none"
          ? ""
          : cardViewDemoDefaults.defaultSelectedKeys,
    disabledKeys:
      typeof props.disabledKeys === "string" && props.disabledKeys.trim()
        ? serializeCardViewKeys(cardViewKeysFromValue(props.disabledKeys, [], "multiple"))
        : cardViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(props.disabledItem, cardViewDisabledItemOptions)
      ? props.disabledItem
      : cardViewDemoDefaults.disabledItem,
    showDescriptions: props.showDescriptions !== false,
    showActionBar: props.showActionBar === true,
  };
}

export function cardViewDemoPropsFromSearch(search: string): CardViewDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const disabledItem = params.get("disabledItem");

  return normalizeCardViewDemoProps({
    ariaLabel: params.get("ariaLabel") ?? cardViewDemoDefaults.ariaLabel,
    layout: isOneOf(params.get("layout"), cardViewLayoutOptions)
      ? (params.get("layout") as CardViewLayout)
      : cardViewDemoDefaults.layout,
    size: isOneOf(params.get("size"), cardViewSizeOptions)
      ? (params.get("size") as CardViewSize)
      : cardViewDemoDefaults.size,
    density: isOneOf(params.get("density"), cardViewDensityOptions)
      ? (params.get("density") as CardViewDensity)
      : cardViewDemoDefaults.density,
    variant: isOneOf(params.get("variant"), cardViewVariantOptions)
      ? (params.get("variant") as CardViewVariant)
      : cardViewDemoDefaults.variant,
    selectionMode: isOneOf(selectionMode, cardViewSelectionModeOptions)
      ? selectionMode
      : cardViewDemoDefaults.selectionMode,
    selectionStyle: isOneOf(params.get("selectionStyle"), cardViewSelectionStyleOptions)
      ? (params.get("selectionStyle") as CardViewSelectionStyle)
      : cardViewDemoDefaults.selectionStyle,
    selectionSource: isOneOf(params.get("selectionSource"), cardViewSelectionSourceOptions)
      ? (params.get("selectionSource") as CardViewSelectionSource)
      : cardViewDemoDefaults.selectionSource,
    selectedKeys: params.get("selectedKeys") ?? cardViewDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      params.get("defaultSelectedKeys") ?? cardViewDemoDefaults.defaultSelectedKeys,
    disabledKeys: params.get("disabledKeys") ?? cardViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(disabledItem, cardViewDisabledItemOptions)
      ? disabledItem
      : cardViewDemoDefaults.disabledItem,
    showDescriptions: booleanParam(params.get("showDescriptions"), true),
    showActionBar: booleanParam(params.get("showActionBar")),
  });
}

export function cardViewDemoPropsFromWindow(): CardViewDemoProps {
  if (typeof window === "undefined") {
    return cardViewDemoDefaults;
  }

  return cardViewDemoPropsFromSearch(window.location.search);
}

export function serializeCardViewDemoProps(props: CardViewDemoProps): string {
  return JSON.stringify(normalizeCardViewDemoProps(props));
}
