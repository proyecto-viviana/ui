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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tag/useTag.ts

/**
 * Tag hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a tag component.
 * Tags are individual items within a TagGroup.
 *
 * Based on @react-aria/tag useTag
 */

import { createMemo } from "solid-js";
import { createFocusRing } from "../interactions/createFocusRing";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { createStringFormatter } from "../i18n";
import { getTagGroupData } from "./createTagGroup";
import { tagIntlStrings } from "./intl";
import { createSelectableItem, type SelectableItemState } from "../selection/createSelectableItem";
import type { ListState, Key } from "@proyecto-viviana/solid-stately";

export interface AriaTagProps {
  /** The unique key for this tag. */
  key: Key;
  /** The role for the tag root. Components use row semantics inside a grid. */
  role?: "option" | "row";
  /** Whether the tag is disabled. */
  isDisabled?: boolean;
  /** A text value for the tag used for accessibility. */
  textValue?: string;
  /** Handler called when the tag is activated (Enter, or press when selectionMode is none). */
  onAction?: () => void;
}

export interface TagAria {
  /** Props for the tag row element. */
  rowProps: Record<string, unknown>;
  /** Props for the tag cell element. */
  gridCellProps: Record<string, unknown>;
  /** Props for the tag remove button. */
  removeButtonProps: Record<string, unknown>;
  /** Whether the tag can be removed. */
  allowsRemoving: boolean;
  /** Whether the tag is selected. */
  isSelected: boolean;
  /** Whether the tag is disabled. */
  isDisabled: boolean;
  /** Whether the tag is focused. */
  isFocused: boolean;
  /** Whether the tag is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the tag is pressed. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a tag component.
 * Tags are individual items within a TagGroup.
 */
export function createTag<T>(
  props: MaybeAccessor<AriaTagProps>,
  state: ListState<T>,
  ref: () => HTMLElement | null,
): TagAria {
  const getProps = () => access(props);
  const stringFormatter = createStringFormatter(tagIntlStrings, "@react-aria/tag");
  const rowId = createId();
  const cellId = createId();
  const removeButtonId = createId();

  // Get shared data from tag group
  const getData = () => getTagGroupData(state);

  // Get key
  const key = () => getProps().key;

  // Compute states
  const isDisabled = createMemo(() => {
    const p = getProps();
    return p.isDisabled || state.isDisabled(key());
  });

  const isSelected = createMemo(() => {
    return state.isSelected(key());
  });

  const isSelectable = createMemo(() => state.selectionMode() !== "none");

  const isFocused = createMemo(() => {
    return state.focusedKey() === key();
  });

  const getFirstFocusableKey = (): Key | null => {
    const collection = state.collection();
    let candidate = collection.getFirstKey();
    while (candidate != null && state.isDisabled(candidate)) {
      candidate = collection.getKeyAfter(candidate);
    }
    return candidate;
  };

  const getLastFocusableKey = (): Key | null => {
    const collection = state.collection();
    let candidate = collection.getLastKey();
    while (candidate != null && state.isDisabled(candidate)) {
      candidate = collection.getKeyBefore(candidate);
    }
    return candidate;
  };

  const getNextFocusableKey = (fromKey: Key): Key | null => {
    const collection = state.collection();
    let candidate = collection.getKeyAfter(fromKey);
    while (candidate != null && state.isDisabled(candidate)) {
      candidate = collection.getKeyAfter(candidate);
    }

    if (candidate != null) {
      return candidate;
    }

    return getFirstFocusableKey();
  };

  const getPreviousFocusableKey = (fromKey: Key): Key | null => {
    const collection = state.collection();
    let candidate = collection.getKeyBefore(fromKey);
    while (candidate != null && state.isDisabled(candidate)) {
      candidate = collection.getKeyBefore(candidate);
    }

    if (candidate != null) {
      return candidate;
    }

    return getLastFocusableKey();
  };

  const focusKey = (nextKey: Key | null) => {
    if (nextKey == null) {
      return;
    }

    state.setFocusedKey(nextKey);
    const currentElement = ref();

    if (!currentElement) {
      return;
    }

    if (nextKey === key()) {
      currentElement.focus();
      return;
    }

    const tagList = currentElement.parentElement;
    if (!tagList) {
      return;
    }

    const nextTag = Array.from(
      tagList.querySelectorAll<HTMLElement>('[role="option"], [role="row"]'),
    ).find((el) => el.getAttribute("data-key") === String(nextKey));

    nextTag?.focus();
    // RAC useGridList selectOnFocus when selectionBehavior is replace.
    if (
      nextKey != null &&
      state.selectionManager.selectionMode !== "none" &&
      state.selectionManager.selectionBehavior === "replace"
    ) {
      state.selectionManager.replaceSelection(nextKey);
    }
  };

  const removeAndRestoreFocus = (keysToRemove: Set<Key>) => {
    const data = getData();
    if (!data?.onRemove) return;
    const current = key();
    let nextKey = getNextFocusableKey(current);
    if (nextKey === current) {
      nextKey = getPreviousFocusableKey(current);
    }
    if (nextKey === current) {
      nextKey = null;
    }
    data.onRemove(keysToRemove);
    if (nextKey == null) {
      state.setFocusedKey(null);
      return;
    }
    // The removed node blurs the grid (`setFocused(false)`) and Solid may
    // reconcile the remaining rows in this turn. Restore after that commit so
    // the next tag is in the DOM and collection-is-focused is true again.
    queueMicrotask(() => {
      state.setFocused(true);
      state.setFocusedKey(nextKey);
      const nextTag = document.querySelector<HTMLElement>(
        `[data-key="${CSS.escape(String(nextKey))}"]`,
      );
      nextTag?.focus();
    });
  };

  const selectableItem = createSelectableItem(
    () => ({
      key: key(),
      id: rowId,
      isDisabled: isDisabled(),
      onAction: getProps().onAction,
    }),
    state as SelectableItemState<T>,
    ref,
  );

  const { focusProps, isFocusVisible } = createFocusRing();

  // Compute tabIndex. Mirror useTag (vendored @react-aria/tag/src/useTag.ts):
  //   tabIndex = (!isDisabled && (isFocused || focusedKey == null)) ? 0 : -1
  // Every non-disabled row is a tab stop when nothing is focused yet (so native
  // Shift+Tab from a following element lands on the LAST row); once a key is
  // focused, only that row keeps tabIndex 0 (roving single tab stop).
  const tabIndex = createMemo(() => {
    if (isDisabled()) return -1;
    return isFocused() || state.focusedKey() == null ? 0 : -1;
  });

  // Handle keyboard for navigation and removal
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isDisabled()) return;

