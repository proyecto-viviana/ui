---
id: 250
type: task
title: "Split the comparison fixture registries per component"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "owner report: the comparison app is laggy; every page fetches every component",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "verified cause numbers against code; splitting both fixture registries per slug",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "per-slug registries landed; build chunks and DOM identity measured; pair/contract/certified blocked in this session by a frozen Chromium document timeline (rAF never fires)",
    }
---

## Cause

`apps/comparison/src/scripts/component-example-section-mount.tsx` lazy-loads
`react-mount` and `solid-mount`, but each of those imported one monolithic
registry: `src/components/react/fixtures/styled.js` (6 944 lines, 97 static
imports — every S2 component) and `src/components/solid/fixtures/styled.tsx`
(11 206 lines, 86 imports — every solid-spectrum / viviana-ui component), plus
all 73 `src/data/*-demo.ts` modules. There was no `import()` below that point.
Built output on every component page before the split: `react-mount` 1.4 MB +
`solid-mount` 975 KB of JS (ticket originally said 944 KB; measured 975 KB on
this machine), re-parsed on each navigation because Astro pages are full
reloads. Under `astro dev` Vite serves the graph unbundled, so a page requested
the module graph of both design systems — hundreds of files.

## Work

Per-slug code splitting, structure not patch:

- Each fixture is its own module: `src/components/react/fixtures/styled/<slug>.js`
  and `src/components/solid/fixtures/styled/<slug>.tsx`, importing only the
  components and the demo-data module that slug needs. The registries are
  `Record<ComparisonSlug, () => Promise<{ default: Fixture }>>` built from
  explicit entries (not a glob — the manifest is the authority; a slug with no
  fixture stays an explicit empty state).
- `ComparisonIsland` (both stacks) awaits the current slug's module and
  renders a stable placeholder until then; `component-example-section-mount`
  sets `data-islands-mounted="true"` only after both fixtures have mounted, so
  `waitForComparisonRouteReady` and every driver keep their contract.
- Shared framework runtimes (react, react-dom, `solid-js`) land in named chunks
  via `manualChunks`; Vite default-splits the rest. A component page loads its
  own fixture chunk per stack plus shared runtime.
- `comparison-manifest` stays a single small module.

## Done when

- `vp run comparison:build`: no chunk above 300 KB except the two framework
  runtime chunks; the picker page's network waterfall (Playwright
  `page.on('request')`) lists exactly one fixture chunk per stack.
- A guard in `apps/comparison/scripts/` fails when a fixture module imports a
  component whose slug is not its own or when a registry entry imports
  statically (`rg` for `^import .* from "\.\./styled/`).
