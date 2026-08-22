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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ActionButton.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Button.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ToggleButton.tsx

// Port of packages/@react-spectrum/s2/src/ActionButton.tsx.
// Port of packages/@react-spectrum/s2/src/Button.tsx.
// Port of packages/@react-spectrum/s2/src/ToggleButton.tsx.
import { createContext, useContext } from "solid-js";
import type { ActionButtonProps } from "./ActionButton";
import type { ButtonProps } from "./types";
import type { LinkButtonProps } from "./LinkButton";
import type { ToggleButtonProps } from "./ToggleButton";
import type { SpectrumContextValue } from "./spectrum-context";

export const ButtonContext = createContext<SpectrumContextValue<ButtonProps>>(null);
export const LinkButtonContext = createContext<SpectrumContextValue<LinkButtonProps>>(null);
export const ActionButtonContext =
  createContext<SpectrumContextValue<ActionButtonProps & { holdAffordance?: boolean }>>(null);
export const ToggleButtonContext =
  createContext<SpectrumContextValue<ToggleButtonProps & { holdAffordance?: boolean }>>(null);

export function useButtonContext(): SpectrumContextValue<ButtonProps> {
  return useContext(ButtonContext);
}

export function useLinkButtonContext(): SpectrumContextValue<LinkButtonProps> {
  return useContext(LinkButtonContext);
}

export function useActionButtonContext(): SpectrumContextValue<
  ActionButtonProps & { holdAffordance?: boolean }
> {
  return useContext(ActionButtonContext);
}

export function useToggleButtonContext(): SpectrumContextValue<
  ToggleButtonProps & { holdAffordance?: boolean }
> {
  return useContext(ToggleButtonContext);
}
