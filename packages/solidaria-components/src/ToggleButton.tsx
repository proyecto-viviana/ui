/**
 * ToggleButton component for solidaria-components
 *
 * A pre-wired headless toggle button that combines pressed + selected state.
 * Port direction: react-aria-components/src/ToggleButton.tsx
 */

import { type JSX, createContext, createMemo, splitProps, useContext } from "solid-js";
import {
  createToggleButton,
  createToggleButtonGroupItem,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaToggleButtonProps,
} from "@proyecto-viviana/solidaria";
import type { Key } from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { useToggleButtonGroupStateContext } from "./ToggleButtonGroup";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface ToggleButtonRenderProps {
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isSelected: boolean;
}

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, "children">, SlotProps {
  /** Key used when inside ToggleButtonGroup selection state. */
  toggleKey?: Key;
  /** Preferred group key prop, parity with RAC item id usage. */
  id?: Key;
  children?: RenderChildren<ToggleButtonRenderProps>;
  class?: ClassNameOrFunction<ToggleButtonRenderProps>;
  style?: StyleOrFunction<ToggleButtonRenderProps>;
  /** Ref for the underlying button element. */
  ref?: RefLike<HTMLButtonElement>;
}

export const ToggleButtonContext = createContext<ToggleButtonProps | null>(null);

function resolveDisabledValue(isDisabled: AriaToggleButtonProps["isDisabled"]): boolean {
  if (typeof isDisabled === "function") {
    return isDisabled();
  }
  return !!isDisabled;
}

export function ToggleButton(props: ToggleButtonProps): JSX.Element {
  const contextProps = useContext(ToggleButtonContext);
  const mergedProps = (contextProps ? mergeProps(contextProps, props) : props) as ToggleButtonProps;

  const [local, ariaProps] = splitProps(mergedProps, [
    "children",
    "class",
    "style",
    "ref",
    "slot",
    "toggleKey",
    "id",
  ]);
  const groupState = useToggleButtonGroupStateContext();
  const groupKey = local.id ?? local.toggleKey;
  const standaloneAriaProps = mergeProps<AriaToggleButtonProps>(ariaProps, {
    get id() {
      return local.id;
    },
  });

  const toggleAria =
    groupState && groupKey != null
      ? createToggleButtonGroupItem(
          {
            ...ariaProps,
            id: groupKey,
          },
          groupState,
        )
      : createToggleButton(standaloneAriaProps);

  const isDisabled = () => resolveDisabledValue(ariaProps.isDisabled) || !!groupState?.isDisabled;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });

  const renderValues = createMemo<ToggleButtonRenderProps>(() => ({
    isHovered: isHovered(),
    isPressed: toggleAria.isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: isDisabled(),
    isSelected: toggleAria.isSelected(),
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ToggleButton",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    delete (filtered as Record<string, unknown>).onClick;
    delete (filtered as Record<string, unknown>).id;
    return filtered;
  });

  const cleanButtonProps = () => {
    const { ref: _ref1, ...rest } = toggleAria.buttonProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref2, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref3, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <button
      {...domProps()}
      {...cleanButtonProps()}
      {...cleanFocusProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      ref={(el) => assignRef(local.ref, el)}
      slot={local.slot}
      data-pressed={toggleAria.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-disabled={isDisabled() || undefined}
      data-selected={toggleAria.isSelected() || undefined}
    >
      {renderProps.renderChildren()}
    </button>
  );
}
