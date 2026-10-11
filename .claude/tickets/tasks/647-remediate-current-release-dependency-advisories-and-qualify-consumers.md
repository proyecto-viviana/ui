---
id: 647
type: task
title: "Remediate current release dependency advisories and qualify consumers"
created: 2026-10-09
parent: 32
status: verified
history:
  - {
      state: open,
      at: 2026-10-09,
      note: "3298 Release Readiness stopped at dependency-security with new tinypool, shell-quote, source-map-js, sharp and production smol-toml advisories; preserve #621's earlier accepted history",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "bounded existing-dependency update and five-consumer compatibility plan prepared; installation, lockfile changes, security audit and consumer probes remain unexecuted",
    }
  - {
      state: verified,
      at: 2026-10-11,
      note: "Root accepted original full qualification, fresh zero-debt certification, exact-E hosted gates and actual RC1 registry consumer evidence; bounded closure is recorded in the final continuation.",
    }
---

## Cause

The latest recorded Release Readiness on 3298 passes the source check, then
fails `guard:dependency-security`. #621's October-4 green belongs to its earlier
dependency graph and does not clear these current advisories.

## Scope

Update only existing dependencies to the retained approved target versions:
`tinypool` 2.1.2, `shell-quote` 1.11.0, `source-map-js` 1.2.2,
`sharp` 0.35.5 and `smol-toml` 1.9.0. No new dependency, speculative fallback
version, native-loader bypass or guard relaxation is admitted.

Tracked write paths: `pnpm-workspace.yaml`, the resulting `pnpm-lock.yaml`,
this ticket, and generated `.claude/current/status.md` / `roadmap.md`.
Preserve other overrides, allowed native build hooks, existing patch selectors
and the minimum-release-age policy. Do not silently add quarantine exceptions.
Package source and public APIs remain outside this bounded task.

## Work

1. Preserve the current actual CI security failure. During a fresh exclusively
   assigned runtime/install slot, apply the smallest exact overrides and run
   `vp install` with a finite deadline. Read the actual resulting lock and
   canonical consumer graph; the prepared old installed hashes are not candidate
   evidence. Admit required network and native-hook execution in that slot.
2. Run actual `vp run guard:dependency-security` and dependency ceilings.
   A nonzero audit exit remains failure even if printed vulnerability counts
   look clear. Run the scoped workspace formatting check without unrelated
   rewrites.
3. Bind the post-install consumer/tool/config/native identities, then run the
   prepared five meaningful compatibility probes once: oxfmt's child-process
   Tinypool Markdown formatting/destruction; launch-editor's quoted argument
   parsing; PostCSS composed source-map original positions; Astro TOML
   frontmatter and real file loader; Astro Sharp PNG/WebP transform and decode.
   Preserve expected values, rejection controls and actual owned closure.
4. Stop on unexpected failure and diagnose; do not manufacture green with
   retries, editor/font exceptions, unsupported environment overrides or copied
   dependencies. Record exact commands, versions, exits and limitations,
   regenerate views and pass applicable documentation checks.

## Done when

The actual candidate security guard exits 0 with no high/critical or production
vulnerabilities, dependency ceilings and formatting pass, and all five retained
consumer probes pass against the installed approved versions with owned
processes closed. Record the resulting workspace/lock identities.

## Actual local qualification — 2026-10-09

The approved overrides installed with `vp install -- --yes`, preserving the
existing native-build, quarantine and trust policy. The delimiter forwards
pnpm's supported confirmation flag through vp; no CI, force or frozen-lockfile
setting changed. Earlier sandbox-store, non-TTY and vp-argument failures closed
before this successful successor; they are retained as failures.

All ten serial stages exited 0: installation, dependency security, ceilings,
scoped formatting, installed-consumer binding, and the five formatter-pool,
editor-parse, PostCSS-map, Astro-TOML and Astro-Sharp probes. The full audit
retains one moderate advisory, with no high/critical findings; the production
audit reports no known vulnerabilities. All 17 unmet peers are already covered
by the existing allowlist. This proves the bounded consumer checks, while full
build, app and release qualification remain required.

