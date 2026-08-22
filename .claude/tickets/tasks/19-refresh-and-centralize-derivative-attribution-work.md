---
id: 19
type: task
title: "Refresh and centralize derivative-attribution work"
created: 2026-08-20
parent: 35
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "opened from the repository-wide documentation audit" }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "moved the active attribution plan into this ticket and retired the duplicate public-doc plan",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "recounted the six packages and guarded the stable package attribution files",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "owner confirmed the exact header, manual fallback review, and no blanket header for original source",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "added a deterministic mapping inventory and found icon-generator drift",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "tightened exact mappings so every marker and explicit path remains evidence-backed",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "applied exact-source headers, removed three dead state duplicates, and preserved all 162 remaining headers in package builds",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "classified four headerless exact mappings, recorded the Microsoft Tabster source, and isolated the remaining Grid State decision",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "mapped all 23 header-bearing S2 and flags sources, shared marker parsing, and removed the last short Adobe block",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "preserved styled-package attribution in runtime and declaration-only build outputs",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "resolved four false multi-source mappings and synchronized their exact upstream headers",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "recorded and guarded the complete upstream source sets for all six composite mappings",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "resolved all 13 previously unresolved Stately source markers and recorded seven additional composite source sets",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "resolved 22 Solidaria source markers through exact, headerless, and composite source reviews",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "classified the remaining 13 Solidaria markers as ten composites and three local helpers or barrels",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "classified all 11 component markers as nine exact ports, one composite, and one local barrel",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "classified all six independent styled-package markers as four exact mappings and two Toast composites",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "resolved Grid State as a reviewed headerless exact mapping using its port-date and pinned upstream forms",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "enforced exact upstream blocks and source paths for all 27 composite mappings",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "regenerated and guarded all S2 icon outputs from pinned shipped modules, leaving only 439 unmarked files",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "classified and hash-guarded 126 local module surfaces, leaving 313 unmarked files",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "completed the Solid Stately review with nine exact mappings, six composites, and two reviewed local files",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "completed the Solidaria review with 18 exact mappings, 15 composites, and six reviewed local helpers",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "completed the Solidaria Components review with 15 header-bearing exact mappings, two headerless exact mappings, seven composites, and six local helpers",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "completed the Solid Spectrum review with 95 single-source mappings, 11 composites, and 16 local helpers",
    }
---

The duplicate `docs/license-compliance-plan.md` was removed in `ca8c6b0c`.
This ticket is now the one active task for initiative #35. Do not restore a
second plan under `docs/`.

This ticket concerns repository policy and evidence. It does not make a legal
compliance claim.

## Evidence snapshot

The pre-header baseline revision is `03edb8e3` on 2026-08-21. The table below
shows the current source counts after the Solid Spectrum implementation review.

`vp run guard:attribution` counts TypeScript source under each Adobe-derived
package. It excludes declaration files.

| Package                                  | TS/TSX | Adobe header | Source marker |
| ---------------------------------------- | -----: | -----------: | ------------: |
| `@proyecto-viviana/solid-stately`        |     93 |           58 |            62 |
| `@proyecto-viviana/solidaria`            |    231 |          162 |           175 |
| `@proyecto-viviana/solidaria-components` |     74 |           64 |            67 |
| `@proyecto-viviana/solid-spectrum`       |    604 |          119 |           121 |
| `@proyecto-viviana/ui`                   |    644 |           15 |            15 |

These columns are discovery aids. A source marker is a `Based on`, `Port of`,
or `Ported from` clause that names a React Aria, React Stately, React Spectrum,
or React Aria Components source. Both attribution commands use the shared
`scripts/attribution-source-markers.mjs` parser. A marker is not proof that a
full notice is correct. A missing marker is not proof that a file is original.

`vp run guard:layer-boundary -- --report` scanned 609 Spectrum files and 650
Viviana UI files. The packages share 609 paths: 533 are identical and 76 have
diverged. Viviana UI has 41 additional paths. This proves that Viviana UI must
be included in project and package-level Adobe attribution. It does not prove
which additional paths are derivative.

