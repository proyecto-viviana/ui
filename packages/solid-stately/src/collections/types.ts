/**
 * Core types for collection state management.
 * Simplified from @react-stately/collections for SolidJS.
 */

import type { JSX } from "solid-js";

/** A unique identifier for an item in a collection. */
export type Key = string | number;

/** The type of selection allowed in a collection. */
export type SelectionMode = "none" | "single" | "multiple";

/** How selection behaves when clicking on items. */
export type SelectionBehavior = "toggle" | "replace";

/** Represents the current selection state. */
export type Selection = "all" | Set<Key>;

/** Strategy for focusing first or last item. */
export type FocusStrategy = "first" | "last";

/** Whether disabled keys affect selection, actions, or both. */
export type DisabledBehavior = "selection" | "all";

/**
 * Represents a node in a collection (item or section).
 */
export interface CollectionNode<T = unknown> {
  /** The type of node: 'item' or 'section'. */
  type: "item" | "section";
  /** A unique key for the node. */
  key: Key;
  /** The original value/data for this node. */
  value: T | null;
  /** The text content for accessibility and typeahead. */
  textValue: string;
  /** The rendered content (JSX). */
  rendered: JSX.Element;
  /** The level of nesting (0 for top-level). */
  level: number;
  /** The index within the parent. */
  index: number;
  /** The key of the parent node, if any. */
  parentKey: Key | null;
  /** Whether this node has child nodes. */
  hasChildNodes: boolean;
  /** Child nodes, if any. */
  childNodes: CollectionNode<T>[];
  /** Whether this item is disabled. */
  isDisabled?: boolean;
  /** ARIA label for this node. */
  "aria-label"?: string;
  /** Additional props for the node. */
  props?: Record<string, unknown>;
}

/**
 * A collection of nodes with methods to traverse and query.
 */
export interface Collection<T = unknown> extends Iterable<CollectionNode<T>> {
  /** The number of items in the collection. */
  readonly size: number;

  /** Get all keys in the collection. */
  getKeys(): Iterable<Key>;

  /** Get a node by its key. */
  getItem(key: Key): CollectionNode<T> | null;

  /** Get a node by index. */
  at(index: number): CollectionNode<T> | null;

  /** Get the key before the given key. */
  getKeyBefore(key: Key): Key | null;

  /** Get the key after the given key. */
  getKeyAfter(key: Key): Key | null;

  /** Get the first key in the collection. */
  getFirstKey(): Key | null;

  /** Get the last key in the collection. */
  getLastKey(): Key | null;

  /** Get the children of a node. */
  getChildren(key: Key): Iterable<CollectionNode<T>>;

  /** Get the text value for a key. */
  getTextValue(key: Key): string;

  /**
   * Filter the collection, returning a new collection containing only the item
   * nodes for which `filterFn` returns true. Sections whose children are all
   * filtered out are dropped. Mirrors @react-aria/collections
   * `BaseCollection.filter` (and the optional `Collection.filter` in
   * @react-types/shared). Used by Autocomplete to narrow the collection as the
   * user types.
   */
  filter?(filterFn: (nodeValue: string, node: CollectionNode<T>) => boolean): Collection<T>;
}

/**
 * Structural shape expected when inferring collection item properties
 * (key, textValue, etc.) from plain objects without explicit getKey/getTextValue/getDisabled.
 */
export interface CollectionItemLike {
  key?: Key;
  id?: Key;
  textValue?: string;
  label?: string;
  /** Conventional display fields, read when no textValue/label/getTextValue is given. */
  name?: string;
  title?: string;
  isDisabled?: boolean;
}

/**
 * Props for items in a collection.
 */
export interface ItemProps<T = unknown> {
  /** Unique key for the item. Required if items is used for dynamic collections. */
  key?: Key;
  /** The text value for accessibility and typeahead. If not provided, derived from children. */
  textValue?: string;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
  /** The rendered content of the item. */
  children?: JSX.Element;
  /** ARIA label for the item. */
  "aria-label"?: string;
  /** The original value for dynamic collections. */
  value?: T;
}

/**
 * Props for sections in a collection.
 */
export interface SectionProps<T = unknown> {
  /** Unique key for the section. */
  key?: Key;
  /** The section header/title. */
  title?: JSX.Element;
  /** ARIA label for the section. */
  "aria-label"?: string;
  /** The items in this section. */
  children?: JSX.Element;
  /** Items for dynamic rendering. */
  items?: Iterable<T>;
}

/**
 * Base props for components that use collections.
 */
export interface CollectionBase<T = unknown> {
  /** The items in the collection (for dynamic rendering). */
  items?: Iterable<T>;
  /** The children (static items or render function). */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
}

/**
 * Props for single selection.
 */
export interface SingleSelection {
  /** Whether empty selection is allowed. */
  disallowEmptySelection?: boolean;
  /** The currently selected key (controlled). */
  selectedKey?: Key | null;
  /** The default selected key (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler called when selection changes. */
  onSelectionChange?: (key: Key | null) => void;
}

/**
 * Props for multiple selection.
 */
export interface MultipleSelection {
  /** The selection mode. */
  selectionMode?: SelectionMode;
  /** Whether empty selection is allowed. */
  disallowEmptySelection?: boolean;
  /** The currently selected keys (controlled). */
  selectedKeys?: "all" | Iterable<Key>;
  /** The default selected keys (uncontrolled). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (keys: Selection) => void;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
}
