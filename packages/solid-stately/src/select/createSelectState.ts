/**
 * State management for select components.
 * Based on @react-stately/select useSelectState.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { createListState } from "../collections/createListState";
import { createOverlayTriggerState } from "../overlays";
import type { Key, CollectionNode, Collection } from "../collections/types";
import type { SelectionMode, Selection } from "../collections/types";
import type { SelectionManager } from "../selection/SelectionManager";

export interface SelectStateProps<T = unknown> {
  /** The items to display in the select. */
  items: T[];
  /** Function to get the key for an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value for an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** The currently selected key (controlled). */
  selectedKey?: Key | null;
  /** The default selected key (uncontrolled). */
  defaultSelectedKey?: Key | null;
  /** The selected keys (controlled, for multiple selection mode). */
  selectedKeys?: "all" | Iterable<Key>;
  /** Default selected keys (uncontrolled, for multiple selection mode). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler called when the selection changes. */
  onSelectionChange?: (key: Key | null) => void;
  /** Handler called when selected keys change. */
  onSelectionChangeKeys?: (keys: Selection) => void;
  /** Selection mode for the select. */
  selectionMode?: Extract<SelectionMode, "single" | "multiple">;
  /** Whether the select is open (controlled). */
  isOpen?: boolean;
  /** Whether the select is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether the select is disabled. */
  isDisabled?: boolean;
  /** Whether the select is required. */
  isRequired?: boolean;
}

export interface SelectState<T = unknown> {
  /** The collection of items. */
  readonly collection: Accessor<Collection<T>>;
  /**
   * The collection-aware selection manager. Mirrors upstream `useSelectState`,
   * which spreads the underlying `useListState` (including its selection manager).
   */
  readonly selectionManager: SelectionManager<T>;
  /** Whether the select dropdown is open. */
  readonly isOpen: Accessor<boolean>;
  /** Open the select dropdown. */
  open(): void;
  /** Close the select dropdown. */
  close(): void;
  /** Toggle the select dropdown. */
  toggle(): void;
  /** The currently selected key. */
  readonly selectedKey: Accessor<Key | null>;
  /** The selected keys. */
  readonly selectedKeys: Accessor<Selection>;
  /** The currently selected item. */
  readonly selectedItem: Accessor<CollectionNode<T> | null>;
  /** The currently selected items. */
  readonly selectedItems: Accessor<CollectionNode<T>[]>;
  /** Set the selected key. */
  setSelectedKey(key: Key | null): void;
  /** Set selected keys. */
  setSelectedKeys(keys: Iterable<Key>): void;
  /** The currently focused key. */
  readonly focusedKey: Accessor<Key | null>;
  /** Set the focused key. */
  setFocusedKey(key: Key | null): void;
  /** Whether the select has focus. */
  readonly isFocused: Accessor<boolean>;
  /** Set whether the select has focus. */
  setFocused(isFocused: boolean): void;
  /** Whether a specific key is disabled. */
  isKeyDisabled(key: Key): boolean;
  /** Whether the select is disabled. */
  readonly isDisabled: boolean;
  /** Whether the select is required. */
  readonly isRequired: boolean;
  /** The selection mode. */
  readonly selectionMode: Accessor<"single" | "multiple">;
}

/**
 * Creates state for a select component.
 * Combines list state with overlay trigger state for dropdown behavior.
 */
