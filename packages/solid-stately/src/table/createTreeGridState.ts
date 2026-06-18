/**
 * Tree grid state management for expandable Table rows.
 * Based on @react-stately/table/useTreeGridState (the `UNSTABLE_` tree-grid feature).
 *
 * Owns the expanded-keys signal (controlled or uncontrolled), rebuilds the table
 * collection from it, and layers the expansion API on top of {@link createTableState}.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import { createTableState } from "./createTableState";
import { createTableCollection, TableCollection } from "./TableCollection";
import type { Key } from "../collections/types";
import type { TreeGridState, TreeGridStateOptions } from "./types";

/**
 * Creates state management for a tree grid (a table with expandable rows). Handles the
 * expanded rows in addition to the selection, sort and focus handled by the table state.
 */
export function createTreeGridState<
  T extends object,
  C extends TableCollection<T> = TableCollection<T>,
>(options: Accessor<TreeGridStateOptions<T, C>>): TreeGridState<T, C> {
  const getOptions = () => options();

  // Expanded keys: controlled via `UNSTABLE_expandedKeys`, otherwise the internal signal
  // seeded from `UNSTABLE_defaultExpandedKeys`.
  const [internalExpandedKeys, setInternalExpandedKeys] = createSignal<"all" | Set<Key>>(
    getInitialExpanded(getOptions().UNSTABLE_defaultExpandedKeys),
  );

  const expandedKeys = createMemo<"all" | Set<Key>>(() => {
    const controlled = getOptions().UNSTABLE_expandedKeys;
    if (controlled !== undefined) {
      return convertExpanded(controlled);
    }
    return internalExpandedKeys();
  });

  // Rebuild the tree collection whenever the expanded keys (or the data) change.
  const collection = createMemo(
    () =>
      createTableCollection<T>({
        columns: getOptions().columns,
        rows: getOptions().rows,
        getKey: getOptions().getKey,
        getTextValue: getOptions().getTextValue,
        showSelectionCheckboxes: getOptions().showSelectionCheckboxes ?? false,
        rowHeaderColumnKeys: getOptions().rowHeaderColumnKeys,
        expandedKeys: expandedKeys(),
      }) as unknown as C,
  );

  const tableState = createTableState<T, C>(() => ({
    collection: collection(),
    disabledKeys: getOptions().disabledKeys,
    focusMode: getOptions().focusMode,
    selectionMode: getOptions().selectionMode,
    selectionBehavior: getOptions().selectionBehavior,
    disallowEmptySelection: getOptions().disallowEmptySelection,
    selectedKeys: getOptions().selectedKeys,
    defaultSelectedKeys: getOptions().defaultSelectedKeys,
    onSelectionChange: getOptions().onSelectionChange,
    sortDescriptor: getOptions().sortDescriptor,
    onSortChange: getOptions().onSortChange,
    showSelectionCheckboxes: getOptions().showSelectionCheckboxes,
  }));

  const toggleKey = (key: Key) => {
    const updated = toggleExpandedKey(expandedKeys(), key, collection());

    // Only own the value when uncontrolled.
    if (getOptions().UNSTABLE_expandedKeys === undefined) {
      setInternalExpandedKeys(updated);
    }
    getOptions().UNSTABLE_onExpandedChange?.(updated);
  };

  // Layer the expansion API onto the table state object, preserving the reactive getters
  // already defined on it (spreading would eagerly evaluate them and break reactivity).
  const treeGridState = tableState as TreeGridState<T, C>;
  Object.defineProperty(treeGridState, "expandedKeys", {
    get: () => expandedKeys(),
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(treeGridState, "treeColumn", {
    get: () => collection().treeColumn ?? null,
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(treeGridState, "keyMap", {
    get: () => collection().keyMap,
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(treeGridState, "userColumnCount", {
    get: () => collection().userColumnCount,
    configurable: true,
    enumerable: true,
  });
  treeGridState.toggleKey = toggleKey;

  return treeGridState;
}

/**
 * Computes the next expanded-key set when a row is toggled. Mirrors the upstream
 * `toggleKey`: collapsing from `'all'` materialises every expandable row first.
 */
function toggleExpandedKey<T>(
  current: "all" | Set<Key>,
  key: Key,
  collection: TableCollection<T>,
): Set<Key> {
  let updated: Set<Key>;
  if (current === "all") {
    updated = new Set(
      collection.rows
        .filter((row) => row.type === "item" && row.isExpandable)
        .map((row) => row.key),
    );
    updated.delete(key);
  } else {
    updated = new Set(current);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
  }
  return updated;
}

function getInitialExpanded(defaultExpanded?: "all" | Iterable<Key>): "all" | Set<Key> {
  if (defaultExpanded === undefined) {
    return new Set();
  }
  return convertExpanded(defaultExpanded);
}

function convertExpanded(expanded: "all" | Iterable<Key>): "all" | Set<Key> {
  if (!expanded) {
    return new Set<Key>();
  }
  return expanded === "all" ? "all" : new Set(expanded);
}
