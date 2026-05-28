/**
 * Provides the behavior and accessibility implementation for a search field.
 * A search field allows a user to enter and clear a search query.
 * Based on @react-aria/searchfield useSearchField.
 */

import { type JSX } from "solid-js";
import { createTextField, type AriaTextFieldProps, type TextFieldAria } from "../textfield";
import { mergeProps } from "../utils";
import { type MaybeAccessor, access } from "../utils/reactivity";
import type { SearchFieldState } from "@proyecto-viviana/solid-stately";

export interface AriaSearchFieldProps extends AriaTextFieldProps {
  /** Handler that is called when the user submits the search (pressing Enter). */
  onSubmit?: (value: string) => void;
  /** Handler that is called when the clear button is pressed or Escape clears the field. */
  onClear?: () => void;
}

export interface SearchFieldAria extends Omit<TextFieldAria, "inputProps"> {
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the clear button. */
  clearButtonProps: {
    "aria-label": string;
    tabIndex: number;
    disabled?: boolean;
    onMouseDown: (e: MouseEvent) => void;
    onClick: () => void;
  };
}

/**
 * Provides the behavior and accessibility implementation for a search field.
 */
export function createSearchField(
  props: MaybeAccessor<AriaSearchFieldProps>,
  state: SearchFieldState,
  inputRef?: () => HTMLInputElement | null,
): SearchFieldAria {
  const getProps = () => access(props);

  const setValue = (value: string) => {
    if (state.value() === value) {
      return;
    }

    state.setValue(value);
    getProps().onChange?.(value);
  };

  // Use createTextField for the base implementation
  const textFieldAria = createTextField({
    get value() {
      return state.value();
    },
    get isDisabled() {
      return getProps().isDisabled;
    },
    get isReadOnly() {
      return getProps().isReadOnly;
    },
    get isRequired() {
      return getProps().isRequired;
    },
    get isInvalid() {
      return getProps().isInvalid;
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
    get "aria-describedby"() {
      return getProps()["aria-describedby"];
    },
    get description() {
      return getProps().description;
    },
    get errorMessage() {
      return getProps().errorMessage;
    },
    get placeholder() {
      return getProps().placeholder;
    },
    get name() {
      return getProps().name;
    },
    get form() {
      return getProps().form;
    },
    get validationBehavior() {
      return getProps().validationBehavior ?? "native";
    },
    get type() {
      return getProps().type ?? "search";
    },
    get autoFocus() {
      return getProps().autoFocus;
    },
    get excludeFromTabOrder() {
      return getProps().excludeFromTabOrder;
    },
    get autoComplete() {
      return getProps().autoComplete;
    },
    get inputMode() {
      return getProps().inputMode;
    },
    get enterKeyHint() {
      return getProps().enterKeyHint;
    },
    get autoCorrect() {
      return getProps().autoCorrect;
    },
    get autoCapitalize() {
      return getProps().autoCapitalize;
    },
    get spellCheck() {
      return getProps().spellCheck;
    },
    get maxLength() {
      return getProps().maxLength;
    },
    get minLength() {
      return getProps().minLength;
    },
    get pattern() {
      return getProps().pattern;
    },
    get onFocus() {
      return getProps().onFocus;
    },
    get onBlur() {
      return getProps().onBlur;
    },
    get onFocusChange() {
      return getProps().onFocusChange;
    },
    get onKeyDown() {
      return getProps().onKeyDown;
    },
    get onKeyUp() {
      return getProps().onKeyUp;
    },
    get onCopy() {
      return getProps().onCopy;
    },
    get onCut() {
      return getProps().onCut;
    },
    get onPaste() {
      return getProps().onPaste;
    },
    get onCompositionStart() {
      return getProps().onCompositionStart;
    },
    get onCompositionEnd() {
      return getProps().onCompositionEnd;
    },
    get onCompositionUpdate() {
      return getProps().onCompositionUpdate;
    },
    get onSelect() {
      return getProps().onSelect;
    },
    get onBeforeInput() {
      return getProps().onBeforeInput;
    },
    get onInput() {
      return getProps().onInput;
    },
    onChange: setValue,
  });

  // Handle keyboard events for search field
  const onKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    const p = getProps();

    if (p.isDisabled || p.isReadOnly) {
      if (e.key === "Enter") {
        e.preventDefault();
      }
      return;
    }

    if (e.key === "Enter" && p.onSubmit) {
      e.preventDefault();
      p.onSubmit(state.value());
    }

    if (e.key === "Escape") {
      const currentValue = state.value();
      const inputValue = inputRef?.()?.value ?? "";

      // Only clear if there's a value
      if (currentValue !== "" || inputValue !== "") {
        e.preventDefault();
        e.stopPropagation();
        const input = inputRef?.();
        if (input) {
          input.value = "";
        }
        setValue("");
        p.onClear?.();
      }
    }
  };

  // Handle clear button click
  const onClearButtonClick = () => {
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return;
    const input = inputRef?.();
    if (input) {
      input.value = "";
    }
    setValue("");
    p.onClear?.();
    // Focus the input after clearing
    inputRef?.()?.focus();
  };

  // Prevent focus from leaving input on mobile when clicking clear button
  const onClearButtonMouseDown = (e: MouseEvent) => {
    e.preventDefault();
  };

  return {
    get labelProps() {
      return textFieldAria.labelProps;
    },
    get inputProps() {
      return mergeProps(
        {
          onKeyDown,
          // Clear defaultValue since it's handled by state
          defaultValue: undefined,
        } as Record<string, unknown>,
        textFieldAria.inputProps as Record<string, unknown>,
      ) as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
    get clearButtonProps() {
      const p = getProps();
      const isDisabled = p.isDisabled || p.isReadOnly;

      return {
        "aria-label": "Clear search",
        tabIndex: -1, // Exclude from tab order
        disabled: isDisabled,
        onMouseDown: onClearButtonMouseDown,
        onClick: onClearButtonClick,
      };
    },
    get descriptionProps() {
      return textFieldAria.descriptionProps;
    },
    get errorMessageProps() {
      return textFieldAria.errorMessageProps;
    },
    get isInvalid() {
      return textFieldAria.isInvalid;
    },
  };
}
