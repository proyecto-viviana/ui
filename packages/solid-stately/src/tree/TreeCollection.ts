/**
 * TreeCollection implementation.
 * Based on @react-stately/tree/TreeCollection.
 *
 * A flattened view of tree nodes that respects expanded state.
 * Only visible nodes (root + expanded children) are included in iteration.
 */

import type { Key } from "../collections/types";
import type { TreeCollection as ITreeCollection, TreeNode, TreeItemData } from "./types";

function getItemKey<T>(item: TreeItemData<T>): Key {
  const key = item.key ?? item.id;
  if (key == null) {
    throw new Error("Tree items must define either a key or id.");
  }
  return key;
}

/**
 * Creates a TreeCollection from hierarchical data.
 * The collection is flattened based on expanded keys.
 */
export class TreeCollection<T> implements ITreeCollection<T> {
  private keyMap: Map<Key, TreeNode<T>> = new Map();
  private visibleRows: TreeNode<T>[] = [];
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;

  constructor(items: TreeItemData<T>[], expandedKeys: Set<Key>) {
    this.buildCollection(items, expandedKeys);
  }

  private buildCollection(items: TreeItemData<T>[], expandedKeys: Set<Key>): void {
    let globalIndex = 0;
    let previousNode: TreeNode<T> | null = null;

    const visit = (
      item: TreeItemData<T>,
      level: number,
      parentKey: Key | null,
      indexInParent: number,
    ): TreeNode<T> => {
      const key = getItemKey(item);
      const hasLoadedChildren = Boolean(item.children && item.children.length > 0);
      const hasChildren = hasLoadedChildren || !!item.hasChildItems;
      const isExpanded = hasChildren && expandedKeys.has(key);

      // Build child nodes first (even if not visible, for the map)
      const childNodes: TreeNode<T>[] = [];
      if (hasLoadedChildren && item.children) {
        for (let i = 0; i < item.children.length; i++) {
          const childNode = visit(item.children[i], level + 1, key, i);
          childNodes.push(childNode);
        }
      }

      const node: TreeNode<T> = {
        type: "item",
        key,
        value: (item.value ?? item) as T,
        textValue: item.textValue || String(key),
        level,
        index: indexInParent,
        parentKey,
        hasChildNodes: hasChildren || false,
        childNodes,
        isDisabled: item.isDisabled,
        isExpandable: hasChildren,
        isExpanded,
      };

      // Always add to keyMap (for getItem lookups)
      this.keyMap.set(key, node);

      return node;
    };

    // First pass: build all nodes
    const rootNodes: TreeNode<T>[] = [];
    for (let i = 0; i < items.length; i++) {
      const node = visit(items[i], 0, null, i);
      rootNodes.push(node);
    }

    // Second pass: build visible rows list
    const addVisibleNodes = (nodes: TreeNode<T>[]): void => {
      for (const node of nodes) {
        node.rowIndex = globalIndex++;
        this.visibleRows.push(node);
        node.prevKey = previousNode?.key ?? null;
        node.nextKey = undefined;
        if (previousNode) {
          previousNode.nextKey = node.key;
        }
        previousNode = node;

        if (node.isExpanded && node.childNodes.length > 0) {
          addVisibleNodes(node.childNodes);
        }
      }
    };

    addVisibleNodes(rootNodes);
    this.firstKey = this.visibleRows[0]?.key ?? null;
    this.lastKey = this.visibleRows[this.visibleRows.length - 1]?.key ?? null;
  }

  // Collection properties

  get size(): number {
    return this.visibleRows.length;
  }

  get rows(): TreeNode<T>[] {
    return this.visibleRows;
  }

  get rowCount(): number {
    return this.visibleRows.length;
  }

  // Collection methods

  getKeys(): Iterable<Key> {
    return this.visibleRows.map((node) => node.key);
  }

  getItem(key: Key): TreeNode<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(index: number): TreeNode<T> | null {
    if (index < 0 || index >= this.visibleRows.length) {
      return null;
    }
    return this.visibleRows[index];
  }

  getKeyBefore(key: Key): Key | null {
    const node = this.keyMap.get(key);
    let previousKey = node?.prevKey ?? null;
    while (previousKey != null) {
      const candidate = this.keyMap.get(previousKey);
      if (!candidate) break;
      if (candidate.type !== "content") {
        return candidate.key;
      }
      previousKey = candidate.prevKey ?? null;
    }
    return null;
  }

  getKeyAfter(key: Key): Key | null {
    const node = this.keyMap.get(key);
    let nextKey = node?.nextKey ?? null;
    while (nextKey != null) {
      const candidate = this.keyMap.get(nextKey);
      if (!candidate) break;
      if (candidate.type !== "content") {
        return candidate.key;
      }
      nextKey = candidate.nextKey ?? null;
    }
    return null;
  }

  getFirstKey(): Key | null {
    if (this.firstKey == null) return null;
    const candidate = this.keyMap.get(this.firstKey);
    if (candidate?.type === "content") {
      return this.getKeyAfter(candidate.key);
    }
    return this.firstKey;
  }

  getLastKey(): Key | null {
    if (this.lastKey == null) return null;
    const candidate = this.keyMap.get(this.lastKey);
    if (candidate?.type === "content") {
      return this.getKeyBefore(candidate.key);
    }
    return this.lastKey;
  }

  getChildren(key: Key): Iterable<TreeNode<T>> {
    const node = this.keyMap.get(key);
    return node?.childNodes ?? [];
  }

  getTextValue(key: Key): string {
    const node = this.keyMap.get(key);
    return node?.textValue ?? "";
  }

  getParentKey(key: Key): Key | null {
    const node = this.keyMap.get(key);
    return node?.parentKey ?? null;
  }

  [Symbol.iterator](): Iterator<TreeNode<T>> {
    return this.visibleRows[Symbol.iterator]();
  }
}

/**
 * Factory function to create a TreeCollection.
 * Useful for the collectionFactory pattern in TreeStateOptions.
 */
export function createTreeCollection<T>(
  items: TreeItemData<T>[],
  expandedKeys: Set<Key>,
): TreeCollection<T> {
  return new TreeCollection(items, expandedKeys);
}
