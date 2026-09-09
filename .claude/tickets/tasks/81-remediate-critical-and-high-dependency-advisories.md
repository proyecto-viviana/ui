---
id: 81
type: task
title: "Remediate critical and high dependency advisories"
created: 2026-08-20
parent: 32
status: in-progress
history:
  - {
      state: next,
      at: 2026-08-20,
      note: "migrated from legacy task dependency-advisory-remediation",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "dependency remediation is in the working tree; aggregate qualification remains",
    }
  - {
      state: in-progress,
      at: 2026-09-09,
      note: "round 3: Release Readiness on 9d78d920 red at guard:dependency-security — 1 critical / 3 high / 4 moderate; bump plan recorded, awaiting owner approval",
    }
---

Update the dependency graph to remove the current critical and high advisories.

## Starting evidence

The 2026-08-09 audit found 27 vulnerable dependency instances: one critical,
17 high, eight moderate, and one low. The critical path ran from
`solid-js@1.9.12` to `seroval@1.5.1`; the lockfile also contained patched
`seroval@1.5.4`. Root overrides pinned other transitive packages below their
reported fixed versions.

Re-run the audit before choosing versions. Adding or changing dependencies
requires explicit owner approval.

## Current evidence

- The owner approved the dependency migration on 2026-08-19.
- Solid is now 1.9.15, and the vulnerable Seroval node is absent.
- Full and production dependency audits reported zero known vulnerabilities.
- Peer checks, the frozen install, package builds, and packed consumer smoke
  passed in the current migration work.
- `guard:dependency-security` rejects high-or-worse findings in the complete
  graph and low-or-worse findings in the production graph.

## Resume here

Run the aggregate application and site qualification after the dirty build
graph stabilizes. Keep the response-security boundary separate in #90.

## Done when

The approved update removes the critical and high advisories, relevant tests,
applications, and packed-consumer checks pass, and the lockfile has no
conflicting override.

## Relationship

Replaces `dependency-advisory-remediation`. GitHub issue #22 holds the original external
scope.

## Round-2 note (2026-09-01)

Resume-here still says to wait for the dirty build graph; `git status` is clean and round 1 found no lockfile advisories. Owner: verify, or rewrite resume-here to the actual remaining gate (F-DOCS-008).

## Round-3 note (2026-09-09)

`Release Readiness` on `9d78d920` is red at `guard:dependency-security`:
https://github.com/proyecto-viviana/ui/actions/runs/34400938525. Reproduced
locally on a clean tree — the local audit matches CI exactly, so there is no
registry lag. `vp exec pnpm peers check` is clean; both audit halves fail.

Full graph: 8 findings (1 critical, 3 high, 4 moderate). Production graph:
6 findings (1 critical, 3 high, 2 moderate) — the two vitest findings are the
only dev-only ones.

```
sev       package         installed        vulnerable      patched    path                                                graph
critical  astro           7.2.3            <7.2.8          >=7.2.8    apps__comparison>astro                              prod
          GHSA-26w7-cxv4-gfx2  remote code execution through AVIF image
high      sharp           0.35.3 / 0.35.2  <0.35.4         >=0.35.4   apps__comparison>astro>sharp                        prod
          GHSA-rgj7-g3m4-5g8c  libheif                     also .>wrangler>miniflare>sharp, apps__web>@cloudflare/vite-plugin>...  dev
high      js-yaml         4.3.1            >=4.0.0 <4.3.2  >=4.3.2    apps__comparison>{astro,@astrojs/react}>@astrojs/internal-helpers>js-yaml  prod
          GHSA-2883-xcg3-v3hh  maxTotalMergeKeys does not limit CPU on empty merge sources
high      svgo            4.0.2            >=4.0.0 <4.1.0  >=4.1.0    apps__comparison>astro>svgo                         prod
          GHSA-w27v-7q3p-w38r  removeScripts allows executable links
moderate  astro           7.2.3            <=7.2.3         >=7.2.4    apps__comparison>astro                              prod
          GHSA-376h-93r7-7g6f  base-stripping authorization bypass
moderate  svgo            4.0.2            >=4.0.0 <4.1.0  >=4.1.0    apps__comparison>astro>svgo                         prod
          GHSA-4vpr-x523-8j87  foreignObject sanitization
moderate  vitest          4.1.10           >=2.1.0 <4.1.11 >=4.1.11   .>vite-plus>@vitest/browser>vitest                  dev
moderate  @vitest/mocker  4.1.10           >=2.1.0 <4.1.11 >=4.1.11   .>vite-plus>@vitest/browser>@vitest/mocker          dev
          GHSA-82fw-gwwq-j7x9  path traversal via redirect mock
```

