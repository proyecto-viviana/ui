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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/data/useListData.ts

/**
 * createListData - SolidJS port of React Spectrum's useListData
 *
 * Manages state for an immutable list data structure, and provides
 * convenience methods to update the data over time.
 *
 * Ported from packages/react-stately/src/data/useListData.ts.
 */

import { createSignal, createMemo } from "solid-js";

export type Key = string | number;
export type Selection = "all" | Set<Key>;

export interface ListOptions<T> {
  /** Initial items in the list. */
  initialItems?: T[];
  /** The keys for the initially selected items. */
  initialSelectedKeys?: "all" | Iterable<Key>;
  /** The initial text to filter the list by. */
  initialFilterText?: string;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that returns whether an item matches the current filter text. */
  filter?: (item: T, filterText: string) => boolean;
}

export interface ListData<T> {
  /** The items in the list. */
  readonly items: T[];
  /** The keys of the currently selected items in the list. */
  readonly selectedKeys: Selection;
  /** The current filter text. */
  readonly filterText: string;
  /** Sets the selected keys. */
  setSelectedKeys(keys: Selection): void;
  /** Adds the given keys to the current selected keys. */
  addKeysToSelection(keys: Selection): void;
  /** Removes the given keys from the current selected keys. */
  removeKeysFromSelection(keys: Selection): void;
  /** Sets the filter text. */
  setFilterText(filterText: string): void;
  /** Gets an item from the list by key. */
  getItem(key: Key): T | undefined;
  /** Inserts items into the list at the given index. */
  insert(index: number, ...values: T[]): void;
  /** Inserts items into the list before the item at the given key. */
  insertBefore(key: Key, ...values: T[]): void;
  /** Inserts items into the list after the item at the given key. */
  insertAfter(key: Key, ...values: T[]): void;
  /** Appends items to the list. */
  append(...values: T[]): void;
  /** Prepends items to the list. */
  prepend(...values: T[]): void;
  /** Removes items from the list by their keys. */
  remove(...keys: Key[]): void;
  /** Removes all items from the list that are currently in the set of selected items. */
  removeSelectedItems(): void;
  /** Moves an item within the list. */
  move(key: Key, toIndex: number): void;
  /** Moves one or more items before a given key. */
  moveBefore(key: Key, keys: Iterable<Key>): void;
  /** Moves one or more items after a given key. */
  moveAfter(key: Key, keys: Iterable<Key>): void;
  /** Updates an item in the list. */
  update(key: Key, newValue: T | ((prev: T) => T)): void;
}

interface ListState<T> {
  items: T[];
  selectedKeys: Selection;
  filterText: string;
}

/**
 * Manages state for an immutable list data structure, and provides
 * convenience methods to update the data over time.
 */
