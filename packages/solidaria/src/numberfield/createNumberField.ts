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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/numberfield/useNumberField.ts

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
    // Upstream react-aria `useNumberField` → `useField` → `useLabel` with the DEFAULT
    // `labelElementType: 'label'`: the S2 NumberField label is a native `<label htmlFor>`
    // (verified against the shipped React DOM: `<label id for=inputId>`). This hardcoded
    // `"span"` was a self-inflicted divergence — it dropped the `for` association and made
    // `NumberFieldLabel` render a `<span>`. Reverted to `"label"` so `createLabel` emits
    // `for: inputId` (the input still also carries `aria-labelledby`, exactly as upstream).
    labelElementType: "label",
  });

  // Increment/decrement button labels — a 1:1 port of upstream `useNumberField`'s
  // four-case logic. Upstream RAC's `NumberField` component feeds `useNumberField` a
  // BOOLEAN slot for `label` (from `useSlot`), never the label string, so a visible
  // label is NEVER concatenated into the button `aria-label`. Instead: with a visible
  // label the button reads `aria-label: "Increase"` PLUS `aria-labelledby: "<selfId>
  // <labelId>"`; only an explicit `aria-label` (and no visible label) changes the text
  // (`"Increase <aria-label>"`). The prior `Increase ${getLabelText()}` was a
  // self-inflicted divergence that produced "Increase Quantity" where S2 ships
  // "Increase". `fieldLabel` mirrors upstream: `props['aria-label'] || ''` — the visible
  // label string is intentionally excluded (it arrives as a boolean slot in RAC).
  const fieldLabel = (): string => getProps()["aria-label"] ?? "";
  const buttonLabelledBy = (): string | undefined => {
    if (fieldLabel()) return undefined;
    return getProps().label != null
      ? (labelProps.id as string | undefined)
      : getProps()["aria-labelledby"];
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
          // Upstream routes the input through useFormattedTextField → useTextField →
          // useFocusable, which "always set[s] a tabIndex so that Safari allows
          // focusing native buttons and inputs": `excludeFromTabOrder ? -1 : 0`, then
          // `undefined` when disabled. The input is never excluded, so the rendered
          // DOM carries `tabindex="0"` (absent only when disabled). We hand-roll
          // inputProps (see the spinbutton-override note below) so we must replay that
          // one focusable prop here to stay byte-identical to React's tab order.
          tabIndex: isDisabled ? undefined : 0,
          // Upstream useNumberField wraps useSpinButton but deliberately
          // overrides its output: role=spinbutton can't be focused with
          // VoiceOver, so the input is a plain textbox (inside the role=group
          // wrapper above) and every aria-value* is dropped in favour of
          // aria-roledescription. The formatted value is still announced via the
          // input's own value. Mirror that contract instead of leaking the raw
          // spinbutton semantics.
          //
          // The string MUST match upstream's `stringFormatter.format('numberField')`,
          // whose en-US value is `Number field` (capitalised) — not a lowercase
          // hand-roll. Full locale routing via `createStringFormatter` (as
          // `createDateField` does) is tracked as `intl-roledescription-hardcodes`
          // (also covers the ColorArea/ColorSwatch English hardcodes); this keeps the
          // en-US roledescription byte-identical to React Spectrum in the meantime.
          "aria-roledescription": "Number field",
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
      const labelledBy = buttonLabelledBy();
      return {
        id: incrementId,
        type: "button",
        "aria-label": `Increase ${fieldLabel()}`.trim(),
        "aria-labelledby": labelledBy ? `${incrementId} ${labelledBy}` : undefined,
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
      const labelledBy = buttonLabelledBy();
      return {
        id: decrementId,
        type: "button",
        "aria-label": `Decrease ${fieldLabel()}`.trim(),
        "aria-labelledby": labelledBy ? `${decrementId} ${labelledBy}` : undefined,
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
