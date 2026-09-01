---
id: 166
type: task
title: "Fail comparison overlay tests if the Solid portal never opens"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

DatePicker / DateRangePicker D4 and Dialog certified specs query
`page.getByRole("dialog")` page-global. If Solid does nothing while a React
dialog is open, `toBeVisible()` can still pass.

## Work

Scope overlay locators to the driven panel, or fail if the Solid portal never
opens.

## Done when

A Solid trigger that does not open a dialog fails the Solid panel assertion.

## Relationship

F-TEST-011.
