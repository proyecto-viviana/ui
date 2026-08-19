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

Two established styled products and one early experiment use the stack.
`@proyecto-viviana/ui` is the flagship Viviana register.
`@proyecto-viviana/solid-spectrum` is the S2-parity design-system layer and the
only source of S2 macro/token styling. `@proyecto-viviana/kumo` is a standalone
Kumo-shaped styled sibling with one experimental Button and incomplete parity
evidence.

## Current focus

**Adversarial integration audit, then evidence-backed upstream absorption.** The
detailed finding register and resumption checkpoint are in
`adversarial-audit.md`.

Launch, the six-tier recertification march, and CI enforcement are complete.
Those completed programs remain useful floors, not a claim that the current
dirty integration tree is qualified or that every component is fully ported.

The active facts that choose work are:

- the dependency graph is upgraded and currently audits at zero known
  vulnerabilities, but the full integration ladder must still qualify it;
- package builds previously passed while Vite Plus ignored six legacy config
  files and omitted declared artifacts; configs are migrated and an artifact
  manifest guard now makes that class of false green executable;
- the exact oracle is now S2 1.6.0 / RAC 1.20.0, but most T-61…T-99 behavioral
  deltas remain open or unresolved in `upstream-release-audit.md`;
- strict component reports still count modeled labels and frozen exceptions,
  not full ten-gate acceptance;
- the upper-register guard freezes source-fork growth but does not prove that
  behavior is owned at the lowest layer;
- Kumo is aligned to 2.11.0 and still experimental; paired browser evidence is
  absent and its first publish is blocked by an executable prerequisite;
- public styling explanations now state the actual sibling/fork model, while
  stale internal plan prose is being retired.

## Now

1. Execute the remaining-work census in `work-queue.md` through every
   leftover audit item. Current slice: the four certified red families
   from the 2176 run (TableView mixed Select All, Tabs arrow, Toast alert
   role, TreeView tab-forward). ActionMenu list and Dialog close-button
   D1/D3/D5 stay green. Then smoke/site, Kumo evidence, Train 8, evidence
   schema, owner decisions, hygiene, lowest-layer ownership — without
   skipping ahead.
2. Qualify the dependency/toolchain migration with meaningful targeted tests,
   complete suites, actual package artifacts, an external consumer, and
   security/peer gates.
3. Keep Kumo's first publish closed until its external npm/trusted-publisher
   prerequisite is verified; keep the package labeled experimental.
4. Continue source-level classification of T-61…T-99. Do not equate updated
   pins, exports, or passing broad suites with absorbed behavior.
5. Repair the component evidence model so current gate outcomes and runnable
   evidence, not labels and frozen baselines, determine acceptance.

## Next

1. Prove the Kumo Button behavior and visual branches in the paired fixture,
   qualify the root site, and align the sibling proposal.
2. Close the remaining classified 1.20/1.6 behavior gaps in dependency order.
3. Close the frozen strict modeled-control gaps and missing exports/DnD surface
   against the exact current oracle.
4. Consume the shared headless spine and reduce upper-layer duplication in
   bounded, evidence-backed families (#26).

## Later

- Close the catalogue-to-doc-route map and missing authored guidance (#27).
- Finish package-build and admin-dashboard migrations after the artifact graph
  is deterministic.
- Burn down residual `@ts-nocheck`, disabled lint rules, API deviations,
  license headers, and documented visual-floor waivers without displacing
  user-visible correctness.

## Open owner decisions

1. **TableView architecture.** Ratify the native-table divergence and its
   explicit acceptance contract, or converge on upstream's interactive-grid
   structure before T-87 is called absorbed.
2. **TabSwitch / SegmentedControl.** Describe the intended public/register
   boundary before any alias, rename, or composition contract is encoded.

## Non-goals

- Treating export presence, route presence, axe, or a stable screenshot as
  component acceptance.
- Weakening protected-main checks to make direct delivery convenient.
- Calling an upstream train absorbed because dependencies and oracle pins moved.
- Fixing shared behavior in both upper registers or styling components in the
  comparison app.
- Relaunching a broad census when the reports already identify finite gaps.
- Adding or changing dependencies without explicit approval.
- Expanding Kumo beyond Button or publishing it before the pilot review and a
  separate owner decision.

## Before a task

- What exact upstream branch is authoritative?
- Which package owns the behavior or styling?
- What regression would fail if it drifted?
- Which public name or boundary, if any, needs the owner first?
- Which same-SHA gates and tracking records close the work?
