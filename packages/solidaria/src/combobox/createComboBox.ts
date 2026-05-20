/**
 * Provides the behavior and accessibility implementation for a combobox component.
 * A combobox combines a text input with a listbox, allowing users to filter a list of options.
 * Based on @react-aria/combobox useComboBox.
 */

import { type JSX, type Accessor, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { createPress } from "../interactions/createPress";
import { createFocusRing } from "../interactions/createFocusRing";
import { createLabel } from "../label/createLabel";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { isAppleDevice } from "../utils/platform";
import { openLink } from "../utils/dom";
import { ariaHideOutside } from "../overlays/ariaHideOutside";
import { announce } from "../live-announcer";
import { createStringFormatter } from "../i18n";
import { comboBoxIntlStrings } from "./intl";
import { isDevEnv } from "../utils/env";
import type { ComboBoxState, CollectionNode, Key } from "@proyecto-viviana/solid-stately";

/**
 * Helper to count items in a collection
 */
function getItemCount<T>(collection: { getKeys(): Iterable<Key> }): number {
  let count = 0;
  for (const _ of collection.getKeys()) {
    count++;
  }
  return count;
}

export interface AriaComboBoxProps {
  /** An ID for the combobox. */
  id?: string;
  /** Whether the combobox is disabled. */
  isDisabled?: boolean;
  /** Whether the combobox is required. */
  isRequired?: boolean;
  /** Whether the combobox is read-only. */
  isReadOnly?: boolean;
  /** The label for the combobox. */
  label?: JSX.Element;
  /** An accessible label for the combobox when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the combobox. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the combobox. */
  "aria-describedby"?: string;
  /** Description text for assistive technology and form help. */
  description?: string;
  /** Error message text for assistive technology and validation feedback. */
  errorMessage?: string;
  /** Whether the current value is invalid. */
  isInvalid?: boolean;
  /** Placeholder text for the input when no value is entered. */
  placeholder?: string;
  /** Whether the combobox should be auto-focused. */
  autoFocus?: boolean;
  /** Handler called when focus moves to the combobox input. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler called when focus moves away from the combobox input. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler called when the focus state changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** The name of the combobox, used when submitting an HTML form. */
  name?: string;
  /** The form owner for the combobox input. */
  form?: string;
  /**
   * Describes the type of autocomplete functionality the input should provide.
   * @default 'list'
   */
  autoComplete?: "list" | "none" | "inline" | "both";
  /** Whether focus should wrap from the last item to the first. */
  shouldFocusWrap?: boolean;
}

export interface ComboBoxAria<T> {
  /** Props for the label element. */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the trigger button element. */
  buttonProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the listbox popup. */
  listBoxProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the error message element, if any. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the input is currently focused. */
  isFocused: Accessor<boolean>;
  /** Whether the input has keyboard focus. */
  isFocusVisible: Accessor<boolean>;
  /** Whether the listbox is currently open. */
  isOpen: Accessor<boolean>;
  /** The currently selected item. */
  selectedItem: Accessor<CollectionNode<T> | null>;
}

// Shared data between combobox and options
const comboBoxData = new WeakMap<object, ComboBoxData>();

interface ComboBoxData {
  id: string;
  listBoxId: string;
}

export function getComboBoxData(state: ComboBoxState<unknown>): ComboBoxData | undefined {
  return comboBoxData.get(state);
}

/**
 * Provides the behavior and accessibility implementation for a combobox component.
 */
export function createComboBox<T>(
  props: MaybeAccessor<AriaComboBoxProps>,
  state: ComboBoxState<T>,
  inputRef: () => HTMLInputElement | null,
  buttonRef?: () => HTMLElement | null,
  listBoxRef?: () => HTMLElement | null,
): ComboBoxAria<T> {
  const getProps = () => access(props);
  const id = createId(getProps().id);

  // Development-time warning for missing accessibility labels
  if (isDevEnv()) {
    const p = getProps();
    if (!p.label && !p["aria-label"] && !p["aria-labelledby"]) {
      console.warn(
        "[solidaria] A ComboBox requires a label, aria-label, or aria-labelledby attribute for accessibility.",
      );
    }
  }

  // Track if a pointerdown happened inside the listbox to prevent blur from closing
  let isPointerDownInsideListBox = false;

  // Generate IDs for associated elements
  const inputId = `${id}-input`;
  const buttonId = `${id}-button`;
  const listBoxId = `${id}-listbox`;
  const descriptionId = `${id}-description`;
  const errorMessageId = `${id}-error`;

  const getAriaDescribedBy = () => {
    const p = getProps();
    const ids: string[] = [];
    if (p["aria-describedby"]) {
      ids.push(p["aria-describedby"]);
    }
    if (p.description) {
      ids.push(descriptionId);
    }
    if (p.isInvalid && p.errorMessage) {
      ids.push(errorMessageId);
    }
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  // Set up global pointerdown listener to track clicks inside listbox
  // This is needed because the option's createPress stops propagation
  createEffect(() => {
    if (typeof document === "undefined") return;

    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Check if the click is inside the listbox
      if (target.closest(`[id="${listBoxId}"]`)) {
        isPointerDownInsideListBox = true;
      }
    };

    document.addEventListener("pointerdown", handleGlobalPointerDown, true);

    onCleanup(() => {
      document.removeEventListener("pointerdown", handleGlobalPointerDown, true);
    });
  });

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, {
      labelable: true,
      propNames: new Set(["form"]),
    });

  // Share data with child options
  createEffect(() => {
    comboBoxData.set(state, { id, listBoxId });

    onCleanup(() => {
      comboBoxData.delete(state);
    });
  });

  // Label handling
  const { labelProps, fieldProps } = createLabel({
    get id() {
      return inputId;
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
    labelElementType: "label",
  });

  // Focus ring for keyboard focus styling
  const { isFocusVisible, focusProps } = createFocusRing({
    get autoFocus() {
      return getProps().autoFocus;
    },
  });

  // Track focus state from state
  const isFocused = state.isFocused;

  // String formatter for VoiceOver announcements
  // Only create on client side
  const stringFormatter = !isServer ? createStringFormatter(comboBoxIntlStrings) : null;

  // Track previous values for announcements
  let lastFocusedKey: Key | null = null;
  let lastSelectedKey: Key | null = null;
  let lastOptionCount = 0;
  let lastIsOpen = false;

  // VoiceOver has issues with announcing aria-activedescendant properly on change
  // (especially on iOS). We use a live region announcer to announce focus changes
  // manually. This matches React Aria's behavior.
  createEffect(() => {
    if (isServer || !stringFormatter) return;

    const focusedKey = state.focusedKey();
    const isOpen = state.isOpen();
    const collection = state.collection();

    // Get the focused item
    const focusedItem = focusedKey != null && isOpen ? collection.getItem(focusedKey) : null;

    // Announce focus changes on Apple devices
    if (isAppleDevice() && focusedItem != null && focusedKey !== lastFocusedKey) {
      const isSelected = state.selectedKey() === focusedKey;
      const optionText = focusedItem.textValue || "";

      // For now, we don't support sections, so isGroupChange is always false
      const announcement = stringFormatter().format("focusAnnouncement", {
        isGroupChange: false,
        groupTitle: "",
        groupCount: 0,
        optionText,
        isSelected,
      });

      announce(announcement, "polite");
    }

    lastFocusedKey = focusedKey;
  });

  // Announce the number of available suggestions when it changes
  createEffect(() => {
    if (isServer || !stringFormatter) return;

    const isOpen = state.isOpen();
    const collection = state.collection();
    const optionCount = getItemCount(collection);
    const focusedKey = state.focusedKey();

    // Only announce the number of options available when the menu opens if there is no
    // focused item, otherwise screen readers will typically read e.g. "1 of 6".
    // The exception is VoiceOver since this isn't included in the message above.
    const didOpenWithoutFocusedItem =
      isOpen !== lastIsOpen && (focusedKey == null || isAppleDevice());

    if (isOpen && (didOpenWithoutFocusedItem || optionCount !== lastOptionCount)) {
      const announcement = stringFormatter().format("countAnnouncement", { optionCount });
      announce(announcement, "polite");
    }

    lastOptionCount = optionCount;
    lastIsOpen = isOpen;
  });

  // Announce when a selection occurs for VoiceOver. Other screen readers typically do this automatically.
  createEffect(() => {
    if (isServer || !stringFormatter) return;

    const selectedKey = state.selectedKey();
    const selectedItem = state.selectedItem();

    if (isAppleDevice() && state.isFocused() && selectedItem && selectedKey !== lastSelectedKey) {
      const optionText = selectedItem.textValue || "";
      const announcement = stringFormatter().format("selectedAnnouncement", { optionText });
      announce(announcement, "polite");
    }

    lastSelectedKey = selectedKey;
  });

  // Hide other page content from screen readers when the listbox is open.
  // This requires both the input and listbox refs to be available.
  // Note: This feature is important for screen reader accessibility but
  // only works when a popoverRef/listBoxRef is provided.
  createEffect(() => {
    if (isServer) return;

    const isOpen = state.isOpen();
    const inputEl = inputRef();
    const listBoxEl = listBoxRef?.();

    // Only apply ariaHideOutside if we have both elements available
    // This ensures the listbox won't be accidentally hidden
    if (isOpen && inputEl && listBoxEl) {
      const cleanup = ariaHideOutside([inputEl, listBoxEl]);
      onCleanup(cleanup);
    }
  });

  // Handle press on button trigger
  let wasOpenOnButtonPressStart = false;
  const scheduleButtonOpenFallback = (startedOpen: boolean) => {
    if (startedOpen) {
      return;
    }

    setTimeout(() => {
      const p = getProps();
      const isDisabled = p.isDisabled ?? state.isDisabled;
      const isReadOnly = p.isReadOnly ?? state.isReadOnly;
      if (!state.isOpen() && !isDisabled && !isReadOnly) {
        inputRef()?.focus();
        state.open(null, "manual");
      }
    }, 0);
  };

  const { pressProps } = createPress({
    get isDisabled() {
      return (
        (getProps().isDisabled ?? state.isDisabled) || (getProps().isReadOnly ?? state.isReadOnly)
      );
    },
    preventFocusOnPress: true,
    onPressStart(e) {
      if (e.pointerType === "touch") {
        return;
      }

      wasOpenOnButtonPressStart = state.isOpen();
      inputRef()?.focus();
      state.toggle(
        e.pointerType === "keyboard" || e.pointerType === "virtual" ? "first" : null,
        "manual",
      );
      scheduleButtonOpenFallback(wasOpenOnButtonPressStart);
    },
    onPress(e) {
      if (e.pointerType !== "touch") {
        return;
      }

      wasOpenOnButtonPressStart = state.isOpen();
      inputRef()?.focus();
      state.toggle(null, "manual");
      scheduleButtonOpenFallback(wasOpenOnButtonPressStart);
    },
  });

  // Handle input change
  const onInputChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const target = e.target as HTMLInputElement;
    state.setInputValue(target.value);
  };

  // Keyboard navigation for input
  const onInputKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return;

    const collection = state.collection();
    const focusedKey = state.focusedKey();
    const shouldWrap = p.shouldFocusWrap ?? false;

    switch (e.key) {
      case "Enter":
        if (state.isOpen() && focusedKey != null) {
          e.preventDefault();

          // Check if the focused item is a link
          // Link href can be in props (for components) or value (for dynamic items)
          const collectionItem = collection.getItem(focusedKey);
          const itemHref =
            collectionItem?.props?.href ??
            (collectionItem?.value as Record<string, unknown> | null)?.href;
          if (itemHref) {
            // Find the actual anchor element in the DOM and trigger navigation
            const listBox = listBoxRef?.();
            if (listBox) {
              const item = listBox.querySelector(`[data-key="${CSS.escape(String(focusedKey))}"]`);
              if (item instanceof HTMLAnchorElement) {
                openLink(item, e);
              }
            }
            state.close();
          } else {
            state.commit();
          }
        }
        break;

      case "Escape":
        if (state.isOpen()) {
          e.preventDefault();
          e.stopPropagation();
          state.revert();
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!state.isOpen()) {
          state.open("first", "manual");
        } else {
          // Move to next item
          if (focusedKey == null) {
            const firstKey = collection.getFirstKey();
            if (firstKey != null) {
              state.setFocusedKey(firstKey);
            }
          } else {
            let nextKey = collection.getKeyAfter(focusedKey);
            // Skip disabled keys
            while (nextKey != null && state.isKeyDisabled(nextKey)) {
              nextKey = collection.getKeyAfter(nextKey);
            }
            if (nextKey != null) {
              state.setFocusedKey(nextKey);
            } else if (shouldWrap) {
              // Wrap to first
              let firstKey = collection.getFirstKey();
              while (firstKey != null && state.isKeyDisabled(firstKey)) {
                firstKey = collection.getKeyAfter(firstKey);
              }
              if (firstKey != null) {
                state.setFocusedKey(firstKey);
              }
            }
          }
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!state.isOpen()) {
          state.open("last", "manual");
        } else {
          // Move to previous item
          if (focusedKey == null) {
            const lastKey = collection.getLastKey();
            if (lastKey != null) {
              state.setFocusedKey(lastKey);
            }
          } else {
            let prevKey = collection.getKeyBefore(focusedKey);
            // Skip disabled keys
            while (prevKey != null && state.isKeyDisabled(prevKey)) {
              prevKey = collection.getKeyBefore(prevKey);
            }
            if (prevKey != null) {
              state.setFocusedKey(prevKey);
            } else if (shouldWrap) {
              // Wrap to last
              let lastKey = collection.getLastKey();
              while (lastKey != null && state.isKeyDisabled(lastKey)) {
                lastKey = collection.getKeyBefore(lastKey);
              }
              if (lastKey != null) {
                state.setFocusedKey(lastKey);
              }
            }
          }
        }
        break;

      case "Home":
        if (state.isOpen()) {
          e.preventDefault();
          let firstKey = collection.getFirstKey();
          while (firstKey != null && state.isKeyDisabled(firstKey)) {
            firstKey = collection.getKeyAfter(firstKey);
          }
          if (firstKey != null) {
            state.setFocusedKey(firstKey);
          }
        }
        break;

      case "End":
        if (state.isOpen()) {
          e.preventDefault();
          let lastKey = collection.getLastKey();
          while (lastKey != null && state.isKeyDisabled(lastKey)) {
            lastKey = collection.getKeyBefore(lastKey);
          }
          if (lastKey != null) {
            state.setFocusedKey(lastKey);
          }
        }
        break;

      case "Backspace":
        // In multiple mode, remove last selected key when input is empty
        if (state.selectionMode() === "multiple" && state.inputValue() === "") {
          const keys = state.selectedKeys();
          if (keys.size > 0) {
            const lastKey = Array.from(keys).pop()!;
            state.removeSelectedKey(lastKey);
          }
        }
        break;

      case "Tab":
        // Commit on Tab if menu is open
        if (state.isOpen() && focusedKey != null) {
          state.commit();
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

  // Track the last touch event time for iPad VoiceOver double-tap debouncing
  let lastEventTime = 0;

  const handleBlur = (e: FocusEvent) => {
    // Use synchronous ref checks instead of requestAnimationFrame
    // This matches React Aria's implementation and is more reliable
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const button = buttonRef?.();
    const listBox = listBoxRef?.();

    // Don't blur if focus is moving to the button
    const blurFromButton = button && button === relatedTarget;

    // Don't blur if focus is moving into the listbox/popover
    const blurIntoPopover = listBox?.contains(relatedTarget);

    if (blurFromButton || blurIntoPopover) {
      return;
    }

    // If a pointerdown happened inside the listbox, don't close
    // This handles the case when clicking on a non-focusable option
    if (isPointerDownInsideListBox) {
      isPointerDownInsideListBox = false;
      return;
    }

    // Call user's onBlur handler
    getProps().onBlur?.(e);

    state.setFocused(false);
    getProps().onFocusChange?.(false);
  };

  // Handle touch events for iPad VoiceOver
  // VoiceOver on iOS fires a touchend at the center of the element on double-tap.
  // We detect this and toggle the combobox manually to avoid issues with focus management.
  const handleTouchEnd = (e: TouchEvent) => {
    const p = getProps();
    const isDisabled = p.isDisabled ?? state.isDisabled;
    const isReadOnly = p.isReadOnly ?? state.isReadOnly;

    if (isDisabled || isReadOnly) {
      return;
    }

    // Debounce rapid consecutive touchend events (< 500ms)
    // This handles VoiceOver's double-tap behavior
    if (e.timeStamp - lastEventTime < 500) {
      e.preventDefault();
      inputRef()?.focus();
      return;
    }

    // Detect VoiceOver virtual click - it fires at the exact center of the element
    const rect = (e.target as Element).getBoundingClientRect();
    const touch = e.changedTouches[0];
    const centerX = Math.ceil(rect.left + 0.5 * rect.width);
    const centerY = Math.ceil(rect.top + 0.5 * rect.height);

    if (touch.clientX === centerX && touch.clientY === centerY) {
      e.preventDefault();
      inputRef()?.focus();
      state.toggle(null, "manual");
      lastEventTime = e.timeStamp;
    }
  };

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get inputProps() {
      const p = getProps();
      const isOpen = state.isOpen();
      const isDisabled = p.isDisabled ?? state.isDisabled;
      const isReadOnly = p.isReadOnly ?? state.isReadOnly;
      const focusedKey = state.focusedKey();

      return mergeProps(
        domProps(),
        focusProps as Record<string, unknown>,
        fieldProps as Record<string, unknown>,
        {
          id: inputId,
          type: "text",
          role: "combobox",
          get value() {
            return state.inputValue();
          },
          tabIndex: isDisabled ? undefined : 0,
          disabled: isDisabled || undefined,
          readOnly: isReadOnly || undefined,
          placeholder: p.placeholder,
          autoComplete: "off",
          "aria-autocomplete": p.autoComplete ?? "list",
          "aria-haspopup": "listbox",
          "aria-expanded": isOpen,
          "aria-controls": isOpen ? listBoxId : undefined,
          "aria-activedescendant":
            isOpen && focusedKey != null ? `${listBoxId}-option-${focusedKey}` : undefined,
          "aria-disabled": isDisabled || undefined,
          "aria-required": p.isRequired || undefined,
          "aria-invalid": p.isInvalid || undefined,
          "aria-describedby": getAriaDescribedBy(),
          name: p.name,
          onInput: onInputChange,
          onKeyDown: onInputKeyDown,
          onFocus: handleFocus,
          onBlur: handleBlur,
          onTouchEnd: handleTouchEnd,
          "data-open": isOpen || undefined,
          "data-disabled": isDisabled || undefined,
          "data-readonly": isReadOnly || undefined,
          "data-focus-visible": isFocusVisible() || undefined,
        } as Record<string, unknown>,
      ) as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
    get buttonProps() {
      const p = getProps();
      const isOpen = state.isOpen();
      const isDisabled = p.isDisabled ?? state.isDisabled;
      const isReadOnly = p.isReadOnly ?? state.isReadOnly;

      return mergeProps(
        pressProps as Record<string, unknown>,
        {
          id: buttonId,
          type: "button",
          tabIndex: -1,
          "aria-haspopup": "listbox",
          "aria-expanded": isOpen,
          "aria-controls": isOpen ? listBoxId : undefined,
          "aria-disabled": isDisabled || isReadOnly || undefined,
          disabled: isDisabled || isReadOnly || undefined,
          "aria-label": stringFormatter?.().format("buttonLabel") ?? "Show suggestions",
          "data-open": isOpen || undefined,
          "data-disabled": isDisabled || isReadOnly || undefined,
        } as Record<string, unknown>,
      ) as JSX.HTMLAttributes<HTMLElement>;
    },
    get listBoxProps() {
      const isMulti = state.selectionMode() === "multiple";
      return {
        id: listBoxId,
        role: "listbox",
        "aria-labelledby": inputId,
        "aria-multiselectable": isMulti || undefined,
        tabIndex: -1,
        shouldSelectOnPressUp: true,
        shouldFocusOnHover: true,
        // Track pointerdown inside listbox to prevent blur from closing
        // Use capture phase because createPress calls stopPropagation on pointerdown
        onPointerDownCapture: () => {
          isPointerDownInsideListBox = true;
        },
        onMouseDownCapture: () => {
          // Fallback for environments without PointerEvent
          isPointerDownInsideListBox = true;
        },
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
        role: "alert",
      } as JSX.HTMLAttributes<HTMLElement>;
    },
    isFocused,
    isFocusVisible: () => isFocused() && isFocusVisible(),
    isOpen: state.isOpen,
    selectedItem: state.selectedItem,
  };
}
