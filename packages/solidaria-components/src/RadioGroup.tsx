/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/RadioGroup.tsx

/**
 * RadioGroup and Radio components for solidaria-components
 *
 * Pre-wired headless radio components that combine state + aria hooks.
 * Port of react-aria-components/src/RadioGroup.tsx
 */

import {
  type JSX,
  type ParentProps,
  type Context,
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
  Provider,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { TextContext } from "./Text";

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
  /**
   * Whether this component renders the visible description/error help-text nodes.
   * Defaults to `true`. A styled layer (e.g. solid-spectrum) passes `false` to keep
   * the id-minting and `aria-describedby` wiring here (so child radios inherit the
   * group's shared description via `radioGroupData`) while owning the visible node
   * itself — mirroring RAC, where the group exposes a `TextContext`/`FieldError`
   * slot rather than rendering its own help text.
   */
  renderHelpText?: boolean;
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
  const [local, ariaProps] = splitProps(mergedProps, [
    "class",
    "style",
    "render",
    "ref",
    "slot",
    "renderHelpText",
    "children",
  ]);

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
    // `props.children` is `() => <Radio />` — every read is a new instance.
    // Snapshot once so a `createSlotId` update cannot recreate the radios.
    const childrenOnce = local.children;
    const renderedChildren = () => {
      if (typeof childrenOnce === "function") {
        return childrenOnce.length > 0
          ? childrenOnce(childRenderValues)
          : (childrenOnce as unknown as () => JSX.Element)();
      }
      return childrenOnce;
    };

    return (
      <>
        {typeof childrenOnce === "function" ? renderedChildren() : childrenOnce}
        <Show when={(local.renderHelpText ?? true) && mergedProps.description}>
          <div {...(groupAria.descriptionProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
            {mergedProps.description}
          </div>
        </Show>
        <Show when={(local.renderHelpText ?? true) && isInvalid() && mergedProps.errorMessage}>
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
    }) as unknown as JSX.HTMLAttributes<HTMLDivElement>;

  // Do not call `groupDescribedBy()` in a `{local.render ? … : <div>}` ternary —
  // that memo re-runs on the `createSlotId` probe (`useField.ts:51-60`) and
  // `<GroupChildren />` becomes a new instance. RAC re-resolves `useField`
  // without remounting children (`useField.ts:66-70`). RadioGroupDefaultRoot
  // snapshots the child vnode once and reads describedby as an attribute.
  return (
    <RadioGroupStateContext.Provider value={state}>
      <FieldErrorContext.Provider value={fieldErrorContext}>
        <RadioGroupDefaultRoot
          render={local.render}
          getCustomRootProps={customRootProps}
          getRenderValues={renderValues}
          getDomProps={domProps}
          getCleanGroupProps={cleanGroupProps}
          groupEventProps={groupEventProps}
          setGroupRef={setGroupRef}
          onFocusIn={handleGroupFocusIn}
          onFocusOut={handleGroupFocusOut}
          getDescribedBy={groupDescribedBy}
          getClass={renderProps.class}
          getStyle={renderProps.style}
          slot={local.slot}
          getOrientation={() => (ariaProps.orientation as Orientation) ?? "vertical"}
          getDisabled={() => state.isDisabled || undefined}
          getReadOnly={() => state.isReadOnly || undefined}
          getRequired={() => state.isRequired || undefined}
          getInvalid={() => isInvalid() || undefined}
        >
          <GroupChildren />
        </RadioGroupDefaultRoot>
      </FieldErrorContext.Provider>
    </RadioGroupStateContext.Provider>
  );
}

function RadioGroupDefaultRoot(props: {
  children: JSX.Element;
  render?: (
    rootProps: JSX.HTMLAttributes<HTMLDivElement>,
    renderProps: RadioGroupRenderProps,
  ) => JSX.Element;
  getCustomRootProps: () => JSX.HTMLAttributes<HTMLDivElement>;
  getRenderValues: () => RadioGroupRenderProps;
  getDomProps: () => JSX.HTMLAttributes<HTMLDivElement>;
  getCleanGroupProps: () => Record<string, unknown>;
  groupEventProps: JSX.HTMLAttributes<HTMLDivElement>;
  setGroupRef: (el: HTMLDivElement) => void;
  onFocusIn: JSX.EventHandler<HTMLDivElement, FocusEvent>;
  onFocusOut: JSX.EventHandler<HTMLDivElement, FocusEvent>;
  getDescribedBy: () => string | undefined;
  getClass: () => string | undefined;
  getStyle: () => JSX.CSSProperties | string | undefined;
  slot?: string;
  getOrientation: () => Orientation;
  getDisabled: () => true | undefined;
  getReadOnly: () => true | undefined;
  getRequired: () => true | undefined;
  getInvalid: () => true | undefined;
}): JSX.Element {
  const children = props.children;

  if (props.render) {
    return props.render({ ...props.getCustomRootProps(), children }, props.getRenderValues());
  }

  return (
    <div
      {...props.getDomProps()}
      {...props.getCleanGroupProps()}
      {...props.groupEventProps}
      ref={props.setGroupRef}
      onFocusIn={props.onFocusIn}
      onFocusOut={props.onFocusOut}
      aria-describedby={props.getDescribedBy()}
      class={props.getClass()}
      style={props.getStyle()}
      slot={props.slot}
      data-orientation={props.getOrientation()}
      data-disabled={props.getDisabled()}
      data-readonly={props.getReadOnly()}
      data-required={props.getRequired()}
      data-invalid={props.getInvalid()}
    >
      {children}
    </div>
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
    const inputProps = radioAria.inputProps as Record<string, unknown>;
    const rest: Record<string, unknown> = {};
    for (const key of Object.keys(inputProps)) {
      if (key === "ref" || key === "onFocus" || key === "onBlur" || key === "aria-describedby") {
        continue;
      }
      rest[key] = inputProps[key];
    }
    return rest;
  };
  const inputDescribedBy = () => radioAria.inputDescribedBy();
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
  const setInputRef = (el: HTMLInputElement | undefined) => {
    if (!el) {
      setInputElement(null);
      return;
    }
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
        aria-describedby={inputDescribedBy()}
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

  // One-time `if` (not a JSX ternary). A `{local.render ? … : <label>}` memo
  // that re-runs on a `createSlotId` probe recreates the label/input and
  // leaves refs pointing at the detached first nodes.
  if (local.render) {
    return (
      <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
        {local.render(customLabelProps(), renderValues())}
      </SelectionIndicatorContext.Provider>
    );
  }

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
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
  // Created once under RadioGroup's provider (GroupChildren snapshots
  // `props.children`). A `<Show when={getState()} keyed>` remounted RadioImpl
  // on every `createSlotId` probe because the group state object is reactive.
  const state = useContext(RadioGroupStateContext);
  if (!state) {
    return null as unknown as JSX.Element;
  }
  return <RadioImpl radioProps={props} state={state} />;
}

// ============================================================================
// RadioField + RadioButton — the RAC form-field split (RAC 1.19)
// ----------------------------------------------------------------------------
// Upstream split the monolithic Radio into a RadioField wrapper (owns the radio
// aria + optional description) containing a RadioButton control (the clickable
// indicator + label). Mirrors react-aria-components/src/RadioGroup.tsx. The
// legacy `Radio` above stays as the deprecated monolith for back-compat.
//
// Spine note: upstream wires the two halves with InternalRadioContext +
// SelectionIndicatorContext + TextContext slots through `<Provider>`. Our
// `<Provider>` is inert and TextContext carries no slots yet
// (`port-context-slots`), so — exactly like RadioImpl already does — we use a
// native Solid context and bridge `description`/`errorMessage` with explicit
// ids. Like the legacy `Radio`, both halves require a surrounding RadioGroup.
// ============================================================================

export interface RadioFieldRenderProps {
  /** Whether the radio is selected. */
  isSelected: boolean;
  /** Whether the radio is disabled. */
  isDisabled: boolean;
  /** Whether the radio is read only. */
  isReadOnly: boolean;
  /** Whether the radio is invalid. */
  isInvalid: boolean;
  /** Whether the radio is required. */
  isRequired: boolean;
}

export interface RadioButtonRenderProps extends RadioRenderProps {}

export interface RadioFieldProps extends Omit<AriaRadioProps, "children">, SlotProps {
  /** The children of the component (typically a `RadioButton`). A function may receive render props. */
  children?: RenderChildren<RadioFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<RadioFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<RadioFieldRenderProps>;
  /** Ref for the radio field root element. */
  ref?: RefLike<HTMLDivElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
}

export interface RadioButtonProps extends SlotProps {
  /** The children of the component. A function may receive render props. */
  children?: RenderChildren<RadioButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<RadioButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<RadioButtonRenderProps>;
  /** Ref for the outer label element. */
  ref?: RefLike<HTMLLabelElement>;
  /** Handler called when hover starts. */
  onHoverStart?: () => void;
  /** Handler called when hover ends. */
  onHoverEnd?: () => void;
  /** Handler called when hover state changes. */
  onHoverChange?: (isHovered: boolean) => void;
}

export interface RadioFieldContextValue extends Partial<RadioFieldProps> {
  slots?: Record<string, Partial<RadioFieldProps>>;
}
export const RadioFieldContext = createContext<RadioFieldContextValue | null>(null);

/** Carries the radio aria + state from a RadioField/Radio wrapper to its RadioButton. */
interface InternalRadioContextValue {
  isSelected: () => boolean;
  isPressed: () => boolean;
  isDisabled: () => boolean;
  labelProps: () => JSX.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: () => JSX.InputHTMLAttributes<HTMLInputElement>;
  inputDescribedBy: () => string | undefined;
  setInputRef: (el: HTMLInputElement) => void;
  defaultClassName: string;
}
const InternalRadioContext = createContext<InternalRadioContextValue | null>(null);

/**
 * A RadioField represents an individual option within a radio group, containing a
 * `RadioButton` and optional description. Must be rendered inside a `RadioGroup`.
 * Per-option help text is wired through a TextContext description slot — render it
 * with `<Text slot="description">`. (Radios have no per-option error slot; errors
 * are reported at the group level.)
 *
 * @example
 * ```tsx
 * <RadioGroup>
 *   <RadioField value="a">
 *     <RadioButton>Option A</RadioButton>
 *     <Text slot="description">The first option</Text>
 *   </RadioField>
 * </RadioGroup>
 * ```
 */
export function RadioField(props: RadioFieldProps): JSX.Element {
  const getState = createMemo(() => useContext(RadioGroupStateContext));
  return (
    <Show when={getState()} fallback={null} keyed>
      {(state) => <RadioFieldImpl fieldProps={props} state={state} />}
    </Show>
  );
}

function RadioFieldImpl(props: {
  fieldProps: RadioFieldProps;
  state: RadioGroupState;
}): JSX.Element {
  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);
  const { state } = props;
  const contextProps = useContext(RadioFieldContext);
  const contextSlotProps = contextProps?.slots?.[props.fieldProps.slot ?? "default"];
  const contextBaseProps = createMemo<Partial<RadioFieldProps>>(() => {
    if (!contextProps) return {};
    const { slots: _slots, ...rest } = contextProps;
    return rest;
  });
  const fieldProps = contextProps
    ? (mergeProps(contextBaseProps(), contextSlotProps ?? {}, props.fieldProps) as RadioFieldProps)
    : props.fieldProps;
  const inputRefs = createMemo(
    () =>
      [contextBaseProps().inputRef, contextSlotProps?.inputRef, props.fieldProps.inputRef].filter(
        Boolean,
      ) as RefLike<HTMLInputElement>[],
  );

  // `children` is split out of ariaProps so neither the inputAriaProps key-copy
  // loop nor the hook accessor spread eagerly reads it — reading a Solid
  // `children` getter instantiates the nested RadioButton, and doing so OUTSIDE
  // InternalRadioContext both breaks its binding and recurses.
  const [local, ariaProps] = splitProps(fieldProps, [
    "class",
    "style",
    "ref",
    "inputRef",
    "slot",
    "children",
  ]);
  const inputAriaProps = createMemo(() => {
    const clean: Record<string, unknown> = {};
    for (const key in ariaProps as Record<string, unknown>) {
      if (!key.startsWith("data-")) {
        clean[key] = (ariaProps as Record<string, unknown>)[key];
      }
    }
    return clean as typeof ariaProps;
  });

  const radioAria = createRadio(
    () => ({
      ...inputAriaProps(),
      // The hook reads `children` only to decide if an aria-label is needed; the
      // visible label lives in the RadioButton, so report presence as a literal.
      children: true,
    }),
    state,
    inputElement,
  );

  // The hook mints the description slot id and bakes the combined aria-describedby
  // (own description + the group's shared description/error) into the input; the
  // field exposes that id through TextContext so a `<Text slot="description">`
  // child resolves it. Mirrors react-aria-components' RadioField Provider value
  // list (description slot only — radios have no per-option error slot).
  const textSlots = {
    slots: {
      get description() {
        return radioAria.descriptionProps;
      },
    },
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
  const setFieldRef = (el: HTMLDivElement) => {
    assignRef(local.ref, el);
  };

  const internalContext: InternalRadioContextValue = {
    isSelected: () => radioAria.isSelected(),
    isPressed: () => radioAria.isPressed(),
    isDisabled: () => radioAria.isDisabled,
    labelProps: () => radioAria.labelProps,
    inputProps: () => radioAria.inputProps,
    inputDescribedBy: () => radioAria.inputDescribedBy(),
    setInputRef,
    defaultClassName: "solidaria-RadioButton",
  };

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: radioAria.isSelected,
  }));

  const renderValues = createMemo<RadioFieldRenderProps>(() => ({
    isSelected: radioAria.isSelected(),
    isDisabled: radioAria.isDisabled,
    isReadOnly: state.isReadOnly,
    isInvalid: state.isInvalid,
    isRequired: state.isRequired,
  }));

  const renderProps = useRenderProps(
    {
      children: fieldProps.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-RadioField",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    delete (filtered as Record<string, unknown>).id;
    delete (filtered as Record<string, unknown>).onClick;
    return filtered;
  });

  // Children are accessed inside the providers (component-execution owner) so a
  // nested RadioButton's useContext binds to InternalRadioContext.
  const FieldChildren = () => {
    const childRenderValues: RadioFieldRenderProps = {
      get isSelected() {
        return radioAria.isSelected();
      },
      get isDisabled() {
        return radioAria.isDisabled;
      },
      get isReadOnly() {
        return state.isReadOnly;
      },
      get isInvalid() {
        return state.isInvalid;
      },
      get isRequired() {
        return state.isRequired;
      },
    };
    const renderedChildren = createMemo(() => {
      const children = fieldProps.children;
      return typeof children === "function" ? children(childRenderValues) : children;
    });
    return <>{renderedChildren()}</>;
  };

  return (
    <div
      {...domProps()}
      ref={setFieldRef}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-selected={radioAria.isSelected() || undefined}
      data-disabled={radioAria.isDisabled || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-invalid={state.isInvalid || undefined}
      data-required={state.isRequired || undefined}
    >
      <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
        <InternalRadioContext.Provider value={internalContext}>
          <Provider values={[[TextContext, textSlots]] as Array<[Context<unknown>, unknown]>}>
            <FieldChildren />
          </Provider>
        </InternalRadioContext.Provider>
      </SelectionIndicatorContext.Provider>
    </div>
  );
}

