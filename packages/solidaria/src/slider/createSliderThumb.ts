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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/slider/useSlider.ts

/**
 * Provides the behavior and accessibility implementation for a slider component.
 * A slider allows users to select a value from a range.
 * Based on @react-aria/slider useSlider.
 */

import type { SliderState } from "@proyecto-viviana/solid-stately";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { getSliderOwner, type AriaSliderProps, type SliderAria } from "./createSlider";

export function createSliderThumb(
  props: MaybeAccessor<
    Pick<
      AriaSliderProps,
      | "id"
      | "isDisabled"
      | "aria-label"
      | "aria-labelledby"
      | "aria-describedby"
      | "aria-details"
      | "name"
      | "form"
    > & { index?: number }
  >,
  state: SliderState,
  trackRef?: () => HTMLElement | null,
  inputRef?: () => HTMLInputElement | null,
): Pick<SliderAria, "thumbProps" | "inputProps" | "labelProps"> {
  // The root alone owns track geometry/listeners; this parameter preserves the approved call shape.
  void trackRef;
  return getSliderOwner(state).bind(() => access(props), inputRef ?? (() => null));
}
