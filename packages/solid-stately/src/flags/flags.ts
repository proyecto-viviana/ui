/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/flags/flags.ts

let shadowDOMEnabled = false;

/** Enables React Stately's opt-in Shadow DOM behavior across the port stack. */
export function enableShadowDOM(): void {
  shadowDOMEnabled = true;
}

/** Returns whether opt-in Shadow DOM behavior is enabled. */
export function shadowDOM(): boolean {
  return shadowDOMEnabled;
}
