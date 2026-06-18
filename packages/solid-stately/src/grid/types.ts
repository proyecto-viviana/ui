/**
 * Grid collection types for Table and GridList components.
 * Based on @react-types/grid.
 */

import type { Key, FocusStrategy } from "../collections/types";

/**
 * Represents the type of a grid node.
 */
export type GridNodeType =
  | "item" // A selectable row
  | "cell" // A cell within a row
  | "column" // A column header
  | "rowheader" // A cell that acts as a row header
  | "headerrow" // A header row container
  | "section" // A section/group
  | "content" // A collection content placeholder
  | "placeholder"; // A placeholder (e.g., empty row)

/**
 * Represents a node in a grid collection.
 */
export interface GridNode<T = unknown> {
  /** The type of grid node. */
  type: GridNodeType;
  /** A unique key for the node. */
  key: Key;
  /** The original value/data for this node. */
  value: T | null;
  /** The text content for accessibility and typeahead. */
  textValue: string;
  /** The rendered content (JSX) - optional for programmatic nodes. */
  rendered?: unknown;
  /** The level of nesting (0 for top-level). */
  level: number;
  /** The index within the parent. */
  index: number;
  /** The key of the parent node, if any. */
  parentKey?: Key | null;
  /** Previous sibling key (visible order). */
  prevKey?: Key | null;
  /** Next sibling key (visible order). */
  nextKey?: Key | null;
  /** Key of the first child node, if any (used by tree grids). */
  firstChildKey?: Key | null;
  /** Key of the last child node, if any (used by tree grids). */
  lastChildKey?: Key | null;
  /** Whether this node has child nodes. */
  hasChildNodes: boolean;
  /** Child nodes (cells for rows, rows for sections). */
  childNodes: GridNode<T>[];
  /** Whether this item is disabled. */
  isDisabled?: boolean;
  /** ARIA label for this node. */
  "aria-label"?: string;
  /** Additional props for the node. */
  props?: Record<string, unknown>;
  /** Column index for cells. */
  column?: number;
  /** Column span for cells. */
  colspan?: number;
  /** Row index. */
  rowIndex?: number;
  /** Whether this row can be expanded (for tree grids). */
  isExpandable?: boolean;
  /** Whether this row is expanded. */
  isExpanded?: boolean;
}

/**
 * A collection of grid nodes with grid-specific navigation.
 */
export interface GridCollection<T = unknown> {
  /** The number of items in the collection. */
  readonly size: number;
  /** All rows in the grid (including header rows). */
  readonly rows: GridNode<T>[];
  /** All column definitions. */
  readonly columns: GridNode<T>[];
  /** Number of header rows. */
  readonly headerRows: GridNode<T>[];
  /** Number of body rows (excluding headers). */
  readonly rowCount: number;
  /** Number of columns. */
  readonly columnCount: number;

  /** Get all keys in the collection. */
  getKeys(): Iterable<Key>;

  /** Get a node by its key. */
  getItem(key: Key): GridNode<T> | null;

  /** Get a node by index. */
  at(index: number): GridNode<T> | null;

  /** Get the key before the given key. */
  getKeyBefore(key: Key): Key | null;

  /** Get the key after the given key. */
  getKeyAfter(key: Key): Key | null;

  /** Get the first key in the collection. */
  getFirstKey(): Key | null;

  /** Get the last key in the collection. */
  getLastKey(): Key | null;

  /** Get the children of a node. */
  getChildren(key: Key): Iterable<GridNode<T>>;

  /** Get the text value for a key. */
  getTextValue(key: Key): string;

  /** Get a cell by row and column key. */
  getCell(rowKey: Key, columnKey: Key): GridNode<T> | null;

  /** Iterator over all nodes. */
  [Symbol.iterator](): Iterator<GridNode<T>>;
}

/**
 * State for a grid component.
 */
export interface GridState<T, C extends GridCollection<T> = GridCollection<T>> {
  /** The grid collection. */
  readonly collection: C;
  /** Keys of disabled rows. */
  readonly disabledKeys: Set<Key>;
  /** Whether keyboard navigation is disabled. */
  readonly isKeyboardNavigationDisabled: boolean;
  /** Currently focused key. */
  readonly focusedKey: Key | null;
  /** Focus strategy for child focus. */
  readonly childFocusStrategy: FocusStrategy | null;
  /** Whether the grid is focused. */
  readonly isFocused: boolean;
  /** The selection mode. */
  readonly selectionMode: "none" | "single" | "multiple";
  /** The selection behavior. */
  readonly selectionBehavior: "toggle" | "replace";
  /** The currently selected keys. */
  readonly selectedKeys: "all" | Set<Key>;
  /** Check if a key is selected. */
  isSelected(key: Key): boolean;
  /** Check if a key is disabled. */
  isDisabled(key: Key): boolean;
  /** Set the focused key. */
  setFocusedKey(key: Key | null, childFocusStrategy?: FocusStrategy): void;
  /** Set focused state. */
  setFocused(isFocused: boolean): void;
  /** Toggle selection for a key. */
  toggleSelection(key: Key): void;
  /** Replace selection with a key. */
  replaceSelection(key: Key): void;
  /** Extend selection to a key (shift-click). */
  extendSelection(toKey: Key): void;
  /** Select all rows. */
  selectAll(): void;
  /** Clear selection. */
  clearSelection(): void;
  /** Toggle select all. */
  toggleSelectAll(): void;
  /** Set keyboard navigation disabled. */
  setKeyboardNavigationDisabled(isDisabled: boolean): void;
}

/**
 * Options for creating grid state.
 */
export interface GridStateOptions<T, C extends GridCollection<T> = GridCollection<T>> {
  /** The grid collection. */
  collection: C;
  /** Keys of disabled rows. */
  disabledKeys?: Iterable<Key>;
  /** Focus mode: 'row' or 'cell'. */
  focusMode?: "row" | "cell";
  /** Selection mode. */
  selectionMode?: "none" | "single" | "multiple";
  /** Selection behavior. */
  selectionBehavior?: "toggle" | "replace";
  /** Whether empty selection is disallowed. */
  disallowEmptySelection?: boolean;
  /** Currently selected keys (controlled). */
  selectedKeys?: "all" | Iterable<Key>;
  /** Default selected keys (uncontrolled). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler for selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
}
