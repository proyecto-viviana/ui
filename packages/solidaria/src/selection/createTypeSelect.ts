/**
 * createTypeSelect - Handles typeahead interactions with collections.
 * Based on @react-aria/selection useTypeSelect.
 *
 * Allows users to navigate to items by typing characters that match
 * item text values. Supports multi-character search with debouncing.
 */

import type { JSX, Accessor } from "solid-js";
import type { Key, Collection, CollectionNode } from "@proyecto-viviana/solid-stately";

/**
 * Controls how long to wait before clearing the typeahead buffer.
 */
const TYPEAHEAD_DEBOUNCE_WAIT_MS = 1000; // 1 second

export interface TypeSelectOptions<T> {
  /** The collection to search through. */
  collection: Accessor<Collection<T>>;
  /** The currently focused key. */
  focusedKey: Accessor<Key | null>;
  /** Callback to set the focused key when a match is found. */
  onFocusedKeyChange: (key: Key) => void;
  /** Callback when an item is focused by typing. */
  onTypeSelect?: (key: Key) => void;
  /** Function to check if a key is disabled. */
  isKeyDisabled?: (key: Key) => boolean;
  /** Whether type-to-select is disabled. */
  isDisabled?: boolean;
}

export interface TypeSelectAria {
  /** Props to spread on the collection element. */
  typeSelectProps: JSX.HTMLAttributes<HTMLElement>;
}

// Internal state for tracking the search buffer
interface TypeSelectState {
  search: string;
  timeout: ReturnType<typeof setTimeout> | undefined;
}

/**
 * Get a printable character from a key event.
 * Returns the character if it's a single printable character,
 * or empty string for non-printable keys.
 */
function getStringForKey(key: string): string {
  // If the key is of length 1, it is an ASCII value.
  // Otherwise, if there are no ASCII characters in the key name,
  // it is a Unicode character.
  // See https://www.w3.org/TR/uievents-key/
  if (key.length === 1 || !/^[A-Z]/i.test(key)) {
    return key;
  }
  return "";
}

/**
 * Search for a key in the collection that matches the search string.
 * Starts searching from the key after `fromKey`, wrapping around if needed.
 */
function getKeyForSearch<T>(
  collection: Collection<T>,
  search: string,
  fromKey: Key | null,
  isKeyDisabled?: (key: Key) => boolean,
): Key | null {
  const searchLower = search.toLowerCase();

  // Collect all items in order
  const items: CollectionNode<T>[] = [];
  for (const item of collection) {
    if (item.type === "item") {
      items.push(item);
    }
  }

  if (items.length === 0) return null;

  // Find the starting index. Start *at* the currently focused item (inclusive),
  // mirroring upstream ListKeyboardDelegate.getKeyForSearch (`key = fromKey ||
  // getFirstKey()`): typing a prefix the focused item already matches keeps focus
  // on it instead of advancing to the next match.
  let startIndex = 0;
  if (fromKey != null) {
    const fromIndex = items.findIndex((item) => item.key === fromKey);
    if (fromIndex !== -1) {
      startIndex = fromIndex;
    }
  }

  // Scan from startIndex to the end (no wrap). The caller retries from the top to
  // cover items before the focused one, matching upstream useTypeSelect.
  for (let index = startIndex; index < items.length; index++) {
    const item = items[index];

    // Skip disabled items
    if (item.isDisabled || (isKeyDisabled && isKeyDisabled(item.key))) {
      continue;
    }

    // Check if the text value starts with the search string
    const textValue = item.textValue || "";
    if (textValue.toLowerCase().startsWith(searchLower)) {
      return item.key;
    }
  }

  return null;
}

/**
 * Creates typeahead/type-to-select functionality for a collection.
 *
 * @example
 * ```tsx
 * const { typeSelectProps } = createTypeSelect({
 *   collection: () => state.collection(),
 *   focusedKey: () => state.focusedKey(),
 *   onFocusedKeyChange: (key) => state.setFocusedKey(key),
 * });
 *
 * return <ul {...mergeProps(listBoxProps, typeSelectProps)}>...</ul>;
 * ```
 */
export function createTypeSelect<T>(options: TypeSelectOptions<T>): TypeSelectAria {
  // Create mutable state object to persist across keystrokes
  const state: TypeSelectState = {
    search: "",
    timeout: undefined,
  };

  const onKeyDownCapture: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    if (options.isDisabled) return;

    const character = getStringForKey(e.key);

    // Ignore non-printable characters, modifier key combos,
    // and events that didn't originate from within the element
    if (
      !character ||
      e.ctrlKey ||
      e.metaKey ||
      !e.currentTarget.contains(e.target as HTMLElement)
    ) {
      return;
    }

    // Don't start search with space (common action key)
    if (state.search.length === 0 && character === " ") {
      return;
    }

    // If there's already search text and the user types a space,
    // prevent it from triggering selection and include it in the search
    if (character === " " && state.search.trim().length > 0) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Append to the search buffer
    state.search += character;

    // Find a matching key
    const collection = options.collection();
    const currentKey = options.focusedKey();

    // First, try to find a match starting after the current key
    let key = getKeyForSearch(collection, state.search, currentKey, options.isKeyDisabled);

    // If no match found, try from the beginning
    if (key == null && currentKey != null) {
      key = getKeyForSearch(collection, state.search, null, options.isKeyDisabled);
    }

    if (key != null) {
      options.onFocusedKeyChange(key);
      options.onTypeSelect?.(key);
    }

    // Reset the debounce timer
    if (state.timeout !== undefined) {
      clearTimeout(state.timeout);
    }
    state.timeout = setTimeout(() => {
      state.search = "";
    }, TYPEAHEAD_DEBOUNCE_WAIT_MS);
  };

  // Upstream useTypeSelect binds `onKeyDownCapture` only, so the Spacebar
  // handling runs before the collection's own keydown handler. In Solid, however,
  // a capture handler delivered through a `{...typeSelectProps}` spread is not
  // wired as a working capture listener, so we also bind the bubble-phase
  // `onKeyDown` (the path that actually fires). True capture would need a
  // ref-based addEventListener threaded through every consumer — see the
  // typeahead follow-up in upstream-sync.md.
  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = onKeyDownCapture;

  return {
    typeSelectProps: {
      onKeyDownCapture,
      onKeyDown,
    } as JSX.HTMLAttributes<HTMLElement>,
  };
}
