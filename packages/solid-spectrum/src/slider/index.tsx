// @ts-nocheck

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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Slider.tsx

// Port of packages/@react-spectrum/s2/src/Slider.tsx.

import { createContext, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { SliderProps as HeadlessSliderProps } from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import {
  getSlottedContextProps,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { SliderBase } from "./shared";

export type SliderSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
export type SliderVariant = "default" | "accent";
export type SliderTrackStyle = "thin" | "thick";
export type SliderThumbStyle = "default" | "precise";
export type SliderLabelPosition = "top" | "side";
export type SliderLabelAlign = "start" | "end";

export interface SliderProps extends Omit<
  HeadlessSliderProps,
  "class" | "style" | "children" | "label" | "slot" | "ref"
> {
  size?: SliderSize;
  /** Legacy alias. Prefer S2 `isEmphasized`. */
  variant?: SliderVariant;
  isEmphasized?: boolean;
  trackStyle?: SliderTrackStyle;
  thumbStyle?: SliderThumbStyle;
  fillOffset?: number;
  class?: string;
  label?: JSX.Element;
  contextualHelp?: JSX.Element;
  showOutput?: boolean;
  showMinMax?: boolean;
  labelPosition?: SliderLabelPosition;
  labelAlign?: SliderLabelAlign;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

export const SliderContext = createContext<SpectrumContextValue<SliderProps>>(null);

/** A slider allows users to select a value from a range. */
export function Slider(props: SliderProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(SliderContext), props.slot);
  return <SliderBase {...props} contextProps={contextProps} />;
}

export type { SliderState, SliderOrientation } from "@proyecto-viviana/solid-stately";

export { RangeSlider, RangeSliderContext } from "./RangeSlider";
export type {
  RangeSliderLabelAlign,
  RangeSliderLabelPosition,
  RangeSliderProps,
  RangeSliderSize,
  RangeSliderThumbStyle,
  RangeSliderTrackStyle,
  RangeSliderVariant,
} from "./RangeSlider";
