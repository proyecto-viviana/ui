import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const tagGroupSizeOptions = ["S", "M", "L"] as const;
export const tagGroupSelectionModeOptions = ["none", "single", "multiple"] as const;
export const tagGroupSelectionBehaviorOptions = ["toggle", "replace"] as const;
export const tagGroupSelectionSourceOptions = ["defaultSelectedKeys", "selectedKeys"] as const;
export const tagGroupLabelPositionOptions = ["top", "side"] as const;
export const tagGroupLabelAlignOptions = ["start", "end"] as const;
export const tagGroupItemCountOptions = ["0", "2", "4"] as const;
export const tagGroupContentModeOptions = ["text", "icon"] as const;

export type TagGroupSize = (typeof tagGroupSizeOptions)[number];
export type TagGroupSelectionMode = (typeof tagGroupSelectionModeOptions)[number];
export type TagGroupSelectionBehavior = (typeof tagGroupSelectionBehaviorOptions)[number];
export type TagGroupSelectionSource = (typeof tagGroupSelectionSourceOptions)[number];
export type TagGroupLabelPosition = (typeof tagGroupLabelPositionOptions)[number];
export type TagGroupLabelAlign = (typeof tagGroupLabelAlignOptions)[number];
export type TagGroupItemCount = (typeof tagGroupItemCountOptions)[number];
export type TagGroupContentMode = (typeof tagGroupContentModeOptions)[number];

export interface TagGroupDemoItem {
  id: string;
  name: string;
}

export const tagGroupItems: readonly TagGroupDemoItem[] = [
  { id: "landscape", name: "Landscape" },
  { id: "portrait", name: "Portrait" },
  { id: "travel", name: "Travel" },
  { id: "night", name: "Night" },
];

export const tagGroupKeyOptions = tagGroupItems.map((item) => item.id);
export const tagGroupDisabledItemOptions = ["none", ...tagGroupKeyOptions] as const;
export type TagGroupDisabledItem = (typeof tagGroupDisabledItemOptions)[number];

export interface TagGroupDemoProps {
  label: string;
  size: TagGroupSize;
  labelPosition: TagGroupLabelPosition;
  labelAlign: TagGroupLabelAlign;
  selectionMode: TagGroupSelectionMode;
  selectionBehavior: TagGroupSelectionBehavior;
  selectionSource: TagGroupSelectionSource;
  selectedKeys: string;
  defaultSelectedKeys: string;
  disabledKeys: string;
  disabledItem: TagGroupDisabledItem;
  itemCount: TagGroupItemCount;
  contentMode: TagGroupContentMode;
  isEmphasized: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  showDescription: boolean;
  showErrorMessage: boolean;
  allowsRemoving: boolean;
  withGroupAction: boolean;
}

export const tagGroupDemoDefaults: TagGroupDemoProps = {
  label: "Photo categories",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  selectionMode: "multiple",
  selectionBehavior: "toggle",
  selectionSource: "defaultSelectedKeys",
  selectedKeys: "landscape",
  defaultSelectedKeys: "landscape",
  disabledKeys: "",
  disabledItem: "none",
  itemCount: "4",
  contentMode: "text",
  isEmphasized: false,
  isInvalid: false,
  isDisabled: false,
  showDescription: false,
  showErrorMessage: false,
  allowsRemoving: true,
  withGroupAction: false,
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

export function tagGroupKeysFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: TagGroupSelectionMode,
) {
  if (selectionMode === "none") {
    return new Set<string>();
  }

  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter((key): key is (typeof tagGroupKeyOptions)[number] => isOneOf(key, tagGroupKeyOptions));

  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function serializeTagGroupKeys(keys: Set<string | number>) {
  return Array.from(keys, String).join(",");
}

export function tagGroupInitialItems(props: TagGroupDemoProps) {
  return tagGroupItems.slice(0, Number(props.itemCount));
}

export function initialTagGroupSelectedKeys(props: TagGroupDemoProps) {
  return tagGroupKeysFromValue(
    props.selectionSource === "defaultSelectedKeys"
      ? props.defaultSelectedKeys
      : props.selectedKeys,
    [tagGroupDemoDefaults.selectedKeys],
    props.selectionMode,
  );
}

export function disabledTagGroupKeys(props: TagGroupDemoProps) {
  const keys = tagGroupKeysFromValue(props.disabledKeys, [], "multiple");
  if (props.disabledItem !== "none") {
    keys.add(props.disabledItem);
  }
  return keys;
}

export function normalizeTagGroupDemoProps(
  props: Partial<TagGroupDemoProps> = {},
): TagGroupDemoProps {
  const selectionMode = isOneOf(props.selectionMode, tagGroupSelectionModeOptions)
    ? props.selectionMode
    : tagGroupDemoDefaults.selectionMode;

  return {
    label:
      typeof props.label === "string" && props.label ? props.label : tagGroupDemoDefaults.label,
    size: isOneOf(props.size, tagGroupSizeOptions) ? props.size : tagGroupDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, tagGroupLabelPositionOptions)
      ? props.labelPosition
      : tagGroupDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, tagGroupLabelAlignOptions)
      ? props.labelAlign
      : tagGroupDemoDefaults.labelAlign,
    selectionMode,
    selectionBehavior: isOneOf(props.selectionBehavior, tagGroupSelectionBehaviorOptions)
      ? props.selectionBehavior
      : tagGroupDemoDefaults.selectionBehavior,
    selectionSource: isOneOf(props.selectionSource, tagGroupSelectionSourceOptions)
      ? props.selectionSource
      : tagGroupDemoDefaults.selectionSource,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? serializeTagGroupKeys(tagGroupKeysFromValue(props.selectedKeys, [], selectionMode))
        : selectionMode === "none"
          ? ""
          : tagGroupDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      typeof props.defaultSelectedKeys === "string" && props.defaultSelectedKeys.trim()
        ? serializeTagGroupKeys(tagGroupKeysFromValue(props.defaultSelectedKeys, [], selectionMode))
        : selectionMode === "none"
          ? ""
          : tagGroupDemoDefaults.defaultSelectedKeys,
    disabledKeys:
      typeof props.disabledKeys === "string" && props.disabledKeys.trim()
        ? serializeTagGroupKeys(tagGroupKeysFromValue(props.disabledKeys, [], "multiple"))
        : tagGroupDemoDefaults.disabledKeys,
    disabledItem: isOneOf(props.disabledItem, tagGroupDisabledItemOptions)
      ? props.disabledItem
      : tagGroupDemoDefaults.disabledItem,
    itemCount: isOneOf(props.itemCount, tagGroupItemCountOptions)
      ? props.itemCount
      : tagGroupDemoDefaults.itemCount,
    contentMode: isOneOf(props.contentMode, tagGroupContentModeOptions)
      ? props.contentMode
      : tagGroupDemoDefaults.contentMode,
    isEmphasized: props.isEmphasized === true,
    isInvalid: props.isInvalid === true,
    isDisabled: props.isDisabled === true,
    showDescription: props.showDescription === true,
    showErrorMessage: props.showErrorMessage === true,
    allowsRemoving: props.allowsRemoving !== false,
    withGroupAction: props.withGroupAction === true,
  };
}

