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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/data/useAsyncList.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/data/useListData.ts

/**
 * createAsyncList - SolidJS port of React Spectrum's useAsyncList
 *
 * Manages state for an immutable async loaded list data structure, and provides
 * convenience methods to update the data over time. Manages loading and error
 * states, pagination, and sorting.
 *
 * Ported from:
 * - packages/react-stately/src/data/useAsyncList.ts
 * - packages/react-stately/src/data/useListData.ts
 */

import { createSignal, untrack } from "solid-js";

export type Key = string | number;
export type Selection = "all" | Set<Key>;
export type LoadingState = "idle" | "loading" | "loadingMore" | "sorting" | "filtering" | "error";

export interface SortDescriptor {
  /** The key of the column to sort by. */
  column?: Key;
  /** The direction to sort by. */
  direction?: "ascending" | "descending";
}

export interface AsyncListLoadOptions<T, C> {
  /** The items currently in the list. */
  items: T[];
  /** The keys of the currently selected items in the list. */
  selectedKeys: Selection;
  /** The current sort descriptor for the list. */
  sortDescriptor?: SortDescriptor;
  /** An abort signal used to notify the load function that the request has been aborted. */
  signal: AbortSignal;
  /** The pagination cursor returned from the last page load. */
  cursor?: C;
  /** The current filter text used to perform server side filtering. */
  filterText?: string;
  /** The current loading state of the list. */
  loadingState?: LoadingState;
}

export interface AsyncListStateUpdate<T, C> {
  /** The new items to append to the list. */
  items: Iterable<T>;
  /** The keys to add to the selection. */
  selectedKeys?: Iterable<Key>;
  /** The sort descriptor to set. */
  sortDescriptor?: SortDescriptor;
  /** The pagination cursor to be used for the next page load. */
  cursor?: C;
  /** The updated filter text for the list. */
  filterText?: string;
}

export type AsyncListLoadFunction<T, C> = (
  state: AsyncListLoadOptions<T, C>,
) => AsyncListStateUpdate<T, C> | Promise<AsyncListStateUpdate<T, C>>;

export interface AsyncListOptions<T, C> {
  /** The keys for the initially selected items. */
  initialSelectedKeys?: "all" | Iterable<Key>;
  /** The initial sort descriptor. */
  initialSortDescriptor?: SortDescriptor;
  /** The initial filter text. */
  initialFilterText?: string;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that loads the data for the items in the list. */
  load: AsyncListLoadFunction<T, C>;
  /** An optional function that performs sorting. */
  sort?: AsyncListLoadFunction<T, C>;
}

export interface AsyncListData<T> {
  /** The items in the list. */
  readonly items: T[];
  /** The keys of the currently selected items in the list. */
  readonly selectedKeys: Selection;
  /** The current sort descriptor for the list. */
  readonly sortDescriptor: SortDescriptor | undefined;
  /** Whether data is currently being loaded. */
  readonly isLoading: boolean;
  /** If loading data failed, then this contains the error that occurred. */
  readonly error: Error | undefined;
  /** The current filter text. */
  readonly filterText: string;
  /** The current loading state for the list. */
  readonly loadingState: LoadingState;

  /** Reloads the data in the list. */
  reload(): void;
  /** Loads the next page of data in the list. */
  loadMore(): void;
  /** Triggers sorting for the list. */
  sort(descriptor: SortDescriptor): void;

  /** Sets the selected keys. */
  setSelectedKeys(keys: Selection): void;
  /** Sets the filter text. */
  setFilterText(filterText: string): void;

  /** Gets an item from the list by key. */
  getItem(key: Key): T | undefined;
  /** Inserts items into the list at the given index. */
  insert(index: number, ...values: T[]): void;
  /** Inserts items before a given key. */
  insertBefore(key: Key, ...values: T[]): void;
  /** Inserts items after a given key. */
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
  /** Updates an item in the list. */
  update(key: Key, newValue: T): void;
}

interface InternalState<T, C> {
  loadingState: LoadingState;
  items: T[];
  selectedKeys: Selection;
  sortDescriptor?: SortDescriptor;
  error?: Error;
  cursor?: C;
  filterText: string;
  abortController?: AbortController;
}

/**
 * Manages state for an immutable async loaded list data structure, and provides
 * convenience methods to update the data over time. Manages loading and error
 * states, pagination, and sorting.
 */
