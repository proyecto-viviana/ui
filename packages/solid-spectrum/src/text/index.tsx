import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import type { TextProps as HeadlessTextProps } from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../s2-style";
import {
  getSlottedContextProps,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type TextVariant = "default" | "muted" | "success" | "danger";
export type TextSize = "sm" | "md" | "lg";

export interface TextProps extends Omit<HeadlessTextProps, "class"> {
  variant?: TextVariant;
  size?: TextSize;
  class?: string;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  isHidden?: boolean;
  "data-rsp-slot"?: string;
}

export const TextContext = createContext<SpectrumContextValue<TextProps>>(null);

const variantStyles: Record<TextVariant, string> = {
  default: "text-primary-100",
  muted: "text-primary-400",
  success: "text-green-500",
  danger: "text-danger-400",
};

const sizeStyles: Record<TextSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Text(props: TextProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(TextContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, spanProps] = splitProps(merged, [
    "variant",
    "size",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "children",
    "data-rsp-slot",
  ]);
  const variant = () => local.variant ?? "default";
  const size = () => local.size ?? "md";

  const className = () =>
    [
      contextProps ? "" : `${variantStyles[variant()]} ${sizeStyles[size()]}`,
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      mergeContextStyles(contextProps?.styles, props.styles),
    ]
      .filter(Boolean)
      .join(" ");

  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <span
      {...spanProps}
      class={className()}
      style={unsafeStyle() ?? spanProps.style}
      data-rsp-slot={local["data-rsp-slot"] ?? "text"}
    >
      {local.children}
    </span>
  );
}

export { Heading } from "./Heading";
export type { HeadingProps, HeadingLevel } from "./Heading";
export { StyledKeyboard } from "./Keyboard";
export { StyledKeyboard as Keyboard } from "./Keyboard";
export type { KeyboardProps as StyledKeyboardProps } from "./Keyboard";
