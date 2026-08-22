/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Button.tsx

// Port of packages/@react-spectrum/s2/src/Button.tsx.

import type { JSX } from "solid-js";
import type { ButtonProps as HeadlessButtonProps } from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  /**
   * The destructive/negative action — saturated red fill, white ink. Its two semantic
   * counterparts below (`warning`, `success`) complete the status trio: the same
   * saturated-fill-with-white-ink treatment on the warm (amber) and success (green)
   * channels, so a consumer can express the full negative/warning/success spectrum on a
   * button the same way Badge/StatusLight/Meter/InlineAlert do.
   */
  | "negative"
  /** Warm caution — the amber/`notice` channel (deep burnt-orange fill, white ink). Kept
   * visually apart from `create`: warning is a saturated fill with white ink, `create` is a
   * pale-yellow wash with dark ink, so they never read as the same warm affordance. */
  | "warning"
  /** Success — the green/`positive` channel (green fill, white ink). */
  | "success"
  /**
   * Viviana's create CTA — the pale-yellow, dark-ink button the handoff uses for the one
   * action that makes something new. Not a Spectrum variant: Spectrum's fills are all
   * saturated-with-white-ink, and this deliberately inverts that so "create" reads as
   * warmer and lighter than "accent" rather than louder than it.
   */
  | "create";
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