### Bump plan

Nothing here is a major. `apps/comparison` already declares `astro: "^7.2.3"`,
so `7.2.8` is inside the existing range — this is a lockfile refresh, not a
range widening, and it does not touch the #94 ceilings
(`@testing-library/jest-dom`, `jsdom`, `typescript`) or the #82/#216/#220
upstream train, which pins RAC/S2, not the Astro toolchain.

- **astro** — one refresh clears four of the eight findings. `astro@7.2.8`
  declares `svgo: ^4.0.1`, `js-yaml: ^4.3.0`, and optional `sharp: ^0.35.4`,
  so refreshing astro pulls svgo to `4.1.0`, js-yaml to `4.3.2`, and the
  comparison-side sharp to `0.35.4` with no override. Latest 7.x is `7.3.2`,
  also inside the range.
- **svgo, js-yaml (prod paths)** — no direct action. They ride the astro
  refresh. The root override `js-yaml: "^4.3.1"` already permits `4.3.2`;
  raise it to `"^4.3.2"` so the fix is a floor rather than a coincidence of
  resolution.
- **sharp (dev paths)** — the astro refresh does not reach
  `wrangler>miniflare>sharp@0.35.2` or
  `apps/web>@cloudflare/vite-plugin>wrangler>miniflare>sharp`, and the full-graph
  half of the guard rejects high findings anywhere. Needs a root
  `pnpm-workspace.yaml` override `sharp: "^0.35.4"`. `0.35.4` is published and
  is the latest 0.35 line.
- **vitest / @vitest/mocker** — dev-only moderates; neither half of the guard
  gates them today. Bump the catalog `vitest: 4.1.10` to `4.1.11` in the same
  pass so the finding does not become a gate the next time the guard tightens.

Recommended default (owner vetoes): raise `apps/comparison` to
`astro: "^7.2.8"` — the security floor, written down rather than implied —
refresh the lockfile, add the root `sharp: "^0.35.4"` override, raise the
`js-yaml` override to `"^4.3.2"`, and move the catalog vitest to `4.1.11`.
Four workspace-file lines and one lockfile. Adding or changing dependencies
still requires explicit owner approval; this note is evidence and a proposal,
not the bump.

Existing pins that would conflict: none. Root `overrides` in
`pnpm-workspace.yaml` carry `js-yaml: "^4.3.1"` (compatible, raise it) and no
`sharp`, `svgo`, or `astro` entry. Last three lockfile touches: `a741273a`
(2026-09-02, browserslist/fast-uri overrides past the then-open advisories),
`0847c615` (2026-09-02, RAC 1.21.0 / S2 1.7.0 pin), `8e509342` (2026-09-01,
round-2 findings). If any bumped version is published inside pnpm's 24-hour
quarantine window it also needs a `minimumReleaseAgeExclude` entry.

### Proof

```
vp run guard:dependency-security
vp run ci:release-readiness
vp run ui:smoke
```

`Release Readiness` will still be red after this bump: `vp run test:run` has 43
pre-existing failures unrelated to dependencies, ticketed separately — see the
`test:run` remainder ticket filed 2026-09-09 under the 2026-09 full-repo audit
(#136). The dependency guard turning green is the acceptance signal for this
ticket, not a green workflow.
