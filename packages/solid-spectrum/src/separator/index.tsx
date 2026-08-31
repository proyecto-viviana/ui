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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Divider.tsx

// Port of packages/@react-spectrum/s2/src/Divider.tsx.
import { type JSX, splitProps } from "solid-js";
import {
  Separator as HeadlessSeparator,
  type SeparatorProps as HeadlessSeparatorProps,
} from "@proyecto-viviana/solidaria-components";
import { style } from "../style" with { type: "macro" };

export type SeparatorVariant = "default" | "subtle" | "strong";
export type SeparatorSize = "sm" | "md" | "lg";
type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends Omit<HeadlessSeparatorProps, "class" | "style"> {
  /** The visual style variant. @default 'default' */
  variant?: SeparatorVariant;
  /** The size/thickness of the separator. @default 'md' */
  size?: SeparatorSize;
  /** Additional CSS class name. */
  class?: string;
}

// A rule drawn as a filled bar, mirroring Divider's S2 approach (a solid
// `backgroundColor` plus an explicit px thickness rather than a CSS border).
// Sizes sm/md/lg map to 1/2/4px — the same steps as Divider's S/M/L — and the
// variants pick a neutral gray weight. Routed through the `style()` macro so the
// CSS ships in the package bundle for installed consumers.
const separatorStyles = style<{
  variant: SeparatorVariant;
  size: SeparatorSize;
  orientation: SeparatorOrientation;
}>({
  backgroundColor: {
    variant: {
      default: "gray-200",
      subtle: "gray-100",
      strong: "gray-400",
    },
  },
  borderStyle: "none",
  margin: 0,
  flexShrink: 0,
  alignSelf: { orientation: { vertical: "stretch" } },
  width: {
    orientation: {
      horizontal: "full",
      vertical: { default: "[2px]", size: { sm: "[1px]", lg: "[4px]" } },
    },
  },
  height: {
    orientation: {
      horizontal: { default: "[2px]", size: { sm: "[1px]", lg: "[4px]" } },
      vertical: "full",
    },
  },
});

/**
 * A separator is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 *
 * @example
 * ```tsx
 * <Separator />
 *
 * // Vertical separator
 * <div class="flex items-center gap-4">
 *   <span>Item 1</span>
 *   <Separator orientation="vertical" />
 *   <span>Item 2</span>
 * </div>
 *
 * // Different variants
 * <Separator variant="strong" />
 * ```
 */
export function Separator(props: SeparatorProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["orientation", "variant", "size", "class"]);

  const orientation = () => local.orientation ?? "horizontal";
  const variant = () => local.variant ?? "default";
  const size = () => local.size ?? "md";

  return (
    <HeadlessSeparator
      {...headlessProps}
      orientation={orientation()}
      class={[
        separatorStyles({ variant: variant(), size: size(), orientation: orientation() }),
        local.class,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
