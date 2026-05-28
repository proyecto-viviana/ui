/**
 * RadioGroup and Radio components for solidaria-components
 *
 * Pre-wired headless radio components that combine state + aria hooks.
 * Port of react-aria-components/src/RadioGroup.tsx
 */

import {
  type JSX,
  type ParentProps,
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import {
  createRadio,
  createRadioGroup,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaRadioProps,
  type AriaRadioGroupProps,
} from "@proyecto-viviana/solidaria";
import {
  createRadioGroupState,
  VALID_VALIDITY_STATE,
  type RadioGroupState,
  type RadioGroupProps as RadioGroupStateProps,
  type ValidationResult,
} from "@proyecto-viviana/solid-stately";
import { FieldErrorContext, type FieldErrorContextValue } from "./FieldError";
import { VisuallyHidden } from "./VisuallyHidden";
import {
  SelectionIndicatorContext,
  type SelectionIndicatorContextValue,
} from "./SelectionIndicator";
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

const validValidation: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  validationErrors: [],
};

function getNativeValidation(input: HTMLInputElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: {
      badInput: input.validity.badInput,
      customError: input.validity.customError,
      patternMismatch: input.validity.patternMismatch,
      rangeOverflow: input.validity.rangeOverflow,
      rangeUnderflow: input.validity.rangeUnderflow,
      stepMismatch: input.validity.stepMismatch,
      tooLong: input.validity.tooLong,
      tooShort: input.validity.tooShort,
      typeMismatch: input.validity.typeMismatch,
      valueMissing: input.validity.valueMissing,
      valid: input.validity.valid,
    },
    validationErrors: input.validationMessage ? [input.validationMessage] : [],
  };
}

export type Orientation = "horizontal" | "vertical";

export interface RadioGroupRenderProps {
  /** The orientation of the radio group. */
  orientation: Orientation;
  /** Whether the radio group is disabled. */
  isDisabled: boolean;
  /** Whether the radio group is read only. */
  isReadOnly: boolean;
  /** Whether the radio group is required. */
  isRequired: boolean;
  /** Whether the radio group is invalid. */
  isInvalid: boolean;
  /** State of the radio group. */
  state: RadioGroupState;
}

export interface RadioRenderProps {
  /** Whether the radio is selected. */
  isSelected: boolean;
  /** Whether the radio is currently hovered with a mouse. */
  isHovered: boolean;
  /** Whether the radio is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the radio is focused, either via a mouse or keyboard. */
  isFocused: boolean;
  /** Whether the radio is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the radio is disabled. */
  isDisabled: boolean;
  /** Whether the radio is read only. */
  isReadOnly: boolean;
  /** Whether the radio is invalid. */
  isInvalid: boolean;
  /** Whether the radio is required. */
  isRequired: boolean;
}

export interface RadioGroupProps
  extends
    Omit<AriaRadioGroupProps, "children" | "label" | "description" | "errorMessage">,
    Pick<
      RadioGroupStateProps,
      "value" | "defaultValue" | "onChange" | "validationState" | "validate"
    >,
    SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<RadioGroupRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<RadioGroupRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<RadioGroupRenderProps>;
  /** Custom renderer for the outer radio group element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLDivElement>,
    renderProps: RadioGroupRenderProps,
  ) => JSX.Element;
  /** Ref for the radio group element. */
  ref?: RefLike<HTMLDivElement>;
  /** A description for the radio group. */
  description?: JSX.Element;
  /** An error message for the radio group. */
  errorMessage?: JSX.Element;
}

export interface RadioProps extends Omit<AriaRadioProps, "children">, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<RadioRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<RadioRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<RadioRenderProps>;
  /** Custom renderer for the outer radio label element. */
  render?: (
    props: JSX.LabelHTMLAttributes<HTMLLabelElement>,
    renderProps: RadioRenderProps,
  ) => JSX.Element;
  /** Ref for the outer label element. */
  ref?: RefLike<HTMLLabelElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
  /** A description for the radio. */
  description?: JSX.Element;
  /** An error message for the radio. */
  errorMessage?: JSX.Element;
  /** Handler called when hover starts. */
  onHoverStart?: () => void;
  /** Handler called when hover ends. */
  onHoverEnd?: () => void;
  /** Handler called when hover state changes. */
  onHoverChange?: (isHovered: boolean) => void;
}

