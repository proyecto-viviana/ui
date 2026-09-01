---
id: 188
type: task
title: "Port useIsSSR through hydration for disclosure hidden and default locale"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

React Aria's `useIsSSR()` stays true for the first client render so server
HTML and the hydration walk agree, then flips. `createIsSSR()` returns
`isServer` and `canUseDOM = !isServer`
(`packages/solidaria/src/ssr/index.tsx:62-70`), while `useIsSSR()` /
`createHydrationState()` in the same module already implement the correct
accessor. Two public ports apply the wrong flag to markup:

- `createDisclosure` emits `hidden: getDisclosurePanelHiddenAttribute(...)`
  gated on `canUseDOM` (`packages/solidaria/src/disclosure/createDisclosure.ts:43-47, 240-247`).
  Upstream: `hidden: isSSR ? !state.isExpanded : undefined`. Collapsed panels
  get `hidden=true` on the server and `hidden=undefined` on first client paint.
- `createDefaultLocale` / `getDefaultLocale` read `navigator.language` as
  soon as the client module runs (`packages/solidaria/src/i18n/locale.tsx:61-107`).
  Upstream returns `en-US` while `useIsSSR()` is true. Spectrum `ProviderRoot`
  writes `lang` / `dir` from that locale on its wrapper
  (`packages/solid-spectrum/src/provider/index.tsx:187-198`), so a consumer
  without an explicit `locale` hydrates browser `lang`/`dir` against server
  `en-US`. jsdom's `en-US` hides this in package tests.

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
