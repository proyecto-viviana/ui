---
id: 445
type: task
title: "Restore the ListView row selection checkbox name"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from 87da0f75: two ListView tests fail getByRole checkbox name Select; fix the owning layer, not the test",
    }
---

The two failing tests in `packages/solid-spectrum/test/ListView.test.tsx`
(`getByRole("checkbox", { name: "Select" })` at lines 62 and 142) were
reproduced at `87da0f75`. Upstream S2 ListView is the authority for the
name. Fix in the owning layer, not the test.

#307 already changed labelledby so the accessible name is
`Select {item}`. Do not treat that merged ticket as this failure; the
package tests still look for `Select`. Match upstream, then hold it.

## Evidence

`87da0f75`. `packages/solid-spectrum/test/ListView.test.tsx` lines 62 and
142. Both `getByRole("checkbox", { name: "Select" })` fail.

## Done when

Both tests pass for the upstream-matching reason, `vp run test:run` is
green, and a changeset is present if package source changed.

## Relationship

Child of #24. Related to the #260 family. Distinct from merged #307.
Release train #443 lists this as ordered work.
