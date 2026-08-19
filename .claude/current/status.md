---
kind: reference
status: current
---

# Status

Status: live audit/migration handoff; **not release-ready**.
Update when: audit findings, validation evidence, dependency ceilings, or the
ordered continuation path changes.
Last refreshed: **2026-08-19**, after `a11y:smoke` 44/44. First
complete 2176 certified run was 2164 pass / 6 fail / 6 skip; every
product red from that run is now closed on focused reruns (TableView
mixed, Tabs 23/23, Toast 37/37, TreeView D5). `ui:smoke` passed.
comparison-axe is 80/80. Web contrast is 154/154. `a11y:smoke` is
44/44. `ci:site` is still blocked on routes, seo, and api-reference.
A full 2176 rerun is still owed before claiming the certified lane
green. Substantial pre-existing owner work and audit changes remain
uncommitted. Do not reset or split this tree without first
identifying ownership of overlapping changes.

This is the short handoff. Read `adversarial-audit.md` for evidence and finding
details, then `upstream-release-audit.md` for the Adobe 1.6/1.20 absorption
ledger.

## Mental model recovered

- The five-layer architecture is broadly correct. State belongs in
  `solid-stately`; ARIA/keyboard/focus in `solidaria`; composition in
  `solidaria-components`; the three styled packages are siblings above it.
- Spectrum S2 styling has one implementation source: generated macro/tokens in
  `solid-spectrum`. The comparison app verifies it and must never patch it.
- `@proyecto-viviana/ui` is an owner-authorized independent reskin/source fork,
  not a runtime skin over `solid-spectrum`. Its permanent convergence/ownership
  mechanism is still undecided.
- Kumo is a Button-only experiment against Kumo 2.11.0, not a completed port.
- A green unit suite, axe run, route, screenshot, or report label is only a
  floor. Current component reports overstate what their evidence files prove.

Structural styling checks are healthy: the installed S2 token pin is exact,
the 20-case macro corpus is byte-identical to upstream, and the sibling boundary
remains 533 identical / 76 declared-divergent files. That does **not** establish
component visual parity: the first complete 2176 certified run found four
live AX/keyboard families still red. TableView mixed Select All, Tabs
arrow, Toast alert role, and TreeView tab-forward are now closed on
focused reruns.

## Completed in this worktree

- Upgraded every compatible dependency. Adobe is aligned to S2 1.6.0, React
  Aria Components 1.20.0, React Aria 3.51.0, React Stately 3.49.0, and oracle
  commit `5ecb3333001313e83898cd07644227897e3bae1f`; Kumo is 2.11.0.
- Migrated all six public package builds to Vite Plus 0.2 packaging. A new guard
  validates 802 manifest artifact targets; 142 stale declarations/maps were
  removed from `solid-stately/src` and are now guarded.
- Added dependency-security and Kumo first-publish fail-closed controls with
  negative fixtures. Full and production audits currently report zero known
  vulnerabilities.
- Ported/fixed bounded Grid deletion, AlertDialog description wiring, shadow
  tree isolation, DateField stale skips, multiple Select toggle behavior,
  native click press-state cleanup evidence, and prop-description injection
  hardening.
- Replaced brittle generated-class assertions and normalized generated classes
  in structural Spectrum snapshots while retaining semantic/state assertions.
- Repaired Astro 7 comparison builds across SSR/DOM Solid artifacts. Playwright
  now uses foreground `vp preview`, avoiding Astro's agent auto-backgrounding.
- Updated public architecture/styling/release prose where direct contradictions
  were found. The full finding register is durable in `adversarial-audit.md`.

## Current validation evidence

