---
id: 90
type: task
title: "Define response-security header contracts"
created: 2026-08-20
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-020" }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "Comparison worker and docs wrangler main ./src/server.ts stamp CSP, nosniff, Referrer-Policy, and Permissions-Policy. Fonts stay on Typekit and Google Fonts. Comparison hashes inline scripts per HTML response, allows style attributes, and does not allow script unsafe-inline, unsafe-eval, or COEP. Docs nonces framework scripts and hashes the theme boot script without a style nonce. The S2 style macro stays expanded at build time, so neither policy allows unsafe-eval. Local stamp tests passed; deployed responses are still unverified.",
    }
---

The public web app and comparison Worker do not define explicit response
security headers. Their runtime needs are different. A single generic policy
can break theme bootstrap scripts, fonts, or comparison fixture frames.

## Scope

- Locate the actual response boundary for each deployed application.
- Define separate CSP, `X-Content-Type-Options`, `Referrer-Policy`, and
  `Permissions-Policy` contracts.
- Move, hash, or nonce inline code when the selected CSP requires it.
- Decide whether to host fonts locally.
- Preserve only the frame relationships required by the comparison harness.
- Test local responses and verify deployed responses.
- Account for the S2 style macro's `new Function("props", js)` runtime compiler.
  A CSP without `'unsafe-eval'` will forbid the browser fallback if a style
  call is not macro-expanded. Workerd SSR already forbids that path unless
  `s2Macros()` expands `with { type: "macro" }` at build time.

Do not add headers to an unused server entry and claim coverage.

## Done when

Both deployed applications return tested headers from their real response
boundaries without breaking required browser behavior.

## Typekit repair admission — 2026-10-09

Current Site Gate at `3298de6` blocks the Typekit origin used by the shipped
font faces. Admit only `apps/web/src/security-headers.ts` and
`apps/web/tests/app/security-headers.test.ts` to add `https://use.typekit.net`
to the existing `font-src` directive and its exact regression expectation.
This ticket and generator-only current status/roadmap updates are included.
No other directive, font source, route assertion or error collector changes.

The conductor verified the original owner reply of 2026-10-08 authorizing
temporary direct Codex Sol 6.1 medium workers after both supported launch
modes failed (`msg_01a11de3-40f9-7aa1-8af3-b266ba2dadab`). The original
2026-10-09 cross-lane instruction explicitly includes advancing UI to a full
release (`msg_01a11f8d-74f3-7871-9b4e-7fdcbf6361ec`). This overrides only the
OS/herdr launch requirement for bounded UI repair and qualification. The owner
specified no expiry; this conductor assignment ends with the current RC work.
Root remains the sole tracked writer and committer; direct workers prepare
and independently review private artifacts. Existing proof and release gates
remain required. Verification: `/tmp/ui-direct-fallback-owner-verification-20261009.json`.

Source preparation and static review do not prove the repair. Keep the final
test fixed while restoring the original header for a causal red, then restore
the candidate and run the same focused web Vitest command to normal success.
The production route sweep must separately prove the original font CSP errors
are gone; landing hydration remains its own failure. Runtime checks await the
shared-slot return. Deployed responses and this ticket's full closure remain
unverified.

## Typekit owning proof — 2026-10-09

The conductor ran the unchanged five-test security-header suite against OLD
header source with the updated regression, then against the candidate header:

`node_modules/.bin/vp test run --config apps/web/vitest.config.ts tests/app/security-headers.test.ts --maxWorkers=1`

OLD exits 1: four pass and the exact `font-src` expectation fails because
`https://use.typekit.net` is absent. Candidate exits 0 with five passing tests.
Both runs use installed tools and Node 24.21.0 from the UI checkout, one worker,
under the fresh five-minute shared-runtime grant. No timeout or residual owned
process group remains; candidate source was restored and matched its prepared
digest. Raw logs are in `/tmp/ui-90-csp-owning-proof-20261009/`; actual runtime
return and source/test hashes are in
`/tmp/ui-90-csp-runtime-return-20261009.json`.

This proves the bounded header contract and retained nonce, streaming-body,
request-store and worker-wrapper regressions. Browser font delivery, landing
hydration, complete Site Gate and deployment acceptance remain outstanding;
this source proof does not close the full ticket or qualify a release.
