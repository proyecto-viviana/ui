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
  type CheckboxGroupState,
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
