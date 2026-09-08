---
id: 508
type: task
title: "Close ComboBox and Picker D13 step-0 DOM oracle"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
  - {
      state: in-progress,
      at: 2026-09-08,
      note: "board split: name research M1–M10 as binds or children; no product packages",
    }
  - {
      state: merged,
      at: 2026-09-08,
      note: "D13 step-0 split: every M1–M10 has one owner. Bind #209 M1–M4, #248 M5–M7. Mint #512 M8, #513 M9, #514 M10 under #136. Point #254; do not bind #243 or #254. Four titles unchanged and still red. Waivers []. Did not start #511.",
    }
---

Certification Gates run [34155176389](https://github.com/proyecto-viviana/ui/actions/runs/34155176389) on `0d84b016`: **4** unwaived D13 titles.

Journeys **already run** — this is not “D13 not built” and not a bind of initiative #243.

This ticket is the **board split** (like #493), not a ten-file product patch. Inventory SHA stays `0d84b016`. `certified-waivers.json` stays `[]`.

## Titles (4, unchanged)

- `D13 journeys — ComboBox field › D13 journey — open-arrow-enter-reopen-scroll-escape`
- `D13 journeys — ComboBox field › D13 journey — keyboard-only`
- `D13 journeys — Picker trigger › D13 journey — open-arrow-enter-reopen-scroll-escape`
- `D13 journeys — Picker trigger › D13 journey — keyboard-only`

Those four journeys stay the regression once a child claims a miss. Minting is not the titles going green.

## Class table (M1–M10 → bind / child)

Every miss has exactly one owner. Pointing is not a bind.

| Miss    | Oracle                                                                                    | Owner          |
| ------- | ----------------------------------------------------------------------------------------- | -------------- |
| **M1**  | ComboBox input `data-open`                                                                | **bind #209**  |
| **M2**  | ComboBox chevron `data-open` / `data-pressed` / `data-focused` (click, open)              | **bind #209**  |
| **M3**  | ComboBox chevron `data-focused` (keyboard, closed)                                        | **bind #209**  |
| **M4**  | ComboBox root extra `data-hovered` (click) / `data-focus-visible` (keyboard)              | **bind #209**  |
| **M5**  | Overlay `data-placement` `top` vs React `bottom`                                          | **bind #248**  |
| **M6**  | Dismiss extra `aria-hidden`                                                               | **bind #248**  |
| **M7**  | React `<template>` vs Solid `<form>` (fixture always-on form)                             | **bind #248**  |
| **M8**  | ComboBox `formValue="key"` hidden input **before** children                               | **child #512** |
| **M9**  | Select root missing `data-focused` / `data-focus-visible`; keyboard wrapper flatten-hoist | **child #513** |
| **M10** | Picker chevron `<svg data-open>` (invented; S2 has none)                                  | **child #514** |

**#209** (open, parent 136) already claimed ComboBox input/button `data-*`. Does not own M5–M8, M10, Picker root, or a `ButtonContext` rewrite.

**#248** (in-progress, parent **243**) already claimed overlay “somewhere else”, Dismiss `aria-hidden`, and the bundled `<template>` vs `<form>` / extra hidden input. M8 (input **order**) splits off to #512. Binding #248 is not a bind of #243.

**#254** is **pointed**, not bound: M9 root `data-*` land on #513 without the owner composition decision; M2/M3 compound leftover (`ComboBoxButton` / `SelectTrigger` vs RAC `Button`) stays #254. Do not start #254.

Does not bind: **#243**, #254, #511.

## Work

Split only. No `packages/**`, no comparison CSS, no `journeys.ts`, no waiver. Children and binds fix in the lowest layer (Rule #4). ADR 0001: fixture `<form>` is harness, not S2 paint.

## Done when

Those 4 titles pass step 0 (and the rest of each journey), or each remaining step-0 key is a named child/bind.

The **second clause is this split**: M1–M10 each have exactly one owner. The first clause waits on #209, #248, #512, #513, and #514. Later journey steps were not observed; a post-step-0 miss is a new #136 child, not a waiver.

## Relationship

Triage class of #493. Sibling under #136. Binds #209 (M1–M4) and #248 (M5–M7). Points at #254; does not bind #243 or #254. Children #512 / #513 / #514 parent **136** (scheme v1: a task cannot parent a task).
