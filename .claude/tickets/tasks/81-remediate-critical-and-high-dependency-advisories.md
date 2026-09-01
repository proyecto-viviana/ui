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
