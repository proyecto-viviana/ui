/**
 * createAutocomplete - Accessibility hook for autocomplete components
 *
 * Provides keyboard navigation, virtual focus via aria-activedescendant,
 * and filtering capabilities for autocomplete inputs.
 *
 * Based on @react-aria/autocomplete useAutocomplete.
 */

import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";
import { createId, getOwnerDocument } from "../ssr";
import { type AutocompleteState } from "@proyecto-viviana/solid-stately";

export interface CollectionOptions {
  /** The id of the collection element. */
  id?: string;
  /** Accessible label for the collection. */
  "aria-label"?: string;
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus: boolean;
  /** Whether typeahead is disabled. */
  disallowTypeAhead: boolean;
}

export interface AutocompleteInputProps {
  /** Current input value. */
  value: Accessor<string>;
  /** Handler for input value changes. */
  onChange: (value: string) => void;
  /** Handler for key events. */
  onKeyDown: (e: KeyboardEvent) => void;
  /** Handler for focus events. */
  onFocus: (e: FocusEvent) => void;
  /** Handler for blur events. */
  onBlur: (e: FocusEvent) => void;
  /** The id of the currently focused item for aria-activedescendant. */
  "aria-activedescendant": Accessor<string | undefined>;
  /** The id of the controlled collection. */
  "aria-controls": string;
  /** Autocomplete type. */
  "aria-autocomplete": "list" | "none" | "inline" | "both";
  /** Enter key hint for mobile keyboards. */
  enterKeyHint: "go";
  /** Disable autocorrect. */
  autoCorrect: "off";
  /** Disable spell check. */
  spellCheck: "false";
  /** Disable browser autocomplete. */
  autoComplete: "off";
}

export interface AriaAutocompleteOptions<_T = unknown> {
  /** Ref accessor for the input element. */
  inputRef: Accessor<HTMLInputElement | undefined>;
  /** Ref accessor for the collection element. */
  collectionRef: Accessor<HTMLElement | undefined>;
  /** Optional id override for the controlled collection element. */
  collectionId?: string;
  /** Optional accessible name for the controlled collection element. */
  collectionAriaLabel?: string;
  /**
   * An optional filter function used to determine if an option should be included.
   * @param textValue - The text value of the item
   * @param inputValue - The current input value
   */
  filter?: (textValue: string, inputValue: string) => boolean;
  /**
   * Whether to focus the first item after filtering.
   * @default false
   */
  disableAutoFocusFirst?: boolean;
  /**
   * Whether to disable virtual focus (aria-activedescendant).
   * @default false
   */
  disableVirtualFocus?: boolean;
}

export interface AutocompleteAria<_T = unknown> {
  /** Props for the autocomplete input element. */
  inputProps: AutocompleteInputProps;
  /** Props for the collection (ListBox/Menu). */
  collectionProps: CollectionOptions;
  /** A filter function that returns if the item should be shown. */
  filter?: (textValue: string) => boolean;
}

function toKeyboardEventInit(e: KeyboardEvent): KeyboardEventInit {
  return {
    key: e.key,
    code: e.code,
    location: e.location,
    repeat: e.repeat,
    isComposing: e.isComposing,
    ctrlKey: e.ctrlKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    metaKey: e.metaKey,
    bubbles: e.bubbles,
    cancelable: e.cancelable,
  };
}

// Custom event names for collection communication
export const AUTOCOMPLETE_FOCUS_EVENT = "autocomplete:focus";
export const AUTOCOMPLETE_CLEAR_FOCUS_EVENT = "autocomplete:clearfocus";

/**
 * Provides the behavior and accessibility implementation for an autocomplete component.
 * An autocomplete combines a text input with a collection, allowing users to filter
 * the collection's contents to match a query.
 *
 * @example
 * ```tsx
 * const state = createAutocompleteState({ defaultInputValue: '' });
 * let inputRef, collectionRef;
 *
 * const { inputProps, collectionProps, filter } = createAutocomplete({
 *   inputRef: () => inputRef,
 *   collectionRef: () => collectionRef,
 *   filter: (textValue, inputValue) =>
 *     textValue.toLowerCase().includes(inputValue.toLowerCase()),
 * }, state);
 *
 * return (
 *   <div>
 *     <input ref={inputRef} {...inputProps} />
 *     <ul ref={collectionRef} {...collectionProps}>
 *       {items.filter(item => filter?.(item.name) ?? true).map(item => (
 *         <li key={item.id}>{item.name}</li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 * ```
 */
