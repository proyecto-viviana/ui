/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ColorField.tsx

import { createContext, createMemo, createSignal, untrack, useContext, Show } from "solid-js";
import type { Context } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createColorField,
  createFocusRing,
  createHover,
  type AriaColorFieldOptions,
} from "@proyecto-viviana/solidaria";
import {
  createColorFieldState,
  VALID_VALIDITY_STATE,
  type Color,
  type ColorChannel,
  type ColorFormat,
  type ColorSpace,
  type ColorFieldState,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  useSlot,
  filterDOMProps,
  Provider,
  dataAttr,
  evaluateRenderChildren,
} from "./utils";
import { FieldErrorContext, type FieldErrorContextValue } from "./FieldError";
import { LabelContext, type LabelProps } from "./Label";
import { TextContext } from "./Text";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import { ColorPickerContext } from "./ColorPicker";

export interface ColorFieldRenderProps {
  /** Whether the field is disabled. */
  isDisabled: boolean;
  /** Whether the field is read-only. */
  isReadOnly: boolean;
  /** Whether the field is required. */
  isRequired: boolean;
  /** Whether the input value is invalid. */
  isInvalid: boolean;
  /** The current color value (null if invalid). */
  color: Color | null;
  /** The color channel being edited, or "hex" for full color mode. */
  channel: ColorChannel | "hex";
}

export interface ColorFieldProps
  extends Omit<AriaColorFieldOptions, "description" | "errorMessage">, SlotProps {
  /** The current color value (controlled). */
  value?: Color | string | null;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color | null) => void;
  /** The color channel to edit (for single channel mode). */
  channel?: ColorChannel;
  /** The color space to use for channel mode. */
  colorSpace?: ColorSpace;
  /** The color format for parsing/displaying. */
  colorFormat?: ColorFormat;
  /** A visible label for the field. */
  label?: JSX.Element;
  /** The children of the component. */
  children?: RenderChildren<ColorFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorFieldRenderProps>;
}

export interface ColorFieldInputRenderProps {
  /** Whether the field is disabled. */
  isDisabled: boolean;
  /** Whether the field is read-only. */
  isReadOnly: boolean;
  /** Whether the input value is invalid. */
  isInvalid: boolean;
  /** Whether the input is focused. */
  isFocused: boolean;
  /** Whether the input has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the input is hovered. */
  isHovered: boolean;
}

export interface ColorFieldInputProps extends SlotProps {
  /** The children of the input (usually not used). */
  children?: RenderChildren<ColorFieldInputRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorFieldInputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorFieldInputRenderProps>;
  /** Ref callback for the input element. */
  ref?: (element: HTMLInputElement) => void;
}

interface ColorFieldContextValue {
  state: ColorFieldState;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  setInputRef: (el: HTMLInputElement) => void;
  setLabelElement: (isPresent: boolean) => void;
}

export const ColorFieldContext = createContext<ColorFieldContextValue | null>(null);
export const ColorFieldStateContext = ColorFieldContext;

/**
 * A color field allows users to enter a color value as text.
 */
