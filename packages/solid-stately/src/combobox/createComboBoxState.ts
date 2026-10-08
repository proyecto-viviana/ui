/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/combobox/useComboBoxState.ts

/**
 * State management for ComboBox components.
 * Based on @react-stately/combobox useComboBoxState.
 *
 * ComboBox combines a text input with a dropdown list, allowing users to
 * either type to filter options or select from a list.
 */

import { createMemo, createEffect, untrack } from "solid-js";
import type { Accessor } from "solid-js";
import { createInternalSignal, propsAccessor, type MaybeAccessor } from "../utils";
import { createListState, type ListState } from "../collections/createListState";
import { createOverlayTriggerState } from "../overlays";
import { ListCollection } from "../collections/ListCollection";
import type { Key, CollectionNode, Collection, FocusStrategy } from "../collections/types";
import type { SelectionManager } from "../selection/SelectionManager";
import {
  createFormValidationState,
  type FormValidationState,
  type ValidationFunction,
} from "../form";

export type MenuTriggerAction = "focus" | "input" | "manual";

export type { FocusStrategy } from "../collections/types";

export type FilterFn = (textValue: string, inputValue: string) => boolean;

export type ComboBoxSelectionMode = "single" | "multiple";

/** Single mode is `Key | null`. Multiple mode is `readonly Key[]`. */
export type ComboBoxValueType<M extends ComboBoxSelectionMode> = M extends "single"
  ? Key | null
  : readonly Key[];

/** `onChange` receives a mutable `Key[]` in multiple mode. */
export type ComboBoxChangeValueType<M extends ComboBoxSelectionMode> = M extends "single"
  ? Key | null
  : Key[];

type ComboBoxValidationType<M extends ComboBoxSelectionMode> = M extends "single"
  ? Key | null
  : Key[];

const EMPTY_COMBOBOX_KEYS: readonly Key[] = [];

export interface ComboBoxValidationValue<M extends ComboBoxSelectionMode = "single"> {
  /**
   * The selected key in the ComboBox.
   * @deprecated Use `value`.
   */
  selectedKey: Key | null;
  /** The keys of the currently selected items. */
  value: ComboBoxValidationType<M>;
  /** The value of the ComboBox input. */
  inputValue: string;
}

export interface ComboBoxStateProps<T = unknown, M extends ComboBoxSelectionMode = "single"> {
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
  /**
   * Whether single or multiple selection is enabled.
   * @default 'single'
   */
  selectionMode?: M;
  /**
   * The current value (controlled).
   * Single mode is `Key | null`. Multiple mode is `readonly Key[]`.
   */
  value?: ComboBoxValueType<M>;
  /** The default value (uncontrolled). */
  defaultValue?: ComboBoxValueType<M>;
  /** Handler called when the value changes. */
  onChange?: (value: ComboBoxChangeValueType<M>) => void;
  /**
   * The currently selected key in the collection (controlled).
   * @deprecated Use `value`.
   */
  selectedKey?: Key | null;
  /**
   * The initial selected key in the collection (uncontrolled).
   * @deprecated Use `defaultValue`.
   */
  defaultSelectedKey?: Key | null;
  /**
   * Handler that is called when the selection changes.
   * @deprecated Use `onChange`.
   */
  onSelectionChange?: (key: Key | null) => void;
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
  /** Whether the combobox is invalid (controlled). */
  isInvalid?: boolean;
  /** @deprecated Use isInvalid instead. */
  validationState?: "valid" | "invalid";
  /** Custom validation function. */
  validate?: ValidationFunction<ComboBoxValidationValue<M> | null>;
  /**
   * Whether to use native HTML form validation or ARIA validation semantics.
   * @default "native"
   */
  validationBehavior?: "aria" | "native";
  /** Field name(s) for server error lookup. */
  name?: string | string[];
}

export interface ComboBoxState<
  T = unknown,
  M extends ComboBoxSelectionMode = "single",
