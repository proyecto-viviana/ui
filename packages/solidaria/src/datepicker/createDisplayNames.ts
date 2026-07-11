/**
 * createDisplayNames hook for Solidaria
 *
 * Returns an `Intl.DisplayNames`-compatible object for the `dateTimeField` type,
 * falling back to a dictionary-backed polyfill in engines that support
 * `Intl.DisplayNames` but not the v2 `dateTimeField` type. Port of
 * @react-aria/datepicker `useDisplayNames`.
 */

import { createMemo, type Accessor } from "solid-js";
import { useLocale } from "../i18n";
import { datePickerDictionary } from "./intl";

export interface DisplayNames {
  of(field: string): string;
}

class DisplayNamesPolyfill implements DisplayNames {
  constructor(
    private locale: string,
    private dictionary: typeof datePickerDictionary,
  ) {}

  of(field: string): string {
    return this.dictionary.getStringForLocale(field, this.locale) as unknown as string;
  }
}

/**
 * Returns an accessor to a localized `DisplayNames` instance for date field names.
 */
export function createDisplayNames(): Accessor<DisplayNames> {
  const localeAccessor = useLocale();

  return createMemo(() => {
    const locale = localeAccessor().locale;
    // Try to use Intl.DisplayNames if possible. It may be supported in browsers, but not support the
    // dateTimeField type as that was only added in v2. https://github.com/tc39/intl-displaynames-v2
    try {
      return new Intl.DisplayNames(locale, { type: "dateTimeField" }) as unknown as DisplayNames;
    } catch {
      return new DisplayNamesPolyfill(locale, datePickerDictionary);
    }
  });
}
