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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/style-utils.ts

// Port of packages/@react-spectrum/s2/src/style-utils.ts.
import { type JSX, splitProps } from "solid-js";
import {
  Label as HeadlessLabel,
  type LabelProps as HeadlessLabelProps,
} from "@proyecto-viviana/solidaria-components";
import { style } from "../style" with { type: "macro" };

export type LabelSize = "sm" | "md" | "lg";

export interface LabelProps extends Omit<HeadlessLabelProps, "class"> {
  size?: LabelSize;
  class?: string;
}

// Mirrors S2's `fieldLabel()` (style-utils.ts): the size-responsive UI font, the
// `neutral-subdued` label color, and the default cursor. Routed through the
// `style()` macro (not hand-authored utility classes) so the CSS ships in the
// package's `styles.css` bundle and installed consumers render it styled.
const labelStyles = style<{ size: LabelSize }>({
  font: { default: "ui", size: { sm: "ui-sm", lg: "ui-lg" } },
  color: "neutral-subdued",
  cursor: "default",
});

export function Label(props: LabelProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["size", "class"]);
  const size = () => local.size ?? "md";
  return (
    <HeadlessLabel
      {...headlessProps}
      class={[labelStyles({ size: size() }), local.class].filter(Boolean).join(" ")}
    />
  );
}

export { Field } from "../form/Field";
export type { FieldProps, FieldSize } from "../form/Field";
export { HelpText } from "../form/HelpText";
export type { HelpTextProps } from "../form/HelpText";
