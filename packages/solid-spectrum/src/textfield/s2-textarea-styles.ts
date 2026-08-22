// @ts-nocheck

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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/TextField.tsx

// Port of packages/@react-spectrum/s2/src/TextField.tsx.

import { style } from "../style" with { type: "macro" };
import { centerPadding, controlSize } from "../s2-internal/style-utils" with { type: "macro" };

export const textAreaFieldGroupStyles = style({
  alignItems: "baseline",
  height: "auto",
});

export const textAreaInputStyles = style({
  paddingX: 0,
  paddingY: centerPadding(),
  minHeight: controlSize(),
  boxSizing: "border-box",
  backgroundColor: "transparent",
  color: {
    default: "inherit",
    "::placeholder": {
      default: "gray-600",
      forcedColors: "GrayText",
    },
  },
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  lineHeight: "inherit",
  flexGrow: 1,
  minWidth: 0,
  outlineStyle: "none",
  borderStyle: "none",
  resize: "none",
  overflowX: "hidden",
});
