/**
 * NumberField component for solidaria-components
 *
 * A pre-wired headless number field that combines state + aria hooks.
 * Port of react-aria-components/src/NumberField.tsx
 */

import { type JSX, type Context, createContext, createMemo, splitProps, useContext } from "solid-js";
import {
  createNumberField,
  createButton,
  createFocusRing,
  createHover,
  type AriaNumberFieldProps,
  type AriaButtonProps,
} from "@proyecto-viviana/solidaria";
import { createNumberFieldState, type NumberFieldState } from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  Provider,
} from "./utils";
import { TextContext } from "./Text";

export interface NumberFieldRenderProps {
  /** Whether the number field is disabled. */
  isDisabled: boolean;
  /** Whether the number field is invalid. */
  isInvalid: boolean;
  /** Whether the number field is required. */
  isRequired: boolean;
  /** Whether the number field is read-only. */
  isReadOnly: boolean;
  /** The current numeric value. */
  value: number;
}

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, "label">, SlotProps {
  /** The current value (controlled). */
  value?: number;
  /** The default value (uncontrolled). */
  defaultValue?: number;
  /** Handler called when the value changes. */
  onChange?: (value: number) => void;
  /** The minimum value. */
  minValue?: number;
  /** The maximum value. */
  maxValue?: number;
  /** The step value for increment/decrement. */
  step?: number;
  /** The locale for number formatting. */
  locale?: string;
  /** Number format options. */
  formatOptions?: Intl.NumberFormatOptions;
  /** A visible label for the number field. */
  label?: JSX.Element;
  /** The children of the component. */
  children?: RenderChildren<NumberFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<NumberFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<NumberFieldRenderProps>;
}

export interface NumberFieldInputRenderProps {
  /** Whether the input is focused. */
  isFocused: boolean;
  /** Whether the input has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the input is hovered. */
  isHovered: boolean;
  /** Whether the input is disabled. */
  isDisabled: boolean;
  /** Whether the input is invalid. */
  isInvalid: boolean;
}

export interface NumberFieldInputProps extends SlotProps {
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<NumberFieldInputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<NumberFieldInputRenderProps>;
}

export interface NumberFieldButtonRenderProps {
  /** Whether the button is pressed. */
  isPressed: boolean;
  /** Whether the button is hovered. */
  isHovered: boolean;
  /** Whether the button is disabled. */
  isDisabled: boolean;
}

export interface NumberFieldIncrementButtonProps extends SlotProps {
  /** The children of the button. */
  children?: RenderChildren<NumberFieldButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<NumberFieldButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<NumberFieldButtonRenderProps>;
}

export interface NumberFieldDecrementButtonProps extends SlotProps {
  /** The children of the button. */
  children?: RenderChildren<NumberFieldButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<NumberFieldButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<NumberFieldButtonRenderProps>;
}

interface NumberFieldContextValue {
  state: NumberFieldState;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  incrementButtonProps: AriaButtonProps;
  decrementButtonProps: AriaButtonProps;
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  groupProps: JSX.HTMLAttributes<HTMLElement>;
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  isDisabled: boolean;
  isInvalid: boolean;
  isRequired: boolean;
  isReadOnly: boolean;
  setInputRef: (el: HTMLInputElement) => void;
}

export const NumberFieldContext = createContext<NumberFieldContextValue | null>(null);
export const NumberFieldStateContext = createContext<NumberFieldState | null>(null);

/**
 * A number field allows a user to enter a number and increment/decrement the value.
 */
