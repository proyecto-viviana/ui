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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/CenterBaseline.tsx

// Port of packages/@react-spectrum/s2/src/CenterBaseline.tsx.
import { type JSX } from "solid-js";
import { mergeStyles } from "../style/runtime";
import { style } from "../style" with { type: "macro" };
import { css } from "../style/style-macro" with { type: "macro" };
import type { StyleString } from "../style";

const centerBaselineClass = style({
  display: "flex",
  alignItems: "center",
});
export const centerBaselineBefore = css(
  '&::before { content: "\u00a0"; width: 0; visibility: hidden }',
) as StyleString;

export interface CenterBaselineProps {
  id?: string;
  style?: JSX.CSSProperties;
  styles?: StyleString | (() => StyleString | undefined);
  children: JSX.Element;
  slot?: string;
}

export function CenterBaseline(props: CenterBaselineProps): JSX.Element {
  const styles = () => (typeof props.styles === "function" ? props.styles() : props.styles);

  return (
    <div
      id={props.id}
      slot={props.slot}
      style={props.style}
      class={mergeStyles(centerBaselineClass, styles()) + " " + centerBaselineBefore}
    >
      {props.children}
    </div>
  );
}

export function centerBaseline(
  props: Omit<CenterBaselineProps, "children"> = {},
): (icon: JSX.Element) => JSX.Element {
  return (icon: JSX.Element) => <CenterBaseline {...props}>{icon}</CenterBaseline>;
}
