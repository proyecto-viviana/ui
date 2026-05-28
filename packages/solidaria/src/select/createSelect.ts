/**
 * Provides the behavior and accessibility implementation for a select component.
 * A select displays a collapsible list of options and allows a user to select one of them.
 * Based on @react-aria/select useSelect.
 */

import { type JSX, type Accessor, createEffect, onCleanup } from "solid-js";
import { createPress } from "../interactions/createPress";
import { createFocusRing } from "../interactions/createFocusRing";
import { createLabel } from "../label/createLabel";
import { createTypeSelect } from "../selection/createTypeSelect";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { SelectState, CollectionNode } from "@proyecto-viviana/solid-stately";

export interface AriaSelectProps {
  /** An ID for the select. */
  id?: string;
  /** Whether the select is disabled. */
  isDisabled?: boolean;
  /** Whether the select is required. */
  isRequired?: boolean;
  /** Whether the select is invalid. */
  isInvalid?: boolean;
  /** The label for the select. */
  label?: JSX.Element;
  /** An accessible label for the select when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the select. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the select. */
  "aria-describedby"?: string;
  /** Placeholder text when no option is selected. */
  placeholder?: string;
  /** Whether the select should be auto-focused. */
  autoFocus?: boolean;
  /** Handler called when focus moves to the select. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler called when focus moves away from the select. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler called when the focus state changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** The name of the select, used when submitting an HTML form. */
  name?: string;
  /** Associates the hidden native select with a form element by id. */
  form?: string;
  /** Whether type-to-select is disabled. @default false */
  disallowTypeAhead?: boolean;
  /** Whether the select can open when its collection is empty. @default false */
  allowsEmptyCollection?: boolean;
  /** Whether validation should use ARIA attributes or native browser validation. */
  validationBehavior?: "aria" | "native";
}

export interface SelectAria<T> {
  /** Props for the label element. */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the trigger button element. */
  triggerProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the value display element. */
  valueProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the listbox/menu popup. */
  menuProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the error message element, if any. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the select is currently focused. */
  isFocused: Accessor<boolean>;
  /** Whether the select has keyboard focus. */
  isFocusVisible: Accessor<boolean>;
  /** Whether the select is currently open. */
  isOpen: Accessor<boolean>;
  /** The currently selected item. */
  selectedItem: Accessor<CollectionNode<T> | null>;
}

// Shared data between select and options
const selectData = new WeakMap<object, SelectData>();

interface SelectData {
  id: string;
}

export function getSelectData(state: SelectState): SelectData | undefined {
  return selectData.get(state);
}

/**
 * Provides the behavior and accessibility implementation for a select component.
 */
