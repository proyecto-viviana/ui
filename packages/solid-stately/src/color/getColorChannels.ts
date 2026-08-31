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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/color/Color.ts

/**
 * getColorChannels - Standalone function to get color channels for a color space.
 *
 * Returns the three channels for a given color space.
 *
 * Ported from packages/react-stately/src/color/Color.ts.
 */

import type { ColorChannel, ColorSpace } from "./types";

const COLOR_SPACE_CHANNELS: Record<ColorSpace, [ColorChannel, ColorChannel, ColorChannel]> = {
  rgb: ["red", "green", "blue"],
  hsl: ["hue", "saturation", "lightness"],
  hsb: ["hue", "saturation", "brightness"],
};

/**
 * Returns the color channels for a given color space.
 *
 * @param colorSpace - The color space to get channels for.
 * @returns A tuple of three color channels.
 *
 * @example
 * ```ts
 * getColorChannels('rgb') // ['red', 'green', 'blue']
 * getColorChannels('hsl') // ['hue', 'saturation', 'lightness']
 * getColorChannels('hsb') // ['hue', 'saturation', 'brightness']
 * ```
 */
export function getColorChannels(
  colorSpace: ColorSpace,
): [ColorChannel, ColorChannel, ColorChannel] {
  const channels = COLOR_SPACE_CHANNELS[colorSpace];
  if (!channels) {
    throw new Error(`Unknown color space: ${colorSpace}`);
  }
  return channels;
}
