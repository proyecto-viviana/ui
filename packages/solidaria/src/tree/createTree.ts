/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tree/useTree.ts

/**
 * createTree - Provides accessibility for a tree component.
 * Based on @react-aria/tree/useTree.
 */

import { createEffect, createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { TreeState, TreeCollection, Key, Collection } from "@proyecto-viviana/solid-stately";
import type { AriaTreeProps, TreeAria } from "./types";
import { scrollIntoViewport } from "../utils";
import { getInteractionModality } from "../interactions/createInteractionModality";
import { mergeProps } from "../utils/mergeProps";
import { createTypeSelect } from "../selection/createTypeSelect";

/**
 * Metadata stored for a tree instance.
 */
interface TreeData {
  /** The generated ID for the tree. */
  treeId: string;
  /** How keyboard navigation behaves within row children. */
  keyboardNavigationBehavior: "arrow" | "tab";
  /** Text direction for row-child arrow navigation and tree expansion keys. */
  direction: "ltr" | "rtl";
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
  ref: Accessor<HTMLDivElement | null>,
): TreeAria {
  // Generate a unique ID for the tree
  const treeId = props().id ?? createId();

  // Store tree data for child components
  const treeData: TreeData = {
    treeId,
    get keyboardNavigationBehavior() {
      return props().keyboardNavigationBehavior ?? "arrow";
    },
    get direction() {
      return props().direction ?? "ltr";
    },
    actions: {
      get onAction() {
        return props().onAction;
      },
    },
  };

  // Store in WeakMap using the state as key
  treeDataMap.set(state(), treeData);

  const { typeSelectProps } = createTypeSelect({
    collection: () => state().collection as unknown as Collection<T>,
    focusedKey: () => state().focusedKey,
    onFocusedKeyChange: (key) => state().setFocusedKey(key),
    isKeyDisabled: (key) => isNavigationDisabled(state(), key),
  });

  const restoreFocusedRow = (key: Key | null) => {
    if (key == null) return;
    queueMicrotask(() => {
      state().setFocused(true);
      const el = ref();
      const target = el?.querySelector<HTMLElement>(`[data-key="${CSS.escape(String(key))}"]`);
      target?.focus();
    });
  };

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
          if (e.shiftKey) {
            s.extendSelection(nextKey);
          }
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
          if (e.shiftKey) {
            s.extendSelection(prevKey);
          }
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
                restoreFocusedRow(focusedKey);
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
              restoreFocusedRow(focusedKey);
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
      // Space (selection) and Enter (action) are intentionally absent here.
      // Upstream's useSelectableCollection leaves activation to useSelectableItem.
      // The focus effect below moves DOM focus onto the focused row, so the row's
      // own createSelectableItem handlers receive those keys without duplicating
      // work in the bubbling tree handler.
      case "Escape": {
        if (s.selectionMode !== "none") {
          e.preventDefault();
          s.clearSelection();
        }
        break;
      }
    }
  };

  // The first / last SELECTED key in flattened (visible) order — mirrors React
  // Aria's `SelectionManager.firstSelectedKey`/`lastSelectedKey`, which entry
  // focus prefers over the first/last row.
  const firstSelectedKey = (s: TreeState<T, C>): Key | null => {
    let key = s.collection.getFirstKey();
    while (key != null) {
      if (s.isSelected(key)) return key;
      key = s.collection.getKeyAfter(key);
    }
    return null;
  };
  const lastSelectedKey = (s: TreeState<T, C>): Key | null => {
    let key = s.collection.getLastKey();
    while (key != null) {
      if (s.isSelected(key)) return key;
      key = s.collection.getKeyBefore(key);
    }
    return null;
  };

  // Entry focus is handled on `focusin` (BUBBLING) rather than `focus`
  // (non-bubbling): React Aria's `useSelectableCollection.onFocus` bubbles, so a
  // Shift+Tab that the browser parks on a tabbable descendant (e.g. a selection
  // checkbox, which is `tabIndex=0` like upstream) still reaches the collection
  // and is redirected to the focused/selected row. A Solid non-bubbling `focus`
  // handler on the treegrid only fires for forward Tab (the container is the first
  // tab stop) and would strand backward entry on the last checkbox — the same
  // trampoline gotcha the TagGroup port hit. See `createListBox.onListBoxFocus`.
  const onFocusIn = (e: FocusEvent) => {
    const s = state();
    s.setFocused(true);

    const currentTarget = e.currentTarget as Element | null;
    const relatedTarget = e.relatedTarget as Element | null;
    // Internal roving moves (focus already inside the tree) are driven by
    // `onKeyDown`; only seed focus when it enters from OUTSIDE the treegrid.
    if (!currentTarget || (relatedTarget && currentTarget.contains(relatedTarget))) {
      return;
    }

    let key = s.focusedKey;
    if (key == null) {
      // Shift+Tab backward into the tree (focus arrived from a FOLLOWING element)
      // enters at the last selected row, else the last navigable row; forward Tab
      // enters at the first selected row, else the first navigable row.
      const backward =
        !!relatedTarget &&
        !!(currentTarget.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING);
      key = backward
        ? (lastSelectedKey(s) ??
          findNextNavigableKey(s, s.collection.getLastKey(), (k) => s.collection.getKeyBefore(k)))
        : (firstSelectedKey(s) ??
          findNextNavigableKey(s, s.collection.getFirstKey(), (k) => s.collection.getKeyAfter(k)));
    }
    if (key != null) {
      s.setFocusedKey(key);
    }
  };

  const onFocusOut = (e: FocusEvent) => {
    const s = state();
    const currentTarget = e.currentTarget as Element | null;
    const relatedTarget = e.relatedTarget as Element | null;
    // Only clear the focused flag once focus has left the treegrid entirely.
    if (!currentTarget || !relatedTarget || !currentTarget.contains(relatedTarget)) {
      s.setFocused(false);
    }
  };

  createEffect(() => {
    const s = state();
    const key = s.focusedKey;
    const el = ref();
    if (!el || key == null) {
      return;
    }

    const active = document.activeElement;
    if (!active || (active !== el && !el.contains(active))) {
      return;
    }

    const target = el.querySelector<HTMLElement>(`[data-key="${key}"]`);
    if (target && target !== active) {
      target.focus();

      if (getInteractionModality() !== "pointer") {
        scrollIntoViewport(target, { containingElement: el });
      }
    }
  });

  const treeProps = createMemo(() => {
    const p = props();
    const s = state();

    const baseProps: Record<string, unknown> = mergeProps(
      typeSelectProps as Record<string, unknown>,
      {
        role: "treegrid",
        id: treeId,
        "aria-label": p["aria-label"],
        "aria-labelledby": p["aria-labelledby"],
        "aria-describedby": p["aria-describedby"],
        "aria-multiselectable": s.selectionMode === "multiple" ? true : undefined,
        "aria-disabled": p.isDisabled || undefined,
        // Roving container tab stop: `0` while no row is focused (Tab enters the
        // tree), `-1` once a row takes focus (the row holds the tab stop). Mirrors
        // `useSelectableCollection` `tabIndex = focusedKey == null ? 0 : -1`.
        tabIndex: p.isDisabled ? undefined : s.focusedKey == null ? 0 : -1,
        onKeyDown,
        onFocusIn,
        onFocusOut,
      },
    );

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
