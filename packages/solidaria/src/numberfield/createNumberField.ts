/**
 * Provides the behavior and accessibility implementation for a number field.
 * Based on @react-aria/numberfield useNumberField.
 */

import { type JSX, createMemo } from "solid-js";
import { createLabel } from "../label/createLabel";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { NumberFieldState } from "@proyecto-viviana/solid-stately";
import type { AriaButtonProps } from "../button/types";
import type { PressEvent } from "../interactions";

export interface AriaNumberFieldProps {
  /** A label for the number field. */
  label?: JSX.Element;
  /** An accessible label for the number field. */
  "aria-label"?: string;
  /** The element ID that labels the number field. */
  "aria-labelledby"?: string;
  /** The element ID that describes the number field. */
  "aria-describedby"?: string;
  /** Whether the number field is disabled. */
  isDisabled?: boolean;
  /** Whether the number field is read-only. */
  isReadOnly?: boolean;
  /** Whether the number field is required. */
  isRequired?: boolean;
  /** Whether the number field is invalid. */
  isInvalid?: boolean;
  /** A description for the number field. */
  description?: JSX.Element;
  /** An error message for the number field. */
  errorMessage?: JSX.Element;
  /** The ID of the number field. */
  id?: string;
  /** Whether to auto-focus the input. */
  autoFocus?: boolean;
  /** The name for the form input. */
  name?: string;
  /** The form element this input belongs to. */
  form?: string;
  /** Handler for focus events. */
  onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>;
  /** Handler for blur events. */
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>;
  /** Handler called when focus state changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler for key down events. */
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>;
  /** Handler for key up events. */
  onKeyUp?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>;
  /** Handler for paste events. */
  onPaste?: JSX.EventHandler<HTMLInputElement, ClipboardEvent>;
  /** Handler for copy events. */
  onCopy?: JSX.EventHandler<HTMLInputElement, ClipboardEvent>;
  /** Handler for cut events. */
  onCut?: JSX.EventHandler<HTMLInputElement, ClipboardEvent>;
}

