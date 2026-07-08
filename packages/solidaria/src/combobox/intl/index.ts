/**
 * ComboBox internationalization strings
 * Based on @react-aria/combobox/intl
 */

import type { LocalizedString, LocalizedStrings } from "@internationalized/string";

// Import locale files
import enUS from "./en-US.json" with { type: "json" };
import esES from "./es-ES.json" with { type: "json" };
// Full upstream locale set (32 locales; en-US/es-ES sourced from the JSON above).
import { generatedComboBoxLocales } from "./generated-locales";

export type ComboBoxIntlStrings = {
  focusAnnouncement: string;
  countAnnouncement: string;
  selectedAnnouncement: string;
  buttonLabel: string;
  listboxLabel: string;
};

// Announcement keys are LocalizedString functions in the generated locales
// (matching upstream's compiled form), so the value type widens to
// LocalizedString. The hand-authored en-US/es-ES stay as ICU strings and win.
export const comboBoxIntlStrings: LocalizedStrings<keyof ComboBoxIntlStrings, LocalizedString> = {
  ...generatedComboBoxLocales,
  "en-US": enUS,
  "es-ES": esES,
};
