/**
 * Tree state management for Tree components.
 * Based on @react-stately/tree/useTreeState.
 *
 * Manages expansion state, selection, and focus for hierarchical tree data.
 */

import { createSignal, createEffect, createMemo, on, type Accessor } from "solid-js";
import type { TreeState, TreeStateOptions, TreeCollection, TreeNode } from "./types";
import type { Key, FocusStrategy } from "../collections/types";

/**
 * Creates state management for a tree component.
 * Handles expansion, selection, focus management, and keyboard navigation state.
 */
export function createTreeState<T extends object, C extends TreeCollection<T> = TreeCollection<T>>(
  options: Accessor<TreeStateOptions<T, C>>,
): TreeState<T, C> {
  const getOptions = () => options();

  // Disabled keys as a Set
  const disabledKeys = createMemo(() => {
    const keys = getOptions().disabledKeys;
    return keys ? new Set(keys) : new Set<Key>();
  });

  // Expansion state (uncontrolled)
  const [internalExpandedKeys, setInternalExpandedKeys] = createSignal<Set<Key>>(
    getInitialExpandedKeys(getOptions().defaultExpandedKeys),
  );

  // Computed expanded keys (controlled or uncontrolled)
  const expandedKeys = createMemo(() => {
    const opts = getOptions();
    if (opts.expandedKeys !== undefined) {
      return new Set(opts.expandedKeys);
    }
    return internalExpandedKeys();
  });

  // Collection - rebuilt when expanded keys change
  const collection = createMemo(() => {
    const opts = getOptions();
    return opts.collectionFactory(expandedKeys());
  });

  // Focus state
  const [isFocused, setIsFocused] = createSignal(false);
  const [focusedKey, setFocusedKeyInternal] = createSignal<Key | null>(null);
  const [childFocusStrategy, setChildFocusStrategy] = createSignal<FocusStrategy | null>(null);
  const [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = createSignal(false);

  // Selection state
  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<"all" | Set<Key>>(
    getInitialSelection(getOptions().defaultSelectedKeys),
  );
  const [anchorKey, setAnchorKey] = createSignal<Key | null>(null);

  // Computed selection
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

  // Set focused key
  const setFocusedKey = (key: Key | null, strategy: FocusStrategy = "first") => {
    setFocusedKeyInternal(key);
    setChildFocusStrategy(strategy);
  };

  // Reset focused key if the item is removed from visible collection
  let cachedCollection: C | null = null;

  createEffect(
    on(collection, (coll) => {
      const currentFocusedKey = focusedKey();

      if (currentFocusedKey != null && cachedCollection) {
        // Check if the focused item is still visible
        const visibleKeys = [...coll.getKeys()];
        if (!visibleKeys.includes(currentFocusedKey)) {
          // The focused item was collapsed or removed, find a new one to focus
          // Try to find the parent and focus it
          const node = cachedCollection.getItem(currentFocusedKey);
          if (node?.parentKey != null) {
            const parent = coll.getItem(node.parentKey);
            if (parent && visibleKeys.includes(parent.key)) {
              setFocusedKeyInternal(parent.key);
              cachedCollection = coll;
              return;
            }
          }

          // Otherwise, find the nearest visible sibling or previous item
          const rows = coll.rows;
          if (rows.length > 0) {
            // Find the closest item to where the focused item was
            const cachedNode = cachedCollection.getItem(currentFocusedKey);
            if (cachedNode?.rowIndex !== undefined) {
              const newIndex = Math.min(cachedNode.rowIndex, rows.length - 1);
              const newNode = rows[newIndex];
              if (newNode && !disabledKeys().has(newNode.key)) {
                setFocusedKeyInternal(newNode.key);
                cachedCollection = coll;
                return;
              }
            }
            // Fall back to first non-disabled item
            for (const row of rows) {
              if (!disabledKeys().has(row.key)) {
                setFocusedKeyInternal(row.key);
                break;
              }
            }
          } else {
            setFocusedKeyInternal(null);
          }
        }
      }

      cachedCollection = coll;
    }),
  );

  // Selection methods
  const isSelected = (key: Key): boolean => {
    const keys = selectedKeys();
    if (keys === "all") return true;
    return keys.has(key);
  };

  const isDisabled = (key: Key): boolean => {
    return disabledKeys().has(key) || collection().getItem(key)?.isDisabled === true;
  };

  const isExpanded = (key: Key): boolean => {
    return expandedKeys().has(key);
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
    if (isDisabled(key) && disabledBehavior() === "all") return;
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
    if (isDisabled(key) && disabledBehavior() === "all") return;
    if (selectionMode() === "none") return;

    updateSelection(new Set([key]));
    setAnchorKey(key);
  };

  const extendSelection = (toKey: Key) => {
    if (isDisabled(toKey) && disabledBehavior() === "all") return;
    if (selectionMode() !== "multiple") {
      replaceSelection(toKey);
      return;
    }

    const anchor = anchorKey();
    if (!anchor) {
      replaceSelection(toKey);
      return;
    }

    const coll = collection();
    const rows = coll.rows.filter((r) => r.type === "item");
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

  // Expansion methods
  const updateExpandedKeys = (newKeys: Set<Key>) => {
    const opts = getOptions();

    // Controlled mode
    if (opts.expandedKeys !== undefined) {
      opts.onExpandedChange?.(newKeys);
      return;
    }

    // Uncontrolled mode
    setInternalExpandedKeys(newKeys);
    opts.onExpandedChange?.(newKeys);
  };

  const toggleKey = (key: Key) => {
    const node = collection().getItem(key);
    if (!node || !node.isExpandable) return;
    if (isDisabled(key) && disabledBehavior() === "all") return;

    const current = expandedKeys();
    const newKeys = new Set(current);

    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }

    updateExpandedKeys(newKeys);
  };

  const expandKey = (key: Key) => {
    const node = collection().getItem(key);
    if (!node || !node.isExpandable) return;
    if (isDisabled(key) && disabledBehavior() === "all") return;

    const current = expandedKeys();
    if (current.has(key)) return;

    const newKeys = new Set(current);
    newKeys.add(key);
    updateExpandedKeys(newKeys);
  };

  const collapseKey = (key: Key) => {
    const node = collection().getItem(key);
    if (!node || !node.isExpandable) return;
    if (isDisabled(key) && disabledBehavior() === "all") return;

    const current = expandedKeys();
    if (!current.has(key)) return;

    const newKeys = new Set(current);
    newKeys.delete(key);
    updateExpandedKeys(newKeys);
  };

  const setExpandedKeys = (keys: Set<Key>) => {
    updateExpandedKeys(keys);
  };

  return {
    get collection() {
      return collection();
    },
    get disabledKeys() {
      return disabledKeys();
    },
    get expandedKeys() {
      return expandedKeys();
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
    isExpanded,
    setFocusedKey,
    setFocused: setIsFocused,
    toggleSelection,
    replaceSelection,
    extendSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
    toggleKey,
    expandKey,
    collapseKey,
    setExpandedKeys,
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

function getInitialExpandedKeys(defaultKeys?: Iterable<Key>): Set<Key> {
  if (defaultKeys === undefined) return new Set();
  return new Set(defaultKeys);
}
