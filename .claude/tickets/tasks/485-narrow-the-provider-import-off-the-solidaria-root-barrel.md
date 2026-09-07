---
id: 485
type: task
title: "Narrow the provider import off the solidaria root barrel"
created: 2026-09-06
parent: 32
status: merged
history:
  - {
      state: open,
      at: 2026-09-06,
      note: "VUI-005; measured 86 solidaria dist modules pulled in by one provider import, 17 if narrowed",
    }
  - {
      state: in-progress,
      at: 2026-09-06,
      note: "wrote the budget first, as the ticket asks: scripts/entry-import-budget.json plus scripts/check-entry-import-budget.ts, in the house style of check-jsx-deopt-size.ts and check-ts-nocheck-budget.mjs. No new dependency; it resolves through each package's own exports map",
    }
  - {
      state: merged,
      at: 2026-09-06,
      note: "Five entries narrowed off the root barrel, 90 solidaria modules down to 17/17/17/13/8. The survey found 158 root-barrel specifiers, not 54; #487 carries the 154 that cannot be fixed from here. Guard proved on both halves: reverting the viviana-ui provider fails the frozen inventory without a build and the ./Provider ceiling (95 modules, ceiling 21) after one. The three vitest configs aliased the package to its barrel file, which also swallowed every subpath import (78 suites failed on `src/index.ts/i18n`); they alias the directory now. vp run check, test:run, test:ssr, test:hydrate.",
    }
---

Importing `Provider` drags in most of `@proyecto-viviana/solidaria` because the
provider imports from the package root barrel.

## Cause

`packages/viviana-ui/src/provider/index.tsx:25-32` imports
`I18nProvider`, `ModalProvider`, `isRTL`, `useLocale`, `useModalProvider`, and
`type Direction` from the `@proyecto-viviana/solidaria` **root** barrel. A
consumer that renders only a Provider therefore reaches **86** solidaria dist
modules. Narrowing those specifiers to the existing `/i18n` and `/overlays`
subpaths takes it to **17**. Unchanged since the 0.6.3 tag.

## Work

- Define the budget. **No bundle budget exists on `main` today**, so this entry
  has no closure criterion to meet. Write one before changing code: a module
  or byte ceiling for the provider entry, and what it is measured against.
- Narrow the six specifiers to `@proyecto-viviana/solidaria/i18n` and
  `@proyecto-viviana/solidaria/overlays`. Confirm both subpaths are declared in
  solidaria's `exports` before relying on them.
- Survey the other **54** root-barrel specifiers across the public packages.
  Fix the ones on a consumer-facing entry path; list the rest rather than
  silently leaving them.
- Add a CI guard so the barrel import cannot come back. A budget with no guard
  regresses on the next refactor.
- Add a changeset.

Stale branch `fix/187-vui-005-provider-budget` is misleading: it **contains no
VUI-005 work at all**. Do not mine it. Start from `main`.

## Root-barrel survey

The ticket estimated **54** root-barrel specifiers. The measured surface was
**158** source files importing `from "@proyecto-viviana/solidaria"`: 60 in
`solidaria-components/src`, 49 in `solid-spectrum/src`, 49 in `viviana-ui/src`,
0 in `kumo`. Four narrowings here take it to **154**.

Measuring every published entry of both styled packages splits them into two
populations, and only one of them is fixable from this ticket. The counts below
are the guard's own: it resolves each workspace specifier through the imported
package's `exports` map, which reaches four more modules than the ticket's
opening estimate of 86. The narrowed figure, 17, matches exactly.

**Fixable here — entries that reach solidaria directly.** Their whole solidaria
cost was the root barrel, so narrowing their own specifiers is the entire fix:

| entry                                                 | solidaria modules before | after |
| ----------------------------------------------------- | ------------------------ | ----- |
| `@proyecto-viviana/ui` `./Provider`                   | 90                       | 17    |
| `@proyecto-viviana/solid-spectrum` `./Provider`       | 90                       | 17    |
| `@proyecto-viviana/solid-spectrum` `./ButtonGroup`    | 90                       | 17    |
| `@proyecto-viviana/solid-spectrum` `./ProgressBar`    | 90                       | 13    |
| `@proyecto-viviana/solid-spectrum` `./ProgressCircle` | 90                       | 8     |

`./ButtonGroup` has no root-barrel specifier of its own; it imported
`useProviderProps` from `../provider`, so the provider fix carried it. The two
progress entries needed `solidaria/progress` and `solidaria/i18n`. All five now
carry a ceiling in `scripts/entry-import-budget.json`.

**Not fixable here — everything else.** Every remaining published entry of both
packages resolves `solidaria-components` (72 modules) on the way, and lands at
90–92 solidaria modules whatever its own specifiers say. Narrowing a
`viviana-ui` component's own root-barrel import cannot move its number: the
count is set one layer down by `solidaria-components`' 60 root-barrel imports.
That is **#487**, not this ticket — this one is scoped to what `viviana-ui`
asks for, and its "out of scope" line already excludes splitting solidaria's
own barrels.

The 154 remaining specifiers are therefore listed, not fixed. The guard's second
half freezes them by path: removing one is free, adding one fails.

## Resolving a narrow subpath in tests

`vitest.config.ts`, `vitest.ssr.config.ts` and `vitest.hydrate.config.ts` each
aliased `@proyecto-viviana/solidaria` to `packages/solidaria/src/index.ts`. An
alias key also matches `<key>/<subpath>`, so the first narrowed import turned
into `packages/solidaria/src/index.ts/i18n` and took 78 suites down with it.
All three now alias the package **directory**, which resolves the bare
specifier and every subpath to its own index. Any later narrowing works without
another config edit.

## Out of scope

- Splitting solidaria's own barrels. This is about what viviana-ui asks for.
- Publishing. That is #448 under #443.

## Done when

The written budget exists, the provider entry meets it, the guard fails on a
reintroduced root-barrel import, the remaining 54 specifiers are triaged in
writing, and a changeset is present.

## Relationship

Child of #32. VUI-005 in the La Frontera consumer defect ledger. Sequenced by
La Frontera's `producer-release-and-cutover-sequence-2026-09-06.md`; does not
claim that checkout.
