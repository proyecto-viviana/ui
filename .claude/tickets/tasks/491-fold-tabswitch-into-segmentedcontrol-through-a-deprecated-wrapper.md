---
id: 491
type: task
title: "Fold TabSwitch into SegmentedControl through a deprecated wrapper"
created: 2026-09-07
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "opened when #9 was decided by Rule #2 under the owner's 2026-09-07 delegation; owns the convergence #9 only had to decide",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement fold-tabswitch-wrapper: mapping wrappers in both styled packages, consumers to SegmentedControl, minor Changeset, #509 removal ticket",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "TabSwitch maps onto package SegmentedControl (not an identity alias). Prove: Switch.test solid-spectrum 28 passed; viviana-ui 6 passed; SegmentedControl.test 8 and 1 passed; api:extract 82 pages; guard:api-reference pass. typecheck is HEAD splitProps/unknown (703 errors, none on named paths) — not repaired. Removal #509 open. cwd /home/emoporemilio/projects/viviana-hub/ui.",
    }
---

Decision (2026-09-07, recorded in `.claude/current/steering.md`): the two
controls converge. `SegmentedControl` is the upstream-authoritative surface;
`TabSwitch` becomes a deprecated wrapper over it and is removed in the
following breaking release.

## Evidence

- `packages/solid-spectrum/src/switch/index.tsx:26-141`: `TabSwitch` is a
  two-option segmented control on the same headless `ToggleButtonGroup` /
  `ToggleButton` primitives, with an invented API (`options`, `value`,
  `onChange`, `class`), a hard-coded unlocalized `aria-label="View mode"`, an
  accent pill with white text, and none of S2 SegmentedControl's branches:
  `isDisabled`, `isJustified`, forced-colors, the reduced-motion slider
  (`react-spectrum/packages/@react-spectrum/s2/src/SegmentedControl.tsx:30-56,
116-131`). Its own comment says the track matches S2 SegmentedControl.
- That is duplicated upstream behavior with silent drift, not a documented
  local addition with a non-overlapping purpose (Rule #2).
- Consumers: `apps/web/src/routes/showcase/selection.tsx`,
  `apps/web/src/routes/solid-spectrum/playground.tsx:821`, the showcase
  registry, the api-reference `switch` page, and
  `packages/solid-spectrum/test/Switch.test.tsx:230`.
- `@proyecto-viviana/ui` ships a register-styled twin
  (`packages/viviana-ui/src/switch/index.tsx`, the island's raised pill) and
  already exports `SegmentedControl`.

## Structure

1. `solid-spectrum`: `TabSwitch` maps `options` → `SegmentedControlItem`,
   `value` → `selectedKey`, `onChange` → `onSelectionChange`, requires
   `aria-label` (no hard-coded string), carries `@deprecated` JSDoc and a
   Changeset (minor: deprecation, no removal). The two-option limit and the
   accent-pill styling go; SegmentedControl's styling is the S2 truth.
2. `@proyecto-viviana/ui`: same wrapper; behavior comes from the register's
   `SegmentedControl`. The raised-pill look is register styling and stays on
   the register's SegmentedControl styles if the owner wants it there; it is
   not a reason to keep a second behavior source.
3. Consumers move to `SegmentedControl`; the api-reference is regenerated; the
   `Switch.test.tsx` TabSwitch block asserts the wrapper mapping and the
   deprecation.
4. Removal ticket for the following breaking release with a migration note.

## Done when

- One behavior source for segmented selection in each styled package.
- `TabSwitch` is exported, deprecated, and passes through to
  `SegmentedControl` with regression tests for every retained prop.
- Showcase and playground use `SegmentedControl`.
- Changeset present; docs page marks the deprecation.

## Relationship

Follow-up to #9 and #8. Public export change: needs a Changeset and lands in
the 2026-09 release (#443) only if finished before its evidence freeze,
otherwise the next one. Removal is #509.

## Proof

cwd `/home/emoporemilio/projects/viviana-hub/ui`. Local, against the working
tree that becomes the implementation commit.

- `vp test run packages/solid-spectrum/test/Switch.test.tsx` — 28 passed
- `vp test run packages/viviana-ui/test/Switch.test.tsx` — 6 passed
- `vp test run packages/solid-spectrum/test/SegmentedControl.test.tsx` — 8 passed
- `vp test run packages/viviana-ui/test/SegmentedControl.test.tsx` — 1 passed
- `vp run api:extract` — wrote 82 reference pages; `TabSwitchProps.aria-label` required
- `vp run guard:api-reference` — checked 82 reference pages
- `vp run typecheck` — failed on HEAD `splitProps`/`unknown` (703 errors). Named paths: 0 errors. Not repaired (other slice).
- Named-path `vp check` — pass (9 files fmt, 8 lint)
