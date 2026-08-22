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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Breadcrumbs.tsx

// Port of packages/@react-spectrum/s2/src/Breadcrumbs.tsx.

import { baseColor, focusRing, size as s2Size, style } from "../style" with { type: "macro" };
import {
  controlFont,
  controlSize,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };

export type S2BreadcrumbsSize = "M" | "L";

export const wrapperStyles = style<{ size: S2BreadcrumbsSize; isDisabled?: boolean }>(
  {
    position: "relative",
    display: "flex",
    justifyContent: "start",
    listStyleType: "none",
    flexWrap: "nowrap",
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    height: controlSize(),
    gap: {
      size: {
        M: s2Size(6),
        L: s2Size(9),
      },
    },
    padding: 0,
    transition: "default",
    marginTop: 0,
    marginBottom: 0,
    marginStart: {
      size: {
        M: s2Size(6),
        L: s2Size(9),
      },
    },
  },
  getAllowedOverrides(),
);

export const breadcrumbStyles = style<{
  size?: S2BreadcrumbsSize;
  isDisabled?: boolean;
  isCurrent?: boolean;
  isMenu?: boolean;
  isHovered?: boolean;
  isFocusVisible?: boolean;
  isFocused?: boolean;
  isPressed?: boolean;
}>({
  ...focusRing(),
  display: {
    default: "block",
    isMenu: "flex",
  },
  alignItems: {
    isMenu: "center",
  },
  justifyContent: {
    isMenu: "start",
  },
  height: {
    isMenu: controlSize(),
  },
  transition: "default",
  position: "relative",
  flexShrink: 0,
  borderStyle: "none",
  /* A breadcrumb item is a nav row, so it takes the `row` corner (6px) rather than
   * `sm` (4px, spectrum-theme.ts:630) — a value the register's radius ladder does not
   * draw. The row-shaped siblings already spell this: tabs/index.tsx:336,
   * steplist:68, tree:273/370/477, gridlist:642/686, table:1041. Visible chrome, not
   * dead geometry — it shapes the hover fill and the focus-ring corner. */
  borderRadius: "row",
  font: controlFont(),
  color: {
    default: baseColor("neutral-subdued"),
    isDisabled: baseColor("neutral-subdued"),
    isCurrent: baseColor("neutral"),
    forcedColors: {
      default: "LinkText",
      isDisabled: "GrayText",
      isCurrent: "GrayText",
    },
  },
  marginStart: {
    isMenu: s2Size(-6),
  },
  textDecoration: {
    default: "none",
    isHovered: "underline",
    isFocusVisible: "underline",
    isDisabled: "none",
  },
  cursor: {
    default: "pointer",
    isDisabled: "default",
    isCurrent: "default",
  },
  outlineColor: {
    default: "focus-ring",
    forcedColors: "Highlight",
  },
  disableTapHighlight: true,
});

export const currentStyles = style<{ size: S2BreadcrumbsSize }>({
  font: controlFont(),
  fontWeight: "bold",
  color: {
    default: "neutral",
    forcedColors: "ButtonText",
  },
});

export const chevronStyles = style<{ direction?: "ltr" | "rtl"; isMenu?: boolean }>({
  scale: {
    direction: {
      rtl: -1,
    },
  },
  marginStart: {
    default: "text-to-visual",
    isMenu: 0,
  },
  color: {
    default: "neutral",
    forcedColors: {
      default: "LinkText",
    },
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});
