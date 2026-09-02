// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/ar-AE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/bg-BG.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/cs-CZ.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/da-DK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/de-DE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/el-GR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/en-US.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/es-ES.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/et-EE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/fi-FI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/fr-FR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/he-IL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/hr-HR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/hu-HU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/it-IT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/ja-JP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/ko-KR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/lt-LT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/lv-LV.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/nb-NO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/nl-NL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/pl-PL.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/pt-BR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/pt-PT.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/ro-RO.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/ru-RU.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/sk-SK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/sl-SI.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/sr-SP.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/sv-SE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/tr-TR.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/uk-UA.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/zh-CN.json
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/intl/zh-TW.json

// Ported from @react-spectrum/s2 intl catalog.

/**
 * Spectrum 2 internationalization strings.
 *
 * Copied verbatim from @react-spectrum/s2 intl JSON (S2 1.7.0 / pin f56660b).
 * LocalizedStringDictionary resolves the locale fallback chain
 * (locale → language → sibling region → en-US).
 *
 * `@internationalized/string`'s LocalizedStringFormatter only interpolates
 * when a message is a FUNCTION — a plain ICU-template string is returned
 * verbatim. Upstream S2 compiles intl JSON at build time
 * (`@internationalized/string-compiler`); this port ships the raw JSON, so
 * `{var}`, `{var, number}`, and `{var, plural, …}` are compiled here at
 * module load (same reason as the solidaria dnd catalog's compileSimpleIcu).
 */

import type { LocalizedString, LocalizedStrings } from "@proyecto-viviana/solidaria";

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

export interface S2IntlStrings {
  "actionbar.actions": string;
  "actionbar.actionsAvailable": string;
  "actionbar.clearSelection": string;
  "actionbar.selected": string;
  "actionbar.selectedAll": string;
  "breadcrumbs.more": string;
  "button.pending": string;
  "calendar.invalidSelection": string;
  "combobox.noResults": string;
  "contextualhelp.help": string;
  "contextualhelp.info": string;
  "datepicker.endTime": string;
  "datepicker.startTime": string;
  "datepicker.time": string;
  "dialog.alert": string;
  "dialog.dismiss": string;
  "dropzone.replaceMessage": string;
  "inlinealert.informative": string;
  "inlinealert.negative": string;
  "inlinealert.notice": string;
  "inlinealert.positive": string;
  "label.(optional)": string;
  "label.(required)": string;
  "menu.moreActions": string;
  "menu.unavailable": string;
  "notificationbadge.indicatorOnly": string;
  "notificationbadge.plus": string;
  "picker.placeholder": string;
  "picker.selectedCount": string;
  "slider.maximum": string;
  "slider.minimum": string;
  "table.cancel": string;
  "table.drag": string;
  "table.editCell": string;
  "table.loading": string;
  "table.loadingMore": string;
  "table.resizeColumn": string;
  "table.save": string;
  "table.sortAscending": string;
  "table.sortDescending": string;
  "tag.actions": string;
  "tag.hideButtonLabel": string;
  "tag.noTags": string;
  "tag.showAllButtonLabel": string;
  "toast.clearAll": string;
  "toast.collapse": string;
  "toast.showAll": string;
}

type IcuArgs = Record<string, unknown> | undefined;
type IcuFormatter = {
  plural: (count: number, options: Record<string, string | (() => string)>) => string;
  number: (value: number) => string;
};

type Part =
  | { kind: "lit"; text: string }
  | { kind: "var"; name: string }
  | { kind: "num"; name: string }
  | { kind: "hash" }
  | { kind: "plural"; name: string; options: Record<string, Part[]> };

function parseMessage(source: string, start = 0): { parts: Part[]; index: number } {
  const parts: Part[] = [];
  let i = start;
  let lit = "";
  const flush = () => {
    if (lit) {
      parts.push({ kind: "lit", text: lit });
      lit = "";
    }
  };
  while (i < source.length) {
    const ch = source[i];
    if (ch === "{") {
      flush();
      const placeholder = parsePlaceholder(source, i);
      parts.push(placeholder.part);
      i = placeholder.index;
      continue;
    }
    if (ch === "}") break;
    lit += ch;
    i += 1;
  }
  flush();
  return { parts, index: i };
}

