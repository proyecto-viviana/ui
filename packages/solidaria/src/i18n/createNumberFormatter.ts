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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/i18n/useNumberFormatter.ts

/**
 * createNumberFormatter hook for solidaria
 *
 * Provides localized number formatting with automatic locale updates.
 *
 * Port of @react-aria/i18n useNumberFormatter.
 */

import { createMemo } from "solid-js";
import { useLocale } from "./locale";
import { NumberFormatter, type NumberFormatOptions } from "@internationalized/number";

/**
 * Provides localized number formatting for the current locale.
 * Automatically updates when the locale changes.
 *
 * @example
 * ```tsx
 * function PriceDisplay(props: { value: number }) {
 *   const formatter = createNumberFormatter({
 *     style: 'currency',
 *     currency: 'USD',
 *   });
 *
 *   return <span>{formatter().format(props.value)}</span>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Percent formatting
 * const percentFormatter = createNumberFormatter({
 *   style: 'percent',
 *   minimumFractionDigits: 1,
 * });
 * percentFormatter().format(0.125); // '12.5%'
 *
 * // Unit formatting
 * const tempFormatter = createNumberFormatter({
 *   style: 'unit',
 *   unit: 'celsius',
 * });
 * tempFormatter().format(25); // '25°C'
 * ```
 */
export function createNumberFormatter(options: NumberFormatOptions = {}): () => NumberFormatter {
  const locale = useLocale();

  return createMemo(() => new NumberFormatter(locale().locale, options));
}
