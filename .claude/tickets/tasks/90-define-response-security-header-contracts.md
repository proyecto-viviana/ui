---
id: 90
type: task
title: "Define response-security header contracts"
created: 2026-08-20
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-020" }
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