export function ColorField(props: ColorFieldProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContext);
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "label"],
    ["value", "defaultValue", "onChange", "channel", "colorSpace", "colorFormat"],
    [
      "id",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "aria-details",
      "aria-errormessage",
      "name",
      "form",
      "isWheelDisabled",
      "isDisabled",
      "isReadOnly",
      "isRequired",
      "isInvalid",
      "validationBehavior",
      "autoFocus",
      "excludeFromTabOrder",
      "placeholder",
    ],
  );
  const [hasRegisteredLabelElement, setHasRegisteredLabelElement] = createSignal(false, {
    ownedWrite: true,
  });
  const hasExplicitName = () => Boolean(ariaProps["aria-label"] || ariaProps["aria-labelledby"]);
  // A prop label already names the field through the builtin label. Slot
  // detection starts only when that prop and an explicit aria name are absent.
  const [labelRef, hasLabel] = useSlot(!hasExplicitName() && local.label == null);

  // Create color field state
  const state = createColorFieldState(() => ({
    value: stateProps.value ?? pickerContext?.value,
    defaultValue: stateProps.defaultValue,
    onChange:
      stateProps.onChange ??
      ((color) => {
        if (color) {
          pickerContext?.onChange?.(color);
        }
      }),
    channel: stateProps.channel,
    colorSpace: stateProps.colorSpace,
    colorFormat: stateProps.colorFormat,
    isDisabled: ariaProps.isDisabled,
    isReadOnly: ariaProps.isReadOnly,
    isInvalid: ariaProps.isInvalid,
    isRequired: ariaProps.isRequired,
  }));

  // Input ref
  let inputRef: HTMLInputElement | undefined;
  const setInputRef = (el: HTMLInputElement) => {
    inputRef = el;
  };

  // Create color field aria props
  const colorFieldAria = createColorField(
    () => ({
      id: ariaProps.id,
      label:
        local.label != null
          ? local.label
          : hasExplicitName() || !(hasRegisteredLabelElement() || hasLabel())
            ? undefined
            : true,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      "aria-details": ariaProps["aria-details"],
      "aria-errormessage": ariaProps["aria-errormessage"],
      name: ariaProps.name,
      form: ariaProps.form,
      isWheelDisabled: ariaProps.isWheelDisabled,
      isDisabled: ariaProps.isDisabled,
      isReadOnly: ariaProps.isReadOnly,
      isRequired: ariaProps.isRequired,
      isInvalid: ariaProps.isInvalid,
      validationBehavior: ariaProps.validationBehavior,
      autoFocus: ariaProps.autoFocus,
      excludeFromTabOrder: ariaProps.excludeFromTabOrder,
      placeholder: ariaProps.placeholder,
      channel: stateProps.channel,
      colorSpace: stateProps.colorSpace,
    }),
    () => state,
    () => inputRef ?? null,
  );

  const labelContextValue: LabelProps = {
    get id() {
      if (hasExplicitName() || local.label != null || !hasLabel()) return undefined;
      return colorFieldAria.labelProps.id as string | undefined;
    },
    get for() {
      if (hasExplicitName() || local.label != null || !hasLabel()) return undefined;
      return colorFieldAria.labelProps.for;
    },
    ref: labelRef,
  };

  const hiddenInputValue = createMemo(() =>
    Number.isNaN(state.numberValue) ? "" : String(state.numberValue),
  );

  const renderValues = createMemo<ColorFieldRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isRequired: state.isRequired,
    isInvalid: state.isInvalid,
    color: state.value,
    channel: state.channel ?? "hex",
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorField",
    },
    renderValues,
  );

  const childRenderValues: ColorFieldRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get isReadOnly() {
      return state.isReadOnly;
    },
    get isRequired() {
      return state.isRequired;
    },
    get isInvalid() {
      return state.isInvalid;
    },
    get color() {
      return state.value;
    },
    get channel() {
      return state.channel ?? "hex";
    },
  };

  let hasRenderedChildren = false;
  let renderedChildren: JSX.Element;
  const renderChildren = () => {
    if (!hasRenderedChildren) {
      renderedChildren = untrack(() => evaluateRenderChildren(local.children, childRenderValues));
      hasRenderedChildren = true;
    }
    return renderedChildren;
  };

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  // RAC ColorField `useChildren` (ColorField.tsx:258-282) provides
  // description / errorMessage as `TextContext` slots and a
  // `FieldErrorContext`, so `<Text slot="description">` / `<FieldError>`
  // pick up the `id` `aria-describedby` references. `createField` +
  // `createSlotId` only keep those ids on the input when the slot is in
  // the DOM.
  const textSlots = {
    slots: {
      get description() {
        return colorFieldAria.descriptionProps;
      },
      get errorMessage() {
        return colorFieldAria.errorMessageProps;
      },
    },
  };
  const fieldErrorContext: FieldErrorContextValue = {
    get validation() {
      const invalid = ariaProps.isInvalid || state.isInvalid;
      return {
        isInvalid: invalid,
        validationErrors: [],
        validationDetails: invalid
          ? { ...VALID_VALIDITY_STATE, customError: true, valid: false }
          : VALID_VALIDITY_STATE,
      };
    },
    get errorMessageProps() {
      return colorFieldAria.errorMessageProps;
    },
  };

  return (
    <ColorFieldContext
      value={{
        state,
        get inputProps() {
          return colorFieldAria.inputProps;
        },
        get labelProps() {
          return colorFieldAria.labelProps;
        },
        get descriptionProps() {
          return colorFieldAria.descriptionProps;
        },
        get errorMessageProps() {
          return colorFieldAria.errorMessageProps;
        },
        setInputRef,
        setLabelElement: setHasRegisteredLabelElement,
      }}
    >
      <>
        <div
          {...domProps()}
          class={renderProps.class()}
          style={renderProps.style()}
          slot={local.slot ?? undefined}
          data-disabled={dataAttr(state.isDisabled)}
          data-readonly={dataAttr(state.isReadOnly)}
          data-invalid={dataAttr(state.isInvalid)}
          data-required={dataAttr(state.isRequired)}
          data-channel={state.channel ?? "hex"}
        >
          <Show when={local.label}>
            <label {...colorFieldAria.labelProps}>{local.label}</label>
          </Show>

          <LabelContext value={labelContextValue}>
            <Provider
              values={
                [
                  [TextContext, textSlots],
                  [FieldErrorContext, fieldErrorContext],
                ] as Array<[Context<unknown>, unknown]>
              }
            >
              {renderChildren()}
            </Provider>
          </LabelContext>
        </div>
        <Show when={state.channel && ariaProps.name}>
          <input
            type="hidden"
            name={ariaProps.name}
            form={ariaProps.form}
            value={hiddenInputValue()}
          />
        </Show>
      </>
    </ColorFieldContext>
  );
}

/**
 * The input element of a color field.
 */
export function ColorFieldInput(props: ColorFieldInputProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children", "ref"]);

  const context = useContext(ColorFieldContext);
  if (!context) {
    throw new Error("ColorFieldInput must be used within a ColorField");
  }

  const state = context.state;
  const inputValue = createMemo(() => state.inputValue);

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ColorFieldInputRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isInvalid: state.isInvalid,
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorField-input",
    },
    renderValues,
  );

  const cleanInputProps = () => {
    const {
      ref: _ref,
      style: _inputStyle,
      value: _value,
      ...rest
    } = context.inputProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <input
      {...domProps}
      {...cleanInputProps()}
      {...cleanFocusProps()}
      {...cleanHoverProps()}
      ref={(el) => {
        context.setInputRef(el);
        local.ref?.(el);
      }}
      class={renderProps.class()}
      style={renderProps.style()}
      value={inputValue()}
      data-disabled={dataAttr(state.isDisabled)}
      data-readonly={dataAttr(state.isReadOnly)}
      data-invalid={dataAttr(state.isInvalid)}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
      data-hovered={dataAttr(isHovered())}
    />
  );
}

ColorField.Input = ColorFieldInput;
