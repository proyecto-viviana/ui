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
import { createInteractionModality } from "../interactions/createInteractionModality";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createDescription } from "../utils/createDescription";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { createStringFormatter } from "../i18n";
import { getTagGroupData } from "./createTagGroup";
import { tagIntlStrings } from "./intl";
import { createGridListItem } from "../gridlist/createGridListItem";
import type { ListState, Key, GridNode } from "@proyecto-viviana/solid-stately";

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
  const cellId = createId();
  const removeButtonId = createId();

  const getData = () => getTagGroupData(state);
  const gridState = () => {
    const data = getData();
    if (!data) {
      throw new Error("createTag requires createTagGroup on the same list state.");
    }
    return data.gridState;
  };

  const { modality } = createInteractionModality();
  // useTag.ts: the row describes Delete only when removal is allowed and the
  // modality is keyboard or virtual. Virtual on a touch device is pointer.
  const descriptionProps = createDescription(() => {
    let current = modality();
    if (current === "virtual" && typeof window !== "undefined" && "ontouchstart" in window) {
      current = "pointer";
    }
    const onRemove = getData()?.onRemove;
    if (!onRemove || (current !== "keyboard" && current !== "virtual")) {
      return undefined;
    }
    return stringFormatter().format("removeDescription");
  });

  const key = () => getProps().key;

  const node = (): GridNode<unknown> => {
    const p = getProps();
    const item = state.collection().getItem(p.key);
    if (item) {
      return item as unknown as GridNode<unknown>;
    }
    // The row can render one frame after its collection node is gone.
    return {
      type: "item",
      key: p.key,
      value: null,
      textValue: p.textValue ?? "",
      level: 0,
      index: 0,
      hasChildNodes: false,
      childNodes: [],
      isDisabled: p.isDisabled,
    };
  };

  const gridItem = createGridListItem(
    () => ({
      node: node(),
      textValue: getProps().textValue,
      isDisabled: getProps().isDisabled,
      onAction: getProps().onAction,
    }),
    gridState,
    ref,
  );

  const isDisabled = createMemo(() => {
    const p = getProps();
    return p.isDisabled || state.isDisabled(key());
  });

  const isSelected = createMemo(() => state.isSelected(key()));

  // Focused means the roving key, not "the collection currently has DOM focus".
  // The container blur that follows a move onto the row must not clear the tag.
  const isFocused = createMemo(() => state.focusedKey() === key());

  const nextEnabledKey = (fromKey: Key, step: (key: Key) => Key | null): Key | null => {
    const collection = state.collection();
    let candidate = step(fromKey);
    while (candidate != null && state.isDisabled(candidate)) {
      candidate = step(candidate);
    }
    return candidate;
  };

  const removeAndRestoreFocus = (keysToRemove: Set<Key>) => {
    const data = getData();
    if (!data?.onRemove) return;
    const current = key();
    const collection = state.collection();
    let nextKey = nextEnabledKey(current, (k) => collection.getKeyAfter(k));
    if (nextKey == null) {
      nextKey = nextEnabledKey(current, (k) => collection.getKeyBefore(k));
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

  const { focusProps, isFocusVisible } = createFocusRing();

  // Compute tabIndex. Mirror useTag (vendored @react-aria/tag/src/useTag.ts):
  //   tabIndex = (!isDisabled && (isFocused || focusedKey == null)) ? 0 : -1
  // Every non-disabled row is a tab stop when nothing is focused yet (so native
  // Shift+Tab from a following element lands on the LAST row); once a key is
  // focused, only that row keeps tabIndex 0 (roving single tab stop).
  // createGridListItem's roving tabindex would leave every row at -1 until a
  // key is focused, so this override stays.
  const tabIndex = createMemo(() => {
    if (isDisabled()) return -1;
    return isFocused() || state.focusedKey() == null ? 0 : -1;
  });

  // Arrow, Home, End, Escape, and Ctrl+A belong to createGridList. The row
  // keeps Delete/Backspace removal and the #318 Tab onto the remove button.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      const row = ref();
      if (!row || e.shiftKey || isDisabled()) return;
      const removeBtn = row.querySelector<HTMLElement>("button");
      if (removeBtn && document.activeElement !== removeBtn) {
        e.preventDefault();
        removeBtn.focus();
      }
      return;
    }

    if (isDisabled()) return;
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    const data = getData();
    if (!data?.onRemove) return;
    e.preventDefault();
    if (isSelected()) {
      const selection = state.selectedKeys();
      const keysToRemove =
        selection === "all"
          ? new Set(Array.from(state.collection()).map((item) => item.key))
          : new Set(selection);
      removeAndRestoreFocus(keysToRemove);
    } else {
      removeAndRestoreFocus(new Set([key()]));
    }
  };

  const domProps = () => filterDOMProps(getProps() as unknown as Record<string, unknown>);
  const allowsRemoving = createMemo(() => !!getData()?.onRemove);
  const rootRole = createMemo(() => getProps().role ?? "option");

  return {
    get rowProps() {
      return mergeProps(
        gridItem.rowProps as Record<string, unknown>,
        domProps(),
        focusProps as Record<string, unknown>,
        descriptionProps,
        {
          role: rootRole(),
          tabIndex: tabIndex(),
          onKeyDown,
        },
      );
    },
    get gridCellProps() {
      return mergeProps(gridItem.gridCellProps as Record<string, unknown>, {
        id: cellId,
        "aria-describedby": allowsRemoving() ? removeButtonId : undefined,
      });
    },
    get removeButtonProps() {
      const rowId = (gridItem.rowProps as { id?: string }).id ?? "";
      return {
        id: removeButtonId,
        "aria-label": stringFormatter().format("removeButtonLabel"),
        "aria-labelledby": `${removeButtonId} ${rowId}`.trim(),
        isDisabled: isDisabled(),
        // Keep Removes out of the tab order. Tab from the focused row focuses
        // the button; Shift+Tab from After then lands on the row (#318).
        tabIndex: -1,
        onPress: () => {
          const data = getData();
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
      return gridItem.isPressed;
    },
  };
}
