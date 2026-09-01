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

Nothing from this audit is committed. The tree is mixed:

- This audit (tickets #136–#181, docs, trivial fixes, owner-decision
  follow-through, archive deletion).
- Preserved **#135 Button hydration WIP**. Do not reset, restore, or edit
  `packages/solid-spectrum/src/button/Button.tsx`,
  `packages/viviana-ui/src/button/Button.tsx`, related Button tests,
  `apps/comparison/playbook/components/button-validation-notes.md`, or
  changeset `reactive-button-children.md`.
- Concurrent Button harness tickets **#182** and **#183** (verified). They
  used an invalid `closed` state; that was mapped to `verified` so
  `docs:generate` could run. Their bodies were not rewritten.

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
  vs ticket-state split; relationship lines no longer point at deleted
  `tech-debt.md`.
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

45 children (#137–#181). 7 verified, 1 in-progress, 37 open.

Verified: #140, #143, #145, #148, #152, #156, #167.

In progress: #177 (notes remaining).

Open, by theme:

- Security / CI: #137, #138, #139
- Architecture / packaging: #141, #142, #144, #146, #147, #149, #150
- Docs process: #151
- TypeScript: #153, #154, #155, #157, #158, #159
- Testing / gates: #160, #161, #162, #163, #164, #165, #166
- Solid hydration / behavior: #168, #169, #170, #171, #172, #173, #174, #175
- A11y notes: #176, #178, #179, #180, #181

### Gates run in this tree

Passed: `vp run check`, `vp run docs:check`, `vp run guard:spectrum-tokens-pin`,
`vp run test:web` (39, earlier in this tree), `vp run test:comparison-data`,
`git diff --check`.

Not run: package unit/SSR/hydrate, comparison Playwright, a11y,
`vp run build`. Old comparison `dist/` pages for the deleted custom slugs
will disappear on the next comparison build.

`apps/comparison/src/data/acceptance-schema.test.ts` currently fails
`names the six certified knownDivergence fixmes` (datepicker /
daterangepicker placeholder rows). That failure is unrelated to the archive
deletion. Do not "fix" it as part of reviewing this audit unless you own
that inventory.

## Done when

Every child is merged, verified, owner-blocked, or explicitly dropped with a
note. Generated `status.md` and `roadmap.md` show the resulting board.

## Relationship

Sibling of #24 (per-component acceptance) and #87 (remaining-work census). Do
not absorb those programmes into this initiative. Deltas on existing tickets
were written onto those tickets instead of duplicated here.
