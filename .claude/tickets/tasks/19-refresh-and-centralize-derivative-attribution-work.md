---
id: 19
type: task
title: "Refresh and centralize derivative-attribution work"
created: 2026-08-20
parent: 35
status: open
history:
  - { state: open, at: 2026-08-20, note: "opened from the repository-wide documentation audit" }
---

`docs/license-compliance-plan.md` is an active plan outside the declared live
documentation and task surfaces. Its 2026-07-24 inventory describes five public
packages. The repository now declares six public packages.

This ticket concerns repository policy and evidence. It does not make a legal
compliance claim.

## Scope

- Recount copied and derived source against the current six-package boundary.
- Verify required notices against each upstream license and repository policy.
- Store actionable work in the task authority selected by ticket #12.
- Keep stable attribution in `LICENSE`, `NOTICE`, `CREDITS.md`, package metadata,
  or source headers as applicable.
- Retire `docs/license-compliance-plan.md` after all unique work moves.
- Replace links from current documents with stable attribution or task links.
- Add checks for required attribution files and package metadata where a
  deterministic rule exists.

Do not preserve stale file counts as current evidence. Record the command,
revision, and result for each new inventory.

## Done when

Attribution has a stable public home. Remaining work has one task record. No
active internal plan lives under `docs/`.

## Relationship

Depends on ticket #12. Supplies one retirement dependency to tickets #13 and
#16.
