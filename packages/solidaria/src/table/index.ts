/**
 * Local Solidaria barrel for table accessibility primitives.
 * Each exported module owns its upstream source mapping.
 */

export { createTable, getTableData } from "./createTable";
export { createTableHeaderRow } from "./createTableHeaderRow";
export { createTableColumnHeader } from "./createTableColumnHeader";
export { createTableRow } from "./createTableRow";
export { createTableCell } from "./createTableCell";
export { createTableRowGroup } from "./createTableRowGroup";
export { createTableSelectionCheckbox } from "./createTableSelectionCheckbox";
export { createTableSelectAllCheckbox } from "./createTableSelectAllCheckbox";
export { createTableColumnResize } from "./createTableColumnResize";
export type {
  AriaTableProps,
  TableAria,
  AriaTableHeaderRowProps,
  TableHeaderRowAria,
  AriaTableColumnHeaderProps,
  TableColumnHeaderAria,
  AriaTableRowProps,
  TableRowAria,
  AriaTableCellProps,
  TableCellAria,
  AriaTableRowGroupProps,
  TableRowGroupAria,
  AriaTableSelectionCheckboxProps,
  TableSelectionCheckboxAria,
  TableSelectAllCheckboxAria,
} from "./types";
export type {
  CreateTableColumnResizeProps,
  TableColumnResizeResult,
} from "./createTableColumnResize";
