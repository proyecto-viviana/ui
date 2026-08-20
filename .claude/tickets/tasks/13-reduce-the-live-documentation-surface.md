---
id: 13
type: task
title: "Reduce the live documentation surface"
created: 2026-08-20
status: in-progress
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the current-document structure and duplication audit",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "migrated active task state, replaced the long index, and began dependency-safe retirement review",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "retired the completed launch, client-readiness, and visual-system records after moving durable references",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "retired the superseded repository assessment after verifying its open decisions and work had ticket coverage",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "moved the full remaining-work census into tickets #87 and #89 through #93, then retired the duplicate work queue",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "migrated the last open adversarial findings to tickets #94 through #96 and retired the session audit ledger",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "migrated all active debt and the selectable-item link-model decision to tickets, then retired the duplicate debt ledger",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "verified the Tailwind-removal program against source and consumer smoke, corrected tickets 46 and 59, and retired the stale plan",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "moved the remaining press-path adaptations and evidence gaps to tickets 84, 97, 100, and 101, then retired the completed epic",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "reduced the Glasselated implementation log to a stable register reference and moved its open work to tickets 44, 102, and 103",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "moved the recertification driver catalog into certification, ticketed its remaining exceptions, and retired both completed recertification records",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "mapped every open 2026-08 upstream branch to tickets 17, 18, 84, 89, and 108 through 129, then retired the release ledger",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "reduced upstream sync and owner steering to stable references and completed the retained-set dependency audit",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "verified the 13-file live set with docs:check, a repository dead-link scan, and a local-link existence scan",
    }
---

`.claude/current` mixes current state, stable references, active plans,
completed programs, audit evidence, and historical logs. The index requires a
22-step reading order and conflicts with the repository rule that Git history
is the archive.

## Scope

- Classify every current document as an operational surface, stable reference,
  evidence record, generated view, or retirement candidate.
- Distill live facts before removing a completed or superseded document.
- Remove completed plans and verbatim logs from the live tree.
- Remove repeated status narratives and manual count copies.
- Keep component evidence close to the comparison harness.
- Keep public documentation outside internal work-state documents.
- Reduce the normal reading path to the minimum set the owner describes.

Do not edit historical text to make it look current. Preserve required history
in Git.

## Initial retirement candidates

- [x] `.claude/current/archive/recertification-full.md`
- [x] `.claude/current/launch.md`
- [x] `.claude/current/recertification.md`
- [x] `.claude/current/repo-assessment.md`
- [x] `.claude/current/ui-client-contract.md`
- [x] `.claude/current/visual-system-lane.md`

This list is a research input. Verify each live dependency before removal.

## Complete census (2026-08-20)

The owner confirmed the operating model in #12. These are the audit outcomes.

| Document                          | Current role                                         | Proposed treatment                                                                           |
| --------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `README.md`                       | Index and long reading order                         | Retained as the short index and documentation contract.                                      |
| `admin-dashboard.md`              | Dashboard design and tracking contract               | Retained and verified against the ticket-backed `/admin` implementation.                     |
| `adversarial-audit.md`            | Session finding register and checkpoint              | Retired after all open findings mapped to durable tickets.                                   |
| `architecture.md`                 | Stable package and layer reference                   | Keep. Remove volatile status text only.                                                      |
| `archive/recertification-full.md` | Completed verbatim program log                       | Retired after the driver catalog moved to `certification.md`.                                |
| `certification.md`                | Stable evidence policy                               | Keep. Complete its commands through #11.                                                     |
| `glasselated-port.md`             | Stable register boundary and source reference        | Retained as a short reference. Completed implementation history now lives only in Git.       |
| `glossary.md`                     | Owner-steered vocabulary                             | Keep. Use it as the terminology authority for #15.                                           |
| `kumo-experiment.md`              | Bounded experiment plan                              | Retained as a short boundary; current results and work live in tickets.                      |
| `launch.md`                       | Completed program summary                            | Retired after its durable CI rules moved into workflow comments.                             |
| `press-path-epic.md`              | Completed migration scope                            | Retired after remaining parity and evidence gaps moved to tickets.                           |
| `recertification.md`              | Completed program summary                            | Retired after open exceptions moved to tickets and source links moved to stable authorities. |
| `release-policy.md`               | Stable release policy                                | Keep. Remove links to completed plans.                                                       |
| `repo-assessment.md`              | Superseded assessment                                | Retired after unique work and owner decisions were verified against tickets.                 |
| `roadmap.md`                      | Former writable initiative state                     | Generated from `.claude/tickets`; never edit by hand.                                        |
| `status.md`                       | Former manual handoff                                | Generated from `.claude/tickets`; never edit by hand.                                        |
| `steering.md`                     | Direction, queue, and owner decisions                | Retained as short owner direction without copied status or task lists.                       |
| `tailwind-removal.md`             | Stale migration plan with historical phases          | Retired after source and installed-consumer evidence proved the program complete.            |
| `tech-debt.md`                    | Large task store, resolution archive, and debt prose | Retired after all active work and the remaining architecture decision moved to tickets.      |
| `tooling.md`                      | Stable command guide                                 | Keep. Verify each command against `package.json` and scripts.                                |
| `ui-client-contract.md`           | Completed client-readiness program                   | Retired after script and policy references moved to current contracts.                       |
| `upstream-release-audit.md`       | Release-train ledger and tasks                       | Retired after each open branch moved to an atomic ticket.                                    |
| `upstream-sync.md`                | Stable process plus historical behavior sweeps       | Retained as the pin and absorption process; completed sweeps live in Git history.            |
| `visual-system-lane.md`           | Completed design-lane provenance                     | Retired after required attribution moved to `CREDITS.md`.                                    |
| `work-queue.md`                   | Task frontmatter, repeated census, and pick order    | Retired after its complete ordered census moved to #87 and focused tickets.                  |

