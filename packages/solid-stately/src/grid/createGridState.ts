/**
 * Grid state management for Table and GridList components.
 * Based on @react-stately/grid/useGridState.
 */

import { createSignal, createEffect, createMemo, on, type Accessor } from "solid-js";
import type { GridState, GridStateOptions, GridCollection, GridNode } from "./types";
import type { Key, FocusStrategy } from "../collections/types";

/**
 * Creates state management for a grid component.
 * Handles row selection, focus management, and keyboard navigation state.
 */
export function createGridState<T extends object, C extends GridCollection<T> = GridCollection<T>>(
  options: Accessor<GridStateOptions<T, C>>,
): GridState<T, C> {
  const getOptions = () => options();

  const disabledKeys = createMemo(() => {
    const keys = getOptions().disabledKeys;
    return keys ? new Set(keys) : new Set<Key>();
  });

  const [isFocused, setIsFocused] = createSignal(false);
  const [focusedKey, setFocusedKeyInternal] = createSignal<Key | null>(null);
  const [childFocusStrategy, setChildFocusStrategy] = createSignal<FocusStrategy | null>(null);
  const [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = createSignal(false);

  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<"all" | Set<Key>>(
    getInitialSelection(getOptions().defaultSelectedKeys),
  );
  const [anchorKey, setAnchorKey] = createSignal<Key | null>(null);

  const selectedKeys = createMemo(() => {
    const opts = getOptions();
    if (opts.selectedKeys !== undefined) {
      return normalizeSelection(opts.selectedKeys);
    }
    return internalSelectedKeys();
  });

  const selectionMode = createMemo(() => getOptions().selectionMode ?? "none");
  const selectionBehavior = createMemo(() => getOptions().selectionBehavior ?? "toggle");
  const disallowEmptySelection = createMemo(() => getOptions().disallowEmptySelection ?? false);
  const disabledBehavior = createMemo(() => getOptions().disabledBehavior ?? "all");

  const focusMode = createMemo(() => getOptions().focusMode ?? "row");

  const setFocusedKey = (key: Key | null, strategy: FocusStrategy = "first") => {
    const opts = getOptions();
    const collection = opts.collection;

    // If focusMode is cell and an item is focused, focus a child cell instead
    if (focusMode() === "cell" && key != null) {
      const item = collection.getItem(key);
      if (item?.type === "item") {
        const children = [...collection.getChildren(key)];
        if (strategy === "last") {
          key = children[children.length - 1]?.key ?? key;
        } else {
          key = children[0]?.key ?? key;
        }
      }
    }

    setFocusedKeyInternal(key);
    setChildFocusStrategy(strategy);
  };

  // Reset focused key if the item is deleted from the collection
  let cachedCollection: C | null = null;

  createEffect(
    on(
      () => getOptions().collection,
      (collection) => {
        const currentFocusedKey = focusedKey();

        if (
          currentFocusedKey != null &&
          cachedCollection &&
          !collection.getItem(currentFocusedKey)
        ) {
          // The focused item was deleted, find a new one to focus
          const node = cachedCollection.getItem(currentFocusedKey);
          const parentNode =
            node?.parentKey != null &&
            (node.type === "cell" || node.type === "rowheader" || node.type === "column")
              ? cachedCollection.getItem(node.parentKey)
              : node;

          if (!parentNode) {
            setFocusedKeyInternal(null);
            cachedCollection = collection;
            return;
          }

          const cachedRows = cachedCollection.rows;
          const rows = collection.rows;
          const diff = cachedRows.length - rows.length;

          let index = Math.min(
            diff > 1 ? Math.max(parentNode.index - diff + 1, 0) : parentNode.index,
            rows.length - 1,
          );

          let newRow: GridNode<T> | null = null;
          while (index >= 0) {
            const row = rows[index];
            if (!disabledKeys().has(row.key) && row.type !== "headerrow") {
              newRow = row;
              break;
            }
            // Find next, not disabled row
            if (index < rows.length - 1) {
              index++;
            } else {
              // Otherwise, find previous, not disabled row
              if (index > parentNode.index) {
                index = parentNode.index;
              }
              index--;
            }
          }

          if (newRow) {
            const childNodes = newRow.hasChildNodes ? [...collection.getChildren(newRow.key)] : [];
            const keyToFocus =
              newRow.hasChildNodes && parentNode !== node && node && node.index < childNodes.length
                ? childNodes[node.index].key
                : newRow.key;
            setFocusedKeyInternal(keyToFocus);
          } else {
            setFocusedKeyInternal(null);
          }
        }

        cachedCollection = collection;
      },
    ),
  );

  // Selection methods
  const isSelected = (key: Key): boolean => {
    const keys = selectedKeys();
    if (keys === "all") return true;
    return keys.has(key);
  };

  const isDisabled = (key: Key): boolean => {
    return disabledKeys().has(key);
  };

  const updateSelection = (newSelection: "all" | Set<Key>) => {
    const opts = getOptions();

    // Controlled mode
    if (opts.selectedKeys !== undefined) {
      opts.onSelectionChange?.(newSelection);
      return;
    }

    // Uncontrolled mode
    const current = internalSelectedKeys();
    const isDifferent =
      current === "all" ||
      newSelection === "all" ||
      current.size !== (newSelection as Set<Key>).size ||
      ![...current].every((k) => (newSelection as Set<Key>).has(k));

    if (isDifferent) {
      setInternalSelectedKeys(newSelection);
      opts.onSelectionChange?.(newSelection);
    }
  };

  const toggleSelection = (key: Key) => {
    if (isDisabled(key)) return;
    if (selectionMode() === "none") return;

    const current = selectedKeys();

    if (selectionMode() === "single") {
      if (isSelected(key) && !disallowEmptySelection()) {
        updateSelection(new Set());
      } else {
        updateSelection(new Set([key]));
      }
      return;
    }

    // Multiple selection
    if (current === "all") {
      // Can't toggle when all selected without knowing all keys
      return;
    }

    const newSelection = new Set(current);
    if (newSelection.has(key)) {
      if (newSelection.size > 1 || !disallowEmptySelection()) {
        newSelection.delete(key);
      }
    } else {
      newSelection.add(key);
    }

    updateSelection(newSelection);
    setAnchorKey(key);
  };

  const replaceSelection = (key: Key) => {
    if (isDisabled(key)) return;
    if (selectionMode() === "none") return;

    updateSelection(new Set([key]));
    setAnchorKey(key);
  };

  const extendSelection = (toKey: Key) => {
    if (isDisabled(toKey)) return;
    if (selectionMode() !== "multiple") {
      replaceSelection(toKey);
      return;
    }

    const anchor = anchorKey();
    if (!anchor) {
      replaceSelection(toKey);
      return;
    }

    const collection = getOptions().collection;
    const rows = collection.rows.filter((r) => r.type === "item");
    const keys = rows.map((r) => r.key);
    const anchorIndex = keys.indexOf(anchor);
    const toIndex = keys.indexOf(toKey);

    if (anchorIndex === -1 || toIndex === -1) {
      replaceSelection(toKey);
      return;
    }

    const start = Math.min(anchorIndex, toIndex);
    const end = Math.max(anchorIndex, toIndex);
    const rangeKeys = keys.slice(start, end + 1).filter((k) => !isDisabled(k));

    updateSelection(new Set(rangeKeys));
  };

  const selectAll = () => {
    if (selectionMode() !== "multiple") return;
    updateSelection("all");
  };

  const clearSelection = () => {
    if (disallowEmptySelection()) return;
    updateSelection(new Set());
  };

  const toggleSelectAll = () => {
    if (selectionMode() !== "multiple") return;

    if (selectedKeys() === "all") {
      clearSelection();
    } else {
      selectAll();
    }
  };

  return {
    get collection() {
      return getOptions().collection;
    },
    get disabledKeys() {
      return disabledKeys();
    },
    get disabledBehavior() {
      return disabledBehavior();
    },
    get isKeyboardNavigationDisabled() {
      return isKeyboardNavigationDisabled();
    },
    get focusedKey() {
      return focusedKey();
    },
    get childFocusStrategy() {
      return childFocusStrategy();
    },
    get isFocused() {
      return isFocused();
    },
    get selectionMode() {
      return selectionMode();
    },
    get selectionBehavior() {
      return selectionBehavior();
    },
    get selectedKeys() {
      return selectedKeys();
    },
    isSelected,
    isDisabled,
    setFocusedKey,
    setFocused: setIsFocused,
    toggleSelection,
    replaceSelection,
    extendSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
    setKeyboardNavigationDisabled,
  };
}

// Helper functions
function getInitialSelection(defaultKeys?: "all" | Iterable<Key>): "all" | Set<Key> {
  if (defaultKeys === undefined) return new Set();
  return normalizeSelection(defaultKeys);
}

function normalizeSelection(keys: "all" | Iterable<Key>): "all" | Set<Key> {
  if (keys === "all") return "all";
  return new Set(keys);
}
