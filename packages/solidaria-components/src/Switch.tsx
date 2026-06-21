/**
 * ToggleSwitch component for solidaria-components
 *
 * A pre-wired headless switch that combines state + aria hooks.
 * Port of react-aria-components/src/Switch.tsx
 *
 * Named "ToggleSwitch" to avoid conflict with SolidJS's built-in Switch component.
 */

import {
  type JSX,
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
  untrack,
  useContext,
  Show,
} from "solid-js";
import {
  createSwitch,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaSwitchProps,
  type SwitchAria,
} from "@proyecto-viviana/solidaria";
import {
  createToggleState,
  VALID_VALIDITY_STATE,
  type ToggleState,
  type ValidationResult,
} from "@proyecto-viviana/solid-stately";
import { VisuallyHidden } from "./VisuallyHidden";
import { FieldErrorContext, type FieldErrorContextValue } from "./FieldError";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface ToggleSwitchRenderProps {
  /** Whether the switch is selected. */
  isSelected: boolean;
  /** Whether the switch is currently hovered with a mouse. */
  isHovered: boolean;
  /** Whether the switch is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the switch is focused, either via a mouse or keyboard. */
  isFocused: boolean;
  /** Whether the switch is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the switch is disabled. */
  isDisabled: boolean;
  /** Whether the switch is read only. */
  isReadOnly: boolean;
  /** Whether the switch is invalid. */
  isInvalid: boolean;
  /** State of the switch. */
  state: ToggleState;
}

export interface ToggleSwitchProps extends Omit<AriaSwitchProps, "children">, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<ToggleSwitchRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ToggleSwitchRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ToggleSwitchRenderProps>;
  /** A description for the switch. */
  description?: JSX.Element;
  /** An error message for the switch. */
  errorMessage?: JSX.Element;
}

export const ToggleSwitchContext = createContext<ToggleSwitchProps | null>(null);

/**
 * A switch allows a user to turn a setting on or off.
 *
 * This is a headless component that provides accessibility and state management.
 * Style it using the render props pattern or data attributes.
 *
 * Named "ToggleSwitch" to avoid conflict with SolidJS's built-in Switch component.
 *
 * @example
 * ```tsx
 * <ToggleSwitch>
 *   {({ isSelected }) => (
 *     <>
 *       <span class={`switch-track ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}`}>
 *         <span class={`switch-thumb ${isSelected ? 'translate-x-5' : 'translate-x-0'}`} />
 *       </span>
 *       <span>Enable notifications</span>
 *     </>
 *   )}
 * </ToggleSwitch>
 * ```
 */
