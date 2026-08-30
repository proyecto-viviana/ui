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

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/layout/Flex.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/layout/Flex.tsx.
import { type JSX, splitProps } from "solid-js";

export interface FlexProps {
  /** The flex direction. @default 'row' */
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  /** The gap between items. Accepts a t-shirt size, a number (spacing scale), or a raw CSS length. @default '0' */
  gap?: string | number;
  /** Whether items should wrap. @default false */
  wrap?: boolean | "wrap" | "nowrap" | "wrap-reverse";
  /** The alignment of items. */
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
  /** The justification of items. */
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly";
  /** Whether the flex container is inline. */
  inline?: boolean;
  /** Additional CSS class name. */
  class?: string;
  /** Additional inline styles. */
  style?: JSX.CSSProperties;
  /** The content. */
  children?: JSX.Element;
}

// Layout primitives emit inline CSS so the styling ships with the package for
// installed consumers, rather than relying on Tailwind utility strings the
// package ships no CSS for.

const alignMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const justifyMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

// t-shirt gap tokens map to the Spectrum spacing scale; a bare number follows
// Tailwind's spacing scale (1 unit = 0.25rem); anything else is a raw CSS length.
const gapTokens: Record<string, string> = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};

export function resolveGap(value: string | number): string {
  if (typeof value === "number") return `${value * 0.25}rem`;
  if (value in gapTokens) return gapTokens[value];
  if (/^\d+(?:\.\d+)?$/.test(value)) return `${parseFloat(value) * 0.25}rem`;
  return value;
}

/**
 * A flex container layout component.
 */
export function Flex(props: FlexProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "direction",
    "gap",
    "wrap",
    "alignItems",
    "justifyContent",
    "inline",
    "class",
    "style",
    "children",
  ]);

  // `style` is merged rather than left in `rest`, where the assignment below would have
  // silently dropped it. Grid already accepted one; the two primitives are meant to be
  // interchangeable, and without it every decorated row has to fall back to a bare div.
  const flexStyle = (): JSX.CSSProperties => {
    const s: JSX.CSSProperties = {
      display: local.inline ? "inline-flex" : "flex",
      ...local.style,
    };

    if (local.direction) s["flex-direction"] = local.direction;
    if (local.gap !== undefined) s.gap = resolveGap(local.gap);
    if (local.wrap) {
      s["flex-wrap"] =
        local.wrap === true || local.wrap === "wrap"
          ? "wrap"
          : local.wrap === "wrap-reverse"
            ? "wrap-reverse"
            : "nowrap";
    }
    if (local.alignItems) s["align-items"] = alignMap[local.alignItems];
    if (local.justifyContent) s["justify-content"] = justifyMap[local.justifyContent];

    return s;
  };

  return (
    <div {...rest} class={local.class} style={flexStyle()}>
      {local.children}
    </div>
  );
}
