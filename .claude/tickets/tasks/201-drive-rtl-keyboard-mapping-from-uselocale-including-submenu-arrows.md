---
id: 201
type: task
title: "Drive RTL keyboard mapping from useLocale including submenu arrows"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
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
