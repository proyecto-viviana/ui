---
id: 364
type: task
title: "Update TimeField aria-valuetext when hourCycle changes after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 timefield functional pass: URL ?hourCycle=24 paints hour 09 / aria-valuetext 09 on both; live hourCycle=24 after mount updates Solid text to 09 and drops dayPeriod but leaves aria-valuetext at 9 AM (React 09). Chromium AX snapshot uses text content so the tree still matches",
    }
---

S2 TimeField rebuilds hour-segment `aria-valuetext` from the current
hour cycle. A live `hourCycle=24` after mount must change the hour
spinbutton from `9 AM` to `09`.

Solid updates the visible text and drops the dayPeriod segment, but
leaves `aria-valuetext="9 AM"` from the 12-hour mount. Screen readers
that announce valuetext then still hear AM on a 24-hour field.

URL remount of `?hourCycle=24` already matches (`09` / `09` on both).

## Evidence

`http://127.0.0.1:4341/components/timefield/`, islands mounted.
`comparison:controls-change` `{hourCycle:"24"}` from the default
09:30 AM field.

|                       | React                                 | Solid   |
| --------------------- | ------------------------------------- | ------- |
| hour text             | `09`                                  | `09`    |
| hour `aria-valuetext` | `09`                                  | `9 AM`  |
| dayPeriod             | omitted                               | omitted |
| Chromium AX           | `spinbutton "hour, Start time": "09"` | same    |

URL `?hourCycle=24` remount: both `09` / `09`.

## Done when

A live `hourCycle` switch updates Solid `aria-valuetext` with the
visible hour text, matching S2. A comparison-route walk fails if
Solid keeps `9 AM` on a 24-hour hour segment.

## Relationship

Child of #24. Found by #260. Distinct from URL remount (already
matches) and from live empty value (#365). Do not start #254.
