---
kind: index
status: current
---

# Current Project Documentation

Status: live index.
Update when: the documentation structure or an authority changes.

This directory contains stable technical references and generated work views.
Work state lives only in `.claude/tickets`. Git history stores retired plans and
completed operational records.

## Start here

1. Read [status.md](status.md) for the active task summary.
2. Read [roadmap.md](roadmap.md) for initiative progress.
3. Open [the ticket board](../tickets/) for full task records and history.
4. Read [steering.md](steering.md) for owner direction.
5. Read [architecture.md](architecture.md) before you change package boundaries.
6. Read [certification.md](certification.md) before you claim parity.
7. Read [tooling.md](tooling.md) before you run repository commands.

`status.md` and `roadmap.md` are generated. Do not edit them. Run
`vp run docs:generate` after a ticket change.

## Stable references

| Document                                   | Purpose                                   |
| ------------------------------------------ | ----------------------------------------- |
| [architecture.md](architecture.md)         | Package layers and ownership boundaries.  |
| [certification.md](certification.md)       | Evidence required to accept a port.       |
| [glossary.md](glossary.md)                 | Owner-steered project terms.              |
| [tooling.md](tooling.md)                   | Commands, checks, and local setup.        |
| [release-policy.md](release-policy.md)     | Package and release rules.                |
| [upstream-sync.md](upstream-sync.md)       | Upstream pin and update process.          |
| [admin-dashboard.md](admin-dashboard.md)   | Development-only ticket-board interface.  |
| [glasselated-port.md](glasselated-port.md) | Glasselated register and source boundary. |
| [kumo-experiment.md](kumo-experiment.md)   | Kumo experiment boundary.                 |

## Documentation contract

- Put work state only in `.claude/tickets`.
- Keep only stable references and generated views in this directory.
- Do not edit `status.md` or `roadmap.md` by hand.
- Do not keep completed plans or audit logs in `main`. Git history is the
  archive.

Ticket [#15](../tickets/tasks/15-rewrite-retained-docs-in-simplified-english.md)
tracks the remaining prose rewrite. Ticket
[#16](../tickets/tasks/16-enforce-the-live-documentation-contract.md) tracks
automated enforcement.

## Other authorities

- [AGENTS.md](../../AGENTS.md) defines repository operating rules.
- [COMPONENT_PLAYBOOK.md](../../apps/comparison/COMPONENT_PLAYBOOK.md) defines
  the per-component acceptance procedure.
- [playbook/](../../apps/comparison/playbook/) defines the ten acceptance gates.
- [docs/adr/](../../docs/adr/) stores architecture decisions.
- [reference/patterns.md](../reference/patterns.md) stores reusable Solid porting
  patterns.

Run `vp run docs:check` after documentation or ticket changes.
