/**
 * Checkbox and CheckboxGroup components for solidaria-components
 *
 * Pre-wired headless checkbox components that combine state + aria hooks.
 * Port of react-aria-components/src/Checkbox.tsx
 */

import {
  type JSX,
  type Accessor,
  createContext,
  useContext,
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
  Show,
} from "solid-js";
import {
  createCheckbox,
  createCheckboxGroup,
  createCheckboxGroupItem,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaCheckboxProps,
  type AriaCheckboxGroupProps,
} from "@proyecto-viviana/solidaria";
import {
  createToggleState,
  createCheckboxGroupState,
  VALID_VALIDITY_STATE,
  type CheckboxGroupState,
  type ValidationResult,
} from "@proyecto-viviana/solid-stately";
import { VisuallyHidden } from "./VisuallyHidden";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { FormContext, type FormProps } from "./Form";
import { FieldErrorContext, type FieldErrorContextValue } from "./FieldError";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface CheckboxGroupRenderProps {
  /** Whether the checkbox group is disabled. */
  isDisabled: boolean;
  /** Whether the checkbox group is read only. */
  isReadOnly: boolean;
  /** Whether the checkbox group is required. */
  isRequired: boolean;
  /** Whether the checkbox group is invalid. */
  isInvalid: boolean;
  /** State of the checkbox group. */
  state: CheckboxGroupState;
}

export interface CheckboxRenderProps {
  /** Whether the checkbox is selected. */
  isSelected: boolean;
  /** Whether the checkbox is indeterminate. */
  isIndeterminate: boolean;
  /** Whether the checkbox is currently hovered with a mouse. */
  isHovered: boolean;
  /** Whether the checkbox is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the checkbox is focused, either via a mouse or keyboard. */
  isFocused: boolean;
  /** Whether the checkbox is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the checkbox is disabled. */
  isDisabled: boolean;
  /** Whether the checkbox is read only. */
  isReadOnly: boolean;
  /** Whether the checkbox is invalid. */
  isInvalid: boolean;
  /** Whether the checkbox is required. */
  isRequired: boolean;
}

export interface CheckboxGroupProps
  extends Omit<AriaCheckboxGroupProps, "children" | "label">, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<CheckboxGroupRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CheckboxGroupRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CheckboxGroupRenderProps>;
  /** Ref for the checkbox group root element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface CheckboxProps extends Omit<AriaCheckboxProps, "children">, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<CheckboxRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CheckboxRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CheckboxRenderProps>;
  /** Custom renderer for the outer label element. */
  render?: (
    props: JSX.LabelHTMLAttributes<HTMLLabelElement>,
    renderProps: CheckboxRenderProps,
  ) => JSX.Element;
  /** Ref for the outer label element. */
  ref?: RefLike<HTMLLabelElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
  /** Whether the checkbox is indeterminate. */
  isIndeterminate?: boolean;
  /** A description for the checkbox. */
  description?: JSX.Element;
  /** An error message for the checkbox. */
  errorMessage?: JSX.Element;
  /** Handler called when hover starts. */
  onHoverStart?: () => void;
  /** Handler called when hover ends. */
  onHoverEnd?: () => void;
  /** Handler called when hover state changes. */
  onHoverChange?: (isHovered: boolean) => void;
}

export const CheckboxGroupContext = createContext<CheckboxGroupProps | null>(null);
export const CheckboxGroupStateContext = createContext<CheckboxGroupState | null>(null);
export interface CheckboxContextValue extends CheckboxProps {
  slots?: Record<string, CheckboxProps>;
}
export const CheckboxContext = createContext<CheckboxContextValue | null>(null);

type PropsWithValidationBehavior = {
  validationBehavior?: "aria" | "native";
};

