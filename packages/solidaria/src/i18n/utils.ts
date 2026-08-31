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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/i18n/utils.ts

/**
 * i18n utilities for solidaria
 *
 * RTL detection and locale utilities.
 *
 * Port of @react-aria/i18n utils.
 */

// https://en.wikipedia.org/wiki/Right-to-left
const RTL_SCRIPTS = new Set([
  "Arab",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr",
]);

const RTL_LANGS = new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

/**
 * Determines if a locale is read right to left.
 * Uses Intl.Locale API when available for accurate detection.
 */
export function isRTL(localeString: string): boolean {
  // If the Intl.Locale API is available, use it to get the locale's text direction.
  if (typeof Intl !== "undefined" && Intl.Locale) {
    try {
      const locale = new Intl.Locale(localeString).maximize();

      // Use the text info object to get the direction if possible.
      // getTextInfo() was implemented as a property by some browsers before it was standardized as a function.
      const localeAny = locale as unknown as {
        getTextInfo?: () => { direction: string };
        textInfo?: { direction: string };
      };
      const textInfo =
        typeof localeAny.getTextInfo === "function" ? localeAny.getTextInfo() : localeAny.textInfo;

      if (textInfo) {
        return textInfo.direction === "rtl";
      }

      // Fallback: guess using the script.
      if (locale.script) {
        return RTL_SCRIPTS.has(locale.script);
      }
    } catch {
      // Fall through to language-based detection
    }
  }

  // If not, just guess by the language (first part of the locale)
  const lang = localeString.split("-")[0];
  return RTL_LANGS.has(lang);
}

/**
 * Creates a cache key for formatter options.
 */
export function createCacheKey(locale: string, options?: Record<string, unknown>): string {
  if (!options) {
    return locale;
  }
  return (
    locale +
    Object.entries(options)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .join()
  );
}
