---
kind: reference
status: current
---

# Steering

Status: live reference.
Update when: direction, current focus, open decisions, non-goals, or checks
change.

The short direction layer above the work queue. Read this before choosing a task;
use `work-queue.md` for implementation detail.

## Direction

Viviana UI is Proyecto Viviana's published open-source UI suite and design
system, built on Solid. Its foundation is the unofficial Solidaria and Solid
Spectrum port stack for Adobe's React Stately, React Aria, React Aria
Components, and React Spectrum S2.

The port stack stays strict about parity: the same public behavior,
accessibility model, keyboard model, and S2 styling branches in Solid. A
component should not be described as ported until the evidence bar in
`certification.md` is met — and the recertification march
(`recertification.md`) is the mechanism that enforces that bar, component by
component, against the live upstream oracle.

## Current Focus

Name/surface parity is closed (all pin guards green). Depth parity is the
recertification march: ~35/70 styled components certified (Tiers 1–2 done,
Tier 3 in flight at Toast). The 2026-07-06 validation pass confirmed the
certified tiers are genuinely strong — and found that the biggest current risk
is **process, not code**: CI has been dark on main since 2026-06-24, the
release train is jammed, and live rot (7 unit failures, 2 a11y smoke failures,
format drift) has already accumulated unseen. Stabilize the pipeline first,
then keep marching.

## Now (P0 — stabilization)

- **Push main and wire CI to run on it** (`tech-debt.md` →
  `ci-main-gate-wiring`): the gate ladder is PR-only and this repo commits
  direct-to-main, so no gate has run in 12 days. Add a main-push workflow that
  runs the certified suite too; wire the orphaned guards.
- **Unjam the release train** (`release-train-unjam`): version PR #7, 101
  pending changesets, npm one patch behind on 3 packages — the SSR hydration
  fix has never reached installed consumers.
- **Burn down live rot** (`main-rot-burndown-2026-07`): the
  ContextualHelp/Menu/ActionMenu unit cluster, the Toolbar `End` / ActionBar
  `Home` roving-focus regressions, the remaining code/spec format drift.
- **Finish Toast** (recertification CP9.35, 24/37 → green) — first D6
  announcement evidence lands with it.

## Next (P1 — before/into Tier 4)

- **Backfill D5/D6 on Menu and ActionMenu** (`menu-actionmenu-d5-d6-backfill`):
  both certified without focus-trail or AX-tree drivers; keyboard composites
  must not certify on D1/D7 alone.
- **Decide the D4 event-ordering epic** before Tier 4 (`recertification.md`
  Open decisions): collections multiply intra-gesture ordering divergence; the
  5 deferred reds need a policy (microtask deferral in ports vs oracle
  normalization), not per-component waivers.
- **Land D9 (forced-colors) + D10 (RTL) before the Tier 4 march** — zero
  coverage repo-wide today; certifying Tier 4 first means re-running the whole
  certified set later.
- **Pull Picker first in Tier 4** (`picker-popover-anchor`,
  `picker-item-checkmark`): it is production-broken for installed consumers —
  highest-value single certification.
- **`macro-route-styled`** (`tech-debt.md`): 14 components ship unstyled to
  installed consumers; app CSS masks it in-repo. Consumer-delivery priority
  alongside Picker.

## Later

- Tier 4–6 of the march (collections, overlays, date/time; then the long tail).
- The DnD subsystem port (`dnd-subsystem-port`) — the one un-ported surface;
  blocks TableView/TreeView DnD rows and the last 6 S2 support exports.
- Headless-spine consumption: Menu/ListBox/ComboBox still run pre-spine
  selection wiring; migrate as their march slots come up, not before.
- Package-build migration; release-bar tightening per package
  (`release-policy.md`).

## Open Decisions

- **D4 event-ordering policy.** (a) microtask-defer Solid callbacks to match
  React batching, (b) normalize orderings in the oracle and document the
  divergence. Owner decision gates Tier 4.
- **D9/D10 sequencing.** Land forced-colors + RTL drivers before Tier 4 (and
  re-certify Tiers 1–3 against them), or after the march completes. Director
  recommendation: before.
- **Certification bar for keyboard composites.** Adopt "D5+D6 mandatory for
  keyboard-heavy composites" into `certification.md` gates (Menu/ActionMenu
  backfill is the test case).

## Non-Goals

- Counting exports, routes, a green axe run, or a stable screenshot as
  acceptance.
- Per-side committed PNG baselines as focused acceptance gates.
- Hand-authored S2 component-surface CSS in the comparison app (ADR 0001).
- Adding barrel names without a report identifying a real missing upstream
  export.
- Relaunching fleet-census audits — the march supersedes them
  (`recertification.md`).

## Gates

The evidence bar and its commands live in `certification.md`; the march harness
in `recertification.md`. `comparison:report:parity:strict` and the certified
suite are expected to pass. Status is refreshed from scripts (`status.md`),
never from memory.

## Before A Task

- Which component or parity gap does this move toward acceptance?
- What upstream behavior is the authority, and where is it in installed source?
- Which gates prove it — beyond axe and export counts?

After a task, update this page only if the steering state changed; otherwise
update `status.md`, `work-queue.md`, or the component validation note that owns
the surface.
