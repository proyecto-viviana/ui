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

import { style } from "../style";
import { staticColor } from "../s2-internal/style-utils";
import type { StaticColor } from "./types";
import type { ActionButtonSize } from "./group-context";

export interface S2PendingProgressCircleStyleProps {
  size: ActionButtonSize;
  staticColor?: StaticColor;
}

export const s2PendingProgressCircle = style<S2PendingProgressCircleStyleProps>({
  ...staticColor(),
  size: {
    size: {
      XS: 12,
      S: 14,
      M: 18,
      L: 20,
      XL: 24,
    },
  },
  aspectRatio: "square",
});

export const s2PendingProgressCircleTrack = style<{
  isStaticColor?: boolean;
  size?: "S" | "M" | "L";
}>({
  stroke: {
    default: "gray-300",
    isStaticColor: "transparent-overlay-300",
    forcedColors: "Background",
  },
  strokeWidth: {
    default: "[0.1875rem]",
    size: {
      S: "[0.125rem]",
      L: "[0.25rem]",
    },
    forcedColors: {
      default: "[0.125rem]",
      size: {
        S: "[0.0625rem]",
        L: "[0.1875rem]",
      },
    },
  },
});

export const s2PendingProgressCircleFill = style<{
  isStaticColor?: boolean;
  size?: "S" | "M" | "L";
}>({
  stroke: {
    default: "blue-900",
    isStaticColor: "transparent-overlay-900",
    forcedColors: "ButtonText",
  },
  rotate: -90,
  transformOrigin: "center",
  strokeWidth: {
    default: "[0.1875rem]",
    size: {
      S: "[0.125rem]",
      L: "[0.25rem]",
    },
  },
});

export const s2PendingProgressCircleHcmStroke = style<{
  size?: "S" | "M" | "L";
}>({
  stroke: {
    default: "transparent",
    forcedColors: "ButtonText",
  },
  strokeWidth: {
    default: "[0.1875rem]",
    size: {
      S: "[0.125rem]",
      L: "[0.25rem]",
    },
  },
});
