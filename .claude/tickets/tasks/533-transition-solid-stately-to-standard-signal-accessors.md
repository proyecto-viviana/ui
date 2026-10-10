---
id: 533
type: task
title: "Transition solid-stately to standard signal accessors"
created: 2026-09-13
parent: 531
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to retire the MaybeAccessor runtime tax and align with Solid 2 push-pull reactivity",
    }
  - {
      state: in-progress,
      at: 2026-09-27,
      note: "createListState and createSingleSelectListState resolve a props object or accessor once. Later reads call that accessor, so getKey stays a field. A standard accessor updates the collection. collections.test.ts passes 45/45 and direct list callers pass 170/170. Table, tree, and the rest of MaybeAccessor remain",
    }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "Collection state resolves a props object or accessor once. Grid, table, tree, tree grid, menu, selection, select, combobox, and tabs keep getKey, filters, and callbacks as fields, and a standard accessor updates the collection. vp test run of the nine touched solid-stately files passes 277/277. Calendar field accessors and the remaining bag-level access() calls stay open",
    }
---

## Cause

`solid-stately` currently wraps almost all props in `MaybeAccessor<T> = T | (() => T)`
and calls `access(prop)` on every read. This incurs repeated runtime type checks
and creates ambiguity when prop values are themselves functions (formatters,
render props, filter predicates).

## Work

1. Audit `MaybeAccessor` usage across `packages/solid-stately/src`.
2. Standardize on Solid 2.0 signal accessors / prop getters.
3. Align collection state hooks (`createTableState`, `createTreeState`,
   `createListState`) with Solid 2.0 push-pull reactivity.

## Done when

`access()` calls are eliminated from hot loops in `solid-stately` and state
helpers accept standard reactive accessors.

## Relationship

Child of #531, sibling of #532.

## First Calendar migration admission — 2026-10-09

ROOT admits the existing reviewed Calendar slice under the verified temporary
direct-worker fallback and autonomous release instruction. ROOT remains the
sole tracked writer; medium Sol agents prepare and review privately. Historical
#642 writer/registration prose in the private proposal is not current authority.

Exact implementation paths are
`packages/solid-stately/src/calendar/createCalendarState.ts` and
`packages/solid-stately/test/createCalendarState.test.ts`. Supporting writes
are this ticket, generated current views, and a solid-stately patch Changeset
if the production signature repair qualifies. No other Calendar factory,
helper, caller, configuration, dependency or public name is admitted.

Apply only the four proposed owning tests first. All 75 original cases remain
byte-identical. The OLD source must stay at SHA-256
`423b7af6f14534739d4f3d949d2f0f4e1785fd9a4bb578072b71d4505ce4368e`
and the expanded test at
`87c3e536530dd28e88a64e284ad21cf357672a5192a11c46dd503d4f19722760`.
Text inventory is not a runtime pass count. Actual assertion failures and the
complete original-case outcomes must be inspected before source application.
Loader failures, owning-test type errors on the OLD signature and timeouts do
not establish behavioral causality.

The exact private test split and independent review are in
`/tmp/ui-533-calendar-test-only-review-20261009/`. The full reviewed source/test
proposal remains `/tmp/ui-533-calendar-draft-2026-10-09/`; all declared input
hashes were rechecked before admission. Candidate source uses the existing
propsAccessor boundary and preserves direct objects, getters, legacy field
accessors, real callback/factory/predicate arguments, controlled null and
initialization semantics. It does not retire Calendar field accessors.

Runtime requires a fresh serialized coordinator slot. Run the whole owning
file with unchanged assertions on OLD and candidate, followed by direct Aria
and component Calendar owners, source and explicit owning-test signature
checks, scoped hygiene and generated documentation checks. Preserve complete
raw output, actual exits, diagnostics and owned process closure. Final tests
dispose roots on successful paths; assess any failed-run interference rather
than silently changing the frozen assay. The complete OLD owning run on 2026-10-09 passed 76 cases and failed the three
new outer-bag assertions (79 total): controlled date initialization, live
visible range/focus, and the actual calendar factory callback. The legacy
field-accessor guard and all 75 original cases passed. ROOT read the complete
17,104-byte raw log; foreground session 15487 actually reaped with exit 1, no
timeout, all bound inputs conserved, and no owned processes remaining. The
immutable return is `/tmp/ui-533-calendar-old-baseline-v2-runtime-return-20261009.json`
(SHA-256 `c1d1c06877ff3dee574aeaeea3a25ea678625637b5039abadaa2823d4ce28c0e`);
raw log SHA-256 is `82a9d0074c1ccc61266310d50792328fb0beee48dd9b1ac3f2f3710d20217f27`.

