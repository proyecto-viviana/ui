---
id: 201
type: task
title: "Drive RTL keyboard mapping from useLocale including submenu arrows"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "four mappers plus collection droppable direction now read useLocale().direction; I18nProvider he-IL keyboard tests; pending orchestrator verification",
    }
---

## Cause

Pinned React Aria reads `useLocale().direction`. Four Solid mappers do not:

- `SubmenuTrigger` `onKeyDown` always opens on ArrowRight and closes on
  ArrowLeft (`packages/solidaria-components/src/Menu.tsx:559-566`); upstream
  `useSubmenuTrigger` flips both in RTL. Package Menu RTL tests never open a
  submenu.
- `createCalendarGrid` computes RTL from `closest("[dir]")` then
  `document.dir` (`packages/solidaria/src/calendar/createCalendarGrid.ts:68-73`).
  `I18nProvider` stamps no `dir`; only the styled Provider wrapper does. A
  headless Calendar under `<I18nProvider locale="ar-AE">` keeps LTR arrows.
- `ColorSwatchPicker` `resolveDirection` reads only `document.dir`
  (`Color.tsx:2189-2193, 2288-2295`); Provider never sets that, so grid
  arrows stay LTR inside a `dir="rtl"` Provider.
- `Tree` walks `closest("[dir]")` / computed style before `document.dir`
  (`Tree.tsx:309-328`); works under Provider, fails under bare I18nProvider.

## Work

Switch the four mappers to `useLocale().direction` (upstream shape) and add
RTL keyboard tests for submenu open/close, headless Calendar, ColorSwatchPicker
grid, and Tree under `I18nProvider` with no `dir` ancestor.

## Done when

Each mapper flips from the locale context alone; the tests fail if
`document.dir` is read.

## Relationship

F-I18N-004/005. Why a D10 walk on ColorSwatchPicker would fail today; delta
on #179's driver list.

## Train 9 note (2026-09-02, via #220)

RAC 1.21.0 also made Tabs ArrowLeft/ArrowRight follow locale direction in
vertical orientation (`TabsKeyboardDelegate.ts:28-30` at `f56660b`; test
`Tabs.test.js:474`). That is not this ticket's four mappers. Port is #230.

## Landed

No remaining `document.dir` / `closest("[dir]")` reads under
`packages/solidaria/src` or `packages/solidaria-components/src` for writing
direction. Collection droppable `resolveDirection` (GridList, ListBox, Menu,
Table) was on the same audit path and now uses `useLocale().direction`.

| mapper             | RTL branch                                        | test (fails if `document.dir` is read) | upstream cite                                                                                        |
| ------------------ | ------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| SubmenuTrigger     | ArrowLeft opens / ArrowRight closes under `he-IL` | `Menu.test.tsx` submenu RTL keyboard   | `useSubmenuTrigger.ts` ArrowLeft when `direction === 'rtl'`; `SubMenuTrigger.test.tsx` rtl ArrowKeys |
| createCalendarGrid | ArrowLeft/Right from `locale().direction`         | `Calendar.test.tsx` I18nProvider he-IL | `useCalendarGrid.ts`                                                                                 |
| ColorSwatchPicker  | grid ArrowLeft advances in RTL                    | `Color.test.tsx` I18nProvider he-IL    | RAC ColorSwatchPicker direction                                                                      |
| Tree               | ArrowLeft expands in RTL (`treegrid`)             | `Tree.test.tsx` I18nProvider he-IL     | RAC `Tree.tsx` `EXPANSION_KEYS.expand.rtl === 'ArrowLeft'`                                           |

Tooltip `start`/`end` placement also read `document.documentElement.dir`; it now uses `useLocale().direction` (`Tooltip.test.tsx` I18nProvider he-IL).

Overlap with #230: Tabs vertical RTL is not this ticket.

Test-parity ratchet: the new `menu|key|arrowleft` fact has no oracle in the pinned RAC/S2 menu suites (`Menu.test.tsx`, `AriaMenu.test-util.tsx` never press ArrowLeft); the behavior is `react-aria/src/menu/useSubmenuTrigger.ts:133,210`. Absorbed with `--allow-growth 201` (baseline `growthLog`).
