---
id: 23
type: task
title: "Audit JSX refs for package-build dead-code elimination"
created: 2026-08-20
parent: 27
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the ContextualHelpTrigger package-build failure review",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "audited direct local JSX refs and reproduced lost effects in emitted output",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "guard, package build, and browser regressions passed",
    }
---

The JSX-preserving package build removed ContextualHelpTrigger behavior because
it treated a `let` ref as never assigned. JSX `ref={value}` was not visible to
the optimizer as a JavaScript write. The source tree contains many more local
element refs with the same syntax. Their observable reads have not been
classified against built output.

## Scope

- [x] Inventory package-source `let` refs that JSX assigns directly.
- [x] Classify refs by whether runtime behavior reads them after assignment.
- [x] Compare source-mode and built-package behavior for every risky class.
- [x] Prefer a structural build or ref-registration fix over one component patch.
- [x] Add a negative fixture that fails if the optimizer removes an observable ref
      read, callback, focus action, or close action.
- [x] Add browser regressions for affected keyboard, focus, overlay, and form
      behavior.
- [x] Remove safe false positives from the inventory with a recorded reason.

Do not replace every local ref mechanically. Prove which build pattern fails
and correct the structure that permits it.

## Checkpoint

The audit found 18 direct local refs in the six public package source trees.
Six refs controlled observable behavior: two dialog refs and four collection
load-more sentinels. Rolldown removed their effect bodies because a direct JSX
ref assignment did not appear as a JavaScript write.

The six risky refs now use explicit setter callbacks. The 12 remaining refs
only support generated style callbacks. Their element reads and style helper
calls remain in emitted output, so they are recorded in an exact allowlist.
The guard rejects a new entry or an allowlist entry that becomes stale.

No direct local ref with this build pattern was present in a form behavior path.
The browser evidence therefore covers the affected keyboard, focus, and overlay
paths. Existing form behavior did not require a new regression.

## Evidence

- `vp run guard:jsx-ref-dead-code` passed. It checks the source inventory, six
  real emitted behavior cases, 12 reviewed style refs, and a negative fixture.
- `vp run --filter @proyecto-viviana/solidaria-components build` passed. The
  emitted dialog behavior and four `IntersectionObserver` paths remain present.
- `vp test run packages/solidaria-components/test/Dialog.test.tsx` passed with
  33 tests, including the trigger-label fallback.
- `vp test run apps/comparison/src/data/prop-tables.test.ts` passed with 12 tests.
- The GridList, ListBox, Table, and Tree unit suites passed with 321 tests and
  four existing skips.
- `vp run comparison:build` passed with 100 generated pages.
- The Dialog and ContextualHelp Playwright regressions passed with seven tests.
  They verify accessible labeling, contained focus, Escape close, outside
  dismiss, and trigger focus restoration against the built comparison app.
- Typecheck, source-artifact, package-artifact, changeset-status, and
  documentation checks passed.

## Done when

The built packages preserve each observable JSX-ref behavior, and a guard fails
when the known dead-code pattern returns.

Verified on 2026-08-21. The emitted behavior and the regression guard both pass.

## Relationship

Extends the latest ContextualHelpTrigger fix. Component evidence contributes to
ticket #11.
