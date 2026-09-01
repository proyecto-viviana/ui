---
kind: process
status: current
---

# Upstream sync

Status: live process.
Update when: the pin format, source paths, guards, or absorption process changes.

Use this process to pin and absorb Adobe React Spectrum releases. Work state
lives in `.claude/tickets`. The current train owner is ticket #82.

## Pinned oracle

`react-spectrum/` is a gitignored checkout of Adobe's monorepo. It is read-only
parity evidence and is never imported by a package.

`scripts/upstream-pin.json` is the source of truth for:

- the release tag and commit.
- the React Spectrum S2 and React Aria Components versions.
- the date when the pin changed.

The checkout is shallow and stays at the exact commit in that file. The
comparison app must use the same exact upstream package versions. The
`@adobe/spectrum-tokens` version in `solid-spectrum` and in `viviana-ui` must
equal the exact version used by the pinned S2 source.

Pin alignment is not behavior absorption. A train is absorbed only after each
source and release-note delta is classified, ported or proved not applicable,
and covered by strict evidence.

## Four staleness checks

Keep these checks separate:

1. **Checkout against pin.** `guard:upstream-oracle` verifies the checkout HEAD,
   package identities, and required source and test paths.
2. **Pin against latest release.** `guard:upstream-freshness` checks Adobe's
   published RAC and S2 tags. CI reports this result. A new release starts a
   ticketed absorption train.
3. **Comparison dependencies against pin.** The exact versions in
   `apps/comparison/package.json` must equal `scripts/upstream-pin.json`.
4. **Spectrum tokens against pinned S2.** `guard:spectrum-tokens-pin` verifies
   the declared, installed, and vendored token versions for both styled
   packages.

Missing source evidence is a failure. A guard must not silently skip because the
ignored checkout is absent.

## Materialize the oracle

For a checkout with no `react-spectrum/` directory, run:

```bash
node scripts/check-upstream-oracle.mjs --acquire
```

The command refuses to overwrite a checkout at another revision. Move an
existing checkout through the release process below.

## Absorbing a new upstream release

1. Find the current RAC and S2 release tags.

   ```bash
   git ls-remote --tags https://github.com/adobe/react-spectrum \
     | grep -E 'refs/tags/(@react-spectrum/s2@|react-aria-components@)[0-9.]+$' \
     | sort -t@ -k2 -V | tail
   ```

2. Resolve both tags. Confirm that they belong to the same Adobe release train
   and select the exact commit.

3. Refresh the shallow oracle checkout.

   ```bash
   git -C react-spectrum fetch --depth 1 origin '@react-spectrum/s2@<NEW>'
   git -C react-spectrum checkout FETCH_HEAD
   ```

4. Diff source and tests from the old commit to the new commit.

   ```bash
   git -C react-spectrum diff <OLD_SHA> <NEW_SHA> -- \
     packages/react-aria-components/src \
     packages/react-aria-components/test \
     packages/@react-spectrum/s2/src \
     packages/@react-spectrum/s2/test
   ```

5. Read both official release records. Release notes explain behavior changes,
   new props, fixes, and components that an ARIA vocabulary diff cannot find.

   ```bash
   gh release view 'react-aria-components@<NEW>' --repo adobe/react-spectrum
   gh release view '@react-spectrum/s2@<NEW>' --repo adobe/react-spectrum
   ```

6. Create one task for each unresolved upstream delta. Put source evidence,
   required browser engines, dependencies, and acceptance conditions in the
   task. Closed and not-applicable classifications stay in Git history, not in a
   permanent release ledger.

7. Run the mechanical guards.

   ```bash
   vp run guard:upstream-test-parity
   vp run guard:rac-parity
   vp run guard:rac-export-gap
   vp run guard:dnd-keyboard-parity
   vp run guard:virtualizer-keyboard-parity
   ```

8. Reconcile every new or resolved flag against the pinned source. Update the
   component validation note for Gate 3. A report is an inventory, not a verdict.

9. Update `scripts/upstream-pin.json`, the comparison app's exact versions, and
   the exact Spectrum token version in one change. Update the train ticket with
   the atomic task map.

10. Port shared lower-layer behavior before styled consumers. Run every
    applicable acceptance gate. Use real browsers for behavior that depends on
    layout, engine behavior, pointer modality, Shadow DOM, or mobile assistive
    technology.

11. Mark the train verified only when all required atomic tasks and same-revision
    gates pass.

If Adobe moves test files, update `UPSTREAM_TEST_ROOTS` or the matcher in
`scripts/check-upstream-test-parity.ts`. Current S2 tests live under
`packages/@react-spectrum/s2/test`. Several RAC tests use `.test.tsx`.

## Contract-vocabulary guard

`guard:upstream-test-parity` compares local package tests with pinned RAC and S2
tests. It extracts:

- asserted ARIA roles.
- accessible names.
- `aria-*` attributes and Testing Library state options.
- keyboard keys.

Roles have the highest report weight. `WE-ONLY` means local tests assert a shape
that the matched upstream files do not assert. `UPSTREAM-ONLY` means the matched
upstream files assert a shape that local tests do not assert.

The guard is a baselined triage aid. It is not an authority. File-level
vocabulary can include helper widgets, fixture names are example-specific, and
browser specs are outside this scan. Confirm every result against the pinned
source before changing code or tests.

## Evidence and handoff

For each absorbed delta, record:

- the upstream tag, commit, source, tests, and release note.
- why the delta applies or does not apply to Solid.
- the lowest owning package.
- the regression that fails on the old behavior.
- browser and assistive-technology coverage.
- the Changeset when a published package changes.
- the exact commands and revision that passed.

Use `certification.md` and the component playbook for the acceptance bar. Use the
generated `status.md` and ticket #82 for current progress.