export function NumberField(props: NumberFieldProps): JSX.Element {
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "step",
      "locale",
      "formatOptions",
    ],
    [
      "label",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "isDisabled",
      "isReadOnly",
      "isRequired",
      "isInvalid",
      "description",
      "errorMessage",
      "id",
      "autoFocus",
      "name",
      "form",
      "onFocus",
      "onBlur",
      "onFocusChange",
      "onKeyDown",
      "onKeyUp",
      "onPaste",
      "onCopy",
      "onCut",
    ],
  );

  const state = createNumberFieldState({
    get value() {
      return stateProps.value;
    },
    get defaultValue() {
      return stateProps.defaultValue;
    },
    get onChange() {
      return stateProps.onChange;
    },
    get minValue() {
      return stateProps.minValue;
    },
    get maxValue() {
      return stateProps.maxValue;
    },
    get step() {
      return stateProps.step;
    },
    get locale() {
      return stateProps.locale;
    },
    get formatOptions() {
      return stateProps.formatOptions;
    },
    get isDisabled() {
      return ariaProps.isDisabled;
    },
    get isReadOnly() {
      return ariaProps.isReadOnly;
    },
  });

  let inputRef: HTMLInputElement | undefined;
  const setInputRef = (el: HTMLInputElement) => {
    inputRef = el;
  };

  const numberFieldAria = createNumberField(
    {
      get label() {
        return ariaProps.label;
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      get "aria-labelledby"() {
        return ariaProps["aria-labelledby"];
      },
      get "aria-describedby"() {
        return ariaProps["aria-describedby"];
      },
      get isDisabled() {
        return ariaProps.isDisabled;
      },
      get isReadOnly() {
        return ariaProps.isReadOnly;
      },
      get isRequired() {
        return ariaProps.isRequired;
      },
      get isInvalid() {
        return ariaProps.isInvalid;
      },
      get description() {
        return ariaProps.description;
      },
      get errorMessage() {
        return ariaProps.errorMessage;
      },
      get id() {
        return ariaProps.id;
      },
      get autoFocus() {
        return ariaProps.autoFocus;
      },
      get name() {
        return ariaProps.name;
      },
      get form() {
        return ariaProps.form;
      },
      get onFocus() {
        return ariaProps.onFocus;
      },
      get onBlur() {
        return ariaProps.onBlur;
      },
      get onFocusChange() {
        return ariaProps.onFocusChange;
      },
      get onKeyDown() {
        return ariaProps.onKeyDown;
      },
      get onKeyUp() {
        return ariaProps.onKeyUp;
      },
      get onPaste() {
        return ariaProps.onPaste;
      },
      get onCopy() {
        return ariaProps.onCopy;
      },
      get onCut() {
        return ariaProps.onCut;
      },
    },
    state,
    () => inputRef ?? null,
  );

  const renderValues = createMemo<NumberFieldRenderProps>(() => ({
    isDisabled: ariaProps.isDisabled ?? false,
    isInvalid: ariaProps.isInvalid ?? false,
    isRequired: ariaProps.isRequired ?? false,
    isReadOnly: ariaProps.isReadOnly ?? false,
    value: state.numberValue(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-NumberField",
    },
    renderValues,
  );

  const childRenderValues: NumberFieldRenderProps = {
    get isDisabled() {
      return ariaProps.isDisabled ?? false;
    },
    get isInvalid() {
      return ariaProps.isInvalid ?? false;
    },
    get isRequired() {
      return ariaProps.isRequired ?? false;
    },
    get isReadOnly() {
      return ariaProps.isReadOnly ?? false;
    },
    get value() {
      return state.numberValue();
    },
  };

  const fieldChildren = () => {
    const children = local.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  };

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const contextValue: NumberFieldContextValue = {
    state,
    get inputProps() {
      return numberFieldAria.inputProps;
    },
    get incrementButtonProps() {
      return numberFieldAria.incrementButtonProps;
    },
    get decrementButtonProps() {
      return numberFieldAria.decrementButtonProps;
    },
    get labelProps() {
      return numberFieldAria.labelProps;
    },
    get groupProps() {
      return numberFieldAria.groupProps;
    },
    get descriptionProps() {
      return numberFieldAria.descriptionProps;
    },
    get errorMessageProps() {
      return numberFieldAria.errorMessageProps;
    },
    get isDisabled() {
      return ariaProps.isDisabled ?? false;
    },
    get isInvalid() {
      return ariaProps.isInvalid ?? false;
    },
    get isRequired() {
      return ariaProps.isRequired ?? false;
    },
    get isReadOnly() {
      return ariaProps.isReadOnly ?? false;
    },
    setInputRef,
  };
  // Provide the description / errorMessage props as `TextContext` slots (mirrors
  // react-aria-components' NumberField), so a `<Text slot="description">` /
  // `<Text slot="errorMessage">` child picks up the `id` its `aria-describedby`
  // references. Additive: existing consumers reading these off
  // `NumberFieldContext` are unaffected.
  const textSlots = {
    slots: {
      get description() {
        return numberFieldAria.descriptionProps;
      },
      get errorMessage() {
        return numberFieldAria.errorMessageProps;
      },
    },
  };

  return (
    <NumberFieldStateContext.Provider value={state}>
      <NumberFieldContext.Provider value={contextValue}>
        <div
          {...domProps()}
          class={renderProps.class()}
          style={renderProps.style()}
          data-disabled={ariaProps.isDisabled || undefined}
          data-invalid={ariaProps.isInvalid || undefined}
          data-required={ariaProps.isRequired || undefined}
          data-readonly={ariaProps.isReadOnly || undefined}
        >
          <Provider values={[[TextContext, textSlots]] as Array<[Context<unknown>, unknown]>}>
            {fieldChildren()}
          </Provider>
        </div>
      </NumberFieldContext.Provider>
    </NumberFieldStateContext.Provider>
  );
}

/**
 * The label for a number field.
 */
export function NumberFieldLabel(props: {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}): JSX.Element {
  const context = useContext(NumberFieldContext);
  if (!context) {
    throw new Error("NumberFieldLabel must be used within a NumberField");
  }

  return (
    <span
      {...context.labelProps}
      class={props.class ?? "solidaria-NumberField-label"}
      style={props.style}
    >
      {props.children}
    </span>
  );
}

/**
 * The input group for a number field (contains input and buttons).
 */
export function NumberFieldGroup(props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const [local, domProps] = splitProps(props, ["children", "class", "style"]);
  const context = useContext(NumberFieldContext);
  if (!context) {
    throw new Error("NumberFieldGroup must be used within a NumberField");
  }

  const cleanGroupProps = () => {
    const { ref: _ref, ...rest } = context.groupProps as Record<string, unknown>;
    return rest;
  };

  return (
    <div
      {...domProps}
      {...cleanGroupProps()}
      class={local.class ?? "solidaria-NumberField-group"}
      style={local.style}
    >
      {local.children}
    </div>
  );
}

/**
 * The input element for a number field.
 */
export function NumberFieldInput(props: NumberFieldInputProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot"]);

  const context = useContext(NumberFieldContext);
  if (!context) {
    throw new Error("NumberFieldInput must be used within a NumberField");
  }

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return context.isDisabled;
    },
  });

  const renderValues = createMemo<NumberFieldInputRenderProps>(() => ({
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    isDisabled: context.isDisabled,
    isInvalid: context.isInvalid,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-NumberField-input",
    },
    renderValues,
  );

  const cleanInputProps = () => {
    const { ref: _ref, onInput: _onInput, ...rest } = context.inputProps as Record<string, unknown>;
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
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
    (
      context.inputProps as unknown as { onInput?: JSX.EventHandler<HTMLInputElement, InputEvent> }
    ).onInput?.(event);
    (domProps as unknown as { onInput?: JSX.EventHandler<HTMLInputElement, InputEvent> }).onInput?.(
      event,
    );
  };

  return (
    <input
      {...domProps}
      ref={context.setInputRef}
      {...cleanInputProps()}
      {...cleanFocusProps()}
      {...cleanHoverProps()}
      onInput={handleInput}
      class={renderProps.class()}
      style={renderProps.style()}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={context.isDisabled || undefined}
      data-invalid={context.isInvalid || undefined}
    />
  );
}

