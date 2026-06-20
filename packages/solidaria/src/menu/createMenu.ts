/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 * Based on @react-aria/menu useMenu.
 */

import { createEffect, onCleanup, type JSX, type Accessor } from "solid-js";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createLabel } from "../label/createLabel";
import { createTypeSelect } from "../selection/createTypeSelect";
import { selectItem } from "../selection/selectItem";
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

export interface AriaMenuProps<T = unknown> {
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
  onAction?: (key: Key, value: T) => void;
  /** Handler called when the menu should close. */
  onClose?: () => void;
  /** Whether the menu should close when an item is selected. */
  shouldCloseOnSelect?: boolean;
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
  // Type-erased like upstream menu/utils.ts MenuData (value: any): the WeakMap
  // is keyed by an untyped state, so the item value flows through as unknown.
  onAction?: (key: Key, value: unknown) => void;
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
  props: MaybeAccessor<AriaMenuProps<T>>,
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
      onAction: p.onAction as MenuData["onAction"],
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

    // Disabled keys only block keyboard navigation under disabledBehavior "all"
    // (the default); under "selection" they stay focusable while their selection
    // remains blocked. Mirrors ListKeyboardDelegate.isDisabled in React Aria,
    // which gates the navigation skip on the resolved disabledBehavior.
    const isDisabled = (key: Key) => state.isDisabled(key) && state.disabledBehavior() === "all";

    switch (e.key) {
      case "ArrowDown": {
        // Only consume the key once a target exists, mirroring
        // useSelectableCollection (ArrowDown, 211-225): preventDefault is called
        // inside `if (nextKey != null)`, so at the last item without wrap the
        // arrow bubbles instead of being swallowed.
        const currentKey = state.focusedKey();
        const nextKey = findNextNonDisabledKey(collection, currentKey, "next", isDisabled, wrap);
        if (nextKey != null) {
          e.preventDefault();
          state.setFocusedKey(nextKey);
        }
        break;
      }
      case "ArrowUp": {
        const currentKey = state.focusedKey();
        const prevKey = findNextNonDisabledKey(collection, currentKey, "prev", isDisabled, wrap);
        if (prevKey != null) {
          e.preventDefault();
          state.setFocusedKey(prevKey);
        }
        break;
      }
      case "Home": {
        // Mirror useSelectableCollection (Home, 283-285): with nothing focused,
        // Shift+Home has no anchor to extend from, so leave the event alone.
        if (state.focusedKey() == null && e.shiftKey) break;
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
        // Mirror useSelectableCollection (End, 300-302): same anchor guard as Home.
        if (state.focusedKey() == null && e.shiftKey) break;
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
        // Activation is gated on the navigation-disabled check, not the raw
        // one: under disabledBehavior "selection" a focusable disabled item
        // still fires onAction (and closes), mirroring useSelectableItem's
        // allowsActions (manager.isDisabled is gated on "all"). Selection stays
        // blocked independently — state.select self-guards on the raw disabled
        // check (SelectionManager.canSelectItem).
        if (focusedKey != null && !isDisabled(focusedKey)) {
          // Route through the aria-layer onSelect so the platform-aware modifier
          // resolution (isCtrlKeyPressed / non-contiguous modifier) and the
          // shift-extend path are applied. Keyboard activation carries
          // pointerType "keyboard".
          selectItem(
            state,
            focusedKey,
            {
              pointerType: "keyboard",
              shiftKey: e.shiftKey,
              ctrlKey: e.ctrlKey,
              metaKey: e.metaKey,
              altKey: e.altKey,
            },
            collection,
          );
          // Pass the activated item's value as the second arg, mirroring
          // useMenuItem performAction: onAction(key, item?.value).
          p.onAction?.(focusedKey, collection.getItem(focusedKey)?.value as T);
          if (p.shouldCloseOnSelect !== false) {
            p.onClose?.();
          }
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        p.onClose?.();
        break;
      }
      case "PageDown": {
        // Mirror useSelectableCollection (PageDown, 324-332): only consume the
        // key when an item is focused. A non-empty collection always yields a
        // page target via getKeyPageBelow, so a focused key means focus moves
        // and the event is swallowed; with nothing focused, leave it alone to
        // bubble (e.g. to scroll an enclosing region).
        const currentKey = state.focusedKey();
        if (currentKey == null) break;
        e.preventDefault();
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
        // Mirror useSelectableCollection (PageUp, 333-341): only consume the key
        // when an item is focused. A non-empty collection always yields a page
        // target via getKeyPageAbove, so a focused key means focus moves and the
        // event is swallowed; with nothing focused, leave it alone to bubble
        // (e.g. to scroll an enclosing region).
        const currentKey = state.focusedKey();
        if (currentKey == null) break;
        e.preventDefault();
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
