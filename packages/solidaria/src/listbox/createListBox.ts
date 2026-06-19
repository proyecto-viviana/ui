/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 * Based on @react-aria/listbox useListBox.
 */

import { createEffect, onCleanup, type JSX } from "solid-js";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createLabel } from "../label/createLabel";
import { createTypeSelect } from "../selection/createTypeSelect";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { isDevEnv } from "../utils/env";
import type { ListState, Key } from "@proyecto-viviana/solid-stately";

export interface AriaListBoxProps {
  /** An ID for the listbox. */
  id?: string;
  /** Whether the listbox is disabled. */
  isDisabled?: boolean;
  /** The label for the listbox. */
  label?: JSX.Element;
  /** An accessible label for the listbox when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the listbox. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the listbox. */
  "aria-describedby"?: string;
  /** Handler called when focus moves into the listbox. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler called when focus moves out of the listbox. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler called when the focus state changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler called when an item is activated (pressed). */
  onAction?: (key: Key) => void;
  /** Whether focus should automatically wrap around. */
  shouldFocusWrap?: boolean;
  /** Whether selection should occur on press up. */
  shouldSelectOnPressUp?: boolean;
  /** Whether to focus items on hover. */
  shouldFocusOnHover?: boolean;
  /**
   * Whether keyboard focus movement should also update selection in single selection mode.
   * @default true
   */
  shouldSelectOnFocus?: boolean;
  /** Whether type-to-select is disabled. @default false */
  disallowTypeAhead?: boolean;
  /**
   * The primary orientation of the items. In a horizontal listbox the Left/Right
   * arrows navigate the list (the block-axis Up/Down arrows still work); in a
   * vertical listbox Left/Right are no-ops, matching upstream's
   * `ListKeyboardDelegate` for a `stack` layout.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
  /**
   * The text direction, used to resolve the horizontal navigation axis. In a
   * horizontal listbox, RTL flips Left/Right (Right=previous, Left=next).
   * @default "ltr"
   */
  direction?: "ltr" | "rtl";
}

export interface ListBoxAria {
  /** Props for the listbox element. */
  listBoxProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the listbox's label element (if any). */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
}

// Shared data between listbox and options
const listBoxData = new WeakMap<object, ListBoxData>();

interface ListBoxData {
  id: string;
  onAction?: (key: Key) => void;
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  isDisabled?: boolean;
}

export function getListBoxData(state: ListState): ListBoxData | undefined {
  return listBoxData.get(state);
}

/**
 * Whether a key should be skipped during keyboard navigation. Disabled keys only
 * block navigation under `disabledBehavior: "all"` (the default); under
 * `"selection"` they stay focusable (selection is still blocked elsewhere).
 * Mirrors `ListKeyboardDelegate.isDisabled` in React Aria, which gates the skip
 * on the resolved `disabledBehavior` from the selection manager.
 */
function isNavigationDisabled<T>(state: ListState<T>, key: Key): boolean {
  return state.isDisabled(key) && state.disabledBehavior() === "all";
}

function findNextEnabledKey<T>(
  state: ListState<T>,
  currentKey: Key | null,
  direction: "next" | "prev",
  wrap: boolean,
): Key | null {
  const collection = state.collection();
  const getAdjacentKey =
    direction === "next"
      ? (key: Key) => collection.getKeyAfter(key)
      : (key: Key) => collection.getKeyBefore(key);
  const getBoundaryKey =
    direction === "next" ? () => collection.getFirstKey() : () => collection.getLastKey();

  let key = currentKey != null ? getAdjacentKey(currentKey) : getBoundaryKey();
  while (key != null && isNavigationDisabled(state, key)) {
    key = getAdjacentKey(key);
  }

  if (key == null && wrap) {
    key = getBoundaryKey();
    while (key != null && isNavigationDisabled(state, key)) {
      key = getAdjacentKey(key);
    }
  }

  return key;
}

