---
id: 186
type: task
title: "Stop Button transitions for reduced motion"
created: 2026-09-01
parent: 24
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-01,
      note: "VUI-004 reproduced from six 150 ms hover transitions in the public Viviana UI Button",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "acquired the generated S2 Button transition boundary and its public styled copies",
    }
---

La Frontera reported that the representative public Viviana UI Button retains
six 150 ms hover transitions when the user requests reduced motion. Upstream
React Spectrum currently retains the same transitions, but Viviana's explicit
product accessibility policy requires nonessential Button hover and press
transitions to resolve to zero duration under `prefers-reduced-motion: reduce`.

## Work

- Retain a real Chromium Web Animations API regression for the six current
  hover transitions.
- Preserve the current transition properties and 150 ms duration when reduced
  motion is not requested.
- Resolve nonessential Button hover and press transitions to zero duration when
  reduced motion is requested.
- Own the correction in the generated S2 Button style declarations, with no
  comparison-route or La Frontera consumer patch.
- Keep the existing upstream-compatible press transform behavior unchanged;
  this ticket owns transition timing rather than the pressed-state geometry.

## Done when

- Normal motion reports the same six transition properties at 150 ms.
- Reduced motion reports no nonzero-duration Button hover or press transition.
- Both public styled Button packages carry the same generated-style policy.
- Focused Button package, build, repository, attribution, and Changesets gates
  pass.
- Real Chromium proves both media states through `Element.getAnimations()`.

## Relationship

Initiative #24 owns component acceptance. This ticket owns producer blocker
VUI-004. La Frontera must still consume a corrected immutable release and rerun
its consumer evidence before it can close that blocker.

## Validation

- Red-first normal positive control on exact base `ffdd3e5`: a fresh isolated
  `COMPARISON_PORT=4333` passed the `D2 motion — Button` case 1/1 in 7.1 seconds,
  proving exact React/Solid parity for `background-color`, four border-color
  properties, and `color`, each at 150 ms.
- Red-first reduced-motion failure on the same unpatched source: a fresh
  isolated `COMPARISON_PORT=4335` failed the `D2 motion (reduced) — Button` case
  1/1 in 8.7 seconds. The separate pinned React expectation passed at the same
  six properties and 150 ms; Solid then returned those six forbidden
  transitions against its expected empty set.
- Post-fix real Chromium on fresh isolated `COMPARISON_PORT=4336` passed the
  normal and reduced D2 cases together, 2/2 in 9.1 seconds. The normal assertion
  requires the exact six-property list and 150 ms on each stack. The reduced
  assertion records pinned React at six properties and 150 ms, requires Solid's
  transition list to be empty, and rejects every captured Solid animation whose
  duration is nonzero or infinite.
- Browser command: `vp exec -c 'COMPARISON_PORT=4336 playwright test
e2e/certified/button.certified.spec.ts --grep "D2 motion" --reporter=line'`
  from `apps/comparison`.
- Focused public-package Button suites passed 2 files and 39 tests in 19.59
  seconds.
- `build:solid-spectrum` and `build:viviana-ui` passed, including declaration
  type builds and attribution generation. The isolated comparison build emitted
  all 100 routes.
- Repository typecheck passed. The layer-boundary, pinned upstream-oracle,
  style-macro parity (20/20 corpus entries), package-attribution, and package-
  artifact guards passed; the artifact guard verified 814 manifest targets and
  958 attribution mappings.
- The exact eight changed paths passed `vp check`. Source-artifact,
  ts-nocheck-budget (59/59), idiomatic-Solid, JSX-ref dead-code, and package-
  sourcemap guards also passed.
- `changeset:status --since=origin/main` passed and includes the two #186 patch
  bumps alongside the already committed #184/#185 changesets. The narrower
  `--since=HEAD` command cannot discover an intentionally unstaged, untracked
  changeset; no staging was performed to manufacture that evidence.
- Full `check`/`fmt:check` stop only at the pre-existing committed formatting
  issue in ticket #185. `docs:check` stops at the pre-existing invalid closed-
  state history in tickets #182/#183, and `guard:attribution-headers` stops at
  the pre-existing reviewed headerless ContextualHelp mapping tracked by #183.
- `.changeset/quiet-buttons-under-reduced-motion.md` carries patch bumps for
  `@proyecto-viviana/solid-spectrum` and `@proyecto-viviana/ui`. No versioning,
  release, registry, publish, push, or consumer pin action was performed.
