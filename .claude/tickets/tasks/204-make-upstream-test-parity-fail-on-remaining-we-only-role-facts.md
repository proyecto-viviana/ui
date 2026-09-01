---
id: 204
type: task
title: "Make upstream-test-parity fail on remaining WE-ONLY role facts"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`scripts/check-upstream-test-parity.ts:18-24` says a role our tests assert
that upstream never asserts is almost always a wrong-shape bug. The blocking
path then loads `upstream-test-parity-baseline.json` and fails only on _new_
facts (`:596-617`). The frozen floor still includes `menu|role|presentation`,
`table|role|presentation`, `switch|role|radio`, `switch|role|radiogroup`,
`select|role|progressbar`, `button|role|progressbar`, plus `upstreamOnly`
suites `previewtrigger`, `sidenav`, `tokenfield`, `virtualizedmenu`. PASS
means "no new vocabulary debt", not "our tests match the pin".

## Work

Triage each baselined WE-ONLY _role_ fact against the pinned test and either
fix the test/component or record the reason next to the fact; then make the
guard fail on any remaining unexplained role fact while aria/key gaps stay
the triage list.

## Done when

The baseline has no unexplained WE-ONLY role facts and the guard fails when
one appears.

## Relationship

F-UP-004. Rule #1 vocabulary drift the ratchet currently forgives.
