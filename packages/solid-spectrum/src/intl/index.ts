import type { LocalizedStrings } from "@proyecto-viviana/solidaria";
import enUS from "./en-US.json" with { type: "json" };
import esES from "./es-ES.json" with { type: "json" };

export interface S2IntlStrings {
  "actionbar.actions": string;
  "actionbar.actionsAvailable": string;
  "actionbar.clearSelection": string;
  "actionbar.selected": string;
  "actionbar.selectedAll": string;
  "button.pending": string;
  "notificationbadge.indicatorOnly": string;
  "notificationbadge.plus": string;
}

export const s2IntlStrings: LocalizedStrings<keyof S2IntlStrings, string> = {
  "en-US": enUS,
  "es-ES": esES,
};
