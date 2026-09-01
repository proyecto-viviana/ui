---
id: 183
type: task
title: "Resolve SegmentedControl icons inside their context"
created: 2026-09-01
parent: 24
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-01,
      note: "opened from the Button comparison-gate failure classification",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "moved icon-child resolution under the SegmentedControl icon provider and added pending direct parity evidence",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "source, unit, build, changed browser case, and repository gates passed; the unchanged interactive-controls browser case remains pending the independently prepared ticket #182 harness correction",
    }
---

Solid resolves a `SegmentedControlItem` child before entering its local
`IconContext.Provider`. A Spectrum `createIcon` child therefore misses the
`icon` slot, center-baseline wrapper, and context-owned sizing. The comparison
family observes the resulting icon-only radio width difference from current
React Spectrum S2.

## Work

- Resolve item children lazily under `IconContext.Provider`, following the
  established Solid `ToggleButton` composition.
- Prove a `createIcon` child receives the `icon` slot and baseline wrapper
  without creating a text slot.
- Compare every icon-only React and Solid radio width at the existing
  one-pixel geometry tolerance.
- Keep generated S2 styles, tokens, route fixtures, selectors, visual
  thresholds, and timeouts unchanged.

## Done when

- The focused SegmentedControl package suite passes.
- The focused SegmentedControl comparison browser suite passes without a
  threshold change.
- The solid-spectrum build and required repository gates pass.
- The validation note records the completed package and browser evidence.

## Validation

- `vp install --frozen-lockfile` passed in `22.4s` with no tracked manifest or
  lockfile drift.
- `vp test run packages/solid-spectrum/test/SegmentedControl.test.tsx` passed
  `1` file and `8/8` tests in `46.55s`.
- A clean worktree required mapped declaration outputs first. The topological
  prerequisite builds passed for `solid-stately` (`14.2s`), `solidaria`
  (`19.1s`), and `solidaria-components` (`27.4s`); no tracked drift followed.
- `vp run --filter @proyecto-viviana/solid-spectrum build` passed in `67.1s`.
- `vp run --filter @proyecto-viviana/comparison build` passed in about `180s`
  and produced `100` static pages, including SegmentedControl.
- The documented two-file, `--grep SegmentedControl`, one-worker browser
  selection completed in `52.3s`: `6/7` tests passed. The changed icon-only
  geometry case passed, including every React/Solid radio-width comparison at
  the unchanged one-pixel tolerance. The single red was the unchanged
  `SegmentedControl interactive prop controls drive both stacks` case: its
  `.check()` call was intercepted by the styled label. That comparison-harness
  correction is independently prepared under ticket #182 and is not part of
  this isolated producer patch.
- `vp run check` passed formatting (`3040` files), lint (`2736` files, no
  warnings or errors), and typecheck in about `101.4s`.
- `vp run comparison:report:parity:strict` passed in `4.08s`: `78`
  official/manifest/sidebar entries, `69` modeled controls/notes/visual labels,
  zero unresolved visual-state pointers, zero missing or invalid evidence, and
  no new catalogue gaps.
- `vp run guard:layer-boundary` passed in `1.14s` with zero new forks and zero
  unbaselined dual paths.
- `vp run changeset:status` passed in `3.18s` after temporarily staging the
  otherwise-untracked changeset, reporting only a patch bump for
  `@proyecto-viviana/solid-spectrum`; the index was restored immediately.
- `git diff --check` passed.

## Relationship

Initiative #24 owns component acceptance. Ticket #182 repairs the Button
comparison harness that exposed this separate producer defect; ticket #135
must not use this correction as a waiver for its own required comparison gate.
