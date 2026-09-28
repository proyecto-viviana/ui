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

import { createEffect, createMemo, createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createId } from "@proyecto-viviana/solid-stately";
import type { GridState, GridCollection, Key } from "@proyecto-viviana/solid-stately";
import type { GridProps, GridAria, KeyboardDelegate } from "./types";
import { GridKeyboardDelegate } from "./GridKeyboardDelegate";
import { createStringFormatter, useLocale } from "../i18n";
import { announce } from "../live-announcer";
import { createDescription, type DescriptionProps } from "../utils/createDescription";
import { createInteractionModality } from "../interactions/createInteractionModality";
import { gridIntlStrings } from "./intl";

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

type SelectionValue = "all" | Set<Key>;

interface AnnouncementItem {
  readonly key: Key;
  readonly type?: string;
  readonly textValue?: string;
  readonly isDisabled?: boolean;
  readonly props?: object;
}

interface GridAnnouncementState {
  readonly collection: {
    getItem(key: Key): AnnouncementItem | null | undefined;
    getTextValue?(key: Key): string;
    readonly rows?: readonly AnnouncementItem[];
    getKeys?(): Iterable<Key>;
  };
  readonly disabledKeys: { has(key: Key): boolean };
  readonly isFocused: boolean;
  readonly selectionMode: "none" | "single" | "multiple";
  readonly selectionBehavior: "replace" | "toggle";
  readonly selectedKeys: SelectionValue | undefined;
}

function isSelectionValue(value: unknown): value is SelectionValue {
  return value === "all" || value instanceof Set;
}

function sameSelection(a: SelectionValue | undefined, b: SelectionValue | undefined): boolean {
  if (a === b) return true;
  if (a == null || b == null || a === "all" || b === "all") return false;
  if (a.size !== b.size) return false;
  for (const key of a) {
    if (!b.has(key)) return false;
  }
  return true;
}

function diffSelection(
  next: SelectionValue | undefined,
  prev: SelectionValue | undefined,
): Set<Key> {
  const result = new Set<Key>();
  if (next == null || prev == null || next === "all" || prev === "all") return result;
  for (const key of next) {
    if (!prev.has(key)) result.add(key);
  }
  return result;
}

function firstKeyOf(keys: Set<Key>): Key | undefined {
  for (const key of keys) return key;
  return undefined;
}

function propsDisabled(node: AnnouncementItem): boolean {
  const props = node.props as { isDisabled?: boolean } | undefined;
  return props?.isDisabled === true;
}

/** Selectable item keys represented by an `"all"` selection. */
function keysWhenAll(state: GridAnnouncementState): Set<Key> {
  const keys = new Set<Key>();
  if (state.selectionMode === "none") return keys;
  const add = (node: AnnouncementItem | null | undefined) => {
    if (!node || node.type !== "item") return;
    if (state.disabledKeys.has(node.key) || node.isDisabled || propsDisabled(node)) return;
    keys.add(node.key);
  };
  const rows = state.collection.rows;
  if (rows) {
    for (const row of rows) add(row);
    return keys;
  }
  const getKeys = state.collection.getKeys;
  if (getKeys) {
    for (const key of getKeys()) add(state.collection.getItem(key));
  }
  return keys;
}

function rowText(
  state: GridAnnouncementState,
  key: Key,
  getRowText: ((key: Key) => string) | undefined,
): string | undefined {
  if (getRowText) return getRowText(key);
  return state.collection.getTextValue?.(key) ?? state.collection.getItem(key)?.textValue;
}

/**
 * Touch hint for replace-mode collections that also have item actions.
 * Port of react-aria `useHighlightSelectionDescription`. Not a package export.
 */
export function createHighlightSelectionDescription(options: {
  selectionMode: Accessor<"none" | "single" | "multiple">;
  selectionBehavior: Accessor<"replace" | "toggle">;
  hasItemActions: Accessor<boolean>;
}): DescriptionProps {
  const stringFormatter = createStringFormatter(gridIntlStrings, "@react-aria/grid");
  const { modality } = createInteractionModality();
  const description = (): string | undefined => {
    const current = modality();
    const shouldLongPress =
      (current === "pointer" || current === "virtual" || current == null) &&
      typeof window !== "undefined" &&
      "ontouchstart" in window;
    if (
      !shouldLongPress ||
      options.selectionBehavior() !== "replace" ||
      options.selectionMode() === "none" ||
      !options.hasItemActions()
    ) {
      return undefined;
    }
    return stringFormatter().format("longPressToSelect");
  };
  return createDescription(description);
}

