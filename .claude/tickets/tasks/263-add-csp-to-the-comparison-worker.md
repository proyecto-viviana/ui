---
id: 263
type: task
title: "Add a Content-Security-Policy to the comparison worker"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "#259 stamped nosniff/referrer/SAMEORIGIN/Permissions-Policy/COOP and Cache-Control; CSP needs hashes for the two inline theme-boot scripts",
    }
---

The comparison worker still has no `Content-Security-Policy`. Theme boot is
two `is:inline` scripts (documentElement + body). Overlays set `style=""`.
Typekit fonts load from `https://use.typekit.net`. S2 `style()` uses
`new Function` and must not receive `'unsafe-eval'` (#90).

## Constraints

- Hash the two theme-boot scripts; do not add `'unsafe-inline'` to `script-src`.
- `font-src 'self' https://use.typekit.net`.
- Overlay inline `style=""` needs `style-src-attr` (or a documented
  `style-src 'unsafe-inline'` if attr is not enough — prove it).
- Do not set COEP `require-corp` (Typekit would fail).
- Keep `X-Frame-Options: SAMEORIGIN` for `/experiments/kumo-button/` iframes.
- Playwright against Astro preview will not see this header. Assert it in the
  worker unit test; wrangler-dev or deploy is the live check.

## Done when

`COMPARISON_SECURITY_HEADERS` includes a CSP that the worker unit test pins,
theme boot still runs, Typekit still loads, overlays still position, and
`new Function` is not allowed.

## Relationship

Child of #26. Follow-on from #259. Do not weaken #90.
