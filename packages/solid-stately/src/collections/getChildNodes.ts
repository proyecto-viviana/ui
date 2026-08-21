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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/collections/getChildNodes.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/collections/getItemCount.ts

/**
 * Helpers for traversing collection nodes and comparing their document order.
 *
 * Ported from:
 * - packages/react-stately/src/collections/getChildNodes.ts
 * - packages/react-stately/src/collections/getItemCount.ts
 */

import type { Collection, CollectionNode } from "./types";

export function getChildNodes<T>(
  node: CollectionNode<T>,
  collection: Collection<T>,
): Iterable<CollectionNode<T>> {
  // New API: call collection.getChildren with the node key.
  if (typeof collection.getChildren === "function") {
    return collection.getChildren(node.key);
  }

  // Old API: access childNodes directly.
  return node.childNodes;
}

export function getFirstItem<T>(iterable: Iterable<T>): T | undefined {
  return getNthItem(iterable, 0);
}

export function getNthItem<T>(iterable: Iterable<T>, index: number): T | undefined {
  if (index < 0) {
    return undefined;
  }

  let i = 0;
  for (const item of iterable) {
    if (i === index) {
      return item;
    }

    i++;
  }
}

export function getLastItem<T>(iterable: Iterable<T>): T | undefined {
  let lastItem: T | undefined = undefined;
  for (const value of iterable) {
    lastItem = value;
  }

  return lastItem;
}

const itemCountCache = new WeakMap<Collection<unknown>, number>();

/**
 * Counts the item nodes (recursing into sections, ignoring section headers and
 * other non-item nodes) in a collection. Ported from
 * packages/react-stately/src/collections/getItemCount.ts; used by createOption to populate
 * `aria-setsize` when the listbox is virtualized. Cached per (immutable)
 * collection identity, exactly like upstream.
 */
export function getItemCount<T>(collection: Collection<T>): number {
  const cached = itemCountCache.get(collection);
  if (cached != null) {
    return cached;
  }

  let counter = 0;
  const countItems = (items: Iterable<CollectionNode<T>>) => {
    for (const item of items) {
      if (item.type === "section") {
        countItems(getChildNodes(item, collection));
      } else if (item.type === "item") {
        counter++;
      }
    }
  };

  countItems(collection);
  itemCountCache.set(collection, counter);
  return counter;
}

export function compareNodeOrder<T>(
  collection: Collection<T>,
  a: CollectionNode<T>,
  b: CollectionNode<T>,
): number {
  // If the two nodes have the same parent, compare their indices.
  if (a.parentKey === b.parentKey) {
    return a.index - b.index;
  }

  // Otherwise, collect all of the ancestors from each node, and find the first one that doesn't match starting from the root.
  // Include the base nodes in case we are comparing nodes of different levels so that we can compare the higher node to the lower level node's
  // ancestor of the same level
  const aAncestors = [...getAncestors(collection, a), a];
  const bAncestors = [...getAncestors(collection, b), b];
  const firstNonMatchingAncestor = aAncestors
    .slice(0, bAncestors.length)
    .findIndex((a, i) => a !== bAncestors[i]);
  if (firstNonMatchingAncestor !== -1) {
    // Compare the indices of two children within the common ancestor.
    a = aAncestors[firstNonMatchingAncestor];
    b = bAncestors[firstNonMatchingAncestor];
    return a.index - b.index;
  }

  // If there isn't a non matching ancestor, we might be in a case where one of the nodes is the ancestor of the other.
  if (aAncestors.findIndex((node) => node === b) >= 0) {
    return 1;
  } else if (bAncestors.findIndex((node) => node === a) >= 0) {
    return -1;
  }

  // 🤷
  return -1;
}

function getAncestors<T>(collection: Collection<T>, node: CollectionNode<T>): CollectionNode<T>[] {
  const parents: CollectionNode<T>[] = [];

  let currNode: CollectionNode<T> | null = node;
  while (currNode?.parentKey != null) {
    currNode = collection.getItem(currNode.parentKey);
    if (currNode) {
      parents.unshift(currNode);
    }
  }

  return parents;
}
