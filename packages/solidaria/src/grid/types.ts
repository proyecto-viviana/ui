/**
 * Grid ARIA types for Table and GridList components.
 * Based on these pinned React Aria sources:
 * - packages/@react-types/shared/src/collections.d.ts
 * - packages/react-aria/src/grid/useGrid.ts
 * - packages/react-aria/src/grid/useGridRow.ts
 * - packages/react-aria/src/grid/useGridCell.ts
 *
 * The key-based row and cell props adapt the upstream node-based API to Solid state.
 */

import type { JSX } from "solid-js";
import type { Key } from "@proyecto-viviana/solid-stately";

/**
 * Keyboard delegate interface for grid navigation.
 */
export interface KeyboardDelegate {
  /** Get the key above the given key. */
  getKeyAbove?(key: Key): Key | null;
  /** Get the key below the given key. */
  getKeyBelow?(key: Key): Key | null;
  /** Get the key to the left of the given key. */
  getKeyLeftOf?(key: Key): Key | null;
  /** Get the key to the right of the given key. */
  getKeyRightOf?(key: Key): Key | null;
  /** Get the first key in the collection. */
  getFirstKey?(key?: Key, global?: boolean): Key | null;
  /** Get the last key in the collection. */
  getLastKey?(key?: Key, global?: boolean): Key | null;
  /** Get the key for a page up action. */
  getKeyPageAbove?(key: Key): Key | null;
  /** Get the key for a page down action. */
  getKeyPageBelow?(key: Key): Key | null;
  /** Get the key that matches the search string. */
  getKeyForSearch?(search: string, fromKey?: Key): Key | null;
}

/**
 * Props for the createGrid hook.
 */
export interface GridProps {
  /** ID for the grid element. */
  id?: string;
  /** Whether the grid uses virtual scrolling. */
  isVirtualized?: boolean;
  /** Whether typeahead navigation is disabled. */
  disallowTypeAhead?: boolean;
  /** Custom keyboard delegate for navigation. */
  keyboardDelegate?: KeyboardDelegate;
  /** Whether focus should be on row or cell. */
  focusMode?: "row" | "cell";
  /** Handler for row actions. */
  onRowAction?: (key: Key) => void;
  /** Handler for cell actions. */
  onCellAction?: (key: Key) => void;
  /** Escape key behavior. */
  escapeKeyBehavior?: "clearSelection" | "none";
  /** Whether selection should occur on press up. */
  shouldSelectOnPressUp?: boolean;
  /** ARIA label for the grid. */
  "aria-label"?: string;
  /** ARIA labelledby for the grid. */
  "aria-labelledby"?: string;
  /** ARIA describedby for the grid. */
  "aria-describedby"?: string;
}

/**
 * Return value from createGrid.
 */
export interface GridAria {
  /** Props to spread on the grid element. */
  gridProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Props for the createGridRow hook.
 */
export interface GridRowProps {
  /** The key of the row. */
  key: Key;
  /** The index of the row (for virtualized grids). */
  index?: number;
  /** Whether the grid is virtualized. */
  isVirtualized?: boolean;
  /** Handler for row action. */
  onAction?: () => void;
}

/**
 * Return value from createGridRow.
 */
export interface GridRowAria {
  /** Props to spread on the row element. */
  rowProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the row is selected. */
  isSelected: boolean;
  /** Whether the row is disabled. */
  isDisabled: boolean;
  /** Whether the row is pressed. */
  isPressed: boolean;
}

/**
 * Props for the createGridCell hook.
 */
export interface GridCellProps {
  /** The key of the cell. */
  key: Key;
  /** The key of the parent row. */
  parentKey: Key;
  /** The column index of the cell. */
  colIndex?: number;
  /** Column span. */
  colSpan?: number;
  /** Whether the grid is virtualized. */
  isVirtualized?: boolean;
  /** Whether to focus cell or child element. */
  focusMode?: "child" | "cell";
  /** Handler for cell action. */
  onAction?: () => void;
}

/**
 * Return value from createGridCell.
 */
export interface GridCellAria {
  /** Props to spread on the cell element. */
  cellProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the cell's row is selected. */
  isSelected: boolean;
  /** Whether the cell's row is disabled. */
  isDisabled: boolean;
  /** Whether the cell is pressed. */
  isPressed: boolean;
  /** Whether the cell is focused. */
  isFocused: boolean;
}