export function createSelect<T>(
  props: MaybeAccessor<AriaSelectProps>,
  state: SelectState<T>,
  _ref?: () => HTMLElement | null,
): SelectAria<T> {
  const getProps = () => access(props);
  const id = createId(getProps().id);

  // Generate IDs for associated elements
  const buttonId = `${id}-button`;
  const listBoxId = `${id}-listbox`;
  const valueId = `${id}-value`;
  const descriptionId = `${id}-description`;
  const errorMessageId = `${id}-error`;

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  // Share data with child options
  createEffect(() => {
    selectData.set(state, { id });

    onCleanup(() => {
      selectData.delete(state);
    });
  });

  // Label handling
  const { labelProps, fieldProps } = createLabel({
    get id() {
      return buttonId;
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

  // Focus ring for keyboard focus styling
  const { isFocusVisible, focusProps } = createFocusRing({
    get autoFocus() {
      return getProps().autoFocus;
    },
  });

  // Track focus state
  const isFocused = state.isFocused;

  // Handle press on trigger
  const canOpen = () =>
    getProps().allowsEmptyCollection || state.collection().getFirstKey() != null;

  // Helper to check if key is disabled
  const isKeyDisabled = (key: string | number): boolean => {
    const collection = state.collection();
    return state.isKeyDisabled?.(key) || collection.getItem(key)?.isDisabled || false;
  };

  // Helper to find the next non-disabled key.
  const findNextKey = (
    fromKey: string | number | null,
    direction: "forward" | "backward",
  ): string | number | null => {
    const collection = state.collection();
    const getAdjacent =
      direction === "forward"
        ? (k: string | number) => collection.getKeyAfter(k)
        : (k: string | number) => collection.getKeyBefore(k);
    const getBoundary =
      direction === "forward" ? () => collection.getFirstKey() : () => collection.getLastKey();

    let key = fromKey == null ? getBoundary() : getAdjacent(fromKey);
    while (key != null && isKeyDisabled(key)) {
      key = getAdjacent(key);
    }

    return key;
  };

  const focusKeyForOpen = (): string | number | null => {
    const selectedKey = state.selectedKey();
    if (selectedKey != null && !isKeyDisabled(selectedKey)) {
      return selectedKey;
    }
    return findNextKey(null, "forward");
  };

  const openWithFocus = () => {
    if (state.isOpen() || !canOpen()) {
      return;
    }
    state.open();
    const focusKey = focusKeyForOpen();
    if (focusKey != null) {
      state.setFocusedKey(focusKey);
    }
  };

  const { pressProps } = createPress({
    get isDisabled() {
      return getProps().isDisabled ?? state.isDisabled;
    },
    onPress(e) {
      if (e.pointerType === "keyboard") {
        return;
      }

      if (state.isOpen()) {
        state.close();
      } else {
        openWithFocus();
      }
    },
  });

  // Type-to-select - for Select, typing directly selects items when closed
  const { typeSelectProps } = createTypeSelect({
    collection: () => state.collection(),
    focusedKey: () => state.selectedKey(), // Use selectedKey as the "focused" key for closed Select
    onFocusedKeyChange: (key) => {
      // When closed, type-to-select directly changes selection
      if (!state.isOpen()) {
        state.setSelectedKey(key);
      } else {
        // When open, update focused key (listbox handles selection)
        state.setFocusedKey(key);
      }
    },
    isKeyDisabled,
    get isDisabled() {
      return Boolean(
        (getProps().disallowTypeAhead ?? false) || getProps().isDisabled || state.isDisabled,
      );
    },
  });

  // Keyboard navigation
  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    if (getProps().isDisabled ?? state.isDisabled) return;

    const currentKey = state.focusedKey() ?? state.selectedKey();

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (state.isOpen()) {
          state.close();
        } else {
          openWithFocus();
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!state.isOpen()) {
          if (!canOpen()) {
            return;
          }
          // ArrowDown: Open the dropdown and focus first/selected item
          state.open();
          const focusKey =
            currentKey != null && !isKeyDisabled(currentKey)
              ? currentKey
              : findNextKey(currentKey, "forward");
          if (focusKey) {
            state.setFocusedKey(focusKey);
          }
        }
        // When open, navigation is handled by the listbox
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!state.isOpen()) {
          if (!canOpen()) {
            return;
          }
          // ArrowUp: Open the dropdown and focus last/selected item
          state.open();
          const focusKey =
            currentKey != null && !isKeyDisabled(currentKey)
              ? currentKey
              : findNextKey(currentKey, "backward");
          if (focusKey) {
            state.setFocusedKey(focusKey);
          }
        }
        // When open, navigation is handled by the listbox
        break;

      case "ArrowRight":
        // ArrowRight: Select next option (for horizontal keyboard navigation pattern)
        if (!state.isOpen()) {
          e.preventDefault();
          const nextKey = findNextKey(currentKey, "forward");
          if (nextKey != null) {
            state.setSelectedKey(nextKey);
          }
        }
        break;

      case "ArrowLeft":
        // ArrowLeft: Select previous option (for horizontal keyboard navigation pattern)
        if (!state.isOpen()) {
          e.preventDefault();
          const prevKey = findNextKey(currentKey, "backward");
          if (prevKey != null) {
            state.setSelectedKey(prevKey);
          }
        }
        break;

      case "Home":
        // Home: Select first option
        if (!state.isOpen()) {
          e.preventDefault();
          const firstKey = findNextKey(null, "forward");
          if (firstKey != null) {
            state.setSelectedKey(firstKey);
          }
        }
        break;

      case "End":
        // End: Select last option
        if (!state.isOpen()) {
          e.preventDefault();
          const lastKey = findNextKey(null, "backward");
          if (lastKey != null) {
            state.setSelectedKey(lastKey);
          }
        }
        break;

      case "Escape":
        if (state.isOpen()) {
          e.preventDefault();
          state.close();
        }
        break;
    }
  };

  // Handle focus events
  const handleFocus = (e: FocusEvent) => {
    state.setFocused(true);
    getProps().onFocus?.(e);
    getProps().onFocusChange?.(true);
  };

  const handleBlur = (e: FocusEvent) => {
    state.setFocused(false);
    getProps().onBlur?.(e);
    getProps().onFocusChange?.(false);
  };

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get triggerProps() {
      const p = getProps();
      const isOpen = state.isOpen();
      const isDisabled = p.isDisabled ?? state.isDisabled;

      const baseProps = mergeProps(
        domProps(),
        pressProps as Record<string, unknown>,
        focusProps as Record<string, unknown>,
        fieldProps as Record<string, unknown>,
        {
          id: buttonId,
          type: "button",
          tabIndex: isDisabled ? undefined : 0,
          "aria-haspopup": "listbox",
          "aria-expanded": isOpen,
          "aria-controls": isOpen ? listBoxId : undefined,
          "aria-disabled": isDisabled || undefined,
          "aria-required": p.isRequired || undefined,
          "aria-describedby": p["aria-describedby"] || undefined,
          onKeyDown,
          onFocus: handleFocus,
          onBlur: handleBlur,
          "data-open": isOpen || undefined,
          "data-disabled": isDisabled || undefined,
          "data-focus-visible": isFocusVisible() || undefined,
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
    get valueProps() {
      return {
        id: valueId,
      } as JSX.HTMLAttributes<HTMLElement>;
    },
    get menuProps() {
      return {
        id: listBoxId,
        role: "listbox",
        "aria-labelledby": buttonId,
        "aria-multiselectable": state.selectionMode() === "multiple" ? true : undefined,
        tabIndex: -1,
      } as JSX.HTMLAttributes<HTMLElement>;
    },
    get descriptionProps() {
      return {
        id: descriptionId,
      } as JSX.HTMLAttributes<HTMLElement>;
    },
    get errorMessageProps() {
      return {
        id: errorMessageId,
      } as JSX.HTMLAttributes<HTMLElement>;
    },
    isFocused,
    isFocusVisible: () => isFocused() && isFocusVisible(),
    isOpen: state.isOpen,
    selectedItem: state.selectedItem,
  };
}
