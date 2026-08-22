/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/data/useTreeData.ts

/**
 * createTreeData - SolidJS port of React Spectrum's useTreeData
 *
 * Manages state for an immutable tree data structure, and provides
 * convenience methods to update the data over time.
 *
 * Ported from packages/react-stately/src/data/useTreeData.ts.
 */

import { createSignal } from "solid-js";

export type Key = string | number;
export type Selection = "all" | Set<Key>;

export interface TreeNode<T> {
  /** A unique key for the tree node. */
  key: Key;
  /** The key of the parent node. */
  parentKey: Key | null;
  /** The value object for the tree node. */
  value: T;
  /** The children of this node. */
  children: TreeNode<T>[] | null;
}

export interface TreeOptions<T> {
  /** Initial items in the tree. */
  initialItems?: T[];
  /** The keys for the initially selected items. */
  initialSelectedKeys?: "all" | Iterable<Key>;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that returns the children of an item object. */
  getChildren?: (item: T) => T[];
}

export interface TreeData<T> {
  /** The root items in the tree. */
  readonly items: TreeNode<T>[];
  /** The keys of the currently selected items in the tree. */
  readonly selectedKeys: Selection;
  /** Sets the selected keys. */
  setSelectedKeys(keys: Selection): void;
  /** Gets an item from the tree by key. */
  getItem(key: Key): TreeNode<T> | undefined;
  /** Inserts items into the tree. */
  insert(parentKey: Key | null, index: number, ...values: T[]): void;
  /** Inserts items before a given key. */
  insertBefore(key: Key, ...values: T[]): void;
  /** Inserts items after a given key. */
  insertAfter(key: Key, ...values: T[]): void;
  /** Appends items to a parent node. */
  append(parentKey: Key | null, ...values: T[]): void;
  /** Prepends items to a parent node. */
  prepend(parentKey: Key | null, ...values: T[]): void;
  /** Removes items from the tree by their keys. */
  remove(...keys: Key[]): void;
  /** Removes all items from the tree that are currently in the set of selected items. */
  removeSelectedItems(): void;
  /** Moves an item to a new parent. */
  move(key: Key, toParentKey: Key | null, index: number): void;
  /** Moves items before a given key. */
  moveBefore(key: Key, keys: Iterable<Key>): void;
  /** Moves items after a given key. */
  moveAfter(key: Key, keys: Iterable<Key>): void;
  /** Updates an item in the tree. */
  update(key: Key, newValue: T): void;
}

interface TreeDataState<T> {
  items: TreeNode<T>[];
  nodeMap: Map<Key, TreeNode<T>>;
}

/**
 * Manages state for an immutable tree data structure, and provides
 * convenience methods to update the data over time.
 */
