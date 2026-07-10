/**
 * Drag and Drop internationalization strings.
 *
 * Copied verbatim from @react-aria/dnd (react-aria 3.50 / RAC 1.19) intl/dnd.
 * All keys are plain ICU MessageFormat strings (no compiled announcement
 * functions), so the port's LocalizedStringFormatter consumes them directly.
 */

import type { LocalizedString, LocalizedStrings } from "@internationalized/string";

import arAE from "./ar-AE.json" with { type: "json" };
import bgBG from "./bg-BG.json" with { type: "json" };
import csCZ from "./cs-CZ.json" with { type: "json" };
import daDK from "./da-DK.json" with { type: "json" };
import deDE from "./de-DE.json" with { type: "json" };
import elGR from "./el-GR.json" with { type: "json" };
import enUS from "./en-US.json" with { type: "json" };
import esES from "./es-ES.json" with { type: "json" };
import etEE from "./et-EE.json" with { type: "json" };
import fiFI from "./fi-FI.json" with { type: "json" };
import frFR from "./fr-FR.json" with { type: "json" };
import heIL from "./he-IL.json" with { type: "json" };
import hrHR from "./hr-HR.json" with { type: "json" };
import huHU from "./hu-HU.json" with { type: "json" };
import itIT from "./it-IT.json" with { type: "json" };
import jaJP from "./ja-JP.json" with { type: "json" };
import koKR from "./ko-KR.json" with { type: "json" };
import ltLT from "./lt-LT.json" with { type: "json" };
import lvLV from "./lv-LV.json" with { type: "json" };
import nbNO from "./nb-NO.json" with { type: "json" };
import nlNL from "./nl-NL.json" with { type: "json" };
import plPL from "./pl-PL.json" with { type: "json" };
import ptBR from "./pt-BR.json" with { type: "json" };
import ptPT from "./pt-PT.json" with { type: "json" };
import roRO from "./ro-RO.json" with { type: "json" };
import ruRU from "./ru-RU.json" with { type: "json" };
import skSK from "./sk-SK.json" with { type: "json" };
import slSI from "./sl-SI.json" with { type: "json" };
import srSP from "./sr-SP.json" with { type: "json" };
import svSE from "./sv-SE.json" with { type: "json" };
import trTR from "./tr-TR.json" with { type: "json" };
import ukUA from "./uk-UA.json" with { type: "json" };
import zhCN from "./zh-CN.json" with { type: "json" };
import zhTW from "./zh-TW.json" with { type: "json" };

export type DndIntlStrings = {
  dragItem: string;
  dragSelectedItems: string;
  dragDescriptionKeyboard: string;
  dragDescriptionKeyboardAlt: string;
  dragDescriptionTouch: string;
  dragDescriptionVirtual: string;
  dragDescriptionLongPress: string;
  dragSelectedKeyboard: string;
  dragSelectedKeyboardAlt: string;
  dragSelectedLongPress: string;
  dragStartedKeyboard: string;
  dragStartedTouch: string;
  dragStartedVirtual: string;
  endDragKeyboard: string;
  endDragTouch: string;
  endDragVirtual: string;
  dropDescriptionKeyboard: string;
  dropDescriptionTouch: string;
  dropDescriptionVirtual: string;
  dropCanceled: string;
  dropComplete: string;
  dropIndicator: string;
  dropOnRoot: string;
  dropOnItem: string;
  insertBefore: string;
  insertBetween: string;
  insertAfter: string;
};

// `@internationalized/string`'s LocalizedStringFormatter only interpolates
// variables when a message is a FUNCTION — a plain ICU-template string is
// returned verbatim (`{itemText}` and friends never substituted). Upstream
// react-aria compiles its intl JSON into functions at build time
// (`@internationalized/string-compiler`); this port ships the raw JSON, so we
// compile the SIMPLE `{var}` placeholders here at module load (mirroring the
// hand-authored function forms in the color intl catalog). ICU plural/select
// messages (any `{…,…}` group, e.g. `dragSelectedItems`) are left as strings —
// they need the full ICU engine and are unused by the single-key drag path.
const SIMPLE_PLACEHOLDER = /\{(\w+)\}/g;
function compileSimpleIcu(message: string): LocalizedString {
  if (!SIMPLE_PLACEHOLDER.test(message)) return message;
  // Reset lastIndex (test() with /g advances it) before the plural probe.
  SIMPLE_PLACEHOLDER.lastIndex = 0;
  // Any comma inside a placeholder means real ICU (plural/select) — leave as-is.
  if (/\{[^{}]*,[^{}]*\}/.test(message)) return message;
  return (args?: Record<string, unknown>): string =>
    message.replace(SIMPLE_PLACEHOLDER, (_match, key: string) => String(args?.[key] ?? ""));
}

function compileLocale(strings: Record<string, string>): Record<string, LocalizedString> {
  const out: Record<string, LocalizedString> = {};
  for (const key of Object.keys(strings)) {
    out[key] = compileSimpleIcu(strings[key]);
  }
  return out;
}

export const dndIntlStrings: LocalizedStrings<keyof DndIntlStrings, LocalizedString> = {
  "ar-AE": compileLocale(arAE),
  "bg-BG": compileLocale(bgBG),
  "cs-CZ": compileLocale(csCZ),
  "da-DK": compileLocale(daDK),
  "de-DE": compileLocale(deDE),
  "el-GR": compileLocale(elGR),
  "en-US": compileLocale(enUS),
  "es-ES": compileLocale(esES),
  "et-EE": compileLocale(etEE),
  "fi-FI": compileLocale(fiFI),
  "fr-FR": compileLocale(frFR),
  "he-IL": compileLocale(heIL),
  "hr-HR": compileLocale(hrHR),
  "hu-HU": compileLocale(huHU),
  "it-IT": compileLocale(itIT),
  "ja-JP": compileLocale(jaJP),
  "ko-KR": compileLocale(koKR),
  "lt-LT": compileLocale(ltLT),
  "lv-LV": compileLocale(lvLV),
  "nb-NO": compileLocale(nbNO),
  "nl-NL": compileLocale(nlNL),
  "pl-PL": compileLocale(plPL),
  "pt-BR": compileLocale(ptBR),
  "pt-PT": compileLocale(ptPT),
  "ro-RO": compileLocale(roRO),
  "ru-RU": compileLocale(ruRU),
  "sk-SK": compileLocale(skSK),
  "sl-SI": compileLocale(slSI),
  "sr-SP": compileLocale(srSP),
  "sv-SE": compileLocale(svSE),
  "tr-TR": compileLocale(trTR),
  "uk-UA": compileLocale(ukUA),
  "zh-CN": compileLocale(zhCN),
  "zh-TW": compileLocale(zhTW),
};