export function createAsyncList<T, C = string>(options: AsyncListOptions<T, C>): AsyncListData<T> {
  const defaultGetKey = (item: T): Key => {
    const candidate = item as { id?: Key; key?: Key };
    return candidate.id ?? candidate.key ?? String(item);
  };

  const {
    load,
    sort: sortFn,
    initialSelectedKeys,
    initialSortDescriptor,
    getKey = defaultGetKey,
    initialFilterText = "",
  } = options;

  const [state, setState] = createSignal<InternalState<T, C>>({
    loadingState: "idle",
    items: [],
    selectedKeys: initialSelectedKeys === "all" ? "all" : new Set(initialSelectedKeys || []),
    sortDescriptor: initialSortDescriptor,
    filterText: initialFilterText,
  });

  async function dispatchFetch(
    type: "loading" | "loadingMore" | "sorting" | "filtering",
    fn: AsyncListLoadFunction<T, C>,
    opts?: { sortDescriptor?: SortDescriptor; filterText?: string },
  ) {
    const abortController = new AbortController();
    const currentState = untrack(state);

    // Update to loading state
    setState((s) => {
      // Abort previous request if one is in progress
      if (s.abortController) {
        s.abortController.abort();
      }
      return {
        ...s,
        loadingState: type,
        items: type === "loading" ? [] : s.items,
        sortDescriptor: opts?.sortDescriptor ?? s.sortDescriptor,
        filterText: opts?.filterText ?? s.filterText,
        abortController,
      };
    });

    try {
      const previousFilterText = opts?.filterText ?? currentState.filterText;
      const response = await fn({
        items: currentState.items.slice(),
        selectedKeys: currentState.selectedKeys,
        sortDescriptor: opts?.sortDescriptor ?? currentState.sortDescriptor,
        signal: abortController.signal,
        cursor: type === "loadingMore" ? currentState.cursor : undefined,
        filterText: previousFilterText,
        loadingState: currentState.loadingState,
      });

      setState((s) => {
        // Ignore stale response
        if (s.abortController !== abortController) return s;

        const newItems = [...(response.items ?? [])];
        const items = type === "loadingMore" ? [...s.items, ...newItems] : newItems;

        let selectedKeys: Selection;
        if (type === "loadingMore") {
          selectedKeys =
            s.selectedKeys === "all" || response.selectedKeys === "all"
              ? "all"
              : new Set([...(s.selectedKeys as Set<Key>), ...(response.selectedKeys ?? [])]);
        } else {
          selectedKeys = response.selectedKeys
            ? response.selectedKeys === "all"
              ? "all"
              : new Set(response.selectedKeys)
            : s.selectedKeys;
        }

        return {
          ...s,
          loadingState: "idle",
          items,
          selectedKeys,
          sortDescriptor: response.sortDescriptor ?? s.sortDescriptor,
          cursor: response.cursor as C | undefined,
          filterText: response.filterText ?? s.filterText,
          error: undefined,
          abortController: undefined,
        };
      });

      // Trigger another filter if filterText changed in the response
      const responseFilterText = response.filterText ?? previousFilterText;
      if (
        responseFilterText &&
        responseFilterText !== previousFilterText &&
        !abortController.signal.aborted
      ) {
        dispatchFetch("filtering", load, { filterText: responseFilterText });
      }
    } catch (e) {
      setState((s) => {
        if (s.abortController !== abortController) return s;
        return {
          ...s,
          loadingState: "error",
          error: e as Error,
          abortController: undefined,
        };
      });
    }
  }

  // Trigger initial load immediately
  dispatchFetch("loading", load);

  return {
    get items() {
      return state().items;
    },
    get selectedKeys() {
      return state().selectedKeys;
    },
    get sortDescriptor() {
      return state().sortDescriptor;
    },
    get isLoading() {
      const ls = state().loadingState;
      return ls === "loading" || ls === "loadingMore" || ls === "sorting" || ls === "filtering";
    },
    get error() {
      return state().error;
    },
    get filterText() {
      return state().filterText;
    },
    get loadingState() {
      return state().loadingState;
    },

    reload() {
      dispatchFetch("loading", load);
    },

    loadMore() {
      const s = state();
      if (
        s.loadingState === "loading" ||
        s.loadingState === "loadingMore" ||
        s.loadingState === "filtering" ||
        s.cursor == null
      ) {
        return;
      }
      dispatchFetch("loadingMore", load);
    },

    sort(descriptor: SortDescriptor) {
      dispatchFetch("sorting", (sortFn || load) as AsyncListLoadFunction<T, C>, {
        sortDescriptor: descriptor,
      });
    },

    setSelectedKeys(keys: Selection) {
      setState((s) => ({ ...s, selectedKeys: keys }));
    },

    setFilterText(filterText: string) {
      dispatchFetch("filtering", load, { filterText });
    },

    getItem(key: Key) {
      return state().items.find((item) => getKey(item) === key);
    },

    insert(index: number, ...values: T[]) {
      setState((s) => ({
        ...s,
        items: [...s.items.slice(0, index), ...values, ...s.items.slice(index)],
      }));
    },

    insertBefore(key: Key, ...values: T[]) {
      setState((s) => {
        const index = s.items.findIndex((item) => getKey(item) === key);
        if (index === -1) return s;
        return {
          ...s,
          items: [...s.items.slice(0, index), ...values, ...s.items.slice(index)],
        };
      });
    },

    insertAfter(key: Key, ...values: T[]) {
      setState((s) => {
        const index = s.items.findIndex((item) => getKey(item) === key);
        if (index === -1) return s;
        return {
          ...s,
          items: [...s.items.slice(0, index + 1), ...values, ...s.items.slice(index + 1)],
        };
      });
    },

    append(...values: T[]) {
      setState((s) => ({ ...s, items: [...s.items, ...values] }));
    },

    prepend(...values: T[]) {
      setState((s) => ({ ...s, items: [...values, ...s.items] }));
    },

    remove(...keys: Key[]) {
      setState((s) => {
        const keySet = new Set(keys);
        const items = s.items.filter((item) => !keySet.has(getKey(item)));
        let selectedKeys = s.selectedKeys;
        if (selectedKeys !== "all") {
          const newSelection = new Set(selectedKeys);
          for (const key of keys) {
            newSelection.delete(key);
          }
          selectedKeys = newSelection;
        }
        return { ...s, items, selectedKeys };
      });
    },

    removeSelectedItems() {
      setState((s) => {
        if (s.selectedKeys === "all") {
          return { ...s, items: [], selectedKeys: new Set() };
        }
        const sel = s.selectedKeys;
        return {
          ...s,
          items: s.items.filter((item) => !sel.has(getKey(item))),
          selectedKeys: new Set(),
        };
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

    update(key: Key, newValue: T) {
      setState((s) => {
        const index = s.items.findIndex((item) => getKey(item) === key);
        if (index === -1) return s;
        return {
          ...s,
          items: [...s.items.slice(0, index), newValue, ...s.items.slice(index + 1)],
        };
      });
    },
  };
}
