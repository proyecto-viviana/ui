---
id: 493
type: task
title: "Triage certified remainders after the field-atom fix"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed after #489 (ec181d92): field D1s were the ~600-of-732 class; remaining ~130 reds are a separate triage",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "inventory from Certification Gates run 34155176389 on 0d84b016: 1998/165/4/0, not ~130",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "13 classes: #497–#508 minted under #136 (scheme forbids task-under-task), #488 bound for Toggle D2d. No same-cause package fix. Feeds #194; postcard not re-pinned. Newer Gates run 34160926954 on a9d29247 skipped certified (comparison evidence build failed).",
    }
---

Inventory of remaining certified failures after #489. This ticket is
classification + children, not a 165-cell repair. ADR 0001 holds: no
handwritten comparison CSS, no D3 waivers without a child that names the
burn-down. #194 may re-pin only against a HEAD run of this inventory.

## Inventory

Source: GitHub Actions **Certification Gates** merge on
[`0d84b016`](https://github.com/proyecto-viviana/ui/commit/0d84b0160958847acfa9ba92b07876d662755d2b),
run [34155176389](https://github.com/proyecto-viviana/ui/actions/runs/34155176389),
artifact `certified-html-34155176389`. Totals **1998 passed / 165 failed /
4 skipped / 0 waived / 0 flaky**. `certified-waivers.json` is `[]`.

A later Gates push on HEAD `a9d29247` (run 34160926954) **did not** produce a
certified merge: `comparison evidence build` failed and certified shards were
skipped. The 165-cell table stands.

Ticket prose “~130” was wrong. Driver mix of the 165: D3 63, D10 37, D9 18,
D1 18, D7 12, D4 6, D2 6, D13 4, D5 1.

Skipped four are postcard `knownDivergence` skips, not remainders:
breadcrumbs / rangeslider / slider / tableview D6. TableView D6 is not a
failed cell. This ticket does not absorb #490.

## Leftover D1 disposition

Field-root / form / FieldError D1s (and FieldError D3) named by #489 are
**0-failed**. Do not re-open.

Still red D1 (18), all in `unwaived`:

| Component                                  | Count | Class                             |
| ------------------------------------------ | ----: | --------------------------------- |
| `combobox-list` size-s/m/l × dark/light    |     6 | #497 checkmark accent             |
| `picker-list` size-s/m/l × dark/light      |     6 | #497 checkmark accent             |
| DatePicker `placeholder` × dark/light      |     2 | #501 pressed segment              |
| DateRangePicker `placeholder` × dark/light |     2 | #501 pressed segment              |
| DateRangePicker `invalid` × dark/light     |     2 | #501 (`data-pressed` never lands) |

## Button / ActionButton D3 inner state

CI unwaived titles are `caseId · theme` only. Compare labels in the HTML
report are `${slug} · ${caseId} · ${theme} · ${state}`.

**Confirmed:** all 6 Button and all 6 ActionButton D3 failures are gesture
**`pressed`**. Passing Button/ActionButton D3 cases on the same cells are the
non-pressed states (cell passed=4).

**Retired:** “pressed-state deltas near one percent” as a uniform ratio.
Button 0.0076–0.0091 (92–113 / ~12k px, `maxChannelDelta` 6–8). ActionButton
0.0030–0.0118 (46–148 px, `maxChannelDelta` 1–10). Bounds are the label box
under press, not scattered LSB noise. Button/ActionButton D1 is 10/10, so
computed styles match; D3 still rasters the press. `1af6eb71` is commit
intent, not this run’s evidence.

ToggleButton (12) and ToggleButtonGroup (15) D3 are the same `pressed`
raster (some `maxChannelDelta` 1 with 1–105 pixels still in the label box).
LSB is **not** a remainder class here. Do not promote D3 to
`currentButtonPairDiff`. Owned by #500.

## Class table (165 → child / bind / fix)

No same-cause package edit on #493: the 165 titles are 13 failure modes
(same inner error, same layer, same structure only inside each class).
`certified-waivers.json` stays `[]`.

Scheme v1 / `validateTicketBoard` rejects a task parent. Remainder children
are `type: task`, `parent: 136`, listed here. They are this ticket’s
classes, not a bind of #243 or #490.

| Class                                      | Bucket                     |                                                                                                                      Titles | Disposition   |
| ------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------: | ------------- |
| Overlay list selected-checkmark accent     | port defect                |                                                                                40 — combobox-list + picker-list D1/D3/D7/D9 | #497          |
| Overlay list RTL `direction` on the portal | port defect                |                                                                                         6 — combobox-list + picker-list D10 | #498          |
| Picker list D5 `arrow-roving` start node   | port defect                |                                                                                                                           1 | #499          |
| Button-family pressed D3 raster            | port defect                |                                                     39 — button 6 + actionbutton 6 + togglebutton 12 + togglebuttongroup 15 | #500          |
| Toggle reduced-motion D2 hover-transition  | reduced-motion interaction |                                                                                    2 — togglebutton + togglebuttongroup D2d | **bind #488** |
| DatePicker pressed segment / field paint   | port defect                |                                                                                           32 — leftover date D1s + D3/D7/D9 | #501          |
| DatePicker overlay open-enter motion       | port defect                |                                                        4 — datepicker-motion + daterangepicker-motion D2 normal and reduced | #502          |
| `ar-AE` English names + date-segment bidi  | port defect                | 27 — datefield 7, timefield 7, datepicker 5, daterangepicker 5, calendar 1, rangecalendar 1, combobox-field D10 tab-cycle 1 | #503          |
| Horizontal collection RTL focus            | port defect                |                                                        4 — actiongroup, gridlist-horizontal, taggroup-behavior, toolbar D10 | #504          |
| Pending ActionButton keyboard click        | port defect                |                                                                            2 — actionbutton D4 pending keyboard-enter/space | #505          |
| Link activation `preventDefault`           | port defect                |                                                                                            3 — link D4 mouse/keyboard/touch | #506          |
| Tabs mouse-click tabindex                  | port defect                |                                                                                  1 — tabs D4 horizontal-regular mouse-click | #507          |
| ComboBox/Picker D13 step-0 DOM             | port defect                |                                                                                     4 — combobox-field + picker-trigger D13 | #508          |

Buckets unused on this remainder: **LSB raster** (examined on every D3 PNG
pair; retired), **harness** (overlay RTL is a portal `dir` miss, not missing
`?locale` — field D10 state matrix passed), **already-ticketed
`knownDivergence`** except the #488 bind. Postcard D6 skips are not in the 165.

Not bound: #243 (journeys already run), #490, #381 (merged; pending **name**
not D4 click), #209/#248/#254 (pointed from #508, none owns the whole
step-0 class), #198/#199/#201/#202 (pointed from #503/#504).

## Sanity (not the inventory source)

`vp run comparison:build` on HEAD `a9d29247` failed in
`packages/solid-spectrum` `tsc -p tsconfig.build.json` (`splitProps` /
`unknown` across styled files). Same shape as Gates run 34160926954
skipping certified. Not a 493 repair. `vp run guard:comparison-atom-css`
passed on the existing `apps/comparison/dist` (1578 atoms). Full certified
suite **not** re-run locally.

## Done when

Every remaining certified failure is green, a dated `knownDivergence` with
an open ticket, or a new child with a named failure mode. That record is
this inventory plus #488 and #497–#508. #194 may re-pin only against a HEAD
run of that inventory.

## Relationship

Child of #136. Follows #489. Feeds #194 and the #443 release train.
Binds #488 for Toggle D2d. Does not absorb #490 TableView structure.
Does not re-pin `certified-suite-evidence.ts`.
