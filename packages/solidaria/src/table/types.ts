/**
 * Table ARIA types for Table components.
 * Based on @react-aria/table types.
 */

import type { JSX } from "solid-js";
import type { Key, GridNode } from "@proyecto-viviana/solid-stately";

/**
 * Props for the createTable hook.
 */
export interface AriaTableProps {
  /** ID for the table element. */
  id?: string;
  /** ARIA label for the table. */
  "aria-label"?: string;
  /** ARIA labelledby for the table. */
  "aria-labelledby"?: string;
  /** ARIA describedby for the table. */
  "aria-describedby"?: string;
  /** Whether the table uses virtual scrolling. */
  isVirtualized?: boolean;
  /** Handler for row actions. */
  onRowAction?: (key: Key) => void;
  /** Handler for cell actions. */
  onCellAction?: (key: Key) => void;
  /** Whether selection should occur on press up. */
  shouldSelectOnPressUp?: boolean;
  /** Whether Escape clears selection. */
  escapeKeyBehavior?: "clearSelection" | "none";
  /** Focus mode: 'row' or 'cell'. */
  focusMode?: "row" | "cell";
}

/**
 * Return value from createTable.
 */
export interface TableAria {
  /** Props to spread on the table element. */
  gridProps: JSX.HTMLAttributes<HTMLTableElement>;
}

/**
 * Props for the createTableHeaderRow hook.
 */
export interface AriaTableHeaderRowProps {
  /** The header row node. */
  node: GridNode<unknown>;
  /** Whether the table is virtualized. */
  isVirtualized?: boolean;
}

/**
 * Return value from createTableHeaderRow.
 */
export interface TableHeaderRowAria {
  /** Props to spread on the header row element. */
  rowProps: JSX.HTMLAttributes<HTMLTableRowElement>;
}

/**
 * Props for the createTableColumnHeader hook.
 */
export interface AriaTableColumnHeaderProps {
  /** The column header node. */
  node: GridNode<unknown>;
  /** Whether the table is virtualized. */
  isVirtualized?: boolean;
  /** Whether the column allows sorting. */
  allowsSorting?: boolean;
}

/**
 * Return value from createTableColumnHeader.
 */
export interface TableColumnHeaderAria {
  /** Props to spread on the column header element. */
  columnHeaderProps: JSX.HTMLAttributes<HTMLTableCellElement>;
}

/**
 * Props for the createTableRow hook.
 */
export interface AriaTableRowProps {
  /** The row node. */
  node: GridNode<unknown>;
  /** Whether the table is virtualized. */
  isVirtualized?: boolean;
  /** Whether the row is disabled. */
  isDisabled?: boolean;
  /** Handler for row action. */
  onAction?: () => void;
  /** Link href for row activation. */
  href?: string;
  /** Handler for link row activation. */
  onLinkAction?: (event: MouseEvent | KeyboardEvent) => void;
}

/**
 * Return value from createTableRow.
 */
export interface TableRowAria {
  /** Props to spread on the row element. */
  rowProps: JSX.HTMLAttributes<HTMLTableRowElement>;
  /** Whether the row is selected. */
  isSelected: boolean;
  /** Whether the row is disabled. */
  isDisabled: boolean;
  /** Whether the row is pressed. */
  isPressed: boolean;
}

/**
 * Props for the createTableCell hook.
 */
export interface AriaTableCellProps {
  /** The cell node. */
  node: GridNode<unknown>;
  /** Whether the table is virtualized. */
  isVirtualized?: boolean;
  /** Handler for cell action. */
  onAction?: () => void;
}

/**
 * Return value from createTableCell.
 */
export interface TableCellAria {
  /** Props to spread on the cell element. */
  gridCellProps: JSX.HTMLAttributes<HTMLTableCellElement>;
  /** Whether the cell is pressed. */
  isPressed: boolean;
}

/**
 * Props for the createTableRowGroup hook.
 */
export interface AriaTableRowGroupProps {
  /** The type of row group: 'thead', 'tbody', or 'tfoot'. */
  type: "thead" | "tbody" | "tfoot";
}

/**
 * Return value from createTableRowGroup.
 */
export interface TableRowGroupAria {
  /** Props to spread on the row group element. */
  rowGroupProps: JSX.HTMLAttributes<HTMLTableSectionElement>;
}

/**
 * Props for the createTableSelectionCheckbox hook.
 */
export interface AriaTableSelectionCheckboxProps {
  /** The key of the row. */
  key: Key;
}

/**
 * Return value from createTableSelectionCheckbox.
 */
export interface TableSelectionCheckboxAria {
  /** Props to spread on the checkbox input element. */
  checkboxProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * Return value from createTableSelectAllCheckbox.
 */
export interface TableSelectAllCheckboxAria {
  /** Props to spread on the checkbox input element. */
  checkboxProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Whether the native checkbox should expose its mixed state. */
  isIndeterminate: boolean;
}