- `comparison:test:pair`, `:contract`, and the full `:certified` suite pass
  with unchanged counts; the D13 journeys (#244) still see
  `data-islands-mounted` after fixtures mount.
- `astro dev` picker page: request count and total transferred bytes recorded
  before/after in this ticket.

## Relationship

Child of #136 (harness integrity axis). Blocks nothing in certification but
blocks day-to-day use of the harness. Must not run concurrently with
Playwright lanes against the built app (#194–#196, #244); sequence after them.

## Landed

File layout (78 slugs × 2 stacks):

- Registries (dynamic `import()` only): `src/components/react/fixtures/styled.js`,
  `src/components/solid/fixtures/styled.tsx`
- Per-slug modules: `src/components/react/fixtures/styled/<slug>.js`,
  `src/components/solid/fixtures/styled/<slug>.tsx`
- Shared helpers: `styled-shared.js` / `styled-shared.tsx`
- Guard: `apps/comparison/scripts/fixture-registry-split.ts`
- Unit test: `apps/comparison/src/data/fixture-registry-split.test.ts` (6 passed)
- Scripts: comparison `guard:fixture-registry-split`; root `comparison:test:fixture-registry-split`

`data-islands-mounted="true"` is set only after both `mountReactComparisonIslands`
and `mountSolidComparisonIslands` resolve; Solid islands mount via
`createComponent` so the async fixture signal cannot remount the island.

### Build chunks (`vp run comparison:build`)

|                       | Before                                                                                        | After                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| JS chunks in `_astro` | 2 files > 300 KB (`react-mount` 1.4 MB, `solid-mount` 975 KB); those were the only >300 KB JS | 523 JS files; **0** > 300 KB                                  |
| `react-mount`         | 1.4 MB                                                                                        | 35 KB                                                         |
| `solid-mount`         | 975 KB                                                                                        | 49 KB                                                         |
| largest remaining     | those two                                                                                     | `react-runtime` 186 KB, then `@internationalized/date` 176 KB |
| `comparison-manifest` | 58 KB                                                                                         | 58 KB                                                         |

### Picker preview waterfall (`page.on('request')`, `http://127.0.0.1:4340`)

|                | Before                             | After                                                                                                                                                                            |
| -------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JS requests    | 65                                 | 265                                                                                                                                                                              |
| JS bytes       | 3 810 539                          | 2 120 978                                                                                                                                                                        |
| Fixture chunks | (bundled into the two mount files) | react `picker.CpE8op1h.js` (13 KB); solid `picker.C29ZfmTl.js` (4 KB). A third `picker.*.js` (21 KB) is the solid-spectrum Picker implementation, not a fixture registry module. |

### `astro dev` picker (`http://127.0.0.1:4341`)

Before was not captured (source was split before a dedicated `astro dev` run).

After: 1 757 module requests, 67 621 137 bytes, ~31 s to `data-islands-mounted`. Fixture modules requested: `styled/picker.js` and `styled/picker.tsx` only. Remaining `*-demo.ts` hits (64) come from `component-controls.ts` still statically importing every demo for the props panel — not from the fixture registries.

### Navigation timing (median of 3, preview, picker/combobox/button)

| Route    | Before DI / loadEventEnd (ms) | After DI / loadEventEnd (ms) |
| -------- | ----------------------------- | ---------------------------- |
| picker   | 42.5 / 296.7                  | 118.2 / 480.7                |
| combobox | 48.7 / 328.6                  | 124.4 / 529.7                |
| button   | 60.7 / 206.6                  | 111.6 / 371.4                |

Preview parse is cheaper (no 1.4 MB + 975 KB mount files); more HTTP requests from default Vite splitting. Dev is the owner's lag surface.

### DOM identity (5 routes)

`document.querySelector('.s2-comparison-frame')?.outerHTML` for button, combobox, picker, menu, tableview: byte sizes match before/after. Diff is empty after normalizing generated `react-aria*` / `solidaria-cl-*` ids.

### Verification

- `vp run comparison:build` passes (0 JS chunks > 300 KB).
- `astro check` (comparison app): 0 errors (2 pre-existing `FormEvent` deprecation hints in `KumoButtonFixture.tsx`).
- Guard CLI: `fixture registry split: ok`. Unit test: 6 passed.
- `vp check --fix` on owned files: pass. `git diff --check`: pass.
- Pair/contract **before** this change (preview of old `dist/`): pair **6 passed**; contract **93 passed**.
- Pair **after**: 6 failed at `styledSection` → `scrollIntoViewIfNeeded` (“waiting for element to be stable”). Same Playwright Chromium in this session has `document.timeline.currentTime === 0` and `requestAnimationFrame` never firing — including on `data:text/html`. Contract and full certified were not run after the split because they share that rAF wait (`styledSection` / `waitForComparisonRouteReady`). Log of the pair failure: Playwright `test-results/` under `apps/comparison`. This is outside the comparison-app fence (renderer vsync), not a new fixture assertion failure.
- Full `vp run comparison:test:certified` was **not started**; it would hang on the same frozen timeline. Baseline to compare later: `output/audit-2026-09/train-2026-09/certified-after-240.log` (2116 passed / 8 failed / 4 skipped).

Orchestrator note (2026-09-02 05:20): the frozen document timeline is machine-wide, not Playwright — `chrome-headless-shell --dump-dom` with `--virtual-time-budget` never runs a `requestAnimationFrame` callback either, and `Element.getAnimations()[0].finished` never resolves. All browser gates (pair, contract, certified, D13) are unrunnable until the WSL2 instance is restarted; the last good certified run is `output/audit-2026-09/train-2026-09/certified-after-240.log` (03:54). Committed on the strength of build, `astro check`, the split guard, the six unit tests, and the pre-freeze DOM identity check; pair/contract/certified against `main` are owed on the next healthy machine before PR #33 moves.
