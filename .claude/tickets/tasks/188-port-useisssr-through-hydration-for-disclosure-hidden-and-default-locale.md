---
id: 188
type: task
title: "Port useIsSSR through hydration for disclosure hidden and default locale"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: verified,
      at: 2026-09-28,
      note: "createDisclosure keeps hidden through useIsSSR, and createDefaultLocale stays on en-US and ltr for that walk before following navigator.language. SSR and hydrate tests cover a collapsed panel and the useLocale probe ProviderRoot reads, with navigator.language ar-SA.",
    }
---

## Cause

React Aria's `useIsSSR()` stays true for the hydration walk, then flips.
`createIsSSR()` and `canUseDOM` stay the static server/client flags.
`useIsSSR()` was already the hydration accessor. The two markup paths now
use it:

- A collapsed `createDisclosure` panel renders `hidden` while the walk is
  true. After the walk, the client effect applies `until-found`.
- `createDefaultLocale` returns `en-US` and `ltr` while the walk is true,
  including when `navigator.language` is something else, then returns the
  browser locale. A locale passed on `window` still wins, with direction
  `ltr`, matching `useDefaultLocale`. `ProviderRoot` reads that value.

## Work

Route `createIsSSR` / `canUseDOM` consumers through the hydration-aware
accessor; make `createDisclosure` and default-locale resolution follow the
upstream first-render contract. Add paired SSR + hydrate tests for a
collapsed DisclosurePanel and for a Provider with no explicit locale under a
non-`en-US` `navigator.language`.

## Done when

Server HTML and the hydration walk agree on `hidden`, `lang`, and `dir`
without a mismatch, with tests that fail if the flag flips before hydration
completes.

## Relationship

F-SSR-002. #164 owns the tautological disclosure SSR test; this is the
product mismatch it never rendered.
