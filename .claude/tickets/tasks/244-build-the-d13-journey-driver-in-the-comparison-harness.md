---
id: 244
type: task
title: "Build the D13 journey driver in the comparison harness"
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
      state: in-progress,
      at: 2026-09-02,
      note: "D13 driver, four seed journeys, fuzz+ddmin, certification row, and journeys-nightly.yml landed; seed journeys fail on real ComboBox/Picker overlay DOM/ARIA divergences (feed #248)",
    }
---

## Work

`apps/comparison/e2e/drivers/journeys.ts` on the existing `walk` /
`scenario` / `dom-oracle` model. A `Journey` is `{ id, setup?, steps[] }`;
a `Step` is a real input (mouse click / hover / move / wheel / drag, keyboard
press / type, touch tap, viewport resize, page scroll, mocked-clock advance,
`settle`) with an optional per-step `expect` hook. After each step the driver
collects the ten observations listed on #243 for the driven panel, then
diffs React vs Solid step by step; the first divergence fails with the journey
id, step index, and step label. Observation descriptors reuse the oracle's
stack-agnostic normalization (no ids, no framework `data-*` that differ by
design — list the allowed `data-*` set explicitly).

Also: `registerJourneyDriver(scenario, journeys)` for certified specs;
`journeyFuzz(scenario, alphabet, { seed, budgetMs })` that generates steps
from a component alphabet, runs the same collect/diff, and on failure
delta-minimizes the sequence and writes it as a journey JSON under
`apps/comparison/e2e/journeys/minimized/`; a D13 row + gate text in
`.claude/current/certification.md`; a `journeys-nightly.yml` workflow.

## Done when

Two seed journeys on ComboBox and Picker (open by click → ArrowDown → Enter →
reopen → page scroll → Escape) run under `comparison:test:certified`, fail on
a deliberately broken Solid step in a /tmp experiment, and pass on the real
pair; the fuzz mode reproduces a seeded failure deterministically.

## Landed

- Driver: `e2e/drivers/journeys.ts` (+ `journeys-observe.ts`,
  `journeys-steps.ts`, `journeys-fuzz.ts`).
- Seed journeys appended to `combobox.certified.spec.ts` and
  `picker.certified.spec.ts` (closed field/trigger scenarios).
- Fuzz gated on `JOURNEY_FUZZ=1`; nightly workflow in
  `.github/workflows/journeys-nightly.yml`.
- D13 row + overlay-family gate paragraph in `certification.md`.
- `vp run comparison:test:certified` was not re-run end-to-end: workspace
  `build:workspace-deps` currently fails in `solidaria-components` intl
  (`Cannot find module '@internationalized/string'`). Seed journeys were run
  with Playwright against the existing comparison preview.

## Seed journey results

All four fail at step 0 on `field dom`. Overlay **opens on both stacks** after
the fold-safe click (Solid `aria-expanded` becomes true). Overlay geometry /
pixel were not compared because `dom` is first. First divergences, verbatim:

### ComboBox `open-arrow-enter-reopen-scroll-escape`

```
Error: open-arrow-enter-reopen-scroll-escape step 0 (click trigger) field dom

expect(received).toEqual(expected) // deep equality

- Expected  - 39
+ Received  + 31

@@ -9,70 +9,58 @@
              "aria-orientation": "vertical",
            },
            "children": Array [
              Object {
                "aria": Object {
-               "aria-labelledby": "span:Starter",
-               "aria-posinset": "1",
+               "aria-describedby": "(missing)",
+               "aria-label": "Starter",
                  "aria-selected": "false",
-               "aria-setsize": "3",
                },
```

React options use `aria-labelledby` + `aria-posinset`/`aria-setsize` +
`data-rac` + `data-selection-mode`. Solid options use `aria-label` and
`aria-describedby: "(missing)"`. Listbox: React `data-layout=stack`
`data-orientation=vertical` `data-rac`; Solid `data-focused`. Feed #248.

### ComboBox `keyboard-only`

```
Error: keyboard-only step 0 (Tab to trigger) field dom
```

Closed-field contract: Solid emits `aria-haspopup=listbox` on the combobox
input (React does not), omits `data-rac`, uses `data-focused` on the field
group where React uses `data-focus-within`.

### Picker `open-arrow-enter-reopen-scroll-escape`

```
Error: open-arrow-enter-reopen-scroll-escape step 0 (click trigger) field dom

- Expected  - 33
+ Received  + 10

@@ -1,10 +1,8 @@
    Object {
      "overlay": Object {
-     "aria": Object {
-       "aria-labelledby": "span:Plan",
-     },
+     "aria": Object {},
```

Same option ARIA/`data-rac`/`data-selection-mode` gap as ComboBox. Overlay
root labelledby missing on Solid.

### Picker `keyboard-only`

```
Error: keyboard-only step 0 (Tab to trigger) field dom
```

`aria-describedby` resolves `span:` (React) vs `p:` (Solid). Missing
`data-rac`. Extra nameless hidden `input` on Solid.

### Negative proof

Temporary `negative-proof` journey with a Solid-only capture-phase ArrowDown
`stopImmediatePropagation`. Failure message:

```
Error: negative-proof step 0 (click trigger) field dom
```

The intercept never reached step 1 because step 0 already diverges. Driver
names `journey.id`, step index, step label, and field. Journey removed after
the run.

### Fuzz

`JOURNEY_FUZZ=1 JOURNEY_SEED=7 JOURNEY_BUDGET_MS=120000` on ComboBox: generated
`[{type:click,label:click trigger,targetId:trigger}]` twice (identical). Failed,
ddmin kept the single click, wrote
`e2e/journeys/minimized/combobox-7.json`.

## Relationship

Child of #243. Uses `dom-oracle.ts`, `walk.ts`, `focus.ts`, `ax.ts`,
`events.ts`. Does not edit `playwright.config.ts` (#194–#196 own CI shape).
