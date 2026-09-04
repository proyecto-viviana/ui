---
id: 118
type: task
title: "Port TokenField"
created: 2026-08-20
parent: 25
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-82" }
---

Port the pinned RAC TokenField surface: `Token`, `TokenField`,
`TokenFieldContext`, and `TokenInput`.

Read source, tests, and official docs before the owner steers public names and
types. Reuse the shared collection, selection, keyboard, and focus spine.

## Done when

All four exports and every observable branch have strict API, ARIA, keyboard,
focus, forms, validation, SSR, hydration, and browser evidence. Part of #82.

## Round-2 note (2026-09-01)

Delta (F-API-008): RAC also publishes `TokenFieldValue` (from `react-stately/useTokenFieldState`); solid-stately barrels it, solidaria-components does not re-export it. Add to done-when. Gate blindness to sibling re-exports is #203.

Delta (F-GATE-001 addendum): `1217ad39` landed with `guard:attribution-headers` red and unseen — the two `createToken.ts` / `createTokenField.ts` headers did not match the pinned upstream block (Adobe's own `useToken.ts` / `useTokenField.ts` headers are truncated after `governing`), and the five barrels/contexts it touched drifted from their local-review hashes. Round 2 synced the headers verbatim and re-recorded the hashes; the guard is now on Certification Gates so the next port cannot repeat this.

## Owner decision (2026-09-01, via #216)

Target the 1.21.0 TokenField API — `TokenFieldValue.selectedRange` and
`withSelectedRange`, not `caretPosition` — because the 2026-09 train (#220)
moves the pin to `f56660b` before this port finishes. This ticket now belongs
to #220's train.

## Train 9 note (2026-09-02, via #220)

Pin is now `f56660b` (RAC 1.21.0). Source evidence for the API this ticket
must ship:

- `packages/react-stately/src/tokenfield/TokenFieldValue.ts` — `selectedRange`
  / `withSelectedRange`; `caretPosition` is a getter of
  `selectedRange.current`.
- `packages/react-aria/src/tokenfield/useTokenField.ts` — restore via
  `setTokenFieldSelection` + `withSelectedRange`; blur clears selection;
  `getSelectedRange` uses `setBaseAndExtent` so backward selections survive.
- `packages/react-aria-components/src/TokenField.tsx` — `data-react-aria-token`
  plus an adopted stylesheet that hides native selection on tokens (Firefox
  IME / selection).
- Release note: "TokenFieldValue now tracks the full selected range instead of
  a single caret position" and "Fix IME composition in Firefox".

Do not open a sibling ticket. #220's export-gap did not list TokenField
(already unmatched as an unported suite).
