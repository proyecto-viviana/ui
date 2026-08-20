---
id: 19
type: task
title: "Refresh and centralize derivative-attribution work"
created: 2026-08-20
parent: 35
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "opened from the repository-wide documentation audit" }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "moved the active attribution plan into this ticket and retired the duplicate public-doc plan",
    }
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

## Work sequence

1. Confirm the required header form and change note.
2. Verify that the formatter preserves the header.
3. Update each asset generator to emit the required notice.
4. Map each derived source file to its upstream source.
5. Copy the applicable upstream notice and year from that source.
6. Review unmapped files and original Proyecto Viviana files by hand.
7. Add deterministic attribution checks where the source classification permits
   them.

Do not add an Adobe notice to original Proyecto Viviana source. That action
would misattribute the source.

## Owner decisions required

- Confirm the notice form and the Solid port change note.
- Confirm the source for icon license terms before generator changes.
- Confirm the treatment for an upstream file that has no exact mapping.
- Decide whether original source needs a short Proyecto Viviana MIT header.

The retired plan contained a dated five-package file count. Do not use that
count as current evidence. Recount the six public packages before source work.

Do not preserve stale file counts as current evidence. Record the command,
revision, and result for each new inventory.

## Done when

Attribution has a stable public home. Remaining work has one task record. No
active internal plan lives under `docs/`.

## Relationship

Depends on ticket #12. Supplies one retirement dependency to tickets #13 and
#16.
