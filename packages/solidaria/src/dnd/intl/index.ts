// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/ar-AE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/bg-BG.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/cs-CZ.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/da-DK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/de-DE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/el-GR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/en-US.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/es-ES.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/et-EE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/fi-FI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/fr-FR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/he-IL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/hr-HR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/hu-HU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/it-IT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/ja-JP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/ko-KR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/lt-LT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/lv-LV.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/nb-NO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/nl-NL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/pl-PL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/pt-BR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/pt-PT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/ro-RO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/ru-RU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/sk-SK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/sl-SI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/sr-SP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/sv-SE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/tr-TR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/uk-UA.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/zh-CN.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/dnd/zh-TW.json

// Ported from @react-aria/dnd intl catalog.

/**
 * Drag and Drop internationalization strings.
 *
 * Copied verbatim from @react-aria/dnd (react-aria 3.50 / RAC 1.19) intl/dnd.
 * All keys are plain ICU MessageFormat strings; createStringFormatter compiles
 * the ones with arguments on first use (i18n/compileIcu.ts), so the JSON
 * stays byte-identical to upstream. LocalizedStringDictionary resolves the
 * locale fallback chain (locale → language → sibling region → en-US).
 */

import type { LocalizedStrings } from "@internationalized/string";

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

export const dndIntlStrings: LocalizedStrings<keyof DndIntlStrings, string> = {
  "ar-AE": arAE,
  "bg-BG": bgBG,
  "cs-CZ": csCZ,
  "da-DK": daDK,
  "de-DE": deDE,
  "el-GR": elGR,
  "en-US": enUS,
  "es-ES": esES,
  "et-EE": etEE,
  "fi-FI": fiFI,
  "fr-FR": frFR,
  "he-IL": heIL,
  "hr-HR": hrHR,
  "hu-HU": huHU,
  "it-IT": itIT,
  "ja-JP": jaJP,
  "ko-KR": koKR,
  "lt-LT": ltLT,
  "lv-LV": lvLV,
  "nb-NO": nbNO,
  "nl-NL": nlNL,
  "pl-PL": plPL,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "ro-RO": roRO,
  "ru-RU": ruRU,
  "sk-SK": skSK,
  "sl-SI": slSI,
  "sr-SP": srSP,
  "sv-SE": svSE,
  "tr-TR": trTR,
  "uk-UA": ukUA,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};
