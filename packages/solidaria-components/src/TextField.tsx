/**
 * TextField component for solidaria-components
 *
 * A pre-wired headless text field that combines state + aria hooks.
 * Port of react-aria-components/src/TextField.tsx
 */

import {
  type JSX,
  type Context,
  createContext,
  useContext,
  createMemo,
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  splitProps,
  untrack,
} from "solid-js";
import {
  createTextField,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaTextFieldProps,
} from "@proyecto-viviana/solidaria";
import {
  createTextFieldState,
  VALID_VALIDITY_STATE,
  type ValidationResult,
} from "@proyecto-viviana/solid-stately";
import { FormContext, type FormProps } from "./Form";
import { FieldErrorContext, type FieldErrorContextValue } from "./FieldError";
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

export interface TextFieldRenderProps {
  /** Whether the text field is disabled. */
  isDisabled: boolean;
  /** Whether the value is invalid. */
  isInvalid: boolean;
  /** Whether the text field is read only. */
  isReadOnly: boolean;
  /** Whether the text field is required. */
  isRequired: boolean;
  /** Whether the text field is currently hovered with a mouse. */
  isHovered: boolean;
  /** Whether the text field is focused, either via a mouse or keyboard. */
  isFocused: boolean;
  /** Whether the text field is keyboard focused. */
  isFocusVisible: boolean;
}

export interface TextFieldProps extends Omit<AriaTextFieldProps, "children">, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<TextFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TextFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TextFieldRenderProps>;
  /** Custom renderer for the outer text field element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLDivElement>,
    renderProps: TextFieldRenderProps,
  ) => JSX.Element;
}

export interface TextFieldContextValue {
  labelProps?: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps?: JSX.InputHTMLAttributes<HTMLInputElement>;
  descriptionProps?: JSX.HTMLAttributes<HTMLElement>;
  errorMessageProps?: JSX.HTMLAttributes<HTMLElement>;
  isInvalid?: boolean;
  slots?: Record<string, TextFieldProps>;
  inputId?: string;
  setInputId?: (id: string | undefined) => void;
}

export const TextFieldContext = createContext<TextFieldContextValue | null>(null);
export const LabelContext = TextFieldContext;
export const InputContext = TextFieldContext;
export const TextAreaContext = TextFieldContext;
export const FieldInputContext = TextFieldContext;

function withFormValidationBehavior(
  props: TextFieldProps,
  formContext: FormProps | null,
): TextFieldProps {
  if (!formContext?.validationBehavior) {
    return props;
  }

  return new Proxy(props, {
    get(target, property, receiver) {
      const localValue = Reflect.get(target, property, receiver);
      if (property === "validationBehavior" && localValue === undefined) {
        return formContext.validationBehavior;
      }

      return localValue;
    },
    has(target, property) {
      return (
        Reflect.has(target, property) ||
        (property === "validationBehavior" && formContext.validationBehavior !== undefined)
      );
    },
    ownKeys(target) {
      const keys = new Set(Reflect.ownKeys(target));
      if (formContext.validationBehavior !== undefined) {
        keys.add("validationBehavior");
      }

      return Array.from(keys);
    },
    getOwnPropertyDescriptor(target, property) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (descriptor) {
        return descriptor;
      }

      if (property === "validationBehavior" && formContext.validationBehavior !== undefined) {
        return {
          enumerable: true,
          configurable: true,
          get: () => formContext.validationBehavior,
        };
      }

      return undefined;
    },
  });
}

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {
  children?: JSX.Element;
}

/**
 * A label element that automatically wires up to the parent TextField context.
 * This enables the proper htmlFor/id relationship between label and input.
 */
export function Label(props: LabelProps): JSX.Element {
  const context = useContext(TextFieldContext);

  const localDOMProps = () => {
    const result: Record<string, unknown> = {};
    const propsRecord = props as Record<string, unknown>;

    for (const key in propsRecord) {
      if (key !== "children") {
        result[key] = propsRecord[key];
      }
    }
    return result;
  };

  // Merge context labelProps with local props (local props take precedence)
  const mergedProps = () => {
    const localProps = localDOMProps();
    if (context) {
      const { ref: _ref, ...contextLabelProps } = (context.labelProps ?? {}) as Record<
        string,
        unknown
      >;
      const merged = {
        ...contextLabelProps,
        ...(context.inputId ? { for: context.inputId } : {}),
        ...localProps,
      } as Record<string, unknown>;
      if (merged.class == null) {
        merged.class = "solidaria-Label";
      }
      return merged;
    }
    return localProps.class == null ? { ...localProps, class: "solidaria-Label" } : localProps;
  };

  return <label {...mergedProps()}>{props.children}</label>;
}

