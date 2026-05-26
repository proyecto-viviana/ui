import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const tableViewDensityOptions = ["compact", "regular", "spacious"] as const;
export const tableViewOverflowModeOptions = ["truncate", "wrap"] as const;
export const tableViewSelectionModeOptions = ["none", "single", "multiple"] as const;
export const tableViewSelectionSourceOptions = ["selectedKeys", "defaultSelectedKeys"] as const;
export const tableViewItemCountOptions = ["3", "2", "0"] as const;
export const tableViewColumnSetOptions = ["all", "withoutOwner", "nameStatus"] as const;
export const tableViewSortColumnOptions = ["none", "name", "type", "owner", "status"] as const;
export const tableViewSortDirectionOptions = ["ascending", "descending"] as const;

export type TableViewDensity = (typeof tableViewDensityOptions)[number];
export type TableViewOverflowMode = (typeof tableViewOverflowModeOptions)[number];
export type TableViewSelectionMode = (typeof tableViewSelectionModeOptions)[number];
export type TableViewSelectionSource = (typeof tableViewSelectionSourceOptions)[number];
export type TableViewItemCount = (typeof tableViewItemCountOptions)[number];
export type TableViewColumnSet = (typeof tableViewColumnSetOptions)[number];
export type TableViewSortColumn = (typeof tableViewSortColumnOptions)[number];
export type TableViewSortDirection = (typeof tableViewSortDirectionOptions)[number];

export interface TableViewDemoColumn {
  id: "name" | "type" | "owner" | "status";
  name: string;
  isRowHeader?: boolean;
  align?: "start" | "center" | "end";
  showDivider?: boolean;
}

export interface TableViewDemoRow {
  id: string;
  name: string;
  type: string;
  owner: string;
  status: string;
}

export const tableViewColumns: readonly TableViewDemoColumn[] = [
  { id: "name", name: "Name", isRowHeader: true, showDivider: true },
  { id: "type", name: "Type", showDivider: true },
  { id: "owner", name: "Owner", align: "center", showDivider: true },
  { id: "status", name: "Status", align: "end" },
];

export const tableViewRows: readonly TableViewDemoRow[] = [
  { id: "project-brief", name: "Project brief.pdf", type: "PDF", owner: "Maya", status: "Ready" },
  {
    id: "quarterly-report",
    name: "Quarterly report.docx",
    type: "Document",
    owner: "Noah",
    status: "Review",
  },
  { id: "budget", name: "Budget.xlsx", type: "Spreadsheet", owner: "Iris", status: "Draft" },
];

export const tableViewExtraRow: TableViewDemoRow = {
  id: "release-notes",
  name: "Release notes.md",
  type: "Markdown",
  owner: "Rin",
  status: "Ready",
};

export const tableViewKeyOptions = [...tableViewRows, tableViewExtraRow].map((item) => item.id);
export const tableViewDisabledItemOptions = ["none", ...tableViewKeyOptions] as const;

export type TableViewKey = (typeof tableViewKeyOptions)[number];
export type TableViewDisabledItem = (typeof tableViewDisabledItemOptions)[number];

export interface TableViewSortDescriptor {
  column: Exclude<TableViewSortColumn, "none">;
  direction: TableViewSortDirection;
}

export interface TableViewDemoProps {
  density: TableViewDensity;
  overflowMode: TableViewOverflowMode;
  selectionMode: TableViewSelectionMode;
  selectionSource: TableViewSelectionSource;
  itemCount: TableViewItemCount;
  columnSet: TableViewColumnSet;
  extraRow: boolean;
  selectedKeys: string;
  defaultSelectedKeys: string;
  disabledKeys: string;
  disabledItem: TableViewDisabledItem;
  isQuiet: boolean;
  showActionBar: boolean;
  sortColumn: TableViewSortColumn;
  sortDirection: TableViewSortDirection;
  allowsResizing: boolean;
  showDividers: boolean;
  rowLinks: boolean;
}

