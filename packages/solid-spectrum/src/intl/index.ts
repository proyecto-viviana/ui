import type { LocalizedString, LocalizedStrings } from "@proyecto-viviana/solidaria";
import enUS from "./en-US.json" with { type: "json" };
import esES from "./es-ES.json" with { type: "json" };

export interface S2IntlStrings {
  "actionbar.actions": string;
  "actionbar.actionsAvailable": string;
  "actionbar.clearSelection": string;
  "actionbar.selected": LocalizedString;
  "actionbar.selectedAll": string;
  "button.pending": string;
  "breadcrumbs.more": string;
  "contextualhelp.help": string;
  "contextualhelp.info": string;
  "dialog.dismiss": string;
  "dropzone.replaceMessage": string;
  "inlinealert.informative": string;
  "inlinealert.positive": string;
  "inlinealert.notice": string;
  "inlinealert.negative": string;
  "menu.moreActions": string;
  "menu.unavailable": string;
  "notificationbadge.indicatorOnly": string;
  "notificationbadge.plus": LocalizedString;
  "table.cancel": string;
  "table.editCell": string;
  "table.save": string;
  "toast.clearAll": string;
  "toast.collapse": string;
  "toast.showAll": string;
}

function variable(
  variables: Record<string, string | number | boolean> | undefined,
  key: string,
): string {
  return String(variables?.[key] ?? `{${key}}`);
}

export const s2IntlStrings: LocalizedStrings<keyof S2IntlStrings, LocalizedString> = {
  "en-US": {
    ...enUS,
    "actionbar.selected": (variables) => `${variable(variables, "count")} selected`,
    "notificationbadge.plus": (variables) => `${variable(variables, "notifications")}+`,
  },
  "es-ES": {
    ...esES,
    "actionbar.selected": (variables) => `${variable(variables, "count")} seleccionados`,
    "notificationbadge.plus": (variables) => `${variable(variables, "notifications")}+`,
  },
};
