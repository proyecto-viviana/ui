---
id: 125
type: task
title: "Align Select selection-mode generics"
created: 2026-08-20
parent: 33
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-95" }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Select<T, M> uses value, defaultValue, and onChange. Site picker and select JSON plus the comparison picker fixture still pass selectedKeys (public-face seat).",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Resume inherited cafce46b typecheck repair. OS worker ui-125-types-20261008 owns packages/solid-stately/src/select/createSelectState.ts, packages/solidaria/src/select/createHiddenSelect.tsx, packages/solidaria-components/src/Select.tsx and their existing owning tests; this ticket, generated .claude/current/status.md and roadmap.md, and a patch changeset if required. External conductor reviews and commits after the worker stops. Public API expansion and public-face files remain outside this slice.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Local type repair is uncommitted on cca2037c. Controlled null uses an explicit undefined check. Multiple state keeps the readonly list and onChange gets a separate mutable copy. setValue(defaultValue) stays a no-op. Root typecheck excludes packages/*/test/**. Browser lane not run. Not full #125 verification.",
    }
---

Match the pinned RAC Select type contract:
`Select<T, M extends SelectionMode = 'single'>`.

The current Solid component has only `Select<T>`. The owner must steer the public
type change.

## Done when

Types, default single mode, multiple mode, values, callbacks, forms, docs, and
runtime behavior match upstream. Part of #82.

## 2026-10-08 continuation scope and proof

The inherited implementation is committed at `cafce46b`; the candidate at
`cca2037c6bf648611c86297f22cc56d2161cc11e` fails typechecking in readonly-value
narrowing and the conditional generic signal setter. Repair those failures
within the existing contract, including both hidden form adapters. No new
public name, dependency, or selection behavior is admitted.

Run the existing state, hidden-select, Select hook and component tests, plus
the full typecheck to distinguish this slice's diagnostics from the other
inherited failures. Add meaningful coverage only where a readonly value or
mode-specific callback contract lacks proof. The full ticket remains active
until its upstream, styled, form and documentation acceptance is complete.
The worker's task and result are `/tmp/ui-125-worker-2026-10-08.md` and
`/tmp/ui-125-worker-result-2026-10-08.md`. Source/tests and local commands are
authorized; the conductor takes the commit handoff. No publication follows
from this bounded repair.

## 2026-10-08 local proof

Source worker on `/home/emoporemilio/projects/viviana-hub/ui`, branch `main`,
start `cca2037c6bf648611c86297f22cc56d2161cc11e`. Git identity Emilio
Franceschini. Eligibility view matched. The tree's only prior dirt was this
ticket's admission. Work is uncommitted. The conductor commits. No push.

`Array.isArray` does not narrow `readonly Key[]` because its predicate is
`any[]` and `Key` is `string | number`. Each existing conversion uses
`typeof value === "string" || typeof value === "number"`. No file-local
`isKeyList` was copied, and no new shared helper was added: the allowed
packages have no existing helper for this split. The internal signal stores
`Key | readonly Key[] | null`. Public `value` and `onChange` still assert
`SelectValueType<M>` and `SelectChangeValueType<M>`. Single mode still stores
one key. A controlled `null` is read with an explicit `undefined` check in
initialization, sync, and display, so it is not replaced by the internal
default. Multiple state keeps the normalized readonly list and compares
`valueRef` to that list. `setValue` of the existing `defaultValue` stays a
no-op. `onChange` receives `[...keys]`, a mutable copy. The frozen regression
expects no callback for the same list, then mutates the callback for a
different frozen list and asserts that both the input and the stored state
stay unchanged.

`tsconfig.typecheck.json` includes package `src`, `test-utils`, and `scripts`.
It excludes `packages/*/test/**`. Root `vp run typecheck` does not compile the
test files. Assignments such as `const next: Key[] = value` in those tests are
not root-tsc evidence. The frozen-list proof is the runtime test.

Commands, cwd `/home/emoporemilio/projects/viviana-hub/ui`:

- `vp test run` of `packages/solid-stately/test/createSelectState.test.ts`,
  `packages/solidaria/test/createHiddenSelect.test.tsx`,
  `packages/solidaria/test/createSelect.test.tsx`, and
  `packages/solidaria-components/test/Select.test.tsx`: exit 0, 4 files,
  186 tests. Log `/tmp/ui-125-test-2026-10-08.log`.
- `vp run typecheck`: exit 2, 34 errors, zero under
  `createSelectState.ts`, `createHiddenSelect.tsx`, or
  `solidaria-components/src/Select.tsx`. Log
  `/tmp/ui-125-typecheck-2026-10-08.log`.
- `vp fmt` on the changed slice files: exit 0. `vp lint` on
  `createSelectState.ts` and its test: exit 0, 0 warnings.
- Browser lane: not run. Root typecheck does not cover the new frozen-list
  test. That test's proof is its passing runtime assertion.

Still open for #125: upstream, styled, form, and documentation acceptance.
The full typecheck still fails in ComboBox, Menu, Table, Tree, TagGroup, and
scripts. This note does not verify the ticket.
