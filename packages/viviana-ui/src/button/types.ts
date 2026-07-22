import type { JSX } from "solid-js";
import type { ButtonProps as HeadlessButtonProps } from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "negative"
  /**
   * Viviana's create CTA — the pale-yellow, dark-ink button the handoff uses for the one
   * action that makes something new. Not a Spectrum variant: Spectrum's fills are all
   * saturated-with-white-ink, and this deliberately inverts that so "create" reads as
   * warmer and lighter than "accent" rather than louder than it.
   */
  | "create"
  | "premium"
  | "genai";
export type ButtonFillStyle = "fill" | "outline";
export type ButtonSize = "S" | "M" | "L" | "XL";
export type StaticColor = "white" | "black" | "auto";

type StyledButtonBaseProps = Omit<
  HeadlessButtonProps,
  | "class"
  | "children"
  | "style"
  | "render"
  | "isPendingFocusable"
  | "onClick"
  | "onHoverStart"
  | "onHoverEnd"
  | "onHoverChange"
  | "elementType"
  | "href"
  | "target"
  | "rel"
  | "allowFocusWhenDisabled"
>;

export interface ButtonProps extends StyledButtonBaseProps {
  /** The content to display in the Button. */
  children?: JSX.Element;
  /** The visual style of the Button. */
  variant?: ButtonVariant;
  /** The background style of the Button. */
  fillStyle?: ButtonFillStyle;
  /** The size of the Button. */
  size?: ButtonSize;
  /** Whether the Button is pending. Pending Buttons suppress press handlers and show progress. */
  isPending?: boolean;
  /** The static color style to apply. Useful when the Button appears over a color background. */
  staticColor?: StaticColor;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}
