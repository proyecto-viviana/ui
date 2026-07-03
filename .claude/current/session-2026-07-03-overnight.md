---
kind: plan
status: session
---

# Overnight session plan — 2026-07-03 (5-hour autonomous run)

Status: session log + checkpoint tracker for the owner's morning review.
Retire after review (git history is the archive) — fold durable outcomes into
`recertification.md`, `status.md`, and validation notes; then delete this file.

## Mandate (owner, 2026-07-03)

- Major goal: full behavior, styling, and a11y parity on the solid-spectrum
  port. Focus: the styling macro, the comparison app, the full solid-spectrum
  stack. `@proyecto-viviana/ui` is out of scope tonight.
- Additional first-class focuses: idiomatic SolidJS usage, correct Web API
  usage (recertification Phase 3 names this sweep; pulled forward tonight).
- Depth over breadth — as many components thoroughly as the drivers allow;
  the march order is the plan for whatever remains.
- Hard constraints: never leave the repo, no history rewrites, no pushes,
  everything traceable as commits on `main`. One commit per checkpoint unit.

## How tonight maps to the plan of record

`recertification.md` is the plan of record. Tonight executes it in order:
finish Phase 0 (0.5–0.6), land Phase 1 drivers (the multiplier for every
future component), then run the Phase 2 march from the top of Tier 1 for as
long as quota allows. Drivers land with the three pilots (Button, Tabs,
Dialog) proven and calibration-checked. No fleets beyond one sequential
workflow at a time; sonnet helpers for mechanical generation.

## Checkpoints

Each checkpoint ends in a commit (or a recorded blocker here). Status values:
`pending / in-progress / done(commit) / blocked(reason)`.

| CP  | Unit                                                              | Status |
| --- | ----------------------------------------------------------------- | ------ |
| 0   | Verify + commit in-flight recertification 0.5                     | done (9df33f69) |
| 1   | Recertification 0.6 — blocking axe gate includes color-contrast   | in-progress |
| 2   | This plan committed                                               | in-progress |
| 3   | Driver D1 state-matrix computed-style pair diff + pilots green    | pending |
| 4   | Driver D3 strict pixel pair diff riding the D1 state walk         | pending |
| 5   | Drivers D4 event-sequence + D5 focus/keyboard trails              | pending |
| 6   | Driver D6 AX tree + announcements                                 | pending |
| 7   | Driver D2 motion (filmstrip a + metadata b + reduced-motion d)    | pending |
| 8   | Drivers D7 contrast + D8 target size (derived from D1 walk)       | pending |
| 9   | Phase 2 march: Tier 1 primitives, red→green, one commit each      | pending |
| 10  | Idiomatic-Solid + Web-API review sweep over solid-spectrum stack  | pending |
| F   | Wrap: queue/docs refresh, session summary, final commit           | pending |

Driver order rationale: D1/D3 catch the styling-divergence class the owner
found by hand (highest hit rate); D4/D5/D6 are the behavior + a11y core;
D2 closes the animation blind spot (every existing screenshot spec passes
`animations: 'disabled'`); D7/D8 are near-free derivations of the D1 walk.
D9 (forced colors), D10 (RTL), D11 (timing), D12 (SSR) are follow-on
parameterizations — landed tonight only if the march leaves room, otherwise
they stay next in the Phase 1 queue for the following sessions.

## The plan for whatever remains unfinished

Nothing tonight invents new process: the remaining work is exactly the
unchecked items of `recertification.md` Phase 1 (drivers D9–D12) and the
Phase 2 march order (Tier 1 → Tier 6), one component per session, each
through every applicable driver. Any component tonight leaves `blocked` gets
its reason in the queue and a tech-debt entry. The calibration ledger
(`audit-durable/`, session storage) keeps auditing the drivers until it
empties.

## Session log

- 07:10 CP0: working tree held completed 0.5 (CI-on-main + typecheck:apps);
  verified `vp run build` + `typecheck:apps` green; committed 9df33f69.
- 07:16 CP1 started: `comparison-axe.spec.ts` disables `color-contrast`
  unless `AXE_INCLUDE_CONTRAST=1`; blocking `a11y:check` never sets it.
  Plan: rebuild comparison, run axe with contrast on, fix reds, flip the
  default so the blocking gate always includes contrast.
