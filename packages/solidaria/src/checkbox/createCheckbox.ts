/**
 * Checkbox hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a checkbox component.
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 *
 * This is a 1:1 port of @react-aria/checkbox's useCheckbox hook.
 */

import { JSX, Accessor, createEffect } from "solid-js";
import { createToggle, type AriaToggleProps } from "../toggle";
import { type ToggleState } from "@proyecto-viviana/solid-stately";
import { createPress } from "../interactions/createPress";
import { mergeProps } from "../utils/mergeProps";
import { type MaybeAccessor, access } from "../utils/reactivity";

export interface AriaCheckboxProps extends AriaToggleProps {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean;
  /**
   * Whether the checkbox is required.
   */
  isRequired?: boolean;
  /**
   * The validation behavior for the checkbox.
   * @default 'native'
   */
  validationBehavior?: "aria" | "native";
}

export interface CheckboxAria {
  /** Props for the label wrapper element. */
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the checkbox description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the checkbox error message element, if any. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the checkbox is selected. */
  isSelected: Accessor<boolean>;
  /** Whether the checkbox is in a pressed state. */
  isPressed: Accessor<boolean>;
  /** Whether the checkbox is disabled. */
  isDisabled: boolean;
  /** Whether the checkbox is read only. */
  isReadOnly: boolean;
  /** Whether the checkbox is invalid. */
  isInvalid: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox component.
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 *
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `createToggleState`.
 * @param inputRef - A ref accessor for the HTML input element.
 */
export function createCheckbox(
  props: MaybeAccessor<AriaCheckboxProps>,
  state: ToggleState,
  inputRef: () => HTMLInputElement | null,
): CheckboxAria {
  const getProps = () => access(props);

  // Get toggle aria props
  const toggleResult = createToggle(props, state, inputRef);
  const {
    labelProps: baseLabelProps,
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    isInvalid,
  } = toggleResult;

  // Handle indeterminate state
  createEffect(() => {
    const input = inputRef();
    const isIndeterminate = getProps().isIndeterminate;
    if (input) {
      // indeterminate is a property, but it can only be set via javascript
      // https://css-tricks.com/indeterminate-checkboxes/
      input.indeterminate = !!isIndeterminate;
    }
  });

  // Reset validation state on label press for checkbox with a hidden input.
  const { pressProps } = createPress({
    get isDisabled() {
      return isDisabled || isReadOnly;
    },
    onPress() {
      // Validation state reset would be handled here if we had form validation
      // For now, this is a no-op placeholder matching React-Aria's pattern
    },
  });

  return {
    labelProps: mergeProps(
      baseLabelProps as unknown as Record<string, unknown>,
      pressProps as unknown as Record<string, unknown>,
      {
        // Prevent label from being focused when mouse down on it.
        // Note, this does not prevent the input from being focused in the `click` event.
        onMouseDown: (e: MouseEvent) => e.preventDefault(),
      } as Record<string, unknown>,
    ) as JSX.LabelHTMLAttributes<HTMLLabelElement>,
    get inputProps() {
      const p = getProps();
      const { isRequired, validationBehavior = "native" } = p;

      return mergeProps(toggleResult.inputProps, {
        checked: isSelected(),
        "aria-required": (isRequired && validationBehavior === "aria") || undefined,
        required: isRequired && validationBehavior === "native",
      }) as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
    get descriptionProps() {
      return toggleResult.descriptionProps;
    },
    get errorMessageProps() {
      return toggleResult.errorMessageProps;
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    isInvalid,
  };
}