export function createListData<T>(options: ListOptions<T>): ListData<T> {
  const defaultGetKey = (item: T): Key => {
    const candidate = item as { id?: Key; key?: Key };
    return candidate.id ?? candidate.key ?? String(item);
  };

  const {
    initialItems = [],
    initialSelectedKeys,
    getKey = defaultGetKey,
    filter,
    initialFilterText = "",
  } = options;

  const [state, setState] = createSignal<ListState<T>>({
    items: initialItems,
    selectedKeys: initialSelectedKeys === "all" ? "all" : new Set(initialSelectedKeys || []),
    filterText: initialFilterText,
  });

  const filteredItems = createMemo(() => {
    const s = state();
    return filter ? s.items.filter((item) => filter(item, s.filterText)) : s.items;
  });

  return {
    get items() {
      return filteredItems();
    },
    get selectedKeys() {
      return state().selectedKeys;
    },
    get filterText() {
      return state().filterText;
    },

    setSelectedKeys(selectedKeys: Selection) {
      setState((s) => ({ ...s, selectedKeys }));
    },

    addKeysToSelection(selectedKeys: Selection) {
      setState((s) => {
        if (s.selectedKeys === "all") return s;
        if (selectedKeys === "all") return { ...s, selectedKeys: "all" };
        return { ...s, selectedKeys: new Set([...s.selectedKeys, ...selectedKeys]) };
      });
    },

    removeKeysFromSelection(selectedKeys: Selection) {
      setState((s) => {
        if (selectedKeys === "all") return { ...s, selectedKeys: new Set() };
        const selection: Set<Key> =
          s.selectedKeys === "all" ? new Set(s.items.map(getKey)) : new Set(s.selectedKeys);
        for (const key of selectedKeys) {
          selection.delete(key);
        }
        return { ...s, selectedKeys: selection };
      });
    },

    setFilterText(filterText: string) {
      setState((s) => ({ ...s, filterText }));
    },

    getItem(key: Key) {
      return state().items.find((item) => getKey(item) === key);
    },

    insert(index: number, ...values: T[]) {
      setState((s) => insertItems(s, index, ...values));
    },

    insertBefore(key: Key, ...values: T[]) {
      setState((s) => {
        const index = s.items.findIndex((item) => getKey(item) === key);
        if (index === -1) return s;
        return insertItems(s, index, ...values);
      });
    },

    insertAfter(key: Key, ...values: T[]) {
      setState((s) => {
        let index = s.items.findIndex((item) => getKey(item) === key);
        if (index === -1) {
          if (s.items.length === 0) {
            index = 0;
          } else {
            return s;
          }
        }
        return insertItems(s, index + 1, ...values);
      });
    },

    prepend(...values: T[]) {
      setState((s) => insertItems(s, 0, ...values));
    },

    append(...values: T[]) {
      setState((s) => insertItems(s, s.items.length, ...values));
    },

    remove(...keys: Key[]) {
      setState((s) => {
        const keySet = new Set(keys);
        const items = s.items.filter((item) => !keySet.has(getKey(item)));
        let selection: Selection = "all";
        if (s.selectedKeys !== "all") {
          selection = new Set(s.selectedKeys);
          for (const key of keys) {
            (selection as Set<Key>).delete(key);
          }
        }
        if (items.length === 0) selection = new Set();
        return { ...s, items, selectedKeys: selection };
      });
    },

    removeSelectedItems() {
      setState((s) => {
        if (s.selectedKeys === "all") {
          return { ...s, items: [], selectedKeys: new Set() };
        }
        const selectedKeys = s.selectedKeys;
        const items = s.items.filter((item) => !selectedKeys.has(getKey(item)));
        return { ...s, items, selectedKeys: new Set() };
      });
    },

    move(key: Key, toIndex: number) {
      setState((s) => {
        const index = s.items.findIndex((item) => getKey(item) === key);
        if (index === -1) return s;
        const copy = s.items.slice();
        const [item] = copy.splice(index, 1);
        copy.splice(toIndex, 0, item);
        return { ...s, items: copy };
      });
    },

    moveBefore(key: Key, keys: Iterable<Key>) {
      setState((s) => {
        const toIndex = s.items.findIndex((item) => getKey(item) === key);
        if (toIndex === -1) return s;
        const keyArray = Array.isArray(keys) ? keys : [...keys];
        const indices = keyArray
          .map((k) => s.items.findIndex((item) => getKey(item) === k))
          .sort((a, b) => a - b);
        return moveItems(s, indices, toIndex);
      });
    },

    moveAfter(key: Key, keys: Iterable<Key>) {
      setState((s) => {
        const toIndex = s.items.findIndex((item) => getKey(item) === key);
        if (toIndex === -1) return s;
        const keyArray = Array.isArray(keys) ? keys : [...keys];
        const indices = keyArray
          .map((k) => s.items.findIndex((item) => getKey(item) === k))
          .sort((a, b) => a - b);
        return moveItems(s, indices, toIndex + 1);
      });
    },

    update(key: Key, newValue: T | ((prev: T) => T)) {
      setState((s) => {
        const index = s.items.findIndex((item) => getKey(item) === key);
        if (index === -1) return s;
        const updatedValue =
          typeof newValue === "function" ? (newValue as (prev: T) => T)(s.items[index]) : newValue;
        return {
          ...s,
          items: [...s.items.slice(0, index), updatedValue, ...s.items.slice(index + 1)],
        };
      });
    },
  };
}

function insertItems<T>(state: ListState<T>, index: number, ...values: T[]): ListState<T> {
  return {
    ...state,
    items: [...state.items.slice(0, index), ...values, ...state.items.slice(index)],
  };
}

function moveItems<T>(state: ListState<T>, indices: number[], toIndex: number): ListState<T> {
  toIndex -= indices.filter((index) => index < toIndex).length;

  const moves = indices.map((from) => ({
    from,
    to: toIndex++,
  }));

  for (let i = 0; i < moves.length; i++) {
    const a = moves[i].from;
    for (let j = i; j < moves.length; j++) {
      const b = moves[j].from;
      if (b > a) moves[j].from--;
    }
  }

  for (let i = 0; i < moves.length; i++) {
    const a = moves[i];
    for (let j = moves.length - 1; j > i; j--) {
      const b = moves[j];
      if (b.from < a.to) {
        a.to++;
      } else {
        b.from++;
      }
    }
  }

  const copy = state.items.slice();
  for (const m of moves) {
    const [item] = copy.splice(m.from, 1);
    copy.splice(m.to, 0, item);
  }

  return { ...state, items: copy };
}
