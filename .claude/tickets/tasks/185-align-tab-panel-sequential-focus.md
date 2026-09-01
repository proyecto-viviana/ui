---
id: 185
type: task
title: "Align TabPanel sequential focus"
created: 2026-09-01
parent: 24
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-01,
      note: "VUI-003 reproduced with a selected public Viviana UI TabPanel that contains a tabbable textarea",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "acquired the Solidaria TabPanel focus-order boundary and its three component renderers",
    }
---

La Frontera reported that sequential focus stopped on the selected tab panel and
then on the document body before reaching a textarea inside the panel. The
public Viviana UI reproduction confirms that the panel retains `tabindex="0"`
even when it already contains a tabbable descendant.

## Cause

`createTabPanel` always returns `tabIndex: 0`. The pinned React Aria source only
makes the panel itself tabbable when it has no tabbable descendants, so focus
from the selected tab can otherwise move directly into the panel's first
control. The headless component and both styled TabPanel renderers also do not
pass their panel element to the owning ARIA primitive. A first observer port
also cached `false` while a force-mounted panel was inert: selecting the panel
removed the renderer's root `data-inert` state, which was not in the observer
filter, and left the panel as an extra sequential focus stop.

## Work

- Port the pinned upstream tabbable-child observation at the Solidaria focus
  boundary, observe root `inert` and `data-inert` lifecycles, and suspend
  observation while a force-mounted panel is inactive.
- Pass each rendered panel element to `createTabPanel` without changing public
  component composition.
- Retain a forward and reverse sequential-focus regression in the public
  Viviana UI package.
- Preserve `tabIndex: 0` for panels that contain no tabbable descendants.
- Cover dynamic descendant focusability and SSR/hydration behavior where
  applicable.
- Retain a real Chromium regression in the comparison route for forward and
  reverse focus after selecting a force-mounted panel.

## Done when

- A selected panel with a tabbable descendant has no panel `tabindex` stop.
- Forward Tab moves from the selected tab to the first tabbable panel child,
  and reverse Tab moves back without an intervening panel or body stop.
- A selected panel without tabbable descendants remains keyboard focusable.
- Dynamic child insertion/removal or focusability updates recompute the panel
  focus stop.
- Inactive or detached force-mounted panels do not retain a live observer.
- Each changed releasable package has a patch changeset.
- Focused Tabs, SSR/hydration, build, repository, attribution, and Changesets
  gates pass.

## Relationship

Initiative #24 owns component acceptance. This ticket owns producer blocker
VUI-003. La Frontera must still consume a corrected immutable release and rerun
its final consumer matrices before it can close that blocker.

## Validation

- Red-first public Viviana UI regression: on exact base `17a4bb0`, the selected
  panel containing a textarea retained `tabindex="0"`; the text-only control
  case passed.
- Red-first force-mounted selection regression: an inactive panel observed
  while inert cached `false`; after selecting it, the active panel retained
  `tabindex="0"`. The regression passes after observing the renderer's
  `data-inert` transition and suspending observation while unselected.
- Focused Tabs DOM suites: 4 files and 131 tests passed.
- Focused Viviana UI collection SSR: 1 test passed.
- Focused Tabs hydration settlement: 1 test passed and 9 were filtered out;
  there were no hydration mismatches.
- Full collection hydration remains 9/10 because the existing ListView
  click-selection assertion is red. The same failure was reproduced without
  this patch in a fresh worktree at exact base `17a4bb0`.
- `vp run --no-cache check` passed formatting, lint, and repository typecheck.
- `build:solidaria`, `build:components`, `build:solid-spectrum`, and
  `build:viviana-ui` passed. A complete local package-output chain also passed
  `guard:package-artifacts` (814 manifest targets and 958 attribution mappings).
- `guard:layer-boundary`, `guard:attribution`, `guard:jsx-ref-dead-code`, and
  `guard:idiomatic-solid` passed. `guard:attribution-headers` reaches the known
  ticket #183 ContextualHelp baseline blocker; the new upstream-mapped helper
  has the required Adobe header.
- Strict comparison parity and Changesets status passed. The isolated
  comparison build passed all 100 routes.
- Red-first comparison-oracle regression on a fresh worktree-managed preview:
  `vp exec -c 'COMPARISON_PORT=4327 playwright test
  e2e/tabs-visual.spec.ts --grep "Tabs shouldForceMount keeps inactive panels
  inert and out of tabpanel semantics" --reporter=line'` failed 1/1 in 6.8
  seconds. React returned `tabIndex: null` for its selected panel with a
  textarea while the stale shared expectation still required `"0"`.
- Real Chromium then passed both the corrected force-mount parity case and the
  public Solid forward/reverse focus regression together on a fresh
  worktree-managed `COMPARISON_PORT=4328` (2/2 in 9.8 seconds). The command was
  `vp exec -c 'COMPARISON_PORT=4328 playwright test e2e/tabs-visual.spec.ts
  --grep "Tabs shouldForceMount keeps inactive panels inert and out of tabpanel
  semantics|Solid Tabs enters a force-mounted panel control in both focus
  directions after selection" --reporter=line'`; no diagnostic timeout
  override remained.
- The earlier red on default port 4322 was not product evidence: Playwright
  reused an already-running preview whose process cwd was the protected owner
  checkout, so it served the exact unpatched base instead of this worktree's
  build. That process was not stopped or modified.
- The final `vp test run packages/solidaria/test/createTabs.test.tsx
  packages/solidaria-components/test/Tabs.test.tsx
  packages/solid-spectrum/test/Tabs.test.tsx
  packages/viviana-ui/test/Tabs.test.tsx` rerun passed 4 files and 131 tests in
  30.45 seconds. Direct tests exercise child insertion/removal, disabled-state
  mutation, and force-mounted selection. The `tabindex` mutation filter and
  observer teardown on deselection/detachment are source-supported residual
  evidence rather than claims of exhaustive observer-instrumentation coverage.
- The final patch is exactly 17 paths and contains no validation-created
  `node_modules` links, `.playwright-cli`, or `test-results` artifacts.
- `docs:check` remains blocked by the pre-existing invalid closed states in
  tickets #182 and #183. `git diff --check` passed.
