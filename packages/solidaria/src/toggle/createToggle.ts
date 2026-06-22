/**
 * Toggle hook for Solidaria
 *
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 *
 * This is a 1:1 port of @react-aria/toggle's useToggle hook.
 */

import { JSX, Accessor, createEffect } from "solid-js";
import { createPress } from "../interactions/createPress";
import { createFocusable } from "../interactions/createFocusable";
import { mergeProps } from "../utils/mergeProps";
import { filterDOMProps } from "../utils/filterDOMProps";
import { type MaybeAccessor, access } from "../utils/reactivity";
import { isDevEnv } from "../utils/env";
import { createSlotId } from "../ssr";
import { type ToggleState } from "@proyecto-viviana/solid-stately";
import { type PressEvent } from "../interactions/PressEvent";

export interface AriaToggleProps {
  /** Whether the element should be selected (controlled). */
  isSelected?: boolean;
  /** Whether the element should be selected by default (uncontrolled). */
  defaultSelected?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (isSelected: boolean) => void;
  /** The value of the input element, used when submitting an HTML form. */
  value?: string;
  /** The name of the input element, used when submitting an HTML form. */
  name?: string;
  /** The form to associate the input with. */
  form?: string;
  /** Whether the element is disabled. */
  isDisabled?: boolean;
  /** Whether the element is read only. */
  isReadOnly?: boolean;
  /** Whether the element is required. */
  isRequired?: boolean;
  /** Whether the element is invalid. */
  isInvalid?: boolean;
  /** The element's children. */
  children?: JSX.Element;
  /** Defines a string value that labels the current element. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide an error message for the object. */
  "aria-errormessage"?: string;
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  "aria-controls"?: string;
  /** The element's unique identifier. */
  id?: string;
  /** Handler that is called when the press is released over the target. */
  onPress?: (e: PressEvent) => void;
  /** Handler that is called when a press interaction starts. */
  onPressStart?: (e: PressEvent) => void;
  /** Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. */
  onPressEnd?: (e: PressEvent) => void;
  /** Handler that is called when the press state changes. */
  onPressChange?: (isPressed: boolean) => void;
  /** Handler that is called when a press is released over the target, regardless of whether it started on the target or not. */
  onPressUp?: (e: PressEvent) => void;
  /** Handler that is called when the element is clicked. */
  onClick?: (e: MouseEvent) => void;
  /** Handler that is called when the element receives focus. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler that is called when the element loses focus. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler that is called when the element's focus status changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler that is called when a key is pressed. */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Handler that is called when a key is released. */
  onKeyUp?: (e: KeyboardEvent) => void;
  /** Whether to exclude the element from the tab order. */
  excludeFromTabOrder?: boolean;
  /** Whether to autofocus the element. */
  autoFocus?: boolean;
}

export interface ToggleAria {
  /** Props to be spread on the label element. */
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  /** Props to be spread on the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the error message element, if any. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the toggle is selected. */
  isSelected: Accessor<boolean>;
  /** Whether the toggle is in a pressed state. */
  isPressed: Accessor<boolean>;
  /** Whether the toggle is disabled. */
  isDisabled: boolean;
  /** Whether the toggle is read only. */
  isReadOnly: boolean;
  /** Whether the toggle is invalid. */
  isInvalid: boolean;
}

