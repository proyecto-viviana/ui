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
  upstream license. The exact generated-file header still needs the owner's
  decision.
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

The retired plan is not a live decision record. The current source is
inconsistent, and no current ADR or policy confirms that exact change note.
The owner must confirm the form before a generator or bulk edit applies it.

## Verification

Passed on 2026-08-21:

- `vp run guard:attribution`
- `vp run test:ci-guard-contracts`, including the changed-NOTICE negative case
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

1. Confirm the exact source-header form and Solid port change note.
2. Verify that the formatter and package build preserve that form.
3. Update the icon generator after the generated-file header is confirmed.
4. Map each derived source file to its exact upstream source.
5. Copy only the applicable upstream notice and year from that source.
6. Review unmapped files and original Proyecto Viviana files by hand.
7. Extend the guard only where the source classification is deterministic. Do
   not freeze today's incomplete header counts as an accepted baseline.

Do not add an Adobe notice to original Proyecto Viviana source. That action
would misattribute the source.

## Owner decisions required

- Confirm whether the exact Adobe block and the previously recorded
  `Ported to SolidJS for Proyecto Viviana; based on <upstream>` line are policy.
- Confirm the treatment for an upstream file that has no exact mapping.
- Decide whether original source needs a short Proyecto Viviana MIT header.

The icon license source is no longer an open question. Do not change the
generator until the header form is confirmed.

## Done when

Each derivative source file has a reviewed mapping and the required notice.
Generated derivative files keep that notice. An executable check prevents
regression. This ticket stays the one active task until that work is complete.

## Relationship

Depends on verified ticket #12. Supplies the one task for initiative #35. The
duplicate-plan retirement needed by tickets #13 and #16 is complete.