export function createAutocomplete<T = unknown>(
  props: AriaAutocompleteOptions<T>,
  state: AutocompleteState,
): AutocompleteAria<T> {
  const {
    inputRef,
    collectionRef,
    filter,
    collectionId: collectionIdProp,
    collectionAriaLabel,
    disableAutoFocusFirst = false,
    disableVirtualFocus = false,
  } = props;

  const collectionId = collectionIdProp ?? createId();
  const [shouldUseVirtualFocus] = createSignal(!disableVirtualFocus);
  let lastInputType = "";

  // Track the input type for determining focus behavior. We listen to
  // `beforeinput` (not `input`) so `lastInputType` is set before the input's
  // `onChange` runs, mirroring @react-aria/autocomplete.
  const handleBeforeInput = (e: Event) => {
    const inputEvent = e as InputEvent;
    lastInputType = inputEvent.inputType || "";
  };

  // Set up beforeinput event listener
  createEffect(() => {
    const input = inputRef();
    if (input) {
      input.addEventListener("beforeinput", handleBeforeInput);
      onCleanup(() => {
        input.removeEventListener("beforeinput", handleBeforeInput);
      });
    }
  });

  // Focus first item in collection
  const focusFirstItem = () => {
    const collection = collectionRef();
    if (collection) {
      collection.dispatchEvent(
        new CustomEvent(AUTOCOMPLETE_FOCUS_EVENT, {
          cancelable: true,
          bubbles: true,
          detail: { focusStrategy: "first" },
        }),
      );
    }
  };

  // Clear virtual focus
  const clearVirtualFocus = (clearFocusKey = false) => {
    state.setFocusedNodeId(null);
    const collection = collectionRef();
    if (collection) {
      collection.dispatchEvent(
        new CustomEvent(AUTOCOMPLETE_CLEAR_FOCUS_EVENT, {
          cancelable: true,
          bubbles: true,
          detail: { clearFocusKey },
        }),
      );
    }
  };

  // Handle input value changes
  const onChange = (value: string) => {
    // Focus first item when typing forward, clear when backspacing/pasting.
    // IME composition (e.g. CJK input) reports 'insertCompositionText'/
    // 'insertFromComposition' instead of 'insertText'; treat those as forward
    // typing so the first item still gets virtual focus.
    if (
      (lastInputType === "insertText" ||
        lastInputType === "insertCompositionText" ||
        lastInputType === "insertFromComposition") &&
      !disableAutoFocusFirst
    ) {
      focusFirstItem();
    } else if (
      lastInputType &&
      (lastInputType.includes("insert") ||
        lastInputType.includes("delete") ||
        lastInputType.includes("history"))
    ) {
      clearVirtualFocus(true);
    }

    state.setInputValue(value);
  };

  // Handle keyboard navigation
  const onKeyDown = (e: KeyboardEvent) => {
    if ("isComposing" in e && e.isComposing) {
      return;
    }

    const focusedNodeId = state.focusedNodeId();
    const collection = collectionRef();
    const ownerDocument = getOwnerDocument(inputRef() ?? collection);

    switch (e.key) {
      case "Escape":
        // Let the input handle Escape (e.g., clear value)
        if (e.defaultPrevented) {
          return;
        }
        break;

      case " ":
        // Space shouldn't trigger item action
        return;

      case "Tab":
        // Let Tab propagate normally for focus management
        return;

      case "ArrowUp":
      case "ArrowDown":
      case "Home":
      case "End":
      case "PageUp":
      case "PageDown": {
        // Prevent cursor movement in input
        e.preventDefault();

        // Dispatch focus event to collection
        if (collection) {
          collection.dispatchEvent(
            new CustomEvent(AUTOCOMPLETE_FOCUS_EVENT, {
              cancelable: true,
              bubbles: true,
            }),
          );
        }
        break;
      }

      case "ArrowLeft":
      case "ArrowRight":
        // Clear activedescendant so screen reader announces cursor movement
        clearVirtualFocus();
        return;

      case "Enter":
        // Trigger click on focused item
        if (focusedNodeId) {
          const item = ownerDocument?.getElementById(focusedNodeId);
          if (item) {
            item.click();
            e.preventDefault();
          }
        }
        return;
    }

    // Forward keyboard events to collection/focused item
    if (!e.defaultPrevented && collection) {
      e.stopPropagation();

      if (focusedNodeId) {
        const item = ownerDocument?.getElementById(focusedNodeId);
        if (item) {
          item.dispatchEvent(new KeyboardEvent(e.type, toKeyboardEventInit(e)));
        }
      } else {
        collection.dispatchEvent(new KeyboardEvent(e.type, toKeyboardEventInit(e)));
      }
    }
  };

  // Handle focus events
  const onFocus = (e: FocusEvent) => {
    if (!e.isTrusted) return;

    // Restore virtual focus when refocusing input
    const focusedNodeId = state.focusedNodeId();
    if (focusedNodeId) {
      const item = document.getElementById(focusedNodeId);
      if (item) {
        // Item still exists, keep focus on it
      }
    }
  };

  const onBlur = (e: FocusEvent) => {
    if (!e.isTrusted) return;
    // Virtual focus blur handling would go here
  };

  // Create filter function
  const filterFn = filter
    ? (textValue: string) => filter(textValue, state.inputValue())
    : undefined;

  return {
    inputProps: {
      value: state.inputValue,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      get "aria-activedescendant"() {
        return () => (shouldUseVirtualFocus() ? (state.focusedNodeId() ?? undefined) : undefined);
      },
      "aria-controls": collectionId,
      "aria-autocomplete": "list",
      enterKeyHint: "go",
      autoCorrect: "off",
      spellCheck: "false",
      autoComplete: "off",
    },
    collectionProps: {
      id: collectionId,
      "aria-label": collectionAriaLabel,
      shouldUseVirtualFocus: shouldUseVirtualFocus(),
      disallowTypeAhead: shouldUseVirtualFocus(),
    },
    filter: filterFn,
  };
}
