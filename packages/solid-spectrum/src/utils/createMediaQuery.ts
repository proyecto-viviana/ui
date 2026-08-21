/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/useMediaQuery.ts

/**
 * createMediaQuery — a SolidJS reactive media-query primitive.
 *
 * Based on packages/@react-spectrum/s2/src/useMediaQuery.ts.
 * It subscribes to `window.matchMedia` and updates when the query's match state changes.
 * Returns
 * `false` during SSR (and before mount) so the server and first client render
 * agree, then resolves to the real value once mounted on the client.
 */
import { createSignal, onCleanup, onMount } from "solid-js";

export function createMediaQuery(query: string): () => boolean {
  const supportsMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia === "function";

  const [matches, setMatches] = createSignal(false);

  onMount(() => {
    if (!supportsMatchMedia) {
      return;
    }

    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const onChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      onCleanup(() => mq.removeEventListener("change", onChange));
    } else {
      // Safari < 14 only supports the deprecated MediaQueryList listener API.
      mq.addListener(onChange);
      onCleanup(() => mq.removeListener(onChange));
    }
  });

  return matches;
}