export function createTreeData<T>(options: TreeOptions<T>): TreeData<T> {
  const defaultGetKey = (item: T): Key => {
    const candidate = item as { id?: Key; key?: Key };
    return candidate.id ?? candidate.key ?? String(item);
  };
  const defaultGetChildren = (item: T): T[] => {
    const candidate = item as { children?: T[] };
    return candidate.children ?? [];
  };

  const {
    initialItems = [],
    initialSelectedKeys,
    getKey = defaultGetKey,
    getChildren = defaultGetChildren,
  } = options;

  // Build initial tree
  const initialTree = buildTree(initialItems, new Map(), null, getKey, getChildren);

  const [treeState, setTreeState] = createSignal<TreeDataState<T>>(initialTree);
  const [selectedKeys, setSelectedKeys] = createSignal<Selection>(
    initialSelectedKeys === "all" ? "all" : new Set(initialSelectedKeys || []),
  );

  function updateTree(
    items: TreeNode<T>[],
    key: Key | null,
    update: (node: TreeNode<T>) => TreeNode<T> | null,
    originalMap: Map<Key, TreeNode<T>>,
  ): TreeDataState<T> {
    let node = key != null ? originalMap.get(key) : null;
    if (key != null && !node) return { items, nodeMap: originalMap };

    const newMap = new Map(originalMap);

    if (node) {
      const updated = update(node);
      if (!updated) {
        // Delete node
        deleteNode(node, newMap);
        if (node.parentKey != null) {
          return updateTree(
            items,
            node.parentKey,
            (parent) => ({
              ...parent,
              children: parent.children!.filter((c) => c.key !== key),
            }),
            newMap,
          );
        }
        return { items: items.filter((i) => i.key !== key), nodeMap: newMap };
      }

      newMap.set(key!, updated);
      if (updated.children) {
        for (const child of updated.children) {
          addNode(child, newMap);
        }
      }

      if (node.parentKey != null) {
        return updateTree(
          items,
          node.parentKey,
          (parent) => ({
            ...parent,
            children: parent.children!.map((c) => (c.key === key ? updated : c)),
          }),
          newMap,
        );
      }

      return { items: items.map((i) => (i.key === key ? updated : i)), nodeMap: newMap };
    }

    return { items, nodeMap: newMap };
  }

  return {
    get items() {
      return treeState().items;
    },
    get selectedKeys() {
      return selectedKeys();
    },

    setSelectedKeys(keys: Selection) {
      setSelectedKeys(keys);
    },

    getItem(key: Key) {
      return treeState().nodeMap.get(key);
    },

    insert(parentKey: Key | null, index: number, ...values: T[]) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const newMap = new Map(nodeMap);
        const newNodes = values.map((v) => {
          const tree = buildTree([v], newMap, parentKey, getKey, getChildren);
          return tree.items[0];
        });

        if (parentKey == null) {
          return {
            items: [...items.slice(0, index), ...newNodes, ...items.slice(index)],
            nodeMap: newMap,
          };
        }

        return updateTree(
          items,
          parentKey,
          (parent) => ({
            ...parent,
            children: [
              ...(parent.children || []).slice(0, index),
              ...newNodes,
              ...(parent.children || []).slice(index),
            ],
          }),
          newMap,
        );
      });
    },

    insertBefore(key: Key, ...values: T[]) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const node = nodeMap.get(key);
        if (!node) return state;

        const parent = node.parentKey != null ? nodeMap.get(node.parentKey) : null;
        const siblings = parent?.children ?? items;
        const index = siblings.findIndex((n) => n.key === key);
        if (index === -1) return state;

        const newMap = new Map(nodeMap);
        const newNodes = values.map((v) => {
          const tree = buildTree([v], newMap, node.parentKey, getKey, getChildren);
          return tree.items[0];
        });

        if (node.parentKey == null) {
          return {
            items: [...items.slice(0, index), ...newNodes, ...items.slice(index)],
            nodeMap: newMap,
          };
        }

        return updateTree(
          items,
          node.parentKey,
          (p) => ({
            ...p,
            children: [...p.children!.slice(0, index), ...newNodes, ...p.children!.slice(index)],
          }),
          newMap,
        );
      });
    },

    insertAfter(key: Key, ...values: T[]) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const node = nodeMap.get(key);
        if (!node) return state;

        const parent = node.parentKey != null ? nodeMap.get(node.parentKey) : null;
        const siblings = parent?.children ?? items;
        const index = siblings.findIndex((n) => n.key === key);
        if (index === -1) return state;

        const newMap = new Map(nodeMap);
        const newNodes = values.map((v) => {
          const tree = buildTree([v], newMap, node.parentKey, getKey, getChildren);
          return tree.items[0];
        });

        if (node.parentKey == null) {
          return {
            items: [...items.slice(0, index + 1), ...newNodes, ...items.slice(index + 1)],
            nodeMap: newMap,
          };
        }

        return updateTree(
          items,
          node.parentKey,
          (p) => ({
            ...p,
            children: [
              ...p.children!.slice(0, index + 1),
              ...newNodes,
              ...p.children!.slice(index + 1),
            ],
          }),
          newMap,
        );
      });
    },

    append(parentKey: Key | null, ...values: T[]) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const newMap = new Map(nodeMap);
        const newNodes = values.map((v) => {
          const tree = buildTree([v], newMap, parentKey, getKey, getChildren);
          return tree.items[0];
        });

        if (parentKey == null) {
          return { items: [...items, ...newNodes], nodeMap: newMap };
        }

        return updateTree(
          items,
          parentKey,
          (parent) => ({
            ...parent,
            children: [...(parent.children || []), ...newNodes],
          }),
          newMap,
        );
      });
    },

    prepend(parentKey: Key | null, ...values: T[]) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const newMap = new Map(nodeMap);
        const newNodes = values.map((v) => {
          const tree = buildTree([v], newMap, parentKey, getKey, getChildren);
          return tree.items[0];
        });

        if (parentKey == null) {
          return { items: [...newNodes, ...items], nodeMap: newMap };
        }

        return updateTree(
          items,
          parentKey,
          (parent) => ({
            ...parent,
            children: [...newNodes, ...(parent.children || [])],
          }),
          newMap,
        );
      });
    },

    remove(...keys: Key[]) {
      setTreeState((state) => {
        let { items, nodeMap } = state;
        let newMap = new Map(nodeMap);
        let newItems = items;

        for (const key of keys) {
          const result = updateTree(newItems, key, () => null, newMap);
          newItems = result.items;
          newMap = result.nodeMap;
        }

        return { items: newItems, nodeMap: newMap };
      });

      setSelectedKeys((sel) => {
        if (sel === "all") return sel;
        const newSel = new Set(sel);
        for (const key of keys) {
          newSel.delete(key);
        }
        return newSel;
      });
    },

    removeSelectedItems() {
      const sel = selectedKeys();
      if (sel === "all") {
        setTreeState({ items: [], nodeMap: new Map() });
        setSelectedKeys(new Set<Key>());
        return;
      }

      const keysToRemove = [...sel];
      setTreeState((state) => {
        let { items, nodeMap } = state;
        let newMap = new Map(nodeMap);
        let newItems = items;
        for (const key of keysToRemove) {
          const result = updateTree(newItems, key, () => null, newMap);
          newItems = result.items;
          newMap = result.nodeMap;
        }
        return { items: newItems, nodeMap: newMap };
      });
      setSelectedKeys(new Set<Key>());
    },

    move(key: Key, toParentKey: Key | null, index: number) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const node = nodeMap.get(key);
        if (!node) return state;

        // Cyclical move validation: prevent moving a node into its own subtree
        if (toParentKey != null) {
          let parent: TreeNode<T> | undefined = nodeMap.get(toParentKey);
          while (parent) {
            if (parent.key === key) return state;
            parent = parent.parentKey != null ? nodeMap.get(parent.parentKey) : undefined;
          }
        }

        // Remove the node
        let newMap = new Map(nodeMap);
        const removeResult = updateTree(items, key, () => null, newMap);
        let newItems = removeResult.items;
        newMap = removeResult.nodeMap;

        // Re-add it at the target
        const movedNode: TreeNode<T> = { ...node, parentKey: toParentKey };
        addNode(movedNode, newMap);

        if (toParentKey == null) {
          return {
            items: [...newItems.slice(0, index), movedNode, ...newItems.slice(index)],
            nodeMap: newMap,
          };
        }

        return updateTree(
          newItems,
          toParentKey,
          (parent) => ({
            ...parent,
            children: [
              ...(parent.children || []).slice(0, index),
              movedNode,
              ...(parent.children || []).slice(index),
            ],
          }),
          newMap,
        );
      });
    },

    moveBefore(key: Key, keys: Iterable<Key>) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const node = nodeMap.get(key);
        if (!node) return state;

        const toParentKey = node.parentKey ?? null;
        let parent: TreeNode<T> | null = null;
        if (toParentKey != null) {
          parent = nodeMap.get(toParentKey) ?? null;
        }
        const toIndex = parent?.children ? parent.children.indexOf(node) : items.indexOf(node);
        return moveItems(state, keys, parent, toIndex, updateTree, addNode);
      });
    },

    moveAfter(key: Key, keys: Iterable<Key>) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const node = nodeMap.get(key);
        if (!node) return state;

        const toParentKey = node.parentKey ?? null;
        let parent: TreeNode<T> | null = null;
        if (toParentKey != null) {
          parent = nodeMap.get(toParentKey) ?? null;
        }
        let toIndex = parent?.children ? parent.children.indexOf(node) : items.indexOf(node);
        toIndex++;
        return moveItems(state, keys, parent, toIndex, updateTree, addNode);
      });
    },

    update(key: Key, newValue: T) {
      setTreeState((state) => {
        const { items, nodeMap } = state;
        const newMap = new Map(nodeMap);

        return updateTree(
          items,
          key,
          (oldNode) => {
            const node: TreeNode<T> = {
              key: oldNode.key,
              parentKey: oldNode.parentKey,
              value: newValue,
              children: null,
            };
            const tree = buildTree(getChildren(newValue), newMap, node.key, getKey, getChildren);
            node.children = tree.items;
            return node;
          },
          newMap,
        );
      });
    },
  };
}

