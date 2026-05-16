import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import {
  Keyboard as HeadlessKeyboard,
  type KeyboardProps as HeadlessKeyboardProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../s2-style";
import {
  getSlottedContextProps,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export interface KeyboardProps extends Omit<HeadlessKeyboardProps, "class"> {
  /** Additional CSS class name. */
  class?: string;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string;
}

export const KeyboardContext = createContext<SpectrumContextValue<KeyboardProps>>(null);

/**
 * Displays a keyboard shortcut or key combination in a styled <kbd> tag.
 */
export function StyledKeyboard(props: KeyboardProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(KeyboardContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
  ]);

  const className = () =>
    [
      contextProps
        ? ""
        : "inline-block px-1.5 py-0.5 text-xs font-mono rounded border border-primary-600 bg-bg-300 text-primary-200",
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      mergeContextStyles(contextProps?.styles, props.styles),
    ]
      .filter(Boolean)
      .join(" ");

  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return <HeadlessKeyboard {...rest} class={className()} style={unsafeStyle() ?? rest.style} />;
}
