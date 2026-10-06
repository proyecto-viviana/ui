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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ColorPicker.tsx

import { createContext, createMemo, createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { normalizeColor, type Color } from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
} from "./utils";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

export interface ColorPickerChannelContextValue {
  value?: Color | string;
  onChange?: (color: Color) => void;
}

export interface ColorPickerStateContextValue {
  color: () => Color;
  setColor: (color: Color) => void;
}

export const ColorPickerContext = createContext<ColorPickerChannelContextValue | null>(null);
export const ColorPickerStateContext = createContext<ColorPickerStateContextValue | null>(null);

export interface ColorPickerRenderProps {
  /** The currently selected color. */
  color: Color;
}

export interface ColorPickerProps extends SlotProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** The children of the color picker. */
  children?: RenderChildren<ColorPickerRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorPickerRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorPickerRenderProps>;
}

export function ColorPicker(props: ColorPickerProps): JSX.Element {
  const [local] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "children",
    "class",
    "style",
    "slot",
  ]);

  const [internalColor, setInternalColor] = createSignal<Color>(
    normalizeColor(local.defaultValue ?? "#000000"),
  );

  const color = createMemo<Color>(() => {
    if (local.value !== undefined) {
      return normalizeColor(local.value);
    }
    return internalColor();
  });

  const setColor = (nextColor: Color) => {
    if (local.value === undefined) {
      setInternalColor(nextColor);
    }
    local.onChange?.(nextColor);
  };

  const renderValues = createMemo<ColorPickerRenderProps>(() => ({
    color: color(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorPicker",
    },
    renderValues,
  );

  return (
    <ColorPickerStateContext
      value={{
        color: () => color(),
        setColor,
      }}
    >
      <ColorPickerContext
        value={{
          get value() {
            return color();
          },
          onChange: setColor,
        }}
      >
        <div class={renderProps.class()} style={renderProps.style()}>
          {renderProps.renderChildren()}
        </div>
      </ColorPickerContext>
    </ColorPickerStateContext>
  );
}
