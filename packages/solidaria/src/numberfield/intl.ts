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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/*.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/ar-AE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/bg-BG.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/cs-CZ.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/da-DK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/de-DE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/el-GR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/en-US.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/es-ES.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/et-EE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/fi-FI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/fr-FR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/he-IL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/hr-HR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/hu-HU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/it-IT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/ja-JP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/ko-KR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/lt-LT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/lv-LV.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/nb-NO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/nl-NL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/pl-PL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/pt-BR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/pt-PT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/ro-RO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/ru-RU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/sk-SK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/sl-SI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/sr-SP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/sv-SE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/tr-TR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/uk-UA.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/zh-CN.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/numberfield/zh-TW.json

import { LocalizedStringDictionary, type LocalizedStrings } from "@internationalized/string";

export type NumberFieldVariables = {
  fieldLabel?: string;
};

export type NumberFieldMessage = string | ((args: NumberFieldVariables | undefined) => string);

export type NumberFieldStringKey = "decrease" | "increase" | "numberField";

export const numberFieldStrings: LocalizedStrings<NumberFieldStringKey, NumberFieldMessage> = {
  "ar-AE": {
    decrease: (args) => `\u{62E}\u{641}\u{636} ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\u{632}\u{64A}\u{627}\u{62F}\u{629} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{62D}\u{642}\u{644} \u{631}\u{642}\u{645}\u{64A}`,
  },
  "bg-BG": {
    decrease: (args) =>
      `\u{41D}\u{430}\u{43C}\u{430}\u{43B}\u{44F}\u{432}\u{430}\u{43D}\u{435} ${args?.fieldLabel ?? ""}`,
    increase: (args) =>
      `\u{423}\u{441}\u{438}\u{43B}\u{432}\u{430}\u{43D}\u{435} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{41D}\u{43E}\u{43C}\u{435}\u{440} \u{43D}\u{430} \u{43F}\u{43E}\u{43B}\u{435}\u{442}\u{43E}`,
  },
  "cs-CZ": {
    decrease: (args) => `Sn\xed\u{17E}it ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Zv\xfd\u{161}it ${args?.fieldLabel ?? ""}`,
    numberField: `\u{10C}\xedseln\xe9 pole`,
  },
  "da-DK": {
    decrease: (args) => `Reducer ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\xd8g ${args?.fieldLabel ?? ""}`,
    numberField: `Talfelt`,
  },
  "de-DE": {
    decrease: (args) => `${args?.fieldLabel ?? ""} verringern`,
    increase: (args) => `${args?.fieldLabel ?? ""} erh\xf6hen`,
    numberField: `Nummernfeld`,
  },
  "el-GR": {
    decrease: (args) => `\u{39C}\u{3B5}\u{3AF}\u{3C9}\u{3C3}\u{3B7} ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\u{391}\u{3CD}\u{3BE}\u{3B7}\u{3C3}\u{3B7} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{3A0}\u{3B5}\u{3B4}\u{3AF}\u{3BF} \u{3B1}\u{3C1}\u{3B9}\u{3B8}\u{3BC}\u{3BF}\u{3CD}`,
  },
  "en-US": {
    decrease: (args) => `Decrease ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Increase ${args?.fieldLabel ?? ""}`,
    numberField: `Number field`,
  },
  "es-ES": {
    decrease: (args) => `Reducir ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Aumentar ${args?.fieldLabel ?? ""}`,
    numberField: `Campo de n\xfamero`,
  },
  "et-EE": {
    decrease: (args) => `V\xe4henda ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Suurenda ${args?.fieldLabel ?? ""}`,
    numberField: `Numbri v\xe4li`,
  },
  "fi-FI": {
    decrease: (args) => `V\xe4henn\xe4 ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Lis\xe4\xe4 ${args?.fieldLabel ?? ""}`,
    numberField: `Numerokentt\xe4`,
  },
  "fr-FR": {
    decrease: (args) => `Diminuer ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Augmenter ${args?.fieldLabel ?? ""}`,
    numberField: `Champ de nombre`,
  },
  "he-IL": {
    decrease: (args) => `\u{5D4}\u{5E7}\u{5D8}\u{5DF} ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\u{5D4}\u{5D2}\u{5D3}\u{5DC} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{5E9}\u{5D3}\u{5D4} \u{5DE}\u{5E1}\u{5E4}\u{5E8}`,
  },
  "hr-HR": {
    decrease: (args) => `Smanji ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Pove\u{107}aj ${args?.fieldLabel ?? ""}`,
    numberField: `Polje broja`,
  },
  "hu-HU": {
    decrease: (args) => `${args?.fieldLabel ?? ""} cs\xf6kkent\xe9se`,
    increase: (args) => `${args?.fieldLabel ?? ""} n\xf6vel\xe9se`,
    numberField: `Sz\xe1mmez\u{151}`,
  },
  "it-IT": {
    decrease: (args) => `Riduci ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Aumenta ${args?.fieldLabel ?? ""}`,
    numberField: `Campo numero`,
  },
  "ja-JP": {
    decrease: (args) => `${args?.fieldLabel ?? ""}\u{3092}\u{7E2E}\u{5C0F}`,
    increase: (args) => `${args?.fieldLabel ?? ""}\u{3092}\u{62E1}\u{5927}`,
    numberField: `\u{6570}\u{5024}\u{30D5}\u{30A3}\u{30FC}\u{30EB}\u{30C9}`,
  },
  "ko-KR": {
    decrease: (args) => `${args?.fieldLabel ?? ""} \u{AC10}\u{C18C}`,
    increase: (args) => `${args?.fieldLabel ?? ""} \u{C99D}\u{AC00}`,
    numberField: `\u{BC88}\u{D638} \u{D544}\u{B4DC}`,
  },
  "lt-LT": {
    decrease: (args) => `Suma\u{17E}inti ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Padidinti ${args?.fieldLabel ?? ""}`,
    numberField: `Numerio laukas`,
  },
  "lv-LV": {
    decrease: (args) => `Samazin\u{101}\u{161}ana ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Palielin\u{101}\u{161}ana ${args?.fieldLabel ?? ""}`,
    numberField: `Skait\u{13C}u lauks`,
  },
  "nb-NO": {
    decrease: (args) => `Reduser ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\xd8k ${args?.fieldLabel ?? ""}`,
    numberField: `Tallfelt`,
  },
  "nl-NL": {
    decrease: (args) => `${args?.fieldLabel ?? ""} verlagen`,
    increase: (args) => `${args?.fieldLabel ?? ""} verhogen`,
    numberField: `Getalveld`,
  },
  "pl-PL": {
    decrease: (args) => `Zmniejsz ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Zwi\u{119}ksz ${args?.fieldLabel ?? ""}`,
    numberField: `Pole numeru`,
  },
  "pt-BR": {
    decrease: (args) => `Diminuir ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Aumentar ${args?.fieldLabel ?? ""}`,
    numberField: `Campo de n\xfamero`,
  },
  "pt-PT": {
    decrease: (args) => `Diminuir ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Aumentar ${args?.fieldLabel ?? ""}`,
    numberField: `Campo num\xe9rico`,
  },
  "ro-RO": {
    decrease: (args) => `Sc\u{103}dere ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Cre\u{219}tere ${args?.fieldLabel ?? ""}`,
    numberField: `C\xe2mp numeric`,
  },
  "ru-RU": {
    decrease: (args) =>
      `\u{423}\u{43C}\u{435}\u{43D}\u{44C}\u{448}\u{435}\u{43D}\u{438}\u{435} ${args?.fieldLabel ?? ""}`,
    increase: (args) =>
      `\u{423}\u{432}\u{435}\u{43B}\u{438}\u{447}\u{435}\u{43D}\u{438}\u{435} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{427}\u{438}\u{441}\u{43B}\u{43E}\u{432}\u{43E}\u{435} \u{43F}\u{43E}\u{43B}\u{435}`,
  },
  "sk-SK": {
    decrease: (args) => `Zn\xed\u{17E}i\u{165} ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Zv\xfd\u{161}i\u{165} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{10C}\xedseln\xe9 pole`,
  },
  "sl-SI": {
    decrease: (args) => `Upadati ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Pove\u{10D}ajte ${args?.fieldLabel ?? ""}`,
    numberField: `\u{160}tevil\u{10D}no polje`,
  },
  "sr-SP": {
    decrease: (args) => `Smanji ${args?.fieldLabel ?? ""}`,
    increase: (args) => `Pove\u{107}aj ${args?.fieldLabel ?? ""}`,
    numberField: `Polje broja`,
  },
  "sv-SE": {
    decrease: (args) => `Minska ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\xd6ka ${args?.fieldLabel ?? ""}`,
    numberField: `Nummerf\xe4lt`,
  },
  "tr-TR": {
    decrease: (args) => `${args?.fieldLabel ?? ""} azalt`,
    increase: (args) => `${args?.fieldLabel ?? ""} artt\u{131}r`,
    numberField: `Say\u{131} alan\u{131}`,
  },
  "uk-UA": {
    decrease: (args) =>
      `\u{417}\u{43C}\u{435}\u{43D}\u{448}\u{438}\u{442}\u{438} ${args?.fieldLabel ?? ""}`,
    increase: (args) =>
      `\u{417}\u{431}\u{456}\u{43B}\u{44C}\u{448}\u{438}\u{442}\u{438} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{41F}\u{43E}\u{43B}\u{435} \u{43D}\u{43E}\u{43C}\u{435}\u{440}\u{430}`,
  },
  "zh-CN": {
    decrease: (args) => `\u{964D}\u{4F4E} ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\u{63D0}\u{9AD8} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{6570}\u{5B57}\u{5B57}\u{6BB5}`,
  },
  "zh-TW": {
    decrease: (args) => `\u{7E2E}\u{5C0F} ${args?.fieldLabel ?? ""}`,
    increase: (args) => `\u{653E}\u{5927} ${args?.fieldLabel ?? ""}`,
    numberField: `\u{6578}\u{5B57}\u{6B04}\u{4F4D}`,
  },
};

export const numberFieldIntlStrings = numberFieldStrings;

export const numberFieldDictionary = new LocalizedStringDictionary(numberFieldStrings);