export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "children"> {}

function eventWithCurrentTarget<T extends HTMLElement>(event: Event, element: T): Event {
  return new Proxy(event, {
    get(target, property, receiver) {
      if (property === "target" || property === "currentTarget") {
        return element;
      }

      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

function clearDelegatedTextEntryHandlers(element: HTMLElement) {
  const delegatedElement = element as HTMLElement & {
    $$input?: unknown;
    $$change?: unknown;
  };
  delete delegatedElement.$$input;
  delete delegatedElement.$$change;
}

/**
 * An input element that automatically wires up to the parent TextField context.
 * This enables focus tracking, validation, and accessibility props to flow from
 * the TextField to the actual input element.
 */
export function Input(props: InputProps): JSX.Element {
  const context = useContext(TextFieldContext);
  let inputElement: HTMLInputElement | undefined;

  createEffect(() => {
    context?.setInputId?.(props.id);
  });

  onCleanup(() => {
    context?.setInputId?.(undefined);
  });

  // Merge context inputProps with local props (local props take precedence)
  const mergedProps = () => {
    if (context) {
      // Remove ref from context props to avoid conflicts
      const { ref: _ref, ...contextInputProps } = (context.inputProps ?? {}) as Record<
        string,
        unknown
      >;
      const merged = { ...contextInputProps, ...props } as Record<string, unknown>;
      if (merged.class == null) {
        merged.class = "solidaria-Input";
      }
      return merged;
    }
    return props.class == null ? { ...props, class: "solidaria-Input" } : props;
  };

  onMount(() => {
    const element = inputElement;
    if (!element) {
      return;
    }

    const inputHandler = (event: Event) => {
      const handler = mergedProps().onInput as
        | JSX.EventHandler<HTMLInputElement, InputEvent>
        | undefined;
      handler?.(
        eventWithCurrentTarget(event, element) as InputEvent & {
          currentTarget: HTMLInputElement;
          target: Element;
        },
      );
      clearDelegatedTextEntryHandlers(element);
      event.stopPropagation();
    };
    const changeHandler = (event: Event) => {
      const handler = mergedProps().onChange as
        | JSX.EventHandler<HTMLInputElement, Event>
        | undefined;
      handler?.(
        eventWithCurrentTarget(event, element) as Event & {
          currentTarget: HTMLInputElement;
          target: Element;
        },
      );
      clearDelegatedTextEntryHandlers(element);
      event.stopPropagation();
    };

    element.addEventListener("input", inputHandler);
    element.addEventListener("change", changeHandler);
    clearDelegatedTextEntryHandlers(element);
    onCleanup(() => {
      element.removeEventListener("input", inputHandler);
      element.removeEventListener("change", changeHandler);
    });
  });

  return (
    <input
      {...mergedProps()}
      ref={(element) => {
        inputElement = element;
        const ref = props.ref;
        if (typeof ref === "function") {
          ref(element);
        }
      }}
    />
  );
}

export interface TextAreaProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "children"
> {}

/**
 * A textarea element that automatically wires up to the parent TextField context.
 * This enables focus tracking, validation, and accessibility props to flow from
 * the TextField to the actual textarea element.
 */
export function TextArea(props: TextAreaProps): JSX.Element {
  const context = useContext(TextFieldContext);
  let textAreaElement: HTMLTextAreaElement | undefined;

  createEffect(() => {
    context?.setInputId?.(props.id);
  });

  onCleanup(() => {
    context?.setInputId?.(undefined);
  });

  // Merge context inputProps with local props (local props take precedence)
  // Note: TextArea uses inputProps from context since it's an input variant
  const mergedProps = () => {
    if (context) {
      const {
        ref: _ref,
        type: _type,
        ...contextInputProps
      } = (context.inputProps ?? {}) as Record<string, unknown>;
      const merged = { ...contextInputProps, ...props } as Record<string, unknown>;
      if (merged.class == null) {
        merged.class = "solidaria-TextArea";
      }
      return merged;
    }
    return props.class == null ? { ...props, class: "solidaria-TextArea" } : props;
  };

  onMount(() => {
    const element = textAreaElement;
    if (!element) {
      return;
    }

    const inputHandler = (event: Event) => {
      const handler = mergedProps().onInput as
        | JSX.EventHandler<HTMLTextAreaElement, InputEvent>
        | undefined;
      handler?.(
        eventWithCurrentTarget(event, element) as InputEvent & {
          currentTarget: HTMLTextAreaElement;
          target: Element;
        },
      );
      clearDelegatedTextEntryHandlers(element);
      event.stopPropagation();
    };
    const changeHandler = (event: Event) => {
      const handler = mergedProps().onChange as
        | JSX.EventHandler<HTMLTextAreaElement, Event>
        | undefined;
      handler?.(
        eventWithCurrentTarget(event, element) as Event & {
          currentTarget: HTMLTextAreaElement;
          target: Element;
        },
      );
      clearDelegatedTextEntryHandlers(element);
      event.stopPropagation();
    };

    element.addEventListener("input", inputHandler);
    element.addEventListener("change", changeHandler);
    clearDelegatedTextEntryHandlers(element);
    onCleanup(() => {
      element.removeEventListener("input", inputHandler);
      element.removeEventListener("change", changeHandler);
    });
  });

  return (
    <textarea
      {...mergedProps()}
      ref={(element) => {
        textAreaElement = element;
        const ref = props.ref;
        if (typeof ref === "function") {
          ref(element);
        }
      }}
    />
  );
}

/**
 * A text field allows a user to enter a plain text value with a keyboard.
 *
 * This is a headless component that provides accessibility and state management.
 * Style it using the render props pattern or data attributes.
 *
 * @example
 * ```tsx
 * <TextField>
 *   {({ isInvalid }) => (
 *     <>
 *       <Label>Email</Label>
 *       <Input class={isInvalid ? 'border-red-500' : 'border-gray-300'} />
 *     </>
 *   )}
 * </TextField>
 * ```
 */
export function TextField(props: TextFieldProps): JSX.Element {
  const formContext = useContext(FormContext);
  const contextProps = useContext(TextFieldContext);
  const contextSlotProps = contextProps?.slots?.[props.slot ?? "default"];
  const contextBaseProps = createMemo<TextFieldProps>(() => {
    if (!contextProps) return {};
    const {
      labelProps: _labelProps,
      inputProps: _inputProps,
      descriptionProps: _descriptionProps,
      errorMessageProps: _errorMessageProps,
      isInvalid: _isInvalid,
      slots: _slots,
      setInputId: _setInputId,
      ...rest
    } = contextProps;
    return rest as TextFieldProps;
  });
  const baseProps = (
    contextProps ? mergeProps(contextBaseProps(), contextSlotProps ?? {}, props) : props
  ) as TextFieldProps;
  const mergedProps = withFormValidationBehavior(baseProps, formContext);

  const [local, ariaProps] = splitProps(mergedProps, [
    "children",
    "class",
    "style",
    "render",
    "slot",
  ]);

  // Use getters to ensure props are read lazily inside reactive contexts
  const state = createTextFieldState({
    get value() {
      return ariaProps.value;
    },
    get defaultValue() {
      return ariaProps.defaultValue;
    },
    get onChange() {
      return ariaProps.onChange;
    },
  });

  const inputAriaProps = createMemo(() => {
    const clean: Record<string, unknown> = {};
    for (const key in ariaProps as Record<string, unknown>) {
      if (!key.startsWith("data-")) {
        clean[key] = (ariaProps as Record<string, unknown>)[key];
      }
    }
    return clean as typeof ariaProps;
  });

  const textFieldAria = createTextField(() => ({
    ...inputAriaProps(),
    value: state.value(),
    onChange: state.setValue,
  }));

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return ariaProps.isDisabled;
    },
  });
  const [inputIdOverride, setInputIdOverride] = createSignal<string | undefined>();

  const renderValues = createMemo<TextFieldRenderProps>(() => ({
    isDisabled: ariaProps.isDisabled || false,
    isInvalid: textFieldAria.isInvalid,
    isReadOnly: ariaProps.isReadOnly || false,
    isRequired: ariaProps.isRequired || false,
    isHovered: isHovered(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-TextField",
    },
    renderValues,
  );
  const childRenderValues: TextFieldRenderProps = {
    get isDisabled() {
      return ariaProps.isDisabled || false;
    },
    get isInvalid() {
      return textFieldAria.isInvalid;
    },
    get isReadOnly() {
      return ariaProps.isReadOnly || false;
    },
    get isRequired() {
      return ariaProps.isRequired || false;
    },
    get isHovered() {
      return isHovered();
    },
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
  };

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    delete (filtered as Record<string, unknown>).id;
    return filtered;
  });

  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  // Context value for sub-components.
  // Use property getters so sub-components always read the latest aria/focus state.
  const fieldValidation = createMemo<ValidationResult>(() => {
    const isInvalid = textFieldAria.isInvalid;
    const errorMessage = ariaProps.errorMessage;
    const validationErrors = isInvalid && typeof errorMessage === "string" ? [errorMessage] : [];

    return {
      isInvalid,
      validationErrors,
      validationDetails: isInvalid
        ? { ...VALID_VALIDITY_STATE, customError: true, valid: false }
        : VALID_VALIDITY_STATE,
    };
  });
  const fieldErrorContext: FieldErrorContextValue = {
    get validation() {
      return fieldValidation();
    },
    get errorMessageProps() {
      return textFieldAria.errorMessageProps as JSX.HTMLAttributes<HTMLElement>;
    },
  };
  const contextValue: TextFieldContextValue = {
    get labelProps() {
      return textFieldAria.labelProps as JSX.LabelHTMLAttributes<HTMLLabelElement>;
    },
    get inputProps() {
      return mergeProps(
        textFieldAria.inputProps as Record<string, unknown>,
        focusProps as Record<string, unknown>,
      ) as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
    get descriptionProps() {
      return textFieldAria.descriptionProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get errorMessageProps() {
      return textFieldAria.errorMessageProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get isInvalid() {
      return textFieldAria.isInvalid;
    },
    // Deterministic at render (createTextField generates it via createUniqueId),
    // so the Label's `for` is stable across SSR + hydration. A signal set from an
    // onMount effect would flip undefined->id post-mount and re-execute the Label
    // template — crashing hydration if the re-run lands mid-hydration (dev).
    get inputId() {
      return inputIdOverride() ?? (textFieldAria.inputProps as { id?: string }).id;
    },
    setInputId(id: string | undefined) {
      setInputIdOverride(id);
    },
  };
  // Resolve the render-prop children ONCE (untracked). Re-invoking it on a
  // reactive update re-clones its templates; if that lands mid-hydration it
  // throws a Hydration Mismatch (worst in dev, where slow unbundled modules widen
  // the hydration window). The children carry their own fine-grained reactivity
  // (render-value getters + <Show>s), so they update without being re-created.
  const FieldChildren = () =>
    untrack(() => {
      const children = local.children;
      return typeof children === "function" ? children(childRenderValues) : children;
    });
  // Provide the description / errorMessage props as `TextContext` slots (mirrors
  // react-aria-components' TextField), so a `<Text slot="description">` /
  // `<Text slot="errorMessage">` child picks up the `id` its `aria-describedby`
  // references. Additive: existing consumers reading these off `TextFieldContext`
  // are unaffected.
  const textSlots = {
    slots: {
      get description() {
        return textFieldAria.descriptionProps as JSX.HTMLAttributes<HTMLElement>;
      },
      get errorMessage() {
        return textFieldAria.errorMessageProps as JSX.HTMLAttributes<HTMLElement>;
      },
    },
  };
  const FieldChildrenSlotted = () => (
    <Provider values={[[TextContext, textSlots]] as Array<[Context<unknown>, unknown]>}>
      <FieldChildren />
    </Provider>
  );
  const rootProps = () =>
    ({
      ...domProps(),
      ...cleanHoverProps(),
      class: renderProps.class(),
      style: renderProps.style(),
      slot: local.slot,
      "data-disabled": ariaProps.isDisabled || undefined,
      "data-invalid": textFieldAria.isInvalid || undefined,
      "data-readonly": ariaProps.isReadOnly || undefined,
      "data-required": ariaProps.isRequired || undefined,
      "data-hovered": isHovered() || undefined,
      "data-focused": isFocused() || undefined,
      "data-focus-visible": isFocusVisible() || undefined,
    }) as JSX.HTMLAttributes<HTMLDivElement>;
  const customRootProps = () =>
    ({
      ...rootProps(),
      children: <FieldChildrenSlotted />,
    }) as JSX.HTMLAttributes<HTMLDivElement>;

  return (
    <FieldErrorContext.Provider value={fieldErrorContext}>
      <TextFieldContext.Provider value={contextValue}>
        {local.render ? (
          local.render(customRootProps(), renderValues())
        ) : (
          <div {...rootProps()}>
            <FieldChildrenSlotted />
          </div>
        )}
      </TextFieldContext.Provider>
    </FieldErrorContext.Provider>
  );
}