    // A TagGroup is inherently horizontal (useTagGroup passes
    // `orientation: 'horizontal'` to the ListKeyboardDelegate), so the inline
    // (Left/Right) axis is the navigation axis and flips under RTL, while the
    // block (Up/Down) axis stays DOM-ordered. Mirror ListKeyboardDelegate:
    // getKeyRightOf = rtl ? previous : next; getKeyLeftOf = rtl ? next : previous;
    // getKeyBelow/Above are never direction-flipped.
    const isRtl = getData()?.direction === "rtl";

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusKey(isRtl ? getPreviousFocusableKey(key()) : getNextFocusableKey(key()));
        return;
      case "ArrowLeft":
        e.preventDefault();
        focusKey(isRtl ? getNextFocusableKey(key()) : getPreviousFocusableKey(key()));
        return;
      case "ArrowDown":
        e.preventDefault();
        focusKey(getNextFocusableKey(key()));
        return;
      case "ArrowUp":
        e.preventDefault();
        focusKey(getPreviousFocusableKey(key()));
        return;
      case "Home":
        e.preventDefault();
        focusKey(getFirstFocusableKey());
        return;
      case "End":
        e.preventDefault();
        focusKey(getLastFocusableKey());
        return;
      case "Tab": {
        // RAC keyboardNavigationBehavior "tab": Tab from the row focuses the
        // Remove button (which stays tabIndex=-1 so Shift+Tab from After lands
        // on the focused row, not every Remove). Tab from Remove leaves the grid.
        const row = ref();
        if (!row || e.shiftKey) return;
        const removeBtn = row.querySelector<HTMLElement>("button");
        if (removeBtn && document.activeElement !== removeBtn) {
          e.preventDefault();
          removeBtn.focus();
        }
        return;
      }
      case "Escape":
        if (state.selectionMode() !== "none") {
          e.preventDefault();
          state.clearSelection();
        }
        return;
      case "a":
      case "A":
        if ((e.ctrlKey || e.metaKey) && state.selectionMode() === "multiple") {
          e.preventDefault();
          state.selectAll();
        }
        return;
      default:
        break;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      const data = getData();
      if (data?.onRemove) {
        // Remove selected keys if this tag is selected, otherwise just this tag
        if (isSelected()) {
          const selection = state.selectedKeys();
          const keysToRemove =
            selection === "all"
              ? new Set(Array.from(state.collection()).map((item) => (item as { key: Key }).key))
              : new Set(selection);
          removeAndRestoreFocus(keysToRemove);
        } else {
          removeAndRestoreFocus(new Set([key()]));
        }
      }
    }
  };

  // Filter DOM props
  const domProps = () => filterDOMProps(getProps() as unknown as Record<string, unknown>);

  // Check if removal is allowed
  const allowsRemoving = createMemo(() => {
    const data = getData();
    return !!data?.onRemove;
  });

  const rootRole = createMemo(() => getProps().role ?? "option");

  return {
    get rowProps() {
      return mergeProps(
        domProps(),
        selectableItem.itemProps as Record<string, unknown>,
        focusProps as Record<string, unknown>,
        {
          id: rowId,
          role: rootRole(),
          tabIndex: tabIndex(),
          "data-key": String(key()),
          "aria-label": getProps().textValue,
          "aria-selected": isSelectable() ? isSelected() : undefined,
          "aria-disabled": isDisabled() || undefined,
          onKeyDown: handleKeyDown,
        },
      );
    },
    get gridCellProps() {
      return {
        id: cellId,
        role: "gridcell",
        "aria-describedby": allowsRemoving() ? removeButtonId : undefined,
      };
    },
    get removeButtonProps() {
      const data = getData();
      return {
        id: removeButtonId,
        "aria-label": stringFormatter().format("removeButtonLabel"),
        "aria-labelledby": `${removeButtonId} ${rowId}`,
        isDisabled: isDisabled(),
        // Keep Removes out of the tab order. Tab from the focused row focuses
        // the button; Shift+Tab from After then lands on the row (#318).
        tabIndex: -1,
        onPress: () => {
          if (data?.onRemove && !isDisabled()) {
            removeAndRestoreFocus(new Set([key()]));
          }
        },
      };
    },
    get allowsRemoving() {
      return allowsRemoving();
    },
    get isSelected() {
      return isSelected();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
    get isPressed() {
      return selectableItem.isPressed();
    },
  };
}
