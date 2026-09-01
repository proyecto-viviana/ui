---
id: 135
type: task
title: "Keep direct Button text reactive after hydration"
created: 2026-08-31
parent: 24
status: in-progress
history:
  - {
      state: open,
      at: 2026-08-31,
      note: "VUI-006 reproduced in the retained Solid Spectrum SSR-to-hydration fixture",
    }
  - {
      state: in-progress,
      at: 2026-08-31,
      note: "replaced recursive child resolution in both styled Button copies and retained public-package regressions",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "moved pending authored-icon visibility to the reactive baseline wrapper in both styled Button copies",
    }
---

Direct mixed text children such as `<Button>count: {count()}</Button>` became
stale after hydration. The existing regression documented that behavior by
expecting the label to remain `count: 0` after the signal changed to `1`.

The same dual-copy closeout also owns the pending-state authored-icon defect
found while qualifying Button. The pending indicator disabled the Button and
hid its text, but a generated workflow icon could retain the class created
before pending state changed and remain visible beside the progress indicator.

## Cause

Both styled Button copies passed their children through Solid's `children()`
helper before choosing the single-text wrapper. That helper recursively resolved
the dynamic member of mixed text into an array snapshot. Returning that snapshot
from the content branch preserved the server value after hydration.

The raw child value still needs one memoized read. Returning the child accessor
without that cache shifts hydration keys for element children and breaks the
existing recreation control.

Authored icon visibility was supplied through the generated icon's context
styles. That put the pending-state dependency on the icon class rather than the
Button-owned baseline wrapper. The wrapper is the stable local element that
must react when the pending indicator becomes visible.

## Work

- Cache the authored child value once without recursively resolving its dynamic
  members in `solid-spectrum` and `@proyecto-viviana/ui`.
- Keep the existing single-static-text wrapper and public API unchanged.
- Retain direct signal-text client regressions through both public styled
  packages.
- Turn the existing Solid Spectrum SSR-to-hydration debt assertion into the
  positive `count: 0` to `count: 1` contract while preserving its recreation
  control and no-mismatch assertions.
- Move pending authored-icon visibility from the generated icon styles to the
  reactive `centerBaseline` wrapper in both styled Button copies.

## Done when

- Direct reactive Button text updates after SSR hydration without recreating
  the Button.
- The existing recreation shape hydrates and updates without a mismatch.
- Client rendering through both public styled packages remains reactive.
- An authored workflow icon is hidden by the Button-owned wrapper when pending
  state becomes visible.
- Both affected packages build and receive patch changesets.
- Focused Button, SSR, hydration, comparison, repository, attribution, and
  changeset gates pass.

## Validation (2026-09-01)

The focused behavior is green in the main worktree:

- `vp test run packages/solid-spectrum/test/Button.test.tsx packages/viviana-ui/test/Button.test.tsx`
  passed 37/37 tests across both public packages.
- `vp test run --config vitest.ssr.config.ts packages/solid-spectrum/test/Button.ssr.test.tsx`
  passed 1/1 test.
- `vp test run --config vitest.hydrate.config.ts packages/solid-spectrum/test/Button.hydrate.test.tsx`
  passed 2/2 tests, including the positive `count: 1` update and the recreation
  control.
- `vp run build:solid-spectrum`, `vp run build:viviana-ui`, and
  `vp run comparison:build` completed successfully; the comparison build emitted
  100 pages.
- `vp run comparison:report:gaps` reported 78/78 official entries and zero
  missing catalogue entries. `vp run comparison:report:exports` completed with
  the existing 13 non-root/support export gaps. The strict parity report passed
  its frozen baseline with no new catalogue gaps.
- `vp run guard:layer-boundary`, the main-worktree-only
  `vp run guard:upstream-oracle`, and `vp run guard:attribution` passed.

Three repository-state gates remain red without changing this ticket's Button
behavior evidence:

- `vp run guard:attribution-headers` reports the out-of-scope existing
  `packages/viviana-ui/src/contextualhelp/index.tsx` headerless mapping mismatch.
- `vp run check` reports formatting in the out-of-scope existing ticket #142.
- `vp run changeset:status` does not discover this ticket's new untracked
  changeset while the closeout is intentionally unstaged. The changeset exists
  at `.changeset/reactive-button-children.md`; no temporary staging was used.

## Relationship

Initiative #24 owns component acceptance. This ticket records producer blocker
VUI-006; consumer-side wrappers are not evidence that the styled Button defect
is closed.
