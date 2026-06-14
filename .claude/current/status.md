---
kind: reference
status: current
---

# Status

Status: Current source of truth.
Update when: a refresh run changes the snapshot. Refresh from the scripts below,
never from memory.

Last refreshed: 2026-06-12.

## Snapshot

| Area                  | Current evidence                                                                                          | What it means                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RAC exports           | `guard:rac-export-gap`: `0` missing named exports, `168` extra Solid exports                              | The headless component barrel is not blocked on missing names. Behavior still needs per-component tests. |
| Required RAC tracker  | `guard:rac-parity`: no missing tracked symbols                                                            | Narrow required-symbol guard green. Warns `TreeHeader`/`TreeSection` are not in the upstream RAC index.  |
| S2 catalogue          | `comparison:report:gaps`: `69` entries tracked, `69` live both sides, `0` gap                             | Route/catalogue parity complete. Remaining work is visual-state hardening and support exports.           |
| Strict S2 audit       | `comparison:report:parity:strict`: modeled controls `69/69`, validation notes `69/69`, evidence `69/69`   | Strict report green; keep it a required current-gate check.                                              |
| Visual-state coverage | `349` states tracked, `113` with current React/Solid visual evidence, `56` with strict pair-diff tests    | No blocked visual-state rows; the remaining states are coverage debt (`tech-debt.md`).                   |
| S2 export surface     | `comparison:report:exports`: `22` of `208` React S2 value exports missing; `69` extra Solid value exports | Root catalogue exports present; support exports (contexts, slots, hooks, helpers) still missing.         |

## Refresh

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
