/**
 * createTree - Provides accessibility for a tree component.
 * Based on @react-aria/tree/useTree.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { TreeState, TreeCollection, Key } from "@proyecto-viviana/solid-stately";
import type { AriaTreeProps, TreeAria } from "./types";

/**
 * Metadata stored for a tree instance.
 */
interface TreeData {
  /** The generated ID for the tree. */
  treeId: string;
  /** Actions registered for the tree. */
  actions: {
    onAction?: (key: Key) => void;
  };
}

/**
 * WeakMap to store tree data for child components to access.
 */
const treeDataMap = new WeakMap<object, TreeData>();

/**
 * Gets the tree data for a given state.
 */
export function getTreeData<T extends object, C extends TreeCollection<T>>(
  state: TreeState<T, C>,
): TreeData | undefined {
  return treeDataMap.get(state);
}

/**
 * Whether a key should be skipped during keyboard navigation. Disabled keys only
 * block navigation under `disabledBehavior: "all"` (the default); under
 * `"selection"` they remain focusable (selection is still blocked elsewhere).
 * Mirrors `ListKeyboardDelegate.isDisabled` in React Aria.
 */
function isNavigationDisabled<T extends object, C extends TreeCollection<T>>(
  state: TreeState<T, C>,
  key: Key,
): boolean {
  return state.isDisabled(key) && state.disabledBehavior === "all";
}

/**
 * Walks from `startKey` via `step` until reaching a key that is navigable (not
 * disabled for navigation), mirroring React Aria's
 * `ListKeyboardDelegate.findNextNonDisabled`. `getFirstKey`/`getLastKey` and the
 * next/previous lookups all funnel through this so arrow keys, Home and End land
 * on enabled rows only.
 */
function findNextNavigableKey<T extends object, C extends TreeCollection<T>>(
  state: TreeState<T, C>,
  startKey: Key | null,
  step: (key: Key) => Key | null,
): Key | null {
  let key = startKey;
  while (key != null && isNavigationDisabled(state, key)) {
    key = step(key);
  }
  return key;
}

/**
 * Creates accessibility props for a tree.
 */
