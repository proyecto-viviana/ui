import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const tabsDemoKeyOptions = ["overview", "parity", "testing"] as const;
export const tabsDemoDisabledKeyOptions = ["none", ...tabsDemoKeyOptions] as const;
export const tabsDemoSelectionSourceOptions = ["selectedKey", "defaultSelectedKey"] as const;
export const tabsDemoOrientationOptions = ["horizontal", "vertical"] as const;
export const tabsDemoDensityOptions = ["regular", "compact"] as const;
export const tabsDemoLabelBehaviorOptions = ["show", "hide"] as const;
export const tabsDemoKeyboardActivationOptions = ["automatic", "manual"] as const;
export const tabsDemoCompositionOptions = ["dynamic", "static"] as const;

export type TabsDemoKey = (typeof tabsDemoKeyOptions)[number];
export type TabsDemoDisabledKey = (typeof tabsDemoDisabledKeyOptions)[number];
export type TabsDemoSelectionSource = (typeof tabsDemoSelectionSourceOptions)[number];
export type TabsDemoOrientation = (typeof tabsDemoOrientationOptions)[number];
export type TabsDemoDensity = (typeof tabsDemoDensityOptions)[number];
export type TabsDemoLabelBehavior = (typeof tabsDemoLabelBehaviorOptions)[number];
export type TabsDemoKeyboardActivation = (typeof tabsDemoKeyboardActivationOptions)[number];
export type TabsDemoComposition = (typeof tabsDemoCompositionOptions)[number];

export interface TabsDemoProps {
  ariaLabel: string;
  selectionSource: TabsDemoSelectionSource;
  selectedKey: TabsDemoKey;
  defaultSelectedKey: TabsDemoKey;
  disabledKey: TabsDemoDisabledKey;
  orientation: TabsDemoOrientation;
  density: TabsDemoDensity;
  labelBehavior: TabsDemoLabelBehavior;
  keyboardActivation: TabsDemoKeyboardActivation;
  composition: TabsDemoComposition;
  withIcons: boolean;
  isDisabled: boolean;
  shouldForceMount: boolean;
}

type TabsDemoInputProps = Partial<Record<keyof TabsDemoProps, unknown>>;

export const tabsDemoDefaults: TabsDemoProps = {
  ariaLabel: "Project tabs",
  selectionSource: "selectedKey",
  selectedKey: "overview",
  defaultSelectedKey: "parity",
  disabledKey: "none",
  orientation: "horizontal",
  density: "regular",
  labelBehavior: "show",
  keyboardActivation: "automatic",
  composition: "dynamic",
  withIcons: false,
  isDisabled: false,
  shouldForceMount: false,
};

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && options.includes(value);
}

function booleanParam(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function normalizeTabsDemoProps(props: TabsDemoInputProps = {}): TabsDemoProps {
  return {
    ariaLabel:
      typeof props.ariaLabel === "string" && props.ariaLabel.trim()
        ? props.ariaLabel
        : tabsDemoDefaults.ariaLabel,
    selectionSource: isOneOf(props.selectionSource, tabsDemoSelectionSourceOptions)
      ? props.selectionSource
      : tabsDemoDefaults.selectionSource,
    selectedKey: isOneOf(props.selectedKey, tabsDemoKeyOptions)
      ? props.selectedKey
      : tabsDemoDefaults.selectedKey,
    defaultSelectedKey: isOneOf(props.defaultSelectedKey, tabsDemoKeyOptions)
      ? props.defaultSelectedKey
      : tabsDemoDefaults.defaultSelectedKey,
    disabledKey: isOneOf(props.disabledKey, tabsDemoDisabledKeyOptions)
      ? props.disabledKey
      : tabsDemoDefaults.disabledKey,
    orientation: isOneOf(props.orientation, tabsDemoOrientationOptions)
      ? props.orientation
      : tabsDemoDefaults.orientation,
    density: isOneOf(props.density, tabsDemoDensityOptions)
      ? props.density
      : tabsDemoDefaults.density,
    labelBehavior: isOneOf(props.labelBehavior, tabsDemoLabelBehaviorOptions)
      ? props.labelBehavior
      : tabsDemoDefaults.labelBehavior,
    keyboardActivation: isOneOf(props.keyboardActivation, tabsDemoKeyboardActivationOptions)
      ? props.keyboardActivation
      : tabsDemoDefaults.keyboardActivation,
    composition: isOneOf(props.composition, tabsDemoCompositionOptions)
      ? props.composition
      : tabsDemoDefaults.composition,
    withIcons: props.withIcons === true,
    isDisabled: props.isDisabled === true,
    shouldForceMount: props.shouldForceMount === true,
  };
}

export function tabsDemoPropsFromSearch(search: string): TabsDemoProps {
  const params = new URLSearchParams(search);
  return normalizeTabsDemoProps({
    ariaLabel: params.get("ariaLabel") ?? tabsDemoDefaults.ariaLabel,
    selectionSource: params.get("selectionSource") ?? tabsDemoDefaults.selectionSource,
    selectedKey: params.get("selectedKey") ?? tabsDemoDefaults.selectedKey,
    defaultSelectedKey: params.get("defaultSelectedKey") ?? tabsDemoDefaults.defaultSelectedKey,
    disabledKey: params.get("disabledKey") ?? tabsDemoDefaults.disabledKey,
    orientation: params.get("orientation") ?? tabsDemoDefaults.orientation,
    density: params.get("density") ?? tabsDemoDefaults.density,
    labelBehavior: params.get("labelBehavior") ?? tabsDemoDefaults.labelBehavior,
    keyboardActivation: params.get("keyboardActivation") ?? tabsDemoDefaults.keyboardActivation,
    composition: params.get("composition") ?? tabsDemoDefaults.composition,
    withIcons: params.has("withIcons")
      ? booleanParam(params.get("withIcons"))
      : tabsDemoDefaults.withIcons,
    isDisabled: params.has("isDisabled")
      ? booleanParam(params.get("isDisabled"))
      : tabsDemoDefaults.isDisabled,
    shouldForceMount: params.has("shouldForceMount")
      ? booleanParam(params.get("shouldForceMount"))
      : tabsDemoDefaults.shouldForceMount,
  });
}

export function tabsDemoPropsFromWindow(): TabsDemoProps {
  if (typeof window === "undefined") {
    return tabsDemoDefaults;
  }

  return tabsDemoPropsFromSearch(window.location.search);
}

export function initialTabsDemoSelectedKey(props: TabsDemoProps): TabsDemoKey {
  return props.selectionSource === "defaultSelectedKey"
    ? props.defaultSelectedKey
    : props.selectedKey;
}

export function tabsDemoDisabledKeys(props: TabsDemoProps): TabsDemoKey[] | undefined {
  return props.disabledKey === "none" ? undefined : [props.disabledKey];
}

export function serializeTabsDemoProps(props: TabsDemoProps): string {
  return JSON.stringify(normalizeTabsDemoProps(props));
}
