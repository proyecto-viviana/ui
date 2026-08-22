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

import { type JSX } from "solid-js";
import {
  SubmenuTrigger as HeadlessSubmenuTrigger,
  type SubmenuTriggerProps as HeadlessSubmenuTriggerProps,
} from "@proyecto-viviana/solidaria-components";

export interface SubmenuTriggerProps extends HeadlessSubmenuTriggerProps {}

/**
 * A styled submenu trigger that opens a nested menu.
 */
export function SubmenuTrigger(props: SubmenuTriggerProps): JSX.Element {
  return <HeadlessSubmenuTrigger {...props} />;
}