| Check                                                                       | Result on this worktree                                                                                                 | Meaning / qualification                                |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `vp install --frozen-lockfile`                                              | pass, pnpm 11.22                                                                                                        | lock is reproducible                                   |
| `vp run check`                                                              | pass                                                                                                                    | format, lint, root types                               |
| `vp run build`                                                              | pass; 802 artifact targets                                                                                              | package outputs exist; macro sourcemap warnings remain |
| `vp run guard:dependency-security`                                          | pass                                                                                                                    | peer graph clean; zero known full/prod vulnerabilities |
| `vp run docs:check`                                                         | pass before this final handoff edit                                                                                     | rerun after docs settle                                |
| `vp test run`                                                               | 269 files; 5580 pass, 1 expected fail, 6 skip                                                                           | package behavior floor; three CSS parse warnings       |
| app typecheck                                                               | 0 errors, 0 warnings, 3 hints                                                                                           | Astro integration type floor                           |
| `vp run comparison:test:contract`                                           | 93/93 pass                                                                                                              | rendered catalogue + button-family contracts           |
| `vp run comparison:test:certified`                                          | **2164 pass / 6 fail / 6 skip** (15.5m, 8 workers, 2026-08-19 after overlay/focus); later focused reruns closed TableView mixed, Tabs 23/23, Toast 37/37, and TreeView D5 | do not claim the 2176 lane green until it is rerun |
| focused certified (`D12` + AlertDialog AX + ActionMenu list + Dialog close + TableView D6 + Tabs + Toast + TreeView) | **D12 5/5, AlertDialog AX, ActionMenu list D1+D5, Dialog close D1/D3/D5, TableView D6 mixed, Tabs 23/23, Toast 37/37, TreeView D5 3/3 + D6 5/5, GridList/ListBox D5/D6 still green** | overlay/focus, Select All mixed, Tabs keyboard-nav, Toast alert, and TreeView D5 closed |
| `vp run ui:smoke`                                                       | pass (packed six tarballs; consumer DOM+SSR; 159/159 export files; 38/38 JS subpaths; 68/68 CSS classes) | macro SOURCEMAP_BROKEN warnings remain (A-017)           |
| comparison-axe (`a11y:axe:comparison`)                                  | **80/80** pass (2026-08-19)                                                                                         | `target-size` disabled (D8 authority); Provider caption chrome uses docs ink |
| web contrast (`a11y:contrast`)                                      | **154/154** pass (2026-08-19)                                                                                   | AA register pairings; Provider islands on `base`; RangeSlider `data-disabled` |
| `a11y:smoke`                                                        | **44/44** pass (2026-08-19)                                                                                     | ContextualHelp outside-click: signal refs + `createInteractOutside` |

Focused reproduction (2026-08-19, fresh `comparison:build`, 25 cases):

1. **D12 Button — harness, now green.** `dist/d12/button/index.html` already
   contained the server-rendered `Save` button. Vite preview SPA-falls back
   slashless `/d12/button` to the marketing homepage (`200`). JS-disabled SSR
   capture cannot recover. Driver now canonicalizes directory routes to a
   trailing slash; all five D12 cases pass (`Button` + `Text entry callback`).
2. **AlertDialog AX — product, now green.** Headless `contentProps` already
   existed (T-65). Styled Dialog now copies RAC `TextContext.slots.description`
   onto `ContentContext`, matching upstream S2, so AlertDialog `<Content>`
   receives the generated description id. Package regressions cover AlertDialog
   description and keep composed Dialog undescribed. Certified D6
   `variant-error` passes after a fresh `comparison:build`.
3. **ActionMenu list — all green (D1 + D5).** Overlay auto-focus now
   matches React's start-of-walk menu focus. Mouse-open requests CSS
   `:focus-visible` on the menu root (`focusSafely(el, { focusVisible: true })`)
   so UA `outline-width` is 1px like React.
