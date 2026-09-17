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
  - {
      state: in-progress,
      at: "2026-09-17",
      note: "Slice A: Spectrum ComboBox was coalescing defaultItems onto items (skips defaultFilter, FIL006 / useComboBoxState.ts:297-302). Headless ComboBox already supplies RAC ComboBox.tsx:204-207. Stopped the remap in solid-spectrum and the viviana-ui twin (copies; not extracted). Registered CB-OC-03; waiver dropped. Do not wrap ComboBox; certified defaults unchanged. Overlay remainder owner-gated — do not mark verified, do not start #246/#249/#254.",
    }
  - {
      state: in-progress,
      at: "2026-09-17",
      note: "Slice A landed. defaultItems stays off items; filterCollection reindexes like RAC ListCollection; setInputValue is batched so onInputChange precedes onOpenChange. Unit 70/70. D13 seeds 2/2 on :4323 against pre-95d30443 CSS. Current CSS (95d30443 canvas overflow:hidden) 58/25440 overlay pixels — not this slice. CB-OC-03 type/filter green; Escape extra onSelectionChange(null). Overlay remainder owner-gated. Do not mark verified.",
    }
  - {
      state: in-progress,
      at: "2026-09-17",
      note: "ComboBox island min-height 280px so the portaled list stays over the island fill. 95d30443 frame CSS unchanged. D13 seeds 2/2 and CB-OC-02 green on :4323. CB-OC-03 still Escape extra onSelectionChange(null). Overlay remainder owner-gated. Do not mark verified.",
    }
---

<!-- doc-shape: over cap because the proof is real command output -->

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

#245 stays `in-progress` — not verified. Overlay remainder stays owner-gated.

Landed this slice:

- ComboBox example island `--s2-example-preview-min-height: 280px` so the
  portaled list's box stays over that island fill on both stacked panels.
- `95d30443` frame CSS stays (`overflow: hidden`, 1px border, 12px radius,
  global island 200px, `align-items: center`).
- D13 seeds 2/2 and CB-OC-02 green on that CSS. CB-OC-03 pixels pass;
  Escape still fires extra `onSelectionChange(null)`.

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

## Proof

cwd `/home/emoporemilio/projects/viviana-hub/ui`. Preview
`COMPARISON_BASE_URL=http://127.0.0.1:4323` (astro dev, current
`global.css`). Playwright browsers from
`PLAYWRIGHT_BROWSERS_PATH=/home/emoporemilio/.cache/ms-playwright`.

Cause (measured, size M, canvas centered as D13 does): overlay boxes match
(208×112 at y=434). Island 200px, overlay overflows it by 34px. React
overflow vs frame −203 (bottom corners over the Solid header). Solid
overflow vs frame +33 (bottom corners past the frame, over `.s2-example`).
Overlay `border-radius: 10px`, portaled to `body` (not clipped). Crop
mismatch 56/23296, max channel delta 5, bounds
`{"left":0,"top":103,"right":207,"bottom":111}` — two bottom corners only.

After ComboBox island 280px: size S overflowIsland −34 / overflowFrame
Solid −35; overlay crop 0/16896. Size M overflowIsland −6 / overflowFrame
Solid −7.

E2E `--grep "D13 journey"` on current CSS:

```
Running 4 tests using 1 worker

[1/4] D13 journey — open-arrow-enter-reopen-scroll-escape
[2/4] D13 journey — keyboard-only
[3/4] D13 journey — CB-OC-02
[4/4] D13 journey — CB-OC-03
  1) D13 journey — CB-OC-03
    Error: CB-OC-03 step 5 (Escape) field events
    extra Solid onSelectionChange(null) before onOpenChange
  1 failed
  3 passed (44.4s)
EXIT:1
```

Seeds, keyboard-only, and CB-OC-02 pass including the pixel step. CB-OC-03
fails on Escape events after the pixel steps; not this slice.

## Next agent

1. Ticket Solid Escape extra `onSelectionChange(null)` on CB-OC-03 under
   #136. Type/filter on that journey is green. Then CB-OC-01/04/05/08
   event-order and CB-OC-06/07 readonly/disabled ARIA.
2. Add Solid `withForm` / `layout` without wrapping the default ComboBox.
3. Do not start #246 until ComboBox OC open/close is green or every red
   step is ticketed. Overlay remainder stays owner-gated.
4. D13 seeds 2/2 and CB-OC-02 are green on current `global.css` (ComboBox
   island 280px; `95d30443` frame CSS kept). Do not revert that CSS. Picker
   and other stacked overlay slugs still sit on the 200px island and will
   hit the same corner-chrome pixel miss when their D13 runs.

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
- `defaultItems` key present with `undefined` is not an omitted key.
  Spectrum ComboBox no longer remaps `defaultItems` onto `items` (this
  slice). Headless still filters only when `items == null`.
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
