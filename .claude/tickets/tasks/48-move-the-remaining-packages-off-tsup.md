---
id: 48
type: task
title: "Move the remaining packages off tsup"
created: 2026-08-20
parent: 27
status: merged
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task pkg-build-remaining" }
  - { state: merged, at: 2026-09-09, note: "merged 2026-09-09: done-when met, no package build depends on tsup; declaration work stays in #47" }
---

Complete the native Vite Plus build migration for every remaining public
package after #47 establishes the `solid-spectrum` declaration path.

## Done when

No remaining package build depends on `tsup`, and the repository build and
artifact checks pass for all public packages.

## Relationship

Replaces `pkg-build-remaining`. Depends on #47. Production builds already use
`vp pack`; leftover `tsup --watch` `dev` scripts were replaced with
`vp pack --watch`.

## Round-2 note (2026-09-01)

Done-when is met: no package build depends on `tsup`; `dev` scripts are `vp pack --watch`. Owner: close as merged/verified or rewrite the title. Remaining declaration work is #47.
