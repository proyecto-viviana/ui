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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ActionButtonGroup.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ButtonGroup.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ToggleButtonGroup.tsx

// Port of packages/@react-spectrum/s2/src/ActionButtonGroup.tsx.
// Port of packages/@react-spectrum/s2/src/ButtonGroup.tsx.
// Port of packages/@react-spectrum/s2/src/ToggleButtonGroup.tsx.
import { createContext, useContext, type JSX } from "solid-js";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import type { ButtonSize, StaticColor } from "./types";
import type { RefLike, SpectrumContextValue } from "./spectrum-context";

export type ActionButtonSize = "XS" | "S" | "M" | "L" | "XL";
export type ActionButtonDensity = "regular" | "compact";
export type ActionButtonOrientation = "horizontal" | "vertical";
export type ButtonGroupAlign = "start" | "end" | "center";

export interface ButtonGroupContextValue {
  children?: JSX.Element;
  orientation?: ActionButtonOrientation;
  align?: ButtonGroupAlign;
  size?: ButtonSize;
  isDisabled?: boolean;
  isHidden?: boolean;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
  slot?: string;
}

export interface ActionButtonGroupContextValue {
  children?: JSX.Element;
  size?: ActionButtonSize;
  density?: ActionButtonDensity;
  orientation?: ActionButtonOrientation;
  isQuiet?: boolean;
  isJustified?: boolean;
  isEmphasized?: boolean;
  staticColor?: StaticColor;
  isDisabled?: boolean;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
  slot?: string;
}

export interface ToggleButtonGroupContextValue extends ActionButtonGroupContextValue {
  selectionMode?: "single" | "multiple";
  disallowEmptySelection?: boolean;
  selectedKeys?: Iterable<Key>;
  defaultSelectedKeys?: Iterable<Key>;
  disabledKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
}

export const ButtonGroupContext =
  createContext<SpectrumContextValue<ButtonGroupContextValue>>(null);
export const ActionButtonGroupContext =
  createContext<SpectrumContextValue<ActionButtonGroupContextValue>>(null);
export const ToggleButtonGroupContext =
  createContext<SpectrumContextValue<ToggleButtonGroupContextValue>>(null);

export function useButtonGroupContext(): SpectrumContextValue<ButtonGroupContextValue> {
  return useContext(ButtonGroupContext);
}

export function useActionButtonGroupContext(): SpectrumContextValue<ActionButtonGroupContextValue> {
  return useContext(ActionButtonGroupContext);
}

export function useToggleButtonGroupContext(): SpectrumContextValue<ToggleButtonGroupContextValue> {
  return useContext(ToggleButtonGroupContext);
}
