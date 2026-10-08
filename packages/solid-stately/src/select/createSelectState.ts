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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/select/useSelectState.ts

/**
 * State management for select components.
 * Based on @react-stately/select useSelectState.
 */

import { createMemo, untrack } from "solid-js";
import type { Accessor } from "solid-js";
import { createInternalSignal, propsAccessor, type MaybeAccessor } from "../utils";
import { createListState } from "../collections/createListState";
import { createOverlayTriggerState } from "../overlays";
import type { Key, CollectionNode, Collection, FocusStrategy } from "../collections/types";
import type { SelectionManager } from "../selection/SelectionManager";
import {
  createFormValidationState,
  type FormValidationState,
  type ValidationFunction,
} from "../form";

/** Select never uses the collection `"none"` mode. */
export type SelectSelectionMode = "single" | "multiple";

/** Single mode is `Key | null`. Multiple mode is `readonly Key[]`. */
export type SelectValueType<M extends SelectSelectionMode> = M extends "single"
  ? Key | null
  : readonly Key[];

/** `onChange` receives a mutable `Key[]` in multiple mode. */
export type SelectChangeValueType<M extends SelectSelectionMode> = M extends "single"
  ? Key | null
  : Key[];

type SelectValidationType<M extends SelectSelectionMode> = M extends "single" ? Key : Key[];

export interface SelectStateProps<T = unknown, M extends SelectSelectionMode = "single"> {
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
  /**
   * Whether single or multiple selection is enabled.
   * @default 'single'
   */
  selectionMode?: M;
  /**
   * The current value (controlled).
   * Single mode is `Key | null`. Multiple mode is `readonly Key[]`.
   */
  value?: SelectValueType<M>;
  /** The default value (uncontrolled). */
  defaultValue?: SelectValueType<M>;
  /** Handler called when the value changes. */
  onChange?: (value: SelectChangeValueType<M>) => void;
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
  /** Whether the select is open (controlled). */
  isOpen?: boolean;
  /** Whether the select is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether the Select should close when an item is selected. Defaults to true
   * when selectionMode is single, false otherwise.
   */
  shouldCloseOnSelect?: boolean;
  /** Whether the select should be allowed to be open when the collection is empty. */
  allowsEmptyCollection?: boolean;
  /** Whether the select is disabled. */
  isDisabled?: boolean;
  /** Whether the select is required. */
  isRequired?: boolean;
  /** Whether the select is invalid (controlled). */
  isInvalid?: boolean;
  /** @deprecated Use isInvalid instead. */
  validationState?: "valid" | "invalid";
  /** Custom validation function. */
  validate?: ValidationFunction<SelectValidationType<M> | null>;
  /**
   * Whether to use native HTML form validation or ARIA validation semantics.
   * @default "native"
   */
  validationBehavior?: "aria" | "native";
  /** Field name(s) for server error lookup. */
  name?: string | string[];
}

export interface SelectState<
  T = unknown,
  M extends SelectSelectionMode = "single",
> extends FormValidationState {
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
  open(focusStrategy?: FocusStrategy | null): void;
  /** Close the select dropdown. */
  close(): void;
  /** Toggle the select dropdown. */
  toggle(focusStrategy?: FocusStrategy | null): void;
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: Accessor<FocusStrategy | null>;
  /**
   * The key for the first selected item.
   * @deprecated Use `value`.
   */
  readonly selectedKey: Accessor<Key | null>;
  /**
   * The default selected key.
   * @deprecated Use `defaultValue`.
   */
  readonly defaultSelectedKey: Key | null;
  /**
   * Sets the selected key.
   * @deprecated Use `setValue`.
   */
  setSelectedKey(key: Key | null): void;
  /** The current select value. */
  readonly value: Accessor<SelectValueType<M>>;
  /** The default select value. */
  readonly defaultValue: SelectValueType<M>;
  /** Sets the select value. */
  setValue(value: Key | readonly Key[] | null): void;
  /**
   * Selected keys derived from `value`.
   * Kept for list and hidden-select adapters. Never `"all"`.
   */
  readonly selectedKeys: Accessor<Set<Key>>;
  /** Replace the selected keys. */
  setSelectedKeys(keys: Iterable<Key>): void;
  /**
   * The value of the first selected item.
   * @deprecated Use `selectedItems`.
   */
  readonly selectedItem: Accessor<CollectionNode<T> | null>;
  /** The value of the selected items. */
  readonly selectedItems: Accessor<CollectionNode<T>[]>;
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
  readonly selectionMode: Accessor<M>;
  /** Whether selecting an item closes the menu. */
  readonly shouldCloseOnSelect: Accessor<boolean>;
}

