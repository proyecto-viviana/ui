---
id: 284
type: task
title: "Localize the Popover dismiss button from the overlays catalog"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 daterangepicker functional pass: locale=fr-FR names React Dismiss Rejeter and Solid Dismiss; Previous/Next already Précédent/Suivant on both",
    }
---

RAC `DismissButton` labels itself with the overlays catalog
(`react-aria/src/overlays/DismissButton.tsx:32-34`,
`stringFormatter.format('dismiss')`). fr-FR is `"Rejeter"`.

Solid `PopoverDismissButton` hardcodes `aria-label="Dismiss"`
(`packages/solidaria-components/src/Popover.tsx:232-236`). The overlays
catalog is already ported — `packages/solidaria/src/overlays/intl/fr-FR.json`
`"dismiss": "Rejeter"` — and unused here. Calendar Previous/Next already
go through the calendar catalog, so only Dismiss stays English.

## Evidence

`http://127.0.0.1:4341/components/daterangepicker/?value=2025-02-03/2025-02-14&locale=fr-FR`
— isolate one panel, open Calendar, opacity 1.

Both: heading `février 2025`, Previous `Précédent`, Next `Suivant`,
selected-range description in French.

- React visually-hidden Dismiss: `Rejeter`.
- Solid visually-hidden Dismiss: `Dismiss`.

en-US both `Dismiss`. ComboBox/Picker/Menu passes saw Dismiss
`aria-hidden` (#248), not this locale miss.

## Done when

Popover Dismiss follows `I18nProvider` via the overlays catalog on every
overlay that renders it. fr-FR DateRangePicker Dismiss is `Rejeter`. A
test fails on the English literal under a non-English locale.

## Relationship

Child of #24. Found by #260. Distinct from #198 (S2 `dialog.dismiss`
catalog) and #199 (RAC intlMessages for DropZone / SelectValue /
ColumnResizer / ColorSwatchPicker). Catalog already exists; this is the
Popover call site. Also used by DatePicker, ComboBox, Picker, Menu.
