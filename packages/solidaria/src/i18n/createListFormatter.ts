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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/i18n/useListFormatter.tsx

/**
 * createListFormatter hook for solidaria
 *
 * Provides localized list formatting with automatic locale updates.
 *
 * Port of @react-aria/i18n useListFormatter.
 */

import { createMemo, type Accessor } from "solid-js";
import { useLocale } from "./locale";

/**
 * Provides localized list formatting for the current locale. Automatically
 * updates when the locale changes.
 *
 * @param options - Formatting options.
 */
export function createListFormatter(
  options: Intl.ListFormatOptions = {},
): Accessor<Intl.ListFormat> {
  const locale = useLocale();
  return createMemo(() => new Intl.ListFormat(locale().locale, options));
}