export function createTree<T extends object, C extends TreeCollection<T> = TreeCollection<T>>(
  props: Accessor<AriaTreeProps>,
  state: Accessor<TreeState<T, C>>,
  _ref: Accessor<HTMLDivElement | null>,
): TreeAria {
  // Generate a unique ID for the tree
  const treeId = props().id ?? createId();

  // Store tree data for child components
  const treeData: TreeData = {
    treeId,
    actions: {
      get onAction() {
        return props().onAction;
      },
    },
  };

  // Store in WeakMap using the state as key
  treeDataMap.set(state(), treeData);

  // Handle keyboard navigation
  const onKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const p = props();
    const collection = s.collection;
    const focusedKey = s.focusedKey;
    const direction = p.direction ?? "ltr";
    // In RTL, ArrowLeft expands and ArrowRight collapses (opposite of LTR)
    const expandKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const collapseKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";

    if (p.isDisabled) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextKey =
          focusedKey != null
            ? findNextNavigableKey(s, collection.getKeyAfter(focusedKey), (k) =>
                collection.getKeyAfter(k),
              )
            : findNextNavigableKey(s, collection.getFirstKey(), (k) => collection.getKeyAfter(k));
        if (nextKey != null) {
          s.setFocusedKey(nextKey);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevKey =
          focusedKey != null
            ? findNextNavigableKey(s, collection.getKeyBefore(focusedKey), (k) =>
                collection.getKeyBefore(k),
              )
            : findNextNavigableKey(s, collection.getLastKey(), (k) => collection.getKeyBefore(k));
        if (prevKey != null) {
          s.setFocusedKey(prevKey);
        }
        break;
      }
      case "ArrowRight":
      case "ArrowLeft": {
        e.preventDefault();
        if (focusedKey != null) {
          const node = collection.getItem(focusedKey);
          if (e.key === expandKey) {
            // Expand or move to first child
            if (node?.isExpandable) {
              if (!s.isExpanded(focusedKey)) {
                s.expandKey(focusedKey);
              } else {
                const children = [...collection.getChildren(focusedKey)];
                if (children.length > 0) {
                  s.setFocusedKey(children[0].key);
                }
              }
            }
          } else if (e.key === collapseKey) {
            // Collapse or move to parent
            if (node?.isExpandable && s.isExpanded(focusedKey)) {
              s.collapseKey(focusedKey);
            } else if (node?.parentKey != null) {
              s.setFocusedKey(node.parentKey);
            }
          }
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const firstKey = findNextNavigableKey(s, collection.getFirstKey(), (k) =>
          collection.getKeyAfter(k),
        );
        if (firstKey != null) {
          s.setFocusedKey(firstKey);
        }
        break;
      }
      case "End": {
        e.preventDefault();
        const lastKey = findNextNavigableKey(s, collection.getLastKey(), (k) =>
          collection.getKeyBefore(k),
        );
        if (lastKey != null) {
          s.setFocusedKey(lastKey);
        }
        break;
      }
      case "a":
      case "A": {
        if ((e.ctrlKey || e.metaKey) && s.selectionMode === "multiple") {
          e.preventDefault();
          s.selectAll();
        }
        break;
      }
      case " ":
      case "Space":
      case "Spacebar": {
        if (focusedKey != null && s.selectionMode !== "none" && !s.isDisabled(focusedKey)) {
          e.preventDefault();
          s.toggleSelection(focusedKey);
        }
        break;
      }
      case "Enter": {
        // Activation is gated on the navigation-disabled check, not the raw
        // one: under disabledBehavior "selection" a focusable disabled row
        // still fires onAction, mirroring useSelectableItem's allowsActions
        // (manager.isDisabled is gated on "all"). Selection (Space) stays
        // blocked independently.
        if (focusedKey != null && !isNavigationDisabled(s, focusedKey)) {
          e.preventDefault();
          p.onAction?.(focusedKey);
        }
        break;
      }
      case "Escape": {
        if (s.selectionMode !== "none") {
          e.preventDefault();
          s.clearSelection();
        }
        break;
      }
      case "*": {
        // Expand all siblings at current level
        e.preventDefault();
        if (focusedKey != null) {
          const node = collection.getItem(focusedKey);
          if (node) {
            // Find all siblings at the same level
            const parentKey = node.parentKey;
            let siblings: Key[];
            if (parentKey != null) {
              siblings = [...collection.getChildren(parentKey)].map((n) => n.key);
            } else {
              // Root level siblings
              siblings = collection.rows.filter((n) => n.level === 0).map((n) => n.key);
            }
            // Expand all expandable siblings
            for (const siblingKey of siblings) {
              const sibling = collection.getItem(siblingKey);
              if (sibling?.isExpandable && !s.isExpanded(siblingKey)) {
                s.expandKey(siblingKey);
              }
            }
          }
        }
        break;
      }
    }
  };

  const onFocus = () => {
    const s = state();
    s.setFocused(true);

    // If nothing is focused, focus the first navigable item
    if (s.focusedKey == null) {
      const firstKey = findNextNavigableKey(s, s.collection.getFirstKey(), (k) =>
        s.collection.getKeyAfter(k),
      );
      if (firstKey != null) {
        s.setFocusedKey(firstKey);
      }
    }
  };

  const onBlur = () => {
    const s = state();
    s.setFocused(false);
  };

  const treeProps = createMemo(() => {
    const p = props();
    const s = state();

    const baseProps: Record<string, unknown> = {
      role: "treegrid",
      id: treeId,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      "aria-multiselectable": s.selectionMode === "multiple" ? true : undefined,
      "aria-disabled": p.isDisabled || undefined,
      tabIndex: p.isDisabled ? undefined : 0,
      onKeyDown,
      onFocus,
      onBlur,
    };

    // Add row count for virtualized trees
    if (p.isVirtualized) {
      baseProps["aria-rowcount"] = s.collection.rowCount;
    }

    return baseProps as JSX.HTMLAttributes<HTMLDivElement>;
  });

  return {
    get treeProps() {
      return treeProps();
    },
  };
}
