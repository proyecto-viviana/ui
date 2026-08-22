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

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/layout/Grid.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/layout/Grid.tsx.

/**
 * Creates a CSS `fit-content()` value.
 * @param value - The max content size (e.g., '200px', '50%')
 */
export function fitContent(value: string): string {
  return `fit-content(${value})`;
}

/**
 * Creates a CSS `minmax()` value.
 * @param min - The minimum size
 * @param max - The maximum size
 */
export function minmax(min: string, max: string): string {
  return `minmax(${min}, ${max})`;
}

/**
 * Creates a CSS `repeat()` value.
 * @param count - The repetition count or 'auto-fill' / 'auto-fit'
 * @param track - The track definition
 */
export function repeat(count: number | "auto-fill" | "auto-fit", track: string): string {
  return `repeat(${count}, ${track})`;
}
