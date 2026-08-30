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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ColorSwatch.tsx

// Port of packages/@react-spectrum/s2/src/ColorSwatch.tsx.
import { createContext, type Accessor, type JSX } from "solid-js";
import type { Color } from "@proyecto-viviana/solid-stately";

export type InternalColorSwatchSize = "XS" | "S" | "M" | "L";
export type InternalColorSwatchRounding = "default" | "none" | "full";

export interface InternalColorSwatchContextValue {
  size?: InternalColorSwatchSize;
  rounding?: InternalColorSwatchRounding;
  useWrapper: (
    swatch: JSX.Element,
    color: Accessor<Color>,
    rounding: Accessor<InternalColorSwatchRounding>,
  ) => JSX.Element;
}

export const InternalColorSwatchContext = createContext<InternalColorSwatchContextValue | null>(
  null,
);
