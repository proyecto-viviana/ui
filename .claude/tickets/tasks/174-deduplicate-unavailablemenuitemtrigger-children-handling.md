---
id: 174
type: task
title: "Deduplicate UnavailableMenuItemTrigger children handling"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

solid-spectrum passes original `props.children` into
`HeadlessSubmenuTrigger`. viviana-ui always boxes children into an array.
That is a Solid children fork in a file that is otherwise themed copy.

## Work

One implementation, used by both packages.

## Done when

The two copies agree on the children value passed to the trigger.

## Relationship

F-QUALITY-003. Not #1's identity count.
