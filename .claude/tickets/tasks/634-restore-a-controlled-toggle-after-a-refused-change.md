---
id: 634
type: task
title: "Restore a controlled toggle after a refused change"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner added Visualmode D19 to the autonomous remaining-work program.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Prioritize controlled-state correctness in the next-RC Visualmode batch; reproduction still required.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admit the registered Grok worker for the shared controlled-toggle DOM repair; conductor alone accepts and commits.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "createToggle restores input.checked from state.isSelected() after setSelected when the browser flip disagrees. Focused suites 229/229. Release, browser, and publish still open.",
    }
---

## Scope

UI owns Visualmode D19. A controlled Switch reportedly retains the browser's
checked state when its owner refuses onChange. Inspect the shared
solidaria/src/toggle/createToggle.ts input change path and the stately control
contract. It currently restores checked only for readOnly. Switch and Checkbox
consume this hook; ToggleButton consumes a separate hook (#631), contrary to
the request's shared-path sketch. Name exact hook, component, styled-twin and
regression paths before dispatch. No new API, dependency or consumer edits.

## Done when

A controlled Switch or Checkbox whose owner keeps false remains unchecked
after one click while reporting the attempted change once. Accepted changes,
later external updates, uncontrolled state, readOnly and disabled behavior
remain correct. DOM checked, accessible state and owner value agree.

## Proof

Reproduce against inherited source, then exercise pointer and keyboard refusal,
accepted changes and reactive external updates in owning hook/component tests.
Check both Switch and Checkbox without blindly restoring stale uncontrolled
state. Qualify the candidate through existing regression and release gates;
report actual published fixing versions and installed-consumer verification.

## Relationship

Child of #24; #87 prioritizes it with Visualmode correctness defects before
next-RC publication. Producer for Visualmode #10161, whose Property inspector
currently restores the input in CanvasEntryPropertyField.tsx. Source request:
visualmode/visualmode/.agents/ui-requests-2026-10-07/D19-controlled-switch-keeps-a-refused-click.md.
Patch Changeset belongs to the lowest repaired package; rollback stays within
toggle behavior. No workaround removal before an installed published fix.

## Admitted paths

Grok is the sole source implementer in the eligible main checkout; the
external conductor reviews and commits after its exact generation stops.
Source: `packages/solidaria/src/toggle/createToggle.ts`. Regression paths:
`packages/solidaria/test/createSwitch.test.tsx`,
`packages/solidaria/test/createCheckbox.test.tsx`,
`packages/solidaria-components/test/Switch.test.tsx`,
`packages/solidaria-components/test/Checkbox.test.tsx`,
`packages/solid-spectrum/test/Switch.test.tsx`,
`packages/solid-spectrum/test/Checkbox.test.tsx`, and
`packages/viviana-ui/test/Switch.test.tsx`. This ticket, generated status and
roadmap, `.changeset/controlled-toggle-dom-restoration.md`, and
`/tmp/ui-634-*` evidence are also admitted. No other source paths.
