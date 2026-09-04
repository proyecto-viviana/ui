---
id: 243
type: initiative
title: "Certify interaction journeys (D13)"
created: 2026-09-02
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
---

## Why

Every pair driver (D1–D12) walks the same four-state alphabet — default,
focus-visible, hover, pressed — on one target, plus single-shot gestures. No
driver walks a _sequence_: open → ArrowDown ×3 → type → Enter → reopen → scroll
→ Escape → Tab out. Static states are pixel-certified while step-N states are
never observed, which is how an overlay list can render transparent or away
from its trigger on `main` (#248) with certified green.

## Owner decisions (2026-09-02)

- Name: **Journeys** — D13 in `.claude/current/certification.md`.
- Order: overlay family first (Picker, ComboBox, Menu / ActionMenu,
  DatePicker, Popover, Tooltip, Dialog), then collections, fields, the rest.
- Seeded fuzz mode is part of the first build, run nightly with a time
  budget; failing sequences are minimized and promoted to named journeys.

## Shape

One driver in `apps/comparison/e2e/drivers/` (#244) on the existing walk
engine (panel-major, fresh page per panel, real inputs). A journey is a
scripted step list — mouse, keyboard, touch, time — and after **every step**
the driver collects one observation from each panel and diffs them:

1. DOM oracle for `panel` and `overlay` scopes — roles, names, every `aria-*`
   and the upstream `data-*` state attributes, `tabindex`, disabled.
2. Form value: hidden `<select>` / `<input name>` value and selected keys.
3. Text input: value, `selectionStart` / `selectionEnd`.
4. Active element descriptor and the current focus modality.
5. Overlay geometry **relative to the trigger** (placement, dx, dy, width
   match) and the overlay root's computed `opacity`, `visibility`,
   `transform`, `pointer-events`; whether it lies inside the viewport.
6. Collection scroll: `scrollTop` of the list, whether the focused option is
   within the list's client box.
7. Event log since the previous step with `defaultPrevented`.
8. AX tree of the overlay scope; live-region text.
9. Document state: `body` overflow (scroll lock), `aria-hidden` on siblings.
10. A pixel shot of the overlay region (light theme only; D1/D3 own theme).

Journeys are authored from Adobe's own suites (Rule #2): RAC
`ComboBox.test.js` / `Select.test.js` / `Popover.test.js`, the hook suites
under `packages/react-aria/test/{combobox,select,overlays,selection,
interactions}`, S2 `Combobox` / `Picker` tests, and the `@react-aria/test-utils`
tester protocols. The per-component inventory lives in
`apps/comparison/playbook/journeys/<component>.md`.

## Children

- #244 driver; #245 ComboBox journeys; #246 Picker journeys; #247 nightly
  fuzz; #248 the owner-reported overlay defect; #249 rest of the overlay
  family.

## Done when

D13 is a row in `certification.md` with a gate; ComboBox and Picker journeys
run in their certified specs and fail on the first divergent step by name;
the nightly fuzz job exists and has produced at least one minimized journey
or a documented clean run; the overlay family is covered.
