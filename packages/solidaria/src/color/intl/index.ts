/**
 * Color internationalization strings.
 *
 * Port of `@react-aria/color`'s intl catalog — the `colorPicker`,
 * `twoDimensionalSlider`, `colorSwatch`, `transparent`, `colorNameAndValue`,
 * and `colorInputLabel` messages across all 34 upstream locales. Consumed via
 * `createColorStringFormatter`, mirroring upstream's
 * `useLocalizedStringFormatter(intlMessages, '@react-aria/color')`.
 *
 * The per-locale message SEPARATORS differ (e.g. CJK `：`/`、`, French
 * non-breaking ` :`), so each locale's function form is preserved
 * verbatim rather than shared.
 */

import type { LocalizedStrings } from "@internationalized/string";
import { createStringFormatter } from "../../i18n";

export type ColorIntlKey =
  | "colorPicker"
  | "twoDimensionalSlider"
  | "colorSwatch"
  | "transparent"
  | "colorNameAndValue"
  | "colorInputLabel";

export type ColorIntlVariables = {
  name?: string;
  value?: string;
  label?: string;
  channelLabel?: string;
};

type ColorIntlMessage = string | ((args: ColorIntlVariables | undefined) => string);

export const colorIntlStrings: LocalizedStrings<ColorIntlKey, ColorIntlMessage> = {
  "ar-AE": {
    colorPicker: "أداة انتقاء اللون",
    twoDimensionalSlider: "مُنزلق 2D",
    colorSwatch: "تغيير الألوان",
    transparent: "شفاف",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "bg-BG": {
    colorPicker: "Средство за избиране на цвят",
    twoDimensionalSlider: "2D плъзгач",
    colorSwatch: "цветна мостра",
    transparent: "прозрачен",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "cs-CZ": {
    colorPicker: "Výběr barvy",
    twoDimensionalSlider: "2D posuvník",
    colorSwatch: "barevný vzorek",
    transparent: "průhledný",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "da-DK": {
    colorPicker: "Farvevælger",
    twoDimensionalSlider: "2D-skyder",
    colorSwatch: "farveprøve",
    transparent: "gennemsigtig",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "de-DE": {
    colorPicker: "Farbwähler",
    twoDimensionalSlider: "2D-Schieberegler",
    colorSwatch: "Farbfeld",
    transparent: "transparent",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "el-GR": {
    colorPicker: "Επιλογέας χρωμάτων",
    twoDimensionalSlider: "Ρυθμιστικό 2D",
    colorSwatch: "χρωματικό δείγμα",
    transparent: "διαφανές",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "en-US": {
    colorPicker: "Color picker",
    twoDimensionalSlider: "2D slider",
    colorSwatch: "color swatch",
    transparent: "transparent",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "es-ES": {
    colorPicker: "Selector de color",
    twoDimensionalSlider: "Regulador 2D",
    colorSwatch: "muestra de color",
    transparent: "transparente",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "et-EE": {
    colorPicker: "Värvivalija",
    twoDimensionalSlider: "2D-liugur",
    colorSwatch: "värvinäidis",
    transparent: "läbipaistev",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "fi-FI": {
    colorPicker: "Värimuokkain",
    twoDimensionalSlider: "2D-liukusäädin",
    colorSwatch: "värimalli",
    transparent: "läpinäkyvä",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "fr-FR": {
    colorPicker: "Sélecteur de couleurs",
    twoDimensionalSlider: "Curseur 2D",
    colorSwatch: "Échantillon de couleurs",
    transparent: "Transparent",
    colorNameAndValue: (args) => `${args?.name} : ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "he-IL": {
    colorPicker: "בוחר הצבעים",
    twoDimensionalSlider: "מחוון דו מימדי",
    colorSwatch: "דוגמית צבע",
    transparent: "שקוף",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "hr-HR": {
    colorPicker: "Odabir boje",
    twoDimensionalSlider: "2D klizač",
    colorSwatch: "uzorak boje",
    transparent: "transparentno",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "hu-HU": {
    colorPicker: "Színválasztó",
    twoDimensionalSlider: "2D-csúszka",
    colorSwatch: "színtár",
    transparent: "átlátszó",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "it-IT": {
    colorPicker: "Selettore colore",
    twoDimensionalSlider: "Cursore 2D",
    colorSwatch: "campione di colore",
    transparent: "trasparente",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "ja-JP": {
    colorPicker: "カラーピッカー",
    twoDimensionalSlider: "2D スライダー",
    colorSwatch: "カラースウォッチ",
    transparent: "透明",
    colorNameAndValue: (args) => `${args?.name} : ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}、${args?.channelLabel}`,
  },
  "ko-KR": {
    colorPicker: "색상 피커",
    twoDimensionalSlider: "2D 슬라이더",
    colorSwatch: "색상 견본",
    transparent: "투명도",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "lt-LT": {
    colorPicker: "Spalvų parinkiklis",
    twoDimensionalSlider: "2D slankiklis",
    colorSwatch: "spalvų pavyzdys",
    transparent: "skaidrus",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "lv-LV": {
    colorPicker: "Krāsu atlasītājs",
    twoDimensionalSlider: "2D slīdnis",
    colorSwatch: "krāsu paraugs",
    transparent: "caurspīdīgs",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "nb-NO": {
    colorPicker: "Fargevelger",
    twoDimensionalSlider: "2D-glidebryter",
    colorSwatch: "fargekart",
    transparent: "gjennomsiktig",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "nl-NL": {
    colorPicker: "Kleurkiezer",
    twoDimensionalSlider: "2D-schuifregelaar",
    colorSwatch: "kleurstaal",
    transparent: "transparant",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "pl-PL": {
    colorPicker: "Próbnik kolorów",
    twoDimensionalSlider: "Suwak 2D",
    colorSwatch: "próbka koloru",
    transparent: "przezroczysty",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "pt-BR": {
    colorPicker: "Seletor de cores",
    twoDimensionalSlider: "Controle deslizante 2D",
    colorSwatch: "amostra de cores",
    transparent: "transparente",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "pt-PT": {
    colorPicker: "Seletor de cores",
    twoDimensionalSlider: "Controle deslizante 2D",
    colorSwatch: "amostra de cor",
    transparent: "transparente",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "ro-RO": {
    colorPicker: "Selector de culori",
    twoDimensionalSlider: "Glisor 2D",
    colorSwatch: "specimen de culoare",
    transparent: "transparent",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "ru-RU": {
    colorPicker: "Палитра цветов",
    twoDimensionalSlider: "Ползунок 2D",
    colorSwatch: "цветовой образец",
    transparent: "прозрачный",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "sk-SK": {
    colorPicker: "Výber farieb",
    twoDimensionalSlider: "2D jazdec",
    colorSwatch: "vzorkovník farieb",
    transparent: "transparentný",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "sl-SI": {
    colorPicker: "Izbirnik barv",
    twoDimensionalSlider: "2D drsnik",
    colorSwatch: "barvna paleta",
    transparent: "prozorno",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "sr-SP": {
    colorPicker: "Birač boja",
    twoDimensionalSlider: "2D klizač",
    colorSwatch: "Uzorak boje",
    transparent: "providno",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "sv-SE": {
    colorPicker: "Färgväljaren",
    twoDimensionalSlider: "2D-reglage",
    colorSwatch: "färgruta",
    transparent: "genomskinlig",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "tr-TR": {
    colorPicker: "Renk Seçici",
    twoDimensionalSlider: "2D sürgü",
    colorSwatch: "renk örneği",
    transparent: "saydam",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "uk-UA": {
    colorPicker: "Палітра кольорів",
    twoDimensionalSlider: "Повзунок 2D",
    colorSwatch: "зразок кольору",
    transparent: "прозорий",
    colorNameAndValue: (args) => `${args?.name}: ${args?.value}`,
    colorInputLabel: (args) => `${args?.label}, ${args?.channelLabel}`,
  },
  "zh-CN": {
    colorPicker: "拾色器",
    twoDimensionalSlider: "2D 滑块",
    colorSwatch: "颜色色板",
    transparent: "透明",
    colorNameAndValue: (args) => `${args?.name}：${args?.value}`,
    colorInputLabel: (args) => `${args?.label}、${args?.channelLabel}`,
  },
  "zh-TW": {
    colorPicker: "檢色器",
    twoDimensionalSlider: "2D 滑桿",
    colorSwatch: "色票",
    transparent: "透明",
    colorNameAndValue: (args) => `${args?.name}：${args?.value}`,
    colorInputLabel: (args) => `${args?.label}，${args?.channelLabel}`,
  },
};

/**
 * Reactive color string formatter for the current locale. Mirrors upstream
 * `useLocalizedStringFormatter(intlMessages, '@react-aria/color')`.
 */
export function createColorStringFormatter() {
  return createStringFormatter(colorIntlStrings, "@react-aria/color");
}