> extends FormValidationState {
  /** The collection of items (may be filtered). */
  readonly collection: Accessor<Collection<T>>;
  /**
   * The collection-aware selection manager. Mirrors upstream `useComboBoxState`,
   * which returns the `useListState` selection manager bound to the unfiltered
   * collection (selection spans all items; filtering is display-only).
   */
  readonly selectionManager: SelectionManager<T>;
  /** Whether the combobox dropdown is open. */
  readonly isOpen: Accessor<boolean>;
  /** Open the combobox dropdown. */
  open(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /** Close the combobox dropdown. */
  close(): void;
  /** Toggle the combobox dropdown. */
  toggle(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /**
   * The key for the first selected item. Null in multiple mode.
   * @deprecated Use `value`.
   */
  readonly selectedKey: Accessor<Key | null>;
  /**
   * The default selected key.
   * @deprecated Use `defaultValue`.
   */
  readonly defaultSelectedKey: Key | null;
  /**
   * The value of the first selected item.
   * @deprecated Use `selectedItems`.
   */
  readonly selectedItem: Accessor<CollectionNode<T> | null>;
  /**
   * Sets the selected key.
   * @deprecated Use `setValue`.
   */
  setSelectedKey(key: Key | null): void;
  /** The current combobox value. */
  readonly value: Accessor<ComboBoxValueType<M>>;
  /** The default combobox value. */
  readonly defaultValue: ComboBoxValueType<M>;
  /** Sets the combobox value. */
  setValue(value: Key | readonly Key[] | null): void;
  /**
   * Selected keys derived from `value`.
   * Kept for the headless Backspace path and the tag/list adapters.
   */
  readonly selectedKeys: Accessor<Set<Key>>;
  /** Replace the selected keys. */
  setSelectedKeys(keys: Iterable<Key>): void;
  /** The currently selected items. */
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
  readonly selectionMode: Accessor<M>;
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
export function createComboBoxState<T = unknown, M extends ComboBoxSelectionMode = "single">(
  props: MaybeAccessor<ComboBoxStateProps<T, M>>,
): ComboBoxState<T, M> {
  const getProps = propsAccessor(props);

  // Extract options with defaults
  const menuTrigger = () => getProps().menuTrigger ?? "input";
  const allowsEmptyCollection = () => getProps().allowsEmptyCollection ?? false;
  const allowsCustomValue = () => getProps().allowsCustomValue ?? false;
  const shouldCloseOnBlur = () => getProps().shouldCloseOnBlur ?? true;
  const isMultiple = () => (getProps().selectionMode ?? "single") === "multiple";

  // Track focus strategy for list navigation
  const [focusStrategy, setFocusStrategy] = createInternalSignal<FocusStrategy | null>(null);

  // Track whether we're showing all items (vs filtered)
  const [showAllItems, setShowAllItems] = createInternalSignal(false);

  // Track the menu open trigger
  let menuOpenTrigger: MenuTriggerAction = "focus";

  // ---- Value ----
  // One signal matches upstream ValueType<M>. `selectedKey` stays as a
  // deprecated single-mode view. Multiple mode reads and writes `value`.
  type StoredComboBoxValue = Key | readonly Key[] | null;

  const controlledPropValue = (): StoredComboBoxValue | undefined => {
    const propsNow = getProps();
    if (propsNow.value !== undefined) {
      return propsNow.value as StoredComboBoxValue;
    }
    if (!isMultiple() && propsNow.selectedKey !== undefined) {
      return propsNow.selectedKey;
    }
    return undefined;
  };

  const isValueControlled = () => controlledPropValue() !== undefined;

  const initialStoredValue = (): StoredComboBoxValue => {
    const propsNow = getProps();
    if (propsNow.defaultValue !== undefined) {
      return propsNow.defaultValue as StoredComboBoxValue;
    }
    if ((propsNow.selectionMode ?? "single") === "multiple") {
      return [];
    }
    return propsNow.defaultSelectedKey ?? null;
  };

  const [internalValue, setInternalValue] =
    createInternalSignal<StoredComboBoxValue>(initialStoredValue());

  // ---- Input Value State ----
  // Initialized after selection so we can derive from selected item if needed
  const isInputControlled = () => getProps().inputValue !== undefined;

  // We'll set the proper initial value after collection is created
  const [internalInputValue, setInternalInputValue] = createInternalSignal(
    getProps().defaultInputValue ?? "",
  );
  // Track if we've initialized input from selection
  let inputInitialized = false;

  const inputValue: Accessor<string> = () => {
    return isInputControlled() ? (getProps().inputValue ?? "") : internalInputValue();
  };

  const setInputValue = (value: string) => {
    // Solid 2 batches writes onto a microtask, so onInputChange and the
    // auto-open effect settle in one flush (CB-OC-03: onInputChange then
    // onOpenChange(true, "input")).
    if (!isInputControlled()) {
      setInternalInputValue(value);
    }
    getProps().onInputChange?.(value);
  };

  // Track last committed input value
  const [lastValue, setLastValue] = createInternalSignal(inputValue());

  const storedValue = (): StoredComboBoxValue => {
    const controlled = controlledPropValue();
    return controlled !== undefined ? controlled : internalValue();
  };

  // `Array.isArray` narrows `readonly Key[]` to `any[]` and then fails to
  // exclude that array from the scalar branch. A string/number check keeps
  // the caller's readonly list intact.
  const displayValue = (): Key | readonly Key[] | null => {
    const current = storedValue();
    if (!isMultiple()) {
      return isKeyList(current) ? (current[0] ?? null) : current;
    }
    if (isKeyList(current)) return current;
    if (current == null) return EMPTY_COMBOBOX_KEYS;
    return [current];
  };

  const selectedKey: Accessor<Key | null> = () => {
    if (isMultiple()) return null;
    const current = displayValue();
    return isKeyList(current) ? (current[0] ?? null) : current;
  };

  const selectedKeys: Accessor<Set<Key>> = () => {
    const current = displayValue();
    if (isKeyList(current)) return new Set(current);
    return current == null ? new Set() : new Set([current]);
  };

  const setValue = (next: Key | readonly Key[] | null) => {
    // Solid 2 batches writes onto a microtask, so a fully controlled
    // onSelectionChange that updates the value then inputValue settles in
    // one flush instead of closing then auto-opening.
    if (!isMultiple()) {
      const key: Key | null =
        typeof next === "string" || typeof next === "number"
          ? next
          : next === null
            ? null
            : (next[0] ?? null);
      const previous = untrack(selectedKey);
      if (!isValueControlled()) {
        setInternalValue(key);
      }
      getProps().onChange?.(key as ComboBoxChangeValueType<M>);
      if (key !== previous) {
        getProps().onSelectionChange?.(key);
      }
      return;
    }

    // Copy into state so the caller's list is never stored or mutated.
    // `onChange` gets a second array, so a callback can mutate its argument
    // without changing state or the input.
    const keys: Key[] =
      typeof next === "string" || typeof next === "number"
        ? [next]
        : next === null
          ? []
          : [...next];
    if (!isValueControlled()) {
      setInternalValue(keys);
    }
    getProps().onChange?.([...keys] as ComboBoxChangeValueType<M>);
  };

  const setSelectedKey = (key: Key | null) => {
    setValue(key);
  };

  const defaultValue: ComboBoxValueType<M> = (() => {
    const propsNow = getProps();
    const resolved =
      propsNow.defaultValue !== undefined
        ? propsNow.defaultValue
        : isMultiple()
          ? (EMPTY_COMBOBOX_KEYS as unknown as ComboBoxValueType<M>)
          : ((propsNow.defaultSelectedKey ?? null) as ComboBoxValueType<M>);
    return (resolved ?? untrack(displayValue)) as ComboBoxValueType<M>;
  })();

  const defaultSelectedKey =
    getProps().defaultSelectedKey ?? (isMultiple() ? null : (untrack(displayValue) as Key | null));

  const validationValue = createMemo<ComboBoxValidationValue<M> | null>(() => {
    const dVal = displayValue();
    if (isKeyList(dVal) && dVal.length === 0) {
      return null;
    }
    return {
      inputValue: inputValue(),
      value: (isKeyList(dVal) ? [...dVal] : dVal) as ComboBoxValidationType<M>,
      selectedKey: selectedKey(),
    };
  });

  const validation = createFormValidationState({
    get value() {
      return validationValue();
    },
    get isInvalid() {
      return getProps().isInvalid;
    },
    get validationState() {
      return getProps().validationState;
    },
    get validate() {
      return getProps().validate;
    },
    get name() {
      return getProps().name;
    },
    get validationBehavior() {
      return getProps().validationBehavior ?? "native";
    },
  });

  // ---- Overlay State ----
  // Assigned after createListState; onOpenChange only fires after both exist
  // except a defaultOpen init, which we skip via the optional call.
  let listState!: ListState<T>;
  const overlayState = createOverlayTriggerState({
    get isOpen() {
      return getProps().isOpen;
    },
    get defaultOpen() {
      return getProps().defaultOpen;
    },
    onOpenChange(isOpen: boolean) {
      getProps().onOpenChange?.(isOpen, isOpen ? menuOpenTrigger : undefined);
      // RAC useComboBoxState.ts:314-317
      listState?.setFocused(isOpen);
      if (!isOpen) {
        listState?.setFocusedKey(null);
      }
    },
  });

  // ---- List State (unfiltered collection) ----
  listState = createListState<T>({
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
    // RAC useComboBoxState.ts:254-255. Single selection cannot be toggled
    // empty. Duplicate events re-emit the same key so a click on the selected
    // option reaches the reset-and-close branch below. Multiple selection
    // still allows clearing the last key.
    get disallowEmptySelection() {
      return !isMultiple();
    },
    allowDuplicateSelectionEvents: true,
    get selectedKeys() {
      return convertValue(displayValue());
    },
    onSelectionChange(keys) {
      if (keys === "all") return;

      if (isMultiple()) {
        setValue([...keys]);
        return;
      }

      const key = keys.size > 0 ? Array.from(keys)[0] : null;

      // RAC useComboBoxState.ts:265-270 — same key still notifies, then
      // resets the input and closes (click on the already selected option).
      if (key === selectedKey()) {
        getProps().onSelectionChange?.(key);
        resetInputValue();
        closeMenu();
        return;
      }

      setValue(key);
    },
  });

  // ---- Filtered Collection ----
  const originalCollection = listState.collection;

  const filteredCollection = createMemo<Collection<T>>(() => {
    const collection = originalCollection();
    const filter = getProps().defaultFilter;
    // RAC useComboBoxState.ts:297-302 — no default filter if items are controlled.
    if (getProps().items != null || !filter) {
      return collection;
    }
    return filterCollection(collection, inputValue(), filter);
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
    // RAC getDefaultInputValue: an explicit empty defaultInputValue wins.
    // Multiple mode does not seed the input from the first selected item.
    if (getProps().defaultInputValue == null && !isMultiple()) {
      const key = selectedKey();
      if (key != null) {
        const item = originalCollection().getItem(key);
        if (item) {
          setInternalInputValue(item.textValue);
          setLastValue(item.textValue);
        }
      }
    }
    inputInitialized = true;
  }

  // ---- Helper Functions ----
  const resetInputValue = () => {
    const key = selectedKey();
    const textValue = key != null ? (originalCollection().getItem(key)?.textValue ?? "") : "";
    setLastValue(textValue);
    setInputValue(textValue);
  };

  const closeMenu = () => {
    if (overlayState.isOpen()) {
      overlayState.close();
    }
  };

  // ---- Open/Toggle Logic ----
  // Auto-focus the menu on open the way upstream's listbox does via its
  // `autoFocus: state.focusStrategy || true` prop (useComboBox.ts:535 →
  // useSelectableCollection). createListBox does not honor a listbox
  // `autoFocus` prop, so BOTH open() and toggle() apply it here. RAC applies
  // this in a later effect; doing it synchronously keeps the first option
  // paint (slot `aria-labelledby`) stable. createComboBox still announces
  // option count on open.
  const applyOpenFocus = (strategy: FocusStrategy | null) => {
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
  };

  const open = (strategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
    const displayAll = trigger === "manual" || (trigger === "focus" && menuTrigger() === "focus");

    // RAC useComboBoxState.ts:331-340 — controlled `items` may open empty;
    // showAllItems only when items are undefined (collection filtering).
    const filtered = filteredCollection();
    const original = originalCollection();
    const items = getProps().items;
    const canOpen =
      allowsEmptyCollection() ||
      filtered.size > 0 ||
      (displayAll && original.size > 0) ||
      items != null;

    if (!canOpen) return;

    if (displayAll && !overlayState.isOpen() && items === undefined) {
      setShowAllItems(true);
    }

    menuOpenTrigger = trigger ?? "focus";
    setFocusStrategy(strategy);
    if (!overlayState.isOpen()) {
      applyOpenFocus(strategy);
    }
    overlayState.open();
  };

  const toggle = (strategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
    const displayAll = trigger === "manual" || (trigger === "focus" && menuTrigger() === "focus");

    const filtered = filteredCollection();
    const original = originalCollection();
    const items = getProps().items;
    const canOpen =
      allowsEmptyCollection() ||
      filtered.size > 0 ||
      (displayAll && original.size > 0) ||
      items != null;

    if (!canOpen && !overlayState.isOpen()) return;

    const willOpen = !overlayState.isOpen();

    if (displayAll && willOpen && items === undefined) {
      setShowAllItems(true);
    }

    if (willOpen) {
      menuOpenTrigger = trigger ?? "focus";
    }

    setFocusStrategy(strategy);
    if (willOpen) {
      applyOpenFocus(strategy);
    }
    overlayState.toggle();
  };

  // ---- Commit/Revert Logic ----
  const commitCustomValue = () => {
    if (isMultiple()) {
      // Custom text is independent of the selected items.
      setLastValue(inputValue());
      closeMenu();
      return;
    }
    setValue(null);
    closeMenu();
  };

  const commitSelection = (shouldForceSelectionChange = false) => {
    // Both the value and the input are controlled: notify, then close.
    // Otherwise reset the input for the caller.
    if (isValueControlled() && isInputControlled()) {
      const key = selectedKey();
      const itemText = key != null ? (originalCollection().getItem(key)?.textValue ?? "") : "";
      if (shouldForceSelectionChange || isMultiple() || inputValue() !== itemText) {
        getProps().onSelectionChange?.(key);
        const current = displayValue();
        const changeValue = (
          isKeyList(current) ? [...current] : current
        ) as ComboBoxChangeValueType<M>;
        getProps().onChange?.(changeValue);
      }
      // RAC useComboBoxState.ts:543-545 — stop the auto-open-on-input effect
      // from reopening after this close.
      setLastValue(itemText);
      closeMenu();
    } else {
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

    if (overlayState.isOpen() && focusedKey != null) {
      // RAC useComboBoxState.ts:564-572 — an already-selected single key goes
      // through commitSelection. A new single key is `selectionManager.select()`
      // without close; the open/close effect then closes while the menu is
      // still open, so auto-open (input !== last && !isOpen) is skipped.
      // Multiple toggles through setValue and leaves the menu open.
      if (!isMultiple() && selectedKey() === focusedKey) {
        commitSelection(true);
      } else if (isMultiple()) {
        select(focusedKey);
      } else {
        listState.selectionManager.select(focusedKey);
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
  const [isFocused, setIsFocused] = createInternalSignal(false);

  let valueOnFocus: [string, Key | readonly Key[] | null] = [
    untrack(inputValue),
    untrack(displayValue) as Key | readonly Key[] | null,
  ];

  const hasMoved = (a: Key | readonly Key[] | null, b: Key | readonly Key[] | null): boolean => {
    if (a === b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return true;
      }
      return false;
    }
    return true;
  };

  // RAC useComboBoxState.ts:578-593 keeps `valueOnFocus = useRef([inputValue, displayValue])`
  // and, on blur, calls `validation.commitValidation()` when the input value or the display
  // value moved while focused.
  const setFocused = (focused: boolean) => {
    if (focused) {
      valueOnFocus = [inputValue(), displayValue() as Key | readonly Key[] | null];
      if (menuTrigger() === "focus" && !getProps().isReadOnly) {
        open(null, "focus");
      }
    } else {
      if (shouldCloseOnBlur()) {
        commitValue();
      }
      if (
        inputValue() !== valueOnFocus[0] ||
        hasMoved(displayValue() as Key | readonly Key[] | null, valueOnFocus[1])
      ) {
        validation.commitValidation();
      }
    }
    setIsFocused(focused);
  };

  // ---- Effects for Auto Open/Close ----
  // RAC useComboBoxState.ts:408-496 is one effect: auto-open, auto-close,
  // close-on-selection, then lastValue. Close-on-selection must not run as a
  // later effect — after a fully-controlled commit the parent updates
  // inputValue, a trailing close leaves !isOpen && input !== last, and
  // auto-open reopens (D13 Enter re-announces "N options available.").
  // lastDisplayValue starts as the current key so an initial selectedKey is
  // not treated as a selection change (RAC lastValueRef = useRef(displayValue)).
  let lastDisplayValue: Key | null | undefined = untrack(selectedKey);

  createEffect(
    () => ({
      input: inputValue(),
      filtered: filteredCollection(),
      isOpen: overlayState.isOpen(),
      last: lastValue(),
      focused: isFocused(),
      key: isMultiple() ? null : selectedKey(),
      allowsEmpty: allowsEmptyCollection(),
      trigger: menuTrigger(),
      showingAll: showAllItems(),
      inputControlled: isInputControlled(),
      selectionControlled: isValueControlled(),
      multiple: isMultiple(),
    }),
    ({
      input,
      filtered,
      isOpen,
      last,
      focused,
      key,
      allowsEmpty,
      trigger,
      showingAll,
      inputControlled,
      selectionControlled,
      multiple,
    }) => {
      // Auto-open when typing
      if (
        focused &&
        (filtered.size > 0 || allowsEmpty) &&
        !isOpen &&
        input !== last &&
        trigger !== "manual"
      ) {
        open(null, "input");
      }

      // Auto-close when empty (unless showing all)
      if (!showingAll && !allowsEmpty && isOpen && filtered.size === 0) {
        closeMenu();
      }

      // Close when an item is selected (RAC displayValue !== lastValueRef).
      if (key != null && key !== lastDisplayValue) {
        closeMenu();
      }

      // Clear focused key when input changes
      if (input !== last) {
        listState.setFocusedKey(null);
        setShowAllItems(false);

        // Clear selection when the input is cleared. Fully controlled single
        // values, and every multiple value, stay put.
        if (!multiple && input === "" && (!inputControlled || !selectionControlled)) {
          setValue(null);
        }

        setLastValue(input);
      }

      lastDisplayValue = key;
    },
  );

  // Keep the input text in sync with the selected item (single mode only).
  //
  // This effect must react to the SELECTION and the COLLECTION — when the
  // selected key changes, or when its item (and thus textValue) resolves as
  // items load — but it must NOT react to the input value itself. The previous
  // port compared `textValue !== inputValue()`, reading `inputValue()` inside
  // the effect; in Solid that subscribes the effect to the input signal, so it
  // re-ran on every keystroke and — while any selection was active — immediately
  // reset the input back to the selected item's text. The result: the user
  // could neither type nor delete in the field.
  //
  // The comparison is unchanged, but `inputValue()` is now read via `untrack`,
  // so it is used only to decide whether a reset is needed and never becomes a
  // dependency. `originalCollection()` stays tracked (the unfiltered collection
  // only changes when `items` change, never on filtering) so a preset selection
  // still gets its text once async items arrive.
  createEffect(
    () => {
      if (isMultiple()) return null;
      const key = selectedKey();
      const item = key != null ? originalCollection().getItem(key) : null;
      return {
        key,
        textValue: item?.textValue ?? "",
        inputControlled: isInputControlled(),
        selectionControlled: isValueControlled(),
      };
    },
    (data) => {
      if (!data) return;
      const { key, textValue, inputControlled, selectionControlled } = data;
      // Only update if selection changed and not fully controlled
      if (!inputControlled || !selectionControlled) {
        if (key != null && textValue !== untrack(inputValue)) {
          setInputValue(textValue);
          setLastValue(textValue);
        }
      }
    },
  );

  // ---- Selection Methods for ListState compatibility ----
  // These methods allow createOption to work with ComboBoxState
  const select = (key: Key) => {
    if (isMultiple()) {
      const current = new Set(selectedKeys());
      if (current.has(key)) {
        current.delete(key);
      } else {
        current.add(key);
      }
      setValue([...current]);
    } else {
      setValue(key);
      closeMenu();
    }
  };

  const setSelectedKeys = (keys: Iterable<Key>) => {
    setValue([...keys]);
  };

  const removeSelectedKey = (key: Key) => {
    if (!isMultiple()) return;
    setValue([...selectedKeys()].filter((selected) => selected !== key));
  };

  const selectionMode: Accessor<M> = () => (getProps().selectionMode ?? "single") as M;

  const isSelected = (key: Key) => selectedKeys().has(key);

  // ---- Return State ----
  return {
    realtimeValidation: validation.realtimeValidation,
    displayValidation: validation.displayValidation,
    updateValidation: validation.updateValidation,
    resetValidation: validation.resetValidation,
    commitValidation: validation.commitValidation,
    collection: displayedCollection,
    isOpen: overlayState.isOpen,
    open,
    close: commitValue,
    toggle,
    selectedKey,
    defaultSelectedKey,
    selectedItem,
    setSelectedKey,
    value: () => displayValue() as ComboBoxValueType<M>,
    defaultValue,
    setValue,
    selectedKeys,
    setSelectedKeys,
    selectedItems,
    removeSelectedKey,
    inputValue,
    defaultInputValue: getProps().defaultInputValue ?? "",
    setInputValue,
    selectionManager: listState.selectionManager,
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

function isKeyList(value: Key | readonly Key[] | null): value is readonly Key[] {
  return value !== null && typeof value !== "string" && typeof value !== "number";
}

function convertValue(value: Key | readonly Key[] | null | undefined): readonly Key[] {
  if (value == null) return [];
  if (typeof value === "string" || typeof value === "number") return [value];
  return value;
}

/**
 * Filter a collection based on input value.
 * RAC `useComboBoxState.ts:644-672` copies nodes into a new `ListCollection`,
 * which reassigns `index` (ListCollection.ts:51-53). Keeping the original
 * `index` makes virtualized `aria-posinset` report the unfiltered position.
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
  let index = 0;

  for (const item of collection) {
    if (item.type === "section") {
      const filteredChildren: CollectionNode<T>[] = [];
      if (item.childNodes) {
        for (const child of item.childNodes) {
          if (child.type === "item" && filter(child.textValue, inputValue)) {
            filteredChildren.push({ ...child, index: index++ });
          }
        }
      }
      if (filteredChildren.length > 0) {
        filteredItems.push({
          ...item,
          childNodes: filteredChildren,
        });
      }
    } else if (item.type === "item") {
      if (filter(item.textValue, inputValue)) {
        filteredItems.push({ ...item, index: index++ });
      }
    } else {
      filteredItems.push({ ...item });
    }
  }

  return new ListCollection(filteredItems);
}
