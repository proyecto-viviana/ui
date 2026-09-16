---
id: 245
type: task
title: "Author ComboBox journeys from the upstream suites"
created: 2026-09-02
parent: 243
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
  - {
      state: open,
      at: "2026-09-16",
      note: "#245-A data/hook: window.__comparisonSetControl; inventory fields on ComboBoxDemoProps (selectedKey=none, itemsSource/itemsPreset, layout, sentinels, withForm, loadingState, autoFocus, shouldFocusWrap, shouldCloseOnBlur, prefix, eventLog). Certified defaults unchanged (selectedKey=pro, itemsSource=items). Extra chrome controls are isHidden — visible extras reflowed overlay dy 29 vs 30. Fixtures still HEAD (no live sentinels/layout/defaultItems tree). D13 2 passed on :4323. Journeys unauthored.",
    }
  - {
      state: open,
      at: "2026-09-16",
      note: "Checkpoint 95f3db0f + 9dcbd431 + 7ce135bf. Data/hook landed; extra chrome isHidden; React fixture protocol on default path; Solid still HEAD ComboBox tree plus eventLog. D13 2/2 on :4323. Solid sentinels/layout/withForm/defaultItems not in the live tree. Do not wrap ComboBox in hc() function children. Do not stamp data-comparison-controls JSON on the fixture div. Journeys still unauthored. Overlay remainder stays owner-gated.",
    }
  - {
      state: next,
      at: "2026-09-16",
      note: "Owner-back morning stop. Successor pick. Overlay remainder stays owner-gated — do not mark verified, do not start #246/#249/#254. Next slice is Solid live fixture protocol (sentinels/layout/withForm/defaultItems) without wrapping ComboBox, then CB-OC-01..03. Gate every commit on ComboBox D13 2/2 vs :4323.",
    }
  - {
      state: in-progress,
      at: "2026-09-16",
      note: "Solid live fixture protocol + CB-OC-01..08. Inventory vs tree: no relabel preset, no load-more count, mouseDown is coordinates only. Overlay remainder stays owner-gated.",
    }
  - {
      state: in-progress,
      at: "2026-09-16",
      note: "Solid protocol on the HEAD ComboBox tree (direct child). D13 seeds 2/2 and CB-OC-02 green on :4323. CB-OC-01/03–08 authored and red (event order, defaultItems filter, readonly/disabled ARIA). Not registered. Overlay remainder owner-gated. Do not mark verified.",
    }
---

## Work

Implement `apps/comparison/playbook/journeys/combobox.md` (the orchestrator's
inventory: every interaction and the expected observation, cited to RAC
`ComboBox.test.js`, `react-aria/test/combobox/useComboBox.test.js`,
`@react-aria/test-utils/src/combobox.ts`, S2 `Combobox.test.tsx`, and the
overlay suites) as D13 journeys in `combobox.certified.spec.ts`. Every
inventory row becomes a step with an expectation; a row the harness cannot
observe is recorded as a waiver with the reason, never skipped silently.

## Done when

All inventory rows are journeys; each fails when its expectation is broken
on the Solid panel (prove one per axis in /tmp); the certified suite is green
or every red step is a ticket with source evidence.

## Inventory (orchestrator, 2026-09-02)

`apps/comparison/playbook/journeys/combobox.md` is written: 50 journeys
(CB-OC-01…CB-TCH-01) in the #244 step vocabulary, each step with the React
expectation and the upstream fact ids it proves; a coverage ledger maps all 345
rows of `journeys/facts/combobox.md` to a journey or to `unit-only` with the
owning suite. Prerequisites listed at the top of the file and owned here:

- fixture controls to add on **both** stacks: `selectedKey=none`,
  `itemsSource` (`defaultItems` default — today the fixture passes `items`, so
  typing filters nothing on either stack), `itemsPreset`
  (three/sections/many/empty/link/textValue/relabel), `layout`
  (default/nearBottom/inScroller/inDialog), `sentinels`, `withForm` (+ submit
  count, FormData snapshot), `loadingState` incl. `filtering` (+ load-more
  count), `autoFocus`, `shouldFocusWrap`, `shouldCloseOnBlur`, `prefix`,
  `eventLog` (`data-comparison-events`; fully-controlled handlers must follow
  the SEL047 contract).
