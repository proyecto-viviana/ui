---
id: 136
type: initiative
title: "Run the 2026-09 full-repo audit"
created: 2026-09-01
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "reviewer handoff: owner decisions recorded, archive/custom deleted, remaining children listed below",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "wave-3 CI follow-through: PR #33 fast-forwarded; release-readiness green; certified 2118/2/4; site-gate reds traced (RadioGroup SSR fixed, red-900 contrast is an owner decision); menu-focus :20 regression handed to #257",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "owner seeded the functional pass: #259 comparison page production-ready, #260 React-vs-Solid functional comparison (overlay family first)",
    }
---

Audit the monorepo across architecture, Solid patterns, TypeScript, quality,
security, accessibility gate integrity, testing, packaging, and docs. This is
not a per-component parity re-run. It covers what existing gates do not
systematically cover, plus the integrity of those gates.

## Reviewer handoff (2026-09-01)

This ticket is the handoff. Generated `status.md` and `roadmap.md` are
projections. Stable policy lives in `.claude/current/`. Do not treat chat as
authority.

### How to read

1. [steering.md](../../current/steering.md) — owner product boundaries.
2. [architecture.md](../../current/architecture.md) — layer and styling
   boundaries.
3. This ticket — what landed, what is verified, what is still open.
4. Child tickets #137–#181 — remaining work. Do not re-litigate verified
   children.

### Working tree

