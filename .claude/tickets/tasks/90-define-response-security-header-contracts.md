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
