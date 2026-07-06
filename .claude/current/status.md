---
kind: reference
status: current
---

# Status

Status: live snapshot.
Update when: a refresh run changes the snapshot. Refresh from the scripts below,
never from memory.

Last refreshed: 2026-07-06 (director validation pass; `main-rot-burndown-2026-07`
closed — unit / format / a11y-smoke gates back to green; Toast certified CP9.35,
37/37, with the global bare-ui-icon fix; DropZone/FileTrigger certified CP9.36,
31/31 first-run green — Tier 3 complete).

## Snapshot

| Area                  | Current evidence                                                                                                                                                                                     | What it means                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required RAC tracker  | `guard:rac-parity`: no missing tracked symbols                                                                                                                                                       | Narrow required-symbol guard green.                                                                                                                                                                                                           |
| RAC exports           | `guard:rac-export-gap`: `0` missing named exports, `168` extra Solid exports                                                                                                                         | Name-surface parity with pinned RAC 1.19.0 is closed. Extras are documented local additions.                                                                                                                                                  |
| S2 catalogue          | `comparison:report:gaps`: `70` entries live both sides, `0` gap; `351` visual states tracked, `0` blocked                                                                                            | Route/catalogue parity complete.                                                                                                                                                                                                              |
| S2 export surface     | `comparison:report:exports`: `7` of `208` React S2 value exports missing; `68` extra                                                                                                                 | The 7 missing are `LabeledValueContext` + six DnD names (`useDragAndDrop`, `DragPreview`, `DIRECTORY_DRAG_TYPE`, `is{Text,File,Directory}DropItem`) — the DnD subsystem is the one un-ported surface (`tech-debt.md` → `dnd-subsystem-port`). |
| Strict S2 audit       | `comparison:report:parity:strict`: FAIL — `LabeledValue` alone missing validation note + current evidence                                                                                            | One component from green (`tech-debt.md` → `labeledvalue-strict-parity`).                                                                                                                                                                     |
| Recertification march | `comparison:test:certified`: `1321/1331` — DropZone/FileTrigger certified (CP9.36, 31/31, first-run green); remaining reds are the deferred D4 event-ordering epic                                   | Tiers 1–3 certified (Tier 3 = 10 overlay/box units, closed 2026-07-06 with DropZone). The march (`recertification.md`) is the depth-parity measure; ~37/70 styled components certified. Next: Tier 4 (Picker).                                |
| Unit suite            | `vp run test:run`: PASS — `5528` passed, `1` expected-fail, `8` skipped                                                                                                                              | Green. The 7 CP9.34 stale-test failures were realigned to upstream (`main-rot-burndown-2026-07`, done 2026-07-06); CP9.35 realigned 5 regression snapshots + 2 ActionMenu assertions to the bare-ui-icon fix.                                 |
| Format/type gate      | `vp run check`: PASS — `0` errors, typecheck clean (1 pre-existing lint warning in `admin/Markdown.tsx`)                                                                                             | Green. The 26-file oxfmt drift was fixed via `vp check --fix` (`main-rot-burndown-2026-07`, done 2026-07-06).                                                                                                                                 |
| A11y smoke            | `vp run a11y:check`: PASS — `44/44` e2e a11y-smoke green                                                                                                                                             | Green. Toolbar `End` / ActionBar `Home` were stale tests asserting Home/End that CP9.3 removed as invented (upstream binds neither); realigned to arrow-nav (`main-rot-burndown-2026-07`, done 2026-07-06).                                   |
| Contract suite        | `comparison:test:contract`: `85/85` green                                                                                                                                                            | ARIA-vocabulary contracts hold.                                                                                                                                                                                                               |
| Pins                  | S2 `1.5.1` / RAC `1.19.0` / react-aria `3.50.0`; tokens `14.0.0` exact; freshness guard green                                                                                                        | Vendored oracle and installed comparison deps aligned.                                                                                                                                                                                        |
| CI / release          | Main pushed (origin/main at `3a3d5b69`, 2026-07-06); gate-on-main wiring drafted+committed, awaiting push to fire; version PR #7 stuck; `101` changesets pending; npm one patch behind on 3 packages | `ci-main-gate-wiring` down to its push/validate step (`certification-gates.yml` now triggers on push-to-main + runs the 3 orphaned checks); `release-train-unjam` still open — the remaining process risk.                                    |

## Refresh

```bash
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run comparison:report:parity:strict
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:test:certified
vp run comparison:test:contract
vp run test:run
vp run a11y:check
vp run check
```

`comparison:report:parity:strict` and `comparison:test:certified` (minus reds
recorded in `recertification.md`) are expected to pass. Treat a failure as a
blocking regression before claiming current-gate component parity.
