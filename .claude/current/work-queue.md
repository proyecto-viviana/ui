---
kind: reference
status: current
tasks:
  - id: remaining-work-ladder
    title: Go through every leftover audit item, one slice at a time
    state: in-progress
    roadmap: component-certification
    planned: { start: 2026-08-19, target: null }
    note: >-
      Durable remaining-work goal: walk every leftover audit item to
      closed, owner-blocked, or dated evidence. Closed this wave: D12,
      AlertDialog AX, ActionMenu D1/D5, Dialog D1/D3/D5. Current slice:
      full 2176 certified counts. Overlay/focus source is a separate
      commit from the pre-existing dirty audit/Kumo tree. Do not skip
      ahead.
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

`steering.md` owns direction. `adversarial-audit.md` owns the current finding
register, remediation status, risk controls, and exact resumption point. This
page is the short selector.

## Remaining-work goal (2026-08-19)

This is the live goal until **every leftover audit item** is fixed,
owner-blocked, or documented with dated evidence. It is the program for this
worktree: walk the numbered ladder in order, one slice at a time — diagnose
against pinned upstream at the owning layer, fix, verify, document in
current-docs, `git commit --only` that slice. Do not skip ahead because a
later item looks easier. A-findings that this wave already closed stay closed;
the ladder is the remainder of `adversarial-audit.md`.

**Constraints (hold for the whole ladder):** do not reset or split the dirty
tree; do not expand Kumo; do not patch S2 styling in comparison; do not treat
pins or green floors as absorption; TableView native-table (A-006) and Viviana
fork/convergence (A-008) stay owner-steered — ask; do not silently ratify.
Overlay/focus source commits separately from the pre-existing dirty
audit/Kumo tree. Do not push.

**Done when:** each numbered item has a current-docs note plus the evidence
that closed it (green certified/smoke/site/classification, an owner decision,
or a dated block), and `status.md` is rebuilt from that ladder (A-001).

### Closed this wave

- D12 slashless-route SSR capture (`bdb90f60`, A-033).
- AlertDialog AX description slot (`a9bfb8db`).
- ActionMenu list D5 overlay arrow-roving and D1 `outline-width` (menu-root
  auto-focus after paint with `focusVisible: true`).
- Dialog close-button D5 trap-cycle (FocusScope re-collect + contain).
- Dialog close-button D1 hover / D3 pixel (RAC `focusSafely` virtual
  `runAfterTransition` so contain-restore lands after hover `pointermove`).
- Dependency/security path (A-011 graph, A-012 Kumo fail-closed, A-013 pins,
  A-015 Vite Plus configs, A-016 stale declarations) — still needs items 3–4
  before A-001's measured `status.md` refresh.

### Remaining ladder

1. **Full certified suite (current slice, A-005, A-032 remainder)** — finish
   all 2176 cases. Report pass, skip/fixme, known-divergence (`test.fixme`),
   and deferred counts separately. Any new red family is diagnosed at the
   owning layer before the next numbered item. Do not claim certification
   from the interrupted 951/2176 run. Contract 93/93 stays a floor (A-031).
2. **External qualification (A-001 remaining)** — `vp run ui:smoke` then
   `vp run ci:site` (share `dist`; run sequentially). Neither was rerun after
   the migration. Rebuild `status.md` measured rows from this ladder.
3. **Kumo Button evidence (A-007)** — paired browser behavior and visual
   contracts only. Keep first-publish fail-closed. Do not grow the experiment.
4. **Train 8 classification** — remaining RAC exports, S2 support values, and
   `?`/`⛔` tickets in `upstream-release-audit.md`. Port only source-confirmed
   behavior.
5. **Evidence schema (A-002–A-005)** — machine-readable ten-gate records with
   validated pointers; stop counting labels and file presence.
6. **Owner decisions** — TableView native-table (A-006), Viviana
   fork/convergence ownership (A-008), and TabSwitch/SegmentedControl public
   boundary. Ask; do not silently ratify.
7. **Hygiene** — response-header/CSP contracts (A-020, residual A-011
   app-hardening), 59 `@ts-nocheck` files (A-019), macro sourcemaps (A-017),
   stale `tech-debt.md` (A-009), leftover superseded architecture prose
   (A-010) as found.
8. **Lowest-layer ownership (A-018)** — the layer-boundary guard freezes
   the sibling fork; it does not prove behavior lives in stately/aria. Use
   the import inventory as the work list, not a verdict. Compatibility
   ceilings (A-023) stay documented; Vite Plus noisy cold scan (A-024) is
   last.

## Pick order

1. Remaining-work goal above, starting at the full certified suite.
2. Complete and validate the dependency/toolchain migration, including actual
   package artifacts, consumer tarballs, peer compatibility, and security gates.
3. Finish classifying the pinned RAC 1.20 / S2 1.6 train and port only
   source-confirmed behavior gaps (`upstream-release-audit.md` T-61…T-99).
4. Prove the Kumo Button through paired browser behavior and visual contracts;
   keep its executable publish prerequisite closed until npm setup is verified.
5. Normalize component-acceptance records and make reports resolve the evidence
   they claim instead of counting labels and file presence.
6. Refresh measured facts and commands in `status.md` after the integration
   validation ladder completes.
7. Then pick one dependency-bounded parity cluster from
   `labeledvalue-strict-parity` / issue #24 or `dnd-subsystem-port` / issue #25.
8. Pick shared-spine and upper-layer convergence work before a per-widget copy
   of the same concern.
9. Pick docs pages only after their behavior is proven and the catalogue mapping
   identifies the real gap.
10. Use maintenance tasks to fill bounded gaps, not to displace active
    user-visible correctness.

## Active workstreams

- **Wave 0 — safety:** dependency/security validation, package-artifact truth,
  release prerequisites, and clean-checkout gate preconditions.
- **Wave 1 — upstream:** finish the finite S2 1.6.0 / RAC 1.20.0 behavioral
  absorption against the already-updated oracle.
- **Wave 2 — parity closure:** nine strict controls and seven exports/DnD.
- **Wave 3 — architecture:** headless-spine consumption, upper-register
  convergence, consumer-delivery, and package-build batches.
- **Wave 4 — public completeness:** catalogue docs, admin projection, license,
  and hygiene.
- **Bounded Kumo pilot:** land the one-component baseline, present it honestly
  on the root landing, build paired evidence, align the sibling proposal, then
  hold a continue/pause/delete review. It does not weaken or re-order the Adobe
  parity waves.

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
