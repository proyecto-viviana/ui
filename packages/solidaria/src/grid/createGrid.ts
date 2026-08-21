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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/grid/useGrid.ts

/**
 * createGrid - Provides accessibility for a grid component.
 * Based on @react-aria/grid/useGrid.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { GridState, GridCollection, Key } from "@proyecto-viviana/solid-stately";
import type { GridProps, GridAria, KeyboardDelegate } from "./types";
import { GridKeyboardDelegate } from "./GridKeyboardDelegate";
import { useLocale } from "../i18n";

// Global map to store grid metadata for child components
const gridMap = new WeakMap<
  object,
  {
    keyboardDelegate: KeyboardDelegate;
    actions: { onRowAction?: (key: Key) => void; onCellAction?: (key: Key) => void };
    shouldSelectOnPressUp?: boolean;
  }
>();

/**
 * Get the grid metadata for child components.
 */
export function getGridData<T>(state: GridState<T, GridCollection<T>>) {
  return gridMap.get(state);
}

/**
 * Creates accessibility props for a grid component.
 * A grid displays data in rows and columns and enables navigation via arrow keys.
 */
export function createGrid<T extends object>(
  props: Accessor<GridProps>,
  state: Accessor<GridState<T, GridCollection<T>>>,
  ref: Accessor<HTMLElement | null>,
): GridAria {
  const id = createId(props().id);
  const locale = useLocale();

  // Track focused state
  const [_isFocused, setIsFocused] = createSignal(false);

  // Create keyboard delegate
  const keyboardDelegate = createMemo(() => {
    const p = props();
    const s = state();

    if (p.keyboardDelegate) {
      return p.keyboardDelegate;
    }

    return new GridKeyboardDelegate({
      collection: s.collection,
      disabledKeys: s.disabledKeys,
      ref,
      focusMode: p.focusMode ?? "row",
      direction: locale().direction,
    });
  });

  // Store metadata for child components
  const storeGridData = () => {
    const s = state();
    const p = props();
    gridMap.set(s, {
      keyboardDelegate: keyboardDelegate(),
      actions: {
        onRowAction: p.onRowAction,
        onCellAction: p.onCellAction,
      },
      shouldSelectOnPressUp: p.shouldSelectOnPressUp,
    });
  };

  // Update grid data whenever state changes
  createMemo(() => {
    storeGridData();
  });

  // Keyboard navigation handler
  const onKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const p = props();
    const delegate = keyboardDelegate();

    if (s.isKeyboardNavigationDisabled) {
      return;
    }

    const focusedKey = s.focusedKey;
    if (focusedKey == null) {
      // If nothing is focused, focus the first item
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
        const firstKey = delegate.getFirstKey?.();
        if (firstKey != null) {
          e.preventDefault();
          s.setFocusedKey(firstKey);
        }
      }
      return;
    }

    let nextKey: Key | null = null;

    switch (e.key) {
      case "ArrowDown":
        nextKey = delegate.getKeyBelow?.(focusedKey) ?? null;
        break;
      case "ArrowUp":
        nextKey = delegate.getKeyAbove?.(focusedKey) ?? null;
        break;
      case "ArrowLeft":
        nextKey = delegate.getKeyLeftOf?.(focusedKey) ?? null;
        break;
      case "ArrowRight":
        nextKey = delegate.getKeyRightOf?.(focusedKey) ?? null;
        break;
      case "Home":
        if (e.ctrlKey) {
          nextKey = delegate.getFirstKey?.() ?? null;
        } else {
          // Go to first cell in row - for now just use first key
          nextKey = delegate.getFirstKey?.(focusedKey) ?? null;
        }
        break;
      case "End":
        if (e.ctrlKey) {
          nextKey = delegate.getLastKey?.() ?? null;
        } else {
          // Go to last cell in row - for now just use last key
          nextKey = delegate.getLastKey?.(focusedKey) ?? null;
        }
        break;
      case "PageDown":
        nextKey = delegate.getKeyPageBelow?.(focusedKey) ?? null;
        break;
      case "PageUp":
        nextKey = delegate.getKeyPageAbove?.(focusedKey) ?? null;
        break;
      case "Escape":
        if (p.escapeKeyBehavior !== "none") {
          s.clearSelection();
        }
        return;
      case "a":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (s.selectionMode === "multiple") {
            s.selectAll();
          }
        }
        return;
      case " ":
      case "Enter":
        e.preventDefault();
        // Toggle selection or trigger action
        if (s.selectionMode !== "none") {
          if (e.shiftKey && s.selectionMode === "multiple") {
            s.extendSelection(focusedKey);
          } else {
            s.toggleSelection(focusedKey);
          }
        }
        return;
      default:
        // Type to select
        if (!p.disallowTypeAhead && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const key = delegate.getKeyForSearch?.(e.key, focusedKey);
          if (key != null) {
            e.preventDefault();
            s.setFocusedKey(key);
          }
        }
        return;
    }

    if (nextKey != null) {
      e.preventDefault();
      s.setFocusedKey(nextKey);

      // Handle shift+arrow for range selection
      if (e.shiftKey && s.selectionMode === "multiple") {
        s.extendSelection(nextKey);
      }
    }
  };

  // Focus handling
  const onFocus = (e: FocusEvent) => {
    const s = state();
    const el = ref();

    if (!el?.contains(e.target as Element)) {
      return;
    }

    if (!s.isFocused) {
      s.setFocused(true);
      setIsFocused(true);

      // If no key is focused, focus the first one
      if (s.focusedKey == null) {
        const firstKey = keyboardDelegate().getFirstKey?.();
        if (firstKey != null) {
          s.setFocusedKey(firstKey);
        }
      }
    }
  };

  const onBlur = (e: FocusEvent) => {
    const s = state();
    const el = ref();

    // Only blur if focus is leaving the grid entirely
    if (el && !el.contains(e.relatedTarget as Element)) {
      s.setFocused(false);
      setIsFocused(false);
    }
  };

  // Warn if no label is provided
  createMemo(() => {
    const p = props();
    if (!p["aria-label"] && !p["aria-labelledby"]) {
      console.warn("Grid: An aria-label or aria-labelledby prop is required for accessibility.");
    }
  });

  const gridProps = createMemo(() => {
    const p = props();
    const s = state();

    const baseProps: Record<string, unknown> = {
      role: "grid",
      id,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      "aria-multiselectable": s.selectionMode === "multiple" ? "true" : undefined,
      tabIndex: s.collection.size === 0 ? 0 : -1,
      onKeyDown,
      onFocus,
      onBlur,
    };

    if (p.isVirtualized) {
      baseProps["aria-rowcount"] = s.collection.rowCount;
      baseProps["aria-colcount"] = s.collection.columnCount;
    }

    return baseProps as JSX.HTMLAttributes<HTMLElement>;
  });

  return {
    get gridProps() {
      return gridProps();
    },
  };
}