function withFormValidationBehavior<T extends PropsWithValidationBehavior>(
  props: T,
  formContext: FormProps | null,
): T {
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

/**
 * A checkbox group allows a user to select multiple items from a list of options.
 *
 * @example
 * ```tsx
 * <CheckboxGroup>
 *   <Checkbox value="one">Option 1</Checkbox>
 *   <Checkbox value="two">Option 2</Checkbox>
 * </CheckboxGroup>
 * ```
 */
export function CheckboxGroup(props: CheckboxGroupProps): JSX.Element {
  const formContext = useContext(FormContext);
  const mergedProps = withFormValidationBehavior(props, formContext);
  const [local, ariaProps] = splitProps(mergedProps, [
    "class",
    "style",
    "slot",
    "ref",
    "description",
    "errorMessage",
    "children",
  ]);

  // Use getters to ensure props are read lazily inside reactive contexts
  const state = createCheckboxGroupState(() => ({
    value: ariaProps.value,
    defaultValue: ariaProps.defaultValue,
    onChange: ariaProps.onChange,
    isDisabled: ariaProps.isDisabled,
    isReadOnly: ariaProps.isReadOnly,
    isRequired: ariaProps.isRequired,
    isInvalid: ariaProps.isInvalid,
    validationState: ariaProps.validationState,
    validate: ariaProps.validate,
    validationBehavior: ariaProps.validationBehavior,
    name: ariaProps.name,
  }));

  const groupAria = createCheckboxGroup(
    () => ({
      ...ariaProps,
      description: local.description,
      errorMessage: local.errorMessage,
    }),
    state,
  );

  const renderValues = createMemo<CheckboxGroupRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isRequired: ariaProps.isRequired ?? false,
    isInvalid: groupAria.isInvalid,
    state,
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-CheckboxGroup",
    },
    renderValues,
  );

  const domProps = createMemo(() => filterDOMProps(ariaProps, { global: true }));

  const cleanGroupProps = () => {
    const { ref: _ref, ...rest } = groupAria.groupProps as Record<string, unknown>;
    return rest;
  };
  const setGroupRef = (el: HTMLDivElement) => {
    assignRef(local.ref, el);
  };
  const groupDescribedBy = () => {
    const ids = [
      (cleanGroupProps() as { "aria-describedby"?: string })["aria-describedby"],
      local.description ? groupAria.descriptionProps.id : undefined,
      groupAria.isInvalid && local.errorMessage ? groupAria.errorMessageProps.id : undefined,
    ]
      .filter(Boolean)
      .join(" ")
      .split(" ")
      .filter(Boolean);
    return ids.length ? Array.from(new Set(ids)).join(" ") : undefined;
  };

  const GroupChildren = () => {
    const childRenderValues: CheckboxGroupRenderProps = {
      get isDisabled() {
        return state.isDisabled;
      },
      get isReadOnly() {
        return state.isReadOnly;
      },
      get isRequired() {
        return state.isRequired();
      },
      get isInvalid() {
        return groupAria.isInvalid;
      },
      get state() {
        return state;
      },
    };
    const renderedChildren = createMemo(() => {
      const children = local.children;
      if (typeof children === "function") {
        return children.length > 0
          ? children(childRenderValues)
          : (children as unknown as () => JSX.Element)();
      }
      return children;
    });

    return <>{renderedChildren()}</>;
  };

  return (
    <CheckboxGroupStateContext.Provider value={state}>
      <div
        {...domProps()}
        {...cleanGroupProps()}
        ref={setGroupRef}
        aria-describedby={groupDescribedBy()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={state.isDisabled || undefined}
        data-readonly={state.isReadOnly || undefined}
        data-required={ariaProps.isRequired || undefined}
        data-invalid={groupAria.isInvalid || undefined}
      >
        <GroupChildren />
        <Show when={local.description}>
          <div {...(groupAria.descriptionProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
            {local.description}
          </div>
        </Show>
        <Show when={groupAria.isInvalid && local.errorMessage}>
          <div {...(groupAria.errorMessageProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
            {local.errorMessage}
          </div>
        </Show>
      </div>
    </CheckboxGroupStateContext.Provider>
  );
}

/**
 * A checkbox allows a user to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 *
 * @example
 * ```tsx
 * <Checkbox>
 *   {({ isSelected }) => (
 *     <>
 *       <span class={`checkbox ${isSelected ? 'checked' : ''}`}>
 *         {isSelected && '✓'}
 *       </span>
 *       <span>Accept terms</span>
 *     </>
 *   )}
 * </Checkbox>
 * ```
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);
  const formContext = useContext(FormContext);
  const contextProps = useContext(CheckboxContext);
  const contextSlotProps = contextProps?.slots?.[props.slot ?? "default"];
  const contextBaseProps = createMemo<CheckboxProps>(() => {
    if (!contextProps) return {};
    const { slots: _slots, ...rest } = contextProps;
    return rest;
  });
  const mergedProps = contextProps
    ? (mergeProps(contextBaseProps(), contextSlotProps ?? {}, props) as CheckboxProps)
    : props;
  const propsWithFormBehavior = withFormValidationBehavior(mergedProps, formContext);
  const inputRefs = createMemo(
    () =>
      [contextBaseProps().inputRef, contextSlotProps?.inputRef, props.inputRef].filter(
        Boolean,
      ) as RefLike<HTMLInputElement>[],
  );

  const [local, ariaProps] = splitProps(propsWithFormBehavior, [
    "class",
    "style",
    "render",
    "ref",
    "inputRef",
    "slot",
    "isIndeterminate",
    "description",
    "errorMessage",
    "onHoverStart",
    "onHoverEnd",
    "onHoverChange",
  ]);
  const descriptionId = createUniqueId();
  const errorMessageId = createUniqueId();

  const inputAriaProps = createMemo(() => {
    const clean: Record<string, unknown> = {};
    for (const key in ariaProps as Record<string, unknown>) {
      if (!key.startsWith("data-")) {
        clean[key] = (ariaProps as Record<string, unknown>)[key];
      }
    }
    return clean as typeof ariaProps;
  });

  const groupState = useContext(CheckboxGroupStateContext);

  let isSelected: Accessor<boolean>;
  let isPressed: Accessor<boolean>;
  let isDisabled: Accessor<boolean>;
  let isReadOnly: Accessor<boolean>;
  let isInvalid: Accessor<boolean>;
  let labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  let inputProps: () => JSX.InputHTMLAttributes<HTMLInputElement>;

  if (groupState) {
    const itemAria = createCheckboxGroupItem(
      () => ({
        ...inputAriaProps(),
        value: inputAriaProps().value ?? "",
        children: typeof mergedProps.children === "function" ? true : mergedProps.children,
      }),
      groupState,
      inputElement,
    );
    isSelected = itemAria.isSelected;
    isPressed = itemAria.isPressed;
    labelProps = itemAria.labelProps;
    inputProps = () => itemAria.inputProps;
  } else {
    // Use getters to ensure props are read lazily inside reactive contexts
    const state = createToggleState(() => ({
      isSelected: ariaProps.isSelected,
      defaultSelected: ariaProps.defaultSelected,
      onChange: ariaProps.onChange,
      isReadOnly: ariaProps.isReadOnly,
    }));

    const checkboxAria = createCheckbox(
      () => ({
        ...inputAriaProps(),
        isIndeterminate: local.isIndeterminate,
        children: typeof mergedProps.children === "function" ? true : mergedProps.children,
      }),
      state,
      inputElement,
    );
    isSelected = checkboxAria.isSelected;
    isPressed = checkboxAria.isPressed;
    labelProps = checkboxAria.labelProps;
    inputProps = () => checkboxAria.inputProps;
  }
  isDisabled = () => inputProps().disabled === true;
  isReadOnly = () => inputProps()["aria-readonly"] === true;
  isInvalid = () => inputProps()["aria-invalid"] === true;
  const describedBy = () => {
    const ids = [
      ariaProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      isInvalid() && local.errorMessage ? errorMessageId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled() || isReadOnly();
    },
    onHoverStart: local.onHoverStart,
    onHoverEnd: local.onHoverEnd,
    onHoverChange: local.onHoverChange,
  });

  const renderValues = createMemo<CheckboxRenderProps>(() => ({
    isSelected: isSelected(),
    isIndeterminate: local.isIndeterminate ?? false,
    isHovered: isHovered(),
    isPressed: isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: isDisabled(),
    isReadOnly: isReadOnly(),
    isInvalid: isInvalid(),
    isRequired: ariaProps.isRequired ?? false,
  }));

  const renderProps = useRenderProps(
    {
      children: mergedProps.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Checkbox",
    },
    renderValues,
  );
  const childRenderValues: CheckboxRenderProps = {
    get isSelected() {
      return isSelected();
    },
    get isIndeterminate() {
      return local.isIndeterminate ?? false;
    },
    get isHovered() {
      return isHovered();
    },
    get isPressed() {
      return isPressed();
    },
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isReadOnly() {
      return isReadOnly();
    },
    get isInvalid() {
      return isInvalid();
    },
    get isRequired() {
      return ariaProps.isRequired ?? false;
    },
  };
  const checkboxChildren = () => {
    const children = mergedProps.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  };

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    delete (filtered as Record<string, unknown>).id;
    delete (filtered as Record<string, unknown>).onClick;
    return filtered;
  });

  const cleanLabelProps = () => {
    const { ref: _ref1, ...rest } = labelProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanInputProps = () => {
    const {
      ref: _ref3,
      onFocus: _onFocus,
      onBlur: _onBlur,
      ...rest
    } = inputProps() as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const {
      ref: _ref4,
      onFocus: _onFocus,
      onBlur: _onBlur,
      ...rest
    } = focusProps as Record<string, unknown>;
    return rest;
  };
  const handleInputFocus: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    (
      inputProps() as unknown as { onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onFocus?.(event);
    (
      focusProps as unknown as { onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onFocus?.(event);
  };
  const handleInputBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    (
      inputProps() as unknown as { onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onBlur?.(event);
    (focusProps as unknown as { onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent> }).onBlur?.(
      event,
    );
  };
  const setLabelRef = (el: HTMLLabelElement) => {
    assignRef(local.ref, el);
  };
  const setInputRef = (el: HTMLInputElement) => {
    setInputElement(el);
    for (const ref of inputRefs()) {
      assignRef(ref, el);
    }
  };
  const hiddenInput = (
    <VisuallyHidden>
      <input
        ref={setInputRef}
        {...cleanInputProps()}
        {...cleanFocusProps()}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        aria-describedby={describedBy()}
      />
    </VisuallyHidden>
  );
  const labelChildren = () => (
    <>
      {hiddenInput}
      {checkboxChildren()}
      <Show when={local.description}>
        <span id={descriptionId} slot="description">
          {local.description}
        </span>
      </Show>
      <Show when={isInvalid() && local.errorMessage}>
        <span id={errorMessageId} slot="errorMessage">
          {local.errorMessage}
        </span>
      </Show>
    </>
  );
  const rootProps = createMemo(
    () =>
      ({
        ...domProps(),
        ...cleanLabelProps(),
        ...cleanHoverProps(),
        class: renderProps.class(),
        style: renderProps.style(),
        slot: local.slot,
        "data-selected": isSelected() || undefined,
        "data-indeterminate": local.isIndeterminate || undefined,
        "data-pressed": isPressed() || undefined,
        "data-hovered": isHovered() || undefined,
        "data-focused": isFocused() || undefined,
        "data-focus-visible": isFocusVisible() || undefined,
        "data-disabled": isDisabled() || undefined,
        "data-readonly": isReadOnly() || undefined,
        "data-invalid": isInvalid() || undefined,
        "data-required": ariaProps.isRequired || undefined,
      }) as JSX.LabelHTMLAttributes<HTMLLabelElement>,
  );
  const customRootProps = () =>
    ({
      ...rootProps(),
      ref: setLabelRef,
      children: labelChildren(),
    }) as JSX.LabelHTMLAttributes<HTMLLabelElement>;

  return local.render ? (
    local.render(customRootProps(), renderValues())
  ) : (
    <label
      {...domProps()}
      {...cleanLabelProps()}
      {...cleanHoverProps()}
      ref={setLabelRef}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-selected={isSelected() || undefined}
      data-indeterminate={local.isIndeterminate || undefined}
      data-pressed={isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-disabled={isDisabled() || undefined}
      data-readonly={isReadOnly() || undefined}
      data-invalid={isInvalid() || undefined}
      data-required={ariaProps.isRequired || undefined}
    >
      {labelChildren()}
    </label>
  );
}

// ============================================================================
// CheckboxField + CheckboxButton — the RAC form-field split (RAC 1.19)
// ----------------------------------------------------------------------------
// Upstream split the monolithic Checkbox into a CheckboxField wrapper (owns
// state, validation, and help text) containing a CheckboxButton control (the
// clickable indicator + label). Mirrors react-aria-components/src/Checkbox.tsx.
// The legacy `Checkbox` above stays as the deprecated monolith for back-compat.
//
// Spine note: upstream wires the two halves with InternalCheckboxContext +
// TextContext slots through `<Provider>`. Our `<Provider>` is inert and
// TextContext carries no slots yet (`port-context-slots`), so — exactly like
// the monolith Checkbox and CheckboxGroup already do — we use a native Solid
// context and bridge `description`/`errorMessage` with explicit ids.
// ============================================================================

export interface CheckboxFieldRenderProps {
  /** Whether the checkbox is selected. */
  isSelected: boolean;
  /** Whether the checkbox is indeterminate. */
  isIndeterminate: boolean;
  /** Whether the checkbox is disabled. */
  isDisabled: boolean;
  /** Whether the checkbox is read only. */
  isReadOnly: boolean;
  /** Whether the checkbox is invalid. */
  isInvalid: boolean;
  /** Whether the checkbox is required. */
  isRequired: boolean;
}

export interface CheckboxButtonRenderProps extends CheckboxRenderProps {}

export interface CheckboxFieldProps
  extends Omit<AriaCheckboxProps, "children" | "validationState">, SlotProps {
  /** The children of the component (typically a `CheckboxButton`). A function may receive render props. */
  children?: RenderChildren<CheckboxFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CheckboxFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CheckboxFieldRenderProps>;
  /** Whether the checkbox is indeterminate. */
  isIndeterminate?: boolean;
  /**
   * A description for the checkbox. Bridged with explicit ids + aria-describedby
   * until TextContext slots are live (`port-context-slots`).
   */
  description?: JSX.Element;
  /** An error message for the checkbox. */
  errorMessage?: JSX.Element;
  /** Ref for the checkbox field root element. */
  ref?: RefLike<HTMLDivElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
}

export interface CheckboxButtonProps extends SlotProps {
  /** The children of the component. A function may receive render props. */
  children?: RenderChildren<CheckboxButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CheckboxButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CheckboxButtonRenderProps>;
  /** Ref for the outer label element. */
  ref?: RefLike<HTMLLabelElement>;
  /** Handler called when hover starts. */
  onHoverStart?: () => void;
  /** Handler called when hover ends. */
  onHoverEnd?: () => void;
  /** Handler called when hover state changes. */
  onHoverChange?: (isHovered: boolean) => void;
}

export interface CheckboxFieldContextValue extends CheckboxFieldProps {
  slots?: Record<string, CheckboxFieldProps>;
}
export const CheckboxFieldContext = createContext<CheckboxFieldContextValue | null>(null);

/** Carries the checkbox aria + state from a CheckboxField/Checkbox wrapper to its CheckboxButton. */
interface InternalCheckboxContextValue {
  isSelected: Accessor<boolean>;
  isPressed: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isReadOnly: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isIndeterminate: Accessor<boolean>;
  isRequired: Accessor<boolean>;
  labelProps: () => JSX.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: () => JSX.InputHTMLAttributes<HTMLInputElement>;
  setInputRef: (el: HTMLInputElement) => void;
  describedBy: () => string | undefined;
  defaultClassName: string;
}
const InternalCheckboxContext = createContext<InternalCheckboxContextValue | null>(null);

/**
 * A checkbox allows a user to select an item, with support for validation and help text.
 * Wraps a `CheckboxButton` and provides description/error wiring.
 *
 * @example
 * ```tsx
 * <CheckboxField description="Required to continue">
 *   <CheckboxButton>Accept terms</CheckboxButton>
 * </CheckboxField>
 * ```
 */
export function CheckboxField(props: CheckboxFieldProps): JSX.Element {
  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);
  const formContext = useContext(FormContext);
  const contextProps = useContext(CheckboxFieldContext);
  const contextSlotProps = contextProps?.slots?.[props.slot ?? "default"];
  const contextBaseProps = createMemo<CheckboxFieldProps>(() => {
    if (!contextProps) return {};
    const { slots: _slots, ...rest } = contextProps;
    return rest;
  });
  const mergedProps = contextProps
    ? (mergeProps(contextBaseProps(), contextSlotProps ?? {}, props) as CheckboxFieldProps)
    : props;
  const propsWithFormBehavior = withFormValidationBehavior(mergedProps, formContext);
  const inputRefs = createMemo(
    () =>
      [contextBaseProps().inputRef, contextSlotProps?.inputRef, props.inputRef].filter(
        Boolean,
      ) as RefLike<HTMLInputElement>[],
  );

  // `children` is split out of ariaProps so neither the inputAriaProps key-copy
  // loop nor the hook accessor spread eagerly reads it — reading a Solid
  // `children` getter instantiates the nested CheckboxButton, and doing so
  // OUTSIDE InternalCheckboxContext both breaks its binding and recurses.
  const [local, ariaProps] = splitProps(propsWithFormBehavior, [
    "class",
    "style",
    "ref",
    "inputRef",
    "slot",
    "isIndeterminate",
    "description",
    "errorMessage",
    "children",
  ]);
  const descriptionId = createUniqueId();
  const errorMessageId = createUniqueId();

  const inputAriaProps = createMemo(() => {
    const clean: Record<string, unknown> = {};
    for (const key in ariaProps as Record<string, unknown>) {
      if (!key.startsWith("data-")) {
        clean[key] = (ariaProps as Record<string, unknown>)[key];
      }
    }
    return clean as typeof ariaProps;
  });

  const groupState = useContext(CheckboxGroupStateContext);

  let isSelected: Accessor<boolean>;
  let isPressed: Accessor<boolean>;
  let labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  let inputProps: () => JSX.InputHTMLAttributes<HTMLInputElement>;

  if (groupState) {
    const itemAria = createCheckboxGroupItem(
      () => ({
        ...inputAriaProps(),
        value: inputAriaProps().value ?? "",
        // The hook reads `children` only to decide if an aria-label is needed;
        // the visible label lives in the CheckboxButton, so report presence.
        children: true,
      }),
      groupState,
      inputElement,
    );
    isSelected = itemAria.isSelected;
    isPressed = itemAria.isPressed;
    labelProps = itemAria.labelProps;
    inputProps = () => itemAria.inputProps;
  } else {
    const state = createToggleState(() => ({
      isSelected: ariaProps.isSelected,
      defaultSelected: ariaProps.defaultSelected,
      onChange: ariaProps.onChange,
      isReadOnly: ariaProps.isReadOnly,
    }));

    const checkboxAria = createCheckbox(
      () => ({
        ...inputAriaProps(),
        isIndeterminate: local.isIndeterminate,
        children: true,
      }),
      state,
      inputElement,
    );
    isSelected = checkboxAria.isSelected;
    isPressed = checkboxAria.isPressed;
    labelProps = checkboxAria.labelProps;
    inputProps = () => checkboxAria.inputProps;
  }
  const isDisabled = () => inputProps().disabled === true;
  const isReadOnly = () => inputProps()["aria-readonly"] === true;
  const isInvalid = () => inputProps()["aria-invalid"] === true;
  const isIndeterminate = () => local.isIndeterminate ?? false;
  const isRequired = () => ariaProps.isRequired ?? false;

  const describedBy = () => {
    const ids = [
      ariaProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      isInvalid() && local.errorMessage ? errorMessageId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  const setInputRef = (el: HTMLInputElement) => {
    setInputElement(el);
    for (const ref of inputRefs()) {
      assignRef(ref, el);
    }
  };
  const setFieldRef = (el: HTMLDivElement) => {
    assignRef(local.ref, el);
  };

  const internalContext: InternalCheckboxContextValue = {
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    isInvalid,
    isIndeterminate,
    isRequired,
    labelProps: () => labelProps,
    inputProps,
    setInputRef,
    describedBy,
    defaultClassName: "solidaria-CheckboxButton",
  };

  const renderValues = createMemo<CheckboxFieldRenderProps>(() => ({
    isSelected: isSelected(),
    isIndeterminate: isIndeterminate(),
    isDisabled: isDisabled(),
    isReadOnly: isReadOnly(),
    isInvalid: isInvalid(),
    isRequired: isRequired(),
  }));

  const renderProps = useRenderProps(
    {
      children: mergedProps.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-CheckboxField",
    },
    renderValues,
  );

  // In a CheckboxGroup, validation is handled at the group level — mirror
  // upstream and provide no per-field FieldErrorContext there.
  const fieldErrorContext: FieldErrorContextValue | null = groupState
    ? null
    : {
        get validation(): ValidationResult {
          return {
            isInvalid: isInvalid(),
            validationDetails: VALID_VALIDITY_STATE,
            validationErrors: [],
          };
        },
        get errorMessageProps() {
          return { id: errorMessageId } as JSX.HTMLAttributes<HTMLElement>;
        },
      };

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    delete (filtered as Record<string, unknown>).id;
    delete (filtered as Record<string, unknown>).onClick;
    return filtered;
  });

  // Children are accessed inside the providers (component-execution owner) so a
  // nested CheckboxButton's useContext binds to InternalCheckboxContext.
  const FieldChildren = () => {
    const childRenderValues: CheckboxFieldRenderProps = {
      get isSelected() {
        return isSelected();
      },
      get isIndeterminate() {
        return isIndeterminate();
      },
      get isDisabled() {
        return isDisabled();
      },
      get isReadOnly() {
        return isReadOnly();
      },
      get isInvalid() {
        return isInvalid();
      },
      get isRequired() {
        return isRequired();
      },
    };
    const renderedChildren = createMemo(() => {
      const children = mergedProps.children;
      return typeof children === "function" ? children(childRenderValues) : children;
    });
    return (
      <>
        {renderedChildren()}
        <Show when={local.description}>
          <span id={descriptionId} slot="description">
            {local.description}
          </span>
        </Show>
        <Show when={isInvalid() && local.errorMessage}>
          <span id={errorMessageId} slot="errorMessage">
            {local.errorMessage}
          </span>
        </Show>
      </>
    );
  };

  const fieldDiv = (
    <div
      {...domProps()}
      ref={setFieldRef}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-selected={isSelected() || undefined}
      data-indeterminate={isIndeterminate() || undefined}
      data-disabled={isDisabled() || undefined}
      data-readonly={isReadOnly() || undefined}
      data-invalid={isInvalid() || undefined}
      data-required={isRequired() || undefined}
    >
      <InternalCheckboxContext.Provider value={internalContext}>
        <Show when={fieldErrorContext} fallback={<FieldChildren />} keyed>
          {(ctx) => (
            <FieldErrorContext.Provider value={ctx}>
              <FieldChildren />
            </FieldErrorContext.Provider>
          )}
        </Show>
      </InternalCheckboxContext.Provider>
    </div>
  );

  return fieldDiv;
}

/**
 * A checkbox button is the clickable area of a checkbox, including the indicator and label.
 * Must be rendered inside a `CheckboxField` (or the legacy `Checkbox`).
 */
export function CheckboxButton(props: CheckboxButtonProps): JSX.Element {
  const getCtx = createMemo(() => useContext(InternalCheckboxContext));
  return (
    <Show when={getCtx()} fallback={null} keyed>
      {(ctx) => <CheckboxButtonImpl buttonProps={props} ctx={ctx} />}
    </Show>
  );
}

function CheckboxButtonImpl(props: {
  buttonProps: CheckboxButtonProps;
  ctx: InternalCheckboxContextValue;
}): JSX.Element {
  const { ctx } = props;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return ctx.isDisabled() || ctx.isReadOnly();
    },
    onHoverStart: props.buttonProps.onHoverStart,
    onHoverEnd: props.buttonProps.onHoverEnd,
    onHoverChange: props.buttonProps.onHoverChange,
  });

  const renderValues = createMemo<CheckboxButtonRenderProps>(() => ({
    isSelected: ctx.isSelected(),
    isIndeterminate: ctx.isIndeterminate(),
    isHovered: isHovered(),
    isPressed: ctx.isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: ctx.isDisabled(),
    isReadOnly: ctx.isReadOnly(),
    isInvalid: ctx.isInvalid(),
    isRequired: ctx.isRequired(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.buttonProps.children,
      class: props.buttonProps.class,
      style: props.buttonProps.style,
      defaultClassName: ctx.defaultClassName,
    },
    renderValues,
  );

  const childRenderValues: CheckboxButtonRenderProps = {
    get isSelected() {
      return ctx.isSelected();
    },
    get isIndeterminate() {
      return ctx.isIndeterminate();
    },
    get isHovered() {
      return isHovered();
    },
    get isPressed() {
      return ctx.isPressed();
    },
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
    get isDisabled() {
      return ctx.isDisabled();
    },
    get isReadOnly() {
      return ctx.isReadOnly();
    },
    get isInvalid() {
      return ctx.isInvalid();
    },
    get isRequired() {
      return ctx.isRequired();
    },
  };

  const cleanLabelProps = () => {
    const { ref: _ref1, ...rest } = ctx.labelProps() as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanInputProps = () => {
    const {
      ref: _ref3,
      onFocus: _onFocus,
      onBlur: _onBlur,
      ...rest
    } = ctx.inputProps() as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const {
      ref: _ref4,
      onFocus: _onFocus,
      onBlur: _onBlur,
      ...rest
    } = focusProps as Record<string, unknown>;
    return rest;
  };
  const handleInputFocus: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    (
      ctx.inputProps() as unknown as { onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onFocus?.(event);
    (
      focusProps as unknown as { onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onFocus?.(event);
  };
  const handleInputBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    (
      ctx.inputProps() as unknown as { onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onBlur?.(event);
    (focusProps as unknown as { onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent> }).onBlur?.(
      event,
    );
  };
  const setButtonRef = (el: HTMLLabelElement) => {
    assignRef(props.buttonProps.ref, el);
  };

  const buttonChildren = () => {
    const children = props.buttonProps.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  };

  return (
    <label
      {...cleanLabelProps()}
      {...cleanHoverProps()}
      ref={setButtonRef}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={props.buttonProps.slot}
      data-selected={ctx.isSelected() || undefined}
      data-indeterminate={ctx.isIndeterminate() || undefined}
      data-pressed={ctx.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-disabled={ctx.isDisabled() || undefined}
      data-readonly={ctx.isReadOnly() || undefined}
      data-invalid={ctx.isInvalid() || undefined}
      data-required={ctx.isRequired() || undefined}
    >
      <VisuallyHidden>
        <input
          ref={ctx.setInputRef}
          {...cleanInputProps()}
          {...cleanFocusProps()}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          aria-describedby={ctx.describedBy()}
        />
      </VisuallyHidden>
      {buttonChildren()}
    </label>
  );
}