/**
 * Announces selection changes that grid screen readers miss.
 * Port of react-aria `useGridSelectionAnnouncement`. Not a package export.
 */
export function createGridSelectionAnnouncement(
  state: Accessor<GridAnnouncementState>,
  getRowText?: Accessor<((key: Key) => string) | undefined>,
): void {
  const stringFormatter = createStringFormatter(gridIntlStrings, "@react-aria/grid");
  let lastSelection: SelectionValue | undefined;
  let skipInitial = true;

  const announceChange = () => {
    const current = state();
    const selection = current.selectedKeys;
    if (!isSelectionValue(selection)) return;
    // Not focused: remember the selection and stay quiet. A press often
    // selects and then focuses on the next frame; the caller waits for that.
    if (!current.isFocused || sameSelection(selection, lastSelection)) {
      lastSelection = selection;
      return;
    }

    const previous = lastSelection;
    const added = diffSelection(selection, previous);
    const removed = diffSelection(previous, selection);
    const selected = selection === "all" ? keysWhenAll(current) : selection;
    const readRowText = getRowText?.();
    const format = stringFormatter();
    const messages: string[] = [];

    if (selected.size === 1 && current.selectionBehavior === "replace") {
      const key = firstKeyOf(selected);
      if (key != null && current.collection.getItem(key)) {
        const text = rowText(current, key, readRowText);
        if (text) messages.push(format.format("selectedItem", { item: text }));
      }
    } else if (added.size === 1 && removed.size === 0) {
      const key = firstKeyOf(added);
      if (key != null) {
        const text = rowText(current, key, readRowText);
        if (text) messages.push(format.format("selectedItem", { item: text }));
      }
    } else if (removed.size === 1 && added.size === 0) {
      const key = firstKeyOf(removed);
      if (key != null && current.collection.getItem(key)) {
        const text = rowText(current, key, readRowText);
        if (text) messages.push(format.format("deselectedItem", { item: text }));
      }
    }

    // Count every multi-select change except the first item added to an empty selection.
    if (current.selectionMode === "multiple") {
      const lastSize = previous != null && previous !== "all" ? previous.size : 0;
      if (
        messages.length === 0 ||
        selection === "all" ||
        selection.size > 1 ||
        previous === "all" ||
        lastSize > 1
      ) {
        messages.push(
          selection === "all"
            ? format.format("selectedAll")
            : format.format("selectedCount", { count: selection.size }),
        );
      }
    }

    if (messages.length > 0) announce(messages.join(" "));
    lastSelection = selection;
  };

  // useUpdateEffect skips the mount pass. Later selection changes announce
  // immediately while focused, or one frame later so pointer selection that
  // focuses on press is still spoken.
  createEffect(
    () => {
      const current = state();
      const selection = current.selectedKeys;
      return {
        selection: isSelectionValue(selection) ? selection : undefined,
        isFocused: current.isFocused,
      };
    },
    (snapshot) => {
      if (skipInitial) {
        skipInitial = false;
        lastSelection = snapshot.selection;
        return;
      }
      if (snapshot.isFocused || typeof requestAnimationFrame !== "function") {
        announceChange();
        return;
      }
      const frame = requestAnimationFrame(() => {
        announceChange();
      });
      return () => cancelAnimationFrame(frame);
    },
  );
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

  // useGrid.ts calls both. getRowText is optional and already on the upstream props.
  const descriptionProps = createHighlightSelectionDescription({
    selectionMode: () => state().selectionMode,
    selectionBehavior: () => state().selectionBehavior,
    hasItemActions: () => !!(props().onRowAction || props().onCellAction),
  });
  createGridSelectionAnnouncement(
    state,
    () => (props() as GridProps & { getRowText?: (key: Key) => string }).getRowText,
  );

  const gridProps = createMemo(() => {
    const p = props();
    const s = state();

    const baseProps: Record<string, unknown> = {
      role: "grid",
      id,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": descriptionProps["aria-describedby"] ?? p["aria-describedby"],
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
