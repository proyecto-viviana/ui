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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Menu.tsx

// Port of packages/@react-spectrum/s2/src/Menu.tsx.
import { createContext } from "solid-js";
import type { MenuTriggerType } from "@proyecto-viviana/solid-stately";
import type { S2MenuSize } from "./s2-menu-styles";

export type MenuAlign = "start" | "end";
export type MenuDirection = "top" | "bottom" | "start" | "end" | "left" | "right";

export interface MenuTriggerOptionsContextValue {
  align: () => MenuAlign | undefined;
  direction: () => MenuDirection | undefined;
  shouldFlip: () => boolean | undefined;
  trigger: () => MenuTriggerType | undefined;
}

export const MenuSizeContext = createContext<S2MenuSize>("M");
export const MenuLinkOutIconContext = createContext(false);
export const MenuTriggerOptionsContext = createContext<MenuTriggerOptionsContextValue | null>(null);
