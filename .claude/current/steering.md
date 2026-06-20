---
kind: reference
status: current
---

# Steering

Status: Current source of truth.
Update when: the north star, current focus, open decisions, non-goals, or gates
change.

The leadership layer above the work queue. Short enough to read before choosing
a task. The work queue owns implementation detail; this page owns what matters
next and why.

## North Star

Proyecto Viviana is a **published Solid library**: a faithful, certified Solid
port of Adobe's React Stately, React Aria, and React Spectrum S2 stacks. The
deliverable is the port itself — something the Solid ecosystem can depend on for
the same real accessibility and behavior Adobe ships, not an approximation.

Parity is not a milestone on the way to a product. **Parity is the product.**
The repo stays a parity port and test bed until the release policy says
otherwise (`release-policy.md`), but the bar it is held to is shipping-library
quality: a component is not "ported" until it is _certified_ (`certification.md`).

## Current Focus

Catalogue and export-name parity are essentially closed. The work now is
**depth, not breadth**: turning existing components from "the name exists and axe
is green" into certified parity — real behavior and accessibility, proven by
strict React-vs-Solid tests.

## Now

- **Client-readiness track (priority, runs first).** Make
  `@proyecto-viviana/ui` installable and usable by the `viviana-social` apps:
  the `UC-NN` backlog in `ui-client-contract.md`, starting with UC-00
  (release-matrix promotion — decided 2026-06-20 — plus the out-of-workspace
  install smoke). The parity loop below is paused until UC-00…UC-05 land.
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
- Continue per-component certification through
  `apps/comparison/COMPONENT_PLAYBOOK.md`, component by component;
  collection/overlay families next.

## Later

- Promote packages from "parity port and test bed" toward released library
  status as certification coverage justifies it (`release-policy.md`).
- Package-build migration to native Vite Plus packaging, one package at a time
  (`tech-debt.md`).

## Open Decisions

- **Release readiness threshold.** What certification coverage gates a package
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
  certification harness.

## Non-Goals

- Counting exports, routes, a green axe run, or a stable screenshot as
  acceptance.
- Per-side committed PNG baselines as focused acceptance gates.
- Hand-authored S2 component-surface CSS in the comparison app (ADR 0001).
- Adding barrel names without a report identifying a real missing upstream
  export.

## Gates

The certification ladder and its commands live in `certification.md`.
`comparison:report:parity:strict` is expected to pass; treat an in-scope failure
as a blocking regression. Status is refreshed from scripts (`status.md`), never
from memory.

## Leadership Ritual

Before a task:

- Which component or parity gap does this certify or move?
- What upstream behavior is the authority, and where is it in installed source?
- Which gates prove it — beyond axe and export counts?

After a task, update this page only if the steering state changed; otherwise
update `status.md`, `work-queue.md`, or the component validation note that owns
the surface.
