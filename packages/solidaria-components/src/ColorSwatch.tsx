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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ColorSwatch.tsx

import { createContext, createMemo, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createColorSwatch } from "@proyecto-viviana/solidaria";
import { type Color } from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  attrString,
} from "./utils";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import { ColorPickerContext } from "./ColorPicker";

export interface ColorSwatchRenderProps {
  /** The color being displayed. */
  color: Color;
  /** The color as a CSS string. */
  colorValue: string;
}

export interface ColorSwatchProps extends SlotProps {
  /** The color to display. */
  color?: Color | string;
  /** Localized color name override. */
  colorName?: string;
  /** Accessible label for the swatch. */
  "aria-label"?: string;
  /** ID of element that labels the swatch. */
  "aria-labelledby"?: string;
  /** ID of element that describes the swatch. */
  "aria-describedby"?: string;
  /** ID of element that provides detailed information about the swatch. */
  "aria-details"?: string;
  /** The children of the component. */
  children?: RenderChildren<ColorSwatchRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSwatchRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSwatchRenderProps>;
}

export const ColorSwatchContext = createContext<{ color?: Color | string } | null>(null);

/**
 * A color swatch displays a preview of a color.
 */
export function ColorSwatch(props: ColorSwatchProps): JSX.Element {
  const swatchContext = useContext(ColorSwatchContext);
  const pickerContext = useContext(ColorPickerContext);
  const [local, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "color", "colorName"],
    ["aria-label", "aria-labelledby", "aria-describedby", "aria-details"],
  );

  const resolvedColor = createMemo<Color | string>(() => {
    return local.color ?? swatchContext?.color ?? pickerContext?.value ?? "#fff0";
  });

  const swatchAria = createColorSwatch(() => ({
    id: (rest as Record<string, unknown>).id as string | undefined,
    slot: attrString(local.slot),
    color: resolvedColor(),
    colorName: local.colorName,
    "aria-label": ariaProps["aria-label"],
    "aria-labelledby": ariaProps["aria-labelledby"],
    "aria-describedby": ariaProps["aria-describedby"],
    "aria-details": ariaProps["aria-details"],
  }));

  const renderValues = createMemo<ColorSwatchRenderProps>(() => ({
    color: swatchAria.color,
    colorValue: swatchAria.color.toString("css"),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSwatch",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const cleanSwatchProps = () => {
    const {
      ref: _ref,
      style: _swatchStyle,
      ...rest
    } = swatchAria.swatchProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = () => {
    const swatchStyle = (swatchAria.swatchProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...swatchStyle, ...renderStyle };
  };

  return (
    <div {...domProps()} {...cleanSwatchProps()} class={renderProps.class()} style={mergedStyle()}>
      {renderProps.renderChildren()}
    </div>
  );
}
