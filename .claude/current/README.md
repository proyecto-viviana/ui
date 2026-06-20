---
kind: index
status: current
---

# Proyecto Viviana — Current Docs

Status: Current source of truth.
Update when: the north star, architecture, certification bar, status snapshot, gates, or the active work queue changes.

This directory is the only deep current-docs surface. Top-level `README.md` and
`AGENTS.md` are the canonical entry points; everything that would make those
files noisy lives here.

`steering.md` is the short leadership layer — what matters next and why.
`certification.md` is the expansion of the project's reason to exist: what
"ported" actually means and how it is proven. `glossary.md` is the source of
truth for terms with reach.

## Read Order

1. `../../README.md`
2. `../../AGENTS.md`
3. `steering.md`
4. `certification.md`
5. `architecture.md`
6. `glossary.md`
7. `status.md`
8. `work-queue.md`
9. `tooling.md`
10. `upstream-sync.md`
11. `upstream-release-audit.md`
12. `ui-client-contract.md`
13. `release-policy.md`
14. `tech-debt.md`
15. `../../apps/comparison/COMPONENT_PLAYBOOK.md` when porting or re-baselining a component

## Files

| File                | Purpose                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `steering.md`       | North star, current focus, now/next/later, open decisions, non-goals, gates.                                                    |
| `certification.md`  | What a certified port requires (the Rule #1 expansion): evidence dimensions, the floors, the gate ladder, the acceptance gates. |
| `architecture.md`   | The five-layer chain, what each package owns, the behavior-vs-styling boundary, and the comparison harness as verifier.         |
| `glossary.md`       | Owner-steered vocabulary: layer names, _certified_, _evidence_, _local addition_, styled-component statuses, _pair diff_.       |
| `status.md`         | Current parity/coverage snapshot, refreshed from scripts (not memory).                                                          |
| `work-queue.md`     | Current priorities, how to pick work, active workstreams.                                                                       |
| `tooling.md`        | The `vp` command layer, static gates, hooks, MCP servers, package-build migration.                                              |
| `upstream-sync.md`  | How the vendored React Spectrum oracle is pinned, how new Adobe releases are absorbed, and the `guard:upstream-test-parity` contract-vocabulary diff. |
| `upstream-release-audit.md` | Backlog of atomic tickets distilled from Adobe's release notes (RAC 1.14→1.18 / S2 1.0→1.4): which shipped changes we have, owe, or already ported. |
| `ui-client-contract.md` | `UC-NN` backlog making `@proyecto-viviana/ui` installable/usable by external client apps (`viviana-social`): release-matrix promotion, export/CSS/macro contract, barrel-bloat fix. Priority track, runs before the parity loop resumes. |
| `release-policy.md` | Releasable packages, Changesets, CI gates, npm publishing.                                                                      |
| `tech-debt.md`      | Known debt and temporary bridges, each with an exit.                                                                            |

Git history is the archive: retired plans, audits, gap inventories, and session
logs are deleted from `main` and recovered through the commit that removed them,
never kept as live trees. Do not correct historical docs; distill current truth
into this directory.
