---
id: 219
type: task
title: "Decide the package size and export-shape policy"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: verified,
      at: 2026-09-01,
      note: "owner decided all four items; follow-ups #225 #226 #227 filed; locale split noted on #198",
    }
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

## Decision (owner, 2026-09-01)

1. Size oracle: a per-export cost table produced by the packed consumer
   smoke (`import { X }` → min+brotli of the consumer bundle) with a
   checked-in baseline and a ratchet that fails on growth unless a changeset
   explains it. S2's per-export cost for the same import is printed
   alongside, report-only. The Babel-deopt ceiling stays as what it is (a
   compiler guard), not as size evidence.
2. solid-stately: per-primitive entries reusing the directory names solidaria
   already exposes (no new names minted), plus the DCE proof (#212) so barrel
   imports also tree-shake.
3. Styled per-file subpaths (`./Button`, `./Picker`, …) match S2's
   `exports/*.ts` surface exactly, generated from S2's `exports/` directory
   list so drift is guarded.
4. Locales: mirror RAC's `./i18n/*` + optimize-locales structure, done inside
   the i18n spine work (#198–#200) as one structural pass, not a separate
   ticket.

## Done when

Decisions recorded; follow-up tickets opened only for the chosen shapes.

## Relationship

F-PERF-001/003/005/007. Owner-decision. #211 and #212 proceed regardless.
