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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Toolbar.tsx

// Port of packages/@react-spectrum/s2/src/Toolbar.tsx.
import { type JSX } from "solid-js";
import {
  Toolbar as HeadlessToolbar,
  type ToolbarProps as HeadlessToolbarProps,
  type ToolbarRenderProps,
} from "@proyecto-viviana/solidaria-components";

export type { ToolbarRenderProps };
export type ToolbarProps = HeadlessToolbarProps;

/**
 * A toolbar is a container for a set of interactive controls, such as buttons,
 * menus, or checkboxes, with arrow key navigation between them.
 *
 * React Spectrum S2 (1.5.1) ships Toolbar as a bare passthrough over the
 * react-aria-components `Toolbar` — no styling, no variant, no size — so this
 * mirrors it exactly. See `@react-spectrum/s2/src/Toolbar.tsx`.
 *
 * @example
 * ```tsx
 * <Toolbar aria-label="Text formatting">
 *   <Button>Bold</Button>
 *   <Button>Italic</Button>
 *   <Button>Underline</Button>
 * </Toolbar>
 * ```
 */
export function Toolbar(props: ToolbarProps): JSX.Element {
  return <HeadlessToolbar {...props} />;
}
