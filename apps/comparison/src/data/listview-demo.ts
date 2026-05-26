import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const listViewSelectionModeOptions = ["none", "single", "multiple"] as const;
export const listViewSelectionStyleOptions = ["checkbox", "highlight"] as const;
export const listViewOverflowModeOptions = ["truncate", "wrap"] as const;
export const listViewSelectionSourceOptions = ["selectedKeys", "defaultSelectedKeys"] as const;
export const listViewTrailingIconOptions = ["none", "linkOut", "child"] as const;
export const listViewItemCountOptions = ["3", "2", "0"] as const;
export const listViewItemActionSlotOptions = ["none", "buttonGroup", "actionMenu"] as const;

export type ListViewSelectionMode = (typeof listViewSelectionModeOptions)[number];
export type ListViewSelectionStyle = (typeof listViewSelectionStyleOptions)[number];
export type ListViewOverflowMode = (typeof listViewOverflowModeOptions)[number];
export type ListViewSelectionSource = (typeof listViewSelectionSourceOptions)[number];
export type ListViewTrailingIcon = (typeof listViewTrailingIconOptions)[number];
export type ListViewItemCount = (typeof listViewItemCountOptions)[number];
export type ListViewItemActionSlot = (typeof listViewItemActionSlotOptions)[number];

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
  itemCount: ListViewItemCount;
  selectedKeys: string;
  defaultSelectedKeys: string;
  disabledKeys: string;
  disabledItem: ListViewDisabledItem;
  isQuiet: boolean;
  showDescriptions: boolean;
  showIcons: boolean;
  showActionBar: boolean;
  itemActionSlot: ListViewItemActionSlot;
  hideLinkOutIcon: boolean;
  trailingIcon: ListViewTrailingIcon;
}

export const listViewDemoDefaults: ListViewDemoProps = {
  selectionMode: "multiple",
  selectionStyle: "checkbox",
  overflowMode: "truncate",
  selectionSource: "defaultSelectedKeys",
  itemCount: "3",
  selectedKeys: "project-brief",
  defaultSelectedKeys: "project-brief",
  disabledKeys: "",
  disabledItem: "none",
  isQuiet: false,
  showDescriptions: true,
  showIcons: false,
  showActionBar: false,
  itemActionSlot: "none",
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
  allowedKeys: readonly string[] = listViewKeyOptions,
) {
  if (selectionMode === "none") {
    return new Set<string>();
  }

  const allowedKeySet = new Set(allowedKeys);
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter(
      (key): key is ListViewKey => isOneOf(key, listViewKeyOptions) && allowedKeySet.has(key),
    );
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function serializeListViewKeys(keys: Set<string | number>) {
  return Array.from(keys, String).join(",");
}

export function initialListViewSelectedKeys(props: ListViewDemoProps) {
  const itemKeys = listViewDemoItems(props).map((item) => item.id);
  return listViewKeysFromValue(
    props.selectionSource === "defaultSelectedKeys"
      ? props.defaultSelectedKeys
      : props.selectedKeys,
    itemKeys.includes(listViewDemoDefaults.selectedKeys) ? [listViewDemoDefaults.selectedKeys] : [],
    props.selectionMode,
    itemKeys,
  );
}

export function listViewDemoItems(props: Pick<ListViewDemoProps, "itemCount">) {
  return listViewItems.slice(0, Number(props.itemCount));
}

export function normalizeListViewDemoProps(
  props: Partial<ListViewDemoProps> = {},
): ListViewDemoProps {
  const selectionMode = isOneOf(props.selectionMode, listViewSelectionModeOptions)
    ? props.selectionMode
    : listViewDemoDefaults.selectionMode;
  const itemCount = isOneOf(props.itemCount, listViewItemCountOptions)
    ? props.itemCount
    : listViewDemoDefaults.itemCount;
  const itemKeys = listViewDemoItems({ itemCount }).map((item) => item.id);
  const defaultKeyFallback = itemKeys.includes(listViewDemoDefaults.selectedKeys)
    ? [listViewDemoDefaults.selectedKeys]
    : [];
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
    itemCount,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? serializeListViewKeys(
            listViewKeysFromValue(props.selectedKeys, [], selectionMode, itemKeys),
          )
        : selectionMode === "none"
          ? ""
          : serializeListViewKeys(
              listViewKeysFromValue(
                listViewDemoDefaults.selectedKeys,
                defaultKeyFallback,
                selectionMode,
                itemKeys,
              ),
            ),
    defaultSelectedKeys:
      typeof props.defaultSelectedKeys === "string" && props.defaultSelectedKeys.trim()
        ? serializeListViewKeys(
            listViewKeysFromValue(props.defaultSelectedKeys, [], selectionMode, itemKeys),
          )
        : selectionMode === "none"
          ? ""
          : serializeListViewKeys(
              listViewKeysFromValue(
                listViewDemoDefaults.defaultSelectedKeys,
                defaultKeyFallback,
                selectionMode,
                itemKeys,
              ),
            ),
    disabledKeys:
      typeof props.disabledKeys === "string" && props.disabledKeys.trim()
        ? serializeListViewKeys(listViewKeysFromValue(props.disabledKeys, [], "multiple", itemKeys))
        : listViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(props.disabledItem, listViewDisabledItemOptions)
      ? itemKeys.includes(props.disabledItem)
        ? props.disabledItem
        : "none"
      : listViewDemoDefaults.disabledItem,
    isQuiet: props.isQuiet === true,
    showDescriptions: props.showDescriptions !== false,
    showIcons: props.showIcons === true,
    showActionBar: props.showActionBar === true,
    itemActionSlot: isOneOf(props.itemActionSlot, listViewItemActionSlotOptions)
      ? props.itemActionSlot
      : listViewDemoDefaults.itemActionSlot,
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
  const itemCount = params.get("itemCount");
  const itemActionSlot = params.get("itemActionSlot");

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
    itemCount: isOneOf(itemCount, listViewItemCountOptions)
      ? itemCount
      : listViewDemoDefaults.itemCount,
    selectedKeys: params.get("selectedKeys") ?? listViewDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      params.get("defaultSelectedKeys") ?? listViewDemoDefaults.defaultSelectedKeys,
    disabledKeys: params.get("disabledKeys") ?? listViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(disabledItem, listViewDisabledItemOptions)
      ? disabledItem
      : listViewDemoDefaults.disabledItem,
    isQuiet: booleanParam(params.get("isQuiet")),
    showDescriptions: booleanParam(params.get("showDescriptions"), true),
    showIcons: booleanParam(params.get("showIcons")),
    showActionBar: booleanParam(params.get("showActionBar")),
    itemActionSlot: isOneOf(itemActionSlot, listViewItemActionSlotOptions)
      ? itemActionSlot
      : listViewDemoDefaults.itemActionSlot,
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
    itemCount: props.itemCount,
    selectedKeys: props.selectedKeys,
    defaultSelectedKeys: props.defaultSelectedKeys,
    disabledKeys: props.disabledKeys,
    disabledItem: props.disabledItem,
    isQuiet: props.isQuiet,
    showDescriptions: props.showDescriptions,
    showIcons: props.showIcons,
    showActionBar: props.showActionBar,
    itemActionSlot: props.itemActionSlot,
    hideLinkOutIcon: props.hideLinkOutIcon,
    trailingIcon: props.trailingIcon,
  });
}
