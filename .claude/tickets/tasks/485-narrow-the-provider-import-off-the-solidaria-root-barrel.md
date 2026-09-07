---
id: 485
type: task
title: "Narrow the provider import off the solidaria root barrel"
created: 2026-09-06
parent: 32
status: open
history:
  - {
      state: open,
      at: 2026-09-06,
      note: "VUI-005; measured 86 solidaria dist modules pulled in by one provider import, 17 if narrowed",
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
