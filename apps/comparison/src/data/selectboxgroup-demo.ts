import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const selectBoxGroupOrientationOptions = ["horizontal", "vertical"] as const;
export const selectBoxGroupSelectionModeOptions = ["single", "multiple"] as const;
export const selectBoxGroupSelectionSourceOptions = [
  "selectedKeys",
  "defaultSelectedKeys",
] as const;
export const selectBoxGroupKeyOptions = ["starter", "pro"] as const;
export const selectBoxGroupDisabledItemOptions = ["none", ...selectBoxGroupKeyOptions] as const;

export type SelectBoxGroupOrientation = (typeof selectBoxGroupOrientationOptions)[number];
export type SelectBoxGroupSelectionMode = (typeof selectBoxGroupSelectionModeOptions)[number];
export type SelectBoxGroupSelectionSource = (typeof selectBoxGroupSelectionSourceOptions)[number];
export type SelectBoxGroupKey = (typeof selectBoxGroupKeyOptions)[number];
export type SelectBoxGroupDisabledItem = (typeof selectBoxGroupDisabledItemOptions)[number];

export interface SelectBoxGroupItemDemo {
  id: SelectBoxGroupKey;
  label: string;
  description: string;
}

export interface SelectBoxGroupDemoProps {
  orientation: SelectBoxGroupOrientation;
  selectionMode: SelectBoxGroupSelectionMode;
  selectionSource: SelectBoxGroupSelectionSource;
  selectedKeys: string;
  defaultSelectedKeys: string;
  disabledKeys: string;
  disabledItem: SelectBoxGroupDisabledItem;
  isDisabled: boolean;
  withIllustrations: boolean;
}

export const selectBoxGroupItems: readonly SelectBoxGroupItemDemo[] = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

export const selectBoxGroupIllustrationItemIds = new Set<SelectBoxGroupKey>(["starter", "pro"]);

export const selectBoxGroupDemoDefaults: SelectBoxGroupDemoProps = {
  orientation: "horizontal",
  selectionMode: "single",
  selectionSource: "selectedKeys",
  selectedKeys: "starter",
  defaultSelectedKeys: "starter",
  disabledKeys: "",
  disabledItem: "none",
  isDisabled: false,
  withIllustrations: true,
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

export function selectBoxGroupKeysFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: SelectBoxGroupSelectionMode,
) {
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter((key): key is SelectBoxGroupKey => isOneOf(key, selectBoxGroupKeyOptions));
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function serializeSelectBoxGroupKeys(keys: Set<string | number>) {
  return Array.from(keys, String).join(",");
}

export function initialSelectBoxGroupSelectedKeys(props: SelectBoxGroupDemoProps) {
  return selectBoxGroupKeysFromValue(
    props.selectionSource === "defaultSelectedKeys"
      ? props.defaultSelectedKeys
      : props.selectedKeys,
    [selectBoxGroupDemoDefaults.selectedKeys],
    props.selectionMode,
  );
}

export function normalizeSelectBoxGroupDemoProps(
  props: Partial<SelectBoxGroupDemoProps> = {},
): SelectBoxGroupDemoProps {
  const selectionMode = props.selectionMode === "multiple" ? "multiple" : "single";
  return {
    orientation: props.orientation === "vertical" ? "vertical" : "horizontal",
    selectionMode,
    selectionSource: isOneOf(props.selectionSource, selectBoxGroupSelectionSourceOptions)
      ? props.selectionSource
      : selectBoxGroupDemoDefaults.selectionSource,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? serializeSelectBoxGroupKeys(
            selectBoxGroupKeysFromValue(props.selectedKeys, [], selectionMode),
          )
        : selectBoxGroupDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      typeof props.defaultSelectedKeys === "string" && props.defaultSelectedKeys.trim()
        ? serializeSelectBoxGroupKeys(
            selectBoxGroupKeysFromValue(props.defaultSelectedKeys, [], selectionMode),
          )
        : selectBoxGroupDemoDefaults.defaultSelectedKeys,
    disabledKeys:
      typeof props.disabledKeys === "string" && props.disabledKeys.trim()
        ? serializeSelectBoxGroupKeys(
            selectBoxGroupKeysFromValue(props.disabledKeys, [], "multiple"),
          )
        : selectBoxGroupDemoDefaults.disabledKeys,
    disabledItem: isOneOf(props.disabledItem, selectBoxGroupDisabledItemOptions)
      ? props.disabledItem
      : selectBoxGroupDemoDefaults.disabledItem,
    isDisabled: props.isDisabled === true,
    withIllustrations: props.withIllustrations !== false,
  };
}

export function selectBoxGroupDemoPropsFromSearch(search: string): SelectBoxGroupDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const disabledItem = params.get("disabledItem");
  const legacyDisablePro = booleanParam(params.get("disablePro"));

  return normalizeSelectBoxGroupDemoProps({
    orientation: params.get("orientation") === "vertical" ? "vertical" : "horizontal",
    selectionMode: isOneOf(selectionMode, selectBoxGroupSelectionModeOptions)
      ? selectionMode
      : selectBoxGroupDemoDefaults.selectionMode,
    selectionSource: isOneOf(params.get("selectionSource"), selectBoxGroupSelectionSourceOptions)
      ? (params.get("selectionSource") as SelectBoxGroupSelectionSource)
      : selectBoxGroupDemoDefaults.selectionSource,
    selectedKeys: params.get("selectedKeys") ?? selectBoxGroupDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      params.get("defaultSelectedKeys") ?? selectBoxGroupDemoDefaults.defaultSelectedKeys,
    disabledKeys: params.get("disabledKeys") ?? selectBoxGroupDemoDefaults.disabledKeys,
    disabledItem: isOneOf(disabledItem, selectBoxGroupDisabledItemOptions)
      ? disabledItem
      : legacyDisablePro
        ? "pro"
        : selectBoxGroupDemoDefaults.disabledItem,
    isDisabled: booleanParam(params.get("isDisabled")),
    withIllustrations: booleanParam(params.get("withIllustrations"), true),
  });
}

export function selectBoxGroupDemoPropsFromWindow(): SelectBoxGroupDemoProps {
  if (typeof window === "undefined") {
    return selectBoxGroupDemoDefaults;
  }

  return selectBoxGroupDemoPropsFromSearch(window.location.search);
}

export function serializeSelectBoxGroupDemoProps(props: SelectBoxGroupDemoProps) {
  return JSON.stringify({
    orientation: props.orientation,
    selectionMode: props.selectionMode,
    selectionSource: props.selectionSource,
    selectedKeys: props.selectedKeys,
    defaultSelectedKeys: props.defaultSelectedKeys,
    disabledKeys: props.disabledKeys,
    disabledItem: props.disabledItem,
    isDisabled: props.isDisabled,
    withIllustrations: props.withIllustrations,
  });
}
