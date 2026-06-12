# Current Status

This is the steering snapshot for the port. It should stay short and should be
refreshed from local scripts, not from memory.

Last refreshed: 2026-06-12.

## Snapshot

| Area                          | Current evidence                                                                                                   | What it means                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| React Aria Components exports | `vp run guard:rac-export-gap`: `0` missing named exports, `168` extra Solid exports                                | The public headless component barrel is no longer blocked on missing names. Behavior still needs component-by-component tests.              |
| Required RAC tracker          | `vp run guard:rac-parity`: no missing tracked symbols                                                              | The narrow required-symbol guard is green. It warns that `TreeHeader` and `TreeSection` are not in the upstream RAC index.                  |
| Spectrum S2 catalogue         | `vp run comparison:report:gaps`: `69` official entries tracked, `69` live on both sides, `0` missing/gap           | Route/catalogue parity is complete. Remaining component work is visual-state release hardening and support exports.                         |
| Strict S2 component audit     | `vp run comparison:report:parity:strict`: modeled controls `69/69`, validation notes `69/69`, evidence `69/69`     | The strict report is green and should stay a required current-gate check.                                                                   |
| S2 macro CSS path             | `vp run comparison:build` plus focused Picker/Switch/TextField/TextArea/Tabs Playwright suite: `30` Chromium tests | Package CSS emits through the macro build, and the comparison app now consumes Solid Spectrum source without a component stylesheet import. |
| Visual state coverage         | `349` official states tracked, `113` with current React/Solid visual evidence, `56` with strict pair-diff tests    | There are no blocked visual-state rows in the current gap report.                                                                           |
| S2 export surface             | `vp run comparison:report:exports`: `22` of `208` React S2 value exports missing; `69` extra Solid value exports   | Root catalogue component exports are present; support exports such as contexts, slots, hooks, and helpers are still missing.                |

## Main Gaps

The catalogue route gap, strict component parity audit, and blocked visual-state
rows are closed.

Visual coverage debt still exists even when the strict audit is green. Prefer
computed contracts, interaction assertions, or strict React-vs-Solid pair diffs
for new state rows, and keep thresholded screenshot checks as review evidence
unless the component note explains why they are sufficient.

`solidaria-components` has extra exports relative to upstream RAC. Some are
intentional aliases or Solid-specific composition helpers; keep them documented
as local additions when they are public API.

## Current Priorities

1. Convert new visual-state rows into current React/Solid pair-diff
   tests, especially for hover, focus-visible, pressed, selected, invalid,
   disabled, open, dismiss, and keyboard navigation states. Do not reintroduce
   per-side committed PNG baselines as focused acceptance gates.
2. Keep accessibility proof broader than axe. Run the comparison axe suite, but
   add or keep Playwright coverage for keyboard, focus, form, name,
   description, value, validation, and announcement behavior.
3. Continue support-export parity for missing contexts, slots, hooks, helpers,
   and support values. Do not count root catalogue export parity as complete API
   parity.
4. Add behavior tests where export parity is already green. Do not add more
   barrel names unless a report identifies an actual missing upstream export.
5. Keep component-internal S2 styling in `packages/solid-spectrum`. The
   comparison app shell may use `solid-spectrum` source and the S2 macro, but
   app CSS must not hand-author component colors, spacing, radius, or states.

## Refresh Commands

```bash
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run comparison:report:parity
vp run comparison:report:parity:strict
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:test:a11y
vp run a11y:check
vp run check
```

`comparison:report:parity:strict` is expected to pass. Treat a failure as a
blocking regression before claiming current-gate component parity.

Chromium Playwright may need to run outside the sandbox on this host when the
browser reports `sandbox_host_linux.cc:41 shutdown: Operation not permitted`.

## Historical Notes

Older long-form handoff notes and per-component remediation inventories should
be treated as context only. Current source, tests, and the report commands above
are the source of truth.
