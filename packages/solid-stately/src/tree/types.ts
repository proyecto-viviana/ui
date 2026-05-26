/**
 * Tree collection types for Tree components.
 * Based on @react-stately/tree.
 */

import type { Key, FocusStrategy } from "../collections/types";
import type { GridNode, GridCollection } from "../grid/types";

/**
 * Represents a node in a tree collection.
 * Extends GridNode with tree-specific properties.
 */
export interface TreeNode<T = unknown> extends GridNode<T> {
  /** Whether this node has child nodes that can be expanded. */
  hasChildNodes: boolean;
  /** Child nodes of this tree item. */
  childNodes: TreeNode<T>[];
  /** The level of nesting (0 for root items). */
  level: number;
  /** The key of the parent node, if any. */
  parentKey?: Key | null;
  /** Whether this node is expandable. */
  isExpandable?: boolean;
  /** Whether this node is currently expanded (only meaningful if expandable). */
  isExpanded?: boolean;
}

/**
 * A collection of tree nodes with tree-specific navigation.
 * Only includes visible nodes (respects expanded state).
 */
export interface TreeCollection<T = unknown> extends Omit<
  GridCollection<T>,
  "rows" | "columns" | "headerRows" | "columnCount" | "getCell"
> {
  /** All visible rows in the tree (respects expanded state). */
  readonly rows: TreeNode<T>[];
  /** Number of visible rows. */
  readonly rowCount: number;

  /** Get all keys in the collection (visible only). */
  getKeys(): Iterable<Key>;

  /** Get a node by its key (any node, visible or not). */
  getItem(key: Key): TreeNode<T> | null;

  /** Get a node by index (visible nodes only). */
  at(index: number): TreeNode<T> | null;

  /** Get the key before the given key (visible nodes only). */
  getKeyBefore(key: Key): Key | null;

  /** Get the key after the given key (visible nodes only). */
  getKeyAfter(key: Key): Key | null;

  /** Get the first key in the collection. */
  getFirstKey(): Key | null;

  /** Get the last key in the collection. */
  getLastKey(): Key | null;

  /** Get the children of a node. */
  getChildren(key: Key): Iterable<TreeNode<T>>;

  /** Get the text value for a key. */
  getTextValue(key: Key): string;

  /** Get the parent key for a node. */
  getParentKey(key: Key): Key | null;

  /** Iterator over visible nodes. */
  [Symbol.iterator](): Iterator<TreeNode<T>>;
}

/**
 * State for a tree component.
 * Extends grid state with expansion management.
 */
export interface TreeState<T, C extends TreeCollection<T> = TreeCollection<T>> {
  /** The tree collection (only visible nodes). */
  readonly collection: C;
  /** Keys of disabled items. */
  readonly disabledKeys: Set<Key>;
  /** Keys of expanded items. */
  readonly expandedKeys: Set<Key>;
  /** Whether keyboard navigation is disabled. */
  readonly isKeyboardNavigationDisabled: boolean;
  /** Currently focused key. */
  readonly focusedKey: Key | null;
  /** Focus strategy for child focus. */
  readonly childFocusStrategy: FocusStrategy | null;
  /** Whether the tree is focused. */
  readonly isFocused: boolean;
  /** The selection mode. */
  readonly selectionMode: "none" | "single" | "multiple";
  /** How selection behaves when pressing an item. */
  readonly selectionBehavior: "toggle" | "replace";
  /** The currently selected keys. */
  readonly selectedKeys: "all" | Set<Key>;

  /** Check if a key is selected. */
  isSelected(key: Key): boolean;
  /** Check if a key is disabled. */
  isDisabled(key: Key): boolean;
  /** Check if a key is expanded. */
  isExpanded(key: Key): boolean;
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
  /** Select all visible items. */
  selectAll(): void;
  /** Clear selection. */
  clearSelection(): void;
  /** Toggle select all. */
  toggleSelectAll(): void;
  /** Toggle expansion for a key. */
  toggleKey(key: Key): void;
  /** Expand a key. */
  expandKey(key: Key): void;
  /** Collapse a key. */
  collapseKey(key: Key): void;
  /** Set the expanded keys. */
  setExpandedKeys(keys: Set<Key>): void;
  /** Set keyboard navigation disabled. */
  setKeyboardNavigationDisabled(isDisabled: boolean): void;
}

/**
 * Options for creating tree state.
 */
export interface TreeStateOptions<T, C extends TreeCollection<T> = TreeCollection<T>> {
  /** The tree collection builder - receives expanded keys and returns collection. */
  collectionFactory: (expandedKeys: Set<Key>) => C;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Disabled behavior: 'selection' only or 'all' interactions. */
  disabledBehavior?: "selection" | "all";
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
  /** Currently expanded keys (controlled). */
  expandedKeys?: Iterable<Key>;
  /** Default expanded keys (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  /** Handler for expansion changes. */
  onExpandedChange?: (keys: Set<Key>) => void;
}

/**
 * Item representation for building tree collections.
 */
export interface TreeItemData<T = unknown> {
  /** Unique key for this item. */
  key?: Key;
  /** S2/React Aria-compatible unique id alias. */
  id?: Key;
  /** The data value for this item. */
  value?: T;
  /** Text content for accessibility and search. */
  textValue?: string;
  /** Child items (makes this item expandable). */
  children?: TreeItemData<T>[];
  /** Whether this item has children that may not be loaded yet. */
  hasChildItems?: boolean;
  /** Whether this item is disabled. */
  isDisabled?: boolean;
}
