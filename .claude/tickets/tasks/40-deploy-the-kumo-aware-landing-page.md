---
id: 40
type: task
title: "Qualify and deploy the Kumo-aware Viviana UI landing page"
created: 2026-08-20
parent: 29
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task kumo-site-release" }
---

Qualify and deploy the landing page after the Kumo story passes its required checks.

Deployment is a separate external write. It requires owner approval after the
exact revision is qualified.

## Done when

- `vp run guard:deploy-target` proves the Worker and custom domain are safe.
- Site and release-readiness gates pass on the selected revision.
- `vp run deploy` completes after explicit owner approval.
- The live root returns 200, hydrates without console errors, uses the expected
  canonical URL and social metadata, presents all three libraries, activates
  the Kumo Button, and labels Kumo as experimental.
- The ticket records the deployed revision.

## Relationship

Depends on #39. Replaces the legacy site-release task specification.
