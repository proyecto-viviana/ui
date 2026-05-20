/**
 * State management for ComboBox components.
 * Based on @react-stately/combobox useComboBoxState.
 *
 * ComboBox combines a text input with a dropdown list, allowing users to
 * either type to filter options or select from a list.
 */

import { createSignal, createMemo, createEffect, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { createListState } from "../collections/createListState";
import { createOverlayTriggerState } from "../overlays";
import type { Key, CollectionNode, Collection, FocusStrategy } from "../collections/types";

export type MenuTriggerAction = "focus" | "input" | "manual";

export type { FocusStrategy } from "../collections/types";

export type FilterFn = (textValue: string, inputValue: string) => boolean;

export interface ComboBoxStateProps<T = unknown> {
  /** The items to display in the combobox dropdown. */
  items?: T[];
  /** Default items when uncontrolled. */
  defaultItems?: T[];
  /** Function to get the key for an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value for an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** The selection mode for the combobox. */
  selectionMode?: "single" | "multiple";
  /** The currently selected key (controlled, single mode). */
  selectedKey?: Key | null;
  /** The default selected key (uncontrolled, single mode). */
  defaultSelectedKey?: Key | null;
  /** The currently selected keys (controlled, multiple mode). */
  selectedKeys?: Iterable<Key>;
  /** The default selected keys (uncontrolled, multiple mode). */
  defaultSelectedKeys?: Iterable<Key>;
  /** Handler called when the selection changes (single mode). */
  onSelectionChange?: (key: Key | null) => void;
  /** Handler called when the selection changes (multiple mode). */
  onSelectionChangeMultiple?: (keys: Set<Key>) => void;
  /** The current input value (controlled). */
  inputValue?: string;
  /** The default input value (uncontrolled). */
  defaultInputValue?: string;
  /** Handler called when the input value changes. */
  onInputChange?: (value: string) => void;
  /** Whether the combobox is open (controlled). */
  isOpen?: boolean;
  /** Whether the combobox is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean, trigger?: MenuTriggerAction) => void;
  /** Whether the combobox is disabled. */
  isDisabled?: boolean;
  /** Whether the combobox is read-only. */
  isReadOnly?: boolean;
  /** Whether the combobox is required. */
  isRequired?: boolean;
  /** The filter function to use when filtering items. */
  defaultFilter?: FilterFn;
  /** Whether to allow the menu to open when there are no items. */
  allowsEmptyCollection?: boolean;
  /** Whether to allow custom values that don't match any option. */
  allowsCustomValue?: boolean;
  /** What triggers the menu to open. */
  menuTrigger?: MenuTriggerAction;
  /** Whether to close the menu on blur. */
  shouldCloseOnBlur?: boolean;
}

export interface ComboBoxState<T = unknown> {
  /** The collection of items (may be filtered). */
  readonly collection: Accessor<Collection<T>>;
  /** Whether the combobox dropdown is open. */
  readonly isOpen: Accessor<boolean>;
  /** Open the combobox dropdown. */
  open(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /** Close the combobox dropdown. */
  close(): void;
  /** Toggle the combobox dropdown. */
  toggle(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /** The currently selected key (single mode). */
  readonly selectedKey: Accessor<Key | null>;
  /** The default selected key. */
  readonly defaultSelectedKey: Key | null;
  /** The currently selected item (single mode). */
  readonly selectedItem: Accessor<CollectionNode<T> | null>;
  /** Set the selected key. */
  setSelectedKey(key: Key | null): void;
  /** The currently selected keys (multiple mode). */
  readonly selectedKeys: Accessor<Set<Key>>;
  /** The currently selected items (multiple mode). */
  readonly selectedItems: Accessor<CollectionNode<T>[]>;
  /** Remove a selected key (multiple mode). */
  removeSelectedKey(key: Key): void;
  /** The current input value. */
  readonly inputValue: Accessor<string>;
  /** The default input value. */
  readonly defaultInputValue: string;
  /** Set the input value. */
  setInputValue(value: string): void;
  /** The currently focused key in the list. */
  readonly focusedKey: Accessor<Key | null>;
  /** Set the focused key. */
  setFocusedKey(key: Key | null): void;
  /** Whether the combobox input has focus. */
  readonly isFocused: Accessor<boolean>;
  /** Set whether the combobox has focus. */
  setFocused(isFocused: boolean): void;
  /** The focus strategy to use when opening. */
  readonly focusStrategy: Accessor<FocusStrategy | null>;
  /** Commit the current selection (select focused item or custom value). */
  commit(): void;
  /** Revert input to the selected item's text and close menu. */
  revert(): void;
  /** Whether a specific key is disabled. */
  isKeyDisabled(key: Key): boolean;
  /** Select a key and close the menu (for ListState compatibility). */
  select(key: Key): void;
  /** The selection mode. */
  readonly selectionMode: Accessor<"single" | "multiple">;
  /** Check if a key is selected. */
  isSelected(key: Key): boolean;
  /** Whether the combobox is disabled. */
  readonly isDisabled: boolean;
  /** Whether the combobox is read-only. */
  readonly isReadOnly: boolean;
  /** Whether the combobox is required. */
  readonly isRequired: boolean;
}

/**
 * Default filter function that does case-insensitive "contains" matching.
 */
export const defaultContainsFilter: FilterFn = (textValue, inputValue) => {
  return textValue.toLowerCase().includes(inputValue.toLowerCase());
};

/**
 * Creates state for a combobox component.
 * Combines list state with input value management and filtering.
 */
export function createComboBoxState<T = unknown>(
  props: MaybeAccessor<ComboBoxStateProps<T>>,
): ComboBoxState<T> {
  const getProps = () => access(props);

  // Extract options with defaults
  const menuTrigger = () => getProps().menuTrigger ?? "input";
  const allowsEmptyCollection = () => getProps().allowsEmptyCollection ?? false;
  const allowsCustomValue = () => getProps().allowsCustomValue ?? false;
  const shouldCloseOnBlur = () => getProps().shouldCloseOnBlur ?? true;
  const isMultiple = () => getProps().selectionMode === "multiple";

  // Track focus strategy for list navigation
  const [focusStrategy, setFocusStrategy] = createSignal<FocusStrategy | null>(null);

  // Track whether we're showing all items (vs filtered)
  const [showAllItems, setShowAllItems] = createSignal(false);

  // Track the menu open trigger
  let menuOpenTrigger: MenuTriggerAction = "focus";

  // ---- Multi-select State ----
  const isMultiSelectionControlled = () => getProps().selectedKeys !== undefined;
  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<Set<Key>>(
    new Set(getProps().defaultSelectedKeys ?? []),
  );

  const selectedKeys: Accessor<Set<Key>> = () => {
    return isMultiSelectionControlled()
      ? new Set(getProps().selectedKeys ?? [])
      : internalSelectedKeys();
  };

  const setSelectedKeys = (keys: Set<Key>) => {
    if (!isMultiSelectionControlled()) {
      setInternalSelectedKeys(new Set(keys));
    }
    getProps().onSelectionChangeMultiple?.(keys);
  };

  // ---- Selection State (single mode) ----
  // Note: Selection state is initialized first because input value may depend on it
  const isSelectionControlled = () => getProps().selectedKey !== undefined;
  const [internalSelectedKey, setInternalSelectedKey] = createSignal<Key | null>(
    getProps().defaultSelectedKey ?? null,
  );

  // ---- Input Value State ----
  // Initialized after selection so we can derive from selected item if needed
  const isInputControlled = () => getProps().inputValue !== undefined;

  // We'll set the proper initial value after collection is created
  const [internalInputValue, setInternalInputValue] = createSignal(
    getProps().defaultInputValue ?? "",
  );
  // Track if we've initialized input from selection
  let inputInitialized = false;

  const inputValue: Accessor<string> = () => {
    return isInputControlled() ? (getProps().inputValue ?? "") : internalInputValue();
  };

  const setInputValue = (value: string) => {
    if (!isInputControlled()) {
      setInternalInputValue(value);
    }
    getProps().onInputChange?.(value);
  };

  // Track last committed input value
  const [lastValue, setLastValue] = createSignal(inputValue());

  const selectedKey: Accessor<Key | null> = () => {
    return isSelectionControlled() ? (getProps().selectedKey ?? null) : internalSelectedKey();
  };

  const setSelectedKey = (key: Key | null) => {
    if (!isSelectionControlled()) {
      setInternalSelectedKey(key);
    }
    getProps().onSelectionChange?.(key);
  };

  // ---- Overlay State ----
  const overlayState = createOverlayTriggerState({
    get isOpen() {
      return getProps().isOpen;
    },
    get defaultOpen() {
      return getProps().defaultOpen;
    },
    onOpenChange(isOpen: boolean) {
      getProps().onOpenChange?.(isOpen, isOpen ? menuOpenTrigger : undefined);
    },
  });

  // ---- List State (unfiltered collection) ----
  const listState = createListState<T>({
    get items() {
      // Use items or defaultItems
      return getProps().items ?? getProps().defaultItems ?? [];
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
      return isMultiple() ? ("multiple" as const) : ("single" as const);
    },
    disallowEmptySelection: false,
    get selectedKeys() {
      if (isMultiple()) {
        return Array.from(selectedKeys());
      }
      const key = selectedKey();
      return key != null ? [key] : [];
    },
    onSelectionChange(keys) {
      if (keys === "all") return;

      if (isMultiple()) {
        // In multiple mode, toggle selections
        const newKeys = new Set(keys);
        setSelectedKeys(newKeys);
        return;
      }

      const key = keys.size > 0 ? Array.from(keys)[0] : null;

      // If same key selected, just reset input and close
      if (key === selectedKey()) {
        resetInputValue();
        closeMenu();
        return;
      }

      setSelectedKey(key);
    },
  });

  // ---- Filtered Collection ----
  const originalCollection = listState.collection;

  const filteredCollection = createMemo<Collection<T>>(() => {
    const collection = originalCollection();
    const input = inputValue();
    const filter = getProps().defaultFilter;

    // If no filter function provided, return original collection
    if (!filter) {
      return collection;
    }

    // Filter the collection based on input value
    return filterCollection(collection, input, filter);
  });

  // The displayed collection depends on showAllItems flag
  // Always show filtered collection (or all items if showAllItems is true)
  const displayedCollection = createMemo<Collection<T>>(() => {
    return showAllItems() ? originalCollection() : filteredCollection();
  });

  // ---- Selected Item(s) ----
  const selectedItem: Accessor<CollectionNode<T> | null> = () => {
    const key = selectedKey();
    if (key == null) return null;
    return originalCollection().getItem(key);
  };

  const selectedItems = createMemo<CollectionNode<T>[]>(() => {
    const keys = selectedKeys();
    const collection = originalCollection();
    const items: CollectionNode<T>[] = [];
    for (const key of keys) {
      const item = collection.getItem(key);
      if (item) items.push(item);
    }
    return items;
  });

  // Initialize input value from selected item if not already set
  // This runs once on creation
  if (!inputInitialized && !isInputControlled()) {
    const defaultKey = getProps().defaultSelectedKey;
    if (defaultKey != null && !getProps().defaultInputValue) {
      // Get the text value from the collection for the default selected key
      const item = originalCollection().getItem(defaultKey);
      if (item) {
        setInternalInputValue(item.textValue);
        setLastValue(item.textValue);
      }
    }
    inputInitialized = true;
  }

  // ---- Helper Functions ----
  const resetInputValue = () => {
    const item = selectedItem();
    const textValue = item?.textValue ?? "";
    setLastValue(textValue);
    setInputValue(textValue);
  };

  const closeMenu = () => {
    if (overlayState.isOpen()) {
      overlayState.close();
    }
  };

  // ---- Open/Toggle Logic ----
  const open = (strategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
    const displayAll = trigger === "manual" || (trigger === "focus" && menuTrigger() === "focus");

    // Check if we should open
    const filtered = filteredCollection();
    const original = originalCollection();
    const canOpen =
      allowsEmptyCollection() || filtered.size > 0 || (displayAll && original.size > 0);

    if (!canOpen) return;

    if (displayAll && !overlayState.isOpen()) {
      setShowAllItems(true);
    }

    menuOpenTrigger = trigger ?? "focus";
    setFocusStrategy(strategy);
    if (!overlayState.isOpen()) {
      const key = selectedKey();
      const nextFocusedKey =
        key != null && !listState.isDisabled(key)
          ? key
          : strategy === "first"
            ? displayedCollection().getFirstKey()
            : strategy === "last"
              ? displayedCollection().getLastKey()
              : null;
      listState.setFocused(true);
      listState.setFocusedKey(nextFocusedKey);
    }
    overlayState.open();
  };

  const toggle = (strategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
    const displayAll = trigger === "manual" || (trigger === "focus" && menuTrigger() === "focus");

    // Check if we can open (if closed)
    const filtered = filteredCollection();
    const original = originalCollection();
    const canOpen =
      allowsEmptyCollection() || filtered.size > 0 || (displayAll && original.size > 0);

    if (!canOpen && !overlayState.isOpen()) return;

    if (displayAll && !overlayState.isOpen()) {
      setShowAllItems(true);
    }

    if (!overlayState.isOpen()) {
      menuOpenTrigger = trigger ?? "focus";
    }

    setFocusStrategy(strategy);
    overlayState.toggle();
  };

  // ---- Commit/Revert Logic ----
  const commitCustomValue = () => {
    setSelectedKey(null);
    closeMenu();
  };

  const commitSelection = () => {
    // If both are controlled, just call onSelectionChange
    if (isSelectionControlled() && isInputControlled()) {
      getProps().onSelectionChange?.(selectedKey());
      const item = selectedItem();
      setLastValue(item?.textValue ?? "");
      closeMenu();
    } else {
      // Reset input to selected item's text
      resetInputValue();
      closeMenu();
    }
  };

  const commitValue = () => {
    if (allowsCustomValue()) {
      const item = selectedItem();
      const itemText = item?.textValue ?? "";
      if (inputValue() === itemText) {
        commitSelection();
      } else {
        commitCustomValue();
      }
    } else {
      commitSelection();
    }
  };

  const commit = () => {
    const focusedKey = listState.focusedKey();

    if (isMultiple()) {
      // In multiple mode, toggle the focused item without closing
      if (overlayState.isOpen() && focusedKey != null) {
        select(focusedKey);
      }
      return;
    }

    if (overlayState.isOpen() && focusedKey != null) {
      // If focused key is already selected, just commit
      if (selectedKey() === focusedKey) {
        commitSelection();
      } else {
        // Select the focused item
        setSelectedKey(focusedKey);
        closeMenu();
      }
    } else {
      commitValue();
    }
  };

  const revert = () => {
    if (allowsCustomValue() && selectedKey() == null) {
      commitCustomValue();
    } else {
      commitSelection();
    }
  };

  // ---- Focus Handling ----
  const [isFocused, setIsFocused] = createSignal(false);
  let valueOnFocus = "";

  const setFocused = (focused: boolean) => {
    if (focused) {
      valueOnFocus = inputValue();
      if (menuTrigger() === "focus" && !getProps().isReadOnly) {
        open(null, "focus");
      }
    } else {
      if (shouldCloseOnBlur()) {
        commitValue();
      }
    }
    setIsFocused(focused);
  };

  // ---- Effects for Auto Open/Close ----
  createEffect(() => {
    const input = inputValue();
    const filtered = filteredCollection();
    const isOpen = overlayState.isOpen();
    const last = lastValue();
    const focused = isFocused();

    // Auto-open when typing
    if (
      focused &&
      (filtered.size > 0 || allowsEmptyCollection()) &&
      !isOpen &&
      input !== last &&
      menuTrigger() !== "manual"
    ) {
      open(null, "input");
    }

    // Auto-close when empty (unless showing all)
    if (!showAllItems() && !allowsEmptyCollection() && isOpen && filtered.size === 0) {
      closeMenu();
    }

    // Clear focused key when input changes
    if (input !== last) {
      listState.setFocusedKey(null);
      setShowAllItems(false);

      // Clear selection when input is cleared (if not fully controlled)
      if (input === "" && (!isInputControlled() || !isSelectionControlled())) {
        setSelectedKey(null);
      }

      setLastValue(input);
    }
  });

  // Update input when selection changes (only in single mode)
  createEffect(() => {
    if (isMultiple()) return;
    const key = selectedKey();
    const item = key != null ? originalCollection().getItem(key) : null;
    const textValue = item?.textValue ?? "";

    // Only update if selection changed and not fully controlled
    if (!isInputControlled() || !isSelectionControlled()) {
      if (key != null && textValue !== inputValue()) {
        setInputValue(textValue);
        setLastValue(textValue);
      }
    }
  });

  // Close when selection changes (only in single mode)
  createEffect((prevKey: Key | null | undefined) => {
    if (isMultiple()) return undefined;
    const key = selectedKey();
    if (key != null && key !== prevKey) {
      closeMenu();
    }
    return key;
  }, undefined);

  // ---- Selection Methods for ListState compatibility ----
  // These methods allow createOption to work with ComboBoxState
  const select = (key: Key) => {
    if (isMultiple()) {
      // Toggle selection in multiple mode
      const current = new Set(selectedKeys());
      if (current.has(key)) {
        current.delete(key);
      } else {
        current.add(key);
      }
      setSelectedKeys(current);
      // Don't close menu and don't reset input in multi-select mode
    } else {
      setSelectedKey(key);
      closeMenu();
    }
  };

  const removeSelectedKey = (key: Key) => {
    if (isMultiple()) {
      const current = new Set(selectedKeys());
      current.delete(key);
      setSelectedKeys(current);
    }
  };

  const selectionMode: Accessor<"single" | "multiple"> = () => getProps().selectionMode ?? "single";

  const isSelected = (key: Key) => {
    if (isMultiple()) {
      return selectedKeys().has(key);
    }
    return selectedKey() === key;
  };

  // ---- Return State ----
  return {
    collection: displayedCollection,
    isOpen: overlayState.isOpen,
    open,
    close: commitValue,
    toggle,
    selectedKey,
    defaultSelectedKey: getProps().defaultSelectedKey ?? null,
    selectedItem,
    setSelectedKey,
    selectedKeys,
    selectedItems,
    removeSelectedKey,
    inputValue,
    defaultInputValue: getProps().defaultInputValue ?? "",
    setInputValue,
    focusedKey: listState.focusedKey,
    setFocusedKey: listState.setFocusedKey,
    isFocused,
    setFocused,
    focusStrategy,
    commit,
    revert,
    // Selection state methods for ListState compatibility
    select,
    selectionMode,
    isSelected,
    isKeyDisabled: (key: Key) => listState.isDisabled(key),
    get isDisabled() {
      return getProps().isDisabled ?? false;
    },
    get isReadOnly() {
      return getProps().isReadOnly ?? false;
    },
    get isRequired() {
      return getProps().isRequired ?? false;
    },
  };
}

/**
 * Filter a collection based on input value.
 */
function filterCollection<T>(
  collection: Collection<T>,
  inputValue: string,
  filter: FilterFn,
): Collection<T> {
  if (!inputValue) {
    return collection;
  }

  const filteredItems: CollectionNode<T>[] = [];

  for (const item of collection) {
    if (item.type === "section") {
      // Filter section children
      const filteredChildren: CollectionNode<T>[] = [];
      if (item.childNodes) {
        for (const child of item.childNodes) {
          if (child.type === "item" && filter(child.textValue, inputValue)) {
            filteredChildren.push(child);
          }
        }
      }
      // Only include section if it has matching children
      if (filteredChildren.length > 0) {
        filteredItems.push({
          ...item,
          childNodes: filteredChildren,
        });
      }
    } else if (item.type === "item") {
      if (filter(item.textValue, inputValue)) {
        filteredItems.push(item);
      }
    }
  }

  // Create a new collection from filtered items
  return createFilteredCollection(filteredItems, collection);
}

/**
 * Create a filtered collection wrapper.
 */
function createFilteredCollection<T>(
  items: CollectionNode<T>[],
  original: Collection<T>,
): Collection<T> {
  const itemMap = new Map<Key, CollectionNode<T>>();

  for (const item of items) {
    itemMap.set(item.key, item);
    if (item.childNodes) {
      for (const child of item.childNodes) {
        itemMap.set(child.key, child);
      }
    }
  }

  return {
    get size() {
      let count = 0;
      for (const item of items) {
        if (item.type === "item") {
          count++;
        } else if (item.childNodes) {
          count += Array.from(item.childNodes).filter((c) => c.type === "item").length;
        }
      }
      return count;
    },
    getItem(key: Key) {
      return itemMap.get(key) ?? null;
    },
    getKeys() {
      return itemMap.keys();
    },
    getFirstKey() {
      for (const item of items) {
        if (item.type === "item") return item.key;
        if (item.childNodes) {
          for (const child of item.childNodes) {
            if (child.type === "item") return child.key;
          }
        }
      }
      return null;
    },
    getLastKey() {
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.type === "item") return item.key;
        if (item.childNodes) {
          const children = Array.from(item.childNodes);
          for (let j = children.length - 1; j >= 0; j--) {
            if (children[j].type === "item") return children[j].key;
          }
        }
      }
      return null;
    },
    getKeyBefore(key: Key) {
      return original.getKeyBefore(key);
    },
    getKeyAfter(key: Key) {
      return original.getKeyAfter(key);
    },
    at(index: number) {
      // Flatten items for indexing
      let currentIndex = 0;
      for (const item of items) {
        if (item.type === "item") {
          if (currentIndex === index) return item;
          currentIndex++;
        } else if (item.childNodes) {
          for (const child of item.childNodes) {
            if (child.type === "item") {
              if (currentIndex === index) return child;
              currentIndex++;
            }
          }
        }
      }
      return null;
    },
    getChildren(key: Key) {
      const item = itemMap.get(key);
      return item?.childNodes ?? [];
    },
    getTextValue(key: Key) {
      const item = itemMap.get(key);
      return item?.textValue ?? "";
    },
    [Symbol.iterator]() {
      return items[Symbol.iterator]();
    },
  };
}
