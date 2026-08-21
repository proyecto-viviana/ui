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
---

The duplicate `docs/license-compliance-plan.md` was removed in `ca8c6b0c`.
This ticket is now the one active task for initiative #35. Do not restore a
second plan under `docs/`.

This ticket concerns repository policy and evidence. It does not make a legal
compliance claim.

## Evidence snapshot

The pre-header baseline revision is `03edb8e3` on 2026-08-21. The table below
shows the current source counts after the exact-source header pass.

`vp run guard:attribution` counts TypeScript source under each Adobe-derived
package. It excludes declaration files.

| Package                                  | TS/TSX | Adobe header | Source marker |
| ---------------------------------------- | -----: | -----------: | ------------: |
| `@proyecto-viviana/solid-stately`        |     93 |           30 |            47 |
| `@proyecto-viviana/solidaria`            |    231 |          106 |           145 |
| `@proyecto-viviana/solidaria-components` |     74 |           31 |            44 |
| `@proyecto-viviana/solid-spectrum`       |    604 |           11 |            15 |
| `@proyecto-viviana/ui`                   |    644 |           11 |            15 |

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
| `exact`                     |   186 |
| `exact-no-header`           |     5 |
| `generated-exact-no-header` |   396 |
| `generated-multiple`        |     2 |
| `generated-stale-generator` |    12 |
| `generated-unresolved`      |    13 |
| `marker-unresolved`         |    65 |
| `mirror`                    |   526 |
| `multiple`                  |     6 |
| `unmarked`                  |   435 |

The report scanned 1,646 files. It found 186 independent files with one exact
source. It also found 188 exact-source header contracts, including inherited
mirror cases. All 188 satisfy the confirmed contract. The report keeps 930
independent mappings in review. The 526 byte-identical Viviana UI files inherit
their Solid Spectrum mapping and do not create duplicate review work.

This pass mapped 23 previously header-bearing S2 and flags sources to exact
upstream files. No file remains in `header-unmapped`. Multiline marker parsing
also exposed the hidden native date input in `DateField.tsx` as a port of
`react-aria-components/src/HiddenDateInput.tsx`. DateField is now an explicit
two-source review instead of a false single-source mapping.

Four broad prose markers also named a helper or consumer next to the primary
upstream implementation. Those markers created false `multiple` results. This
pass replaced them with the verified exact source paths for Time Field State,
Multiple Selection State, List Keyboard Delegate, and Selectable List. The
report now finds six genuine composite files. Their complete source sets were
read against the pinned upstream tree; the required multi-source header form
is the remaining decision for that group.

`scripts/attribution-composite-reviews.json` records all 44 upstream paths and
the required local source text. The report compares each complete path set with
the live marker result and exposes a review status in JSON. The header guard
fails when a recorded set changes. All six records are satisfied.

The artifact guard found three attributed state files in `solidaria` that had
no mapped build output. The public barrels already re-exported these helpers
from `solid-stately`, and no source imported the local copies. The files were
dead duplicates in the wrong layer, so this pass removed them instead of adding
an exception to the guard.

### Exact mappings without a current Adobe header

The review checked every reachable revision of each exact upstream path. Four
mappings stayed headerless throughout their exact-path history:

| Local source                                    | Exact upstream source                            | Result                                                        |
| ----------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| `solidaria/datepicker/createDatePickerGroup.ts` | `react-aria/datepicker/useDatePickerGroup.ts`    | No Adobe header in any exact-path revision.                   |
| `solidaria/interactions/createFocusRing.ts`     | `react-aria/focus/useFocusRing.ts`               | No Adobe header in any exact-path revision.                   |
| `solidaria/utils/ShadowTreeWalker.ts`           | `react-aria/utils/shadowdom/ShadowTreeWalker.ts` | No Adobe header. Adobe names Microsoft Tabster as its source. |
| `solidaria-components/Table.tsx`                | `react-aria-components/Table.tsx`                | No Adobe header in any exact-path revision.                   |

`scripts/attribution-headerless-reviews.json` records these four decisions. The
guard fixes each local path to its exact upstream path and required source
evidence. ShadowTreeWalker keeps Microsoft's exact short MIT block and source
link. The root and package notices keep the complete Microsoft MIT notice.

