---
kind: reference
status: current
---

# Steering

Status: live direction.
Update when: current focus, dependency order, owner decisions, or non-goals
change.

## Direction

Viviana UI is Proyecto Viviana's published Solid UI suite and design system.
Its lower packages are an unofficial port stack for Adobe React Stately, React
Aria, React Aria Components, and React Spectrum S2. A component is ported only
when upstream-observable API, accessibility, keyboard/focus, forms/validation,
timing, styling, visual, and i18n branches are held by evidence.

Two products ship on the stack. `@proyecto-viviana/ui` is the flagship Viviana
register. `@proyecto-viviana/solid-spectrum` is the S2-parity design-system
layer and the only source of S2 macro/token styling.

## Current focus

**Operational safety, then upstream absorption.** The detailed plan of record is
`repo-assessment.md`.

Launch, the six-tier recertification march, and CI enforcement are complete.
The assessed `main` revision is green under four strict required contexts and
the consumer tarball smoke passes. That is the operating floor, not a claim of
full parity.

The active facts that choose work are:

- version PR #20 is fully qualified but its merge automatically publishes five
  npm packages and therefore awaits explicit publish approval;
- dependency audit reports 1 critical, 17 high, 8 moderate, and 1 low vulnerable
  instances;
- S2 1.6.0 and RAC 1.20.0 are available beyond the exact current 1.5.1/1.19.0
  oracle;
- strict controls are modeled for 69/78 entries under a nine-gap baseline;
- seven S2 value exports remain missing;
- the upper-layer guard freezes 533 identical and 76 divergent shared files;
- 45 hand-written Spectrum docs routes cover a 78-entry catalogue, with aliases
  requiring a mapping report before an exact missing count is claimed.

## Now

1. Obtain the explicit decision on publishing PR #20; if approved, merge,
   observe the exact release SHA, and verify all five npm versions/provenance.
2. Remediate the critical/high dependency graph under issue #22 after explicit
   dependency-change approval.
3. Make clean-checkout gate preconditions deterministic under issue #28.
4. Keep the assessed branch green while the plan/ticket truth lands on `main`.

## Next

1. Absorb S2 1.6.0 / RAC 1.20.0 as the isolated upstream-sync unit in issue #23.
2. Close the nine strict modeled-control gaps (#24) and the seven missing
   exports/DnD subsystem (#25) against that new exact oracle.
3. Consume the shared headless spine and reduce upper-layer duplication in
   bounded, evidence-backed families (#26).

## Later

- Close the catalogue-to-doc-route map and missing authored guidance (#27).
- Finish package-build and admin-dashboard migrations after the artifact graph
  is deterministic.
- Burn down residual `@ts-nocheck`, disabled lint rules, API deviations,
  license headers, and documented visual-floor waivers without displacing
  user-visible correctness.

## Open owner decisions

1. **PR #20 publication.** Merge means immediate npm publication of
   solid-spectrum 0.6.4, solid-stately 0.5.1, solidaria 0.4.3,
   solidaria-components 0.5.1, and ui 0.6.3.
2. **TabSwitch / SegmentedControl.** Describe the intended public/register
   boundary before any alias, rename, or composition contract is encoded.

## Non-goals

- Treating export presence, route presence, axe, or a stable screenshot as
  component acceptance.
- Weakening protected-main checks to make direct delivery convenient.
- Mixing the available upstream train into the already-qualified version
  release.
- Fixing shared behavior in both upper registers or styling components in the
  comparison app.
- Relaunching a broad census when the reports already identify finite gaps.
- Adding or changing dependencies without explicit approval.

## Before a task

- What exact upstream branch is authoritative?
- Which package owns the behavior or styling?
- What regression would fail if it drifted?
- Which public name or boundary, if any, needs the owner first?
- Which same-SHA gates and tracking records close the work?
