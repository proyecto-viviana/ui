---
id: 633
type: task
title: "Ship component styles without font faces"
created: 2026-10-08
parent: 32
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner requested reproduction, tested repair, and release reporting for Visualmode's October requests.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queued with the top Visualmode consumer work before the next RC, following active source work and qualification blockers.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Registered bounded implementation; fresh package qualification in progress.",
    }
---

## Scope

UI owns Visualmode G17: an additive CSS entry in both styled Adobe-family
packages, importing theme.css then styles.css without font-faces.css. Confirm
source, build/copy, exports, packed artifacts, and installed upstream S2.
Owner-approved public name (2026-10-08): components-no-fonts.css in both packages,
containing theme.css and styles.css only. Existing separate theme.css and styles.css
exports are the supported interim composition. Name exact source, export,
build/test, documentation, and styled-twin paths before dispatch. Preserve
existing components.css; no dependencies, font changes, or consumer edits.

## Done when

The approved entry resolves from both packed packages and includes their
theme and component styles with no transitive font-faces import. A fresh
browser page using only that entry attempts no requests to fonts.googleapis.com
or use.typekit.net. Existing full CSS entry remains usable.

## Proof

Test actual copied/generated CSS, packed export resolution, and recursive
local imports. Prove the current components.css external-font dependency and
observe a fresh packed-consumer browser from before navigation through
document.fonts.ready and interactions. Fail on attempted external font requests,
even if blocked. Confirm visible component styling and theme tokens. Run package
artifact/sourcemap, layer-boundary, and out-of-workspace consumer checks as
part of qualification. Report published versions and the exact consumer import.

## Relationship

Child of #32; prioritized by #87 after consumer correctness defects and before
next-RC publication. Producer for Visualmode #10187 and owner ruling 281.
Source request in the hub:
visualmode/visualmode/.agents/ui-requests-2026-10-07/G17-components-sheet-without-font-faces.md.
Visualmode supplies Geist Mono and currently imports components.css in
src/styles/design-system.css. Patch Changesets cover both styled packages;
rollback preserves the existing components.css contract.

## Registered implementation — 2026-10-08

Conductor admitted base `368f45f050610e4a74b9b4023ac863b63bb57f3d`, generation
`4b56314b-0e45-4c06-8dcb-2bf00d729b15`, sole source implementer and exclusive
fresh seven-package build/pack/browser proof. Accepted #627/#630/#54/#159/#19
precede this work. Actual Grok/AGY quota receipts authorize Codex fallback.

Exact writes: `src/components-no-fonts.css`, `package.json`, and `vite.config.ts`
in each of `packages/solid-spectrum` and `packages/viviana-ui`;
`scripts/consume-pack-smoke.mjs`, `scripts/layer-boundary-baseline.json`,
`.changeset/components-without-font-faces.md`, this ticket, and generated
`.claude/current/status.md` and `.claude/current/roadmap.md`. All other tracked
paths are read-only. README proposal belongs in task-owned `/tmp` evidence for
the registered public-face writer. No commit, push, publish, version or dependency
change; local artifact proof is distinct from final candidate/registry proof.

## Prior generation result — superseded prerequisite blocker

The two identical entries, package-specific exports/copy wiring, dual patch note,
and one-row layer baseline change are implemented. The installed smoke extension
retains the original DOM/SSR and subpath contracts, adds Spectrum, recursive CSS
validation, scratch-only detector negatives, and six isolated browser cases.
That extension is not runtime-qualified yet.

Actual fresh `vp run pack:local-chain` completed five packages, then failed
Spectrum declaration emission on four TS18046 errors in
`src/s2-internal/page.macro.ts` (lines 20 and 24). UI and packing were not reached.
The build-only JSON shim gives these token parameters type `unknown`. Smallest
proposed additional source scope: both styled
`src/style/spectrum-tokens-json.d.ts` files, retaining the unknown index signature
and describing only four actual color-token shapes. That prior generation had no repair admission; the registered continuation below admits it.
A separate `/tmp` compiler probe reproduces four errors with the original shim
and passes with the proposed shape; it does not qualify a package build.

Baseline/final root typing each reports the same fifteen script diagnostics,
zero additions. Layer (664 shared / 580 identical / 84 diverged), source-artifact,
fixture sourcemap, scoped lint and docs checks pass. Package-artifact check fails
on incomplete outputs after the interrupted chain. Installed CSS, detector,
browser, old-installed-export and tarball controls remain unexecuted; no stale
artifacts substitute. README proposal and exact logs are in task-owned `/tmp`.
Fresh seven-package build/pack and installed/browser proof remain required after
an admitted compiler repair. No release or registry qualification is claimed.

## Registered continuation — 2026-10-08

Base `368f45f050610e4a74b9b4023ac863b63bb57f3d`, generation `dbe35816-c79b-4f85-9165-6b25dace83f6`.
Prior generation is owned-stopped; preserved partial changes carry forward.
Conductor admits the original twelve paths plus both styled
`src/style/spectrum-tokens-json.d.ts` declarations (four known token keys,
unknown remaining keys), strict full-font URL/type controls and nested cleanup.
Fresh seven-package build, installed/browser proof and final guards follow.
No commit, push, publication or README edits; all new evidence is under
`/tmp/ui-633-resume-*`.

## Continuation evidence — local feature qualification passed

Both admitted four-key token declarations are repaired. The actual fresh
`vp run pack:local-chain` now builds and packs all seven packages (exit 0).
Private process-local cache/TMPDIR corrections and unsandboxed child pipes are
recorded; previous failures are preserved. Package sources and tarballs remain
unchanged by subsequent consumer-only corrections.

The private installed fixture pins its existing compiler/babel-plugin transitives
to locked rc.9 under explicit conductor admission. DOM build, SSR build/render,
2445 export targets, 606 JS subpaths, 74 rendered-class rules, installed no-font
closures and twelve scratch-copy detector negatives pass. Original installed
packages remain intact. Reconstructed Git-base export maps reject both new
subpaths; these are not historical tarballs. Existing Chromium is selected by
process-local `PLAYWRIGHT_BROWSERS_PATH`, without downloads.

Complete fresh consume proof passes all six isolated browser cases. Both no-font
and missing-CSS variants mount and interact with zero off-origin attempts.
Authored Provider theme/geometry predicates pass for no-font variants and fail
for otherwise identical missing-CSS controls. Full-entry cases observe and abort
Typekit font attempts; each request exactly matches an installed recursive CSS
reference and its kind (external imports are stylesheets, font URLs are fonts).
This reference-kind correction is explicitly conductor-authorized. Only the
exact existing Solidaria touch-action helper is accepted as behavior-only inline
CSS, checking owner, text and actual CSS rules in light/dark observations.
Browser contexts and server close through independently nested cleanup.

Root baseline/final typing retains the same fifteen script diagnostics, with zero
new diagnostics. Package-artifact, sourcemap, source-artifact and layer guards
pass; the layer remains 664 shared / 580 identical / 84 diverged. Failed receipts
remain preserved separately from successful fresh proof. One earlier browser
launch failure's per-case outputs were recreated before a preservation request
arrived; its logs, lock, SSR and CSS evidence are retained and that gap is explicit.
Final proof and canonical manifests are under `/tmp/ui-633-resume-*`.

This is local feature/artifact work only; no final release, registry, integration,
commit or publication claim. Ticket remains in progress for independent review.
