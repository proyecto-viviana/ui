---
kind: reference
status: current
---

# Repository Assessment and Execution Workflow

Status: live plan of record for the post-launch repository program.
Update when: an evidence refresh changes the health assessment, a ticket changes
scope/state, an owner decision resolves, or the execution dependency order
changes.

Assessment date: **2026-08-09**. Source revision:
`20fb6164191a0b4f96535991e25a58af00ab998d` (`main == origin/main` at the start
of the run). Upstream oracle:
`c4de1e2235bce213d392477a2ebc1e575937051f`, Spectrum 2 `1.5.1`, React Aria
Components `1.19.0`, react-aria `3.50.0`.

This document turns the whole-repository audit into one repeatable operating
workflow. It does not replace component certification, upstream-sync, release,
or architecture rules; it sequences them and makes their handoffs explicit.

## Outcome

The repository is **operationally healthy but not parity-complete**.

- Protected `main` is green at the assessed revision. Certification, Release
  Readiness, Site Gate, and Changesets are required and were green on the latest
  `main` run.
- Published-package smoke, the unit suite, the contract suite, format/lint/type
  checks, docs checks, route/SEO/contrast gates, and the full certified suite
  have current passing evidence.
- Catalogue presence is complete (`78/78` live on both sides), but strict
  modeled-control coverage is `69/78` under a frozen nine-entry baseline.
- Seven Spectrum value exports remain missing: `LabeledValueContext` and six DnD
  names.
- The port is one upstream train behind: S2 `1.6.0` and RAC `1.20.0` are
  available.
- Package audit is red: 27 vulnerable instances, including one critical runtime
  dependency path and 17 high findings.
- The upper layers still carry a large frozen duplication backlog: 533 identical
  and 76 divergent shared files.
- The docs site is live and guarded, but hand-written Spectrum guidance covers
  45 route files against 78 catalogue entries; aliases require a real mapping
  report before claiming an exact missing-page count.

The next phase is therefore not another fleet census and not an unbounded
component march. It is a safety-first release/security/upstream sequence,
followed by bounded parity and structural batches with the existing evidence bar
applied at every step.

## Health assessment

