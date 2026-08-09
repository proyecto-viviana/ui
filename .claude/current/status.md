---
kind: reference
status: current
---

# Status

Status: live evidence snapshot.
Update when: a refresh changes a measured fact. Refresh from commands and exact
GitHub revisions, never memory.

Last refreshed: **2026-08-09** against
`main@20fb6164191a0b4f96535991e25a58af00ab998d` with a clean worktree at the
start of the run.

## Snapshot

| Area                      | Current evidence                                                                                                                                                                                                                                                                                                                                                                  | Interpretation                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Protected `main`          | Latest assessed `main` workflows green: Certification Gates, Changesets, Release Readiness, Site Gate, and Release. Required strict contexts are `certification-gates`, `changesets-check`, `release-readiness`, and `site-gate`; administrator enforcement on; force push/delete off.                                                                                            | CI incident repair is landed. A neighboring green SHA never qualifies a new one.  |
| Release train             | Version PR #20 head `c457fca96a671c6a75e4a944b424c20b948d195f` is open, mergeable, and exact-head green for all four required contexts. It would publish solid-spectrum 0.6.4, solid-stately 0.5.1, solidaria 0.4.3, solidaria-components 0.5.1, and ui 0.6.3.                                                                                                                    | Technically ready; automatic npm publication awaits explicit approval.            |
| Consumer tarballs         | `vp run ui:smoke`: PASS — five packages installed outside the workspace; DOM + SSR built/rendered; 149/149 export files, 36/36 JS subpaths, 64/64 classes backed by CSS, no `src` leak.                                                                                                                                                                                           | Strongest installed-consumer floor.                                               |
| Unit suite                | `vp run test:run`: PASS — 265 files; 5535 passed, 1 expected fail, 10 skipped.                                                                                                                                                                                                                                                                                                    | Green.                                                                            |
| Contract suite            | `vp run comparison:test:contract`: PASS — 93/93.                                                                                                                                                                                                                                                                                                                                  | ARIA-vocabulary contracts hold.                                                   |
| Certified suite           | Current exact-main hosted Certification is green. Most recent full local qualification: 2170 passed, 6 skipped, 0 failed; 12/12 drivers.                                                                                                                                                                                                                                          | Blocking parity floor; not a substitute for closing baseline gaps.                |
| Format/lint/type          | `vp run check`: PASS — 2897 formatted files; 2740 linted; zero warnings; root typecheck clean.                                                                                                                                                                                                                                                                                    | Green.                                                                            |
| Release readiness         | `vp run ci:release-readiness`: PASS after the plan refresh — all five public-package builds/declarations, comparison diagnostics (0 errors), and package tests (265 files; 5535 pass, 1 expected fail, 10 skip).                                                                                                                                                                  | Local aggregate qualification is green.                                           |
| App typecheck workflow    | Standalone `vp run typecheck:apps` false-reds on a clean artifact tree because workspace packages are not built; partial UI-chain build still omits the web app's direct solid-spectrum artifact. Canonical aggregate lanes build prerequisites and pass.                                                                                                                         | Tooling/precondition defect, issue #28; do not report it as product type failure. |
| Docs/task model           | `vp run docs:check`: PASS after the plan rewrite. 91 tasks — 44 done, 39 open, 5 in progress, 3 next, 0 blocked.                                                                                                                                                                                                                                                                  | Roadmap/task links and finished-state invariants are internally consistent.       |
| RAC tracked/API surface   | `guard:rac-parity`: 0 missing tracked symbols. `guard:rac-export-gap`: upstream 247, local 414, missing 0, extra 167.                                                                                                                                                                                                                                                             | Required/name surface closed; extras remain documented-local-addition territory.  |
| S2 catalogue              | `comparison:report:gaps`: 78/78 live on React and Solid, 0 implementation gaps; 359 visual states, 113 current evidence rows, 56 strict pair diffs, 0 blocked.                                                                                                                                                                                                                    | Catalogue/route presence complete.                                                |
| Strict S2 model           | `comparison:report:parity:strict`: **PASS under baseline**; 69/78 modeled. Frozen gaps: ActionGroup, Autocomplete, GridList, LabeledValue, ListBox, ListBox DnD, StepList, Toolbar, Virtualizer.                                                                                                                                                                                  | Regression guard green; acceptance debt open under issue #24.                     |
| S2 value exports          | `comparison:report:exports`: upstream 218, local 281, missing 7, extra 70; catalogue root exports missing 0.                                                                                                                                                                                                                                                                      | `LabeledValueContext` plus six DnD exports remain; issue #25.                     |
| Upstream oracle/freshness | Oracle commit `c4de1e2235bce213d392477a2ebc1e575937051f` materialized; exact S2 1.5.1 / RAC 1.19.0. Freshness advisory reports S2 1.6.0 / RAC 1.20.0.                                                                                                                                                                                                                             | Current evidence reproducible; next absorption is issue #23.                      |
| Layer boundary            | 609 shared upper-layer files: 533 identical, 76 divergent; 41 Viviana-only. No new fork/unbaselined divergence.                                                                                                                                                                                                                                                                   | Guard green against a large frozen backlog; issue #26.                            |
| Type suppression          | `guard:ts-nocheck-budget`: 59 current / 59 ceiling; no new or moved suppressions.                                                                                                                                                                                                                                                                                                 | Guarded debt, not completion.                                                     |
| Site/public docs          | Site live at `https://ui.proyectoviviana.org`. Current hosted Site Gate green. Local `vp run ci:site`: PASS — WCAG 2.2 AA axe 2/2, comparison axe 80/80, route contrast 154/154, route render 155/155, SEO 157/157, API reference 4/4. Generated flagship API: 82 pages / 3367 props / 183 interfaces. Spectrum authored routes: 45 files for 78 catalogue entries, with aliases. | Site floor healthy; catalogue guidance issue #27 remains.                         |
| Dependency security       | `vp pm audit --json`: 964 dependencies; 27 vulnerable instances — 1 critical, 17 high, 8 moderate, 1 low. Critical path: `solid-js@1.9.12 -> seroval@1.5.1` (patched floor >=1.5.3); lockfile also carries 1.5.4.                                                                                                                                                                 | P0 issue #22. No dependency changed without approval.                             |

