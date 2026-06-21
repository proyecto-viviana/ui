import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const treeViewSelectionModeOptions = ["none", "single", "multiple"] as const;
export const treeViewSelectionStyleOptions = ["checkbox", "highlight"] as const;
export const treeViewSelectionSourceOptions = ["selectedKeys", "defaultSelectedKeys"] as const;
export const treeViewExpandedSourceOptions = ["expandedKeys", "defaultExpandedKeys"] as const;
export const treeViewItemCountOptions = ["3", "2", "0"] as const;
export const treeViewItemActionSlotOptions = ["none", "buttonGroup", "actionMenu"] as const;
export const treeViewLoadingStateOptions = ["idle", "loadingMore"] as const;

export type TreeViewSelectionMode = (typeof treeViewSelectionModeOptions)[number];
export type TreeViewSelectionStyle = (typeof treeViewSelectionStyleOptions)[number];
export type TreeViewSelectionSource = (typeof treeViewSelectionSourceOptions)[number];
export type TreeViewExpandedSource = (typeof treeViewExpandedSourceOptions)[number];
export type TreeViewItemCount = (typeof treeViewItemCountOptions)[number];
export type TreeViewItemActionSlot = (typeof treeViewItemActionSlotOptions)[number];
export type TreeViewLoadingState = (typeof treeViewLoadingStateOptions)[number];

export interface TreeViewDemoItem {
  id: string;
  title: string;
  type: "directory" | "file";
  children?: TreeViewDemoItem[];
}

export const treeViewItems: readonly TreeViewDemoItem[] = [
  {
    id: "documents",
    title: "Documents",
    type: "directory",
    children: [
      {
        id: "project",
        title: "Project",
        type: "directory",
        children: [
          {
            id: "weekly-report",
            title: "Weekly Report",
            type: "file",
          },
          {
            id: "budget",
            title: "Budget",
            type: "file",
          },
        ],
      },
      {
        id: "client-notes",
        title: "Client Notes",
        type: "file",
      },
    ],
  },
  {
    id: "photos",
    title: "Photos",
    type: "directory",
    children: [
      {
        id: "image-1",
        title: "Image 1",
        type: "file",
      },
    ],
  },
  {
    id: "archive",
    title: "Archive",
    type: "directory",
    children: [
      {
        id: "invoice",
        title: "Invoice",
        type: "file",
      },
    ],
  },
];

export const treeViewKeyOptions = flattenTreeViewItems(treeViewItems).map((item) => item.id);
export const treeViewDisabledItemOptions = ["none", ...treeViewKeyOptions] as const;
export const treeViewLinkItemOptions = ["none", ...treeViewKeyOptions] as const;

export type TreeViewKey = (typeof treeViewKeyOptions)[number];
export type TreeViewDisabledItem = (typeof treeViewDisabledItemOptions)[number];
export type TreeViewLinkItem = (typeof treeViewLinkItemOptions)[number];

export interface TreeViewDemoProps {
  selectionMode: TreeViewSelectionMode;
  selectionStyle: TreeViewSelectionStyle;
  selectionSource: TreeViewSelectionSource;
  expandedSource: TreeViewExpandedSource;
  itemCount: TreeViewItemCount;
  selectedKeys: string;
  defaultSelectedKeys: string;
  expandedKeys: string;
  defaultExpandedKeys: string;
  disabledKeys: string;
  disabledItem: TreeViewDisabledItem;
  showIcons: boolean;
  showActionBar: boolean;
  itemActionSlot: TreeViewItemActionSlot;
  linkItem: TreeViewLinkItem;
  showLoadMore: boolean;
  loadingState: TreeViewLoadingState;
}

