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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/RangeSlider.tsx

// Port of packages/@react-spectrum/s2/src/RangeSlider.tsx.

import { createContext, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import { mergeProps } from "@proyecto-viviana/solidaria";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import type { StyleString } from "../style";
import {
  getSlottedContextProps,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { SliderBase } from "./shared";

export type RangeSliderSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
export type RangeSliderVariant = "default" | "accent";
export type RangeSliderTrackStyle = "thin" | "thick";
export type RangeSliderThumbStyle = "default" | "precise";
export type RangeSliderLabelPosition = "top" | "side";
export type RangeSliderLabelAlign = "start" | "end";

export interface RangeValue {
  start: number;
  end: number;
}

export interface RangeSliderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "style" | "onChange" | "onChangeEnd" | "ref"
> {
  value?: RangeValue;
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  onChangeEnd?: (value: RangeValue) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  size?: RangeSliderSize;
  /** Legacy alias. Prefer S2 `isEmphasized`. */
  variant?: RangeSliderVariant;
  isEmphasized?: boolean;
  trackStyle?: RangeSliderTrackStyle;
  thumbStyle?: RangeSliderThumbStyle;
  class?: string;
  label?: JSX.Element;
  contextualHelp?: JSX.Element;
  showOutput?: boolean;
  labelPosition?: RangeSliderLabelPosition;
  labelAlign?: RangeSliderLabelAlign;
  startName?: string;
  endName?: string;
  form?: string;
  isDisabled?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
}

export const RangeSliderContext = createContext<SpectrumContextValue<RangeSliderProps>>(null);

// Adapter only: indexed state, interaction, normalization, and reset belong to the lower spine.
function toSliderProps(props: Partial<RangeSliderProps>) {
  const [pair, rest] = splitProps(props, ["value", "defaultValue", "onChange", "onChangeEnd"]);
  return mergeProps(rest, {
    get value() {
      return pair.value ? [pair.value.start, pair.value.end] : undefined;
    },
    get defaultValue() {
      return pair.defaultValue ? [pair.defaultValue.start, pair.defaultValue.end] : undefined;
    },
    onChange(value: number[]) {
      pair.onChange?.({ start: value[0], end: value[1] });
    },
    onChangeEnd(value: number[]) {
      pair.onChangeEnd?.({ start: value[0], end: value[1] });
    },
  });
}

/** A range slider allows users to select a numeric subset from a range. */
export function RangeSlider(props: RangeSliderProps): JSX.Element {
  const context = getSlottedContextProps(useContext(RangeSliderContext), props.slot);
  const contextProps = context ? toSliderProps(context) : null;
  const sliderProps = toSliderProps(props);
  const resolved = mergeProps(contextProps ?? {}, sliderProps);
  return (
    <SliderBase
      {...sliderProps}
      contextProps={contextProps}
      isRange
      orientation="horizontal"
      defaultValue={
        resolved.defaultValue ??
        (resolved.value === undefined
          ? [resolved.minValue ?? 0, resolved.maxValue ?? 100]
          : undefined)
      }
    />
  );
}