4. **Dialog close-button — D1/D3/D5 green.** Contain/collection cycles Tab
   like React. Playwright `.focus()` is virtual-modality; RAC `focusSafely`
   waits for `runAfterTransition` before contain-restore, so hover's
   `pointermove` wins and `createFocusRing` re-samples pointer (`outline:
none`). Ported. Do not patch comparison CSS.
5. **TableView D6 mixed Select All — green.** RAC mixed formula
   (`!isEmpty && !isSelectAll`) plus re-applying native `indeterminate`
   after Chromium clears it on `checked` writes. 4 pass / 1 skip
   (`sorted` knownDivergence).
6. **Tabs D4/D5 — all green (23/23).** Arrow/Home/End move DOM focus in
   the tablist keydown handler. Collection `isFocused` is batched with
   `focusedKey` so the previous tab cannot steal a touch tap. Headless
   Tab uses a signal ref. Do not set `isFocused` on native `focus`.
7. **Toast D6 `neutral` — green (certified 37/37).** RAC `ToastContent`
   is the `role="alert"` live region. S2/Viviana render
   `UNSTABLE_ToastContent` instead of a raw div. `createToast`
   matches RAC (`aria-atomic`, `aria-hidden` until mounted; no extra
   `aria-live`).
8. **TreeView D5 tab-forward — green.** Active trail already matched
   on Tab/Arrow/Home/End. After End, S2 Virtualizer unmounts
   offscreen rows (`treeview-div-grid-paint`); the port keeps
   document flow. Do not `excludeFromTabOrder` row checkboxes (React
   Select is `tabindex=0` at rest). End walk records the collection
   tab-stop. TreeView D5 3/3 + D6 5/5; GridList/ListBox D5 still
   green on the default census.

## Known open work, in order

The remaining-work goal is to go through **every leftover item** in
`work-queue.md`, one slice at a time (diagnose, fix, verify, document,
`git commit --only`). That census is the program until each item is closed,
owner-blocked, or dated.

1. Finish `ci:site`: contrast 154/154 and `a11y:smoke` 44/44. Next
   is routes, seo, api-reference. Rebuild measured rows after this
   (A-001). A full 2176 certified rerun is still owed. Six Playwright
   skips are the registered knownDivergences. S2 RangeSlider still
   lacks `data-disabled` (Viviana-only stamp). jsx-preserving builds
   DCE `let` refs — use signal/callback refs when the handler must
   survive the solid export.
2. Kumo Button paired browser evidence only (A-007). Do not expand Kumo.
3. Adobe Train-8 classification. Remaining RAC exports, S2 support values,
   and `?`/`⛔` tickets.
4. Machine-readable ten-gate evidence schema with validated pointers
   (A-002–A-005).
5. Owner decisions: TableView native-table (A-006), Viviana fork/convergence
   (A-008), TabSwitch/SegmentedControl boundary. Ask; do not silently ratify.
6. Hygiene: CSP/response headers (A-020), 59 `@ts-nocheck` (A-019), macro
   sourcemaps (A-017), stale `tech-debt.md` (A-009), leftover A-010 prose.
7. Lowest-layer ownership inventory (A-018). Compatibility ceilings (A-023)
   stay documented.

## Exact next-agent start

```bash
git status --short --branch
vp install --frozen-lockfile
# ui:smoke, comparison-axe 80/80, a11y:contrast 154/154,
# a11y:smoke 44/44 passed. Remaining ci:site:
vp run test:routes
vp run test:seo
vp run test:api-reference
```

After targeted red/green work, run sequentially because builds share `dist`:

```bash
vp run check
vp test run
vp run comparison:test:contract
vp run comparison:test:certified
vp run ui:smoke
vp run ci:site
vp run docs:check
git diff --check
git status --short --branch
```

Three deliberate latest-version ceilings remain: jest-dom 6.9.1 (unplugin-solid
peer range), jsdom 29.1.1 (jsdom 30.0.1 disconnected `getComputedStyle`
regression), and TypeScript 6.0.3 (`@astrojs/check` peer range). Vite Plus's cold
test dependency scan also traverses ignored/vendored HTML despite `noDiscovery`;
it is noisy and non-hermetic but did not prevent the package suite from running.