## Mapping inventory

`vp run report:attribution-mappings` compares local TS and TSX source with the
pinned `react-spectrum/packages` tree. It reports evidence; it does not add
headers or make a compliance claim. The JSON form is the resumable file-level
inventory:

```bash
vp run report:attribution-mappings --json
```

The 2026-08-21 inventory has these results:

| Status                      | Files |
| --------------------------- | ----: |
| `exact`                     |   359 |
| `exact-no-header`           |    11 |
| `generated-exact`           |    11 |
| `generated-exact-no-header` |   410 |
| `generated-multiple`        |     2 |
| `mirror`                    |   481 |
| `multiple`                  |    66 |
| `reviewed-local`            |   156 |
| `unmarked`                  |   150 |

The report scanned 1,646 files. It found 359 independent files with one
header-bearing exact source and eleven files with a reviewed headerless exact
source. All 363 exact-source header contracts pass. The generated groups have
verified inputs. The report records 127 module surfaces and 29 local Solid
helpers as reviewed local source. It keeps 150 unmarked files in review. Each
local review has an exact content hash. A content change reopens review. The 481
byte-identical Viviana UI files still inherit their Solid Spectrum mapping.
Adding explicit Spectrum notices changed 45 formerly identical files. The report
reopened those Viviana UI files so they receive an independent review.

This pass mapped 23 previously header-bearing S2 and flags sources to exact
upstream files. No file remains in `header-unmapped`. Multiline marker parsing
also exposed the hidden native date input in `DateField.tsx` as a port of
`react-aria-components/src/HiddenDateInput.tsx`. DateField is now an explicit
two-source review instead of a false single-source mapping.

Four broad prose markers named a helper or consumer next to the primary upstream
implementation. Those markers created false `multiple` results. Their verified
exact paths remain recorded.

The Stately review resolved all 13 previously unresolved source markers: five
map to header-bearing exact sources, one maps to a headerless exact source, and
seven are genuine composites.

The first Solidaria pass resolved 22 markers. Nineteen map to header-bearing
exact sources, two map to headerless exact sources, and Breadcrumbs is a
two-source composite.

The second Solidaria pass resolved the remaining 13 markers. Ten files are
genuine composites with explicit pinned paths. Three broad markers described
local Solidaria code: one composition helper and two barrels.

The component review resolved all 11 remaining markers. Nine map to
header-bearing exact sources. Color is a composite of eight React Aria
Components color files and the React Aria grid keyboard delegate. The package
barrel is local source.

The styled-package review resolved all six independent markers. Four map to
header-bearing exact sources. The two Toast files are composites of the S2
Toast implementation and its headerless CSS module. Two byte-identical Viviana
UI files inherit their Solid Spectrum mappings. The pass updated eight physical
source files.

The implementation review then completed all 17 unmarked Solid Stately files.
Nine files map to one exact upstream source. Six files have complete composite
source sets. The selection entrypoint is a local module surface. The reactivity
utility is a Solid-only helper. React Stately locale markers now resolve every
file in the pinned locale catalog, and the regression fixture checks this rule.

The implementation review also completed all 39 unmarked Solidaria files.
Eighteen files map to one exact upstream source. Fifteen files have complete
composite source sets. Six focus, disclosure, environment, and reactivity
utilities are explicit local helpers with no direct upstream API. Solidaria now
has no unmarked files.

The implementation review completed all 30 unmarked Solidaria Components
files. Fifteen files map to one header-bearing source. ColorEditor and
ListDropTargetDelegate map to reviewed headerless sources. Seven files combine
complete upstream source sets. Six composition, context, and Solid runtime
helpers have no direct upstream component counterpart. Solidaria Components now
has no unmarked files.

The implementation review completed all 122 unmarked Solid Spectrum files.
Ninety-five files map to one upstream source. Eleven files combine complete
source sets. Sixteen local helpers have no direct upstream component
counterpart. Solid Spectrum now has no unmarked files.

