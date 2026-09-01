---
id: 183
type: task
title: "Resolve SegmentedControl icons inside their context"
created: 2026-09-01
parent: 24
status: closed
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
  - {
      state: closed,
      at: 2026-09-01,
      note: "ticket #182 removed the comparison-harness blocker and the full six-spec Button family passed 189/189 at four workers with zero retries",
    }
---

Solid resolved a `SegmentedControlItem` child before entering its local
`IconContext.Provider`. A Spectrum `createIcon` child therefore missed the
`icon` slot, center-baseline wrapper, and context-owned sizing. The comparison
family observed the resulting icon-only radio width difference from current
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
- The initial two-file, `--grep SegmentedControl`, one-worker browser selection
  completed in `52.3s`: the changed icon-only geometry case and all direct
  React/Solid radio-width comparisons passed at the unchanged one-pixel
  tolerance. Its only red classified the independent styled-label interaction
  defect subsequently corrected by ticket #182.
- After that harness correction, the final six-spec Button family passed
  `189/189` in `355.155s` with `4` workers and `--retries=0`, including all
  SegmentedControl visual and behavior cases. It recorded zero skipped, zero
  unexpected, and zero flaky cases. Machine-readable result:
  `/tmp/viviana-ui-button-family-strict-189-final-20260901/results.json`.
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

Initiative #24 owns component acceptance. Ticket #182 closed the Button
comparison-harness defect that exposed this separate producer defect; ticket
#135 still requires its own strict comparison evidence and receives no waiver
from either correction.