function buildTree<T>(
  items: T[],
  nodeMap: Map<Key, TreeNode<T>>,
  parentKey: Key | null,
  getKey: (item: T) => Key,
  getChildren: (item: T) => T[],
): TreeDataState<T> {
  const nodes: TreeNode<T>[] = [];

  for (const item of items) {
    const key = getKey(item);
    const children = getChildren(item);

    const childTree =
      children.length > 0
        ? buildTree(children, nodeMap, key, getKey, getChildren)
        : { items: [], nodeMap };

    const node: TreeNode<T> = {
      key,
      parentKey,
      value: item,
      children: childTree.items.length > 0 ? childTree.items : null,
    };

    nodeMap.set(key, node);
    nodes.push(node);
  }

  return { items: nodes, nodeMap };
}

function addNode<T>(node: TreeNode<T>, map: Map<Key, TreeNode<T>>): void {
  map.set(node.key, node);
  if (node.children) {
    for (const child of node.children) {
      addNode(child, map);
    }
  }
}

function deleteNode<T>(node: TreeNode<T>, map: Map<Key, TreeNode<T>>): void {
  map.delete(node.key);
  if (node.children) {
    for (const child of node.children) {
      deleteNode(child, map);
    }
  }
}

function moveItems<T>(
  state: TreeDataState<T>,
  keys: Iterable<Key>,
  toParent: TreeNode<T> | null,
  toIndex: number,
  updateTreeFn: (
    items: TreeNode<T>[],
    key: Key | null,
    update: (node: TreeNode<T>) => TreeNode<T> | null,
    originalMap: Map<Key, TreeNode<T>>,
  ) => TreeDataState<T>,
  addNodeFn: (node: TreeNode<T>, map: Map<Key, TreeNode<T>>) => void,
): TreeDataState<T> {
  const { items, nodeMap } = state;

  // Cyclical move validation: prevent moving a node into its own subtree
  const removeKeys = new Set(keys);
  let ancestor: TreeNode<T> | null = toParent;
  while (ancestor != null) {
    if (removeKeys.has(ancestor.key)) {
      throw new Error("Cannot move an item to be a child of itself.");
    }
    ancestor = ancestor.parentKey != null ? (nodeMap.get(ancestor.parentKey) ?? null) : null;
  }

  const originalToIndex = toIndex;
  const keyArray = [...removeKeys];

  // Depth-first traversal to determine in-order positions and remove items
  const inOrderKeys = new Map<Key, number>();
  const removedItems: TreeNode<T>[] = [];
  let newItems = items;
  let newMap = nodeMap;
  let i = 0;

  function traversal(
    node: { children?: TreeNode<T>[] | null },
    callbacks: {
      inorder?: (child: TreeNode<T>) => void;
      postorder?: (child: TreeNode<T>) => void;
    },
  ) {
    callbacks.inorder?.(node as TreeNode<T>);
    if (node.children) {
      for (const child of node.children) {
        traversal(child, callbacks);
        callbacks.postorder?.(child);
      }
    }
  }

  traversal(
    { children: items },
    {
      inorder(child) {
        if (keyArray.includes(child.key)) {
          inOrderKeys.set(child.key, i++);
        }
      },
      postorder(child) {
        if (keyArray.includes(child.key)) {
          removedItems.push({ ...newMap.get(child.key)!, parentKey: toParent?.key ?? null });
          const result = updateTreeFn(newItems, child.key, () => null, newMap);
          newItems = result.items;
          newMap = result.nodeMap;
        }
        // Decrement index if the removed child is in the target parent and before the target index
        if (
          (child.parentKey === toParent || child.parentKey === toParent?.key) &&
          keyArray.includes(child.key) &&
          (toParent?.children ? toParent.children.indexOf(child) : items.indexOf(child)) <
            originalToIndex
        ) {
          toIndex--;
        }
      },
    },
  );

  const inOrderItems = removedItems.sort((a, b) =>
    inOrderKeys.get(a.key)! > inOrderKeys.get(b.key)! ? 1 : -1,
  );

  // If parentKey is null, insert into the root.
  if (!toParent || toParent.key == null) {
    inOrderItems.forEach((movedNode) => {
      addNodeFn(movedNode, newMap);
    });
    return {
      items: [...newItems.slice(0, toIndex), ...inOrderItems, ...newItems.slice(toIndex)],
      nodeMap: newMap,
    };
  }

  // Otherwise, update the parent node and its ancestors.
  return updateTreeFn(
    newItems,
    toParent.key,
    (parentNode) => ({
      key: parentNode.key,
      parentKey: parentNode.parentKey,
      value: parentNode.value,
      children: [
        ...parentNode.children!.slice(0, toIndex),
        ...inOrderItems,
        ...parentNode.children!.slice(toIndex),
      ],
    }),
    newMap,
  );
}