export interface NumberFieldAria {
  /** Props for the label element. */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the input element group. */
  groupProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the increment button. */
  incrementButtonProps: AriaButtonProps;
  /** Props for the decrement button. */
  decrementButtonProps: AriaButtonProps;
  /** Props for the description element. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the error message element. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Provides the behavior and accessibility implementation for a number field.
 */
export function createNumberField(
  props: MaybeAccessor<AriaNumberFieldProps>,
  state: NumberFieldState,
  inputRef?: () => HTMLInputElement | null,
): NumberFieldAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);

  // Generate IDs for associated elements
  const inputId = `${id}-input`;
  const incrementId = `${id}-increment`;
  const decrementId = `${id}-decrement`;
  const descriptionId = `${id}-description`;
  const errorMessageId = `${id}-error`;

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
    labelElementType: "span",
  });

  // Get the label text for button aria-labels
  const getLabelText = (): string => {
    const p = getProps();
    if (p["aria-label"]) return p["aria-label"];
    if (typeof p.label === "string") return p.label;
    return "value";
  };

  // Filter DOM props
  const domProps = createMemo(() =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true }),
  );

  // Handle input change
  const onInputChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    const value = e.currentTarget.value;
    if (state.validate(value)) {
      state.setInputValue(value);
    }
  };

  // Handle input blur - commit value
  const onInputBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (e) => {
    state.commit();
    const p = getProps();
    p.onBlur?.(e);
    p.onFocusChange?.(false);
  };

  const onInputFocus: JSX.EventHandler<HTMLInputElement, FocusEvent> = (e) => {
    const p = getProps();
    p.onFocus?.(e);
    p.onFocusChange?.(true);
  };

  // Handle keyboard events
  const onKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) {
      p.onKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        state.increment();
        break;
      case "ArrowDown":
        e.preventDefault();
        state.decrement();
        break;
      case "PageUp":
        e.preventDefault();
        state.incrementToMax();
        break;
      case "PageDown":
        e.preventDefault();
        state.decrementToMin();
        break;
      case "Home":
        e.preventDefault();
        state.decrementToMin();
        break;
      case "End":
        e.preventDefault();
        state.incrementToMax();
        break;
      case "Enter":
        state.commit();
        break;
    }

    p.onKeyDown?.(e);
  };

  const onKeyUp: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    getProps().onKeyUp?.(e);
  };

  const onButtonPressStart = (e: PressEvent) => {
    const input = inputRef?.();

    // Keep existing input focus in place. This avoids hiding software keyboards
    // and prevents a blur/refocus flicker when mouse pressing the steppers.
    if (input && input.ownerDocument.activeElement === input) {
      return;
    }

    if (e.pointerType === "mouse") {
      input?.focus();
    } else if (e.target instanceof HTMLElement) {
      e.target.focus();
    }
  };

  let incrementTouchPressUp = false;
  let decrementTouchPressUp = false;

  const onIncrementPressStart = (e: PressEvent) => {
    if (e.pointerType !== "touch") {
      state.increment();
    } else {
      incrementTouchPressUp = false;
    }

    onButtonPressStart(e);
  };

  const onIncrementPressUp = (e: PressEvent) => {
    if (e.pointerType === "touch") {
      incrementTouchPressUp = true;
    }
  };

  const onIncrementPressEnd = (e: PressEvent) => {
    if (e.pointerType === "touch" && incrementTouchPressUp) {
      state.increment();
    }

    incrementTouchPressUp = false;
  };
  const onIncrementClick = (e: MouseEvent) => {
    if (!state.canIncrement()) {
      e.preventDefault();
      return;
    }

    state.increment();
    inputRef?.()?.focus();
  };

  const onDecrementPressStart = (e: PressEvent) => {
    if (e.pointerType !== "touch") {
      state.decrement();
    } else {
      decrementTouchPressUp = false;
    }

    onButtonPressStart(e);
  };

  const onDecrementPressUp = (e: PressEvent) => {
    if (e.pointerType === "touch") {
      decrementTouchPressUp = true;
    }
  };

  const onDecrementPressEnd = (e: PressEvent) => {
    if (e.pointerType === "touch" && decrementTouchPressUp) {
      state.decrement();
    }

    decrementTouchPressUp = false;
  };
  const onDecrementClick = (e: MouseEvent) => {
    if (!state.canDecrement()) {
      e.preventDefault();
      return;
    }

    state.decrement();
    inputRef?.()?.focus();
  };

  // Build aria-describedby
  const getAriaDescribedBy = () => {
    const p = getProps();
    const parts: string[] = [];
    if (p["aria-describedby"]) parts.push(p["aria-describedby"]);
    if (p.description) parts.push(descriptionId);
    if (p.isInvalid && p.errorMessage) parts.push(errorMessageId);
    return parts.length > 0 ? parts.join(" ") : undefined;
  };

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get groupProps() {
      return {
        role: "group",
        "aria-disabled": getProps().isDisabled || undefined,
        "aria-invalid": getProps().isInvalid || undefined,
      } as JSX.HTMLAttributes<HTMLElement>;
    },
    get inputProps() {
      const p = getProps();
      const isDisabled = p.isDisabled ?? state.isDisabled();
      const isReadOnly = p.isReadOnly ?? state.isReadOnly();

      return mergeProps(
        domProps(),
        fieldProps as Record<string, unknown>,
        {
          id: inputId,
          type: "text",
          inputMode: "decimal" as const,
          autoComplete: "off",
          autoCorrect: "off",
          spellcheck: false,
          // Upstream useNumberField wraps useSpinButton but deliberately
          // overrides its output: role=spinbutton can't be focused with
          // VoiceOver, so the input is a plain textbox (inside the role=group
          // wrapper above) and every aria-value* is dropped in favour of
          // aria-roledescription. The formatted value is still announced via the
          // input's own value. Mirror that contract instead of leaking the raw
          // spinbutton semantics.
          "aria-roledescription": "number field",
          "aria-invalid": p.isInvalid || undefined,
          "aria-required": p.isRequired || undefined,
          "aria-describedby": getAriaDescribedBy(),
          disabled: isDisabled || undefined,
          readOnly: isReadOnly || undefined,
          required: p.isRequired || undefined,
          value: state.inputValue(),
          onInput: onInputChange,
          onChange: onInputChange,
          onFocus: onInputFocus,
          onBlur: onInputBlur,
          onKeyDown,
          onKeyUp,
          onPaste: p.onPaste,
          onCopy: p.onCopy,
          onCut: p.onCut,
          name: p.name,
          form: p.form,
          autoFocus: p.autoFocus,
        } as Record<string, unknown>,
      ) as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
    get incrementButtonProps() {
      return {
        id: incrementId,
        type: "button",
        "aria-label": `Increase ${getLabelText()}`,
        "aria-controls": inputId,
        excludeFromTabOrder: true,
        preventFocusOnPress: true,
        allowFocusWhenDisabled: true,
        get disabled() {
          return !state.canIncrement();
        },
        tabIndex: -1,
        get isDisabled() {
          return !state.canIncrement();
        },
        onClick: onIncrementClick,
        onPressStart: onIncrementPressStart,
        onPressUp: onIncrementPressUp,
        onPressEnd: onIncrementPressEnd,
      } as AriaButtonProps;
    },
    get decrementButtonProps() {
      return {
        id: decrementId,
        type: "button",
        "aria-label": `Decrease ${getLabelText()}`,
        "aria-controls": inputId,
        excludeFromTabOrder: true,
        preventFocusOnPress: true,
        allowFocusWhenDisabled: true,
        get disabled() {
          return !state.canDecrement();
        },
        tabIndex: -1,
        get isDisabled() {
          return !state.canDecrement();
        },
        onClick: onDecrementClick,
        onPressStart: onDecrementPressStart,
        onPressUp: onDecrementPressUp,
        onPressEnd: onDecrementPressEnd,
      } as AriaButtonProps;
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
  };
}
