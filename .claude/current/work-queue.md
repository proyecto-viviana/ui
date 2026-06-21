---
kind: reference
status: current
tasks:
  - id: cert-button
    title: Certify Button visual + a11y states
    state: in-progress
    roadmap: component-certification
    planned: { start: 2026-06-10, target: 2026-06-18 }
  - id: cert-checkbox
    title: Certify Checkbox visual + a11y states
    state: next
    depends: [cert-button]
    roadmap: component-certification
    planned: { start: 2026-06-18, target: 2026-06-25 }
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

Status: Current source of truth.
Update when: priorities, the pick order, or the active workstreams change.

`steering.md` owns direction (now/next/later). This page owns how to choose the
next task and which workstreams are live.

## How to pick work

1. Refresh the snapshot (`status.md`) — work from scripts, not memory.
2. Pick the surface that moves a real certification gap, not a count. Depth over
   breadth: certify an existing component before adding a new name.
3. Run it through `../../apps/comparison/COMPONENT_PLAYBOOK.md` — the per-component
   task runner. Gate outcomes land in the component's validation note under
   `../../apps/comparison/playbook/components/`.
4. Prove it with the ladder in `certification.md`; record evidence in the
   validation note, not only in chat.

## Current priorities

1. Convert visual-state rows into current React/Solid pair-diff or
   computed-contract tests — hover, focus-visible, pressed, selected, invalid,
   disabled, open, dismiss, keyboard navigation. No per-side committed PNG
   baselines as acceptance gates.
2. Keep accessibility proof broader than axe: keyboard, focus, forms, computed
   name/description/value, validation, and announcements via Playwright.
3. Continue support-export parity — missing contexts, slots, hooks, helpers, and
   support values. Root catalogue export parity is not complete API parity.
4. Add behavior tests where export parity is already green. Do not add barrel
   names unless a report identifies a real missing upstream export.
5. Keep component-internal S2 styling in `packages/solid-spectrum`. The
   comparison app may consume `solid-spectrum` source and the S2 macro, but app
   CSS must not hand-author component colors, spacing, radius, or states
   (ADR 0001).

## Active workstreams

- **Client-readiness for `@proyecto-viviana/ui`** _(largely landed 2026-06-20)_ —
  the `UC-NN` backlog in `ui-client-contract.md` making the package installable
  and usable by the `viviana-social` apps. UC-00…UC-05 + UC-07 are ✔; only
  UC-02 Part B (deferred) and UC-06 (downstream) remain, so the parity loop
  (`upstream-release-audit.md` T-57+) can now resume.
- **Per-component certification** — the standing loop; collection/overlay
  families next.
- **Support-export parity** — close the `22` missing S2 support exports; keep
  Solid-only exports documented as local additions.
- **comparison-docs-overhaul** — the comparison app's docs-site rollout
  (`docs/comparison-docs-overhaul/`), in flight.
- **Package-build migration** — native Vite Plus packaging, one package at a time
  (`tech-debt.md`).

## Standing discipline

- `solidaria-components` carries extra exports relative to upstream RAC. Keep
  intentional aliases and Solid-specific composition helpers documented as local
  additions when they are public API.
- Prefer computed contracts, interaction assertions, or strict pair diffs for new
  state rows; keep thresholded screenshots as review evidence only when the
  component note explains why they suffice.