## Canonical refresh workflow

### Report lane

```bash
vp run guard:upstream-oracle
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:report:parity:strict
vp run guard:ts-nocheck-budget
vp run guard:layer-boundary
vp run docs:check
```

`guard:upstream-freshness` is advisory and currently exits non-zero because a
new train exists. Run it separately so its expected signal is not confused with
current-pin failure.

### Behavior/evidence lane

```bash
vp run test:run
vp run comparison:test:contract
vp run comparison:test:certified
```

The full certified suite is required when the oracle, shared behavior, or a
certified component changes. Targeted specs should red/green first.

### Aggregate qualification lane

Run sequentially; these tasks clean/rebuild shared package artifacts.

```bash
vp run check
vp run docs:check
vp run ci:release-readiness
vp run ci:site
vp run ui:smoke
git diff --check
```

Until issue #28 closes, standalone `typecheck:apps` is not a clean-checkout
authority unless all directly consumed workspace packages have been built.

For dependency changes add `vp pm audit --json`. For upstream absorption add
the report/guard ladder specified in issue #23. Never pipe a Playwright or `vp`
gate through `tail`; that masks its exit code.

## Sources of detail

- `repo-assessment.md` — whole-repository assessment, waves, workflow, risks,
  ticket dependency map, and owner decisions.
- `certification.md` and `apps/comparison/COMPONENT_PLAYBOOK.md` — component
  acceptance.
- `upstream-sync.md` — pin absorption.
- `release-policy.md` — Changesets and publication.
- `tech-debt.md` — task state and exits.
