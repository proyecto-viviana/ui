// @ts-nocheck

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/ar-AE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/bg-BG.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/cs-CZ.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/da-DK.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/de-DE.json
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/intl/combobox/el-GR.json
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

// The announcement functions call the formatter's protected plural/number/select
// helpers (as upstream's own compiled bundle does), which strict TS rejects from
// outside the class. This file is not hand-maintained; regenerate from upstream.
/**
 * ComboBox internationalization strings — full upstream locale set.
 *
 * Generated verbatim from @react-aria/combobox/dist/<locale>.mjs (RAC 1.19 /
 * @react-aria/combobox 3.14.2). Do not hand-edit; regenerate from upstream.
 *
 * Announcement keys (focus/count/selected) are LocalizedString FUNCTIONS,
 * matching upstream's compiled form; the port's LocalizedStringFormatter (from
 * @internationalized/string) invokes them identically. Label keys are strings.
 *
 * en-US and es-ES are intentionally omitted here — index.ts sources those from
 * the hand-authored ICU-string JSON so their proven output/tests stay intact.
 *
 * The complete 32-file source set is recorded in
 * scripts/attribution-composite-reviews.json.
 */

import type { LocalizedString, LocalizedStrings } from "@internationalized/string";

/* eslint-disable */
/* prettier-ignore */
export const generatedComboBoxLocales: LocalizedStrings<
  "focusAnnouncement" | "countAnnouncement" | "selectedAnnouncement" | "buttonLabel" | "listboxLabel",
  LocalizedString
