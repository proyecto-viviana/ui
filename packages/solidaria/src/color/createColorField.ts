/**
 * createColorField hook.
 *
 * Provides ARIA attributes and keyboard handling for a color input field.
 */

import { createEffect, createMemo, type Accessor } from "solid-js";
import type { ColorFieldState } from "@proyecto-viviana/solid-stately";
import { createId } from "../ssr";
import type { AriaColorFieldOptions, ColorFieldAria } from "./types";

/**
 * Creates ARIA props for a color field.
 */
export function createColorField(
  props: Accessor<AriaColorFieldOptions>,
  state: Accessor<ColorFieldState>,
  inputRef: Accessor<HTMLInputElement | null>,
): ColorFieldAria {
  const getProps = () => props();
  const getState = () => state();

  const generatedInputId = createId();
  const labelId = createId();
  const descriptionId = createId();
  const errorMessageId = createId();

  let didAutoFocus = false;
  createEffect(() => {
    const input = inputRef();
    if (!didAutoFocus && getProps().autoFocus && input) {
      didAutoFocus = true;
      input.focus();
    }
  });

  const isDisabled = () => getProps().isDisabled || getState().isDisabled;
  const isReadOnly = () => getProps().isReadOnly || getState().isReadOnly;
  const isInvalid = () => getProps().isInvalid || getState().isInvalid;
  const validationBehavior = () => getProps().validationBehavior ?? "native";

  const onKeyDown = (e: KeyboardEvent) => {
    const s = getState();

    if (isDisabled() || isReadOnly()) {
      return;
    }

    let handled = true;

    switch (e.key) {
      case "ArrowUp":
        s.increment();
        break;
      case "ArrowDown":
        s.decrement();
        break;
      case "PageUp":
        s.incrementToMax();
        break;
      case "PageDown":
        s.decrementToMin();
        break;
      case "Home":
        s.decrementToMin();
        break;
      case "End":
        s.incrementToMax();
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
    }
  };

  const onWheel = (e: WheelEvent) => {
    const p = getProps();
    const s = getState();

    if (
      p.isWheelDisabled ||
      isDisabled() ||
      isReadOnly() ||
      document.activeElement !== inputRef()
    ) {
      return;
    }

    if (e.deltaY < 0) {
      s.increment();
    } else if (e.deltaY > 0) {
      s.decrement();
    } else {
      return;
    }

    e.preventDefault();
  };

  const labelProps = createMemo(() => {
    return {
      id: labelId,
      for: getProps().id ?? generatedInputId,
    };
  });

  const descriptionProps = createMemo(() => ({
    id: descriptionId,
  }));

  const errorMessageProps = createMemo(() => ({
    id: getProps()["aria-errormessage"] ?? errorMessageId,
  }));

  const inputProps = createMemo(() => {
    const s = getState();
    const p = getProps();
    const channelLabel =
      s.channel && s.colorValue ? s.colorValue.getChannelName(s.channel, "en-US") : undefined;
    const required = p.isRequired || s.isRequired;
    const invalid = isInvalid();
    const describedBy = p["aria-describedby"];

    return {
      id: p.id ?? generatedInputId,
      type: "text",
      value: s.inputValue,
      name: s.channel ? undefined : p.name,
      form: s.channel ? undefined : p.form,
      placeholder: p.placeholder,
      disabled: isDisabled(),
      readOnly: isReadOnly(),
      required: validationBehavior() === "native" ? required || undefined : undefined,
      tabIndex: p.excludeFromTabOrder ? -1 : undefined,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      "aria-label": p["aria-label"] ?? channelLabel,
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": describedBy,
      "aria-details": p["aria-details"],
      "aria-errormessage": invalid ? (p["aria-errormessage"] ?? errorMessageId) : undefined,
      "aria-invalid": invalid || undefined,
      "aria-required": validationBehavior() === "aria" && required ? true : undefined,
      role: s.channel ? undefined : ("textbox" as const),
      "aria-valuenow": undefined,
      "aria-valuemin": undefined,
      "aria-valuemax": undefined,
      "aria-valuetext": undefined,
      onInput: (e: InputEvent) => {
        const target = e.target as HTMLInputElement;
        if (s.validate(target.value)) {
          s.setInputValue(target.value);
        } else {
          target.value = s.inputValue;
        }
      },
      onChange: () => {
        s.commit();
      },
      onBlur: () => {
        s.commit();
      },
      onKeyDown,
      onWheel,
    };
  });

  return {
    get labelProps() {
      return labelProps();
    },
    get inputProps() {
      return inputProps();
    },
    get descriptionProps() {
      return descriptionProps();
    },
    get errorMessageProps() {
      return errorMessageProps();
    },
  };
}