The report now finds 66 genuine composite files across the repository. Their
complete source sets were read against the pinned upstream tree. Each local
header now keeps every distinct full upstream Adobe block once and lists every
exact upstream path. Headerless inputs get a source-path line without an
invented Adobe block.

`scripts/attribution-local-reviews.json` records 127 local module surfaces and
29 local Solid helpers. Module surfaces organize exports. Their implementation
files own the upstream mappings. The helpers have no direct upstream API. The
guard fixes each decision to the exact content hash and rejects marker, header,
or content drift.

`scripts/attribution-composite-reviews.json` records 513 upstream paths and the
required local source text. The report compares each complete path set with the
live marker result. It also compares the local composite prefix with the exact
upstream blocks and paths. The header guard fails when a recorded set, source
marker, block, or path changes. All 66 source-set and header contracts are satisfied.

The artifact guard found three attributed state files in `solidaria` that had
no mapped build output. The public barrels already re-exported these helpers
from `solid-stately`, and no source imported the local copies. The files were
dead duplicates in the wrong layer, so this pass removed them instead of adding
an exception to the guard.

### Exact mappings without a current Adobe header

Eleven mappings have verified headerless exact sources. Four earlier mappings
were checked across longer reachable exact-path histories. Color types,
ColorEditor, and ListDropTargetDelegate are confirmed in the pinned tree. Drop
Target Keyboard Navigation and virtual focus each have one reachable exact-path
revision, which is headerless:

| Local source                                     | Exact upstream source                            | Result                                                        |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------- |
| `solid-stately/color/types.ts`                   | `react-stately/color/types.ts`                   | No Adobe header in the pinned exact source.                   |
| `solid-stately/grid/createGridState.ts`          | `react-stately/grid/useGridState.ts`             | Headerless at the port date and pinned revision.              |
| `solidaria/datepicker/createDatePickerGroup.ts`  | `react-aria/datepicker/useDatePickerGroup.ts`    | No Adobe header in any exact-path revision.                   |
| `solidaria/interactions/createFocusRing.ts`      | `react-aria/focus/useFocusRing.ts`               | No Adobe header in any exact-path revision.                   |
| `solidaria/utils/ShadowTreeWalker.ts`            | `react-aria/utils/shadowdom/ShadowTreeWalker.ts` | No Adobe header. Adobe names Microsoft Tabster as its source. |
| `solidaria/dnd/DropTargetKeyboardNavigation.ts`  | `react-aria/dnd/DropTargetKeyboardNavigation.ts` | The one reachable exact-path revision has no Adobe header.    |
| `solidaria/focus/virtualFocus.ts`                | `react-aria/focus/virtualFocus.ts`               | The one reachable exact-path revision has no Adobe header.    |
| `solidaria-components/Table.tsx`                 | `react-aria-components/Table.tsx`                | No Adobe header in any exact-path revision.                   |
| `solidaria-components/ColorEditor.tsx`           | `@adobe/react-spectrum/color/ColorEditor.tsx`    | No Adobe header in the pinned exact source.                   |
| `solidaria-components/ListDropTargetDelegate.ts` | `react-aria/dnd/ListDropTargetDelegate.ts`       | No Adobe header in the pinned exact source.                   |
| `solid-spectrum/contextualhelp/index.tsx`        | `@react-spectrum/s2/src/ContextualHelp.tsx`      | No Adobe header in the pinned exact source.                   |

`scripts/attribution-headerless-reviews.json` records these eleven decisions.
The guard fixes each local path to its exact upstream path and required source
evidence. ShadowTreeWalker keeps Microsoft's exact short MIT block and source
link. The root and package notices keep the complete Microsoft MIT notice.