function convertValue(value: Key | readonly Key[] | null | undefined): readonly Key[] | undefined {
  if (value === undefined) return undefined;
  if (value === null || typeof value === "string" || typeof value === "number") {
    return value == null ? [] : [value];
  }
  return value;
}

/**
 * Creates state for a select component.
 * Combines list state with overlay trigger state for dropdown behavior.
 */
export function createSelectState<T = unknown, M extends SelectSelectionMode = "single">(
  props: MaybeAccessor<SelectStateProps<T, M>>,
): SelectState<T, M> {
  const getProps = propsAccessor(props);
  const selectionMode: Accessor<M> = () => (getProps().selectionMode ?? "single") as M;

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

  const resolvedDefault = untrack((): Key | readonly Key[] | null => {
    const current = getProps();
    if (current.defaultValue !== undefined) {
      return current.defaultValue as Key | readonly Key[] | null;
    }
    const mode = current.selectionMode ?? "single";
    return mode === "single" ? (current.defaultSelectedKey ?? null) : [];
  });

  const controlledProp = (): SelectValueType<M> | undefined => {
    const current = getProps();
    if (current.value !== undefined) return current.value;
    if (selectionMode() === "single" && current.selectedKey !== undefined) {
      return (current.selectedKey ?? null) as SelectValueType<M>;
    }
    return undefined;
  };

  const [internalValue, setInternalValue] = createInternalSignal<Key | readonly Key[] | null>(
    resolvedDefault,
  );

  const readControlled = (): Key | readonly Key[] | null | undefined => {
    const controlled = controlledProp();
    return controlled === undefined ? undefined : (controlled as Key | readonly Key[] | null);
  };

  let valueRef: Key | readonly Key[] | null = untrack(() => {
    const controlled = readControlled();
    return controlled !== undefined ? controlled : internalValue();
  });
  let wroteThisTurn = false;

  const syncValueRef = () => {
    if (wroteThisTurn) return;
    const controlled = readControlled();
    valueRef = controlled !== undefined ? controlled : untrack(internalValue);
  };

  const displayValue = (): Key | readonly Key[] | null => {
    const controlled = readControlled();
    const raw = controlled !== undefined ? controlled : internalValue();
    if (
      selectionMode() === "single" &&
      raw !== null &&
      typeof raw !== "string" &&
      typeof raw !== "number"
    ) {
      return raw[0] ?? null;
    }
    return raw;
  };

  const setValue = (next: Key | readonly Key[] | null) => {
    syncValueRef();
    if (selectionMode() === "single") {
      const key: Key | null =
        typeof next === "string" || typeof next === "number"
          ? next
          : next === null
            ? null
            : (next[0] ?? null);
      // Both callbacks follow this request, not a comparison with displayValue.
      // A refused controlled value stays stale for the turn, so a second
      // same-key call would notify the legacy callback again. React Stately
      // still compares displayValue; this is the Solid same-turn adaptation.
      // A later turn resyncs valueRef, and a different key is its own request.
      if (!Object.is(valueRef, key)) {
        valueRef = key;
        wroteThisTurn = true;
        queueMicrotask(() => {
          wroteThisTurn = false;
        });
        if (controlledProp() === undefined) {
          setInternalValue(key);
        }
        getProps().onChange?.(key as SelectChangeValueType<M>);
        getProps().onSelectionChange?.(key);
      }
      return;
    }

    // Keep the readonly list for state. `onChange` receives its own mutable copy.
    const keys: readonly Key[] =
      typeof next === "string" || typeof next === "number" ? [next] : next === null ? [] : next;
    if (!Object.is(valueRef, keys)) {
      valueRef = keys;
      wroteThisTurn = true;
      queueMicrotask(() => {
        wroteThisTurn = false;
      });
      if (controlledProp() === undefined) {
        setInternalValue(keys);
      }
      getProps().onChange?.([...keys] as SelectChangeValueType<M>);
    }
  };

  const setSelectedKeys = (keys: Iterable<Key>) => {
    if (selectionMode() === "multiple") {
      setValue([...keys]);
      return;
    }
    let key: Key | null = null;
    for (const item of keys) {
      key = item;
      break;
    }
    setValue(key);
  };

  const initialDisplay = untrack(displayValue);
  const stateDefaultValue = (resolvedDefault ?? initialDisplay) as SelectValueType<M>;
  const defaultSelectedKey =
    untrack(() => getProps().defaultSelectedKey) ??
    (untrack(() => getProps().selectionMode) === "single" ? (initialDisplay as Key) : null);

  const shouldCloseOnSelect = () => getProps().shouldCloseOnSelect ?? selectionMode() === "single";

  const validation = createFormValidationState({
    get value() {
      const display = displayValue();
      if (
        display !== null &&
        typeof display !== "string" &&
        typeof display !== "number" &&
        display.length === 0
      ) {
        return null;
      }
      return display;
    },
    get isInvalid() {
      return getProps().isInvalid;
    },
    get validationState() {
      return getProps().validationState;
    },
    get validate() {
      return getProps().validate as ValidationFunction<unknown> | undefined;
    },
    get name() {
      return getProps().name;
    },
    get validationBehavior() {
      return getProps().validationBehavior ?? "native";
    },
  });

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
    // Upstream only requires a value in single-selection mode. Multiple
    // selection must permit toggling the last selected option off.
    get disallowEmptySelection() {
      return selectionMode() === "single";
    },
    allowDuplicateSelectionEvents: true,
    get selectedKeys() {
      return convertValue(displayValue()) ?? [];
    },
    onSelectionChange(keys) {
      if (keys === "all") return;
      if (selectionMode() === "single") {
        setValue(keys.values().next().value ?? null);
      } else {
        setValue([...keys]);
      }
      if (shouldCloseOnSelect()) {
        overlayState.close();
      }
      validation.commitValidation();
    },
  });

  const [focusStrategy, setFocusStrategy] = createInternalSignal<FocusStrategy | null>(null);
  // The select's own focus state (the trigger), separate from the collection's
  // focus-within state on the selection manager — upstream useSelectState keeps
  // these apart with a dedicated useState. Sharing the manager's signal makes
  // trigger focus re-arm the item roving-focus effect and steal focus back.
  const [isFocused, setFocused] = createInternalSignal(false);

  const selectedKey: Accessor<Key | null> = () => listState.selectionManager.firstSelectedKey;
  const selectedKeys: Accessor<Set<Key>> = () => new Set(convertValue(displayValue()) ?? []);

  const selectedItem: Accessor<CollectionNode<T> | null> = createMemo(() => {
    const key = selectedKey();
    if (key == null) return null;
    return listState.collection().getItem(key);
  });

  const selectedItems: Accessor<CollectionNode<T>[]> = createMemo(() => {
    const items: CollectionNode<T>[] = [];
    for (const key of listState.selectionManager.selectedKeys) {
      const item = listState.collection().getItem(key);
      if (item) items.push(item);
    }
    return items;
  });

  const canOpenMenu = () =>
    listState.collection().size !== 0 || getProps().allowsEmptyCollection === true;

  return {
    realtimeValidation: validation.realtimeValidation,
    displayValidation: validation.displayValidation,
    updateValidation: validation.updateValidation,
    resetValidation: validation.resetValidation,
    commitValidation: validation.commitValidation,
    collection: listState.collection,
    selectionManager: listState.selectionManager,
    focusedKey: listState.focusedKey,
    setFocusedKey: listState.setFocusedKey,
    isFocused,
    setFocused,
    isOpen: overlayState.isOpen,
    open(strategy: FocusStrategy | null = null) {
      if (!canOpenMenu()) return;
      setFocusStrategy(strategy);
      overlayState.open();
    },
    close: overlayState.close,
    toggle(strategy: FocusStrategy | null = null) {
      if (!canOpenMenu()) return;
      setFocusStrategy(strategy);
      overlayState.toggle();
    },
    focusStrategy,
    selectionMode,
    shouldCloseOnSelect,
    value: () => displayValue() as SelectValueType<M>,
    defaultValue: stateDefaultValue,
    setValue,
    selectedKey,
    defaultSelectedKey,
    setSelectedKey: setValue,
    selectedKeys,
    selectedItem,
    selectedItems,
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