| Domain                      | Evidence                                                                                              | State                                     | Required action                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Protected branch and CI     | Four strict contexts required; administrator enforcement on; no force push/delete                     | Healthy                                   | Keep same-SHA observation after every `main` change                                                |
| Release train               | Version PR #20 is open, mergeable, and all four exact-head checks are green                           | Ready, awaiting explicit publish approval | Merge only with named approval; verify five npm versions and provenance                            |
| Consumer install            | `ui:smoke` passes: five tarballs, DOM + SSR, 149/149 export files, 36/36 subpaths, 64/64 CSS classes  | Healthy                                   | Preserve on every public-package batch                                                             |
| Unit/contract evidence      | 265 unit files; 5535 pass, 1 expected fail, 10 skip; contract 93/93                                   | Healthy                                   | Run affected slices first, full suites at integration                                              |
| Component certification     | Full certified suite green; 12/12 drivers                                                             | Healthy floor                             | Do not confuse suite green with closure of frozen strict-control debt                              |
| Strict control model        | 69/78 modeled; nine accepted baseline gaps                                                            | Active debt                               | Issue [#24](https://github.com/proyecto-viviana/ui/issues/24)                                      |
| Upstream API/export surface | RAC missing 0; S2 missing 7; 70 local extras                                                          | Active debt                               | Issue [#25](https://github.com/proyecto-viviana/ui/issues/25) plus local-addition audit            |
| Upstream freshness          | Pinned exact at S2 1.5.1 / RAC 1.19.0; 1.6.0 / 1.20.0 available                                       | Advisory red                              | Issue [#23](https://github.com/proyecto-viviana/ui/issues/23)                                      |
| Layer boundary              | 609 shared files: 533 identical, 76 divergent; 41 Viviana-only; no new unbaselined fork               | Guarded backlog                           | Issue [#26](https://github.com/proyecto-viviana/ui/issues/26)                                      |
| Type suppression            | 59-file `@ts-nocheck` ceiling, no new or moved files                                                  | Guarded backlog                           | Burn down through component-certification batches                                                  |
| Site/public docs            | Live deploy; route, SEO, API-reference, outbound-link, and contrast gates block                       | Healthy floor                             | Issue [#27](https://github.com/proyecto-viviana/ui/issues/27) closes catalogue guidance            |
| Local workflow              | Aggregate lanes build prerequisites; standalone app typecheck can false-red when artifacts are absent | Misleading developer path                 | Issue [#28](https://github.com/proyecto-viviana/ui/issues/28)                                      |
| Dependency security         | 1 critical, 17 high, 8 moderate, 1 low vulnerable instances                                           | P0 risk                                   | Issue [#22](https://github.com/proyecto-viviana/ui/issues/22); dependency changes require approval |
| Tracking truth              | 91 tasks after this refresh: 44 done, 39 open, 5 in progress, 3 next, 0 blocked                       | Internally consistent                     | Keep task state and work in the same commit                                                        |

## What the refresh corrected

1. `comparison:report:parity:strict` is a **passing regression guard**, not a
   failing command. It passes because the nine gaps are frozen. The gaps remain
   debt; the command result is green.
2. `support-export-parity` was marked done while the current export report shows
   seven missing values. The initiative is reopened until behavior and exports
   both close.
3. `recert-drivers-d9-d12` was still `next` even though the completed march,
   suite source, and current certified run all prove 12/12 drivers. It is done.
4. The CI incident repair is on `main`, branch protection is active, and all four
   post-merge workflows are green. References to draft PR #21 and unsafe `main`
   were stale.
5. The old release ticket described PR #7 and 101 pending Changesets. The current
   artifact is PR #20 with one qualified version commit and five exact intended
   versions.
6. A standalone `typecheck:apps` invocation is not a clean-checkout authority:
   it consumes built workspace packages. Aggregate lanes own those preconditions
   until issue #28 encodes or rejects them deterministically.

## Execution order

### Wave 0 — operational safety

These items are independent in implementation but all precede broad parity
work, because they change what revision is published, what dependency graph is
trusted, or whether local evidence is reproducible.

1. **Release PR #20.** Obtain explicit approval for the automatic npm publish,
   merge the already-qualified head, observe Release on the exact merge SHA, and
   verify `npm view` plus provenance for all five packages. Do not mix the
   upstream train into this release commit.
2. **Dependency advisories — issue #22.** Start with the critical
   `solid-js -> seroval@1.5.1` path. Classify every critical/high path as
   published runtime, build, CI, or test. Change dependencies only after explicit
   approval, then prove tarballs and the full gate ladder.
3. **Deterministic local lanes — issue #28.** Encode prerequisite builds or
   fail early with an exact remediation. The exit is a clean-checkout workflow,
   not a new wrapper that hides failures.

Stop Wave 0 if a release check differs from the qualified head, npm versions do
not match the version commit, audit remediation forces an unsupported major
toolchain transition, or a supposedly standalone gate consumes undeclared
artifacts.

### Wave 1 — absorb the available upstream train

Issue [#23](https://github.com/proyecto-viviana/ui/issues/23) is one controlled
absorption:

1. Read official release notes, docs, source, and tests for S2 1.6.0 and RAC
   1.20.0.
2. Classify changes by `solid-stately -> solidaria -> solidaria-components ->
solid-spectrum -> @proyecto-viviana/ui` ownership.
3. Move the vendored oracle pin and comparison dependencies together.
4. Run export, catalogue, strict-control, upstream-test, token, style-macro, and
   layer-boundary reports before porting, producing a finite delta list.
5. Port behavior once at its lowest owner and S2 styling only through
   solid-spectrum's macro/token path.
6. Re-run affected component gates, then the full same-SHA ladder.

No baseline changes are accepted merely because the pin moved. Each baseline
delta must point to an upstream change or a ticketed port gap with an exit.

### Wave 2 — close parity evidence debt

Work after the new oracle is stable so evidence is not written twice.

- **Issue #24: nine strict controls.** Work dependency clusters rather than
  alphabetical names: collections/navigation together, LabeledValue/context
  separately, and DnD controls with the DnD subsystem. Exit is 78/78 with an
  empty baseline.
- **Issue #25: remaining exports/DnD.** Treat `LabeledValueContext` as a separate
  context closure and the other six exports as one DnD subsystem. Export
  presence is a floor; keyboard drag/drop, focus restoration, announcements,
  payload types, collection mutation, disabled/read-only, timing, and SSR-safe
  mounting require browser evidence where upstream exposes them.
- Continue `contract-spec-burndown`, `ts-nocheck-components`, and lint recovery
  only inside batches whose behavior is already being proven. Type/lint count
  reduction is not a substitute for parity evidence.

### Wave 3 — converge the architecture

Issue [#26](https://github.com/proyecto-viviana/ui/issues/26) and the existing
headless-spine tasks form one structural program:

1. Classify shared files as behavior, S2 styling, register wrapper, explicit
   Viviana addition, or generated/build artifact.
2. Finish consuming selection, keyboard, focus, and context-slot primitives in
   the lower layers before deleting widget copies.
3. Migrate exact upper-layer copies in bounded component families. Preserve
   public exports and prove installed tarballs per batch.
4. Keep all S2 styling in solid-spectrum; the comparison app verifies it and
   Viviana composes/registers its own design-system surface.
5. Bring the existing TabSwitch/SegmentedControl public/register boundary to the
   owner before encoding an alias, rename, or new composition contract.

Success is a monotonic reduction in the frozen 533/76 backlog with no new forks,
not a large rewrite whose end state cannot be tested incrementally.

### Wave 4 — public completeness and maintenance

- Issue [#27](https://github.com/proyecto-viviana/ui/issues/27): produce the
  catalogue-to-route map, then close behavior-backed guidance pages. Generated
  API reference and authored guidance remain separate surfaces.
- Finish the native package-build migration and admin projection after issue #28
  defines the artifact graph they consume.
- Work license headers, residual API pruning, visual-floor waivers, and other
  maintenance after user-visible correctness queues are bounded and green.

## The operating workflow

Every implementation ticket follows the same loop.

### 1. Establish an immutable start

- `git status --short --branch`; preserve unrelated work.
- Fetch and record `main`, `origin/main`, the exact oracle commit, installed
  upstream versions, and the task/issue being changed.
- Materialize required ignored evidence through
  `vp run guard:upstream-oracle`; never let missing source look green.

### 2. Refresh before choosing work

Run the status/report lane before source edits. Reports classify the gap; they
do not certify a component.

```bash
vp run guard:upstream-oracle
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:report:parity:strict
vp run guard:ts-nocheck-budget
vp run guard:layer-boundary
vp run docs:check
```

Use `vp run guard:upstream-freshness` as an advisory input. Its non-zero exit is
expected when a newer train exists; it must never be folded into a command chain
whose success is interpreted as current parity.

### 3. Specify the change before implementing it

The ticket must contain:

- exact upstream source/docs/tests and pinned version;
- current Solid source and owning layer;
- user-observable branch matrix;
- dependency order and explicitly excluded scope;
- regression evidence that would fail on drift;
- package/export/style/SSR implications;
- acceptance commands and same-SHA integration requirement;
- task/roadmap state update and Changeset decision.

Public names, exports, package boundaries, and register-positioning decisions are
owner-steered. Stop for the decision before writing a public contract.

### 4. Implement at the lowest owner

- State in solid-stately.
- ARIA, keyboard, and focus in solidaria.
- Composition, slots, render props, and data attributes in
  solidaria-components.
- S2 wrapper/API/theme/macro styling in solid-spectrum.
- Viviana-native composition and theming in `@proyecto-viviana/ui`.

Do not repair a shared behavioral gap in both upper registers. Do not patch
comparison CSS to make pair evidence pass.

### 5. Prove the affected branches

Start with the narrowest red/green test, then widen:

```bash
vp run test:run
vp run comparison:test:contract
vp run comparison:test:certified
```

The full certified suite is mandatory for a parity/oracle/shared-behavior
change. For an isolated docs/tracking change, current exact-SHA hosted evidence
plus docs/check/site gates is proportionate. Axe is smoke only; keyboard, focus,
computed accessibility, validation/forms, timing, visual pairs, and i18n require
their applicable component-playbook gates.

### 6. Qualify the repository in canonical lanes

Do not run package-cleaning build lanes concurrently; they remove and recreate
shared `dist` trees. Run aggregate lanes sequentially:

```bash
vp run check
vp run docs:check
vp run ci:release-readiness
vp run ci:site
vp run ui:smoke
```

Until issue #28 closes, do not treat standalone `vp run typecheck:apps` as a
clean-checkout authority unless the relevant workspace package chain has been
built first.

For dependency changes, add `vp pm audit --json`. For release changes, validate
the Changeset and tarball/version matrix. For upstream changes, include every
report and guard named in issue #23.

### 7. Integrate to protected main

The desired outcome is `main`, not a long-lived review branch. Attempt a normal
direct push only when GitHub will accept it without weakening protection.
Required checks, administrator enforcement, and no-force-push/no-delete rules
must not be relaxed for convenience. If protection requires a temporary branch
to acquire statuses, use it as transport, merge it promptly, and delete it; the
work item is not complete until `main` contains the commit.

### 8. Observe the exact revision

After `main` moves, verify Certification Gates, Changesets, Release Readiness,
and Site Gate on the exact resulting SHA. A green neighboring SHA is not
evidence. If publication is intended, Release must consume that same qualified
revision.

### 9. Close the loop in the same commit

Update `status.md`, `work-queue.md`, the owning task frontmatter, component
validation notes, and any Changeset with the work they describe. Close the
GitHub issue only after its acceptance evidence exists. Git history is the
archive; delete superseded live-plan prose rather than preserving contradictory
trees on `main`.

## Ticket dependency map

| Ticket                                                  | Purpose                                | Starts after                                           | Exit signal                                           |
| ------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| [#22](https://github.com/proyecto-viviana/ui/issues/22) | Critical/high dependency remediation   | Explicit dependency-change approval                    | Zero unaccepted critical/high; smoke and gates green  |
| [#23](https://github.com/proyecto-viviana/ui/issues/23) | S2 1.6.0 / RAC 1.20.0 absorption       | Current version train resolved                         | Every upstream delta classified; full ladder green    |
| [#24](https://github.com/proyecto-viviana/ui/issues/24) | Nine strict modeled-control gaps       | #23 stable                                             | 78/78; empty baseline                                 |
| [#25](https://github.com/proyecto-viviana/ui/issues/25) | Seven exports and DnD behavior         | #23 stable; coordinates with #24                       | Zero missing exports plus DnD browser evidence        |
| [#26](https://github.com/proyecto-viviana/ui/issues/26) | Upper-layer convergence                | #23 stable; owner boundary decision for public surface | Frozen duplication shrinks per proven batch           |
| [#27](https://github.com/proyecto-viviana/ui/issues/27) | Catalogue docs coverage                | Component behavior proven per page                     | Every catalogue entry has an intentional destination  |
| [#28](https://github.com/proyecto-viviana/ui/issues/28) | Deterministic local gate prerequisites | Independent Wave 0 work                                | Clean-checkout commands pass or fail early/actionably |

## Open owner decisions

1. **Publish the qualified version train?** Merging PR #20 automatically
   publishes five packages. The code/check state is ready; the side effect needs
   explicit approval.
2. **TabSwitch / SegmentedControl boundary.** The contrast audit exposed an
   overlap with public/register reach. No alias, rename, or migration is implied
   until the owner describes the intended boundary.

## Risk controls

- **Security:** do not bury a critical runtime path inside a generic dependency
  update. Trace and prove it independently.
- **Upstream drift:** freshness is advisory, but absorption is a release-sized
  parity task with an exact oracle and a finite classified delta.
- **Baseline complacency:** a green regression guard with frozen gaps is not
  acceptance. Report both command status and debt status.
- **Architecture erosion:** every new upper-layer copy is a hard failure; every
  migrated copy must reduce the backlog or document an owner-approved local
  addition.
- **Artifact false-reds:** use canonical aggregate lanes until prerequisites are
  explicit; do not dismiss real diagnostics merely because this false-red class
  exists.
- **Release mismatch:** qualify and publish the same SHA, then verify npm rather
  than inferring success from a workflow name.
- **Tracking drift:** frontmatter state, status prose, and the actual work move
  together. Code/reports win when they disagree with ordinary prose; specs/ADRs
  remain suspected-bug authorities.
