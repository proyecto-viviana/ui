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
    note: Superseded-and-completed by the recertification march — Button was the D1–D8 pilot (recertification.md Phase 1/CP series).
  - id: cert-checkbox
    title: Prove Checkbox visual + a11y states
    state: done
    finished: 2026-07-04
    depends: [cert-button]
    roadmap: component-certification
    planned: { start: 2026-06-18, target: 2026-06-25 }
    note: Superseded-and-completed by the recertification march — Checkbox certified in the Tier 2 sweep (CP9, 2026-07-04).
  - id: comparison-docs-collections
    title: Port collection component pages to the docs site
    state: in-progress
    roadmap: comparison-docs-overhaul
    planned: { start: 2026-06-05, target: 2026-06-16 }
  - id: comparison-docs-roadmap
    title: Land the comparison docs-site roadmap page
    state: done
    finished: 2026-06-12
    roadmap: comparison-docs-overhaul
    planned: { start: 2026-06-08, target: 2026-06-12 }
---

# Work Queue

Status: live queue.
Update when: priorities, the pick order, or the active workstreams change.

`steering.md` owns direction (now/next/later). This page owns how to choose the
next task and which workstreams are live.

## How to pick work

1. Refresh the snapshot (`status.md`) — work from scripts, not memory.
2. Pick the surface that moves a real evidence gap, not a count. Depth over
   breadth: prove an existing component before adding a new name.
3. For march units, `recertification.md` is the runner; for pre-march
   components, `../../apps/comparison/COMPONENT_PLAYBOOK.md`. Gate outcomes land
   in the component's validation note under
   `../../apps/comparison/playbook/components/`.
4. Prove it with the checks in `certification.md`; record evidence in the
   validation note, not only in chat.

## Current priorities

0. **P0 stabilization first** (steering.md Now): `ci-main-gate-wiring` and
   `release-train-unjam` (both in `tech-debt.md`) remain — both blocked on an
   owner push/publish. `main-rot-burndown-2026-07` (done 2026-07-06) and Toast
   CP9.35 (done 2026-07-06, 37/37) are cleared. Everything below waits on a
   green, CI-covered main.
1. The recertification program (`recertification.md`) is the plan of record:
   the per-component red→green march, Tiers 1–3 complete (Tier 3 closed
   2026-07-06 with DropZone/FileTrigger). Next is Tier 4, but note the two
   owner decisions gating it (D4 policy, D9/D10 sequencing) and the
   Menu/ActionMenu D5-D6 backfill — Picker is the intended Tier-4 opener.
2. Consumer-delivery cluster when a march slot allows: Picker fixes
   (`picker-popover-anchor`, `picker-item-checkmark` — Picker is first in
   Tier 4) and `macro-route-styled`.
3. Keep accessibility proof broader than axe: keyboard, focus, forms, computed
   name/description/value, validation, and announcements via the pair-oracle
   drivers (D5/D6) and Playwright.
4. Keep component-internal S2 styling in `packages/solid-spectrum`. The
   comparison app may consume `solid-spectrum` source and the S2 macro, but app
   CSS must not hand-author component colors, spacing, radius, or states
   (ADR 0001).

## Active workstreams

- **Recertification march** — the plan of record (`recertification.md`): Tiers
  1–3 complete (Tier 3 closed 2026-07-06 with DropZone/FileTrigger, CP9.36);
  next Tier 4, starting with Picker.
- **Pipeline stabilization** _(opened 2026-07-06)_ — CI-on-main, release-train
  unjam, live-rot burndown; tickets in `tech-debt.md`, direction in
  `steering.md` Now.
- **Client-readiness for `@proyecto-viviana/ui`** _(largely landed 2026-06-20)_ —
  UC-00…UC-05 + UC-07 are ✔; only UC-02 Part B (deferred) and UC-06
  (downstream) remain. The consumer-delivery debt (`macro-route-styled`,
  Picker fixes, `viviana-ui-subpath-exports`) is the live remainder of this
  track.
- **comparison-docs-overhaul** — the comparison app's docs-site rollout;
  collection/overlay pages still to port (`comparison-docs-collections`).
- **Package-build migration** — native Vite Plus packaging, one package at a
  time (`tech-debt.md`).

## Standing discipline

- `solidaria-components` carries extra exports relative to upstream RAC. Keep
  intentional aliases and Solid-specific composition helpers documented as local
  additions when they are public API.
- Prefer computed contracts, interaction assertions, or strict pair diffs for new
  state rows; keep thresholded screenshots as review evidence only when the
  component note explains why they suffice.
