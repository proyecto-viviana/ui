---
id: 249
type: task
title: "Extend journeys to the rest of the overlay family"
created: 2026-09-02
parent: 243
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
---

## Work

After #245 / #246: Menu and ActionMenu (submenus, sections, typeahead,
long-press trigger), DatePicker / DateRangePicker (calendar popover, segment
navigation), Popover and Tooltip (delay, warmup/cooldown, hover-out), Dialog
and AlertDialog (modal focus trap, restore, nested). One inventory file per
component under `apps/comparison/playbook/journeys/`, authored from the
upstream suites, then collections and fields.

## Done when

Every overlay-family certified spec carries D13 journeys and the nightly fuzz
covers it.

## Relationship

Child of #243. Depends on #244.
