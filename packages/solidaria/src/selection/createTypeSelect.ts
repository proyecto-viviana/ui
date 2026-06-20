/**
 * createTypeSelect - Handles typeahead interactions with collections.
 * Based on @react-aria/selection useTypeSelect.
 *
 * Allows users to navigate to items by typing characters that match
 * item text values. Supports multi-character search with debouncing.
 */

import { onCleanup } from "solid-js";
import type { JSX, Accessor } from "solid-js";
import type { Key, Collection, CollectionNode } from "@proyecto-viviana/solid-stately";
import { createCollator } from "../i18n/createCollator";

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
 * Starts *at* `fromKey` (inclusive) and scans to the end, with no internal
 * wrap; the caller retries from the top to cover earlier items. Matching is
 * locale-aware via the supplied `collator`.
 */
function getKeyForSearch<T>(
  collection: Collection<T>,
  search: string,
  fromKey: Key | null,
  collator: Intl.Collator,
  isKeyDisabled?: (key: Key) => boolean,
): Key | null {
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

    // Match the leading characters of the text value against the search string
    // using locale-aware collation, mirroring upstream ListKeyboardDelegate
    // (`collator.compare(textValue.slice(0, search.length), search) === 0`). The
    // collator's `usage: 'search'` / `sensitivity: 'base'` makes this case- and
    // diacritic-insensitive in a locale-aware way.
    const textValue = item.textValue || "";
    const substring = textValue.slice(0, search.length);
    if (textValue && collator.compare(substring, search) === 0) {
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

  // Locale-aware search collator, mirroring upstream useSelectableList's
  // `useCollator({ usage: 'search', sensitivity: 'base' })`.
  const collator = createCollator({ usage: "search", sensitivity: "base" });

  // Append the search buffer, find a matching key (from the focused item,
  // falling back to the whole list), focus it, and (re)start the debounce timer.
  // Shared by both phase handlers below, mirroring the duplicated body in
  // upstream useTypeSelect.
  const searchAndFocus = (): Key | null => {
    const collection = options.collection();
    const currentKey = options.focusedKey();

    // Prioritize items at/after the focused item, then retry from the top to
    // cover earlier ones (upstream's two getKeyForSearch calls).
    let key = getKeyForSearch(
      collection,
      state.search,
      currentKey,
      collator(),
      options.isKeyDisabled,
    );
    if (key == null) {
      key = getKeyForSearch(collection, state.search, null, collator(), options.isKeyDisabled);
    }

    if (key != null) {
      options.onFocusedKeyChange(key);
      options.onTypeSelect?.(key);
    }

    return key;
  };

  const restartDebounce = () => {
    clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.search = "";
    }, TYPEAHEAD_DEBOUNCE_WAIT_MS);
  };

  // Capture phase: mid-search a Spacebar is part of the query, not a selection
  // action, so we consume it before the collection's own keydown handler can act
  // on it. Mirrors upstream useTypeSelect's onKeyDownCapture.
  const onKeyDownCapture: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    if (options.isDisabled) return;

    if (state.search.length > 0 && e.key === " ") {
      e.preventDefault();
      // Upstream guards this with `!('continuePropagation' in e) ||
      // !e.isPropagationStopped()`. Our raw DOM KeyboardEvents never carry
      // `continuePropagation`, so the guard always holds — stop unconditionally.
      e.stopPropagation();
      state.search += " ";
      searchAndFocus();
      restartDebounce();
    }
  };

  // Bubble phase: handles ordinary characters (and, in environments where the
  // capture listener above is inert, mid-search Spacebar via its non-bailing
  // branch). Mirrors upstream useTypeSelect's onKeyDown.
  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    if (options.isDisabled) return;

    const character = getStringForKey(e.key);

    // Ignore non-printable keys, Ctrl/Meta/Alt combos (Alt is excluded to match
    // upstream — AltGr-only layouts shouldn't drive type-select), events from
    // outside the element, and a leading Space (a common action key).
    if (
      !character ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      !e.currentTarget.contains(e.target as HTMLElement) ||
      (state.search.length === 0 && character === " ")
    ) {
      return;
    }

    state.search += character;

    const key = searchAndFocus();

    if (key != null) {
      e.preventDefault();
      // Our raw DOM events never carry `continuePropagation`, so upstream's
      // `if (!('continuePropagation' in e)) e.stopPropagation()` is unconditional.
      e.stopPropagation();
    } else {
      // Nothing matched even after retrying from the top: type-to-select is done,
      // so reset the buffer and let the key propagate normally.
      state.search = "";
      clearTimeout(state.timeout);
      state.timeout = undefined;
      return;
    }

    restartDebounce();
  };

  // Mirror upstream's unmount cleanup (a useEffect teardown) so a pending
  // debounce timer never fires after the consumer is disposed.
  onCleanup(() => {
    clearTimeout(state.timeout);
  });

  return {
    typeSelectProps: {
      // Upstream binds `onKeyDownCapture` so Spacebar is handled before the
      // collection's own keydown handler. In Solid a capture handler delivered
      // through a `{...typeSelectProps}` spread is inert (it never fires), so the
      // bubble-phase `onKeyDown` is the live path — and it also covers mid-search
      // Space because its bail check only rejects a *leading* Space. True capture
      // would need a ref-based addEventListener threaded through every consumer;
      // see the typeahead follow-up in upstream-sync.md.
      onKeyDownCapture,
      onKeyDown,
    } as JSX.HTMLAttributes<HTMLElement>,
  };
}
