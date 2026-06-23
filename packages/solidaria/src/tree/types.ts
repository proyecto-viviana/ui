/**
 * Tree ARIA types.
 * Based on @react-aria/tree.
 */

import type { JSX } from "solid-js";
import type { Key, TreeNode } from "@proyecto-viviana/solid-stately";

/**
 * Props for createTree.
 */
export interface AriaTreeProps {
  /** The unique id for the tree. */
  id?: string;
  /** Label for accessibility. */
  "aria-label"?: string;
  /** ID of an element that labels the tree. */
  "aria-labelledby"?: string;
  /** ID of an element that describes the tree. */
  "aria-describedby"?: string;
  /** Whether the tree is virtualized. */
  isVirtualized?: boolean;
  /** Handler called when an item action is triggered. */
  onAction?: (key: Key) => void;
  /**
   * How keyboard navigation should behave within rows.
   *
   * `"arrow"` treats the tree as a single tab stop and uses arrow keys to move
   * through row children. `"tab"` lets tabbable row children participate in
   * normal tab order and stops child key events before tree navigation.
   *
   * @default "arrow"
   */
  keyboardNavigationBehavior?: "arrow" | "tab";
  /** Whether the tree is disabled. */
  isDisabled?: boolean;
  /** The writing direction for the tree. Determines expand/collapse key mapping. */
  direction?: "ltr" | "rtl";
}

/**
 * Return value for createTree.
 */
export interface TreeAria {
  /** Props for the tree container (role="treegrid"). */
  treeProps: JSX.HTMLAttributes<HTMLDivElement>;
}

/**
 * Props for createTreeItem.
 */
export interface AriaTreeItemProps<T = unknown> {
  /** The tree node this item represents. */
  node: TreeNode<T>;
  /** Whether the item is rendered in a virtualized list. */
  isVirtualized?: boolean;
  /** How selection should behave when pressing an item. */
  selectionBehavior?: "replace" | "toggle";
  /** Handler called when this item's action is triggered. */
  onAction?: () => void;
  /** Whether this item is disabled. */
  isDisabled?: boolean;
  /** The text value for the item (used for aria-label on the row). */
  textValue?: string;
}

/**
 * Return value for createTreeItem.
 */
export interface TreeItemAria {
  /** Props for the row element. */
  rowProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the grid cell content wrapper. */
  gridCellProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the expand button (if the item is expandable). */
  expandButtonProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Whether the item is selected. */
  isSelected: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** Whether the item is being pressed. */
  isPressed: boolean;
  /** Whether the item is expanded. */
  isExpanded: boolean;
  /** Whether the item is expandable (has children). */
  isExpandable: boolean;
  /** The nesting level of the item (0 for root). */
  level: number;
}

/**
 * Props for createTreeSelectionCheckbox.
 */
export interface AriaTreeSelectionCheckboxProps {
  /** The key of the tree item this checkbox belongs to. */
  key: Key;
}

/**
 * Return value for createTreeSelectionCheckbox.
 */
export interface TreeSelectionCheckboxAria {
  /** Props for the checkbox input element. */
  checkboxProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}
