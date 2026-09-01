---
id: 157
type: task
title: "Type Breadcrumbs collapsed collection children without as-any"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Styled `BreadcrumbsProps<T>` types `children` as `T` render, then passes
`children={local.children as any}` into HeadlessBreadcrumbs. The collapse
path renders `{ kind: "menu" } | { kind: "item", … }` entries. The file is
not `@ts-nocheck`.

## Work

Give the collapse path a real extra type instead of `as any`.

## Done when

The typecheck gate stays green without that cast.

## Relationship

F-TS-008.
