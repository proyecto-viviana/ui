/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/button/FieldButton.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/button/FieldButton.tsx.
import { type JSX, splitProps } from "solid-js";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
  type ButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { useProviderProps } from "../provider";
import { style, focusRing } from "../style" with { type: "macro" };

export interface FieldButtonProps extends Omit<HeadlessButtonProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

// A trailing button that sits inside an input field, sharing the field's
// right-hand corners and a gray-300 divider on its inner edge. The neutral fill
// ramps on hover/press via the render-prop conditions fed to the style() macro,
// so the CSS ships in the package bundle for installed consumers.
const fieldButtonStyles = style<{
  isHovered?: boolean;
  isPressed?: boolean;
  isDisabled?: boolean;
  isFocusVisible?: boolean;
}>({
  ...focusRing(),
  outlineOffset: -2,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  paddingX: 8,
  borderStyle: "solid",
  borderWidth: 0,
  borderStartWidth: 1,
  borderColor: "gray-300",
  borderTopEndRadius: "sm",
  borderBottomEndRadius: "sm",
  cursor: "default",
  transition: "default",
  backgroundColor: {
    default: "gray-100",
    isHovered: "gray-200",
    isPressed: "gray-200",
    isDisabled: "gray-100",
  },
  color: {
    default: "neutral-subdued",
    isHovered: "neutral",
    isPressed: "neutral",
    isDisabled: "disabled",
  },
});

/**
 * A button designed to sit inside an input field.
 */
export function FieldButton(props: FieldButtonProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["class"]);

  const getClassName = (renderProps: ButtonRenderProps): string =>
    [
      fieldButtonStyles({
        isHovered: renderProps.isHovered,
        isPressed: renderProps.isPressed,
        isDisabled: renderProps.isDisabled,
        isFocusVisible: renderProps.isFocusVisible,
      }),
      local.class,
    ]
      .filter(Boolean)
      .join(" ");

  return <HeadlessButton {...headlessProps} class={getClassName} />;
}