/**
 * A RadioButton is the clickable area of a radio, including the indicator and label.
 * Must be rendered inside a `RadioField` (or the legacy `Radio`).
 */
export function RadioButton(props: RadioButtonProps): JSX.Element {
  const getCtx = createMemo(() => useContext(InternalRadioContext));
  const getState = createMemo(() => useContext(RadioGroupStateContext));
  return (
    <Show when={getCtx()} fallback={null} keyed>
      {(ctx) => (
        <Show when={getState()} fallback={null} keyed>
          {(state) => <RadioButtonImpl buttonProps={props} ctx={ctx} state={state} />}
        </Show>
      )}
    </Show>
  );
}

function RadioButtonImpl(props: {
  buttonProps: RadioButtonProps;
  ctx: InternalRadioContextValue;
  state: RadioGroupState;
}): JSX.Element {
  const { ctx, state } = props;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return ctx.isDisabled() || state.isReadOnly;
    },
    onHoverStart: props.buttonProps.onHoverStart,
    onHoverEnd: props.buttonProps.onHoverEnd,
    onHoverChange: props.buttonProps.onHoverChange,
  });

  const renderValues = createMemo<RadioButtonRenderProps>(() => ({
    isSelected: ctx.isSelected(),
    isHovered: isHovered(),
    isPressed: ctx.isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: ctx.isDisabled(),
    isReadOnly: state.isReadOnly,
    isInvalid: state.isInvalid,
    isRequired: state.isRequired,
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
  const handleInputClick: JSX.EventHandler<HTMLInputElement, MouseEvent> = (event) => {
    (
      ctx.inputProps() as unknown as { onClick?: JSX.EventHandler<HTMLInputElement, MouseEvent> }
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
      ctx.inputProps() as unknown as { onChange?: JSX.EventHandler<HTMLInputElement, Event> }
    ).onChange?.(event);
    state.updateValidation(
      event.currentTarget.validity.valid
        ? validValidation
        : getNativeValidation(event.currentTarget),
    );
    state.commitValidation();
  };
  const setButtonRef = (el: HTMLLabelElement) => {
    assignRef(props.buttonProps.ref, el);
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
      data-pressed={ctx.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-disabled={ctx.isDisabled() || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-invalid={state.isInvalid || undefined}
      data-required={state.isRequired || undefined}
    >
      <VisuallyHidden>
        <input
          ref={ctx.setInputRef}
          {...cleanInputProps()}
          {...cleanFocusProps()}
          aria-describedby={ctx.inputDescribedBy()}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onInvalid={handleInputInvalid}
          onChange={handleInputChange}
          onClick={handleInputClick}
        />
      </VisuallyHidden>
      {renderProps.renderChildren()}
    </label>
  );
}
