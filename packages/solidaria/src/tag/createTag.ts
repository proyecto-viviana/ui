/**
 * Tag hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a tag component.
 * Tags are individual items within a TagGroup.
 *
 * Based on @react-aria/tag useTag
 */

import { createMemo } from "solid-js";
import { createFocusable } from "../interactions/createFocusable";
import { createPress } from "../interactions/createPress";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { getTagGroupData } from "./createTagGroup";
import type { ListState, Key } from "@proyecto-viviana/solid-stately";

export interface AriaTagProps {
  /** The unique key for this tag. */
  key: Key;
  /** Whether the tag is disabled. */
  isDisabled?: boolean;
  /** A text value for the tag used for accessibility. */
  textValue?: string;
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

    const nextTag = Array.from(tagList.querySelectorAll<HTMLElement>('[role="row"]')).find(
      (el) => el.getAttribute("data-key") === String(nextKey),
    );

    nextTag?.focus();
  };

  // Handle press for selection
  const { pressProps, isPressed } = createPress({
    isDisabled,
    onPress: () => {
      if (!isDisabled()) {
        state.setFocusedKey(key());
        state.toggleSelection(key());
      }
    },
  });

  // Handle focusable
  const { focusableProps } = createFocusable(
    {
      isDisabled,
      onFocus: () => {
        state.setFocusedKey(key());
      },
    },
    ref,
  );

  // Handle keyboard for navigation and removal
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isDisabled()) return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusKey(getNextFocusableKey(key()));
        return;
      case "ArrowLeft":
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
          data.onRemove(keysToRemove);
        } else {
          data.onRemove(new Set([key()]));
        }
      }
    }
  };

  // Compute tabIndex
  const tabIndex = createMemo(() => {
    if (isDisabled()) return -1;

    if (isFocused()) {
      return 0;
    }

    if (state.focusedKey() !== null) {
      return -1;
    }

    const collection = state.collection();
    let defaultTabStop: Key | null = null;

    if (state.selectionMode() !== "none") {
      for (const item of collection) {
        if (!state.isDisabled(item.key) && state.isSelected(item.key)) {
          defaultTabStop = item.key;
          break;
        }
      }
    }

    if (defaultTabStop == null) {
      defaultTabStop = getFirstFocusableKey();
    }

    if (key() === defaultTabStop) {
      return 0;
    }

    return -1;
  });

  // Filter DOM props
  const domProps = () => filterDOMProps(getProps() as unknown as Record<string, unknown>);

  // Check if removal is allowed
  const allowsRemoving = createMemo(() => {
    const data = getData();
    return !!data?.onRemove;
  });

  return {
    get rowProps() {
      return mergeProps(
        domProps(),
        focusableProps as Record<string, unknown>,
        pressProps as Record<string, unknown>,
        {
          id: rowId,
          role: "row",
          tabIndex: tabIndex(),
          "data-key": String(key()),
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
        "aria-label": "Remove",
        "aria-labelledby": `${removeButtonId} ${rowId}`,
        isDisabled: isDisabled(),
        onPress: () => {
          if (data?.onRemove && !isDisabled()) {
            data.onRemove(new Set([key()]));
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
    get isPressed() {
      return isPressed();
    },
  };
}