/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 */
export function createToggle(
  props: MaybeAccessor<AriaToggleProps>,
  state: ToggleState,
  ref: () => HTMLInputElement | null,
): ToggleAria {
  const getProps = () => access(props);

  const isDisabled = () => getProps().isDisabled ?? false;
  const isReadOnly = () => getProps().isReadOnly ?? false;
  const isInvalid = () => {
    return getProps().isInvalid ?? false;
  };

  // Handle press state for keyboard interactions and cases where labelProps is not used.
  const { pressProps, isPressed } = createPress({
    get onPressStart() {
      return getProps().onPressStart;
    },
    get onPressEnd() {
      return getProps().onPressEnd;
    },
    get onPressChange() {
      return getProps().onPressChange;
    },
    get onPress() {
      return getProps().onPress;
    },
    get onPressUp() {
      return getProps().onPressUp;
    },
    get onClick() {
      return getProps().onClick;
    },
    get isDisabled() {
      return isDisabled();
    },
  });

  // Handle press state on the label.
  const { pressProps: labelPressProps, isPressed: isLabelPressed } = createPress({
    get onPressStart() {
      return getProps().onPressStart;
    },
    get onPressEnd() {
      return getProps().onPressEnd;
    },
    get onPressChange() {
      return getProps().onPressChange;
    },
    get onPressUp() {
      return getProps().onPressUp;
    },
    get onClick() {
      return getProps().onClick;
    },
    onPress(e: PressEvent) {
      getProps().onPress?.(e);
      state.toggle();
      ref()?.focus();
    },
    get isDisabled() {
      return isDisabled() || isReadOnly();
    },
  });

  // Handle focusable - extract the relevant props for createFocusable
  const { focusableProps } = createFocusable(
    {
      get isDisabled() {
        return isDisabled();
      },
      get autoFocus() {
        return getProps().autoFocus;
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
      get excludeFromTabOrder() {
        return getProps().excludeFromTabOrder;
      },
    },
    ref as unknown as (el: HTMLElement) => void,
  );

  // Combine press and focusable props for input
  const interactions = mergeProps(pressProps, focusableProps);

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  // Handle input change
  const onChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    // Since we spread props on label, onChange will end up there as well as in here.
    // So we have to stop propagation at the lowest level that we care about
    e.stopPropagation();

    // Don't update state if readonly
    if (isReadOnly()) {
      // Reset the checkbox to its previous state since the browser already toggled it
      e.currentTarget.checked = state.isSelected();
      return;
    }

    state.setSelected(e.currentTarget.checked);
  };

  // Warn if no accessible label
  createEffect(() => {
    const p = getProps();
    const hasChildren = p.children != null;
    const hasAriaLabel = p["aria-label"] != null || p["aria-labelledby"] != null;
    if (!hasChildren && !hasAriaLabel && isDevEnv()) {
      console.warn(
        "If you do not provide children, you must specify an aria-label for accessibility",
      );
    }
  });

  // Combined pressed state
  const combinedIsPressed: Accessor<boolean> = () => isPressed() || isLabelPressed();

  // Mint ids for the description and error message slots. Copied from createField
  // because we don't want the label behavior that provides — the id resolves only
  // once an element with that id is actually rendered (e.g. via TextContext slots).
  const descriptionId = createSlotId();
  const errorMessageId = createSlotId();

  return {
    labelProps: mergeProps(labelPressProps, {
      onClick: (e: MouseEvent) => e.preventDefault(),
    }) as JSX.LabelHTMLAttributes<HTMLLabelElement>,
    get inputProps() {
      const p = getProps();
      return mergeProps(domProps(), {
        "aria-invalid": isInvalid() || undefined,
        "aria-errormessage": p["aria-errormessage"],
        "aria-controls": p["aria-controls"],
        "aria-readonly": isReadOnly() || undefined,
        "aria-describedby":
          [descriptionId(), errorMessageId(), p["aria-describedby"]]
            .filter(Boolean)
            .join(" ") || undefined,
        onChange,
        disabled: isDisabled(),
        ...(p.value == null ? {} : { value: p.value }),
        name: p.name,
        form: p.form,
        type: "checkbox" as const,
        ...interactions,
        // Stop click propagation to prevent labelProps.onClick from calling preventDefault
        // which would prevent the checkbox from toggling in JSDOM/testing-library environments
        onClick: (e: MouseEvent) => e.stopPropagation(),
      }) as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
    get descriptionProps() {
      return { id: descriptionId() };
    },
    get errorMessageProps() {
      return { id: errorMessageId() };
    },
    isSelected: state.isSelected,
    isPressed: combinedIsPressed,
    isDisabled: isDisabled(),
    isReadOnly: isReadOnly(),
    isInvalid: isInvalid(),
  };
}
