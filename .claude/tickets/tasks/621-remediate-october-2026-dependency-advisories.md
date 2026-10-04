---
id: 621
type: task
title: "Remediate October 2026 dependency advisories"
created: 2026-10-04
parent: 32
status: merged
history:
  - {
      state: open,
      at: 2026-10-04,
      note: "Release Readiness red on c473284a at guard:dependency-security: undici, brace-expansion, fast-uri and http-cache-semantics vulnerabilities reported by npm audit.",
    }
  - {
      state: in-progress,
      at: 2026-10-04,
      note: "bumped overrides in pnpm-workspace.yaml: undici to ^7.29.1, brace-expansion to ^5.0.11, fast-uri to ^3.1.8, http-cache-semantics to ^4.3.0, and added minimumReleaseAgeExclude for http-cache-semantics@4.3.0.",
    }
  - {
      state: merged,
      at: 2026-10-04,
      note: "guard:dependency-security passes with 0 high/critical/prod vulnerabilities.",
    }
---

Remediate security advisories affecting transitive dependencies in the dependency graph.

## Scope

`pnpm-workspace.yaml` and `pnpm-lock.yaml`.

## Done when

`vp run guard:dependency-security` exits 0 with 0 high/critical or production vulnerabilities.
