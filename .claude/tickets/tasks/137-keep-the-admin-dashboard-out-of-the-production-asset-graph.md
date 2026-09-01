---
id: 137
type: task
title: "Keep the admin dashboard out of the production asset graph"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`/admin` redirects in production, and the filesystem API is `apply: "serve"`
only. The lazy `AdminPage` chunk still compiles into the production client and
server graphs and contains the write-client protocol.

## Work

Omit the admin route and its chunks from production Vite and Worker builds.
Add a production e2e that `GET /api/admin/docs` is not a JSON filesystem API.

## Done when

Production dist has no admin write-client chunk, `/admin` still redirects, and
a packed preview proves `/api/admin/*` is absent.

## Relationship

New evidence from the 2026-09 audit (F-SEC-002). Dev-only intent is #28.