export function createSelectState<T = unknown>(
  props: MaybeAccessor<SelectStateProps<T>>,
): SelectState<T> {
  const getProps = () => access(props);
  const selectionMode: Accessor<"single" | "multiple"> = () => getProps().selectionMode ?? "single";

  // Overlay trigger state for open/close
  const overlayState = createOverlayTriggerState({
    get isOpen() {
      return getProps().isOpen;
    },
    get defaultOpen() {
      return getProps().defaultOpen;
    },
    get onOpenChange() {
      return getProps().onOpenChange;
    },
  });

  // Track selected key
  const isControlledSingle = () => getProps().selectedKey !== undefined;
  const isControlledMultiple = () => getProps().selectedKeys !== undefined;
  const [internalSelectedKey, setInternalSelectedKey] = createSignal<Key | null>(
    getProps().defaultSelectedKey ?? null,
  );
  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<Selection>(
    getProps().defaultSelectedKeys === "all"
      ? "all"
      : new Set(getProps().defaultSelectedKeys ?? []),
  );

  const selectedKey: Accessor<Key | null> = () => {
    if (selectionMode() === "multiple") {
      const keys = selectedKeys();
      if (keys === "all") return null;
      return keys.size > 0 ? Array.from(keys)[0] : null;
    }

    return isControlledSingle() ? (getProps().selectedKey ?? null) : internalSelectedKey();
  };

  const setSelectedKey = (key: Key | null) => {
    if (selectionMode() === "multiple") {
      if (key == null) {
        if (!isControlledMultiple()) {
          setInternalSelectedKeys(new Set<Key>());
        }
        getProps().onSelectionChangeKeys?.(new Set<Key>());
        getProps().onSelectionChange?.(null);
      } else {
        const next = new Set([key]);
        if (!isControlledMultiple()) {
          setInternalSelectedKeys(next);
        }
        getProps().onSelectionChangeKeys?.(next);
        getProps().onSelectionChange?.(key);
      }
      return;
    }

    if (!isControlledSingle()) {
      setInternalSelectedKey(key);
    }
    getProps().onSelectionChange?.(key);
    getProps().onSelectionChangeKeys?.(key != null ? new Set([key]) : new Set<Key>());
  };

  const selectedKeys: Accessor<Selection> = createMemo(() => {
    if (selectionMode() === "multiple") {
      if (isControlledMultiple()) {
        const keys = getProps().selectedKeys;
        return keys === "all" ? "all" : new Set<Key>(keys ?? []);
      }
      return internalSelectedKeys();
    }

    const key = selectedKey();
    return key != null ? new Set<Key>([key]) : new Set<Key>();
  });

  const setSelectedKeys = (keys: Iterable<Key>) => {
    const next = new Set(keys);
    if (selectionMode() === "multiple") {
      if (!isControlledMultiple()) {
        setInternalSelectedKeys(next);
      }
      getProps().onSelectionChangeKeys?.(next);
      getProps().onSelectionChange?.(next.size > 0 ? Array.from(next)[0] : null);
      return;
    }

    const key = next.size > 0 ? Array.from(next)[0] : null;
    setSelectedKey(key);
  };

  // Create list state with select selection mode
  const listState = createListState<T>({
    get items() {
      return getProps().items;
    },
    get getKey() {
      return getProps().getKey;
    },
    get getTextValue() {
      return getProps().getTextValue;
    },
    get getDisabled() {
      return getProps().getDisabled;
    },
    get disabledKeys() {
      return getProps().disabledKeys;
    },
    get selectionMode() {
      return selectionMode();
    },
    disallowEmptySelection: true,
    get selectedKeys() {
      const keys = selectedKeys();
      if (keys === "all") return "all";
      return keys;
    },
    onSelectionChange(keys) {
      if (selectionMode() === "multiple") {
        if (!isControlledMultiple()) {
          setInternalSelectedKeys(keys);
        }
        getProps().onSelectionChangeKeys?.(keys);
        if (keys !== "all") {
          getProps().onSelectionChange?.(keys.size > 0 ? Array.from(keys)[0] : null);
        }
        return;
      }

      // Get the first (and only) selected key
      if (keys === "all") return;
      const key = keys.size > 0 ? Array.from(keys)[0] : null;
      setSelectedKey(key);
      // Close the dropdown after selection in single mode
      overlayState.close();
    },
  });

  // Get the selected item from the collection (memoized)
  const selectedItem: Accessor<CollectionNode<T> | null> = createMemo(() => {
    const key = selectedKey();
    if (key == null) return null;
    return listState.collection().getItem(key);
  });

  const selectedItems: Accessor<CollectionNode<T>[]> = createMemo(() => {
    const keys = selectedKeys();
    if (keys === "all") {
      return Array.from(listState.collection());
    }

    const items: CollectionNode<T>[] = [];
    for (const key of keys) {
      const item = listState.collection().getItem(key);
      if (item) items.push(item);
    }
    return items;
  });

  return {
    // Collection
    collection: listState.collection,
    selectionManager: listState.selectionManager,

    // Focus management
    focusedKey: listState.focusedKey,
    setFocusedKey: listState.setFocusedKey,
    isFocused: listState.isFocused,
    setFocused: listState.setFocused,

    // Overlay state
    isOpen: overlayState.isOpen,
    open: overlayState.open,
    close: overlayState.close,
    toggle: overlayState.toggle,

    // Select-specific
    selectionMode,
    selectedKey,
    selectedKeys,
    selectedItem,
    selectedItems,
    setSelectedKey,
    setSelectedKeys,
    isKeyDisabled: (key: Key) => listState.isDisabled(key),
    get isDisabled() {
      return getProps().isDisabled ?? false;
    },
    get isRequired() {
      return getProps().isRequired ?? false;
    },
  };
}
