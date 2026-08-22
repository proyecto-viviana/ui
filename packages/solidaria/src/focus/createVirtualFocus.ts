/**
 * Virtual focus management for solidaria
 *
 * Provides virtual focus for large collections where tracking DOM focus
 * on every item is impractical. Instead, a single element receives real
 * focus while aria-activedescendant indicates the virtually focused item.
 *
 * This is commonly used in:
 * - Virtualized lists (where not all items are in the DOM)
 * - Large trees
 * - Autocomplete/combobox suggestions
 * - Grid/table navigation
 *
 * This is a local Solid helper. The pinned React Aria revision has no
 * standalone virtual-focus controller with this API.
 */

import { type Accessor, createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export interface VirtualFocusOptions<T> {
  /**
   * The items in the collection.
   */
  items: Accessor<T[]>;
  /**
   * Function to get a unique key for each item.
   */
  getKey: (item: T) => string;
  /**
   * Function to check if an item is disabled.
   */
  isDisabled?: (item: T) => boolean;
  /**
   * Initial focused key.
   */
  defaultFocusedKey?: string;
  /**
   * Controlled focused key.
   */
  focusedKey?: Accessor<string | null>;
  /**
   * Callback when focused key changes.
   */
  onFocusChange?: (key: string | null) => void;
  /**
   * Whether to wrap focus at the edges.
   * @default true
   */
  wrap?: boolean;
  /**
   * Whether to loop through disabled items.
   * @default false
   */
  skipDisabled?: boolean;
  /**
   * Orientation for keyboard navigation.
   * @default 'vertical'
   */
  orientation?: "horizontal" | "vertical" | "both";
}

export interface VirtualFocusResult<T> {
  /**
   * The currently focused key.
   */
  focusedKey: Accessor<string | null>;
  /**
   * The currently focused item (if any).
   */
  focusedItem: Accessor<T | null>;
  /**
   * Set the focused key.
   */
  setFocusedKey: (key: string | null) => void;
  /**
   * Move focus to the next item.
   */
  focusNext: () => void;
  /**
   * Move focus to the previous item.
   */
  focusPrevious: () => void;
  /**
   * Move focus to the first item.
   */
  focusFirst: () => void;
  /**
   * Move focus to the last item.
   */
  focusLast: () => void;
  /**
   * Move focus by a page (for large lists).
   */
  focusPageDown: (pageSize?: number) => void;
  /**
   * Move focus up by a page (for large lists).
   */
  focusPageUp: (pageSize?: number) => void;
  /**
   * Check if a key is the currently focused key.
   */
  isFocused: (key: string) => boolean;
  /**
   * Props to spread on the container element.
   */
  containerProps: {
    "aria-activedescendant": Accessor<string | undefined>;
    onKeyDown: (e: KeyboardEvent) => void;
  };
  /**
   * Get props for an item element.
   */
  getItemProps: (key: string) => {
    id: string;
    "aria-selected"?: boolean;
  };
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Creates virtual focus management for a collection.
 *
 * Virtual focus uses aria-activedescendant to indicate which item is
 * "focused" while keeping real DOM focus on a container element. This
 * is more performant for large collections and required for virtualized
 * lists where items may not be in the DOM.
 *
 * @example
 * ```tsx
 * function Listbox(props) {
 *   const virtualFocus = createVirtualFocus({
 *     items: () => props.items,
 *     getKey: (item) => item.id,
 *     isDisabled: (item) => item.disabled,
 *   });
 *
 *   return (
 *     <ul
 *       role="listbox"
 *       tabIndex={0}
 *       aria-activedescendant={virtualFocus.containerProps['aria-activedescendant']()}
 *       onKeyDown={virtualFocus.containerProps.onKeyDown}
 *     >
 *       <For each={props.items}>
 *         {(item) => (
 *           <li
 *             {...virtualFocus.getItemProps(item.id)}
 *             role="option"
 *             aria-selected={virtualFocus.isFocused(item.id)}
 *           >
 *             {item.name}
 *           </li>
 *         )}
 *       </For>
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With controlled focus
 * function ControlledListbox() {
 *   const [focusedKey, setFocusedKey] = createSignal<string | null>(null);
 *
 *   const virtualFocus = createVirtualFocus({
 *     items: () => items,
 *     getKey: (item) => item.id,
 *     focusedKey: focusedKey,
 *     onFocusChange: setFocusedKey,
 *   });
 *
 *   return <ul>...</ul>;
 * }
 * ```
 */
export function createVirtualFocus<T>(options: VirtualFocusOptions<T>): VirtualFocusResult<T> {
  const {
    items,
    getKey,
    isDisabled = () => false,
    defaultFocusedKey,
    focusedKey: controlledFocusedKey,
    onFocusChange,
    wrap = true,
    skipDisabled = true,
    orientation = "vertical",
  } = options;

  // During SSR, return minimal implementation
  if (isServer) {
    const emptyAccessor = () => null;
    return {
      focusedKey: emptyAccessor,
      focusedItem: emptyAccessor,
      setFocusedKey: () => {},
      focusNext: () => {},
      focusPrevious: () => {},
      focusFirst: () => {},
      focusLast: () => {},
      focusPageDown: () => {},
      focusPageUp: () => {},
      isFocused: () => false,
      containerProps: {
        "aria-activedescendant": () => undefined,
        onKeyDown: () => {},
      },
      getItemProps: (key: string) => ({ id: `item-${key}` }),
    };
  }

  // Internal state for uncontrolled mode
  const [internalKey, setInternalKey] = createSignal<string | null>(defaultFocusedKey ?? null);

  // Use controlled or uncontrolled value
  const focusedKey = controlledFocusedKey ?? internalKey;

  const setFocusedKey = (key: string | null) => {
    if (controlledFocusedKey) {
      onFocusChange?.(key);
    } else {
      setInternalKey(key);
      onFocusChange?.(key);
    }
  };

  // Get focused item
  const focusedItem = (): T | null => {
    const key = focusedKey();
    if (!key) return null;
    return items().find((item) => getKey(item) === key) ?? null;
  };

  // Get valid items (not disabled if skipDisabled is true)
  const getValidItems = (): T[] => {
    if (!skipDisabled) return items();
    return items().filter((item) => !isDisabled(item));
  };

  // Get index of key in valid items
  const getKeyIndex = (key: string | null): number => {
    if (!key) return -1;
    const validItems = getValidItems();
    return validItems.findIndex((item) => getKey(item) === key);
  };

  // Focus by index
  const focusByIndex = (index: number): void => {
    const validItems = getValidItems();
    if (validItems.length === 0) return;

    let targetIndex = index;

    if (wrap) {
      targetIndex = ((index % validItems.length) + validItems.length) % validItems.length;
    } else {
      targetIndex = Math.max(0, Math.min(index, validItems.length - 1));
    }

    const item = validItems[targetIndex];
    if (item) {
      setFocusedKey(getKey(item));
    }
  };

  const focusNext = (): void => {
    const currentIndex = getKeyIndex(focusedKey());
    focusByIndex(currentIndex + 1);
  };

  const focusPrevious = (): void => {
    const currentIndex = getKeyIndex(focusedKey());
    if (currentIndex === -1) {
      focusByIndex(getValidItems().length - 1);
    } else {
      focusByIndex(currentIndex - 1);
    }
  };

  const focusFirst = (): void => {
    focusByIndex(0);
  };

  const focusLast = (): void => {
    focusByIndex(getValidItems().length - 1);
  };

  const focusPageDown = (pageSize: number = DEFAULT_PAGE_SIZE): void => {
    const currentIndex = getKeyIndex(focusedKey());
    focusByIndex(currentIndex + pageSize);
  };

  const focusPageUp = (pageSize: number = DEFAULT_PAGE_SIZE): void => {
    const currentIndex = getKeyIndex(focusedKey());
    if (currentIndex === -1) {
      focusByIndex(getValidItems().length - 1);
    } else {
      focusByIndex(currentIndex - pageSize);
    }
  };

  const isFocused = (key: string): boolean => {
    return focusedKey() === key;
  };

  // Keyboard handler
  const onKeyDown = (e: KeyboardEvent): void => {
    const isVertical = orientation === "vertical" || orientation === "both";
    const isHorizontal = orientation === "horizontal" || orientation === "both";

    switch (e.key) {
      case "ArrowDown":
        if (isVertical) {
          e.preventDefault();
          focusNext();
        }
        break;
      case "ArrowUp":
        if (isVertical) {
          e.preventDefault();
          focusPrevious();
        }
        break;
      case "ArrowRight":
        if (isHorizontal) {
          e.preventDefault();
          focusNext();
        }
        break;
      case "ArrowLeft":
        if (isHorizontal) {
          e.preventDefault();
          focusPrevious();
        }
        break;
      case "Home":
        e.preventDefault();
        focusFirst();
        break;
      case "End":
        e.preventDefault();
        focusLast();
        break;
      case "PageDown":
        e.preventDefault();
        focusPageDown();
        break;
      case "PageUp":
        e.preventDefault();
        focusPageUp();
        break;
    }
  };

  const containerProps = {
    "aria-activedescendant": () => {
      const key = focusedKey();
      return key ? `item-${key}` : undefined;
    },
    onKeyDown,
  };

  const getItemProps = (key: string) => ({
    id: `item-${key}`,
  });

  return {
    focusedKey,
    focusedItem,
    setFocusedKey,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusPageDown,
    focusPageUp,
    isFocused,
    containerProps,
    getItemProps,
  };
}
