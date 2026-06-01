/**
 * TextField hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a text field.
 *
 * This is a 1:1 port of @react-aria/textfield's useTextField hook.
 */

import { JSX } from "solid-js";
import { createField, type AriaFieldProps, type FieldAria } from "../label";
import { createFocusable, type FocusableDOMProps, type FocusableProps } from "../interactions";
import { mergeProps, filterDOMProps } from "../utils";
import { type MaybeAccessor, access } from "../utils/reactivity";

export interface AriaTextFieldProps extends AriaFieldProps, FocusableProps, FocusableDOMProps {
  /** The current value (controlled). */
  value?: string;
  /** The default value (uncontrolled). */
  defaultValue?: string;
  /** Handler that is called when the value changes. */
  onChange?: (value: string) => void;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Whether the input is read only. */
  isReadOnly?: boolean;
  /** Whether the input is required. */
  isRequired?: boolean;
  /** Whether to use native HTML form validation or ARIA validation semantics. */
  validationBehavior?: "aria" | "native";
  /** The type of input to render. */
  type?: "text" | "search" | "url" | "tel" | "email" | "password" | string;
  /** The input mode hint for virtual keyboards. */
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  /** Hint for the enter key action on virtual keyboards. */
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  /** The name of the input element, used when submitting an HTML form. */
  name?: string;
  /** Associates the input with a form element by id. */
  form?: string;
  /** Regex pattern to validate the input value. */
  pattern?: string;
  /** The maximum number of characters supported by the input. */
  maxLength?: number;
  /** The minimum number of characters required by the input. */
  minLength?: number;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Whether to enable auto complete. */
  autoComplete?: string;
  /** Whether to enable auto correct. */
  autoCorrect?: string;
  /** Whether to enable spell check. */
  spellCheck?: "true" | "false";
  /** Controls whether and how text input is automatically capitalized. */
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
  /** The element type to use for the input. Defaults to 'input'. */
  inputElementType?: "input" | "textarea";

  // Clipboard events
  onCopy?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, ClipboardEvent>;
  onCut?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, ClipboardEvent>;
  onPaste?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, ClipboardEvent>;

  // Composition events
  onCompositionStart?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, CompositionEvent>;
  onCompositionEnd?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, CompositionEvent>;
  onCompositionUpdate?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, CompositionEvent>;

  // Selection events
  onSelect?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>;

  // Input events
  onBeforeInput?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>;
  onInput?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>;
}

export interface TextFieldAria<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> extends Omit<FieldAria, "fieldProps"> {
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<T>;
  /** Whether the text field is invalid. */
  isInvalid: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a text field.
 * Text fields allow users to input text with a keyboard.
 *
 * @param props - Props for the text field.
 * @param ref - Optional ref callback for the input element.
 */
export function createTextField<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(props: MaybeAccessor<AriaTextFieldProps>, ref?: (el: T) => void): TextFieldAria<T> {
  const getProps = () => access(props);
  let lastInputValue: string | undefined;

  const eventWithCurrentTarget = (
    event: InputEvent,
    element: HTMLInputElement | HTMLTextAreaElement,
  ) =>
    new Proxy(event, {
      get(target, property, receiver) {
        if (property === "target" || property === "currentTarget") {
          return element;
        }

        const value = Reflect.get(target, property, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });

  // Get field accessibility props (label, description, error message)
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = createField(props);

  // Get focusable props
  const { focusableProps } = createFocusable(
    {
      get isDisabled() {
        return getProps().isDisabled;
      },
      get autoFocus() {
        return getProps().autoFocus;
      },
      get excludeFromTabOrder() {
        return getProps().excludeFromTabOrder;
      },
      onFocus: getProps().onFocus,
      onBlur: getProps().onBlur,
      onFocusChange: getProps().onFocusChange,
      onKeyDown: getProps().onKeyDown,
      onKeyUp: getProps().onKeyUp,
    },
    ref as ((el: HTMLElement) => void) | undefined,
  );

  // Filter DOM props
  const getDomProps = () =>
    filterDOMProps(getProps() as Record<string, unknown>, { labelable: true });

  // Build input props
  const getInputProps = (): JSX.InputHTMLAttributes<T> => {
    const p = getProps();
    const isInvalid = p.isInvalid ?? false;
    const isTextarea = p.inputElementType === "textarea";
    const validationBehavior = p.validationBehavior ?? "native";

    return mergeProps(
      getDomProps(),
      {
        disabled: p.isDisabled,
        readOnly: p.isReadOnly,
        required: validationBehavior === "native" && p.isRequired,
        "aria-required": (validationBehavior === "aria" && p.isRequired) || undefined,
        "aria-invalid": isInvalid || undefined,
        value: p.value ?? p.defaultValue ?? "",
        onChange: (e: Event) => {
          const target = e.target as HTMLInputElement | HTMLTextAreaElement;
          if (target.value !== lastInputValue) {
            p.onChange?.(target.value);
          }
        },
        // Don't include type and pattern for textarea elements
        type: isTextarea ? undefined : (p.type ?? "text"),
        inputMode: p.inputMode,
        enterKeyHint: p.enterKeyHint,
        name: p.name,
        form: p.form,
        pattern: isTextarea ? undefined : p.pattern,
        maxLength: p.maxLength,
        minLength: p.minLength,
        placeholder: p.placeholder,
        autoComplete: p.autoComplete,
        autoCorrect: p.autoCorrect,
        autoCapitalize: p.autoCapitalize,
        spellCheck: p.spellCheck,

        // Clipboard events
        onCopy: p.onCopy,
        onCut: p.onCut,
        onPaste: p.onPaste,

        // Composition events
        onCompositionStart: p.onCompositionStart,
        onCompositionEnd: p.onCompositionEnd,
        onCompositionUpdate: p.onCompositionUpdate,

        // Selection events
        onSelect: p.onSelect,

        // Input events
        onBeforeInput: p.onBeforeInput,
        onInput: (e: InputEvent) => {
          const target = e.target as HTMLInputElement | HTMLTextAreaElement;
          const nextValue = target.value;
          p.onInput?.(
            eventWithCurrentTarget(e, target) as Parameters<NonNullable<typeof p.onInput>>[0],
          );
          lastInputValue = nextValue;
          p.onChange?.(nextValue);
        },
      },
      focusableProps as Record<string, unknown>,
      fieldProps as Record<string, unknown>,
    ) as JSX.InputHTMLAttributes<T>;
  };

  const getIsInvalid = () => {
    return getProps().isInvalid ?? false;
  };

  return {
    get labelProps() {
      return labelProps;
    },
    get inputProps() {
      return getInputProps();
    },
    get descriptionProps() {
      return descriptionProps;
    },
    get errorMessageProps() {
      return errorMessageProps;
    },
    get isInvalid() {
      return getIsInvalid();
    },
  };
}
