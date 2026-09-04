---
id: 446
type: task
title: "Re-sync cardview and HelpText into viviana-ui"
created: 2026-09-03
parent: 443
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from Certification Gates 33825688013: guard layer-boundary reports 2 new forks; wrap/compose, no re-baseline",
    }
  - { state: in-progress, at: 2026-09-04, note: "vivianastack implement; drill go" }
  - {
      state: merged,
      at: 2026-09-04,
      note: "byte-copied Walk #260 CardView packing and HelpText FieldErrorContext into viviana-ui; packing + live-error tests; ui patch changeset",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 99587d10; test agent re-ran layer-boundary PASS (NEW forks 0) and CardView+HelpText 14/14.",
    }
---

`guard layer-boundary` in Certification Gates run 33825688013 reports 2
new forks: `cardview/index.tsx`, `form/HelpText.tsx`. Direction is
wrap/compose, no re-baseline.

## Evidence

cwd `/home/emoporemilio/projects/viviana-hub/ui`, HEAD `bbed61d4` (working
tree: named paths only). Plan/drill:
`.agents/vivianastack/viviana-ui-layer-boundary-resync/`.

`vp exec tsx scripts/check-layer-boundary.ts`

- before: FAIL, NEW forks 2 (`cardview/index.tsx`, `form/HelpText.tsx`);
  still identical 530, still diverged 75.
- after CardView `cp`: FAIL, NEW forks 1 (`form/HelpText.tsx`).
- after HelpText `cp`: PASS, NEW forks 0; still identical 532; still
  diverged 75. `scripts/layer-boundary-baseline.json` unchanged.

Drift (old viviana-ui sources from `/tmp`, then restore via spectrum `cp`;
`diff -u` empty after restore):

`vp test run packages/viviana-ui/test/CardView.test.tsx packages/viviana-ui/test/HelpText.test.tsx`

- old copies: 5 failed / 9 passed. Packing: `--cardview-columns` `""`.
  HelpText live `isInvalid` + `FieldErrorContext` cases 3–5 failed.
- restored copies: 14 passed.

`vp exec tsx scripts/check-changeset-required.mjs && vp exec tsx scripts/check-changeset-status.mjs`
PASS (`@proyecto-viviana/ui` patch).

`vp run typecheck` PASS. `vp run check` FAIL only on pre-existing
formatting of #37 / #444 / #447 (not named paths; not touched). Named
paths `vp fmt --check` PASS. `git diff --check` PASS.

`vp test run --config vitest.ssr.config.ts packages/viviana-ui/test/Form.ssr.test.tsx`
PASS (2). `vp test run --config vitest.hydrate.config.ts packages/viviana-ui/test/Form.hydrate.test.tsx`
PASS (1). Full-repo `test:ssr` / `test:hydrate` targets were not run.

## Done when

`vp exec tsx scripts/check-layer-boundary.ts` PASS, `vp run check`
green, and a changeset for `@proyecto-viviana/ui` if source changed.

## Relationship

Child of #443. Related to #1 (layer-boundary remainder). A task cannot
parent a task, so this is not a child of #1.
