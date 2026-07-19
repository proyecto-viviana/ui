/**
 * A simple list collection implementation.
 * Provides a Collection interface over an array of nodes.
 */

import type { Collection, CollectionItemLike, CollectionNode, Key } from "./types";

/**
 * A basic implementation of Collection for list-based components.
 */
export class ListCollection<T = unknown> implements Collection<T> {
  private nodes: CollectionNode<T>[];
  private keyMap: Map<Key, CollectionNode<T>>;

  constructor(nodes: CollectionNode<T>[]) {
    this.nodes = nodes;
    this.keyMap = new Map();

    // Build key map for O(1) lookups
    const addToMap = (node: CollectionNode<T>) => {
      this.keyMap.set(node.key, node);
      if (node.childNodes) {
        for (const child of node.childNodes) {
          addToMap(child);
        }
      }
    };

    for (const node of nodes) {
      addToMap(node);
    }
  }

  get size(): number {
    return this.keyMap.size;
  }

  *[Symbol.iterator](): Iterator<CollectionNode<T>> {
    yield* this.nodes;
  }

  *getKeys(): Iterable<Key> {
    for (const node of this.keyMap.values()) {
      yield node.key;
    }
  }

  getItem(key: Key): CollectionNode<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(index: number): CollectionNode<T> | null {
    // Flatten all items for indexing
    const items = this.getAllItems();
    return items[index] ?? null;
  }

  getKeyBefore(key: Key): Key | null {
    const items = this.getAllItems();
    const index = items.findIndex((item) => item.key === key);
    if (index <= 0) return null;
    return items[index - 1].key;
  }

  getKeyAfter(key: Key): Key | null {
    const items = this.getAllItems();
    const index = items.findIndex((item) => item.key === key);
    if (index < 0 || index >= items.length - 1) return null;
    return items[index + 1].key;
  }

  getFirstKey(): Key | null {
    const items = this.getAllItems();
    return items[0]?.key ?? null;
  }

  getLastKey(): Key | null {
    const items = this.getAllItems();
    return items[items.length - 1]?.key ?? null;
  }

  *getChildren(key: Key): Iterable<CollectionNode<T>> {
    const node = this.getItem(key);
    if (node?.childNodes) {
      yield* node.childNodes;
    }
  }

  getTextValue(key: Key): string {
    return this.getItem(key)?.textValue ?? "";
  }

  /**
   * Filter the collection, returning a new `ListCollection` containing only the
   * item nodes for which `filterFn(node.textValue, node)` returns true. Sections
   * whose children are all filtered out are dropped; surviving sections are
   * rebuilt with their filtered children. Node order is preserved. Mirrors the
   * behaviour of @react-aria/collections `BaseCollection.filter`.
   */
  filter(filterFn: (nodeValue: string, node: CollectionNode<T>) => boolean): ListCollection<T> {
    const filterNodes = (nodes: CollectionNode<T>[]): CollectionNode<T>[] => {
      const result: CollectionNode<T>[] = [];
      for (const node of nodes) {
        if (node.type === "section") {
          const children = filterNodes(node.childNodes ?? []);
          if (children.length > 0) {
            result.push({ ...node, childNodes: children, hasChildNodes: true });
          }
        } else if (node.type === "item") {
          if (filterFn(node.textValue, node)) {
            result.push(node);
          }
        } else {
          // Non-item, non-section nodes (e.g. separators) pass through unfiltered.
          result.push(node);
        }
      }
      return result;
    };

    return new ListCollection<T>(filterNodes(this.nodes));
  }

  /**
   * Get all items (excluding sections, including items within sections).
   */
  private getAllItems(): CollectionNode<T>[] {
    const items: CollectionNode<T>[] = [];

    const addItems = (nodes: CollectionNode<T>[]) => {
      for (const node of nodes) {
        if (node.type === "item") {
          items.push(node);
        } else if (node.type === "section" && node.childNodes) {
          addItems(node.childNodes);
        }
      }
    };

    addItems(this.nodes);
    return items;
  }
}

/**
 * Create a collection from an array of items.
 */
export function createListCollection<T>(
  items: T[],
  options: {
    getKey?: (item: T, index: number) => Key;
    getTextValue?: (item: T) => string;
    getDisabled?: (item: T) => boolean;
  } = {},
): ListCollection<T> {
  const {
    getKey = (item: T, index: number) => {
      const o = item as CollectionItemLike;
      return o.key ?? o.id ?? index;
    },
    getTextValue = (item: T) => {
      const o = item as CollectionItemLike;
      // See createListState: `String(item)` yields "[object Object]" for a plain
      // object, so widen to name/title and fall back to the item's key.
      return (
        o.textValue ??
        o.label ??
        o.name ??
        o.title ??
        (item != null && typeof item === "object" ? String(o.key ?? o.id ?? "") : String(item))
      );
    },
    getDisabled = (item: T) => (item as CollectionItemLike).isDisabled ?? false,
  } = options;

  const nodes: CollectionNode<T>[] = items.map((item, index) => ({
    type: "item" as const,
    key: getKey(item, index),
    value: item,
    textValue: getTextValue(item),
    rendered: null!, // Will be set by component
    level: 0,
    index,
    parentKey: null,
    hasChildNodes: false,
    childNodes: [],
    isDisabled: getDisabled(item),
  }));

  return new ListCollection(nodes);
}
