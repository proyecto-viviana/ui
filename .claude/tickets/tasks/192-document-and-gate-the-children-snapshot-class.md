---
id: 192
type: task
title: "Document and gate the children snapshot class"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
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