`solid-stately/grid/createGridState.ts` remains in review. Six early revisions
of the exact `react-stately/grid/useGridState.ts` path used the full Adobe 2020
header. The last identified header was at
[`147f775`](https://github.com/adobe/react-spectrum/commit/147f775b8831349c9e302c7bbc379abe24cf07d0).
The path was headerless by
[`7927421`](https://github.com/adobe/react-spectrum/commit/7927421dedfb001d3459e0a94f5def9461fbc4c7)
and is headerless at the pinned revision. Do not add this case to the review
record until that historical/current-source conflict is resolved.

The generated-file statuses need care. An exact generated asset can map to an
upstream SVG that has no source header to copy. Those files stay in review. The
report also found 12 generated outputs whose notice is not emitted by the
current icon generator: 11 UI icons and `SearchIcon`. Do not run that generator
until its inputs and notice are corrected. Another 13 workflow icons have no
verified byte-identical upstream asset in the pinned tree.

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

The current source tree has 189 files with an Adobe license block. All 189 use
the full upstream block. Ten blocks follow a required `// @ts-nocheck` first
line. The formatter preserves these forms.

All 188 exact-source header contracts with a usable upstream header are
satisfied. Four exact mappings with no Adobe header satisfy their reviewed
source-evidence contract. Package builds carry applicable headers into emitted
JS and JSX. The two styled packages also copy exact headers to declaration-only
outputs that have no runtime bundle. `guard:package-artifacts` reads runtime
and declaration source maps. It proves 334 mapped source-to-output references
and covers all 189 attributed source files in the five Adobe-derived packages.

The six composite reviews cover 44 pinned upstream files. Nine sources carry
a full Adobe header; the Color Channel source and all 34 color locale JSON files
have no per-file Adobe header. The source-set evidence is settled. The correct
local header form for mixed and differently dated sources is not.

The retired plan recorded this form as decided:

- Copy the exact full Adobe block from the mapped upstream file.
- Add `Ported to SolidJS for Proyecto Viviana; based on <upstream>`.

The owner confirmed this form on 2026-08-21. The confirmed policy is:

- Keep the exact full Adobe block and year from the mapped upstream file.
- Add the recorded Solid port line with the exact upstream path or URL.
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
  shared-marker-parser, exact-repository-path, ordinary-documentation,
  reviewed-headerless, reviewed-composite, and composite-source-set-drift cases
- `vp run guard:attribution-headers`
- `vp run sync:attribution-headers`; a second run wrote zero files
- `vp run build:stately`
- `vp run build:solidaria`
- `vp run build:components`
- `vp test run` for the Solidaria switch, checkbox-group, and radio-group
  suites; 55 tests passed
- `vp run guard:package-artifacts`, including 334 mapped header references
  across all 189 attributed source files and declaration-only styled-package
  outputs
- `vp exec npm pack --dry-run --json` in each of the six public packages
- `vp run docs:check`
- `vp run changeset:status`
- `vp check`
- `vp run typecheck`
- `git diff --check`

The tarball check confirms the five Adobe-derived packages contain `LICENSE`,
`LICENSE-APACHE-2.0`, and `NOTICE`. Kumo contains `LICENSE` and
`LICENSE-CLOUDFLARE`.

## Remaining work

1. Resolve the Grid State historical/current-source header conflict before
   recording that mapping as reviewed.
2. Decide and enforce the header form for the six verified composite mappings:
   Date Field State, Color Field State, Disclosure State, Color international
   messages, DateField, and component utilities.
3. Review the 65 unresolved markers and 435 unmarked files. Separate derivative
   source from original Proyecto Viviana source.
4. Review the generated groups and map each asset to an exact upstream input
   where possible.
5. Update the icon generator after the generated-file mappings are confirmed.
6. Extend the guard only where the source classification is deterministic. Do
   not freeze today's incomplete counts as an accepted baseline.

Do not add an Adobe notice to original Proyecto Viviana source. That action
would misattribute the source.

## Confirmed owner decisions

- The exact Adobe block and
  `Ported to SolidJS for Proyecto Viviana; based on <upstream>` line are policy.
- A file without an exact upstream mapping requires manual review.
- Original source does not receive a blanket license header.

The icon license and header form are no longer open questions. Change the
generator only after its exact upstream inputs are mapped.

## Done when

Each derivative source file has a reviewed mapping and the required notice.
Generated derivative files keep that notice. An executable check prevents
regression. This ticket stays the one active task until that work is complete.

## Relationship

Depends on verified ticket #12. Supplies the one task for initiative #35. The
duplicate-plan retirement needed by tickets #13 and #16 is complete.
