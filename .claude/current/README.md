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
3. `architecture.md`
4. `steering.md`
5. `certification.md`
6. `glossary.md`
7. `work-queue.md`
8. `tooling.md`
9. `upstream-sync.md`
10. `upstream-release-audit.md`
11. `ui-client-contract.md`
12. `release-policy.md`
13. `tech-debt.md`
14. `press-path-epic.md` when scoping or implementing the item-hook press-path migration (T-34/T-51/T-52/T-56)
15. `../../apps/comparison/COMPONENT_PLAYBOOK.md` when porting or re-baselining a component
16. `../../AGENTS.md` when handing work to coding agents

## Files

| File                        | Purpose                                                                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `steering.md`               | Direction, current focus, now/next/later, open decisions, non-goals, checks.                                                                                                                                                             |
| `certification.md`          | Evidence required before a component can be accepted as ported: dimensions, floors, checks, acceptance gates.                                                                                                                            |
| `architecture.md`           | The five-layer chain, what each package owns, the behavior-vs-styling boundary, and the comparison harness as verifier.                                                                                                                  |
| `glossary.md`               | Owner-steered vocabulary: layer names, _accepted_, _evidence_, _local addition_, styled-component statuses, _pair diff_.                                                                                                                 |
| `status.md`                 | Current parity/coverage snapshot, refreshed from scripts.                                                                                                                                                                                |
| `work-queue.md`             | Current priorities, how to pick work, active workstreams.                                                                                                                                                                                |
| `tooling.md`                | The `vp` command layer, static gates, hooks, MCP servers, package-build migration.                                                                                                                                                       |
| `upstream-sync.md`          | How the vendored React Spectrum oracle is pinned, how new Adobe releases are absorbed, and the `guard:upstream-test-parity` contract-vocabulary diff.                                                                                    |
| `upstream-release-audit.md` | Backlog of atomic tickets distilled from Adobe's release notes (RAC 1.14→1.18 / S2 1.0→1.4): which shipped changes we have, owe, or already ported.                                                                                      |
| `press-path-epic.md`        | Scope for the cross-hook item-hook press-path migration (T-34/T-51/T-52/T-56): the upstream `useSelectableItem` contract, our raw-pointer as-is, the missing `createSelectableItem`, phasing, and risks.                                 |
| `ui-client-contract.md`     | `UC-NN` backlog making `@proyecto-viviana/ui` installable/usable by external client apps (`viviana-social`): release-matrix promotion, export/CSS/macro contract, barrel-bloat fix. Priority track, runs before the parity loop resumes. |
| `release-policy.md`         | Releasable packages, Changesets, CI gates, npm publishing.                                                                                                                                                                               |
| `tech-debt.md`              | Known debt and temporary bridges, each with an exit.                                                                                                                                                                                     |

Git history is the archive. Retired plans, audits, gap inventories, and session
logs are deleted from `main` and recovered through the commit that removed them,
not kept as live trees. Do not correct historical docs; bring current facts into
this directory.
