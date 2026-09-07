---
id: 509
type: task
title: "Remove TabSwitch in the following breaking release"
created: 2026-09-07
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #491 implement: TabSwitch stays a deprecated mapping wrapper until the following breaking release",
    }
---

Remove `TabSwitch` and `TabSwitchProps` from `@proyecto-viviana/solid-spectrum` and `@proyecto-viviana/ui` in the following breaking release. #491 keeps the export as a deprecated mapping wrapper.

## Migration

Callers move to `SegmentedControl` / `SegmentedControlItem`:

- `options` → item children (`value` → `id`, `label` → children). There is no `items` prop.
- `value` → `selectedKey`. Omit when unset so first-item register runs.
- `onChange` → `onSelectionChange` with `String(id)`.
- `class` → group `class`.
- Required `"aria-label"` (caller-supplied). Do not default `"View mode"`. Do not add `aria-labelledby` to the deprecated API.

Do not fold or deprecate `Switch` / `ToggleSwitch`. Do not copy TabSwitch accent/raised-pill styling onto SegmentedControl.

## Done when

- `TabSwitch` and `TabSwitchProps` are gone from both styled barrels and the `./Switch` subpath.
- Showcase registry EXEMPT entry is gone.
- Major Changeset on those two packages. Api-reference regenerated. Mapping tests deleted.

## Relationship

Follow-up to #491. Not a child of #491 (task-under-task is illegal). Lands after the release that ships the #491 deprecation, not in that same breaking cut.
