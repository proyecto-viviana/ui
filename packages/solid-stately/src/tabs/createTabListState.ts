/**
 * State management for tab components.
 * Based on @react-stately/tabs.
 */

import { createComputed, createMemo, createSignal, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { ListCollection } from "../collections/ListCollection";
import type {
  Collection,
  CollectionItemLike,
  CollectionNode,
  Key,
  FocusStrategy,
} from "../collections/types";

export type KeyboardActivation = "automatic" | "manual";
export type TabOrientation = "horizontal" | "vertical";

export interface TabListStateProps<T = unknown> {
  /** The items in the tab list. */
  items?: T[];
  /** Function to get a key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled tabs. */
  disabledKeys?: Iterable<Key>;
  /** The currently selected tab key (controlled). */
  selectedKey?: Key | null;
  /** The default selected tab key (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler for tab selection changes. */
  onSelectionChange?: (key: Key) => void;
  /** Whether the entire tab list is disabled. */
  isDisabled?: boolean;
  /** Whether tabs are activated automatically on focus or manually. */
  keyboardActivation?: KeyboardActivation;
  /** The orientation of the tab list. */
  orientation?: TabOrientation;
}

export interface TabListState<T = unknown> {
  /** The collection of tabs. */
  readonly collection: Accessor<Collection<T>>;
  /** The currently selected tab key. */
  readonly selectedKey: Accessor<Key | null>;
  /** Set the selected tab key. */
  setSelectedKey(key: Key): void;
  /** The currently selected tab item. */
  readonly selectedItem: Accessor<CollectionNode<T> | null>;
  /** Whether the tab list is disabled. */
  readonly isDisabled: Accessor<boolean>;
  /** The keyboard activation mode. */
  readonly keyboardActivation: Accessor<KeyboardActivation>;
  /** The orientation of the tab list. */
  readonly orientation: Accessor<TabOrientation>;
  /** Whether a tab key is disabled. */
  isKeyDisabled(key: Key): boolean;
  /** The set of disabled keys. */
  readonly disabledKeys: Accessor<Set<Key>>;
  /** Whether the collection is focused. */
  readonly isFocused: Accessor<boolean>;
  /** Set the focused state. */
  setFocused(isFocused: boolean): void;
  /** The currently focused tab key. */
  readonly focusedKey: Accessor<Key | null>;
  /** Set the focused tab key. */
  setFocusedKey(key: Key | null, childStrategy?: FocusStrategy): void;
  /** The child focus strategy. */
  readonly childFocusStrategy: Accessor<FocusStrategy | null>;
}

/**
 * Creates state for a tab list component.
 */
export function createTabListState<T = unknown>(
  props: MaybeAccessor<TabListStateProps<T>>,
): TabListState<T> {
  const getProps = () => access(props);

  const collection: Accessor<Collection<T>> = createMemo(() => {
    const p = getProps();
    const items = p.items ?? [];

    const nodes: CollectionNode<T>[] = items.map((item, index) => {
      const o = item as CollectionItemLike;
      const key = p.getKey?.(item) ?? o.key ?? o.id ?? index;
      const textValue = p.getTextValue?.(item) ?? o.textValue ?? o.label ?? String(item);
      const isDisabled = p.getDisabled?.(item) ?? o.isDisabled ?? false;

      return {
        type: "item" as const,
        key,
        value: item,
        textValue,
        rendered: null!,
        level: 0,
        index,
        parentKey: null,
        hasChildNodes: false,
        childNodes: [],
        isDisabled,
      };
    });

    return new ListCollection(nodes);
  });

  // Compute disabled keys (memoized to avoid rebuilding Set per access)
  const disabledKeys: Accessor<Set<Key>> = createMemo(() => {
    const p = getProps();
    const result = new Set<Key>(p.disabledKeys ?? []);

    const coll = collection();
    for (const node of coll) {
      if (node.isDisabled) {
        result.add(node.key);
      }
    }

    return result;
  });

  const isKeyDisabled = (key: Key): boolean => {
    const p = getProps();
    if (p.isDisabled) return true;
    return disabledKeys().has(key);
  };

  // Find the first non-disabled key
  const findFirstNonDisabledKey = (): Key | null => {
    const coll = collection();
    for (const node of coll) {
      if (!isKeyDisabled(node.key)) {
        return node.key;
      }
    }
    return null;
  };

  const getInitialSelectedKey = (): Key | null => {
    const p = getProps();

    if (p.selectedKey !== undefined) {
      return p.selectedKey;
    }

    if (p.defaultSelectedKey !== undefined && !isKeyDisabled(p.defaultSelectedKey)) {
      return p.defaultSelectedKey;
    }

    return findFirstNonDisabledKey();
  };

  const [selectedKeyInternal, setSelectedKeyInternal] = createSignal<Key | null>(
    getInitialSelectedKey(),
  );

  const selectedKey: Accessor<Key | null> = () => {
    const p = getProps();
    if (p.selectedKey !== undefined) {
      return p.selectedKey;
    }
    return selectedKeyInternal();
  };

  const setSelectedKey = (key: Key) => {
    if (isKeyDisabled(key)) return;
    if (selectedKey() === key) return;

    const p = getProps();
    if (p.selectedKey === undefined) {
      setSelectedKeyInternal(key);
    }

    p.onSelectionChange?.(key);
  };

  const selectedItem: Accessor<CollectionNode<T> | null> = () => {
    const key = selectedKey();
    if (key === null) return null;
    return collection().getItem(key);
  };

  const isDisabled: Accessor<boolean> = () => getProps().isDisabled ?? false;

  const keyboardActivation: Accessor<KeyboardActivation> = () =>
    getProps().keyboardActivation ?? "automatic";

  const orientation: Accessor<TabOrientation> = () => getProps().orientation ?? "horizontal";

  const [isFocused, setIsFocused] = createSignal(false);
  const [focusedKey, setFocusedKeyInternal] = createSignal<Key | null>(null);
  const [childFocusStrategy, setChildFocusStrategy] = createSignal<FocusStrategy | null>(null);

  const setFocusedKey = (key: Key | null, childStrategy?: FocusStrategy) => {
    setFocusedKeyInternal(key);
    setChildFocusStrategy(childStrategy ?? null);

    // In automatic mode, selecting follows focus
    if (
      keyboardActivation() === "automatic" &&
      key !== null &&
      key !== selectedKey() &&
      !isKeyDisabled(key)
    ) {
      setSelectedKey(key);
    }
  };

  // Keep uncontrolled selection valid as items/disabled keys change.
  createComputed(() => {
    const p = getProps();
    if (p.selectedKey !== undefined) return;

    const coll = collection();
    const current = selectedKeyInternal();
    const currentExists = current !== null && coll.getItem(current) !== null;
    const currentEnabled = current !== null && !isKeyDisabled(current);

    if (currentExists && currentEnabled) return;

    if (
      p.defaultSelectedKey !== undefined &&
      coll.getItem(p.defaultSelectedKey) !== null &&
      !isKeyDisabled(p.defaultSelectedKey)
    ) {
      if (p.defaultSelectedKey !== current) {
        setSelectedKeyInternal(p.defaultSelectedKey);
      }
      return;
    }

    const nextKey = findFirstNonDisabledKey();
    if (nextKey !== current) {
      setSelectedKeyInternal(nextKey);
    }
  });

  return {
    collection,
    selectedKey,
    setSelectedKey,
    selectedItem,
    isDisabled,
    keyboardActivation,
    orientation,
    isKeyDisabled,
    disabledKeys,
    isFocused,
    setFocused: setIsFocused,
    focusedKey,
    setFocusedKey,
    childFocusStrategy,
  };
}
