---
id: 253
type: task
title: "Compile ICU messages once in the headless string formatter"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found by #198: the S2 catalog had to add a second ad-hoc ICU compiler next to dnd's compileSimpleIcu",
    }
---

## Cause

Upstream compiles ICU messages at build time: the Parcel intl transformer runs
`@internationalized/string-compiler` over every `intl/*.json`, so
`LocalizedStringFormatter.format` receives a function for any message with
variables (`{count, plural, …}`, `{name}`) and a plain string otherwise
(`@internationalized/string/src/LocalizedStringFormatter.ts`). The port
imports the JSON verbatim, so `createStringFormatter`
(`packages/solidaria/src/i18n/createStringFormatter.ts:93-97`) hands string
templates back unformatted — its JSDoc claims ICU support the strings never
get.

Two catalogs now work around it locally: dnd's `compileSimpleIcu` and the S2
catalog's load-time compile in `packages/solid-spectrum/src/intl/index.ts`
(#198). Every further catalog with a plural would add a third copy. That is
Rule #5's fifty-patch building.

## Work

Compile once, in the headless layer, so catalogs stay verbatim JSON:

- Add the compile step to `createLocalizedStringDictionary` /
  `createStringFormatter` in `packages/solidaria/src/i18n/`: a string
  containing `{` is compiled to a function on first use (memoized per
  locale+key) supporting the ICU subset upstream's compiler emits — `{var}`,
  `{var, number}`, `{var, plural, =n {…} one {…} other {…}}` with `#`,
  `{var, select, …}`. Prefer porting `@internationalized/string-compiler`'s
  grammar handling from the pinned source over inventing one; adding the
  package as a dependency needs owner approval and is not the default.
- Delete dnd's `compileSimpleIcu` and the S2 catalog compile; their tests
  move to the formatter (`ar-AE` / `de-DE` plural forms, `#` substitution,
  `select`).
- A test that fails if a catalog string with `{` reaches a caller verbatim.

## Done when

`rg -n "compileSimpleIcu|compileIcu" packages` finds only the headless
formatter; #198's ActionBar `3 محدد` / `1 ausgewählt` tests and dnd's
announcements pass unchanged; `createStringFormatter` JSDoc describes what
the code does.

## Relationship

Child of #136 (i18n axis). Follows #198–#201. Independent of #202 (D10).
