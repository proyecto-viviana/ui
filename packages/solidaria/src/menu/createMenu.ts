/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 * Based on @react-aria/menu useMenu.
 */

import { createEffect, onCleanup, type JSX, type Accessor } from "solid-js";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createLabel } from "../label/createLabel";
import { createTypeSelect } from "../selection/createTypeSelect";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { isDevEnv } from "../utils/env";
import type { MenuState, Key, Collection } from "@proyecto-viviana/solid-stately";

/**
 * Default number of items to skip for page up/down when DOM measurement is not available.
 */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Find the next non-disabled key in a collection.
 */
function findNextNonDisabledKey<T>(
  collection: Collection<T>,
  currentKey: Key | null,
  direction: "next" | "prev",
  isDisabled: (key: Key) => boolean,
  wrap: boolean,
): Key | null {
  const getNextKey =
    direction === "next"
      ? (key: Key) => collection.getKeyAfter(key)
      : (key: Key) => collection.getKeyBefore(key);

  const getFirstKey =
    direction === "next" ? () => collection.getFirstKey() : () => collection.getLastKey();

  let nextKey = currentKey != null ? getNextKey(currentKey) : getFirstKey();

  // Skip disabled keys
  while (nextKey != null && isDisabled(nextKey)) {
    nextKey = getNextKey(nextKey);
  }

  // If we've reached the end and wrapping is enabled
  if (nextKey == null && wrap) {
    nextKey = getFirstKey();
    // Skip disabled keys from the start
    while (nextKey != null && isDisabled(nextKey)) {
      nextKey = getNextKey(nextKey);
    }
  }

  return nextKey;
}

export interface AriaMenuProps {
  /** An ID for the menu. */
  id?: string;
  /** Whether the menu is disabled. */
  isDisabled?: boolean;
  /** The label for the menu. */
  label?: JSX.Element;
  /** An accessible label for the menu when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the menu. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the menu. */
  "aria-describedby"?: string;
  /** Handler called when focus moves into the menu. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler called when focus moves out of the menu. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler called when the focus state changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler called when an item is activated (pressed). */
  onAction?: (key: Key) => void;
  /** Handler called when the menu should close. */
  onClose?: () => void;
  /** Whether focus should automatically wrap around. */
  shouldFocusWrap?: boolean;
  /** Whether to auto-focus the first item when the menu opens. */
  autoFocus?: boolean | "first" | "last";
  /** Whether type-to-select is disabled. @default false */
  disallowTypeAhead?: boolean;
}

export interface MenuAria {
  /** Props for the menu element. */
  menuProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the menu's label element (if any). */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
}

// Shared data between menu and menu items
const menuData = new WeakMap<object, MenuData>();

interface MenuData {
  id: string;
  onAction?: (key: Key) => void;
  onClose?: () => void;
  isDisabled?: boolean;
}

export function getMenuData(state: MenuState): MenuData | undefined {
  return menuData.get(state);
}