export const treeViewDemoDefaults: TreeViewDemoProps = {
  selectionMode: "multiple",
  selectionStyle: "checkbox",
  selectionSource: "defaultSelectedKeys",
  expandedSource: "defaultExpandedKeys",
  itemCount: "3",
  selectedKeys: "weekly-report",
  defaultSelectedKeys: "weekly-report",
  expandedKeys: "documents,project",
  defaultExpandedKeys: "documents,project",
  disabledKeys: "",
  disabledItem: "none",
  showIcons: false,
  showActionBar: false,
  itemActionSlot: "none",
  linkItem: "none",
  showLoadMore: false,
  loadingState: "idle",
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

function flattenTreeViewItems(items: readonly TreeViewDemoItem[]): TreeViewDemoItem[] {
  const flattened: TreeViewDemoItem[] = [];

  for (const item of items) {
    flattened.push(item);
    if (item.children?.length) {
      flattened.push(...flattenTreeViewItems(item.children));
    }
  }

  return flattened;
}

export function treeViewDemoItems(props: Pick<TreeViewDemoProps, "itemCount">) {
  return treeViewItems.slice(0, Number(props.itemCount));
}

export function treeViewVisibleKeys(props: Pick<TreeViewDemoProps, "itemCount">) {
  return flattenTreeViewItems(treeViewDemoItems(props)).map((item) => item.id);
}

export function treeViewKeysFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: TreeViewSelectionMode,
  allowedKeys: readonly string[] = treeViewKeyOptions,
) {
  if (selectionMode === "none") {
    return new Set<string>();
  }

  const allowedKeySet = new Set(allowedKeys);
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter(
      (key): key is TreeViewKey => isOneOf(key, treeViewKeyOptions) && allowedKeySet.has(key),
    );
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function treeViewExpandedKeysFromValue(
  value: string | undefined,
  fallback: string[],
  allowedKeys: readonly string[] = treeViewKeyOptions,
) {
  const allowedKeySet = new Set(allowedKeys);
  return new Set(
    String(value || fallback.join(","))
      .split(",")
      .map((key) => key.trim())
      .filter(
        (key): key is TreeViewKey => isOneOf(key, treeViewKeyOptions) && allowedKeySet.has(key),
      ),
  );
}

export function serializeTreeViewKeys(keys: Set<string | number>) {
  return Array.from(keys, String).join(",");
}

export function initialTreeViewSelectedKeys(props: TreeViewDemoProps) {
  const itemKeys = treeViewVisibleKeys(props);
  const fallback = itemKeys.includes(treeViewDemoDefaults.selectedKeys)
    ? [treeViewDemoDefaults.selectedKeys]
    : [];
  return treeViewKeysFromValue(
    props.selectionSource === "defaultSelectedKeys"
      ? props.defaultSelectedKeys
      : props.selectedKeys,
    fallback,
    props.selectionMode,
    itemKeys,
  );
}

export function initialTreeViewExpandedKeys(props: TreeViewDemoProps) {
  const itemKeys = treeViewVisibleKeys(props);
  const fallback = treeViewDemoDefaults.expandedKeys
    .split(",")
    .filter((key) => itemKeys.includes(key));
  return treeViewExpandedKeysFromValue(
    props.expandedSource === "defaultExpandedKeys" ? props.defaultExpandedKeys : props.expandedKeys,
    fallback,
    itemKeys,
  );
}

export function normalizeTreeViewDemoProps(
  props: Partial<TreeViewDemoProps> = {},
): TreeViewDemoProps {
  const selectionMode = isOneOf(props.selectionMode, treeViewSelectionModeOptions)
    ? props.selectionMode
    : treeViewDemoDefaults.selectionMode;
  const itemCount = isOneOf(props.itemCount, treeViewItemCountOptions)
    ? props.itemCount
    : treeViewDemoDefaults.itemCount;
  const itemKeys = treeViewVisibleKeys({ itemCount });
  const selectedFallback = itemKeys.includes(treeViewDemoDefaults.selectedKeys)
    ? [treeViewDemoDefaults.selectedKeys]
    : [];
  const expandedFallback = treeViewDemoDefaults.expandedKeys
    .split(",")
    .filter((key) => itemKeys.includes(key));

  return {
    selectionMode,
    selectionStyle: isOneOf(props.selectionStyle, treeViewSelectionStyleOptions)
      ? props.selectionStyle
      : treeViewDemoDefaults.selectionStyle,
    selectionSource: isOneOf(props.selectionSource, treeViewSelectionSourceOptions)
      ? props.selectionSource
      : treeViewDemoDefaults.selectionSource,
    expandedSource: isOneOf(props.expandedSource, treeViewExpandedSourceOptions)
      ? props.expandedSource
      : treeViewDemoDefaults.expandedSource,
    itemCount,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? serializeTreeViewKeys(
            treeViewKeysFromValue(props.selectedKeys, [], selectionMode, itemKeys),
          )
        : selectionMode === "none"
          ? ""
          : serializeTreeViewKeys(
              treeViewKeysFromValue(
                treeViewDemoDefaults.selectedKeys,
                selectedFallback,
                selectionMode,
                itemKeys,
              ),
            ),
    defaultSelectedKeys:
      typeof props.defaultSelectedKeys === "string" && props.defaultSelectedKeys.trim()
        ? serializeTreeViewKeys(
            treeViewKeysFromValue(props.defaultSelectedKeys, [], selectionMode, itemKeys),
          )
        : selectionMode === "none"
          ? ""
          : serializeTreeViewKeys(
              treeViewKeysFromValue(
                treeViewDemoDefaults.defaultSelectedKeys,
                selectedFallback,
                selectionMode,
                itemKeys,
              ),
            ),
    expandedKeys:
      typeof props.expandedKeys === "string" && props.expandedKeys.trim()
        ? serializeTreeViewKeys(treeViewExpandedKeysFromValue(props.expandedKeys, [], itemKeys))
        : serializeTreeViewKeys(
            treeViewExpandedKeysFromValue(
              treeViewDemoDefaults.expandedKeys,
              expandedFallback,
              itemKeys,
            ),
          ),
    defaultExpandedKeys:
      typeof props.defaultExpandedKeys === "string" && props.defaultExpandedKeys.trim()
        ? serializeTreeViewKeys(
            treeViewExpandedKeysFromValue(props.defaultExpandedKeys, [], itemKeys),
          )
        : serializeTreeViewKeys(
            treeViewExpandedKeysFromValue(
              treeViewDemoDefaults.defaultExpandedKeys,
              expandedFallback,
              itemKeys,
            ),
          ),
    disabledKeys:
      typeof props.disabledKeys === "string" && props.disabledKeys.trim()
        ? serializeTreeViewKeys(treeViewKeysFromValue(props.disabledKeys, [], "multiple", itemKeys))
        : treeViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(props.disabledItem, treeViewDisabledItemOptions)
      ? itemKeys.includes(props.disabledItem)
        ? props.disabledItem
        : "none"
      : treeViewDemoDefaults.disabledItem,
    showIcons: props.showIcons === true,
    showActionBar: props.showActionBar === true,
    itemActionSlot: isOneOf(props.itemActionSlot, treeViewItemActionSlotOptions)
      ? props.itemActionSlot
      : treeViewDemoDefaults.itemActionSlot,
    linkItem: isOneOf(props.linkItem, treeViewLinkItemOptions)
      ? itemKeys.includes(props.linkItem)
        ? props.linkItem
        : "none"
      : treeViewDemoDefaults.linkItem,
    showLoadMore: props.showLoadMore === true,
    loadingState: isOneOf(props.loadingState, treeViewLoadingStateOptions)
      ? props.loadingState
      : treeViewDemoDefaults.loadingState,
  };
}

export function treeViewDemoPropsFromSearch(search: string): TreeViewDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const itemCount = params.get("itemCount");
  const disabledItem = params.get("disabledItem");
  const itemActionSlot = params.get("itemActionSlot");
  const linkItem = params.get("linkItem");
  const loadingState = params.get("loadingState");

  return normalizeTreeViewDemoProps({
    selectionMode: isOneOf(selectionMode, treeViewSelectionModeOptions)
      ? selectionMode
      : treeViewDemoDefaults.selectionMode,
    selectionStyle: isOneOf(params.get("selectionStyle"), treeViewSelectionStyleOptions)
      ? (params.get("selectionStyle") as TreeViewSelectionStyle)
      : treeViewDemoDefaults.selectionStyle,
    selectionSource: isOneOf(params.get("selectionSource"), treeViewSelectionSourceOptions)
      ? (params.get("selectionSource") as TreeViewSelectionSource)
      : treeViewDemoDefaults.selectionSource,
    expandedSource: isOneOf(params.get("expandedSource"), treeViewExpandedSourceOptions)
      ? (params.get("expandedSource") as TreeViewExpandedSource)
      : treeViewDemoDefaults.expandedSource,
    itemCount: isOneOf(itemCount, treeViewItemCountOptions)
      ? itemCount
      : treeViewDemoDefaults.itemCount,
    selectedKeys: params.get("selectedKeys") ?? treeViewDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      params.get("defaultSelectedKeys") ?? treeViewDemoDefaults.defaultSelectedKeys,
    expandedKeys: params.get("expandedKeys") ?? treeViewDemoDefaults.expandedKeys,
    defaultExpandedKeys:
      params.get("defaultExpandedKeys") ?? treeViewDemoDefaults.defaultExpandedKeys,
    disabledKeys: params.get("disabledKeys") ?? treeViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(disabledItem, treeViewDisabledItemOptions)
      ? disabledItem
      : treeViewDemoDefaults.disabledItem,
    showIcons: booleanParam(params.get("showIcons")),
    showActionBar: booleanParam(params.get("showActionBar")),
    itemActionSlot: isOneOf(itemActionSlot, treeViewItemActionSlotOptions)
      ? itemActionSlot
      : treeViewDemoDefaults.itemActionSlot,
    linkItem: isOneOf(linkItem, treeViewLinkItemOptions) ? linkItem : treeViewDemoDefaults.linkItem,
    showLoadMore: booleanParam(params.get("showLoadMore")),
    loadingState: isOneOf(loadingState, treeViewLoadingStateOptions)
      ? loadingState
      : treeViewDemoDefaults.loadingState,
  });
}

export function treeViewDemoPropsFromWindow(): TreeViewDemoProps {
  if (typeof window === "undefined") {
    return treeViewDemoDefaults;
  }

  return treeViewDemoPropsFromSearch(window.location.search);
}

export function serializeTreeViewDemoProps(props: TreeViewDemoProps) {
  return JSON.stringify({
    selectionMode: props.selectionMode,
    selectionStyle: props.selectionStyle,
    selectionSource: props.selectionSource,
    expandedSource: props.expandedSource,
    itemCount: props.itemCount,
    selectedKeys: props.selectedKeys,
    defaultSelectedKeys: props.defaultSelectedKeys,
    expandedKeys: props.expandedKeys,
    defaultExpandedKeys: props.defaultExpandedKeys,
    disabledKeys: props.disabledKeys,
    disabledItem: props.disabledItem,
    showIcons: props.showIcons,
    showActionBar: props.showActionBar,
    itemActionSlot: props.itemActionSlot,
    linkItem: props.linkItem,
    showLoadMore: props.showLoadMore,
    loadingState: props.loadingState,
  });
}
