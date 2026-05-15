# Current Status

This is the steering snapshot for the port. It should stay short and should be
refreshed from local scripts, not from memory.

Last refreshed: 2026-05-15.

## Snapshot

| Area                          | Current evidence                                                                                                | What it means                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| React Aria Components exports | `vp run guard:rac-export-gap`: `0` missing named exports, `165` extra Solid exports                             | The public headless component barrel is no longer blocked on missing names. Behavior still needs component-by-component tests. |
| Required RAC tracker          | `vp run guard:rac-parity`: no missing tracked symbols                                                           | The narrow required-symbol guard is green. It warns that `TreeHeader` and `TreeSection` are not in the upstream RAC index.     |
| Spectrum S2 catalogue         | `vp run comparison:report:gaps`: `69` official entries tracked, `33` live on both sides, `36` missing/gap       | Styled parity is the main unfinished surface.                                                                                  |
| Visual state coverage         | `172` official states tracked, `49` with current React/Solid visual evidence, `32` with strict pair-diff tests  | The visual harness exists, but most states are not strict parity yet.                                                          |
| S2 export surface             | `vp run comparison:report:exports`: `80` of `208` React S2 value exports missing; `3` extra Solid value exports | Root catalogue component exports are present; support exports such as contexts, slots, hooks, and helpers are still missing.   |

## Main Gaps

Styled S2 entries still missing or blocked:

Accordion, ActionBar, ActionMenu, Breadcrumbs,
Calendar, Card, ColorArea, ColorField, ColorSlider, ColorSwatch,
ColorSwatchPicker, ColorWheel, ContextualHelp, DateField, DateRangePicker,
Dialog, Disclosure, DropZone, Icons, IllustratedMessage,
Illustrations, InlineAlert, ListView, Menu, Popover,
ProgressBar, ProgressCircle, RangeCalendar, RangeSlider, TableView, Tabs,
TagGroup, TimeField, Toast, Tooltip, TreeView.

Visual coverage debt exists even for live entries. Many live components have
default screenshots but only asserted thresholds, planned state rows, or no
strict pair-diff coverage beyond a narrow path.

`solidaria-components` has extra exports relative to upstream RAC. Some are
intentional aliases or Solid-specific composition helpers; keep them documented
as local additions when they are public API.

## Current Priorities

1. Use `vp run comparison:report:gaps` to choose the next styled S2 component.
2. Run the component playbook in order for the next gap. Do not accept another
   pass with hidden retro-audit debt; mark it partial until in-scope gates are
   closed.
3. Continue with the next styled S2 gap from the report. The support-component
   sweep exposed by the Skeleton, Image, Link, Badge, StatusLight, Meter, and
   Form passes is comparison-live through Form, while Divider is playbook
   accepted for owned behavior. Form inheritance beyond the TextField/Button
   fixture must still be validated during each remaining form-aware component
   pass.
4. For date/time work, continue the cluster rather than treating each widget as
   isolated: DatePicker is partial, while DateField, TimeField, DateRangePicker,
   Calendar, and RangeCalendar still show as blocked in the S2 report.
5. Convert planned visual-state rows into strict current React/Solid pair-diff
   tests, especially for hover, focus-visible, pressed, selected, invalid,
   disabled, open, dismiss, and keyboard navigation states. Do not reintroduce
   per-side committed PNG baselines as focused acceptance gates.
6. Add behavior tests where export parity is already green. Do not add more
   barrel names unless a report identifies an actual missing upstream export.
7. Keep comparison CSS limited to app shell, controls, panels, and screenshot
   frames. S2 styling belongs in `packages/solid-spectrum`.

## Refresh Commands

```bash
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run comparison:report:gaps
vp run comparison:report:exports
vp run check
```

Chromium Playwright may need to run outside the sandbox on this host when the
browser reports `sandbox_host_linux.cc:41 shutdown: Operation not permitted`.

## Historical Notes

Older long-form handoff notes and per-component remediation inventories should
be treated as context only. Current source, tests, and the report commands above
are the source of truth.