function parsePlaceholder(source: string, open: number): { part: Part; index: number } {
  let i = open + 1;
  while (source[i] === " ") i += 1;
  let name = "";
  while (i < source.length && /[\w]/.test(source[i]!)) {
    name += source[i];
    i += 1;
  }
  while (source[i] === " ") i += 1;
  if (source[i] === "}") {
    return { part: { kind: "var", name }, index: i + 1 };
  }
  if (source[i] !== ",") {
    throw new Error(`S2 intl: expected ',' or '}' in "${source}"`);
  }
  i += 1;
  while (source[i] === " ") i += 1;
  let type = "";
  while (i < source.length && /[a-z]/.test(source[i]!)) {
    type += source[i];
    i += 1;
  }
  if (type === "number") {
    while (source[i] === " ") i += 1;
    if (source[i] !== "}") {
      throw new Error(`S2 intl: unclosed {${name}, number} in "${source}"`);
    }
    return { part: { kind: "num", name }, index: i + 1 };
  }
  if (type !== "plural") {
    throw new Error(`S2 intl: unsupported ICU type "${type}" in "${source}"`);
  }
  if (source[i] !== ",") {
    throw new Error(`S2 intl: expected ',' after plural in "${source}"`);
  }
  i += 1;
  const options: Record<string, Part[]> = {};
  while (i < source.length) {
    while (source[i] === " ") i += 1;
    if (source[i] === "}") {
      return { part: { kind: "plural", name, options }, index: i + 1 };
    }
    let selector = "";
    if (source[i] === "=") {
      selector = "=";
      i += 1;
      while (/\d/.test(source[i]!)) {
        selector += source[i];
        i += 1;
      }
    } else {
      while (/[a-z]/.test(source[i]!)) {
        selector += source[i];
        i += 1;
      }
    }
    while (source[i] === " ") i += 1;
    if (source[i] !== "{") {
      throw new Error(`S2 intl: expected '{' for plural selector "${selector}" in "${source}"`);
    }
    const inner = parseMessage(source, i + 1);
    options[selector] = splitHash(inner.parts);
    i = inner.index;
    if (source[i] !== "}") {
      throw new Error(`S2 intl: unclosed plural option "${selector}" in "${source}"`);
    }
    i += 1;
  }
  throw new Error(`S2 intl: unclosed plural in "${source}"`);
}

function splitHash(parts: Part[]): Part[] {
  const out: Part[] = [];
  for (const part of parts) {
    if (part.kind !== "lit" || !part.text.includes("#")) {
      out.push(part);
      continue;
    }
    const chunks = part.text.split("#");
    chunks.forEach((chunk, idx) => {
      if (chunk) out.push({ kind: "lit", text: chunk });
      if (idx < chunks.length - 1) out.push({ kind: "hash" });
    });
  }
  return out;
}

function render(parts: Part[], args: IcuArgs, formatter: IcuFormatter, hashValue?: number): string {
  let out = "";
  for (const part of parts) {
    switch (part.kind) {
      case "lit":
        out += part.text;
        break;
      case "var":
        out += String(args?.[part.name] ?? "");
        break;
      case "num":
        out += formatter.number(Number(args?.[part.name]));
        break;
      case "hash":
        out += formatter.number(hashValue ?? 0);
        break;
      case "plural": {
        const count = Number(args?.[part.name]);
        const options: Record<string, () => string> = {};
        for (const [selector, inner] of Object.entries(part.options)) {
          options[selector] = () => render(inner, args, formatter, count);
        }
        out += formatter.plural(count, options);
        break;
      }
    }
  }
  return out;
}

function compileIcu(message: string): LocalizedString {
  if (!message.includes("{")) return message;
  const { parts } = parseMessage(message);
  return (args, formatter) => render(parts, args as IcuArgs, formatter as unknown as IcuFormatter);
}

function compileLocale(strings: Record<string, string>): Record<string, LocalizedString> {
  const out: Record<string, LocalizedString> = {};
  for (const key of Object.keys(strings)) {
    out[key] = compileIcu(strings[key]!);
  }
  return out;
}

export const s2IntlStrings: LocalizedStrings<keyof S2IntlStrings, LocalizedString> = {
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