- driver extensions (with #246, in `journeys-steps.ts`): `focus`,
  `keyDown/keyUp`, `touchDown/touchUp`, `dispatch`, `control`, `submit`,
  `reset`, `tapAt`, `ua(profile)`; a `motion` class that compares the
  enter/settled/exiting **phase**; live-region capture for `ua:apple`.
- ledger correction: OV020 is wrong (trailing DismissButton is always rendered,
  `Popover.tsx:353-357`).

## Relationship

Child of #243. Depends on #244. Findings that are Solid defects become
tickets under #136 or the component's own ticket.

## Driver extensions landed

Driver half is in `apps/comparison/e2e/drivers/journeys*.ts` (journey
authoring has not started). Verbs: `focus`, `keyDown`/`keyUp`
(optional `repeat`), `touchDown`/`touchUp`/`tapAt` (CDP touch; `hasTouch` already
on `registerJourneyDriver`), `dispatch`, `control`/`submit`/`reset` (fail if the
fixture protocol below is absent), `selectOption(name)`. Targets: `before`/`after`,
`field`, `label`, `helpButton`, `section(n)`, `dialogBackdrop`. Classes: `motion`
(phase, not exact opacity, until `settle`), `timing` (`page.clock.install` before
navigation), `ua:apple` (`navigator.platform = MacIntel` via `addInitScript`
before both stacks load), `unit-only` (not registrable). `events.callbacks` reads
`data-comparison-events` (empty array until fixtures expose it). Fuzz alphabet
gains the new verbs; `control`/`submit`/`reset` stay behind
`withFixtureProtocol: false` by default.

Landed hook (not the original comment in `journeys-steps.ts`): chrome form
owns `form[data-comparison-controls="combobox"]` as a **slug**. Do not stamp
control JSON on that attribute or on the fixture div —
`initializeComparisonControls` queries `[data-comparison-controls]` and a JSON
blob on a non-form breaks chrome. `window.__comparisonSetControl(stack, name,
value)` reads `data-comparison-control-props` on
`[data-framework="${stack}"] [data-comparison-control-root="combobox"]`.
`data-comparison-events` is a getter on that same root when `eventLog` is on.
`submit` / `reset` click `[data-comparison-submit]` / `[data-comparison-reset]`
inside the driven panel. Missing pieces throw with the missing name — a
journey never passes by omission.

## Checkpoint

Owner-stop. #245 stays `in-progress` — not verified. Overlay remainder stays
owner-gated.

Landed this slice (uncommitted until this checkpoint commit):

- Solid fixture stays a **direct** ComboBox child. Sentinel `Show` siblings.
  `items` / `defaultItems` getters, `itemsPreset`, `selectedKey=none`, extra
  event callbacks, optional keys. No `withForm` / `layout` wrap (would wrap
  the field).
- React `onLoadMore` only when `loadingState !== idle` (virtualizer spam).
- `e2e/journeys/combobox.ts` authors CB-OC-01..08. Certified spec registers
  **CB-OC-02 only**.
- D13 seeds 2/2 and CB-OC-02 passed on `:4323`. Fixture-form unit 6/6.
- CB-OC-01/03–08 red; waivers in `comboBoxJourneyWaivers()`. Logs:
  `/tmp/grok-overlay-night/combobox-d13-oc-slice.log`,
  `/tmp/grok-overlay-night/combobox-oc-48.log`.

Earlier commits: `95f3db0f` data/hook; `9dcbd431` React fixture; `7ce135bf`
Solid event log; `d8dfc65a` ticket checkpoint.

Certified defaults must not drift: `comboBoxDemoDefaults.selectedKey = "pro"`,
`itemsSource = "items"`. Inventory default for **authoring** (via
`__comparisonSetControl`, not chrome radios) is uncontrolled /
`selectedKey=none` / `itemsSource=defaultItems` / `eventLog=on`. SelectedKey
chrome radios stay the three `comboBoxKeyOptions` — do not add a visible
`none` radio.

`status.md` is a generated view and still lists this ticket as Next until
`vp run docs:generate`. The ticket file is the authority (`in-progress`).

## Next agent

1. Two ComboBox thunks + `Show` for `items` vs `defaultItems` without wrapping
   the certified default field (Show remount broke D13 2/2). Then register
   CB-OC-03.
2. Ticket Solid event-order and readonly/disabled ARIA under #136 from the
   `/tmp/grok-overlay-night/combobox-d13-oc-slice.log` and
   `combobox-oc-48.log` reds. Then register CB-OC-01/04/05/08 and CB-OC-06/07.
3. Add Solid `withForm` / `layout` without wrapping the default ComboBox.
4. Do not start #246 until ComboBox OC open/close is green or every red step
   is ticketed. Overlay remainder stays owner-gated.

`vp test run apps/comparison/src/data/combobox-picker-fixture-form.test.ts`
is the fixture-form unit gate (6 passed at checkpoint: M7 plus protocol
normalize / URL-defaults / itemsForPreset). M7 still requires Solid source
`/demoProps\(\)\.form\s*\n\s*\? h\("form"/`. Do not add unused string objects
just to pass fixture greps.

## Solid fixture constraints (do not re-discover)

- On the default path, ComboBox must stay a **direct** child of
  `[data-comparison-control-root="combobox"]`.
- `hc()` treats a zero-arg function child as a Solid component and wraps /
  shifts overlay `dy` React 30 vs Solid 29. Never pass `() =>` sentinels or a
  `wrappedField` thunk as an `hc()` child. Use `Show` with `get when()` as
  **siblings**, matching React's `[before, field, after]` array.
- Spreading a getter object copies values and drops reactivity. Do not
  `{...shared, get items()}`.
- `defaultItems` key present with `undefined` is not an omitted key. Solid
  ComboBox (`packages/solid-spectrum/src/combobox/index.tsx`) does
  `items={headlessProps.items ?? props.defaultItems}`. Two ComboBox thunks +
  `Show`, or pass only the live key.
- ComboBox.Section already exists in solid-spectrum. Do not claim it is
  missing. Do not wire sections until an `itemsPreset=sections` journey needs
  it.
- Extra **visible** chrome controls reflow overlay rounding even with HEAD
  fixtures. Hidden inputs are fine. Keep journey controls `isHidden: true`.
- Do not stamp `data-comparison-controls` JSON on the fixture div.

The 1px `dy` 29 vs 30 seen during Solid layout attempts was later isolated to
**visible extra chrome**, not environment. After chrome isHidden, Solid
layout/sentinels/withForm were **not** re-tried. Try Show siblings with chrome
still hidden; still gate the commit on D13 2/2. Do not waive 1px.

## Hard no

- Mark #248 / #244 / #251 / #114 / #270 / #229 / #256 / #252 / #257 verified
- Start #246, #249, or #254 (owner decision)
- Patch `journeys.ts` allow-list to ignore remaining diffs
- Land `combobox-menu-trigger.spec.ts`
- Invent Solid CollectionBuilder `<template>`
- Invent Portal forks / `shape-rendering` / `translateZ(0)`
- Waive ComboBox D13 keyboard-only 7px (fixture has no sections; listboxHeader
  does not fix it) or the 1px overlay `dy`
- Change certified D1–D12 defaults (`selectedKey=pro`, default `items`)
- Add a fourth selectedKey chrome radio
- npm publish (#448), deploy, secrets, port 4322, `pkill`, delete Codex #187
  lock, hijack OS 18877/18878
- Concurrent workflows/fleets or more than one worker at a time
- `git checkout` `component-controls.ts` unless you just destroyed it

## Failed approaches (do not repeat)

- Function-child sentinels / `wrappedField` as `hc()` child → overlay `dy` 29 vs 30, then extra `aria-hidden` sentinel buttons fail `dom`.
- Fake `protocolFields` source-string objects to satisfy greps without a live tree.
- A grok-4 worker gutted `apps/comparison/src/data/component-controls.ts` (8195 → 234 lines). Restore from HEAD if that happens; do not hand-rewrite.
- Visible extra chrome (even with HEAD fixtures) shifts overlay rounding.

## Run

Preview: `http://127.0.0.1:4323/` (`COMPARISON_BASE_URL`). Do not occupy 4322.
`.env.local` already has `COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`.
Do not add `--disable-gpu`. Playwright:

```
set -o pipefail
vp exec --filter @proyecto-viviana/comparison -- playwright test \
  e2e/certified/combobox.certified.spec.ts --workers=1 --reporter=line \
  | tee /tmp/grok-overlay-night/combobox-d13.log
echo EXIT:${PIPESTATUS[0]}
```

Overnight notes (ephemeral): `/tmp/grok-overlay-night/HANDOFF.md`.
