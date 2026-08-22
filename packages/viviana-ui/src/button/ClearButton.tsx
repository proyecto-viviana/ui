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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ClearButton.tsx

// Port of packages/@react-spectrum/s2/src/ClearButton.tsx.

import { type JSX, splitProps } from "solid-js";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
  type ButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { useProviderProps } from "../provider";
import { IconContext } from "../icon/spectrum-icon";
import { centerBaseline } from "../icon/center-baseline";
import CrossIcon from "../icon/ui-icons/Cross";
import { style, focusRing } from "../style" with { type: "macro" };

export type ClearButtonSize = "sm" | "md" | "lg";

export interface ClearButtonProps extends Omit<
  HeadlessButtonProps,
  "class" | "style" | "children"
> {
  /** The size of the button. @default 'md' */
  size?: ClearButtonSize;
  /** Additional CSS class name. */
  class?: string;
}

const iconSizes: Record<ClearButtonSize, JSX.CSSProperties> = {
  sm: { width: "0.75rem", height: "0.75rem" },
  md: { width: "1rem", height: "1rem" },
  lg: { width: "1.25rem", height: "1.25rem" },
};

// Icon-only dismiss button. The state ramp is driven by the button's render
// props (isHovered/isPressed/isDisabled/isFocusVisible) fed to the style()
// macro: a subdued neutral glyph that strengthens on hover/press over a faint
// gray fill, plus the S2 focus ring. Emitted through the macro so the CSS ships
// in the package bundle for installed consumers.
const clearButtonStyles = style<{
  size: ClearButtonSize;
  isHovered?: boolean;
  isPressed?: boolean;
  isDisabled?: boolean;
  isFocusVisible?: boolean;
}>({
  ...focusRing(),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderStyle: "none",
  borderRadius: "full",
  cursor: "default",
  transition: "default",
  width: { size: { sm: 20, md: 24, lg: 32 } },
  height: { size: { sm: 20, md: 24, lg: 32 } },
  backgroundColor: {
    default: "transparent",
    isHovered: "gray-100",
    isPressed: "gray-200",
    isDisabled: "transparent",
  },
  color: {
    default: "neutral-subdued",
    isHovered: "neutral",
    isPressed: "neutral",
    isDisabled: "disabled",
  },
});

/**
 * An icon-only clear/dismiss button, typically used in search fields and tags.
 */
export function ClearButton(props: ClearButtonProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["size", "class"]);
  const size = () => local.size ?? "md";

  const getClassName = (renderProps: ButtonRenderProps): string =>
    [
      clearButtonStyles({
        size: size(),
        isHovered: renderProps.isHovered,
        isPressed: renderProps.isPressed,
        isDisabled: renderProps.isDisabled,
        isFocusVisible: renderProps.isFocusVisible,
      }),
      local.class,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessButton
      {...headlessProps}
      aria-label={headlessProps["aria-label"] ?? "Clear"}
      class={getClassName}
    >
      <IconContext.Provider value={{ slot: "icon", render: centerBaseline({ slot: "icon" }) }}>
        <CrossIcon style={iconSizes[size()]} />
      </IconContext.Provider>
    </HeadlessButton>
  );
}
