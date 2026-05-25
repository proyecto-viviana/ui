import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const listViewSelectionModeOptions = ["none", "single", "multiple"] as const;
export const listViewSelectionStyleOptions = ["checkbox", "highlight"] as const;
export const listViewOverflowModeOptions = ["truncate", "wrap"] as const;
export const listViewSelectionSourceOptions = ["selectedKeys", "defaultSelectedKeys"] as const;
export const listViewTrailingIconOptions = ["none", "linkOut", "child"] as const;

export type ListViewSelectionMode = (typeof listViewSelectionModeOptions)[number];
export type ListViewSelectionStyle = (typeof listViewSelectionStyleOptions)[number];
export type ListViewOverflowMode = (typeof listViewOverflowModeOptions)[number];
export type ListViewSelectionSource = (typeof listViewSelectionSourceOptions)[number];
export type ListViewTrailingIcon = (typeof listViewTrailingIconOptions)[number];

export interface ListViewDemoItem {
  id: string;
  name: string;
  description: string;
}

export const listViewItems: readonly ListViewDemoItem[] = [
  { id: "project-brief", name: "Project brief.pdf", description: "PDF document" },
  { id: "quarterly-report", name: "Quarterly report.docx", description: "Document" },
  { id: "budget", name: "Budget.xlsx", description: "Spreadsheet" },
];

export const listViewKeyOptions = listViewItems.map((item) => item.id);
export const listViewDisabledItemOptions = ["none", ...listViewKeyOptions] as const;

export type ListViewKey = (typeof listViewKeyOptions)[number];
export type ListViewDisabledItem = (typeof listViewDisabledItemOptions)[number];

export interface ListViewDemoProps {
  selectionMode: ListViewSelectionMode;
  selectionStyle: ListViewSelectionStyle;
  overflowMode: ListViewOverflowMode;
  selectionSource: ListViewSelectionSource;
  selectedKeys: string;
  defaultSelectedKeys: string;
  disabledKeys: string;
  disabledItem: ListViewDisabledItem;
  isQuiet: boolean;
  showDescriptions: boolean;
  hideLinkOutIcon: boolean;
  trailingIcon: ListViewTrailingIcon;
}

