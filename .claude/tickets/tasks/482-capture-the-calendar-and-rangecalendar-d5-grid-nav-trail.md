---
id: 482
type: task
title: "Capture the Calendar and RangeCalendar D5 grid-nav trail"
created: 2026-09-05
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "HEAD subset D5 Calendar and RangeCalendar default · grid-nav pair-mismatched. This walk is focusLocator on the tabindex=0 cell plus CDP Arrow keys, not clickLocator, so it is not the #111 1-by-1 virtual press. No error-context trail was left in test-results (only Button D4). Stop until the trail is in hand. Do not guess a state-machine patch. #194 stays open.",
    }
  - {
      state: verified,
      at: 2026-09-05,
      note: "fa4604b9 attached playbook/evidence/d5-calendar-default-grid-nav.json and d5-rangecalendar-default-grid-nav.json. Isolated grid-nav matched: react===solid, 6 steps each, start cell Saturday 15 Feb 2025 tabindex=0 on both. No BODY, no name/census split, no createCalendarGrid patch. #194 stays open.",
    }
---

Certified D5 `grid-nav` failed on Calendar and RangeCalendar. The
driver programmatically focuses the roving cell and presses
ArrowRight, ArrowRight, ArrowDown, ArrowLeft, ArrowUp. Those are
real keydowns once focus is on the cell.

This is not the synthetic-pointer harness. If focus never lands on
the Solid cell, arrows are a no-op and the trail mismatches. If
focus lands, a name/roving/census split is a product miss.

The Button D4 artifact was kept; the Calendar D5 YAML was not. Do
not change `createCalendarGrid` without that trail.

Picker list D5 (`arrow-roving`, `entry: "keyboard"`) opens through
`clickLocator` first — that open is #111 / #481, not this ticket.

## Done when

The failing D5 trail is attached here. If Solid focus is BODY or the
start cell never takes focus, that is the structure to fix (with a
package test). If the trail is a name/census split, ticket that
split and fix it. Do not start #254.

## Relationship

Child of #24. Found on the HEAD subset under #194. Distinct from
#416 (pointer select drops focus to BODY). Distinct from #425
(Arrow after Enter commits a one-day range). Distinct from #111
(Picker open). Comparison owns the next certified D5 run.
