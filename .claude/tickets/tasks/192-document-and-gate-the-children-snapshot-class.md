---
id: 192
type: task
title: "Document and gate the children snapshot class"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "named the children() snapshot class in patterns.md, corrected the createToggleState freeze claim, and ratcheted snapshot-rendered children() sites in guard:idiomatic-solid",
    }
---

## Cause

#168 will keep returning because the written Solid guidance does not name
the failure #135 hit, and the idiomatic-solid gate cannot see it.

- `.claude/reference/patterns.md:499-516` forbids `children()` only as early
  evaluation outside a context provider. ActionButton / ToggleButton /
  LinkButton / Badge / Radio / SegmentedControl / TagGroup call
  `resolveChildren` _inside_ their providers to decide a text-only wrapper —
  the shape the page does not warn about. The hydration-key section
  (`:591-648`) never says `children()` flattens mixed text such as
  `count: {n()}` into a snapshot that stays at the server value. Button's
  landed comment (`packages/solid-spectrum/src/button/Button.tsx:180-184`)
  is the missing rule and lives only there.
- `patterns.md:218-248` claims `createToggleState(() => ({ isSelected: ariaProps.isSelected }))`
  freezes controlled mode. `createToggleState` re-calls `access(props)` on
  every read (`packages/solid-stately/src/toggle/createToggleState.ts:51-64`);
  no state helper snapshots. Switch/Checkbox comments repeat the freeze
  story. Agents following the page will "fix" working call sites.
- `patterns.md` says both "include `children` in splitProps" (`:409-436`) and
  "never split children" (`:454-497`). `splitProps` does not evaluate
  children; access does.
- `scripts/check-idiomatic-solid.ts:61` matches only `const { … } = props`.

## Work

Rewrite the three `patterns.md` sections to state the real rules (one getter
read; `children()` snapshots mixed text; state helpers re-access; splitting
`children` is fine, reading it twice is not). Add a guard that fails
`import { children as resolveChildren }` in styled content wrappers with an
explicit allowlist for element inspection (Focusable, Pressable,
OpenTransition) and cite it from the doc.

## Done when

`patterns.md` no longer teaches the freeze story or the split rule; the
guard is red on any #168 site and green after each is fixed.

## Relationship

F-SOLID-015, F-SOLID-012 (rejected round-1 finding). Structure for #168.

## Landed

- `.claude/reference/patterns.md`: deleted the `createToggleState` freeze
  claim (helpers re-call `access(props)` per read at
  `packages/solid-stately/src/toggle/createToggleState.ts:51-64`); named the
  `children()` mixed-text snapshot class (when to probe, when it is wrong,
  `createMemo(() => local.children)` adapter, one-read rule, hydration-key
  desync) with #135 / #168 / #169 / #184 as evidence; splitProps now says
  splitting `children` is fine and a second getter read is not.
- `scripts/check-idiomatic-solid.ts` plus
  `scripts/idiomatic-solid-children-baseline.json`: flags `children(() =>`
  / `resolveChildren(() =>` whose result (or a one-hop `ident()` alias) is
  rendered as JSX or returned, allows `.toArray()` / `.length` / `typeof`
  probes, and ratchets the baseline both ways. 32 frozen sites (#168 / #169
  / #192). Inspection wrappers (Focusable, Pressable, OpenTransition) and
  Tree/GridList copies sit on #192. Sites are keyed `file:ident#ordinal`,
  not by line (orchestrator change after review: a line key would have
  tripped on any edit above a site; proven by shifting `Focusable.tsx` one
  line and re-running — still PASS).
- Guard unit test: `packages/solid-stately/test/check-idiomatic-solid.test.ts`
  because `vitest.config.ts` include is `packages/**/test/**/*.test.{ts,tsx}`
  and excludes `scripts/`.

## Comment sites for #168

Source comments that repeat the freeze story (`createToggleState` / state
helpers snapshot props unless you use getters). Do not edit them in #192;
remove them when touching those files. `rg -n -i 'freeze|frozen|snapshot'
packages/*/src` is dominated by _real_ destructure-freeze comments (those
stay). The freeze _story_ is the "use getters so props are read lazily"
line above an accessor that already re-accesses:

- `packages/solidaria-components/src/Switch.tsx:134`
- `packages/solidaria-components/src/Checkbox.tsx:251`
- `packages/solidaria-components/src/Checkbox.tsx:472`
- `packages/solidaria-components/src/TextField.tsx:417`
- `packages/solidaria-components/src/DatePicker.tsx:403`