export const tableViewDemoDefaults: TableViewDemoProps = {
  density: "regular",
  overflowMode: "truncate",
  selectionMode: "multiple",
  selectionSource: "defaultSelectedKeys",
  itemCount: "3",
  columnSet: "all",
  extraRow: false,
  selectedKeys: "project-brief",
  defaultSelectedKeys: "project-brief",
  disabledKeys: "",
  disabledItem: "none",
  isQuiet: false,
  showActionBar: false,
  sortColumn: "none",
  sortDirection: "ascending",
  allowsResizing: false,
  showDividers: false,
  rowLinks: false,
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

export function tableViewDemoItems(props: Pick<TableViewDemoProps, "itemCount" | "extraRow">) {
  const visibleRows = tableViewRows.slice(0, Number(props.itemCount));
  return props.extraRow && props.itemCount !== "0"
    ? [...visibleRows, tableViewExtraRow]
    : visibleRows;
}

export function tableViewVisibleColumns(props: Pick<TableViewDemoProps, "columnSet">) {
  if (props.columnSet === "withoutOwner") {
    return tableViewColumns.filter((column) => column.id !== "owner");
  }

  if (props.columnSet === "nameStatus") {
    return tableViewColumns.filter((column) => column.id === "name" || column.id === "status");
  }

  return tableViewColumns;
}

export function tableViewKeysFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: TableViewSelectionMode,
  allowedKeys: readonly string[] = tableViewKeyOptions,
) {
  if (selectionMode === "none") {
    return new Set<string>();
  }

  const allowedKeySet = new Set(allowedKeys);
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter(
      (key): key is TableViewKey => isOneOf(key, tableViewKeyOptions) && allowedKeySet.has(key),
    );
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function serializeTableViewKeys(keys: Set<string | number>) {
  return Array.from(keys, String).join(",");
}

export function initialTableViewSelectedKeys(props: TableViewDemoProps) {
  const itemKeys = tableViewDemoItems(props).map((item) => item.id);
  const defaultKeyFallback = itemKeys.includes(tableViewDemoDefaults.defaultSelectedKeys)
    ? [tableViewDemoDefaults.defaultSelectedKeys]
    : [];

  return tableViewKeysFromValue(
    props.selectionSource === "defaultSelectedKeys"
      ? props.defaultSelectedKeys
      : props.selectedKeys,
    defaultKeyFallback,
    props.selectionMode,
    itemKeys,
  );
}

export function tableViewInitialSortDescriptor(
  props: Pick<TableViewDemoProps, "sortColumn" | "sortDirection">,
): TableViewSortDescriptor | undefined {
  return props.sortColumn === "none"
    ? undefined
    : { column: props.sortColumn, direction: props.sortDirection };
}

export function serializeTableViewSortDescriptor(descriptor: TableViewSortDescriptor | undefined) {
  return descriptor ? `${descriptor.column}:${descriptor.direction}` : "";
}

export function sortTableViewRows(
  rows: readonly TableViewDemoRow[],
  descriptor: TableViewSortDescriptor | undefined,
) {
  if (!descriptor) {
    return [...rows];
  }

  return [...rows].sort((left, right) => {
    const comparison = String(left[descriptor.column]).localeCompare(
      String(right[descriptor.column]),
    );
    return descriptor.direction === "descending" ? -comparison : comparison;
  });
}

export function normalizeTableViewDemoProps(
  props: Partial<TableViewDemoProps> = {},
): TableViewDemoProps {
  const selectionMode = isOneOf(props.selectionMode, tableViewSelectionModeOptions)
    ? props.selectionMode
    : tableViewDemoDefaults.selectionMode;
  const itemCount = isOneOf(props.itemCount, tableViewItemCountOptions)
    ? props.itemCount
    : tableViewDemoDefaults.itemCount;
  const extraRow = props.extraRow === true;
  const itemKeys = tableViewDemoItems({ itemCount, extraRow }).map((item) => item.id);
  const defaultKeyFallback = itemKeys.includes(tableViewDemoDefaults.defaultSelectedKeys)
    ? [tableViewDemoDefaults.defaultSelectedKeys]
    : [];

  return {
    density: isOneOf(props.density, tableViewDensityOptions)
      ? props.density
      : tableViewDemoDefaults.density,
    overflowMode: isOneOf(props.overflowMode, tableViewOverflowModeOptions)
      ? props.overflowMode
      : tableViewDemoDefaults.overflowMode,
    selectionMode,
    selectionSource: isOneOf(props.selectionSource, tableViewSelectionSourceOptions)
      ? props.selectionSource
      : tableViewDemoDefaults.selectionSource,
    itemCount,
    columnSet: isOneOf(props.columnSet, tableViewColumnSetOptions)
      ? props.columnSet
      : tableViewDemoDefaults.columnSet,
    extraRow,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? serializeTableViewKeys(
            tableViewKeysFromValue(props.selectedKeys, [], selectionMode, itemKeys),
          )
        : selectionMode === "none"
          ? ""
          : serializeTableViewKeys(
              tableViewKeysFromValue(
                tableViewDemoDefaults.selectedKeys,
                defaultKeyFallback,
                selectionMode,
                itemKeys,
              ),
            ),
    defaultSelectedKeys:
      typeof props.defaultSelectedKeys === "string" && props.defaultSelectedKeys.trim()
        ? serializeTableViewKeys(
            tableViewKeysFromValue(props.defaultSelectedKeys, [], selectionMode, itemKeys),
          )
        : selectionMode === "none"
          ? ""
          : serializeTableViewKeys(
              tableViewKeysFromValue(
                tableViewDemoDefaults.defaultSelectedKeys,
                defaultKeyFallback,
                selectionMode,
                itemKeys,
              ),
            ),
    disabledKeys:
      typeof props.disabledKeys === "string" && props.disabledKeys.trim()
        ? serializeTableViewKeys(
            tableViewKeysFromValue(props.disabledKeys, [], "multiple", itemKeys),
          )
        : tableViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(props.disabledItem, tableViewDisabledItemOptions)
      ? itemKeys.includes(props.disabledItem)
        ? props.disabledItem
        : "none"
      : tableViewDemoDefaults.disabledItem,
    isQuiet: props.isQuiet === true,
    showActionBar: props.showActionBar === true,
    sortColumn: isOneOf(props.sortColumn, tableViewSortColumnOptions)
      ? props.sortColumn
      : tableViewDemoDefaults.sortColumn,
    sortDirection: isOneOf(props.sortDirection, tableViewSortDirectionOptions)
      ? props.sortDirection
      : tableViewDemoDefaults.sortDirection,
    allowsResizing: props.allowsResizing === true,
    showDividers: props.showDividers === true,
    rowLinks: props.rowLinks === true,
  };
}

export function tableViewDemoPropsFromSearch(search: string): TableViewDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const itemCount = params.get("itemCount");
  const columnSet = params.get("columnSet");
  const disabledItem = params.get("disabledItem");
  const sortColumn = params.get("sortColumn");
  const sortDirection = params.get("sortDirection");

  return normalizeTableViewDemoProps({
    density: isOneOf(params.get("density"), tableViewDensityOptions)
      ? (params.get("density") as TableViewDensity)
      : tableViewDemoDefaults.density,
    overflowMode: isOneOf(params.get("overflowMode"), tableViewOverflowModeOptions)
      ? (params.get("overflowMode") as TableViewOverflowMode)
      : tableViewDemoDefaults.overflowMode,
    selectionMode: isOneOf(selectionMode, tableViewSelectionModeOptions)
      ? selectionMode
      : tableViewDemoDefaults.selectionMode,
    selectionSource: isOneOf(params.get("selectionSource"), tableViewSelectionSourceOptions)
      ? (params.get("selectionSource") as TableViewSelectionSource)
      : tableViewDemoDefaults.selectionSource,
    itemCount: isOneOf(itemCount, tableViewItemCountOptions)
      ? itemCount
      : tableViewDemoDefaults.itemCount,
    columnSet: isOneOf(columnSet, tableViewColumnSetOptions)
      ? columnSet
      : tableViewDemoDefaults.columnSet,
    extraRow: booleanParam(params.get("extraRow")),
    selectedKeys: params.get("selectedKeys") ?? tableViewDemoDefaults.selectedKeys,
    defaultSelectedKeys:
      params.get("defaultSelectedKeys") ?? tableViewDemoDefaults.defaultSelectedKeys,
    disabledKeys: params.get("disabledKeys") ?? tableViewDemoDefaults.disabledKeys,
    disabledItem: isOneOf(disabledItem, tableViewDisabledItemOptions)
      ? disabledItem
      : tableViewDemoDefaults.disabledItem,
    isQuiet: booleanParam(params.get("isQuiet")),
    showActionBar: booleanParam(params.get("showActionBar")),
    sortColumn: isOneOf(sortColumn, tableViewSortColumnOptions)
      ? sortColumn
      : tableViewDemoDefaults.sortColumn,
    sortDirection: isOneOf(sortDirection, tableViewSortDirectionOptions)
      ? sortDirection
      : tableViewDemoDefaults.sortDirection,
    allowsResizing: booleanParam(params.get("allowsResizing")),
    showDividers: booleanParam(params.get("showDividers")),
    rowLinks: booleanParam(params.get("rowLinks")),
  });
}

export function tableViewDemoPropsFromWindow(): TableViewDemoProps {
  if (typeof window === "undefined") {
    return tableViewDemoDefaults;
  }

  return tableViewDemoPropsFromSearch(window.location.search);
}

export function serializeTableViewDemoProps(props: TableViewDemoProps) {
  return JSON.stringify({
    density: props.density,
    overflowMode: props.overflowMode,
    selectionMode: props.selectionMode,
    selectionSource: props.selectionSource,
    itemCount: props.itemCount,
    columnSet: props.columnSet,
    extraRow: props.extraRow,
    selectedKeys: props.selectedKeys,
    defaultSelectedKeys: props.defaultSelectedKeys,
    disabledKeys: props.disabledKeys,
    disabledItem: props.disabledItem,
    isQuiet: props.isQuiet,
    showActionBar: props.showActionBar,
    sortColumn: props.sortColumn,
    sortDirection: props.sortDirection,
    allowsResizing: props.allowsResizing,
    showDividers: props.showDividers,
    rowLinks: props.rowLinks,
  });
}
