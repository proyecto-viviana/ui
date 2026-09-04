---
id: 168
type: task
title: "Keep remaining styled children reactive after hydration"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Ticket #135 fixed Button by caching `createMemo(() => local.children)`.
ActionButton, ToggleButton, LinkButton, Badge, Radio, SegmentedControl, and
TagGroup still pass authored children through Solid's `children()` helper,
which snapshots mixed text such as `count: {n()}`.

## Work

Apply the Button memo pattern to those exports in both styled packages. Add
paired hydrate regressions per public export. Do not fold this into the
Button WIP.

## Done when

Direct mixed text on each named export updates after hydration without
recreating the host.

## Relationship

F-SOLID-001 through F-SOLID-004 and F-SOLID-007. Sibling of #135, not a
restatement of Button.
