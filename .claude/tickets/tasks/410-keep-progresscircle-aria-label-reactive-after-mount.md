---
id: 410
type: task
title: "Keep ProgressCircle aria-label reactive after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: 'filed from the #260 progresscircle functional pass: live comparison:controls-change {ariaLabel:"Uploading files"} updates Solid data-comparison-control-props but the progressbar aria-label and AX stay Loading…; React updates both. URL ?ariaLabel=Uploading%20files remounts and matches. Pairing the live label with a value change still leaves Solid on Loading… while dashoffset/valuenow update. createProgressBar destructures createLabel fieldProps once, so the frozen aria-label wins mergeProps over the live filterDOMProps copy. Numbered 410 to avoid the ProgressBar pass claiming 397–399',
    }
---

ProgressCircle `aria-label` should follow the live prop the way S2
does. After mount, a `comparison:controls-change` that only (or also)
changes `ariaLabel` leaves Solid's `role="progressbar"` named
`Loading…` while the fixture JSON already shows the new string.

URL remount (`?ariaLabel=Uploading%20files`) matches both stacks.
Live `value` / `size` / `staticColor` / `isIndeterminate` already
update. Pairing the live label with `value: 25` still leaves Solid
on `Loading…` while `aria-valuenow` / dashoffset move — the host
re-renders, the name does not.

`createProgressBar` destructures `fieldProps` from `createLabel`'s
getter at hook setup. That snapshot's `aria-label` then wins
`mergeProps(domProps, fieldProps, …)` over the per-read
`filterDOMProps` copy.

## Evidence

`http://127.0.0.1:4341/components/progresscircle/`, islands mounted.
`comparison:controls-change` with `{ariaLabel:"Uploading files"}`
(defaults otherwise).

|                          | React                           | Solid                    |
| ------------------------ | ------------------------------- | ------------------------ |
| fixture JSON `ariaLabel` | Uploading files                 | Uploading files          |
| DOM `aria-label`         | **Uploading files**             | **Loading…**             |
| AX                       | progressbar `"Uploading files"` | progressbar `"Loading…"` |

Then `{ariaLabel:"Uploading files", value:25}`: React name
Uploading files / now 25; Solid name Loading… / now 25,
dashoffset 75.

`?ariaLabel=Uploading%20files` rest: both `"Uploading files"`.

## Done when

A live `ariaLabel` change on the comparison route updates Solid's
progressbar name and AX to match S2. A walk fails if the fixture
JSON says Uploading files and the host is still Loading…. URL
remount must keep working. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/progress/createProgressBar.ts`
(`const { labelProps, fieldProps } = createLabel(…)`). Distinct
from Meter/ProgressBar visible `label` text (those slots already
update). Do not start #254.
