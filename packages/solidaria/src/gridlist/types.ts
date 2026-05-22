/**
 * GridList ARIA types for GridList components.
 * Based on @react-aria/gridlist types.
 */

import type { JSX } from "solid-js";
import type { Key, GridNode } from "@proyecto-viviana/solid-stately";

/**
 * Props for the createGridList hook.
 */
export interface AriaGridListProps {
  /** ID for the grid list element. */
  id?: string;
  /** ARIA label for the grid list. */
  "aria-label"?: string;
  /** ARIA labelledby for the grid list. */
  "aria-labelledby"?: string;
  /** ARIA describedby for the grid list. */
  "aria-describedby"?: string;
  /** Whether the grid list uses virtual scrolling. */
  isVirtualized?: boolean;
  /** Handler for item actions. */
  onAction?: (key: Key) => void;
  /** Whether selection should occur on press up. */
  shouldSelectOnPressUp?: boolean;
  /** How selection should behave when pressing an item. */
  selectionBehavior?: "replace" | "toggle";
  /** Whether the grid list is disabled. */
  isDisabled?: boolean;
}

/**
 * Return value from createGridList.
 */
export interface GridListAria {
  /** Props to spread on the grid list element. */
  gridProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Props for the createGridListItem hook.
 */
export interface AriaGridListItemProps {
  /** The item node. */
  node: GridNode<unknown>;
  /** Whether the grid list is virtualized. */
  isVirtualized?: boolean;
  /** How selection should behave when pressing an item. */
  selectionBehavior?: "replace" | "toggle";
  /** Handler for item action. */
  onAction?: () => void;
}

/**
 * Return value from createGridListItem.
 */
export interface GridListItemAria {
  /** Props to spread on the item element. */
  rowProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props to spread on the grid cell wrapper. */
  gridCellProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Whether the item is selected. */
  isSelected: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** Whether the item is pressed. */
  isPressed: boolean;
}

/**
 * Props for the createGridListSelectionCheckbox hook.
 */
export interface AriaGridListSelectionCheckboxProps {
  /** The key of the item. */
  key: Key;
}

/**
 * Return value from createGridListSelectionCheckbox.
 */
export interface GridListSelectionCheckboxAria {
  /** Props to spread on the checkbox input element. */
  checkboxProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}
