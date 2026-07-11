// Spinbutton announcement catalog, ported verbatim from @react-aria/spinbutton's
// intl/*.json (34 locales). Keep in sync with the vendored react-spectrum source on
// every pin bump.
import { LocalizedStringDictionary } from "@internationalized/string";

export type SpinButtonStringKey = "Empty";

export const spinButtonStrings: Record<string, Record<SpinButtonStringKey, string>> = {
  "ar-AE": {
  "Empty": `\u{641}\u{627}\u{631}\u{63A}`
  },
  "bg-BG": {
  "Empty": `\u{418}\u{437}\u{43F}\u{440}\u{430}\u{437}\u{43D}\u{438}`
  },
  "cs-CZ": {
  "Empty": `Pr\xe1zdn\xe9`
  },
  "da-DK": {
  "Empty": `Tom`
  },
  "de-DE": {
  "Empty": `Leer`
  },
  "el-GR": {
  "Empty": `\u{386}\u{3B4}\u{3B5}\u{3B9}\u{3BF}`
  },
  "en-US": {
  "Empty": `Empty`
  },
  "es-ES": {
  "Empty": `Vac\xedo`
  },
  "et-EE": {
  "Empty": `T\xfchjenda`
  },
  "fi-FI": {
  "Empty": `Tyhj\xe4`
  },
  "fr-FR": {
  "Empty": `Vide`
  },
  "he-IL": {
  "Empty": `\u{5E8}\u{5D9}\u{5E7}`
  },
  "hr-HR": {
  "Empty": `Prazno`
  },
  "hu-HU": {
  "Empty": `\xdcres`
  },
  "it-IT": {
  "Empty": `Vuoto`
  },
  "ja-JP": {
  "Empty": `\u{7A7A}`
  },
  "ko-KR": {
  "Empty": `\u{BE44}\u{C5B4} \u{C788}\u{C74C}`
  },
  "lt-LT": {
  "Empty": `Tu\u{161}\u{10D}ias`
  },
  "lv-LV": {
  "Empty": `Tuk\u{161}s`
  },
  "nb-NO": {
  "Empty": `Tom`
  },
  "nl-NL": {
  "Empty": `Leeg`
  },
  "pl-PL": {
  "Empty": `Pusty`
  },
  "pt-BR": {
  "Empty": `Vazio`
  },
  "pt-PT": {
  "Empty": `Vazio`
  },
  "ro-RO": {
  "Empty": `Gol`
  },
  "ru-RU": {
  "Empty": `\u{41D}\u{435} \u{437}\u{430}\u{43F}\u{43E}\u{43B}\u{43D}\u{435}\u{43D}\u{43E}`
  },
  "sk-SK": {
  "Empty": `Pr\xe1zdne`
  },
  "sl-SI": {
  "Empty": `Prazen`
  },
  "sr-SP": {
  "Empty": `Prazno`
  },
  "sv-SE": {
  "Empty": `Tomt`
  },
  "tr-TR": {
  "Empty": `Bo\u{15F}`
  },
  "uk-UA": {
  "Empty": `\u{41F}\u{443}\u{441}\u{442}\u{43E}`
  },
  "zh-CN": {
  "Empty": `\u{7A7A}`
  },
  "zh-TW": {
  "Empty": `\u{7A7A}\u{767D}`
  },
};

export const spinButtonDictionary = new LocalizedStringDictionary<SpinButtonStringKey, string>(
  spinButtonStrings,
);
