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

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/icon/Illustration.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/icon/Illustration.tsx.

import { type JSX, splitProps } from "solid-js";
import { style } from "../style" with { type: "macro" };

export type IllustrationSize = "sm" | "md" | "lg";

export interface IllustrationProps {
  /** The size of the illustration. @default 'md' */
  size?: IllustrationSize;
  /** Additional CSS class name. */
  class?: string;
  /** The illustration content (SVG or image). */
  children?: JSX.Element;
  /** Accessibility label. */
  "aria-label"?: string;
}

// Centered container for a decorative illustration, tinted with the muted
// `gray-500` neutral. Sizes map sm/md/lg → 64/96/128px (the old w-16/24/32).
// Routed through the `style()` macro so the CSS ships in the package bundle for
// installed consumers.
const illustrationStyles = style<{ size: IllustrationSize }>({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "gray-500",
  width: { default: "[96px]", size: { sm: "[64px]", lg: "[128px]" } },
  height: { default: "[96px]", size: { sm: "[64px]", lg: "[128px]" } },
});

/**
 * A styled container for decorative illustrations.
 */
export function Illustration(props: IllustrationProps): JSX.Element {
  const [local, rest] = splitProps(props, ["size", "class", "children"]);

  return (
    <div
      {...rest}
      role={rest["aria-label"] ? "img" : "presentation"}
      class={[illustrationStyles({ size: local.size ?? "md" }), local.class]
        .filter(Boolean)
        .join(" ")}
    >
      {local.children}
    </div>
  );
}