After those actual assertion failures, ROOT applied only the reviewed Calendar
production correction, SHA-256
`6b0db88e38eaea1e862ac9bcca30ec77dd53f07d0eaa13d80a0699489e410995`.
The expanded owning test remains unchanged. Candidate owning, direct consumer,
type and build checks remain unrun. Other Calendar families, hot-loop
retirement, performance measurement, #533 completion and final release
qualification remain open.

## Actual local continuation returns — 2026-10-09

Actual direct-worker continuation returned: Calendar owning suite79PASS/0FAIL (candidate return /tmp/ui-533-calendar-candidate-owning-runtime-return-v2-20261009.json); full direct Calendar consumer suites82PASS/0FAIL (01-full-direct-consumers.return.json); Calendar SSR2PASS and hydration1PASS (04/05 returns). Hydration still prints the multiple-Solid-instances warning, so no warning-free certification is claimed. Source check exits0, but explicit owning-signatures check exits2 with26 actual diagnostic headers:23Calendar including two other source roots and3FakeIntersectionObserver scrollMargin diagnostics. The private type repair remains unapplied/unproved.

The comparison hydration invocation printed18 completed passing cases but did not complete its suite: it hit the actual300s deadline, exited-15 after owned cleanup, and established empty remaining owned processes. Its stack reaches unrelated Spectrum TagGroup from the stale built consumer path; refresh the owning build and rerun the comparison consumer rather than count partial output as a pass. Receipts/logs: /tmp/ui-calendar-continuation-direct-proof-20261009/{01-full-direct-consumers,02-source-types,03-explicit-owning-signatures,04-calendar-component-ssr,05-calendar-component-hydration,06-comparison-calendar-consumer}.return.json and matching .raw.log. Local component passes do not close #533's remaining signal migration, owning types or complete downstream qualification.

## Calendar owning-type repair and actual return — 2026-10-09

The reviewed v2 capability constraints were applied to the four Aria Calendar source paths, with explicit selection-mode fixture types and the missing FakeIntersectionObserver scrollMargin capability. The original assertions and inferred date subtypes remain intact. Eight named Calendar paths were formatted; only five production paths changed during formatting.

The explicit complete-owning-project check now exits0 with no diagnostics and lists all five owning unit/SSR/hydration roots plus vitest.setup.ts. The three full owning unit files pass161/161 (79 Stately,15 Aria,67 components). Receipts and full raw logs: /tmp/ui-calendar-v2-direct-proof-20261009/02-explicit-owning-signatures.return.json and 03-full-calendar-owning-161.return.json. These supersede the earlier 26-diagnostic RED for this candidate.

The production-wide `vp run typecheck` subsequently hit its admitted180-second limit without emitting diagnostics. Its actual child exited-15, all owned processes closed, and all2143 bound inputs were conserved. Receipt: /tmp/ui-calendar-v2-direct-proof-20261009/04-source-types.return.json, SHA25678fae969d4c7fdb2453583a7ed1de70061015cd13c0d189c83c1f9da4e0413d5. Scoped format check, lint and full build did not run after that timeout. Production compilation remains unresolved; neither partial passes nor absent diagnostics establish green. A real-config compiler diagnostic is next. The Calendar Changeset also covers the Aria type correction; no versioning or publication occurred.

### Production compiler diagnostic actual return — 2026-10-09

The installed compiler checked the unchanged real `tsconfig.typecheck.json`
with no TypeScript errors and exit 0. Extended diagnostics report 3,087 files,
21.46 seconds checking and 23.99 seconds total compiler time; trace type dumping
adds 18.06 seconds. The supervised invocation returned in 44.43 seconds within
its 180-second limit, with owned closure and all 4,961 bound inputs conserved.
This clears the present production config; it does not establish why the earlier
`vp run typecheck` invocation timed out. The original `vp run build` remains
required and includes the normal production typecheck wrapper.

Actual return: `/tmp/ui-production-type-diagnostic-reviewed-proof-20261009/01-production-types-trace.return.json`,
SHA256 `596e81ccded179e0f67f7953f7aea63b8095398893e91aea768858d26c362cf1`.
Both trace JSON files are complete. No source/config change or timeout increase
was used for this diagnostic.
