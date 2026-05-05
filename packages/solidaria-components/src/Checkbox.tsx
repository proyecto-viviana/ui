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
  const [local, ariaProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "description",
    "errorMessage",
  ]);

  // Use getters to ensure props are read lazily inside reactive contexts
  const state = createCheckboxGroupState({
    get value() {
      return ariaProps.value;
    },
    get defaultValue() {
      return ariaProps.defaultValue;
    },
    get onChange() {
      return ariaProps.onChange;
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
  });

  const groupAria = createCheckboxGroup(
    () => ({
      ...ariaProps,
      description: props.description,
      errorMessage: props.errorMessage,
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
      children: props.children,
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
  const groupDescribedBy = () => {
    const ids = [
      (cleanGroupProps() as { "aria-describedby"?: string })["aria-describedby"],
      props.description ? groupAria.descriptionProps.id : undefined,
      groupAria.isInvalid && props.errorMessage ? groupAria.errorMessageProps.id : undefined,
    ]
      .filter(Boolean)
      .join(" ")
      .split(" ")
      .filter(Boolean);
    return ids.length ? Array.from(new Set(ids)).join(" ") : undefined;
  };

  // Resolve children - we need to pass render props if children is a function
  // but we use props.children directly (not renderProps.renderChildren())
  // to preserve SolidJS context propagation for nested components like Checkbox
  const resolvedChildren = () => {
    const children = props.children;
    if (typeof children === "function") {
      return children(renderValues());
    }
    return children;
  };

  return (
    <CheckboxGroupStateContext.Provider value={state}>
      <div
        {...domProps()}
        {...cleanGroupProps()}
        aria-describedby={groupDescribedBy()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={state.isDisabled || undefined}
        data-readonly={state.isReadOnly || undefined}
        data-required={ariaProps.isRequired || undefined}
        data-invalid={groupAria.isInvalid || undefined}
      >
        {resolvedChildren()}
        <Show when={props.description}>
          <div {...(groupAria.descriptionProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
            {props.description}
          </div>
        </Show>
        <Show when={groupAria.isInvalid && props.errorMessage}>
          <div {...(groupAria.errorMessageProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
            {props.errorMessage}
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
  let inputRef: HTMLInputElement | null = null;
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
  const inputRefs = createMemo(
    () =>
      [contextBaseProps().inputRef, contextSlotProps?.inputRef, props.inputRef].filter(
        Boolean,
      ) as RefLike<HTMLInputElement>[],
  );

  const [local, ariaProps] = splitProps(mergedProps, [
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
  let isDisabled: boolean;
  let isReadOnly: boolean;
  let isInvalid: boolean;
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
      () => inputRef,
    );
    isSelected = itemAria.isSelected;
    isPressed = itemAria.isPressed;
    isDisabled = itemAria.isDisabled;
    isReadOnly = itemAria.isReadOnly;
    isInvalid = itemAria.isInvalid;
    labelProps = itemAria.labelProps;
    inputProps = () => itemAria.inputProps;
  } else {
    // Use getters to ensure props are read lazily inside reactive contexts
    const state = createToggleState({
      get isSelected() {
        return ariaProps.isSelected;
      },
      get defaultSelected() {
        return ariaProps.defaultSelected;
      },
      get onChange() {
        return ariaProps.onChange;
      },
      get isReadOnly() {
        return ariaProps.isReadOnly;
      },
    });

    const checkboxAria = createCheckbox(
      () => ({
        ...inputAriaProps(),
        isIndeterminate: local.isIndeterminate,
        children: typeof mergedProps.children === "function" ? true : mergedProps.children,
      }),
      state,
      () => inputRef,
    );
    isSelected = checkboxAria.isSelected;
    isPressed = checkboxAria.isPressed;
    isDisabled = checkboxAria.isDisabled;
    isReadOnly = checkboxAria.isReadOnly;
    isInvalid = checkboxAria.isInvalid;
    labelProps = checkboxAria.labelProps;
    inputProps = () => checkboxAria.inputProps;
  }
  const describedBy = () => {
    const ids = [
      ariaProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      isInvalid && local.errorMessage ? errorMessageId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled || isReadOnly;
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
    isDisabled,
    isReadOnly,
    isInvalid,
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
    inputRef = el;
    for (const ref of inputRefs()) {
      assignRef(ref, el);
    }
  };
  const labelChildren = () => (
    <>
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
      {renderProps.renderChildren()}
      <Show when={local.description}>
        <span id={descriptionId} slot="description">
          {local.description}
        </span>
      </Show>
      <Show when={isInvalid && local.errorMessage}>
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
        "data-disabled": isDisabled || undefined,
        "data-readonly": isReadOnly || undefined,
        "data-invalid": isInvalid || undefined,
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
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={isInvalid || undefined}
      data-required={ariaProps.isRequired || undefined}
    >
      {labelChildren()}
    </label>
  );
}