export function tagGroupDemoPropsFromSearch(search: string): TagGroupDemoProps {
  const params = new URLSearchParams(search);

  return normalizeTagGroupDemoProps({
    label: params.get("label") ?? tagGroupDemoDefaults.label,
    size: isOneOf(params.get("size"), tagGroupSizeOptions)
      ? (params.get("size") as TagGroupSize)
      : tagGroupDemoDefaults.size,
    labelPosition: isOneOf(params.get("labelPosition"), tagGroupLabelPositionOptions)
      ? (params.get("labelPosition") as TagGroupLabelPosition)
      : tagGroupDemoDefaults.labelPosition,
    labelAlign: isOneOf(params.get("labelAlign"), tagGroupLabelAlignOptions)
      ? (params.get("labelAlign") as TagGroupLabelAlign)
      : tagGroupDemoDefaults.labelAlign,
    selectionMode: isOneOf(params.get("selectionMode"), tagGroupSelectionModeOptions)
      ? (params.get("selectionMode") as TagGroupSelectionMode)
      : tagGroupDemoDefaults.selectionMode,
    selectionBehavior: isOneOf(params.get("selectionBehavior"), tagGroupSelectionBehaviorOptions)
      ? (params.get("selectionBehavior") as TagGroupSelectionBehavior)
      : tagGroupDemoDefaults.selectionBehavior,
    selectionSource: isOneOf(params.get("selectionSource"), tagGroupSelectionSourceOptions)
      ? (params.get("selectionSource") as TagGroupSelectionSource)
      : tagGroupDemoDefaults.selectionSource,
    selectedKeys: params.get("selectedKeys") ?? tagGroupDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      params.get("defaultSelectedKeys") ?? tagGroupDemoDefaults.defaultSelectedKeys,
    disabledKeys: params.get("disabledKeys") ?? tagGroupDemoDefaults.disabledKeys,
    disabledItem: isOneOf(params.get("disabledItem"), tagGroupDisabledItemOptions)
      ? (params.get("disabledItem") as TagGroupDisabledItem)
      : tagGroupDemoDefaults.disabledItem,
    itemCount: isOneOf(params.get("itemCount"), tagGroupItemCountOptions)
      ? (params.get("itemCount") as TagGroupItemCount)
      : tagGroupDemoDefaults.itemCount,
    contentMode: isOneOf(params.get("contentMode"), tagGroupContentModeOptions)
      ? (params.get("contentMode") as TagGroupContentMode)
      : tagGroupDemoDefaults.contentMode,
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isInvalid: booleanParam(params.get("isInvalid")),
    isDisabled: booleanParam(params.get("isDisabled")),
    showDescription: booleanParam(params.get("showDescription")),
    showErrorMessage: booleanParam(params.get("showErrorMessage")),
    allowsRemoving: booleanParam(params.get("allowsRemoving"), true),
    withGroupAction: booleanParam(params.get("withGroupAction")),
  });
}

export function tagGroupDemoPropsFromWindow(): TagGroupDemoProps {
  if (typeof window === "undefined") {
    return tagGroupDemoDefaults;
  }

  return tagGroupDemoPropsFromSearch(window.location.search);
}

export function serializeTagGroupDemoProps(props: TagGroupDemoProps) {
  return JSON.stringify(normalizeTagGroupDemoProps(props));
}