Installed versions are tinypool 2.1.2, shell-quote 1.11.0, source-map-js 1.2.2,
sharp 0.35.5 and smol-toml 1.9.0. Workspace SHA-256 is
`3d61425b5e0921e5c7452ce76bf7e4103a46406a5c82eb7f9962c926124d9746`;
generated lock SHA-256 is
`ce3a44428d844d8df9c3598bef92e2a2e00c371d0339656ec0a8809bb41c35bb`.
Actual return `/tmp/ui-dependency-compatibility-runtime-qualified-forwarded-yes-20261009/return.json`
has SHA-256 `ec200756e60e228a7c122d0f8a6a39b5631537ff7541223dd5451ea821bc4a63`.
It records conserved source inputs and empty owned processes at closure.
Generated views and final documentation checks follow the combined candidate.

## Relationship and limits

Successor to the current advisory frontier, not a reopening of #621. Required
for #547's next RC and the final exact-SHA Readiness/Site gates. These probes
cover concrete installed APIs, not every platform, codec, malformed input,
Astro configuration or app build. Full release qualification remains required.

Private preparation:
`/tmp/ui-dependency-compatibility-proposal-v2-2026-10-09/PLAN.md` and
`CLOSURE-HANDOFF.md`. Read that closure handoff before execution; its old
inputs and unissued binding template never substitute for candidate evidence.
Original owner continuation/publication instructions were verified in
`/tmp/ui-direct-fallback-owner-verification-20261009.json`.

The approved source preparation at
`/tmp/ui-dependency-approved-overrides-proposal-20261009/` is applied. Its five-target
workspace patch and the lockfile produced by the admitted install match the
actual qualified return recorded above. All ten bounded stages passed; full
build, app and release qualification remain pending.

## Actual published-E qualification continuation — 2026-10-11

The accepted historical ten-stage dependency continuation includes the five formatter-pool, editor-parse, PostCSS-map, Astro-TOML and Astro-Sharp compatibility probes. Preserve their original workspace/lock identity linkage and audit allowances. Current Q26 supplies security, dependency ceilings, peers and builds; Q23/Q24 supply fresh local tarball/consumer qualification. Native12 does not replay those five probes. The actual exact-E hosted and cryptographically verified published-registry continuation below supplies those additional release requirements.

Accepted source qualification remains C′ `d8b57f49d2ee93453f4ac4120e1543a4245a55c1`; E `a2ccaf10885edadfd41ffc2d10c2e65fdad2ca58` records its original eight-shard result (2297 passed, zero failed/skipped/waived/flaky), followed by accepted exact-E strict parity. The same E now has all three required hosted workflows green and automatic Release run `38146924038` successful, independently accepted in `output/qualification-evidence/ui-exact-e-hosted-release-proof-20261011/ROOT-ACTUAL-PUBLICATION-AND-THREE-GATES-REVIEW-20261011.json`. Actual registry capture, crypto consumer and separate installed-native proof are accepted under `output/qualification-evidence/ui-registry-and-native-final-stage-rc1-e-a2ccaf10-proof-20261011/ROOT-CLOSED-STAGE-01-REVIEW.json`, `ROOT-CLOSED-STAGE-02-REVIEW.json` and `ROOT-CLOSED-STAGE-04-REVIEW.json`; the consumer verified 96 signatures and 55 attestations, and registry native passed all 12 original cases. Independently accepted LOCAL12 remains bound to C′ at `output/qualification-evidence/ui-registry-and-native-final-stage-local-rangeslider-viewport-20261011/ROOT-CLOSED-STAGE-02-REVIEW.json`. Physical refs/hashes are cataloged in `.agents/UI-EXECUTION-547-rc1-published-2026-10-11.json`; these later proofs do not recreate missing historical controls or claim complete API parity.

Root accepts this bounded ticket closure against its original Done when. Earlier historical limits and separate exclusions remain.