/**
 * The increment button for a number field.
 */
export function NumberFieldIncrementButton(props: NumberFieldIncrementButtonProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(NumberFieldContext);
  if (!context) {
    throw new Error("NumberFieldIncrementButton must be used within a NumberField");
  }

  const isDisabled = () => context.isDisabled || !context.state.canIncrement();
  const pressButtonProps = () => {
    const {
      onClick: _onClick,
      disabled: _disabled,
      type: _type,
      tabIndex: _tabIndex,
      ...rest
    } = context.incrementButtonProps as Record<string, unknown>;
    return rest;
  };

  const buttonAria = createButton({
    ...pressButtonProps(),
    elementType: "div",
    get isDisabled() {
      return isDisabled();
    },
  });

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return context.isDisabled || !context.state.canIncrement();
    },
  });

  const renderValues = createMemo<NumberFieldButtonRenderProps>(() => ({
    isPressed: buttonAria.isPressed(),
    isHovered: isHovered(),
    isDisabled: isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-NumberField-increment",
    },
    renderValues,
  );

  const cleanButtonProps = () => {
    const { ref: _ref, ...rest } = buttonAria.buttonProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <div
      {...domProps}
      {...cleanButtonProps()}
      {...cleanHoverProps()}
      aria-disabled={isDisabled() || undefined}
      class={renderProps.class()}
      style={renderProps.style()}
      data-pressed={buttonAria.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={isDisabled() || undefined}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

/**
 * The decrement button for a number field.
 */
export function NumberFieldDecrementButton(props: NumberFieldDecrementButtonProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(NumberFieldContext);
  if (!context) {
    throw new Error("NumberFieldDecrementButton must be used within a NumberField");
  }

  const isDisabled = () => context.isDisabled || !context.state.canDecrement();
  const pressButtonProps = () => {
    const {
      onClick: _onClick,
      disabled: _disabled,
      type: _type,
      tabIndex: _tabIndex,
      ...rest
    } = context.decrementButtonProps as Record<string, unknown>;
    return rest;
  };

  const buttonAria = createButton({
    ...pressButtonProps(),
    elementType: "div",
    get isDisabled() {
      return isDisabled();
    },
  });

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return context.isDisabled || !context.state.canDecrement();
    },
  });

  const renderValues = createMemo<NumberFieldButtonRenderProps>(() => ({
    isPressed: buttonAria.isPressed(),
    isHovered: isHovered(),
    isDisabled: isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-NumberField-decrement",
    },
    renderValues,
  );

  const cleanButtonProps = () => {
    const { ref: _ref, ...rest } = buttonAria.buttonProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <div
      {...domProps}
      {...cleanButtonProps()}
      {...cleanHoverProps()}
      aria-disabled={isDisabled() || undefined}
      class={renderProps.class()}
      style={renderProps.style()}
      data-pressed={buttonAria.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={isDisabled() || undefined}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

NumberField.Label = NumberFieldLabel;
NumberField.Group = NumberFieldGroup;
NumberField.Input = NumberFieldInput;
NumberField.IncrementButton = NumberFieldIncrementButton;
NumberField.DecrementButton = NumberFieldDecrementButton;