export const listViewDemoDefaults: ListViewDemoProps = {
  selectionMode: "multiple",
  selectionStyle: "checkbox",
  overflowMode: "truncate",
  selectionSource: "defaultSelectedKeys",
  selectedKeys: "project-brief",
  defaultSelectedKeys: "project-brief",
  disabledKeys: "",
  disabledItem: "none",
  isQuiet: false,
  showDescriptions: true,
  hideLinkOutIcon: false,
  trailingIcon: "none",
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

export function listViewKeysFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: ListViewSelectionMode,
) {
  if (selectionMode === "none") {
    return new Set<string>();
  }

  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter((key): key is ListViewKey => isOneOf(key, listViewKeyOptions));
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function serializeListViewKeys(keys: Set<string | number>) {
  return Array.from(keys, String).join(",");
}

export function initialListViewSelectedKeys(props: ListViewDemoProps) {
  return listViewKeysFromValue(
    props.selectionSource === "defaultSelectedKeys"
      ? props.defaultSelectedKeys
      : props.selectedKeys,
    [listViewDemoDefaults.selectedKeys],
    props.selectionMode,
  );
}

export function normalizeListViewDemoProps(
  props: Partial<ListViewDemoProps> = {},
): ListViewDemoProps {
  const selectionMode = isOneOf(props.selectionMode, listViewSelectionModeOptions)
    ? props.selectionMode
    : listViewDemoDefaults.selectionMode;
  return {
    selectionMode,
    selectionStyle: isOneOf(props.selectionStyle, listViewSelectionStyleOptions)
      ? props.selectionStyle
      : listViewDemoDefaults.selectionStyle,
    overflowMode: isOneOf(props.overflowMode, listViewOverflowModeOptions)
      ? props.overflowMode
      : listViewDemoDefaults.overflowMode,
    selectionSource: isOneOf(props.selectionSource, listViewSelectionSourceOptions)
      ? props.selectionSource
      : listViewDemoDefaults.selectionSource,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? serializeListViewKeys(listViewKeysFromValue(props.selectedKeys, [], selectionMode))
        : selectionMode === "none"
          ? ""
          : listViewDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      typeof props.defaultSelectedKeys === "string" && props.defaultSelectedKeys.trim()
        ? serializeListViewKeys(listViewKeysFromValue(props.defaultSelectedKeys, [], selectionMode))
        : selectionMode === "none"
          ? ""
          : listViewDemoDefaults.defaultSelectedKeys,
    disabledKeys:
      typeof props.disabledKeys === "string" && props.disabledKeys.trim()
        ? serializeListViewKeys(listViewKeysFromValue(props.disabledKeys, [], "multiple"))
        : listViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(props.disabledItem, listViewDisabledItemOptions)
      ? props.disabledItem
      : listViewDemoDefaults.disabledItem,
    isQuiet: props.isQuiet === true,
    showDescriptions: props.showDescriptions !== false,
    hideLinkOutIcon: props.hideLinkOutIcon === true,
    trailingIcon: isOneOf(props.trailingIcon, listViewTrailingIconOptions)
      ? props.trailingIcon
      : listViewDemoDefaults.trailingIcon,
  };
}

export function listViewDemoPropsFromSearch(search: string): ListViewDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const disabledItem = params.get("disabledItem");
  const trailingIcon = params.get("trailingIcon");

  return normalizeListViewDemoProps({
    selectionMode: isOneOf(selectionMode, listViewSelectionModeOptions)
      ? selectionMode
      : listViewDemoDefaults.selectionMode,
    selectionStyle: isOneOf(params.get("selectionStyle"), listViewSelectionStyleOptions)
      ? (params.get("selectionStyle") as ListViewSelectionStyle)
      : listViewDemoDefaults.selectionStyle,
    overflowMode: isOneOf(params.get("overflowMode"), listViewOverflowModeOptions)
      ? (params.get("overflowMode") as ListViewOverflowMode)
      : listViewDemoDefaults.overflowMode,
    selectionSource: isOneOf(params.get("selectionSource"), listViewSelectionSourceOptions)
      ? (params.get("selectionSource") as ListViewSelectionSource)
      : listViewDemoDefaults.selectionSource,
    selectedKeys: params.get("selectedKeys") ?? listViewDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      params.get("defaultSelectedKeys") ?? listViewDemoDefaults.defaultSelectedKeys,
    disabledKeys: params.get("disabledKeys") ?? listViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(disabledItem, listViewDisabledItemOptions)
      ? disabledItem
      : listViewDemoDefaults.disabledItem,
    isQuiet: booleanParam(params.get("isQuiet")),
    showDescriptions: booleanParam(params.get("showDescriptions"), true),
    hideLinkOutIcon: booleanParam(params.get("hideLinkOutIcon")),
    trailingIcon: isOneOf(trailingIcon, listViewTrailingIconOptions)
      ? trailingIcon
      : listViewDemoDefaults.trailingIcon,
  });
}

export function listViewDemoPropsFromWindow(): ListViewDemoProps {
  if (typeof window === "undefined") {
    return listViewDemoDefaults;
  }

  return listViewDemoPropsFromSearch(window.location.search);
}

export function serializeListViewDemoProps(props: ListViewDemoProps) {
  return JSON.stringify({
    selectionMode: props.selectionMode,
    selectionStyle: props.selectionStyle,
    overflowMode: props.overflowMode,
    selectionSource: props.selectionSource,
    selectedKeys: props.selectedKeys,
    defaultSelectedKeys: props.defaultSelectedKeys,
    disabledKeys: props.disabledKeys,
    disabledItem: props.disabledItem,
    isQuiet: props.isQuiet,
    showDescriptions: props.showDescriptions,
    hideLinkOutIcon: props.hideLinkOutIcon,
    trailingIcon: props.trailingIcon,
  });
}
