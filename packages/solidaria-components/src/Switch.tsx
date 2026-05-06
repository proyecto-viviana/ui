/**
 * ToggleSwitch component for solidaria-components
 *
 * A pre-wired headless switch that combines state + aria hooks.
 * Port of react-aria-components/src/Switch.tsx
 *
 * Named "ToggleSwitch" to avoid conflict with SolidJS's built-in Switch component.
 */

import { type JSX, createContext, createMemo, createUniqueId, splitProps, Show } from "solid-js";
import {
  createSwitch,
  createFocusRing,
  createHover,
  type AriaSwitchProps,
} from "@proyecto-viviana/solidaria";
import { createToggleState, type ToggleState } from "@proyecto-viviana/solid-stately";
import { VisuallyHidden } from "./VisuallyHidden";
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
  let inputRef: HTMLInputElement | null = null;

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

  const switchAria = createSwitch(
    () => ({
      ...ariaProps,
      children: typeof props.children === "function" ? true : props.children,
    }),
    state,
    () => inputRef,
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
  const switchChildren = () => {
    const children = props.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  };

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
          ref={(el) => (inputRef = el)}
          {...cleanInputProps()}
          {...cleanFocusProps()}
          aria-describedby={describedBy()}
        />
      </VisuallyHidden>
      {switchChildren()}
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
