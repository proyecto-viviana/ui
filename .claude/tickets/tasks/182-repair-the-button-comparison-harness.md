---
id: 182
type: task
title: "Repair the Button comparison harness interactions"
created: 2026-09-01
parent: 24
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from VUI-006 comparison-gate triage" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "centralized live theme requests and replaced stale control interactions in the Button browser family",
    }
---

The Button comparison family still reaches several Solid Spectrum control
inputs through Playwright's raw `input.check()` action. Those inputs are
visually hidden inside pressable React Aria labels, so the raw input action can
time out even when the harness and component under test are healthy.

## Evidence

The `test:button` command runs six specs. Its existing
`button-family-contract.spec.ts` already uses the shared user-like
`checkControl` helper for these controls. Five sibling specs instead use raw
`check()` calls.

Two failures are even narrower:

- Button and ActionButton try to change a live page through the obsolete
  `comparisonTheme` inputs. The current docs shell owns theme changes through
  the `comparison:theme-request` event.
- The Button `children` label names both the Solid Spectrum field wrapper and
  its native input. An unscoped `getByLabel("children")` is therefore
  ambiguous.

These are comparison-harness defects. They do not require package changes,
visual-threshold changes, timeout changes, or weaker assertions.

## Work

- Share one live-page theme request helper that uses the existing docs-shell
  event contract.
- Route Button, ActionButton, and the theme contract through that helper.
- Scope the Button `children` input to the exact Button control form and native
  input.
- Use `checkControl` for the React Aria radio and checkbox controls exercised
  by the six-spec Button browser family.
- Preserve the SegmentedControl behavior assertions and every visual threshold.

## Done when

- The six-spec `test:button` family passes without raw React Aria input checks.
- The component theme contract passes through the shared live-page request
  helper.
- No package implementation, timeout, script, visual threshold, or component
  assertion changes are needed.
- Required repository and documentation gates pass.

## Relationship

This harness prerequisite must land before ticket #135 can use the Button
comparison family as producer evidence. Initiative #24 still owns component
acceptance.
