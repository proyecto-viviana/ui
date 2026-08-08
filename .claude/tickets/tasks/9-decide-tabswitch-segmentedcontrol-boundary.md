---
id: 9
type: task
title: "Decide the TabSwitch and SegmentedControl public boundary"
created: 2026-08-08
status: open
history:
  - {
      state: open,
      at: 2026-08-08,
      note: "opened from the contrast audit after the local control was compared with current upstream SegmentedControl",
    }
---

`solid-spectrum` exports both `TabSwitch` and the upstream-shaped
`SegmentedControl`. `TabSwitch` is a documented local addition with a different
public API, but its structure and selection-indicator styling substantially
overlap the now-ported upstream component. The contrast audit found that its
button surface still inherited the browser's native fill; the immediate repair
mirrors SegmentedControl's transparent button reset and is held by the blocking
playground scan.

This is not authorization to remove, alias, or rename a public export. The owner
needs to state whether the intended architecture is two distinct controls, a
compatibility wrapper over one implementation, or a migration from the local
surface to the upstream surface.

## Research before the decision

- Inventory in-repo and known consumer usage of both exports and compare their
  value, event, form, ARIA, keyboard, and styling contracts.
- Read the current React Spectrum S2 SegmentedControl source and docs, including
  every size, disabled, selection-indicator, forced-colors, and reduced-motion
  branch.
- Identify which TabSwitch behavior is genuinely local product intent and which
  is duplicated upstream behavior.
- Bring the compatibility and migration consequences back to the owner in the
  existing public names; do not mint a third abstraction to frame the choice.

## Done when

- The owner records the intended public boundary.
- If both remain, TabSwitch is explicitly documented as a local addition with a
  non-overlapping purpose and its own strict behavioral evidence.
- If they converge, the implementation has one lowest-layer behavior source, a
  consumer migration path, and regression evidence for every retained public
  branch before any export changes.

## Relationship

Follow-up to ticket #8. Rule #2 makes SegmentedControl upstream-authoritative;
Rule #3 reserves this public-API architecture decision for the owner.
