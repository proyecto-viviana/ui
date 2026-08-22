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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/ssr/SSRProvider.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/useId.ts

/**
 * SSR utilities for Solid Stately
 *
 * SolidJS has built-in SSR support with `isServer` and `createUniqueId()`.
 * These utilities provide a consistent port of the upstream SSR API.
 *
 * Ported from:
 * - packages/react-aria/src/ssr/SSRProvider.tsx
 * - packages/react-aria/src/utils/useId.ts
 */

import { createUniqueId } from "solid-js";
import { isServer as _isServer } from "solid-js/web";

/**
 * Re-export isServer from solid-js/web for convenience.
 */
export const isServer = _isServer;

/**
 * Returns whether the component is currently being server side rendered.
 * Can be used to delay browser-specific rendering until after hydration.
 */
export function createIsSSR(): boolean {
  return isServer;
}

/**
 * Generate a unique ID that is stable across server and client.
 * Uses SolidJS's built-in createUniqueId which handles SSR correctly.
 *
 * @param defaultId - Optional default ID to use instead of generating one.
 */
export function createId(defaultId?: string): string {
  if (defaultId) {
    return defaultId;
  }
  return `solid-stately-${createUniqueId()}`;
}

/**
 * Check if we can use DOM APIs.
 * This is useful for code that needs to run only in the browser.
 */
export const canUseDOM = !isServer;
