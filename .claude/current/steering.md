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

Two products ship on that stack. `@proyecto-viviana/ui` is the flagship: the
Viviana register (Glasselated), the package users install, the one the site
leads with. `@proyecto-viviana/solid-spectrum` is the S2-parity substrate
underneath it, and remains the right choice for anyone who wants Adobe
Spectrum's look rather than Viviana's.

## Current Focus

**Launch.** Plan of record: `launch.md`.

Name/surface parity is closed (all pin guards green). Depth parity was the
recertification march, **COMPLETE 2026-07-15** — all six Phase-2 tiers certified,
12/12 drivers, Phase-3 closers landed; shelved to `recertification.md` (summary)
and `archive/recertification-full.md` (full log).

The 2026-07-24 audit established that **the packages are not the blocker**: they
are published, in sync with `main`, and `ui:smoke` proves they install and render
out-of-workspace. What was not ready was the **documentation surface and the
deployed site** — an installation page that never mentioned the flagship package,
six links to a 404, and a site that had never been deployed under a name of its
own. The site went live on **2026-07-24** at `https://ui.proyectoviviana.org`;
the docs surface is what remains.

So the work is no longer "port and certify." It is: make the public surface true,
make the gates that would have caught this actually fire, and ship. Parity work
resumes after launch.

## Now (P0 — launch)

Phases and findings are detailed in `launch.md`; tasks in `tech-debt.md` under
the `launch` roadmap item.

- **Record and clean** (Phase 0) — `launch.md` landed; `status.md` refreshed from
  the scripts; every finding filed; the 9 `docs:check` errors cleared; stale docs
  trees deleted; the 174-file format drift and tracked strays cleaned.
- **Make the gates real** (Phase 1) — **repair pending landing 2026-08-08.** The
  5 stale e2e selectors that turned `a11y:smoke` red (B8) are fixed. A new
  route-derived contrast gate passes all 154 routes in both themes and blocks in
  `ci:site`; the expanded playground audit is also measured green and promoted.
  The latest main run showed that the ignored Adobe oracle was never
  materialized and that Release could succeed on the same SHA as red
  Certification. The local repair makes 26 Certification steps blocking, leaves
  upstream freshness as the sole advisory, materializes the pinned oracle, adds
  watched negative fixtures, and binds publication to complete same-SHA
  evidence. Hosted PR head `98670653651fc4bd11d6e2338a05212bef019f1a`
  passed all four intended contexts; strict `main` protection now requires those
  exact contexts with administrator enforcement. \_A gate that cannot fire is
  not a gate — and neither is one promoted without being measured.
- **Prepare the next upstream absorption, but do not mix it into the incident
  repair.** Freshness correctly reports S2 `1.6.0` / RAC `1.20.0` beyond the
  exact current S2 `1.5.1` / RAC `1.19.0` oracle. After P0 lands green, work the
  release-note/source/test diff in `upstream-sync.md` as its own parity change.
- **Make the site truthful** (Phase 2) — **done.** The 6 broken GitHub links
  (B1), the installation page that omitted the flagship package and told users to
  hand-author CSS variables (B2), and npm metadata (B7) are all closed;
  `guard:outbound-links` holds them.
- **Make it safe to deploy** (Phase 3) — **done.** Route-sweep smoke over all 72
  routes (e2e covered 5), per-page `head:`, robots.txt and a generated sitemap;
  both specs run from `ci:site`.
- **Deploy** (Phase 4) — **done 2026-07-24.** Worker `viviana-ui-docs` on the
  Custom Domain `ui.proyectoviviana.org`. The finding that made this a P0 was
  that the config named the **live parent application's** Worker, so a deploy
  would have replaced a running app with a D1 database; `guard:deploy-target`
  now refuses that name as the first step of `deploy`.

## Next (P1 — coverage)

- ~~**API docs for `@proyecto-viviana/ui`** (B3)~~ — **done 2026-07-24.** `/docs`
  serves 82 generated pages covering 3,367 props, extracted from the package's
  own types and held to them by the blocking `guard:api-reference`. The package
  the README tells users to install now has a reference, not just a gallery.
- **The ~31–40 missing component docs pages** — solid-spectrum's hand-written
  tree: 45 pages against 78 catalogue components, 7 of which are aliases. Now the
  largest remaining coverage gap.
- **`macro-route-styled`** — 14 components still ship unstyled to installed
  consumers; app CSS masks it in-repo.
- **Strict-parity gaps** — `comparison:report:parity:strict` now reports 9
  entries missing modeled control groups, wider than the single `LabeledValue`
  the previous snapshot recorded.

## Later

- The DnD subsystem port (`dnd-subsystem-port`) — the one un-ported surface;
  blocks TableView/TreeView DnD rows and the last 7 S2 support exports.
- Headless-spine consumption: Menu/ListBox/ComboBox still run pre-spine
  selection wiring; migrate as their slots come up, not before.
- Package-build migration; release-bar tightening per package
  (`release-policy.md`).
- Resuming the upstream parity loop against a newer S2/RAC pin.

## Open Decisions

None currently open.

**Resolved 2026-07-24:**

- **Two-product positioning → `@proyecto-viviana/ui` is the flagship.** The site
  leads with it and documents `solid-spectrum` as the parity substrate beneath.
  This matches what the root README already told users; the site is what has to
  catch up. Recorded in `launch.md` rather than silently encoded, because it is a
  naming-and-positioning call with public reach (AGENTS.md rule #3).
- **Docs coverage does not gate the deploy.** A truthful site with 45 documented
  components beats an undeployed site with 78. Coverage moves to P1.

**Resolved 2026-07-15:**

- **D4 event-ordering policy → match React's ordering in the ports (not the
  oracle).** The one red this had to clear (`Tabs touch-tap`) turned out to be a
  wrong-event binding, not a batching gap: the faithful fix bound the roving
  commit to `focusin` (React's delegation model), and probes showed a
  microtask-defer could not have worked. Closed as `d4-microtask-defer`.

## Non-Goals

- Counting exports, routes, a green axe run, or a stable screenshot as
  acceptance.
- Per-side committed PNG baselines as focused acceptance gates.
- Hand-authored S2 component-surface CSS in the comparison app (ADR 0001).
- Adding barrel names without a report identifying a real missing upstream
  export.
- Relaunching fleet-census audits — the march supersedes them
  (`recertification.md`).
- Reopening certification for launch. The march is complete and shelved.
- Publishing new package versions as part of launch. The packages on npm are
  current and pass the out-of-workspace smoke; launch makes them findable and
  documented, not newer.

## Gates

The evidence bar and its commands live in `certification.md`; the march harness
in `recertification.md`. `comparison:report:parity:strict` and the certified
suite are expected to pass. Status is refreshed from scripts (`status.md`),
never from memory.

Piping a gate into `tail` masks its exit code — the 2026-07-24 audit initially
read `a11y:check` as passing for exactly that reason. Capture the status
explicitly when running gates non-interactively.

## Before A Task

- Which component or parity gap does this move toward acceptance?
- What upstream behavior is the authority, and where is it in installed source?
- Which gates prove it — beyond axe and export counts?

After a task, update this page only if the steering state changed; otherwise
update `status.md`, `work-queue.md`, or the component validation note that owns
the surface.
