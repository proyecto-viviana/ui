# Current Status

This is the steering snapshot for the port. It should stay short and should be
refreshed from local scripts, not from memory.

Last refreshed: 2026-05-26.

## Snapshot

| Area                          | Current evidence                                                                                                | What it means                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| React Aria Components exports | `vp run guard:rac-export-gap`: `0` missing named exports, `166` extra Solid exports                             | The public headless component barrel is no longer blocked on missing names. Behavior still needs component-by-component tests.                 |
| Required RAC tracker          | `vp run guard:rac-parity`: no missing tracked symbols                                                           | The narrow required-symbol guard is green. It warns that `TreeHeader` and `TreeSection` are not in the upstream RAC index.                     |
| Spectrum S2 catalogue         | `vp run comparison:report:gaps`: `69` official entries tracked, `69` live on both sides, `0` missing/gap        | Route/catalogue parity is complete. The remaining component work is strict evidence, validation notes, support exports, and release-hardening. |
| Strict S2 component audit     | `vp run comparison:report:parity`: modeled controls `68/69`, validation notes `60/69`, current evidence `69/69` | `comparison:report:parity:strict` intentionally fails until Provider controls and the missing validation notes are closed.                     |
| Visual state coverage         | `346` official states tracked, `105` with current React/Solid visual evidence, `56` with strict pair-diff tests | The visual harness exists, but many current states still need strict pair-diff or computed-contract proof.                                     |
| S2 export surface             | `vp run comparison:report:exports`: `23` of `208` React S2 value exports missing; `8` extra Solid value exports | Root catalogue component exports are present; support exports such as contexts, slots, hooks, and helpers are still missing.                   |

## Main Gaps

The catalogue route gap is closed. Current strict component parity gaps:

- Provider is the only official entry without a modeled viewer control group.
- DropZone, NumberField, Picker, Provider, RadioGroup, SearchField, Switch,
  TextArea, and TextField are missing validation notes.
- NumberField, Picker, RadioGroup, SearchField, Switch, Tabs, TextArea, and
  TextField still have default/style visual rows without complete strict
  visual or pair-diff coverage; Tabs horizontal overflow remains blocked.

Visual coverage debt exists even for live entries. Many live components have
default screenshots but only asserted thresholds, planned state rows, or no
strict pair-diff coverage beyond a narrow path.

`solidaria-components` has extra exports relative to upstream RAC. Some are
intentional aliases or Solid-specific composition helpers; keep them documented
as local additions when they are public API.

## Current Priorities

1. Close the strict component parity audit gaps from
   `vp run comparison:report:parity`: Provider controls and the nine missing
   validation notes.
2. Run the component playbook in order for each missing validation-note
   component. Do not accept another
   pass with hidden retro-audit debt; mark it partial until in-scope gates are
   closed.
3. Convert planned visual-state rows into strict current React/Solid pair-diff
   tests, especially for hover, focus-visible, pressed, selected, invalid,
   disabled, open, dismiss, and keyboard navigation states. Do not reintroduce
   per-side committed PNG baselines as focused acceptance gates.
4. Continue support-export parity for missing contexts, slots, hooks, helpers,
   and support values. Do not count root catalogue export parity as complete API
   parity.
5. Add behavior tests where export parity is already green. Do not add more
   barrel names unless a report identifies an actual missing upstream export.
6. Keep component-internal S2 styling in `packages/solid-spectrum`. The
   comparison app shell may use `solid-spectrum` and the S2 macro, but app CSS
   must not hand-author component colors, spacing, radius, or states.

## Refresh Commands

```bash
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run comparison:report:parity
vp run comparison:report:parity:strict
vp run comparison:report:gaps
vp run comparison:report:exports
vp run check
```

`comparison:report:parity:strict` is expected to fail while the strict audit
gaps above remain open. Treat its output as the blocking task list, not as an
optional report.

Chromium Playwright may need to run outside the sandbox on this host when the
browser reports `sandbox_host_linux.cc:41 shutdown: Operation not permitted`.

## Historical Notes

Older long-form handoff notes and per-component remediation inventories should
be treated as context only. Current source, tests, and the report commands above
are the source of truth.
