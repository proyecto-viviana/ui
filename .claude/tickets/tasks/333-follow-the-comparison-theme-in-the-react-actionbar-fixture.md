---
id: 333
type: task
title: "Follow the comparison theme in the React ActionBar fixture"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actionbar functional pass: document theme light paints a dark React ActionBar (bg rgb(34,34,34), count rgb(219,219,219)) against a light Solid bar (bg rgb(255,255,255), count rgb(41,41,41)). comparison:theme-request dark matches both; light leaves React stuck on dark. React fixture calls renderReactSpectrumReference without useComparisonResolvedTheme (default colorScheme dark); Solid follows the document",
    }
---

The ActionBar comparison route paints React in dark Spectrum tokens while
Solid follows the page theme. ListView / Accordion already pass
`useComparisonResolvedTheme()` into `renderReactSpectrumReference`.

The React fixture
(`apps/comparison/src/components/react/fixtures/styled/actionbar.js`)
calls `renderReactSpectrumReference(children)` with the helper's default
`colorScheme = "dark"` and never listens for `comparison:theme-change`.
The Solid fixture wraps `Provider` in `colorScheme` from
`getComparisonResolvedThemeFromDocument()`.

## Evidence

`http://127.0.0.1:4341/components/actionbar/`, islands mounted,
`data-theme=system` / `data-resolved-theme=light`.

|                                  | React                                          | Solid                                    |
| -------------------------------- | ---------------------------------------------- | ---------------------------------------- |
| default (system/light) bar bg    | `rgb(34, 34, 34)`                              | `rgb(255, 255, 255)`                     |
| default count color              | `rgb(219, 219, 219)`                           | `rgb(41, 41, 41)`                        |
| `comparison:theme-request` dark  | `rgb(34, 34, 34)` / `rgb(219, 219, 219)`       | same                                     |
| `comparison:theme-request` light | still `rgb(34, 34, 34)` / `rgb(219, 219, 219)` | `rgb(255, 255, 255)` / `rgb(41, 41, 41)` |

AX, 432×56 geometry, and keyboard match. Focus-ring blue
`rgb(64, 105, 253)` vs `rgb(75, 117, 255)` is the same theme split.
Emphasized `isEmphasized` is the correct treatment _for each scheme_
(React light-gray on dark, Solid dark-gray on light).

## Done when

The React ActionBar fixture uses `useComparisonResolvedTheme` the same
way ListView does, so a live light/dark switch paints both bars with
the same elevated background and count color. A comparison-route walk
fails if system/light still leaves React on dark tokens.

## Relationship

Child of #26. Found by #260. Fixture-only; not an ActionBar port
defect. Distinct from #197 (ActionButton hover/pressed live). Do not
start #254.
