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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/i18n/useDefaultLocale.ts

/**
 * Locale context and provider for solidaria
 *
 * Provides locale and text direction to the component tree.
 *
 * Port of @react-aria/i18n context and useDefaultLocale.
 */

import {
  type Accessor,
  type JSX,
  type ParentProps,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  useContext,
} from "solid-js";
import { isRTL } from "./utils";

/** Text direction: left-to-right or right-to-left. */
export type Direction = "ltr" | "rtl";

/** Locale information including language code and text direction. */
export interface Locale {
  /** The BCP47 language code for the locale (e.g., 'en-US', 'ar-SA'). */
  locale: string;
  /** The writing direction for the locale. */
  direction: Direction;
}

export interface I18nProviderProps extends ParentProps {
  /** The locale to apply to the children. If not provided, uses browser default. */
  locale?: string;
}

// Symbol for server-provided locale
const localeSymbol = Symbol.for("solidaria.i18n.locale");

let currentLocale: Locale | null = null;
const listeners = new Set<(locale: Locale) => void>();

/**
 * Gets the default locale from the browser/system.
 */
export function getDefaultLocale(): Locale {
  let locale =
    (typeof window !== "undefined" &&
      (window as unknown as Record<symbol, string>)[localeSymbol]) ||
    (typeof navigator !== "undefined" &&
      (navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage)) ||
    "en-US";

  // Validate the locale is supported
  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }

  return {
    locale,
    direction: isRTL(locale) ? "rtl" : "ltr",
  };
}

function updateLocale(): void {
  currentLocale = getDefaultLocale();
  for (const listener of listeners) {
    listener(currentLocale);
  }
}

const I18nContext = createContext<Accessor<Locale> | null>(null);

/**
 * Returns the current browser/system locale, and updates when it changes.
 *
 * @example
 * ```tsx
 * const locale = createDefaultLocale();
 * console.log(locale().locale); // 'en-US'
 * console.log(locale().direction); // 'ltr'
 * ```
 */
export function createDefaultLocale(): Accessor<Locale> {
  if (!currentLocale) {
    currentLocale = getDefaultLocale();
  }

  const [locale, setLocale] = createSignal<Locale>(currentLocale);

  createEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (listeners.size === 0) {
      window.addEventListener("languagechange", updateLocale);
    }

    listeners.add(setLocale);

    onCleanup(() => {
      listeners.delete(setLocale);
      if (listeners.size === 0) {
        window.removeEventListener("languagechange", updateLocale);
      }
    });
  });

  return locale;
}

/**
 * Returns the current locale and layout direction from context or browser default.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const locale = useLocale();
 *   return <div dir={locale().direction}>{locale().locale}</div>;
 * }
 * ```
 */
export function useLocale(): Accessor<Locale> {
  const context = useContext(I18nContext);
  const defaultLocale = createDefaultLocale();
  return context || defaultLocale;
}

/**
 * Provides the locale for the application to all child components.
 *
 * @example
 * ```tsx
 * // Use browser default locale
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 *
 * // Override with specific locale
 * <I18nProvider locale="ar-SA">
 *   <App /> // Will have RTL direction
 * </I18nProvider>
 * ```
 */
export function I18nProvider(props: I18nProviderProps): JSX.Element {
  const defaultLocale = createDefaultLocale();

  const locale = createMemo<Locale>(() => {
    if (props.locale) {
      return {
        locale: props.locale,
        direction: isRTL(props.locale) ? "rtl" : "ltr",
      };
    }
    return defaultLocale();
  });

  return <I18nContext.Provider value={locale}>{props.children}</I18nContext.Provider>;
}
