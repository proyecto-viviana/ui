---
kind: reference
status: current
tasks:
  - id: toast-comparison-viewer
    title: Rebuild Toast comparison viewer around docs-style trigger buttons
    state: done
    finished: 2026-06-24
    roadmap: comparison-docs-overhaul
    planned: { start: 2026-06-24, target: 2026-06-25 }
  - id: cert-button
    title: Prove Button visual + a11y states
    state: done
    finished: 2026-07-03
    roadmap: component-certification
    planned: { start: 2026-06-10, target: 2026-06-18 }
    note: Superseded-and-completed by the recertification march — Button was the D1–D8 pilot.
  - id: cert-checkbox
    title: Prove Checkbox visual + a11y states
    state: done
    finished: 2026-07-04
    depends: [cert-button]
    roadmap: component-certification
    planned: { start: 2026-06-18, target: 2026-06-25 }
    note: Superseded-and-completed by the recertification march — Checkbox certified in Tier 2.
  - id: comparison-docs-collections
    title: Port collection component pages to the docs site
    state: in-progress
    roadmap: comparison-docs-overhaul
    planned: { start: 2026-06-05, target: 2026-06-16 }
    note: >-
      Re-scope through GitHub issue #27 and the catalogue-to-route map before
      continuing. The 2026-06 target is stale; code/report evidence chooses the
      remaining pages.
---

# Work Queue

Status: live task-picking order.
Update when: a wave changes, a P0 closes, or a dependency/owner decision moves
the pick order.

`steering.md` owns direction. `repo-assessment.md` owns the detailed workflow,
risk controls, wave exits, and GitHub ticket specifications. This page is the
short selector.

## Pick order

1. Refresh the immutable facts and reports in `status.md`.
2. Resolve P0 safety work before broad parity edits:
   `release-train-unjam`, `dependency-advisory-remediation`, and
   `local-gate-preconditions`.
3. Absorb the available upstream train (`upstream-train-2026-08`).
4. Pick one dependency-bounded parity cluster from
   `labeledvalue-strict-parity` / issue #24 or `dnd-subsystem-port` / issue #25.
5. Pick shared-spine and upper-layer convergence work before a per-widget copy
   of the same concern.
6. Pick docs pages only after their behavior is proven and the catalogue mapping
   identifies the real gap.
7. Use maintenance tasks to fill bounded gaps, not to displace active
   user-visible correctness.

## Active workstreams

- **Wave 0 — safety:** release decision/observation, dependency advisories, and
  clean-checkout gate prerequisites.
- **Wave 1 — upstream:** one S2 1.6.0 / RAC 1.20.0 absorption with a finite
  classified delta.
- **Wave 2 — parity closure:** nine strict controls and seven exports/DnD.
- **Wave 3 — architecture:** headless-spine consumption, upper-register
  convergence, consumer-delivery, and package-build batches.
- **Wave 4 — public completeness:** catalogue docs, admin projection, license,
  and hygiene.

## Evidence discipline

- `comparison:report:parity:strict` currently passes against a nine-entry
  baseline. Report command state and accepted debt state separately.
- The full certified suite is mandatory for an oracle, shared behavior, or
  parity component change.
- Do not run package-cleaning aggregate build lanes concurrently; they share
  `dist` trees.
- Until issue #28 closes, prefer canonical aggregate lanes over standalone app
  typecheck on a clean checkout.
- Update task state, validation evidence, status, and code in the same commit.
- A task is complete on `main` only after the four required contexts are green
  for the exact resulting SHA.
