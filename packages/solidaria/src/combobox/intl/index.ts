// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/ar-AE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/bg-BG.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/cs-CZ.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/da-DK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/de-DE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/el-GR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/en-US.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/es-ES.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/et-EE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/fi-FI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/fr-FR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/he-IL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/hr-HR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/hu-HU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/it-IT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/ja-JP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/ko-KR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/lt-LT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/lv-LV.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/nb-NO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/nl-NL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/pl-PL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/pt-BR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/pt-PT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/ro-RO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/ru-RU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/sk-SK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/sl-SI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/sr-SP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/sv-SE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/tr-TR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/uk-UA.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/zh-CN.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/zh-TW.json

/**
 * ComboBox internationalization strings.
 * Ported from the complete @react-aria/combobox intl strings catalog.
 * This module includes all 34 upstream locales.
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