> = {
  "ar-AE": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{627}\u{644}\u{645}\u{62C}\u{645}\u{648}\u{639}\u{629} \u{627}\u{644}\u{645}\u{62F}\u{62E}\u{644}\u{629} ${args.groupTitle}, \u{645}\u{639} ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{62E}\u{64A}\u{627}\u{631}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{62E}\u{64A}\u{627}\u{631}\u{627}\u{62A}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{645}\u{62D}\u{62F}\u{62F}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{62E}\u{64A}\u{627}\u{631}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{62E}\u{64A}\u{627}\u{631}\u{627}\u{62A}`
            })} \u{645}\u{62A}\u{627}\u{62D}\u{629}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}\u{60C} \u{645}\u{62D}\u{62F}\u{62F}`,
    "buttonLabel": "عرض المقترحات",
    "listboxLabel": "مقترحات",
  },
  "bg-BG": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{412}\u{44A}\u{432}\u{435}\u{434}\u{435}\u{43D}\u{430} \u{433}\u{440}\u{443}\u{43F}\u{430} ${args.groupTitle}, \u{441} ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{43E}\u{43F}\u{446}\u{438}\u{44F}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{43E}\u{43F}\u{446}\u{438}\u{438}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{438}\u{437}\u{431}\u{440}\u{430}\u{43D}\u{438}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{43E}\u{43F}\u{446}\u{438}\u{44F}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{43E}\u{43F}\u{446}\u{438}\u{438}`
            })} \u{43D}\u{430} \u{440}\u{430}\u{437}\u{43F}\u{43E}\u{43B}\u{43E}\u{436}\u{435}\u{43D}\u{438}\u{435}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{438}\u{437}\u{431}\u{440}\u{430}\u{43D}\u{438}`,
    "buttonLabel": "Покажи предложения",
    "listboxLabel": "Предложения",
  },
  "cs-CZ": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Zadan\xe1 skupina \u{201E}${args.groupTitle}\u{201C} ${formatter.plural(args.groupCount, {
                        one: ()=>`s ${formatter.number(args.groupCount)} mo\u{17E}nost\xed`,
                        other: ()=>`se ${formatter.number(args.groupCount)} mo\u{17E}nostmi`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: ` (vybr\xe1no)`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`K dispozici ${formatter.plural(args.optionCount, {
                one: ()=>`je ${formatter.number(args.optionCount)} mo\u{17E}nost`,
                other: ()=>`jsou/je ${formatter.number(args.optionCount)} mo\u{17E}nosti/-\xed`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, vybr\xe1no`,
    "buttonLabel": "Zobrazit doporučení",
    "listboxLabel": "Návrhy",
  },
  "da-DK": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Angivet gruppe ${args.groupTitle}, med ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} mulighed`,
                        other: ()=>`${formatter.number(args.groupCount)} muligheder`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, valgt`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} mulighed tilg\xe6ngelig`,
                other: ()=>`${formatter.number(args.optionCount)} muligheder tilg\xe6ngelige`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, valgt`,
    "buttonLabel": "Vis forslag",
    "listboxLabel": "Forslag",
  },
  "de-DE": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Eingetretene Gruppe ${args.groupTitle}, mit ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} Option`,
                        other: ()=>`${formatter.number(args.groupCount)} Optionen`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, ausgew\xe4hlt`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} Option`,
                other: ()=>`${formatter.number(args.optionCount)} Optionen`
            })} verf\xfcgbar.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, ausgew\xe4hlt`,
    "buttonLabel": "Empfehlungen anzeigen",
    "listboxLabel": "Empfehlungen",
  },
  "el-GR": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{395}\u{3B9}\u{3C3}\u{3B1}\u{3B3}\u{3BC}\u{3AD}\u{3BD}\u{3B7} \u{3BF}\u{3BC}\u{3AC}\u{3B4}\u{3B1} ${args.groupTitle}, \u{3BC}\u{3B5} ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{3B5}\u{3C0}\u{3B9}\u{3BB}\u{3BF}\u{3B3}\u{3AE}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{3B5}\u{3C0}\u{3B9}\u{3BB}\u{3BF}\u{3B3}\u{3AD}\u{3C2}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{3B5}\u{3C0}\u{3B9}\u{3BB}\u{3B5}\u{3B3}\u{3BC}\u{3AD}\u{3BD}\u{3BF}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{3B5}\u{3C0}\u{3B9}\u{3BB}\u{3BF}\u{3B3}\u{3AE}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{3B5}\u{3C0}\u{3B9}\u{3BB}\u{3BF}\u{3B3}\u{3AD}\u{3C2} `
            })} \u{3B4}\u{3B9}\u{3B1}\u{3B8}\u{3AD}\u{3C3}\u{3B9}\u{3BC}\u{3B5}\u{3C2}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{3B5}\u{3C0}\u{3B9}\u{3BB}\u{3AD}\u{3C7}\u{3B8}\u{3B7}\u{3BA}\u{3B5}`,
    "buttonLabel": "Προβολή προτάσεων",
    "listboxLabel": "Προτάσεις",
  },
  "et-EE": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Sisestatud r\xfchm ${args.groupTitle}, valikuga ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} valik`,
                        other: ()=>`${formatter.number(args.groupCount)} valikud`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, valitud`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} valik`,
                other: ()=>`${formatter.number(args.optionCount)} valikud`
            })} saadaval.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, valitud`,
    "buttonLabel": "Kuva soovitused",
    "listboxLabel": "Soovitused",
  },
  "fi-FI": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Mentiin ryhm\xe4\xe4n ${args.groupTitle}, ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} vaihtoehdon`,
                        other: ()=>`${formatter.number(args.groupCount)} vaihtoehdon`
                    })} kanssa.`,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, valittu`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} vaihtoehto`,
                other: ()=>`${formatter.number(args.optionCount)} vaihtoehdot`
            })} saatavilla.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, valittu`,
    "buttonLabel": "Näytä ehdotukset",
    "listboxLabel": "Ehdotukset",
  },
  "fr-FR": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Groupe ${args.groupTitle} rejoint, avec ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} option`,
                        other: ()=>`${formatter.number(args.groupCount)} options`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, s\xe9lectionn\xe9(s)`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} option`,
                other: ()=>`${formatter.number(args.optionCount)} options`
            })} disponible(s).`,
    "selectedAnnouncement": (args)=>`${args.optionText}, s\xe9lectionn\xe9`,
    "buttonLabel": "Afficher les suggestions",
    "listboxLabel": "Suggestions",
  },
  "he-IL": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{5E0}\u{5DB}\u{5E0}\u{5E1} \u{5DC}\u{5E7}\u{5D1}\u{5D5}\u{5E6}\u{5D4} ${args.groupTitle}, \u{5E2}\u{5DD} ${formatter.plural(args.groupCount, {
                        one: ()=>`\u{5D0}\u{5E4}\u{5E9}\u{5E8}\u{5D5}\u{5EA} ${formatter.number(args.groupCount)}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{5D0}\u{5E4}\u{5E9}\u{5E8}\u{5D5}\u{5D9}\u{5D5}\u{5EA}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{5E0}\u{5D1}\u{5D7}\u{5E8}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`\u{5D0}\u{5E4}\u{5E9}\u{5E8}\u{5D5}\u{5EA} ${formatter.number(args.optionCount)}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{5D0}\u{5E4}\u{5E9}\u{5E8}\u{5D5}\u{5D9}\u{5D5}\u{5EA}`
            })} \u{5D1}\u{5DE}\u{5E6}\u{5D1} \u{5D6}\u{5DE}\u{5D9}\u{5DF}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{5E0}\u{5D1}\u{5D7}\u{5E8}`,
    "buttonLabel": "הצג הצעות",
    "listboxLabel": "הצעות",
  },
  "hr-HR": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Unesena skupina ${args.groupTitle}, s ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} opcijom`,
                        other: ()=>`${formatter.number(args.groupCount)} opcije/a`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, odabranih`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`Dostupno jo\u{161}: ${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} opcija`,
                other: ()=>`${formatter.number(args.optionCount)} opcije/a`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, odabrano`,
    "buttonLabel": "Prikaži prijedloge",
    "listboxLabel": "Prijedlozi",
  },
  "hu-HU": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Bel\xe9pett a(z) ${args.groupTitle} csoportba, amely ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} lehet\u{151}s\xe9get`,
                        other: ()=>`${formatter.number(args.groupCount)} lehet\u{151}s\xe9get`
                    })} tartalmaz. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, kijel\xf6lve`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} lehet\u{151}s\xe9g`,
                other: ()=>`${formatter.number(args.optionCount)} lehet\u{151}s\xe9g`
            })} \xe1ll rendelkez\xe9sre.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, kijel\xf6lve`,
    "buttonLabel": "Javaslatok megjelenítése",
    "listboxLabel": "Javaslatok",
  },
  "it-IT": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Ingresso nel gruppo ${args.groupTitle}, con ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} opzione`,
                        other: ()=>`${formatter.number(args.groupCount)} opzioni`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, selezionato`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} opzione disponibile`,
                other: ()=>`${formatter.number(args.optionCount)} opzioni disponibili`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, selezionato`,
    "buttonLabel": "Mostra suggerimenti",
    "listboxLabel": "Suggerimenti",
  },
  "ja-JP": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{5165}\u{529B}\u{3055}\u{308C}\u{305F}\u{30B0}\u{30EB}\u{30FC}\u{30D7} ${args.groupTitle}\u{3001}${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{500B}\u{306E}\u{30AA}\u{30D7}\u{30B7}\u{30E7}\u{30F3}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{500B}\u{306E}\u{30AA}\u{30D7}\u{30B7}\u{30E7}\u{30F3}`
                    })}\u{3092}\u{542B}\u{3080}\u{3002}`,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `\u{3001}\u{9078}\u{629E}\u{6E08}\u{307F}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{500B}\u{306E}\u{30AA}\u{30D7}\u{30B7}\u{30E7}\u{30F3}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{500B}\u{306E}\u{30AA}\u{30D7}\u{30B7}\u{30E7}\u{30F3}`
            })}\u{3092}\u{5229}\u{7528}\u{3067}\u{304D}\u{307E}\u{3059}\u{3002}`,
    "selectedAnnouncement": (args)=>`${args.optionText}\u{3001}\u{9078}\u{629E}\u{6E08}\u{307F}`,
    "buttonLabel": "候補を表示",
    "listboxLabel": "候補",
  },
  "ko-KR": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{C785}\u{B825}\u{D55C} \u{ADF8}\u{B8F9} ${args.groupTitle}, ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)}\u{AC1C} \u{C635}\u{C158}`,
                        other: ()=>`${formatter.number(args.groupCount)}\u{AC1C} \u{C635}\u{C158}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{C120}\u{D0DD}\u{B428}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)}\u{AC1C} \u{C635}\u{C158}`,
                other: ()=>`${formatter.number(args.optionCount)}\u{AC1C} \u{C635}\u{C158}`
            })}\u{C744} \u{C0AC}\u{C6A9}\u{D560} \u{C218} \u{C788}\u{C2B5}\u{B2C8}\u{B2E4}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{C120}\u{D0DD}\u{B428}`,
    "buttonLabel": "제안 사항 표시",
    "listboxLabel": "제안",
  },
  "lt-LT": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{12E}vesta grup\u{117} ${args.groupTitle}, su ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} parinktimi`,
                        other: ()=>`${formatter.number(args.groupCount)} parinktimis (-i\u{173})`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, pasirinkta`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`Yra ${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} parinktis`,
                other: ()=>`${formatter.number(args.optionCount)} parinktys (-i\u{173})`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, pasirinkta`,
    "buttonLabel": "Rodyti pasiūlymus",
    "listboxLabel": "Pasiūlymai",
  },
  "lv-LV": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Ievad\u{12B}ta grupa ${args.groupTitle}, ar ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} opciju`,
                        other: ()=>`${formatter.number(args.groupCount)} opcij\u{101}m`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, atlas\u{12B}ta`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`Pieejamo opciju skaits: ${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} opcija`,
                other: ()=>`${formatter.number(args.optionCount)} opcijas`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, atlas\u{12B}ta`,
    "buttonLabel": "Rādīt ieteikumus",
    "listboxLabel": "Ieteikumi",
  },
  "nb-NO": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Angitt gruppe ${args.groupTitle}, med ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} alternativ`,
                        other: ()=>`${formatter.number(args.groupCount)} alternativer`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, valgt`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} alternativ`,
                other: ()=>`${formatter.number(args.optionCount)} alternativer`
            })} finnes.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, valgt`,
    "buttonLabel": "Vis forslag",
    "listboxLabel": "Forslag",
  },
  "nl-NL": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Groep ${args.groupTitle} ingevoerd met ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} optie`,
                        other: ()=>`${formatter.number(args.groupCount)} opties`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, geselecteerd`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} optie`,
                other: ()=>`${formatter.number(args.optionCount)} opties`
            })} beschikbaar.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, geselecteerd`,
    "buttonLabel": "Suggesties weergeven",
    "listboxLabel": "Suggesties",
  },
  "pl-PL": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Do\u{142}\u{105}czono do grupy ${args.groupTitle}, z ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} opcj\u{105}`,
                        other: ()=>`${formatter.number(args.groupCount)} opcjami`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, wybrano`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`dost\u{119}pna/dost\u{119}pne(-nych) ${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} opcja`,
                other: ()=>`${formatter.number(args.optionCount)} opcje(-i)`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, wybrano`,
    "buttonLabel": "Wyświetlaj sugestie",
    "listboxLabel": "Sugestie",
  },
  "pt-BR": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Grupo inserido ${args.groupTitle}, com ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} op\xe7\xe3o`,
                        other: ()=>`${formatter.number(args.groupCount)} op\xe7\xf5es`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, selecionado`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} op\xe7\xe3o`,
                other: ()=>`${formatter.number(args.optionCount)} op\xe7\xf5es`
            })} dispon\xedvel.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, selecionado`,
    "buttonLabel": "Mostrar sugestões",
    "listboxLabel": "Sugestões",
  },
  "pt-PT": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Grupo introduzido ${args.groupTitle}, com ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} op\xe7\xe3o`,
                        other: ()=>`${formatter.number(args.groupCount)} op\xe7\xf5es`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, selecionado`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} op\xe7\xe3o`,
                other: ()=>`${formatter.number(args.optionCount)} op\xe7\xf5es`
            })} dispon\xedvel.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, selecionado`,
    "buttonLabel": "Apresentar sugestões",
    "listboxLabel": "Sugestões",
  },
  "ro-RO": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Grup ${args.groupTitle} introdus, cu ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} op\u{21B}iune`,
                        other: ()=>`${formatter.number(args.groupCount)} op\u{21B}iuni`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, selectat`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} op\u{21B}iune`,
                other: ()=>`${formatter.number(args.optionCount)} op\u{21B}iuni`
            })} disponibile.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, selectat`,
    "buttonLabel": "Afișare sugestii",
    "listboxLabel": "Sugestii",
  },
  "ru-RU": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{412}\u{432}\u{435}\u{434}\u{435}\u{43D}\u{43D}\u{430}\u{44F} \u{433}\u{440}\u{443}\u{43F}\u{43F}\u{430} ${args.groupTitle}, \u{441} ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}\u{43E}\u{43C}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}\u{430}\u{43C}\u{438}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{432}\u{44B}\u{431}\u{440}\u{430}\u{43D}\u{43D}\u{44B}\u{43C}\u{438}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}\u{43E}\u{432}`
            })} \u{434}\u{43E}\u{441}\u{442}\u{443}\u{43F}\u{43D}\u{43E}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{432}\u{44B}\u{431}\u{440}\u{430}\u{43D}\u{43E}`,
    "buttonLabel": "Показать предложения",
    "listboxLabel": "Предложения",
  },
  "sk-SK": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Zadan\xe1 skupina ${args.groupTitle}, s ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} mo\u{17E}nos\u{165}ou`,
                        other: ()=>`${formatter.number(args.groupCount)} mo\u{17E}nos\u{165}ami`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, vybrat\xe9`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} mo\u{17E}nos\u{165}`,
                other: ()=>`${formatter.number(args.optionCount)} mo\u{17E}nosti/-\xed`
            })} k dispoz\xedcii.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, vybrat\xe9`,
    "buttonLabel": "Zobraziť návrhy",
    "listboxLabel": "Návrhy",
  },
  "sl-SI": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Vnesena skupina ${args.groupTitle}, z ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} opcija`,
                        other: ()=>`${formatter.number(args.groupCount)} opcije`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, izbrano`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`Na voljo je ${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} opcija`,
                other: ()=>`${formatter.number(args.optionCount)} opcije`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, izbrano`,
    "buttonLabel": "Prikaži predloge",
    "listboxLabel": "Predlogi",
  },
  "sr-SP": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Unesena grupa ${args.groupTitle}, s ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} opcijom`,
                        other: ()=>`${formatter.number(args.groupCount)} optione/a`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, izabranih`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`Dostupno jo\u{161}: ${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} opcija`,
                other: ()=>`${formatter.number(args.optionCount)} opcije/a`
            })}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, izabrano`,
    "buttonLabel": "Prikaži predloge",
    "listboxLabel": "Predlozi",
  },
  "sv-SE": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Ingick i gruppen ${args.groupTitle} med ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} alternativ`,
                        other: ()=>`${formatter.number(args.groupCount)} alternativ`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, valda`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} alternativ`,
                other: ()=>`${formatter.number(args.optionCount)} alternativ`
            })} tillg\xe4ngliga.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, valda`,
    "buttonLabel": "Visa förslag",
    "listboxLabel": "Förslag",
  },
  "tr-TR": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`Girilen grup ${args.groupTitle}, ile ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} se\xe7enek`,
                        other: ()=>`${formatter.number(args.groupCount)} se\xe7enekler`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, se\xe7ildi`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} se\xe7enek`,
                other: ()=>`${formatter.number(args.optionCount)} se\xe7enekler`
            })} kullan\u{131}labilir.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, se\xe7ildi`,
    "buttonLabel": "Önerileri göster",
    "listboxLabel": "Öneriler",
  },
  "uk-UA": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{412}\u{432}\u{435}\u{434}\u{435}\u{43D}\u{430} \u{433}\u{440}\u{443}\u{43F}\u{430} ${args.groupTitle}, \u{437} ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}\u{438}(-\u{456}\u{432})`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{432}\u{438}\u{431}\u{440}\u{430}\u{43D}\u{43E}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{43F}\u{430}\u{440}\u{430}\u{43C}\u{435}\u{442}\u{440}\u{438}(-\u{456}\u{432})`
            })} \u{434}\u{43E}\u{441}\u{442}\u{443}\u{43F}\u{43D}\u{43E}.`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{432}\u{438}\u{431}\u{440}\u{430}\u{43D}\u{43E}`,
    "buttonLabel": "Показати пропозиції",
    "listboxLabel": "Пропозиції",
  },
  "zh-CN": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{8FDB}\u{5165}\u{4E86} ${args.groupTitle} \u{7EC4}\u{FF0C}\u{5176}\u{4E2D}\u{6709} ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{4E2A}\u{9009}\u{9879}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{4E2A}\u{9009}\u{9879}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{5DF2}\u{9009}\u{62E9}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`\u{6709} ${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{4E2A}\u{9009}\u{9879}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{4E2A}\u{9009}\u{9879}`
            })}\u{53EF}\u{7528}\u{3002}`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{5DF2}\u{9009}\u{62E9}`,
    "buttonLabel": "显示建议",
    "listboxLabel": "建议",
  },
  "zh-TW": {
    "focusAnnouncement": (args, formatter)=>`${formatter.select({
                true: ()=>`\u{8F38}\u{5165}\u{7684}\u{7FA4}\u{7D44} ${args.groupTitle}, \u{6709} ${formatter.plural(args.groupCount, {
                        one: ()=>`${formatter.number(args.groupCount)} \u{9078}\u{9805}`,
                        other: ()=>`${formatter.number(args.groupCount)} \u{9078}\u{9805}`
                    })}. `,
                other: ``
            }, args.isGroupChange)}${args.optionText}${formatter.select({
                true: `, \u{5DF2}\u{9078}\u{53D6}`,
                other: ``
            }, args.isSelected)}`,
    "countAnnouncement": (args, formatter)=>`${formatter.plural(args.optionCount, {
                one: ()=>`${formatter.number(args.optionCount)} \u{9078}\u{9805}`,
                other: ()=>`${formatter.number(args.optionCount)} \u{9078}\u{9805}`
            })} \u{53EF}\u{7528}\u{3002}`,
    "selectedAnnouncement": (args)=>`${args.optionText}, \u{5DF2}\u{9078}\u{53D6}`,
    "buttonLabel": "顯示建議",
    "listboxLabel": "建議",
  },
};
