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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/keyboard.tsx

/**
 * Keyboard / modifier-key helpers.
 * Ported from packages/react-aria/src/utils/keyboard.tsx.
 */

import { isMac } from "./platform";

/** The modifier-key fields consulted by {@link isCtrlKeyPressed}. */
interface ModifierKeyEvent {
  ctrlKey?: boolean;
  metaKey?: boolean;
}

/**
 * Returns whether the platform's non-contiguous selection modifier is pressed:
 * the Command key on macOS, the Control key elsewhere. Mirrors
 * `@react-aria/utils`' `isCtrlKeyPressed`.
 */
export function isCtrlKeyPressed(e: ModifierKeyEvent): boolean {
  if (isMac()) {
    return e.metaKey === true;
  }

  return e.ctrlKey === true;
}
