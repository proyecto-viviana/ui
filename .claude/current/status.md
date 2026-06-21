---
kind: reference
status: current
---

# Status

Status: live snapshot.
Update when: a refresh run changes the snapshot. Refresh from the scripts below,
never from memory.

Last refreshed: 2026-06-21.

## Snapshot

| Area                  | Current evidence                                                                                                         | What it means                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RAC exports           | `guard:rac-export-gap`: `9` missing named exports, `164` extra Solid exports                                             | `9` new upstream RAC names unmirrored — the Checkbox/Radio/Switch `Button`/`Field`/`FieldContext` family from a newer RAC release. Report-only, not blocking; the required tracker below is still green. Absorb via `upstream-release-audit.md`. |
| Required RAC tracker  | `guard:rac-parity`: no missing tracked symbols                                                                           | Narrow required-symbol guard green. Warns `TreeHeader`/`TreeSection` are not in the upstream RAC index.                                                                                                                                          |
| S2 catalogue          | `comparison:report:gaps`: `69` entries tracked, `69` live both sides, `0` gap                                            | Route/catalogue parity complete. Remaining work is visual-state hardening and support exports.                                                                                                                                                   |
| Strict S2 audit       | `comparison:report:parity:strict`: modeled controls `69/69`, validation notes `69/69`, evidence `69/69`                  | Strict report green; keep it a required current-gate check.                                                                                                                                                                                      |
| Visual-state coverage | `349` states tracked, `113` with current React/Solid visual evidence, `56` with strict pair-diff tests                   | No blocked visual-state rows; the remaining states are coverage debt (`tech-debt.md`).                                                                                                                                                           |
| S2 export surface     | `comparison:report:exports`: `21` of `208` React S2 value exports missing; `70` extra Solid value exports (`257` public) | Root catalogue exports present; support exports (contexts, slots, hooks, helpers) still missing.                                                                                                                                                 |

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
