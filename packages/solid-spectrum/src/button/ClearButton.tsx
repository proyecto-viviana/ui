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
import type { JSX } from "@solidjs/web";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
  type ButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { assignRef, splitProps } from "@proyecto-viviana/solidaria/utils";
import { useProviderProps } from "../provider";
import CrossIcon from "../icon/ui-icons/Cross";
import { style, focusRing } from "../style" with { type: "macro" };
import { controlSize } from "../s2-internal/style-utils" with { type: "macro" };
import { pressScale } from "../pressScale";

export type ClearButtonSize = "S" | "M" | "L" | "XL";

export interface ClearButtonProps extends Omit<
  HeadlessButtonProps,
  "class" | "style" | "children"
> {
  /**
   * The size of the ClearButton.
   *
   * @default 'M'
   */
  size?: ClearButtonSize;
  /** Whether the ClearButton should be displayed with a static color. */
  isStaticColor?: boolean;
  /** Additional CSS class name. */
  class?: string;
}

interface ClearButtonStyleProps extends ButtonRenderProps {
  size?: ClearButtonSize;
  isStaticColor?: boolean;
}

const focusRingStyles = focusRing();

const visibleClearButton = style<ClearButtonStyleProps>({
  ...focusRingStyles,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "full",
  width: controlSize(),
  flexShrink: 0,
  borderRadius: "full",
  borderStyle: "none",
  backgroundColor: "transparent",
  boxSizing: "border-box",
  padding: 0,
  outlineOffset: -4,
  outlineColor: {
    default: focusRingStyles.outlineColor,
    isStaticColor: "white",
  },
  color: "inherit",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

/**
 * Icon-only clear button. The caller supplies the accessible name.
 */
export function ClearButton(props: ClearButtonProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["size", "isStaticColor", "class", "ref"]);
  const size = () => local.size ?? "M";
  const isStaticColor = () => local.isStaticColor ?? false;

  let buttonEl: HTMLButtonElement | undefined;
  const buttonStyle = (renderProps: ButtonRenderProps): JSX.CSSProperties =>
    pressScale(() => buttonEl)(renderProps);

  const getClassName = (renderProps: ButtonRenderProps): string =>
    [
      visibleClearButton({
        ...renderProps,
        size: size(),
        isStaticColor: isStaticColor(),
      }),
      local.class,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessButton
      {...headlessProps}
      ref={(el: HTMLButtonElement) => {
        buttonEl = el;
        assignRef(local.ref, el);
      }}
      class={getClassName}
      style={buttonStyle}
    >
      <CrossIcon size={local.size} />
    </HeadlessButton>
  );
}