export function ToggleSwitch(props: ToggleSwitchProps): JSX.Element {
  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);

  const [local, ariaProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "description",
    "errorMessage",
  ]);
  const descriptionId = createUniqueId();
  const errorMessageId = createUniqueId();

  // Use getters to ensure props are read lazily inside reactive contexts
  const state = createToggleState(() => ({
    isSelected: ariaProps.isSelected,
    defaultSelected: ariaProps.defaultSelected,
    onChange: ariaProps.onChange,
    isReadOnly: ariaProps.isReadOnly,
  }));

  const switchAria = createSwitch(
    () => ({
      ...ariaProps,
      children: typeof props.children === "function" ? true : props.children,
    }),
    state,
    inputElement,
  );
  const describedBy = () => {
    const ids = [
      ariaProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      switchAria.isInvalid && local.errorMessage ? errorMessageId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return ariaProps.isDisabled || ariaProps.isReadOnly;
    },
  });

  const renderValues = createMemo<ToggleSwitchRenderProps>(() => ({
    isSelected: switchAria.isSelected(),
    isHovered: isHovered(),
    isPressed: switchAria.isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: switchAria.isDisabled,
    isReadOnly: switchAria.isReadOnly,
    isInvalid: switchAria.isInvalid,
    state,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ToggleSwitch",
    },
    renderValues,
  );
  const childRenderValues: ToggleSwitchRenderProps = {
    get isSelected() {
      return switchAria.isSelected();
    },
    get isHovered() {
      return isHovered();
    },
    get isPressed() {
      return switchAria.isPressed();
    },
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
    get isDisabled() {
      return switchAria.isDisabled;
    },
    get isReadOnly() {
      return switchAria.isReadOnly;
    },
    get isInvalid() {
      return switchAria.isInvalid;
    },
    get state() {
      return state;
    },
  };

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    delete (filtered as Record<string, unknown>).id;
    delete (filtered as Record<string, unknown>).onClick;
    return filtered;
  });

  const cleanLabelProps = () => {
    const { ref: _ref1, ...rest } = switchAria.labelProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanInputProps = () => {
    const { ref: _ref3, ...rest } = switchAria.inputProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref4, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  // Resolve the render-prop children ONCE (untracked) — see TextField. Re-invoking
  // it on a reactive update re-clones its templates and, mid-hydration, throws a
  // Hydration Mismatch. The children keep fine-grained reactivity via the
  // childRenderValues getters + <Show>s.
  const switchChildren = untrack(() => {
    const children = props.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  });

  return (
    <label
      {...domProps()}
      {...cleanLabelProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-selected={switchAria.isSelected() || undefined}
      data-pressed={switchAria.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-disabled={switchAria.isDisabled || undefined}
      data-readonly={switchAria.isReadOnly || undefined}
    >
      <VisuallyHidden>
        <input
          ref={setInputElement}
          {...cleanInputProps()}
          {...cleanFocusProps()}
          aria-describedby={describedBy()}
        />
      </VisuallyHidden>
      {switchChildren}
      <Show when={local.description}>
        <span id={descriptionId} slot="description">
          {local.description}
        </span>
      </Show>
      <Show when={switchAria.isInvalid && local.errorMessage}>
        <span id={errorMessageId} slot="errorMessage">
          {local.errorMessage}
        </span>
      </Show>
    </label>
  );
}

// ============================================================================
// SwitchField + SwitchButton — the RAC form-field split (RAC 1.19)
// ----------------------------------------------------------------------------
// Upstream split the monolithic Switch into a SwitchField wrapper (owns state,
// validation, and help text) containing a SwitchButton control (the clickable
// label + indicator). Mirrors react-aria-components/src/Switch.tsx. The legacy
// `ToggleSwitch` above stays as the deprecated monolith for back-compat.
//
// Spine note: react-aria-components passes its InternalSwitchContext +
// description/error wiring through a `<Provider values=…>` and TextContext
// slots. Our `<Provider>` (utils) is inert and TextContext carries no slots yet
// (the tracked `port-context-slots` work), so — exactly like RadioGroup and
// ToggleSwitch already do — we wire the two halves with a native Solid context
// and bridge `description`/`errorMessage` with explicit ids + aria-describedby.
// ============================================================================

export interface SwitchFieldRenderProps {
  /** Whether the switch is selected. */
  isSelected: boolean;
  /** Whether the switch is disabled. */
  isDisabled: boolean;
  /** Whether the switch is read only. */
  isReadOnly: boolean;
  /** Whether the switch is invalid. */
  isInvalid: boolean;
  /** Whether the switch is required. */
  isRequired: boolean;
  /** State of the switch. */
  state: ToggleState;
}

export interface SwitchButtonRenderProps extends ToggleSwitchRenderProps {
  /** Whether the switch is required. */
  isRequired: boolean;
}

export interface SwitchFieldProps extends Omit<AriaSwitchProps, "children">, SlotProps {
  /** The children of the component (typically a `SwitchButton`). A function may receive render props. */
  children?: RenderChildren<SwitchFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SwitchFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SwitchFieldRenderProps>;
  /**
   * A description for the switch. Bridged with explicit ids + aria-describedby
   * until TextContext slots are live (`port-context-slots`).
   */
  description?: JSX.Element;
  /** An error message for the switch. */
  errorMessage?: JSX.Element;
}

export interface SwitchButtonProps extends SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<SwitchButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SwitchButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SwitchButtonRenderProps>;
  /** Handler called when hover starts. */
  onHoverStart?: () => void;
  /** Handler called when hover ends. */
  onHoverEnd?: () => void;
  /** Handler called when hover state changes. */
  onHoverChange?: (isHovered: boolean) => void;
}

export interface SwitchFieldContextValue extends SwitchFieldProps {
  slots?: Record<string, SwitchFieldProps>;
}
export const SwitchFieldContext = createContext<SwitchFieldContextValue | null>(null);

/** Carries the switch aria + state from a SwitchField/Switch wrapper to its SwitchButton. */
interface InternalSwitchContextValue {
  switchAria: SwitchAria;
  state: ToggleState;
  setInputElement: (el: HTMLInputElement | null) => void;
  describedBy: () => string | undefined;
  defaultClassName: string;
  isRequired: boolean;
}
const InternalSwitchContext = createContext<InternalSwitchContextValue | null>(null);

/**
 * A switch button is the clickable area of a switch, including the indicator and label.
 * Must be rendered inside a `SwitchField` (or the legacy `ToggleSwitch`).
 */
export function SwitchButton(props: SwitchButtonProps): JSX.Element {
  // Accessed reactively so it resolves once the parent provider mounts (HMR-safe).
  const getCtx = createMemo(() => useContext(InternalSwitchContext));
  return (
    <Show when={getCtx()} fallback={null} keyed>
      {(ctx) => <SwitchButtonImpl buttonProps={props} ctx={ctx} />}
    </Show>
  );
}

function SwitchButtonImpl(props: {
  buttonProps: SwitchButtonProps;
  ctx: InternalSwitchContextValue;
}): JSX.Element {
  const { ctx } = props;
  const switchAria = ctx.switchAria;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return switchAria.isDisabled || switchAria.isReadOnly;
    },
    onHoverStart: props.buttonProps.onHoverStart,
    onHoverEnd: props.buttonProps.onHoverEnd,
    onHoverChange: props.buttonProps.onHoverChange,
  });

  const renderValues = createMemo<SwitchButtonRenderProps>(() => ({
    isSelected: switchAria.isSelected(),
    isHovered: isHovered(),
    isPressed: switchAria.isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: switchAria.isDisabled,
    isReadOnly: switchAria.isReadOnly,
    isInvalid: switchAria.isInvalid,
    isRequired: ctx.isRequired,
    state: ctx.state,
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

  const childRenderValues: SwitchButtonRenderProps = {
    get isSelected() {
      return switchAria.isSelected();
    },
    get isHovered() {
      return isHovered();
    },
    get isPressed() {
      return switchAria.isPressed();
    },
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
    get isDisabled() {
      return switchAria.isDisabled;
    },
    get isReadOnly() {
      return switchAria.isReadOnly;
    },
    get isInvalid() {
      return switchAria.isInvalid;
    },
    get isRequired() {
      return ctx.isRequired;
    },
    get state() {
      return ctx.state;
    },
  };

  const cleanLabelProps = () => {
    const { ref: _ref1, ...rest } = switchAria.labelProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanInputProps = () => {
    const { ref: _ref3, ...rest } = switchAria.inputProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref4, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  // Resolve the render-prop children ONCE (untracked) — see ToggleSwitch above.
  // The button's own children are leaf visuals (they don't consume context), so
  // untrack is safe and keeps fine-grained reactivity via the getters + <Show>s.
  const switchChildren = untrack(() => {
    const children = props.buttonProps.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  });

  return (
    <label
      {...cleanLabelProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={props.buttonProps.slot}
      data-selected={switchAria.isSelected() || undefined}
      data-pressed={switchAria.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-disabled={switchAria.isDisabled || undefined}
      data-readonly={switchAria.isReadOnly || undefined}
      data-invalid={switchAria.isInvalid || undefined}
      data-required={ctx.isRequired || undefined}
    >
      <VisuallyHidden>
        <input
          ref={ctx.setInputElement}
          {...cleanInputProps()}
          {...cleanFocusProps()}
          aria-describedby={ctx.describedBy()}
        />
      </VisuallyHidden>
      {switchChildren}
    </label>
  );
}

/**
 * A switch allows a user to turn a setting on or off, with support for validation and help text.
 * Wraps a `SwitchButton` and provides description/error wiring.
 *
 * @example
 * ```tsx
 * <SwitchField description="Sync across devices">
 *   <SwitchButton>Enable sync</SwitchButton>
 * </SwitchField>
 * ```
 */
export function SwitchField(props: SwitchFieldProps): JSX.Element {
  const contextProps = useContext(SwitchFieldContext);
  const contextSlotProps = contextProps?.slots?.[props.slot ?? "default"];
  const contextBaseProps = createMemo<SwitchFieldProps>(() => {
    if (!contextProps) return {};
    const { slots: _slots, ...rest } = contextProps;
    return rest;
  });
  const merged = contextProps
    ? (mergeProps(contextBaseProps(), contextSlotProps ?? {}, props) as SwitchFieldProps)
    : props;

  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);
  // `children` is split out of ariaProps so the hook accessor's `...ariaProps`
  // spread does not eagerly read it — reading a Solid `children` getter
  // instantiates the nested SwitchButton, and doing so OUTSIDE the
  // InternalSwitchContext provider both breaks its context binding and recurses.
  const [local, ariaProps] = splitProps(merged, [
    "class",
    "style",
    "slot",
    "description",
    "errorMessage",
    "children",
  ]);
  const descriptionId = createUniqueId();
  const errorMessageId = createUniqueId();

  const state = createToggleState(() => ({
    isSelected: ariaProps.isSelected,
    defaultSelected: ariaProps.defaultSelected,
    onChange: ariaProps.onChange,
    isReadOnly: ariaProps.isReadOnly,
  }));

  const switchAria = createSwitch(
    () => ({
      ...ariaProps,
      // The hook reads `children` only to decide if an aria-label is needed; the
      // visible label lives in the SwitchButton, so report presence as a literal.
      children: true,
    }),
    state,
    inputElement,
  );

  const describedBy = () => {
    const ids = [
      ariaProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      switchAria.isInvalid && local.errorMessage ? errorMessageId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  const internalContext: InternalSwitchContextValue = {
    switchAria,
    state,
    setInputElement,
    describedBy,
    defaultClassName: "solidaria-SwitchButton",
    get isRequired() {
      return ariaProps.isRequired || false;
    },
  };

  const renderValues = createMemo<SwitchFieldRenderProps>(() => ({
    isSelected: switchAria.isSelected(),
    isDisabled: switchAria.isDisabled,
    isReadOnly: switchAria.isReadOnly,
    isInvalid: switchAria.isInvalid,
    isRequired: ariaProps.isRequired || false,
    state,
  }));

  const renderProps = useRenderProps(
    {
      children: merged.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-SwitchField",
    },
    renderValues,
  );

  const fieldErrorContext: FieldErrorContextValue = {
    get validation(): ValidationResult {
      return {
        isInvalid: switchAria.isInvalid,
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
  // nested SwitchButton's useContext binds to InternalSwitchContext. Mirrors
  // RadioGroup's GroupChildren — do NOT pre-resolve outside the provider.
  const FieldChildren = () => {
    const childRenderValues: SwitchFieldRenderProps = {
      get isSelected() {
        return switchAria.isSelected();
      },
      get isDisabled() {
        return switchAria.isDisabled;
      },
      get isReadOnly() {
        return switchAria.isReadOnly;
      },
      get isInvalid() {
        return switchAria.isInvalid;
      },
      get isRequired() {
        return ariaProps.isRequired || false;
      },
      get state() {
        return state;
      },
    };
    const renderedChildren = createMemo(() => {
      const children = merged.children;
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
        <Show when={switchAria.isInvalid && local.errorMessage}>
          <span id={errorMessageId} slot="errorMessage">
            {local.errorMessage}
          </span>
        </Show>
      </>
    );
  };

  return (
    <InternalSwitchContext.Provider value={internalContext}>
      <FieldErrorContext.Provider value={fieldErrorContext}>
        <div
          {...domProps()}
          class={renderProps.class()}
          style={renderProps.style()}
          slot={local.slot}
          data-selected={switchAria.isSelected() || undefined}
          data-disabled={switchAria.isDisabled || undefined}
          data-readonly={switchAria.isReadOnly || undefined}
          data-invalid={switchAria.isInvalid || undefined}
          data-required={(ariaProps.isRequired || false) || undefined}
        >
          <FieldChildren />
        </div>
      </FieldErrorContext.Provider>
    </InternalSwitchContext.Provider>
  );
}