## Dependency findings

- The driver catalog now lives in `certification.md`. Open recertification
  exceptions point to their tickets. Tests and drivers no longer link to the
  retired records.
- `CREDITS.md` and Viviana token comments contain the durable design-lane
  provenance. They no longer depend on the retired plan.
- Scripts no longer link to retired plans or ledgers. Stable process links use
  `certification.md`, `release-policy.md`, or `upstream-sync.md`.
- `/admin` reads and writes `.claude/tickets`. It treats `status.md` and
  `roadmap.md` as generated views.
- `AGENTS.md` names report commands as the status authority. Generated views
  identify their board source and Git revision.

## Repository-wide boundary

The internal cleanup cannot treat every Markdown file outside `.claude/current`
as clutter. The repository has approximately 23,600 additional Markdown lines.
Classify them by purpose before any deletion.

| Surface                             | Treatment                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Root and package READMEs            | Keep as public entry points. Remove duplicated internal status.                   |
| `docs/adr/`                         | Keep as stable architecture decisions.                                            |
| Package changelogs and `CREDITS.md` | Keep as public history and attribution.                                           |
| Comparison playbook                 | Keep beside the harness as the acceptance procedure.                              |
| Component validation notes          | Keep component decisions near the harness. Reduce repeated structure through #11. |
| Generated accessibility reports     | Treat as generated evidence through #14. Record their source revision.            |
| `docs/license-compliance-plan.md`   | Move unique work through #19, then retire the active plan from `docs/`.           |

Current package-count statements require context. Some five-package statements
describe a completed release and are historical. Do not rewrite them. Current
operating documents must use the six-package boundary or generate the count.

## Done when

A contributor can identify the current state, next action, stable architecture,
evidence rules, and operating commands without reading completed history.

## Progress checkpoint

- `.claude/current` is down from 25 files and approximately 14,586 lines to 13
  files and approximately 1,143 lines. This is a 92% reduction.
- The normal reading path is now seven steps instead of 22.
- `status.md` and `roadmap.md` are generated views.
- Active task state has moved to `.claude/tickets`.
- The old plans and ledgers no longer define work state.
- All initial retirement candidates are retired. Git history remains the
  archive.
- `launch.md`, `ui-client-contract.md`, and `visual-system-lane.md` are retired.
  Their stable rules and provenance now live in CI, release documentation,
  scripts, architecture, and `CREDITS.md`.
- `repo-assessment.md` is retired. Tickets #9, #78, #81, #82, and #83 preserve
  its open decisions and first execution wave. Stable workflow rules remain in
  `AGENTS.md`, `tooling.md`, `certification.md`, and the component playbook.
- `work-queue.md` is retired. Ticket #87 owns its order. Tickets #89 through
  #93 preserve obligations that the first migration had omitted.
- `adversarial-audit.md` is retired. Tickets #11, #13, #14, #15, #17 through
  #23, #37, #81, #82, #87, and #89 through #96 preserve its open findings.
- `tech-debt.md` is retired. All 45 active records have ticket coverage. Ticket
  #97 preserves the selectable-item link-model decision that remained in the
  press-path record. Tickets #98 and #99 preserve two StepList obligations that
  existed only in a certified-driver comment.
- `tailwind-removal.md` is retired. Tickets #46 and #59 record the verified
  outcome. ADR 0001 remains the stable S2 styling boundary.
- `press-path-epic.md` is retired. Tickets #84, #97, #100, and #101 preserve
  its remaining adaptations and evidence gaps. Code, tests, changelogs, and Git
  history preserve the completed implementation record.
- `glasselated-port.md` is now a short stable reference. Architecture and
  `CREDITS.md` preserve the package boundary and provenance. Tickets #44, #102,
  and #103 preserve the remaining hydration, first-paint, and register work.
- The recertification records are retired. `certification.md` owns the stable
  driver catalog. Tickets #18, #64, #68, and #104 through #107 own remaining
  exceptions.
- `upstream-release-audit.md` is retired. Ticket #82 owns the train map, and
  tickets #17, #18, #84, #89, and #108 through #129 own its open branches.
- `upstream-sync.md` is now a stable process. `steering.md` is now a short owner
  direction reference.
- A repository-wide scan found no live links to the retired documents.

Next, finish the retained-prose rewrite in #15 and enforce this structure in
#16. Ticket #19 owns the separate active attribution plan under `docs/`.

## Relationship

Depends on #12 for task-state migration. Supplies the retained document set to
#15 and the organization contract to #16. Ticket #19 owns the active plan under
`docs/`.
