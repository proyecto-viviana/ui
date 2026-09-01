---
id: 219
type: task
title: "Decide the package size and export-shape policy"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Four related structure questions surfaced on the perf axis; each is a
public-shape or oracle choice the owner should steer:

1. Size evidence: `guard:jsx-deopt-size` is a Babel-deopt ceiling, not a
   size oracle; #148 said a real oracle would pin versions and compare to S2
   as a new initiative.
2. `solid-stately` packs one 422,867-byte `dist/index.js`; solidaria and
   solidaria-components pack per primitive, Adobe ships one package per
   primitive. New subpaths are names with reach.
3. Styled `./Button` re-exports the whole button family
   (`packages/solid-spectrum/src/Button.ts` is `export * from "./button"`);
   S2's `exports/Button.ts` is `Button`, `ButtonContext`, `Text`. `./Picker`
   has the same shape.
4. ComboBox inlines all 34 locale dictionaries into the primitive
   (`packages/solidaria/src/combobox/intl/index.ts`); RAC publishes
   `./i18n/*` and an optimize-locales path.

## Work

Owner decides: which size oracle (if any) replaces the ceiling; whether
solid-stately gets per-primitive entries or a DCE proof (#212); whether
`./Button` matches S2's per-file surface; whether locales split.

## Done when

Decisions recorded; follow-up tickets opened only for the chosen shapes.

## Relationship

F-PERF-001/003/005/007. Owner-decision. #211 and #212 proceed regardless.
