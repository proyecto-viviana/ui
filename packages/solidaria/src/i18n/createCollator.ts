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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/i18n/useCollator.ts

/**
 * createCollator hook for solidaria
 *
 * Provides localized string comparison/collation with caching.
 *
 * Port of @react-aria/i18n useCollator.
 */

import { createMemo } from "solid-js";
import { useLocale } from "./locale";
import { createCacheKey } from "./utils";

const collatorCache = new Map<string, Intl.Collator>();

/**
 * Gets or creates a cached collator.
 */
function getCachedCollator(locale: string, options?: Intl.CollatorOptions): Intl.Collator {
  const cacheKey = createCacheKey(locale, options as Record<string, unknown>);

  if (collatorCache.has(cacheKey)) {
    return collatorCache.get(cacheKey)!;
  }

  const collator = new Intl.Collator(locale, options);
  collatorCache.set(cacheKey, collator);
  return collator;
}

/**
 * Provides localized string collation for the current locale.
 * Useful for sorting strings according to locale-specific rules.
 *
 * @example
 * ```tsx
 * function SortedList(props: { items: string[] }) {
 *   const collator = createCollator();
 *
 *   const sortedItems = () =>
 *     [...props.items].sort((a, b) => collator().compare(a, b));
 *
 *   return (
 *     <ul>
 *       <For each={sortedItems()}>
 *         {(item) => <li>{item}</li>}
 *       </For>
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Case-insensitive sorting
 * const collator = createCollator({ sensitivity: 'base' });
 *
 * // Numeric sorting
 * const numericCollator = createCollator({ numeric: true });
 * // ['a1', 'a10', 'a2'].sort(numericCollator().compare) -> ['a1', 'a2', 'a10']
 * ```
 */
export function createCollator(options?: Intl.CollatorOptions): () => Intl.Collator {
  const locale = useLocale();

  return createMemo(() => getCachedCollator(locale().locale, options));
}