`solid-stately/grid/createGridState.ts` was first committed locally on
2026-01-17. Six early revisions of the exact upstream path used the full Adobe
2020 header. The last identified header was at
[`147f775`](https://github.com/adobe/react-spectrum/commit/147f775b8831349c9e302c7bbc379abe24cf07d0).
Adobe removed the per-file header by
[`7927421`](https://github.com/adobe/react-spectrum/commit/7927421dedfb001d3459e0a94f5def9461fbc4c7).
The latest upstream change to this path before the local port was
[`9b249e0`](https://github.com/adobe/react-spectrum/commit/9b249e0479f142919ac67cda322a77eb36d585ac),
which is headerless. The pinned source is also headerless. The review therefore
records the exact source as headerless and does not copy the superseded 2020
block. Root and package notices continue to carry Apache-2.0.

The icon generator verifies all generated S2 inputs against the pinned installed
`@react-spectrum/s2@1.6.0` package. It checks the ESM and rendered CommonJS path
data for all 410 workflow components. Eleven UI wrappers cover 44 variants:
41 use shipped private modules, and two Arrow variants plus one Gripper variant
use exact vendored raw SVGs. Every component records its exact `Generator input`
lines. The report checks those lines against the same inventory.

Solid Spectrum has 423 independently generated components. Viviana UI has 423
byte-identical mirrors. Two barrels combine generated groups. The read-only
`vp run guard:generated-icons` command rejects changed, missing, or unexpected
output, and release readiness runs it before package builds.

The regression fixture proves that a matching filename is not enough. An Adobe
header without a source stays unmapped. Original Glasselated generated source
stays unmarked, and exact mirrors inherit one review result. Each marker must
resolve independently. Exact TSX and repository paths stay exact, including S2
`src` and `style` paths. Multiline provenance is detected, but an ordinary API
example is not source evidence. A scoped package marker cannot fall through to
an incidental symbol in another package. A missing upstream tree fails the
command.

Before this ticket's package repair, `vp exec npm pack --dry-run --json` showed:

- The four headless/Spectrum packages shipped only their local MIT `LICENSE`.
- `@proyecto-viviana/ui` shipped no license file.
- None of the five Adobe-derived packages shipped `LICENSE-APACHE-2.0` or
  `NOTICE`.
- Kumo already shipped `LICENSE` and `LICENSE-CLOUDFLARE`.

## Stable attribution surface

- Root `LICENSE`, `LICENSE-APACHE-2.0`, and `NOTICE` are the source files
  for the Adobe-derived package archives.
- Each Adobe-derived manifest declares `MIT AND Apache-2.0`.
- Each of the five Adobe-derived packages keeps exact copies of the three
  files and lists them in its manifest.
- Kumo keeps the root MIT license and its Cloudflare notice.
- `NOTICE` and `CREDITS.md` name all five Adobe-derived packages, including
  `@proyecto-viviana/ui`.
- `vp run guard:attribution` rejects missing, changed, or unlisted copies.
- The release-readiness workflow runs the guard.

The public wording does not say that the per-file mapping audit is complete.

## Upstream facts checked

- The pinned React Spectrum checkout's root license is Apache-2.0.
- Its `NOTICE.txt` contains notices for upstream work
  that Adobe used or changed.
- Adobe's pinned ShadowTreeWalker source identifies Microsoft Tabster commit
  `a89fc5d7` as its source. The root and package notices keep Microsoft's full
  MIT notice.
- The pinned `@spectrum-icons/ui@3.7.1`,
  `@spectrum-icons/workflow@4.3.1`, and `@react-spectrum/s2@1.6.0` manifests
  declare Apache-2.0. The generated icon sources therefore have a confirmed
  upstream license. Generated files use the confirmed policy below after their
  exact upstream source is mapped.
- The pinned `@cloudflare/kumo@2.10.0` source uses MIT, and the package already
  carries that notice.

## Header-form evidence

The current source tree has 418 files with an Adobe license block. All 418 use
a complete block from the mapped upstream source. Ten blocks follow a required
`// @ts-nocheck` first line. The formatter preserves these forms.

All 363 exact-source header contracts with a usable upstream header are
satisfied. Eleven exact mappings with no Adobe header satisfy their reviewed
source-evidence contract. The report and artifact parser recognize both complete
Apache block forms used by the pinned Adobe source.

The last complete package-build run was before the Solid Spectrum implementation
review. It proved 548 mapped source-to-output references and covered all 314
attributed source files at that checkpoint. The final gate must rebuild all
packages and refresh this evidence after the Viviana UI review.

The 66 composite reviews cover 513 pinned upstream files. Each local composite
keeps every distinct full Adobe block once and records the exact path of every
upstream input. A headerless input contributes its path but no invented block.
All 66 composite source sets and header contracts are satisfied.

The retired plan recorded this form as decided:

- Copy the exact full Adobe block from the mapped upstream file.
- Add `Ported to SolidJS for Proyecto Viviana; based on <upstream>`.

The owner confirmed this form on 2026-08-21. The confirmed policy is:

- Keep the exact full Adobe block and year from the mapped upstream file.
- Add the recorded Solid port line with the exact upstream path or URL.
- For a reviewed composite, keep each distinct full block once and add every
  exact upstream path.
- Keep a required `// @ts-nocheck` directive before the block.
- Send files without an exact mapping to manual review. Do not invent a
  fallback year.
- Do not add a blanket Adobe or MIT header to original Proyecto Viviana source.

The flags mapping identified the last short Adobe block. Header synchronization
replaced it with the exact full block from the pinned upstream file.

## Verification

Passed on 2026-08-21:

- `vp run guard:attribution`
- `vp run report:attribution-mappings`
- `vp run test:ci-guard-contracts`, including the changed-NOTICE,
  shared-marker-parser, exact-repository-path, upstream-declaration-path,
  ordinary-documentation, reviewed-headerless, reviewed-composite,
  composite-source-set-drift, reviewed-local, and local-content-drift cases
- `vp run guard:attribution-headers`
- `vp run guard:generated-icons`; it verified all 846 owned output files
- `vp run sync:attribution-headers`; a second run wrote zero files
- `vp run build:stately`
- `vp run build:solidaria`
- `vp run build:components`
- `vp run build:solid-spectrum`
- `vp run build:viviana-ui`
- `vp test run` for the Solidaria switch, checkbox-group, and radio-group
  suites; 55 tests passed
- focused Playwright Icons and SearchField certification; 44 tests passed
- `vp run guard:package-artifacts`, including 548 mapped header references
  across all 314 attributed source files and declaration-only outputs in all
  five Adobe-derived packages
- `vp exec npm pack --dry-run --json` in each of the six public packages
- `vp run docs:check`
- `vp run changeset:status`
- `vp check`
- `vp run typecheck`
- `git diff --check`

The Solid Spectrum checkpoint also passed
`vp run test:ci-guard-contracts`,
`vp run report:attribution-mappings --check-headers`,
`vp run guard:attribution`, and `git diff --check`. The contract suite includes
a regression for both complete Apache block forms found in the pinned source.

The tarball check confirms the five Adobe-derived packages contain `LICENSE`,
`LICENSE-APACHE-2.0`, and `NOTICE`. Kumo contains `LICENSE` and
`LICENSE-CLOUDFLARE`.

## Remaining work

1. Review the 150 unmarked files in Viviana UI. The other four
   Adobe-derived packages are complete.
2. Separate derivative source from original Proyecto Viviana source. Extend the
   guard only when the source classification is deterministic.
3. Rebuild all packages and rerun the repository gates after the source review.
4. Do not freeze today's incomplete counts as an accepted baseline.

Do not add an Adobe notice to original Proyecto Viviana source. That action
would misattribute the source.

## Confirmed owner decisions

- The exact Adobe block and
  `Ported to SolidJS for Proyecto Viviana; based on <upstream>` line are policy.
- A file without an exact upstream mapping requires manual review.
- Original source does not receive a blanket license header.

The icon license, header form, and generator inputs are no longer open
questions.

## Done when

Each derivative source file has a reviewed mapping and the required notice.
Generated derivative files keep that notice. An executable check prevents
regression. This ticket stays the one active task until that work is complete.

## Relationship

Depends on verified ticket #12. Supplies the one task for initiative #35. The
duplicate-plan retirement needed by tickets #13 and #16 is complete.
