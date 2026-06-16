---
"@proyecto-viviana/solid-stately": patch
---

Fix `createCalendarState` to default the visible-range alignment to `center`,
matching `@react-stately/calendar` `useCalendarState`. Previously it defaulted to
`start`, which only diverged for views of 3+ months (e.g. a 3-month view focused
on June rendered June–August instead of the centered May–July).
