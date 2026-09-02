---
id: 253
type: task
title: "Compile ICU messages once in the headless string formatter"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found by #198: the S2 catalog had to add a second ad-hoc ICU compiler next to dnd's compileSimpleIcu",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "one compileIcu in createStringFormatter; dnd and S2 catalog compilers deleted; tests red-then-green",
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

## Landed

Grammar (`@internationalized/string-compiler` is not a workspace dependency;
ported the compileParts subset, no new package):

`react-spectrum/packages/@internationalized/string-compiler/src/stringCompiler.js:27-93`
(`compileString` / `compileParts`: `{var}`, `{var, number}`, `{var, plural, …}` /
`selectordinal` with `#` and offset, `{var, select, …}`)
→ `packages/solidaria/src/i18n/compileIcu.ts:82-131` (`render`) and
`:133-423` (`IcuParser`); `compileIcu` at `:432`

`react-spectrum/packages/@internationalized/string/src/LocalizedStringFormatter.ts:41-44`
(`typeof message === 'function' ? message(variables, this) : message`)
→ `packages/solidaria/src/i18n/createStringFormatter.ts:56-80`
(`compilingDictionary` memoizes compileIcu per locale+key) and
`:132-139` (`createStringFormatter`)

Deleted compilers:

`packages/solidaria/src/dnd/intl/index.ts:123-131` (`compileSimpleIcu`)
`packages/solid-spectrum/src/intl/index.ts:297-301` (`compileIcu`) and
`packages/viviana-ui/src/intl/index.ts` twin (same lines)

Tests (`packages/solidaria/test/createStringFormatter.test.tsx`):
`passes a string with no arguments through unchanged`
`passes a message that is already a function through`
`interpolates {var}`
`formats {var, number}`
`substitutes # in the selected plural form`
`selects ar-AE plural categories, not English one/other`
`formats {var, select}`
`formats {var, selectordinal}`
`unescapes ICU apostrophe braces and still interpolates real arguments`
`formats actionbar.selected for de-DE instead of returning the ICU template`
`formats the dnd drop announcement instead of returning Drop on {itemText}`

Red-then-green: before wiring compileIcu into createStringDictionary,
`formats actionbar.selected for de-DE instead of returning the ICU template`
failed (`Expected: "1 ausgewählt"` / `Received: "{count, plural, =0 {Nichts ausgewählt} one {# ausgewählt} other {# ausgewählt}}"`);
after wiring, `Tests 16 passed`.