export interface RadioGroupContextValue extends RadioGroupProps {
  slots?: Record<string, RadioGroupProps>;
}
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
export const RadioGroupStateContext = createContext<RadioGroupState | null>(null);
export interface RadioContextValue extends RadioProps {
  slots?: Record<string, RadioProps>;
}
export const RadioContext = createContext<RadioContextValue | null>(null);

/**
 * A radio group allows a user to select a single item from a list of mutually exclusive options.
 *
 * @example
 * ```tsx
 * <RadioGroup>
 *   <Radio value="one">Option 1</Radio>
 *   <Radio value="two">Option 2</Radio>
 * </RadioGroup>
 * ```
 */
export function RadioGroup(props: ParentProps<RadioGroupProps>): JSX.Element {
  const contextProps = useContext(RadioGroupContext);
  const contextSlotProps = contextProps?.slots?.[props.slot ?? "default"];
  const contextBaseProps = createMemo<RadioGroupProps>(() => {
    if (!contextProps) return {};
    const { slots: _slots, ...rest } = contextProps;
    return rest;
  });
  const mergedProps = contextProps
    ? (mergeProps(
        contextBaseProps(),
        contextSlotProps ?? {},
        props,
      ) as ParentProps<RadioGroupProps>)
    : props;
  const [local, ariaProps] = splitProps(mergedProps, ["class", "style", "render", "ref", "slot"]);

  const state = createRadioGroupState(() => ({
    value: mergedProps.value,
    defaultValue: mergedProps.defaultValue,
    onChange: mergedProps.onChange,
    isDisabled: mergedProps.isDisabled,
    isReadOnly: mergedProps.isReadOnly,
    isRequired: mergedProps.isRequired,
    isInvalid: mergedProps.isInvalid,
    validationState: mergedProps.validationState,
    validate: mergedProps.validate,
    validationBehavior: mergedProps.validationBehavior,
    name: mergedProps.name,
    form: mergedProps.form,
  }));

  // Create radio group aria props
  const groupAria = createRadioGroup(
    () => ({
      ...ariaProps,
      description: mergedProps.description,
      errorMessage: mergedProps.errorMessage,
    }),
    state,
  );
  const isInvalid = createMemo(() => state.isInvalid);
  const validation = createMemo(() => state.displayValidation());
  const fallbackErrorMessageId = createUniqueId();
  const errorMessageId = () => groupAria.errorMessageProps.id ?? fallbackErrorMessageId;

  const renderValues = createMemo<RadioGroupRenderProps>(() => ({
    orientation: (ariaProps.orientation as Orientation) ?? "vertical",
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isRequired: state.isRequired,
    isInvalid: isInvalid(),
    state,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-RadioGroup",
    },
    renderValues,
  );

  const domProps = createMemo(() => filterDOMProps(ariaProps, { global: true }));

  const cleanGroupProps = () => {
    const { ref: _ref, ...rest } = groupAria.radioGroupProps as Record<string, unknown>;
    return rest;
  };
  const handleGroupFocusIn: JSX.EventHandler<HTMLDivElement, FocusEvent> = (event) => {
    (
      groupAria.radioGroupProps as unknown as {
        onFocus?: JSX.EventHandler<HTMLDivElement, FocusEvent>;
      }
    ).onFocus?.(event);
  };
  const handleGroupFocusOut: JSX.EventHandler<HTMLDivElement, FocusEvent> = (event) => {
    (
      groupAria.radioGroupProps as unknown as {
        onBlur?: JSX.EventHandler<HTMLDivElement, FocusEvent>;
      }
    ).onBlur?.(event);
  };
  const handleGroupInvalidCapture: JSX.EventHandler<HTMLDivElement, Event> = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "radio") {
      return;
    }

    state.updateValidation(getNativeValidation(target));
    state.commitValidation();
    target.focus();
    event.preventDefault();
  };
  const handleGroupChangeCapture: JSX.EventHandler<HTMLDivElement, Event> = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "radio") {
      return;
    }

    state.updateValidation(target.validity.valid ? validValidation : getNativeValidation(target));
    state.commitValidation();
  };
  const setGroupRef = (el: HTMLDivElement) => {
    assignRef(local.ref, el);
  };
  const groupDescribedBy = () => {
    const ids = [
      (cleanGroupProps() as { "aria-describedby"?: string })["aria-describedby"],
      mergedProps.description ? groupAria.descriptionProps.id : undefined,
      isInvalid() && (mergedProps.errorMessage || validation().validationErrors.length > 0)
        ? errorMessageId()
        : undefined,
    ]
      .filter(Boolean)
      .join(" ")
      .split(" ")
      .filter(Boolean);
    return ids.length ? Array.from(new Set(ids)).join(" ") : undefined;
  };
  const fieldErrorContext: FieldErrorContextValue = {
    get validation() {
      return validation();
    },
    get errorMessageProps() {
      return {
        ...groupAria.errorMessageProps,
        id: errorMessageId(),
      } as JSX.HTMLAttributes<HTMLElement>;
    },
  };

  const GroupChildren = () => {
    const childRenderValues: RadioGroupRenderProps = {
      get orientation() {
        return (ariaProps.orientation as Orientation) ?? "vertical";
      },
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
        return isInvalid();
      },
      get state() {
        return state;
      },
    };
    const renderedChildren = createMemo(() => {
      const children = props.children;
      if (typeof children === "function") {
        return children.length > 0
          ? children(childRenderValues)
          : (children as unknown as () => JSX.Element)();
      }
      return children;
    });

    return (
      <>
        {renderedChildren()}
        <Show when={mergedProps.description}>
          <div {...(groupAria.descriptionProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
            {mergedProps.description}
          </div>
        </Show>
        <Show when={isInvalid() && mergedProps.errorMessage}>
          <div {...(groupAria.errorMessageProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
            {mergedProps.errorMessage}
          </div>
        </Show>
      </>
    );
  };
  const groupEventProps = {
    onInvalidCapture: handleGroupInvalidCapture,
    onChangeCapture: handleGroupChangeCapture,
  } as unknown as JSX.HTMLAttributes<HTMLDivElement>;
  const customRootProps = () =>
    ({
      ...domProps(),
      ...cleanGroupProps(),
      ...groupEventProps,
      ref: setGroupRef,
      onFocusIn: handleGroupFocusIn,
      onFocusOut: handleGroupFocusOut,
      "aria-describedby": groupDescribedBy(),
      class: renderProps.class(),
      style: renderProps.style(),
      slot: local.slot,
      "data-orientation": ariaProps.orientation ?? "vertical",
      "data-disabled": state.isDisabled || undefined,
      "data-readonly": state.isReadOnly || undefined,
      "data-required": state.isRequired || undefined,
      "data-invalid": isInvalid() || undefined,
      children: <GroupChildren />,
    }) as unknown as JSX.HTMLAttributes<HTMLDivElement>;

  return (
    <RadioGroupStateContext.Provider value={state}>
      <FieldErrorContext.Provider value={fieldErrorContext}>
        {local.render ? (
          local.render(customRootProps(), renderValues())
        ) : (
          <div
            {...domProps()}
            {...cleanGroupProps()}
            {...groupEventProps}
            ref={setGroupRef}
            onFocusIn={handleGroupFocusIn}
            onFocusOut={handleGroupFocusOut}
            aria-describedby={groupDescribedBy()}
            class={renderProps.class()}
            style={renderProps.style()}
            slot={local.slot}
            data-orientation={ariaProps.orientation ?? "vertical"}
            data-disabled={state.isDisabled || undefined}
            data-readonly={state.isReadOnly || undefined}
            data-required={state.isRequired || undefined}
            data-invalid={isInvalid() || undefined}
          >
            <GroupChildren />
          </div>
        )}
      </FieldErrorContext.Provider>
    </RadioGroupStateContext.Provider>
  );
}

/**
 * Internal Radio implementation that has access to RadioGroupStateContext.
 * This is rendered inside the RadioGroup's context provider.
 */
function RadioImpl(props: { radioProps: RadioProps; state: RadioGroupState }): JSX.Element {
  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);
  const { state } = props;
  const contextProps = useContext(RadioContext);
  const contextSlotProps = contextProps?.slots?.[props.radioProps.slot ?? "default"];
  const contextBaseProps = createMemo<RadioProps>(() => {
    if (!contextProps) return {} as RadioProps;
    const { slots: _slots, ...rest } = contextProps;
    return rest as RadioProps;
  });
  const radioProps = contextProps
    ? (mergeProps(contextBaseProps(), contextSlotProps ?? {}, props.radioProps) as RadioProps)
    : props.radioProps;
  const inputRefs = createMemo(
    () =>
      [contextBaseProps().inputRef, contextSlotProps?.inputRef, props.radioProps.inputRef].filter(
        Boolean,
      ) as RefLike<HTMLInputElement>[],
  );

  const [local, ariaProps] = splitProps(radioProps, [
    "class",
    "style",
    "render",
    "ref",
    "inputRef",
    "slot",
    "description",
    "errorMessage",
    "onHoverStart",
    "onHoverEnd",
    "onHoverChange",
  ]);
  const descriptionId = createUniqueId();
  const errorMessageId = createUniqueId();
  const describedBy = () => {
    const ids = [
      ariaProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      state.isInvalid && local.errorMessage ? errorMessageId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };
  const inputAriaProps = createMemo(() => {
    const clean: Record<string, unknown> = {};
    for (const key in ariaProps as Record<string, unknown>) {
      if (!key.startsWith("data-")) {
        clean[key] = (ariaProps as Record<string, unknown>)[key];
      }
    }
    return clean as typeof ariaProps;
  });

  // Create radio aria props
  const radioAria = createRadio(
    () => ({
      ...inputAriaProps(),
      "aria-describedby": describedBy(),
      children: typeof radioProps.children === "function" ? true : radioProps.children,
    }),
    state,
    inputElement,
  );

  // Create focus ring
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  // Create hover
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return radioAria.isDisabled || state.isReadOnly;
    },
    onHoverStart: local.onHoverStart,
    onHoverEnd: local.onHoverEnd,
    onHoverChange: local.onHoverChange,
  });

  const renderValues = createMemo<RadioRenderProps>(() => ({
    isSelected: radioAria.isSelected(),
    isHovered: isHovered(),
    isPressed: radioAria.isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: radioAria.isDisabled,
    isReadOnly: state.isReadOnly,
    isInvalid: state.isInvalid,
    isRequired: state.isRequired,
  }));

  const renderProps = useRenderProps(
    {
      children: radioProps.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Radio",
    },
    renderValues,
  );

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: radioAria.isSelected,
  }));

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    delete (filtered as Record<string, unknown>).id;
    delete (filtered as Record<string, unknown>).onClick;
    return filtered;
  });

  const cleanLabelProps = () => {
    const { ref: _ref1, ...rest } = radioAria.labelProps as Record<string, unknown>;
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
    } = radioAria.inputProps as Record<string, unknown>;
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
      radioAria.inputProps as unknown as {
        onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>;
      }
    ).onFocus?.(event);
    (
      focusProps as unknown as { onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onFocus?.(event);
  };
  const handleInputBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    (
      radioAria.inputProps as unknown as { onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent> }
    ).onBlur?.(event);
    (focusProps as unknown as { onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent> }).onBlur?.(
      event,
    );
  };
  const handleLabelClick: JSX.EventHandler<HTMLLabelElement, MouseEvent> = (event) => {
    (ariaProps as unknown as { onClickCapture?: (event: MouseEvent) => void }).onClickCapture?.(
      event as unknown as MouseEvent,
    );
    (
      radioAria.labelProps as unknown as {
        onClick?: JSX.EventHandler<HTMLLabelElement, MouseEvent>;
      }
    ).onClick?.(event);
  };
  const handleLabelClickCapture: JSX.EventHandler<HTMLLabelElement, MouseEvent> = (event) => {
    (ariaProps as unknown as { onClickCapture?: (event: MouseEvent) => void }).onClickCapture?.(
      event as unknown as MouseEvent,
    );
  };
  const handleInputClick: JSX.EventHandler<HTMLInputElement, MouseEvent> = (event) => {
    (
      radioAria.inputProps as unknown as {
        onClick?: JSX.EventHandler<HTMLInputElement, MouseEvent>;
      }
    ).onClick?.(event);
  };
  const handleInputInvalid: JSX.EventHandler<HTMLInputElement, Event> = (event) => {
    state.updateValidation(getNativeValidation(event.currentTarget));
    state.commitValidation();
    event.currentTarget.focus();
    event.preventDefault();
  };
  const handleInputChange: JSX.EventHandler<HTMLInputElement, Event> = (event) => {
    (
      radioAria.inputProps as unknown as { onChange?: JSX.EventHandler<HTMLInputElement, Event> }
    ).onChange?.(event);
    state.updateValidation(
      event.currentTarget.validity.valid
        ? validValidation
        : getNativeValidation(event.currentTarget),
    );
    state.commitValidation();
  };
  const setLabelRef = (el: HTMLLabelElement) => {
    assignRef(local.ref, el);
  };
  const setInputRef = (el: HTMLInputElement) => {
    setInputElement(el);
    el.addEventListener("invalid", (event) => {
      state.updateValidation(getNativeValidation(el));
      state.commitValidation();
      el.focus();
      event.preventDefault();
    });
    el.addEventListener("change", () => {
      state.updateValidation(el.validity.valid ? validValidation : getNativeValidation(el));
      state.commitValidation();
    });
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
        onInvalid={handleInputInvalid}
        onChange={handleInputChange}
        onClick={handleInputClick}
      />
    </VisuallyHidden>
  );
  const labelChildren = () => (
    <>
      {hiddenInput}
      {renderProps.renderChildren()}
      <Show when={local.description}>
        <span id={descriptionId} slot="description">
          {local.description}
        </span>
      </Show>
      <Show when={state.isInvalid && local.errorMessage}>
        <span id={errorMessageId} slot="errorMessage">
          {local.errorMessage}
        </span>
      </Show>
    </>
  );
  const customLabelProps = () =>
    ({
      ...domProps(),
      ...cleanLabelProps(),
      ...cleanHoverProps(),
      ref: setLabelRef,
      class: renderProps.class(),
      style: renderProps.style(),
      slot: local.slot,
      onClick: handleLabelClick,
      onClickCapture: handleLabelClickCapture,
      "data-selected": radioAria.isSelected() || undefined,
      "data-pressed": radioAria.isPressed() || undefined,
      "data-hovered": isHovered() || undefined,
      "data-focused": isFocused() || undefined,
      "data-focus-visible": isFocusVisible() || undefined,
      "data-disabled": radioAria.isDisabled || undefined,
      "data-readonly": state.isReadOnly || undefined,
      "data-invalid": state.isInvalid || undefined,
      "data-required": state.isRequired || undefined,
      children: labelChildren(),
    }) as unknown as JSX.LabelHTMLAttributes<HTMLLabelElement>;
  const labelCaptureProps = {
    onClickCapture: handleLabelClickCapture,
  } as unknown as JSX.LabelHTMLAttributes<HTMLLabelElement>;

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
      {local.render ? (
        local.render(customLabelProps(), renderValues())
      ) : (
        <label
          {...domProps()}
          {...cleanLabelProps()}
          {...cleanHoverProps()}
          ref={setLabelRef}
          class={renderProps.class()}
          style={renderProps.style()}
          slot={local.slot}
          onClick={handleLabelClick}
          {...labelCaptureProps}
          data-selected={radioAria.isSelected() || undefined}
          data-pressed={radioAria.isPressed() || undefined}
          data-hovered={isHovered() || undefined}
          data-focused={isFocused() || undefined}
          data-focus-visible={isFocusVisible() || undefined}
          data-disabled={radioAria.isDisabled || undefined}
          data-readonly={state.isReadOnly || undefined}
          data-invalid={state.isInvalid || undefined}
          data-required={state.isRequired || undefined}
        >
          {labelChildren()}
        </label>
      )}
    </SelectionIndicatorContext.Provider>
  );
}

/**
 * A radio represents an individual option within a radio group.
 *
 * @example
 * ```tsx
 * <Radio value="option1">
 *   {({ isSelected }) => (
 *     <>
 *       <span class={`radio ${isSelected ? 'selected' : ''}`}>
 *         {isSelected && '●'}
 *       </span>
 *       <span>Option 1</span>
 *     </>
 *   )}
 * </Radio>
 * ```
 */
export function Radio(props: RadioProps): JSX.Element {
  // Get context - will be null if not inside RadioGroup
  // The context is accessed reactively to work with solid-refresh HMR
  const getState = createMemo(() => useContext(RadioGroupStateContext));

  return (
    <Show when={getState()} fallback={null} keyed>
      {(state) => <RadioImpl radioProps={props} state={state} />}
    </Show>
  );
}