/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 */
export function createListBox<T>(
  props: MaybeAccessor<AriaListBoxProps>,
  state: ListState<T>,
  _ref?: () => HTMLElement | null,
): ListBoxAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);

  // Development-time warning for missing accessibility labels
  if (isDevEnv()) {
    const p = getProps();
    if (!p.label && !p["aria-label"] && !p["aria-labelledby"]) {
      console.warn(
        "[solidaria] A ListBox requires an aria-label or aria-labelledby attribute for accessibility.",
      );
    }
  }

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  const updateSharedData = () => {
    const p = getProps();
    listBoxData.set(state, {
      id,
      onAction: p.onAction,
      shouldSelectOnPressUp: p.shouldSelectOnPressUp,
      shouldFocusOnHover: p.shouldFocusOnHover,
      isDisabled: p.isDisabled,
    });
  };

  // Ensure options created in the same render pass can read parent metadata.
  updateSharedData();

  // Share data with child options
  createEffect(() => {
    updateSharedData();

    onCleanup(() => {
      listBoxData.delete(state);
    });
  });

  // Handle focus within
  const { focusWithinProps } = createFocusWithin({
    onFocusWithin: (e) => getProps().onFocus?.(e),
    onBlurWithin: (e) => getProps().onBlur?.(e),
    onFocusWithinChange: (isFocused) => {
      getProps().onFocusChange?.(isFocused);
      state.setFocused(isFocused);
    },
  });

  // Label handling
  const { labelProps, fieldProps } = createLabel({
    get id() {
      return id;
    },
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    labelElementType: "span",
  });

  // Type-to-select
  const { typeSelectProps } = createTypeSelect({
    collection: () => state.collection(),
    focusedKey: () => state.focusedKey(),
    onFocusedKeyChange: (key) => state.setFocusedKey(key),
    isKeyDisabled: (key) => state.isDisabled(key),
    get isDisabled() {
      return getProps().disallowTypeAhead ?? false;
    },
  });

  // Keyboard navigation
  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    const p = getProps();
    if (p.isDisabled) return;

    const collection = state.collection();
    const shouldWrap = p.shouldFocusWrap ?? false;
    const shouldSelectOnFocus = p.shouldSelectOnFocus ?? true;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextKey = findNextEnabledKey(state, state.focusedKey(), "next", shouldWrap);
        if (nextKey != null) {
          state.setFocusedKey(nextKey);
          if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(nextKey);
          } else if (e.shiftKey && state.selectionMode() === "multiple") {
            state.extendSelection(nextKey, collection);
          }
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevKey = findNextEnabledKey(state, state.focusedKey(), "prev", shouldWrap);
        if (prevKey != null) {
          state.setFocusedKey(prevKey);
          if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(prevKey);
          } else if (e.shiftKey && state.selectionMode() === "multiple") {
            state.extendSelection(prevKey, collection);
          }
        }
        break;
      }
      case "ArrowRight":
      case "ArrowLeft": {
        // Horizontal orientation promotes the inline axis to the primary
        // navigation axis. Upstream's ListKeyboardDelegate strips
        // getKeyLeftOf/getKeyRightOf for a vertical stack, so Left/Right stay
        // no-ops there; in a horizontal stack they move prev/next, flipped
        // under RTL (Right=next, Left=prev in LTR).
        if (p.orientation !== "horizontal") break;
        e.preventDefault();
        const isRtl = p.direction === "rtl";
        const forward = e.key === "ArrowRight" ? !isRtl : isRtl;
        const focusedKey = state.focusedKey();
        // With nothing focused, both directions enter at the first item,
        // mirroring upstream's getFirstKey() fallback for Left and Right.
        const nextKey =
          focusedKey != null
            ? findNextEnabledKey(state, focusedKey, forward ? "next" : "prev", shouldWrap)
            : findNextEnabledKey(state, null, "next", false);
        if (nextKey != null) {
          state.setFocusedKey(nextKey);
          if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(nextKey);
          } else if (e.shiftKey && state.selectionMode() === "multiple") {
            state.extendSelection(nextKey, collection);
          }
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const firstKey = findNextEnabledKey(state, null, "next", false);
        if (firstKey != null) {
          state.setFocusedKey(firstKey);
          if (e.ctrlKey && e.shiftKey && state.selectionMode() === "multiple") {
            // Select from current to first
            state.extendSelection(firstKey, collection);
          } else if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(firstKey);
          }
        }
        break;
      }
      case "End": {
        e.preventDefault();
        const lastKey = findNextEnabledKey(state, null, "prev", false);
        if (lastKey != null) {
          state.setFocusedKey(lastKey);
          if (e.ctrlKey && e.shiftKey && state.selectionMode() === "multiple") {
            // Select from current to last
            state.extendSelection(lastKey, collection);
          } else if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(lastKey);
          }
        }
        break;
      }
      case " ":
      case "Enter": {
        e.preventDefault();
        const focusedKey = state.focusedKey();
        // Activation is gated on the navigation-disabled check, not the raw
        // one: under disabledBehavior "selection" a focusable disabled option
        // still fires onAction, mirroring useSelectableItem's allowsActions
        // (manager.isDisabled is gated on "all"). Selection stays blocked —
        // toggleSelection self-guards on the raw disabled check.
        if (focusedKey != null && !isNavigationDisabled(state, focusedKey)) {
          if (state.selectionMode() !== "none") {
            state.toggleSelection(focusedKey);
          }
          p.onAction?.(focusedKey);
        }
        break;
      }
      case "a": {
        if ((e.ctrlKey || e.metaKey) && state.selectionMode() === "multiple") {
          e.preventDefault();
          state.selectAll();
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        if (!state.disallowEmptySelection()) {
          state.clearSelection();
        }
        break;
      }
    }
  };

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get listBoxProps() {
      const p = getProps();
      const selectionMode = state.selectionMode();

      const baseProps = mergeProps(
        domProps(),
        focusWithinProps as Record<string, unknown>,
        fieldProps as Record<string, unknown>,
        {
          role: "listbox",
          tabIndex: p.isDisabled ? undefined : 0,
          "aria-disabled": p.isDisabled || undefined,
          "aria-multiselectable": selectionMode === "multiple" ? true : undefined,
          "aria-activedescendant":
            state.focusedKey() != null ? String(state.focusedKey()) : undefined,
          onKeyDown,
        },
      );

      // Add type-select props if enabled
      if (!p.disallowTypeAhead) {
        return mergeProps(
          baseProps,
          typeSelectProps as Record<string, unknown>,
        ) as JSX.HTMLAttributes<HTMLElement>;
      }

      return baseProps as JSX.HTMLAttributes<HTMLElement>;
    },
  };
}
