import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import type { TextProps as HeadlessTextProps } from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../s2-style";
import { createIsSkeleton, useInertAttribute, useSkeletonText } from "../skeleton";
import { mergeContextRefs, type RefLike } from "../button/spectrum-context";
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

export interface HeaderProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children" | "class" | "style" | "ref"
> {
  children?: JSX.Element;
  class?: string;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  isHidden?: boolean;
  ref?: RefLike<HTMLElement>;
}

export const HeaderContext = createContext<SpectrumContextValue<HeaderProps>>(null);

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
  const isSkeleton = createIsSkeleton();
  const inertRef = useInertAttribute(isSkeleton);
  const skeletonRef = (element: HTMLSpanElement) => inertRef(element);

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
  const [children, skeletonStyle] = useSkeletonText(
    () => local.children,
    () => unsafeStyle() ?? (typeof spanProps.style === "object" ? spanProps.style : undefined),
  );

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <span
      {...spanProps}
      ref={mergeContextRefs((spanProps as { ref?: RefLike<HTMLSpanElement> }).ref, skeletonRef)}
      class={className()}
      style={skeletonStyle() ?? spanProps.style}
      data-rsp-slot={local["data-rsp-slot"] ?? "text"}
    >
      {children()}
    </span>
  );
}

export function Header(props: HeaderProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(HeaderContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, headerProps] = splitProps(merged, [
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "children",
    "ref",
  ]);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  const className = () =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      mergeContextStyles(contextProps?.styles, props.styles),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <header
      {...headerProps}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
    >
      {local.children}
    </header>
  );
}

export { Heading } from "./Heading";
export type { HeadingProps, HeadingLevel } from "./Heading";
export { KeyboardContext, StyledKeyboard } from "./Keyboard";
export { StyledKeyboard as Keyboard } from "./Keyboard";
export type { KeyboardProps as StyledKeyboardProps } from "./Keyboard";