Round 1 landed in `6a0af4d7 audit: land 2026-09 findings and drop the
viviana-native archive` on `main`, together with the #135 Button hydration
work (`abafbd4d`), the SegmentedControl icon fix (`72ec9157`), and the
Button-harness commits (`2b560c42`, `9af12739`, `a47c6f3b`). The Button
files are committed and **under review** (#187 lists the missing evidence),
not protected WIP. #182 / #183 used an invalid `closed` state that was mapped
to `verified`; their bodies were not rewritten at the time (#182 now carries
a round-2 correction note).

Round 2 (below) is uncommitted in the working tree at handoff time.

Branch is `main`, ahead of `origin/main`. Do not push unless the owner asks.

### Do not touch

- Vendored `react-spectrum/` (read-only oracle).
- Generated icons (line-by-line).
- Generated `status.md` / `roadmap.md` except via `vp run docs:generate`.

### Owner decisions (recorded 2026-09-01)

| Ticket     | Decision                                                                                                                                                   | Status      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| #140       | Blacksmith is accepted for evidence jobs. Provenance publish stays on GitHub-hosted runners.                                                               | verified    |
| #143       | Both styled packages pin `@adobe/spectrum-tokens` to the S2 oracle (14.0.0). Theming stays in `viviana-tokens.css`. Guard watches both.                    | verified    |
| #145 / #62 | Delete `packages/viviana-ui/archive/`. Comparison is the S2 harness. Current work is the Solid Spectrum API, not new viviana-native components.            | verified    |
| #148       | Delete rotting benches. Live size evidence is `guard:jsx-deopt-size`.                                                                                      | verified    |
| #152       | Verify #28. Rewrite #82 and #87. Keep #56 in-progress (#57 and #58 are open).                                                                              | verified    |
| #156       | Do not enable `noUncheckedIndexedAccess` or `exactOptionalPropertyTypes` repo-wide. `solid-stately` extends the shared typecheck config. Revisit after #3. | verified    |
| #167       | Bare `solid-js/h` Tabs wiring is an upstream limit, not a Tabs defect. Keep `it.fails`. Compiled JSX / `hc` is the supported path.                         | verified    |
| #177       | Classification recorded. FileTrigger, Landmark, and Alert are exceptions. ColorEditor and ColorPicker still need notes.                                    | in-progress |

Standing owner decisions still open (not this audit): **#89** TableView
structure, **#9** TabSwitch vs SegmentedControl.

### Landed in this tree (behavior-preserving)

Trivial audit fixes:

- Admin: `safeAdminLinkTarget`, markdown href scheme checks, path-allowlist
  tests, aria-labels, `aria-current` on admin tabs.
- Packaging: Spectrum CSS `default` points at `dist/`; `./package.json`
  exports on solid-spectrum and solid-stately; leftover `tsup --watch` →
  `vp pack --watch`.
- Solid one-read children: Tab (spectrum), ComboBoxOption, PickerItem,
  StatusLight (both styled packages), Kumo Button. Remaining
  ActionButton/ToggleButton/LinkButton/Badge/Radio/SegmentedControl/TagGroup
  is **#168** — do not fold into #135.
- Docs: architecture `solid` export points at dist; certification snapshot
  vs ticket-state split; the Relationship lines on #47, #56, and #81 no
  longer point at deleted `tech-debt.md` (42 other ticket files still cite
  it as provenance — #215).
- Hygiene: deleted tracked empty `.codex`; deleted
  `packages/solid-spectrum/archive/alert/index.tsx`; stopped exporting unused
  `create*Tester` from solidaria test-utils.
- `ts-expect-error` / `ts-ignore` reasons on style-macro and test-utils
  setup.

Owner-decision follow-through:

- `viviana-ui` `@adobe/spectrum-tokens` 15.0.0 → 14.0.0. Guard covers both
  styled packages.
- Deleted `benchmarks/` and root `bench:*` scripts.
- `packages/solid-stately/tsconfig.json` extends `tsconfig.typecheck.json`.
- Deleted the twelve `archive/custom` components, comparison deep-imports,
  custom catalogue entries, and their twelve certified specs.

Changesets in the tree: `children-one-read.md`, `export-package-json.md`,
`spectrum-css-default-dist.md`, `spectrum-tokens-ui-oracle-pin.md`. Do not
add one for docs-only or unpublished-archive deletion.

### Highest-signal remaining work

Not an order. #87 remains the census for the older remaining-work ladder.
These are the audit children a reviewer should not miss:

- **#160** — SSR/hydrate suites are excluded from blocking gates. #134
  ListView hydrate fail cannot redden CI.
- **#141** — published Dialogs stamp `comparison-spectrum-*`.
- **#146** — packed-consumer smoke does not cover every public package and
  is not in CI.
- **#154** — Select/ListBox/GridList/TagList require `items` arrays;
  upstream CollectionProps makes items optional.
- **#168** — remaining styled children() snapshot class. Not #135.
- **#172** — viviana-ui Table select-all uses `selectedKeys === "all"`
  instead of `isSelectAll`.
- **#176 / #178** — nine catalogue slugs have no notes; some notes claim
  accepted without D5/D6 citations.
- **#177** — write ColorEditor and ColorPicker notes (classification is
  done).

### Child rollup

81 children (#137–#181 from round 1, #184–#219 from round 2). 7 verified,
1 in-progress, 73 open.

Verified: #140, #143, #145, #148, #152, #156, #167.

In progress: #177 (notes remaining; round 2 asks the owner to correct the
ColorEditor label to composition first).

Open, by theme (round-1 children first, then round-2):

- Security / CI: #137, #138, #139
- Architecture / packaging: #141, #142, #144, #146, #147, #149, #150; #211, #212, #213
- Docs process: #151; #210, #215
- TypeScript: #153, #154, #155, #157, #158, #159; #214
- Testing / gates: #160, #161, #162, #163, #164, #165, #166; #191, #193, #194, #195, #196, #197, #203, #204, #205
- Solid hydration / behavior: #168, #169, #170, #171, #172, #173, #174, #175; #184, #185, #186, #187, #188, #189, #190, #192
- A11y notes / i18n: #176, #178, #179, #180, #181; #198, #199, #200, #201, #202
- Upstream API parity: #206, #207, #208, #209
- Owner decisions: #216, #217, #218, #219

## Round 2 (2026-09-01) — adversarial re-audit

Orchestrator plus fourteen investigators red-teamed every round-1 finding
and verdict, reviewed the six commits above, and opened axes round 1 did not
cover (i18n/RTL, upstream drift and guard semantics, SSR/hydration, public
API/DX, harness integrity, perf/bundle). Evidence:
`output/audit-2026-09/round-2/` (`TRIAGE.md` is the index; one file per
axis; `gates/` holds every log). That directory is gitignored working
evidence; this ticket and the child tickets are the durable record.

### Gates run in round 2 (full ladder, once)

Green: `check`, `typecheck:all` (includes `build`), every `guard:*` except
the two below, `docs:check`, `ci:changesets`, `test:run` (272 files, 5683
passed, 1 expected fail, 6 skipped), SSR suite (24), `test:web` (39),
`test:comparison-data` (12), `build`, `guard:jsx-deopt-size`, `ui:smoke`
(159/159 export files, 38/38 subpaths, 68/68 CSS rules), `comparison:build`,
`report:parity:strict`, `comparison:test:contract` (93),
`comparison:test:pair` (6), `comparison:test:certified` (**2120 passed, 4
skipped**, 28 min), `a11y:full` (10 + 80 + 45), `guard:upstream-test-parity`.

Red:

- `guard:attribution-headers` — red since `19ed5c48` (2026-08-30) and in no
  workflow. Fixed in round 2 (mirror results inherit review contracts) and
  wired into Certification Gates.
- hydrate suite — 2 failed / 24: #134 ListView (known) and **Form+TextField
  (profile shape)**, a hydration-key desync when a TextField has a
  `description`. New blocker → **#184**. This is the concrete cost of #160.
- `guard:upstream-freshness` — advisory; RAC 1.21.0 / S2 1.7.0 exist → #216.

### Corrections to round 1

- F-SOLID-012 was a wrong finding: `createToggleState` re-accesses props; no
  freeze. The lying comments and the `patterns.md` freeze story are the
  defect → #192.
- F-TEST-009's floor-test half was wrongly dropped as #91 → #193.
- F-TS-006's thenable evidence did not belong on #49; `void` landed.
- F-PACKAGING-003: `guard:package-artifacts` _is_ in CI via `build`; the
  hole is the check (#147 note).
- F-TEST-004: Meter and text-entry-callback D12 specs exist; gap stands (#162
  note).
- F-TEST-011 raised to high: React portals to `document.body`, Solid to the
  island (#166 note).
- F-A11Y-002: ColorEditor is not S2 parity; the source and vendored S2 say
  composition (#177 note).
- F-DOCS-004 and F-QUALITY-004 fix-nows closed three instances of a class,
  not the class (42 ticket files; `testers.ts` still tracked) → #215; module
  deleted in round 2.
- Round-1 quality census: #1 already carried 995 / 33,036; only the line
  total drifts (32,588 today).
- #145's done-when was not fully closed: archive globs and the viviana-ui
  README sentence survived; removed in round 2.

### The six commits under review

- `abafbd4d` Button `createMemo(() => local.children)`: right adapter, both
  copies match. Missing evidence → #187; the wrapper-visibility move patches
  a non-reactive `createIcon` context read → #186.
- `72ec9157` fixed SegmentedControl icons-in-context in `solid-spectrum`
  only; **`@proyecto-viviana/ui` still resolves children before the
  provider** → #185 (high; published defect).
- `2b560c42` / `9af12739`: label-click repair is right; `checkControl` went
  page-global and ActionButton hover/pressed moved to cloned capture, which
  cannot see `:hover`/`:active` → #197; #182 body corrected by note.

### Landed in round 2 (behavior-preserving, verified per set)

- `scripts/report-attribution-mappings.mjs`: byte-mirror results inherit
  headerless / composite / local review contracts. That unmasked seven
  contract failures from `1217ad39` (TokenField + PreviewTrigger port) that
  the orphan abort had hidden: the two TokenField headers were synced to
  Adobe's truncated upstream block verbatim (`sync:attribution-headers`;
  owner may prefer a corrected notice — that needs a guard exception class,
  not a hand edit), and five local barrels/contexts were re-reviewed
  (re-export-only diffs) and re-hashed in `attribution-local-reviews.json`.
  Guard green: 465 exact, 12 headerless, 75 composite, 200 local.
- `packages/solidaria-components/src/Label.tsx`: single `for` in SSR output
  (regression assertion in Form SSR test; changeset).
- Breadcrumbs measure id via `createUniqueId` (both copies); `void` on the
  four `fonts.ready.then` sites; one-read `children` on Table column/cell
  (styled and headless), BreadcrumbItem, TreeItemContent (changeset).
- `vitest.hydrate.config.ts` / `vitest.ssr.config.ts`: `optimizeDeps.noDiscovery`
  so the hydrate scan stops walking `output/*.html` and the oracle.
- Archive leftovers: comparison Astro globs, `report-layer-imports` skip,
  viviana-ui README sentence.
- Guards: `check-doc-routes` exact path match; `check-rac-parity` stale
  backlog removed; `check-upstream-oracle` compares comparison versions to
  the pin; `neverBundle` regexes on styled and solidaria pack configs.
- CI: `guard:attribution-headers` and `guard:jsx-ref-dead-code` on
  Certification Gates; `test:web` on `ci:release-readiness`; tokens-pin
  comment names both packages. `brotli-size` dependency removed.
- Admin: RoadmapPanel status select labeled; encoded-control href cases on
  the admin markdown test.
- Deleted `packages/solidaria/test-utils/testers.ts`.

### Gates after the round-2 fixes (final tree)

Logs: `output/audit-2026-09/round-2/gates/post-fix/`.

Green: `check` (after formatting nine files), `build`, `guard:package-artifacts`
(816 targets, 956 header references), `guard:jsx-deopt-size`,
`guard:jsx-ref-dead-code`, `guard:attribution-headers` (465 exact, 12
headerless, 75 composite, 200 local), `guard:layer-boundary` (532 identical,
76 diverged, 0 new forks), `guard:docs-routes`, `guard:rac-parity`,
`guard:upstream-oracle` (now includes the comparison manifest),
`guard:spectrum-tokens-pin`, `guard:generated-icons`, `guard:idiomatic-solid`,
`guard:invented-utilities`, `ci:changesets`, `docs:check`, `test:run` (272
files, 5683 passed, 1 expected fail, 6 skipped), SSR (24), `test:web` (40),
scoped `comparison:test:certified` over the 25 specs whose components
changed — Label consumers, TableView, Breadcrumbs, Tabs, TreeView — **885
passed, 4 skipped, 0 failed** (9.1 min), `git diff --check`.

Still red, by design: hydrate 2 failed / 24 passed — #134 ListView and #184
Form+TextField. Nothing in round 2 changed those two results; the Breadcrumbs
hydrate case stayed green after the `createUniqueId` change.

Not re-run after the fixes: the full certified suite (the scoped run covers
every component whose source changed), `a11y:full`, `ui:smoke`,
`comparison:test:pair` / `contract` (no comparison-app source changed except
the Astro globs, and `comparison:build` is green).

### Owner decisions (round 2) — all taken 2026-09-01

| Ticket   | Decision                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #216     | Train completion = pin moved + inventory ticketed + certified green. #82 closed under it; #220 opened; pin moves before the functional pass; #118 re-aimed at 1.21.             |
| #217     | Freshness stays advisory but must never say "current" unchecked: exit 2 + `unknown` state in the summary (implemented in `7e94c39b`).                                           |
| #218     | S2 barrel equals S2 exports (#221); MenuButton out (#222); viviana-native names off the `ui` barrel (#223); upstream item names canonical (#224); `class` is the one port rule. |
| #219     | Per-export cost table + ratchet (#225); solid-stately per primitive (#226); per-file subpaths generated from S2 (#227); locale split inside #198.                               |
| #177     | ColorEditor relabeled `composition`; note names the S2 primitives it composes.                                                                                                  |
| #48, #81 | Still owner-open: done-when met / resume-here stale — close or rewrite.                                                                                                         |

### Closed after round 2

- **#184** Form+TextField hydration abort — root cause was `solidaria`
  `mergeProps` reading every getter during merge (a `children` getter
  instantiates the tree, so the server minted the necessity span twice).
  Fixed structurally: non-handler/class/style getters are copied lazily with a
  read-time fallback to the earlier value. Hydrate suite 26/27 (only #134
  red); viviana-ui Form SSR/hydrate twins added.
- **#185** viviana-ui SegmentedControl icons before the provider — ported the
  nested-owner shape; failing-first test added (`e3fc6062`).

### Highest-signal remaining work after round 2

- **#220** pin move to RAC 1.21.0 / S2 1.7.0 — first, so the functional
  pass compares against current React.
- **Functional pass** (not yet ticketed; needs the owner's seed list of
  observed bugs) — React and Solid driven through the same interaction
  scripts, DOM/ARIA/state diffed per step; divergences become tickets and
  certified tests.
- **#160** now has a demonstrated cost and prerequisites (#191).
- **#198–#202** the i18n spine above the headless layer is two locales and
  English literals; D10 cannot see it.
- **#194 / #195 / #196** the comparison CI jobs labelled pair/contract are
  floors in front of the certified suite.
- **#203 / #204** the guards that print "parity" are name matches and a
  frozen ratchet.
- **#206–#209** silent Rule #2 inventions on the five high-traffic
  components (accessors, size aliases, Heading, render props).
- **#221–#227** the barrel and shape decisions — public-API changes, sequenced
  after the functional pass.

## Round 2, wave 3 (2026-09-02) — upstream train, D13, structural fixes

Every item above except #160/#191, #206–#209 and #221–#228 moved. Landed on
`main` (local, ahead of `origin/main` by 41 commits; push waits for the
browser gates below):

- **Upstream train (#220)** — pin RAC 1.21.0 / S2 1.7.0 (`f56660b`):
  behaviour fixes #229–#239, #241, #242 (`e97bb6f2`, `ad4f3030`, `8e409052`,
  `1ea67d34`); S2 1.7.0 `1lh` icon sizing through the style macro, #240
  (`649852a2`).
- **i18n spine (#198–#201, #253)** — 34-locale catalogs for solidaria,
  solidaria-components, solid-spectrum and ui; English literals routed through
  upstream keys (`9ec33c6d`, `98293143`, `35eed271`); ICU compiled once in
  `createStringFormatter` by a port of `@internationalized/string-compiler`,
  the dnd and S2 ad-hoc compilers deleted (`b0388142`).
- **Guards (#203–#205)** — ticketed-pending export gap, one-way test-parity
  ratchet with `--allow-growth <ticket>`, oracle-driven keyboard walks.
  Ratchet growth absorbed this wave: `menu|key|arrowleft` (#201),
  `combobox|aria|aria-setsize` (#252), `combobox|role|alert` /
  `select|role|alert` (#248), `tabs|role|listbox` (#257) — each S2/RAC-source
  backed, none asserted by a pinned upstream test.
- **Comparison CI (#194–#196)** — sharded blocking certified jobs with a
  tracked waiver gate; pair/contract are floors (`b09d78df`).
- **D13 interaction journeys (#243)** — driver, seeds, seeded fuzz + nightly
  (#244/#247, `684978bf`); step vocabulary and observation classes for the
  ComboBox/Picker inventories under `apps/comparison/playbook/journeys/`
  (#245/#246, `62627658`); driver unit tests under a node vitest config in CI.
- **Owner-reported overlay defect (#248)** — headless ComboBox/Picker ARIA
  parity (`1d988fd9`); field wiring through `createField` + `createSlotId`,
  HelpText in the S2 Text/FieldError shape, RadioGroup stable across the
  slot-id probe (`2ac31ca9`); headless Popover owns RAC enter/exit animation,
  ActionMenu timers and DatePicker's private popover deleted (#251,
  `179e19c7`); styled ComboBox/Picker/Menu/ActionMenu/TabsPicker compose the
  S2 Popover, four popover style forks deleted (#257, `a61a0204`); S2
  ComboBox/Picker listboxes virtualized with S2 layout options (#252,
  `8f5245e7`); Virtualizer context-only with the collection element as the
  scroller, `data-virtualizer` wrapper and harness compensation deleted
  (#256, `52ab0c52`).
- **Comparison app lag (#250)** — fixture registries split per slug for both
  stacks (`a4eacf40`); #255 measures the remaining dev-server module graph.

### Browser gates: root cause found, not the machine (corrected 2026-09-02 13:00)

The earlier note blaming the WSL2 instance was wrong. Chrome for Testing 151
(Playwright 1.62 build `1234`) never issues a compositor frame through
SwiftShader on this host — `requestAnimationFrame`, `requestIdleCallback`,
CSS transitions and `--screenshot` all hang — while build `1228` (Chrome 149)
renders instantly. `--disable-software-rasterizer` fixes 151.
`apps/comparison/playwright.config.ts` now passes
`COMPARISON_CHROMIUM_ARGS` into `launchOptions.args` (`697018f6`); every
local browser run needs
`COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`. Details in
`.claude/current/tooling.md` (Host note). CI is unaffected and leaves it unset.

### Wave-3 browser gates on the final tree (`11a35694`, run 13:01–13:55)

Logs: `output/audit-2026-09/wave-3/gates/` (`_summary.txt`, one log per gate).
Failures split per cluster with the verbatim React-vs-Solid diffs in
`output/audit-2026-09/wave-3/failures/*.txt`.

- contract **93/93**, pair **6/6**, ui:smoke green.
- a11y:full **9/10** — the one failure is a 120 s `frame.evaluate` timeout on
  the first axe scan (`[dark] WCAG 2.1 AA`); the light twin passed. Re-run
  before treating it as a violation.
- certified **2079 passed / 45 failed / 4 skipped** (round 2: 2120 / 0). The
  45 are seven clusters, all attributable:
  - `picker-list-width` (21: D1 ×6, D3 ×6, D8, D9 ×6, D10 ×2) — the open
    Picker list is 5.84 px narrower than React (`208px` vs `202.156px`, the
    `--trigger-width` custom property). Regression from #257 (`a61a0204`).
    Both stacks measure `getBoundingClientRect().width` of the trigger
    (RAC `Popover.tsx:309-331`, Solid `Popover.tsx:486-512`), so the element
    being measured differs; start at `solid-spectrum/src/picker/index.tsx:562-566`
    (`triggerRef` fallback) and `solidaria-components/src/Select.tsx:601-603,
766`. Needs the browser. **Not started.**
  - `datepicker-popover` (6: D2 motion ×4, D5 focus ×2 on DatePicker and
    DateRangePicker) — enter translate `0px 4px` vs React `0px -4px` (S2
    `Popover.tsx` keys the sign on the `placement` render prop), and one extra
    Tab stop before the calendar "Previous" button. Regression from #251
    (`179e19c7`). **Lane running / possibly landed uncommitted** — see below.
  - `avatar-d1` (10) — `transition-property: opacity` vs `none`. Both stacks
    are faithful to S2 `Image.tsx:185-201,316` (`loadTime > 200 ms`); the
    React panel paid the cold image fetch, Solid got the cache. Harness made
    deterministic by delaying the fixture image 300 ms for both panels
    (`f0ba29d7`). **Needs the browser re-run.**
  - `colorfield-ax` (1) — ColorField lost `aria-describedby`; `createColorField`
    minted its own ids and the headless ColorField provided no
    `TextContext`/`FieldErrorContext`, so `HelpText`'s S2 slot shape (from
    `2ac31ca9`) had nothing to attach to. Fixed through `createField` +
    slots as RAC `ColorField.tsx:258-282` (`f0ba29d7`). **Needs the browser
    re-run.**
  - `virtualizer-scroll-window` (1) — Solid renders all 60 items (no
    windowing); `listbox-dnd-reorder` (2) — after `Enter` starts a keyboard
    drag, focus stays on the listbox instead of the drop indicator.
    Regressions from #256 (`52ab0c52`) or the ListBox edits in `1d988fd9` /
    `e97bb6f2`. **Lane running / possibly landed uncommitted** — see below.
  - `d13-journeys` (4: ComboBox ×2, Picker ×2) — step-0 DOM shape diffs, not
    regressions: render-prop data attributes Solid emits and React does not
    (`data-open`/`data-pressed`/`data-hovered`/`data-focus-visible` on
    trigger/input/svg), hidden-input order, a `<form>` where React has a
    `<template>`. These are #248 step-0 / #209 / #254 work. The seeds decide
    #248's H1/H2 only once step 0 passes. **Not started.**

### Handoff for the next agent (written 2026-09-02 14:30)

State: local `main` at `f0ba29d7`, 44 commits ahead of `origin/main`
(protected). PR [#33](https://github.com/proyecto-viviana/ui/pull/33)
(`audit-2026-09-round-2` → `main`) is open and 34 commits behind local `main`;
when the owner authorizes, fast-forward that branch from `main` and push it —
do not push `main` directly.

Two fix lanes were mid-flight when this handoff was written; their edits may
be sitting **uncommitted** in the working tree. Check `git status`:

- Virtualizer/DnD lane — files under `packages/solidaria-components/src/`
  (`Virtualizer`, `ListBox`, `GridList`, `Tree`, `Menu`, `Table`,
  `DragAndDrop`), `packages/solidaria/src/virtualizer/ScrollView.ts`,
  `packages/solidaria/src/dnd/createDroppableCollection.ts`, and tests. Its
  report lands as `### Wave-3 regression fix` under `## Landed` in #256 (or
  #248/#229 if the DnD cause was there). It had the only browser slot and ran
  `virtualizer`, `dnd-listbox`, `listbox`, `gridlist`, `tableview`,
  `treeview` certified specs against a preview on port 4340/4341 — kill any
  leftover `astro preview` on those ports (`pgrep -fa 'astro preview'`).
- DatePicker lane — `packages/solidaria-components/src/{Popover,DatePicker}.tsx`,
  `solid-spectrum`/`viviana-ui` `popover/**` and `calendar/**`, tests. Report
  under `## Landed` in #251. It was unit-only; nobody has run
  `datepicker`/`daterangepicker` certified for it yet.

If a lane's report is missing from its ticket, treat that diff as unverified:
read it, run the gates listed below, and either commit it with the ticket note
or ask the owner — never `git restore` it silently (Operating rules).

Gate procedure for the remaining browser work (one build/preview at a time;
the `dist` and package `dist/` directories are shared):

```
export COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer
vp run build && vp run comparison:build
COMPARISON_PORT=4341 vp run comparison:preview --host 127.0.0.1 --port 4341 &
cd apps/comparison && COMPARISON_BASE_URL=http://127.0.0.1:4341 \
  vp exec playwright test e2e/certified/<slug>.certified.spec.ts --reporter=line
```

Order of remaining work:

1. Land/verify the two lanes above; run `colorfield`, `avatar`, `datepicker`,
   `daterangepicker`, `virtualizer`, `dnd-listbox` certified specs.
2. Picker `--trigger-width` (21 checks) — needs the browser; fence
   `solid-spectrum/src/picker/**` + `viviana-ui` twin + `Select.tsx` if the
   trigger ref is wrong there. Do not patch `Popover.tsx` for it unless RAC
   measures differently.
3. D13 step-0 items for ComboBox/Picker (4 checks) under #248; render-prop
   attribute emission belongs to #209, composition to #254 (owner decision).
4. Re-run `a11y:full`; then the full `comparison:test:certified` and expect
   0 failed (4 skipped are tracked waivers).
5. Flip every `## Landed` ticket whose proof is green to `done`, run
   `vp run docs:generate && vp run docs:check`, `git diff --check`, commit,
   then the branch push above.

Recurring mechanics: reviewed-local attribution mismatches are re-recorded by
replacing `contentSha256` in `scripts/attribution-local-reviews.json`
(re-export-only diffs only; read the diff first); ported files get
`vp run sync:attribution-headers`; ratchet growth is absorbed only when the
fact is upstream-source-backed, with
`vp run guard:upstream-test-parity -- --write-baseline --allow-growth <ticket>`
and a note on the ticket; `docs:generate` rejects a task whose `parent:` is a
task — parent under #136 or an initiative.

### Wave-3 close-out (2026-09-02, orchestrator)

Full certified against preview `:4341` (`COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`):
**2118 passed / 6 failed / 4 skipped** (was 2079 / 45 / 4).

Green this close-out: Virtualizer windowing, Picker `--trigger-width`,
DatePicker/DateRangePicker D2+D5, ColorField describedby, Avatar D1 (no-store
fixture delay).

Remaining 6:

| Cluster                                                    | Count | Owner              |
| ---------------------------------------------------------- | ----- | ------------------ |
| D-reorder keyboard DnD (`listbox:Permissions` after Enter) | 2     | #256               |
| Picker D13 step-0                                          | 2     | #209 / #248 / #254 |
| ComboBox D13 step-0                                        | 2     | #209 / #248 / #254 |

#254 is an open owner decision — do not start building it. PR #33
fast-forward is blocked on explicit go.

a11y this close-out: comparison axe **80/80** against `:4341`. Playground
`[dark] WCAG 2.1 AA` still 120 s `frame.evaluate` timeout (same as wave-3;
not a violation; remaining 9 tests did not run). `a11y:smoke` playground
clicks hung waiting for "stable" (Chrome 151 / no compositor frame) — aborted.

### Wave-3 CI follow-through and handoff (2026-09-02, evening)

State: PR [#33](https://github.com/proyecto-viviana/ui/pull/33) is
fast-forwarded to local `main` (owner go, 2026-09-02); `origin/main` is
protected and 60+ commits behind. Keep pushing the branch from `main`, never
`main` directly. Local tree is clean after the checkpoint commit below.

Landed after the 18:11 close-out (all with tests red on the unfixed tree,
changesets where a releasable package changed):

- `a741273a` release-readiness: `browserslist`/`fast-uri` overrides past the
  open advisories; S2 1.7.0 icon inventory regenerated (`TagIcon` geometry,
  838 version headers); fmt drift.
- `2e83cdbb` Codex P2 on #33: the single `children` read in S2/Viviana
  ComboBox option, Picker item, StatusLight and Kumo Button is a tracked memo.
- `6f03c6fa` + `43d2aa28` Virtualizer docs page; Virtualizer/ListBox hydrate
  over SSR (scroll view's first measurement waits for the hydration walk;
  `OptionContent` one-read helper for ListBox/ComboBox/Select options).
- `50f76592` `api:extract`; `c74beba8` `solid-spectrum`/`viviana-ui` pack
  passes one process each (`PACK_PASS`, macro-CSS `renderChunk` race).
- `b0460ae8` `guard:s2-intl-catalog` (oracle-backed, in Certification Gates)
  replaces the two `intl-catalog.test.tsx` files that read the git-ignored
  oracle from `test:run`.
- `b790e84e` headless Popover renders a render-prop child once
  (`menu-focus.spec.ts:45`, #257) — and regressed `:20`, see below.
- `ca4c4158` Table `th`/`td` keyed before their children on both compilers
  (`/showcase/collections` hydration crash, #256 regression).
- Checkpoint after `ca4c4158`: `createRadio` describedby probe is client-only
  (`/showcase/selection` SSR crash, #258 note).

CI on `ca4c4158`: Release Readiness green, Changesets Check green,
Certification Gates red, Site Gate red. The four reds, with owners:

1. Certification Gates → `a11y:full` → `apps/web/e2e/menu-focus.spec.ts:20`
   (ArrowUp reopen during the exit animation never focuses `"Save"`). 3/3 on
   `b790e84e` and `ca4c4158`, green on `b0460ae8`: a regression of the Popover
   fix. Diagnosis, upstream comparison points and the reproduction recipe are
   under #257 "Follow-up regression". Fix in the headless layer, not the e2e.
2. Certification Gates → certified report: **2118 passed / 2 failed / 4
   skipped**. The two are the D-reorder keyboard DnD trails (#256, unchanged).
   The four ComboBox/Picker D13 step-0 rows from the close-out table are green
   now, so the open-row count is 2, not 6.
3. Site Gate → `a11y:contrast` → `/showcase/selection`: the route error
   boundary was on screen (SSR `document is not defined`). Fixed by the
   checkpoint; the next run shows whether the route's real content passes.
4. Site Gate → `a11y:contrast` → `/showcase/inputs`: two `slot="errorMessage"`
   spans, `[light] #db2e26 on #f2f6fa = 4.36 (needs 4.5)`. Traced, not fixed:
   the ink is Viviana's glasselated `red-900` light
   (`packages/viviana-ui/src/style/glasselated-ramps.ts:199`, brand `--red-500`
   promoted to a ramp; `negative-content-color-default` resolves there), and
   the surface is `--surface-panel` `rgba(255,255,255,.42)` over
   `--surface-app #e9eff6` = `#f2f6fa`. The ramp header pins semantic 900s to
   ≥ 4.5 on **white** (`#db2e26` is 4.74 there); the register's text surface
   is the panel, so the pin is measured against the wrong background. Not S2
   (`solid-spectrum` negative is Adobe `rgb(215,50,32)`) and not page chrome —
   `2f7ac610` already named "Viviana … error tokens" as the remaining contrast
   failures. This is a register decision (Rule #3): floor `red-900` light to
   ≥ 4.5 on `#f2f6fa` keeping ≥ 0.02 OKLCh L gaps to 800 `#ee4337` and 1000
   `#bb241e` (the green ramp's 900 was floored the same way), or repoint
   `negative-content-color-default` to `red-1000` in viviana-ui's
   `spectrum-theme.ts` (the ramp header's own suggestion for the ink stop).
   Check amber `#af6400` and green `#1a8346` 900s against `#f2f6fa` in the same
   pass; rebuild `viviana-ui` (the macro bakes color at build time). Do not add
   a `contrast-exemptions.ts` entry — it is real text.

Order for the next agent: (1) #257 follow-up; (2) owner decision on `red-900`,
then the viviana-ui change with a changeset and a contract test that pins the
900 inks against the panel composite, not white; (3) owner decision on the two
D-reorder rows (waiver on the ticket, or continue #256's option-remount fix);
(4) re-run Certification Gates + Site Gate on the branch; (5) merge #33, review
the `chore(release): version packages` PR the Release workflow opens, merge it
to publish (`release-policy.md`). Still recorded and unstarted: the ~40
probe-then-render children sites across the styled layers (#256 note) need one
ticket and the shared one-read helper.

### Owner decisions open after wave 3

- **#254** RAC context composition for ComboBox/Select (plain
  `Input`/`Button`/`ListBox` from context vs the bespoke compound parts).
  Evidence and proposal are on the ticket; blocks porting the RAC ComboBox/
  Select suites verbatim.
- **#255** dev-server module graph: pre-bundle the Solid packages in dev,
  deep imports, or dynamic demo loading — measurements on the ticket.

### Still open from round 2

#160/#191 (hydrate gate cost), #202 (D10 over catalogs/RTL), #206–#209
(Rule #2 inventions), #221–#228 (barrels, shapes, NavigationTree), #249
(journeys for the rest of the overlay family), #258 (RadioGroup TextContext
slots).

## Done when

Every child is merged, verified, owner-blocked, or explicitly dropped with a
note. Generated `status.md` and `roadmap.md` show the resulting board.

## Relationship

Sibling of #24 (per-component acceptance) and #87 (remaining-work census). Do
not absorb those programmes into this initiative. Deltas on existing tickets
were written onto those tickets instead of duplicated here.
