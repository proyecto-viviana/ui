---
kind: index
status: current
---

# Viviana UI — Current Docs

Status: live project docs.
Update when: direction, architecture, the evidence bar, status snapshot, checks,
or the active work queue changes.

This directory holds the project docs that change with the work. The top-level
`README.md` stays public and short; `AGENTS.md` is the operating brief for coding
agents. Detail that would make either file noisy belongs here.

`steering.md` explains what matters next and why. `certification.md` keeps its
old filename for link stability, but it now describes the evidence bar for
accepting a component as ported. `glossary.md` owns project vocabulary with
public reach.

## Read Order

1. `../../README.md`
2. `status.md`
3. `steering.md`
4. `repo-assessment.md` — current program, workflow, tickets, risks, and decisions
5. `work-queue.md`
6. `roadmap.md`
7. `architecture.md`
8. `certification.md`
9. `glossary.md`
10. `tooling.md`
11. `upstream-sync.md`
12. `release-policy.md`
13. `tech-debt.md`
14. `launch.md` and `recertification.md` for completed-program summaries
15. `../reference/patterns.md` when adapting React patterns to Solid idioms
16. `upstream-release-audit.md`
17. `ui-client-contract.md`
18. `tailwind-removal.md` when removing invented utility styling or converting a component's styled layer to the S2 macro
19. `glasselated-port.md` when working the Glasselated register port onto viviana-ui or the Viviana showcase
20. `visual-system-lane.md` for the provenance record of the landed `design/visual-system-claude-v2` visual-system lane
21. `press-path-epic.md` when scoping or implementing the item-hook press-path migration (T-34/T-51/T-52/T-56)
22. `../../apps/comparison/COMPONENT_PLAYBOOK.md` when porting or re-baselining a component
23. `../../AGENTS.md` when handing work to coding agents

## Files

| File                        | Purpose                                                                                                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `steering.md`               | Direction, current focus, now/next/later, open decisions, non-goals, checks.                                                                                                                                                                                                                     |
| `repo-assessment.md`        | **Plan of record for the current focus.** Whole-repository evidence assessment, dependency-ordered waves, repeatable gate workflow, ticket specifications, risk controls, and owner decisions.                                                                                                   |
| `launch.md`                 | Completed 2026-07-24 launch audit and outcome: product positioning, findings B1–B8, safe deploy target, and the live docs site. Remaining coverage is tracked by the current assessment rather than keeping launch open.                                                                         |
| `certification.md`          | Evidence required before a component can be accepted as ported: dimensions, floors, checks, acceptance gates.                                                                                                                                                                                    |
| `recertification.md`        | **Completed march (2026-07-15)** — outcome summary of the pair-oracle red→green program that enforced the certification bar (all six tiers + 12/12 drivers + Phase-3 closers). The full component-by-component log is archived at `archive/recertification-full.md`.                             |
| `architecture.md`           | The five-layer chain, what each package owns, the behavior-vs-styling boundary, and the comparison harness as verifier.                                                                                                                                                                          |
| `glossary.md`               | Owner-steered vocabulary: layer names, _accepted_, _evidence_, _local addition_, styled-component statuses, _pair diff_.                                                                                                                                                                         |
| `status.md`                 | Current parity/coverage snapshot, refreshed from scripts.                                                                                                                                                                                                                                        |
| `work-queue.md`             | Current priorities, how to pick work, active workstreams.                                                                                                                                                                                                                                        |
| `tooling.md`                | The `vp` command layer, static gates, hooks, MCP servers, package-build migration.                                                                                                                                                                                                               |
| `../reference/patterns.md`  | SolidJS porting idioms that outlive a single plan: accessors/getters, children/context timing, splitProps forwarding, SSR-safe render patterns, and event-path timing differences.                                                                                                               |
| `upstream-sync.md`          | How the vendored React Spectrum oracle is pinned, how new Adobe releases are absorbed, and the `guard:upstream-test-parity` contract-vocabulary diff.                                                                                                                                            |
| `upstream-release-audit.md` | Backlog of atomic tickets distilled from Adobe's release notes (RAC 1.14→1.18 / S2 1.0→1.4): which shipped changes we have, owe, or already ported.                                                                                                                                              |
| `press-path-epic.md`        | Scope for the cross-hook item-hook press-path migration (T-34/T-51/T-52/T-56): the upstream `useSelectableItem` contract, our raw-pointer as-is, the missing `createSelectableItem`, phasing, and risks.                                                                                         |
| `ui-client-contract.md`     | `UC-NN` backlog making `@proyecto-viviana/ui` installable/usable by external client apps (`viviana-social`): release-matrix promotion, export/CSS/macro contract, barrel-bloat fix. Priority track, runs before the parity loop resumes.                                                         |
| `release-policy.md`         | Releasable packages, Changesets, CI gates, npm publishing.                                                                                                                                                                                                                                       |
| `tech-debt.md`              | Known debt and temporary bridges, each with an exit.                                                                                                                                                                                                                                             |
| `tailwind-removal.md`       | Plan of record for retiring invented Tailwind-vocabulary utility styling repo-wide and converting library styled layers to the S2 style macro. Runs alongside the recertification march; phased, march-priority ordered.                                                                         |
| `glasselated-port.md`       | Plan of record for the 2026-07-22 pivot: port the external Glasselated register onto viviana-ui (solid-spectrum stays parity-locked) and build the Viviana showcase in `apps/web`. Points at the frozen external spec repo.                                                                      |
| `visual-system-lane.md`     | Provenance record of the owner-authorized Claude visual-system lane (Viviana token retune + macro-routing unstyled surfaces + Tailwind-utility removal), landed on `main` 2026-07-22 by squash-merge of `design/visual-system-claude-v2`. Paired with the Education repo's `work-provenance.md`. |

Git history is the archive. Retired audits, gap inventories, and session logs are
deleted from `main` and recovered through the commit that removed them, not kept
as live trees. The one exception is a completed plan-of-record: it is distilled to
a short summary on this surface, with its verbatim log parked under `archive/`
(e.g. `archive/recertification-full.md`). Do not correct historical docs; bring
current facts into this directory.
