---
kind: reference
status: current
---

# Steering

Status: live reference.
Update when: direction, current focus, open decisions, non-goals, or checks
change.

The short direction layer above the work queue. Read this before choosing a task;
use `work-queue.md` for implementation detail.

## Direction

Viviana UI is Proyecto Viviana's published open-source UI suite and design
system, built on Solid. Its foundation is the unofficial Solidaria and Solid
Spectrum port stack for Adobe's React Stately, React Aria, React Aria
Components, and React Spectrum S2.

The port stack stays strict about parity: the same public behavior,
accessibility model, keyboard model, and S2 styling branches in Solid. A
component should not be described as ported until the evidence bar in
`certification.md` is met.

## Current Focus

Catalogue and export-name parity are essentially closed. The work now is
**depth, not breadth**: turning existing components from "the name exists and axe
is green" into evidence-backed parity through React-vs-Solid tests, accessibility
tests, and behavior tests.

## Now

- **Client-readiness track (largely landed 2026-06-20).** Making
  `@proyecto-viviana/ui` installable and usable by the `viviana-social` apps —
  the `UC-NN` backlog in `ui-client-contract.md` — is substantially done in-repo:
  UC-00…UC-05 + UC-07 are ✔ (release-matrix promotion, deep-subpath export
  parity, CSS/Provider contract, the supported Vite macro preset, and the
  barrel-bloat fix). Only UC-02 Part B (deferred) and UC-06 (downstream in
  `viviana-social`) remain, so the parity loop can now resume at
  `upstream-release-audit.md` T-57.
- Convert visual-state rows into current React/Solid pair-diff or
  computed-contract tests — hover, focus-visible, pressed, selected, invalid,
  disabled, open, dismiss, keyboard navigation. Do not reintroduce per-side
  committed PNG baselines as acceptance gates.
- Keep accessibility proof broader than axe: keyboard, focus, forms, computed
  name/description/value, validation, and announcements via Playwright.
- Add behavior tests where export parity is already green, rather than adding
  more barrel names.

## Next

- Support-export parity: contexts, slots, hooks, helpers, and support values
  still missing from `solid-spectrum` relative to S2. Root catalogue export
  parity is not complete API parity.
- Continue per-component acceptance through
  `apps/comparison/COMPONENT_PLAYBOOK.md`, component by component; collection
  and overlay families next.

## Later

- Tighten the release bar for each package as coverage justifies stronger semver
  promises (`release-policy.md`).
- Package-build migration to native Vite Plus packaging, one package at a time
  (`tech-debt.md`).

## Open Decisions

- **Release readiness threshold.** What evidence coverage gates a package
  from "test bed" to a published, semver-promised release. _Resolved for
  `@proyecto-viviana/ui` (2026-06-20): promote it into the release matrix as the
  client-facing entry point — implementation tracked as UC-00 in
  `ui-client-contract.md`._ The general per-package threshold question remains
  open for the lower layers.
- **Visual evidence policy.** Standardize on computed contracts + strict pair
  diffs over screenshots; decide when a thresholded screenshot is acceptable
  review evidence.
- **comparison-docs-overhaul.** The comparison app's own docs-site rollout
  (`docs/comparison-docs-overhaul/`) is in flight; decide its relationship to the
  comparison harness.

## Non-Goals

- Counting exports, routes, a green axe run, or a stable screenshot as
  acceptance.
- Per-side committed PNG baselines as focused acceptance gates.
- Hand-authored S2 component-surface CSS in the comparison app (ADR 0001).
- Adding barrel names without a report identifying a real missing upstream
  export.

## Gates

The evidence bar and its commands live in `certification.md`.
`comparison:report:parity:strict` is expected to pass; treat an in-scope failure
as a blocking regression. Status is refreshed from scripts (`status.md`), never
from memory.

## Before A Task

- Which component or parity gap does this move toward acceptance?
- What upstream behavior is the authority, and where is it in installed source?
- Which gates prove it — beyond axe and export counts?

After a task, update this page only if the steering state changed; otherwise
update `status.md`, `work-queue.md`, or the component validation note that owns
the surface.