/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 */
export function createMenu<T>(
  props: MaybeAccessor<AriaMenuProps>,
  state: MenuState<T>,
  ref?: Accessor<HTMLElement | null>,
): MenuAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);

  // Development-time warning for missing accessibility labels
  if (isDevEnv()) {
    const p = getProps();
    if (!p.label && !p["aria-label"] && !p["aria-labelledby"]) {
      console.warn(
        "[solidaria] A Menu requires an aria-label or aria-labelledby attribute for accessibility.",
      );
    }
  }

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  const updateSharedData = () => {
    const p = getProps();
    menuData.set(state, {
      id,
      onAction: p.onAction,
      onClose: p.onClose,
      isDisabled: p.isDisabled,
    });
  };

  // Ensure menu items created in the same render pass can read parent metadata.
  updateSharedData();

  // Share data with child menu items
  createEffect(() => {
    updateSharedData();

    onCleanup(() => {
      menuData.delete(state);
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
    if (getProps().isDisabled) return;

    const collection = state.collection();
    const p = getProps();
    const wrap = p.shouldFocusWrap ?? false;

    // Use state.isDisabled which properly checks the disabledKeys accessor
    const isDisabled = (key: Key) => state.isDisabled(key);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const currentKey = state.focusedKey();
        const nextKey = findNextNonDisabledKey(collection, currentKey, "next", isDisabled, wrap);
        if (nextKey != null) {
          state.setFocusedKey(nextKey);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const currentKey = state.focusedKey();
        const prevKey = findNextNonDisabledKey(collection, currentKey, "prev", isDisabled, wrap);
        if (prevKey != null) {
          state.setFocusedKey(prevKey);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        // Find first non-disabled key
        let firstKey = collection.getFirstKey();
        while (firstKey != null && isDisabled(firstKey)) {
          firstKey = collection.getKeyAfter(firstKey);
        }
        if (firstKey != null) {
          state.setFocusedKey(firstKey);
        }
        break;
      }
      case "End": {
        e.preventDefault();
        // Find last non-disabled key
        let lastKey = collection.getLastKey();
        while (lastKey != null && isDisabled(lastKey)) {
          lastKey = collection.getKeyBefore(lastKey);
        }
        if (lastKey != null) {
          state.setFocusedKey(lastKey);
        }
        break;
      }
      case " ":
      case "Enter": {
        e.preventDefault();
        const focusedKey = state.focusedKey();
        // Don't activate disabled items
        if (focusedKey != null && !isDisabled(focusedKey)) {
          state.select(focusedKey, e, collection);
          p.onAction?.(focusedKey);
          p.onClose?.();
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        p.onClose?.();
        break;
      }
      case "PageDown": {
        e.preventDefault();
        const currentKey = state.focusedKey();
        const el = ref?.();

        if (el) {
          // Use DOM measurements to calculate how many items fit in a page
          const visibleHeight = el.clientHeight;
          let traveled = 0;
          let targetKey = currentKey;

          while (targetKey != null && traveled < visibleHeight) {
            const nextKey = collection.getKeyAfter(targetKey);
            if (nextKey == null) break;

            // Try to measure the item height
            const itemElement = el.querySelector(`[data-key="${targetKey}"]`);
            traveled += itemElement?.clientHeight ?? 32;

            // Skip disabled items
            if (!isDisabled(nextKey)) {
              targetKey = nextKey;
            } else {
              // Skip over disabled items without counting them
              const afterDisabled = findNextNonDisabledKey(
                collection,
                nextKey,
                "next",
                isDisabled,
                false,
              );
              if (afterDisabled != null) {
                targetKey = afterDisabled;
              } else {
                break;
              }
            }
          }

          if (targetKey != null && targetKey !== currentKey) {
            state.setFocusedKey(targetKey);
          }
        } else {
          // Fallback: move by DEFAULT_PAGE_SIZE items
          let count = DEFAULT_PAGE_SIZE;
          let targetKey = currentKey;

          while (count > 0 && targetKey != null) {
            const nextKey = findNextNonDisabledKey(
              collection,
              targetKey,
              "next",
              isDisabled,
              false,
            );
            if (nextKey == null) break;
            targetKey = nextKey;
            count--;
          }

          if (targetKey != null) {
            state.setFocusedKey(targetKey);
          }
        }
        break;
      }
      case "PageUp": {
        e.preventDefault();
        const currentKey = state.focusedKey();
        const el = ref?.();

        if (el) {
          // Use DOM measurements to calculate how many items fit in a page
          const visibleHeight = el.clientHeight;
          let traveled = 0;
          let targetKey = currentKey;

          while (targetKey != null && traveled < visibleHeight) {
            const prevKey = collection.getKeyBefore(targetKey);
            if (prevKey == null) break;

            // Try to measure the item height
            const itemElement = el.querySelector(`[data-key="${targetKey}"]`);
            traveled += itemElement?.clientHeight ?? 32;

            // Skip disabled items
            if (!isDisabled(prevKey)) {
              targetKey = prevKey;
            } else {
              // Skip over disabled items without counting them
              const beforeDisabled = findNextNonDisabledKey(
                collection,
                prevKey,
                "prev",
                isDisabled,
                false,
              );
              if (beforeDisabled != null) {
                targetKey = beforeDisabled;
              } else {
                break;
              }
            }
          }

          if (targetKey != null && targetKey !== currentKey) {
            state.setFocusedKey(targetKey);
          }
        } else {
          // Fallback: move by DEFAULT_PAGE_SIZE items
          let count = DEFAULT_PAGE_SIZE;
          let targetKey = currentKey;

          while (count > 0 && targetKey != null) {
            const prevKey = findNextNonDisabledKey(
              collection,
              targetKey,
              "prev",
              isDisabled,
              false,
            );
            if (prevKey == null) break;
            targetKey = prevKey;
            count--;
          }

          if (targetKey != null) {
            state.setFocusedKey(targetKey);
          }
        }
        break;
      }
    }
  };

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get menuProps() {
      const p = getProps();

      const baseProps = mergeProps(
        domProps(),
        focusWithinProps as Record<string, unknown>,
        fieldProps as Record<string, unknown>,
        {
          role: "menu",
          tabIndex: p.isDisabled ? undefined : 0,
          "aria-disabled": p.isDisabled || undefined,
          onKeyDown,
        } as Record<string, unknown>,
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
