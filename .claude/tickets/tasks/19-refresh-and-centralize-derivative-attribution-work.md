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
---

The duplicate `docs/license-compliance-plan.md` was removed in `ca8c6b0c`.
This ticket is now the one active task for initiative #35. Do not restore a
second plan under `docs/`.

This ticket concerns repository policy and evidence. It does not make a legal
compliance claim.

## Evidence snapshot

Baseline revision: `03edb8e3` on 2026-08-21.

`vp run guard:attribution` counts TypeScript source under each Adobe-derived
package. It excludes declaration files.

| Package                                  | TS/TSX | Adobe header | Source marker |
| ---------------------------------------- | -----: | -----------: | ------------: |
| `@proyecto-viviana/solid-stately`        |     93 |            1 |            39 |
| `@proyecto-viviana/solidaria`            |    234 |            2 |            86 |
| `@proyecto-viviana/solidaria-components` |     74 |            0 |             3 |
| `@proyecto-viviana/solid-spectrum`       |    604 |           11 |             2 |
| `@proyecto-viviana/ui`                   |    644 |           11 |             2 |

These columns are discovery aids. A source marker is a `Based on` or
`Ported from` phrase followed by an Adobe package or library name. A marker is
not proof that a full notice is correct. A missing marker is not proof that a
file is original.

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
| `exact`                     |   165 |
| `exact-no-header`           |     5 |
| `generated-exact-no-header` |   396 |
| `generated-multiple`        |     2 |
| `generated-stale-generator` |    12 |
| `generated-unresolved`      |    13 |
| `header-unmapped`           |    16 |
| `marker-unresolved`         |    65 |
| `mirror`                    |   531 |
| `multiple`                  |     9 |
| `unmarked`                  |   435 |

The report scanned 1,649 files. It found 165 exact independent mappings. It
keeps 953 independent mappings in review. The 531 byte-identical Viviana UI
files inherit their Solid Spectrum mapping and do not create duplicate review
work.

The generated-file statuses need care. An exact generated asset can map to an
upstream SVG that has no source header to copy. Those files stay in review. The
report also found 12 generated outputs whose notice is not emitted by the
current icon generator: 11 UI icons and `SearchIcon`. Do not run that generator
until its inputs and notice are corrected. Another 13 workflow icons have no
verified byte-identical upstream asset in the pinned tree.

The regression fixture proves that a matching filename is not enough, an Adobe
header without a source stays unmapped, original Glasselated generated source
stays unmarked, and exact mirrors inherit one review result. It also proves that
each marker must resolve independently, explicit TSX and repository paths stay
exact, and a scoped package marker cannot fall through to an incidental symbol
in another package. A missing upstream tree fails the command.

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
- The pinned `@spectrum-icons/ui@3.7.1`,
  `@spectrum-icons/workflow@4.3.1`, and `@react-spectrum/s2@1.6.0` manifests
  declare Apache-2.0. The generated icon sources therefore have a confirmed
  upstream license. Generated files use the confirmed policy below after their
  exact upstream source is mapped.
- The pinned `@cloudflare/kumo@2.10.0` source uses MIT, and the package already
  carries that notice.

## Header-form evidence

The current source tree has 25 files with an Adobe license block. Twenty-three
files use the full upstream block. Two files use a shorter block without the
warranty text. Ten full blocks follow a required `// @ts-nocheck` first line.
The formatter preserves these current forms.

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

The two current short Adobe blocks must be reconciled with their exact upstream
files during the mapping pass.

## Verification

Passed on 2026-08-21:

- `vp run guard:attribution`
- `vp run report:attribution-mappings`
- `vp run test:ci-guard-contracts`, including the changed-NOTICE and attribution
  mapping negative cases
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

1. Verify that the formatter and package build preserve the confirmed form.
2. Review the exact, ambiguous, and unmapped inventory groups.
3. Update the icon generator after the generated-file mappings are confirmed.
4. Copy only the applicable upstream notice and year from that source.
5. Review unmapped files and original Proyecto Viviana files by hand.
6. Extend the guard only where the source classification is deterministic. Do
   not freeze today's incomplete header counts as an accepted baseline.

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
