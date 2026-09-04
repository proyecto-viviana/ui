---
id: 445
type: task
title: "Restore the ListView row selection checkbox name"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from 87da0f75: two ListView tests fail getByRole checkbox name Select; source already matches RAC labelledby; tests were stale exact Select",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; retarget ListView.test.tsx checkbox queries to the composed AccName",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "assert Select Project brief at :62/:142; nameless queryByRole checkbox at :102; ListView.test.tsx 11/11",
    }
---

The two failing tests in `packages/solid-spectrum/test/ListView.test.tsx`
(`getByRole("checkbox", { name: "Select" })` at lines 62 and 142) were
reproduced at `87da0f75` and again at `2c08b406`. Source already matches
RAC labelledby; the tests were stale exact `"Select"`. They now assert
the composed name `"Select Project brief"`. Highlight-mode absence at
`:102` uses nameless `queryByRole("checkbox")`.

#307 already changed labelledby so the accessible name is
`Select {item}`. Do not treat that merged ticket as this failure; the
package tests still looked for `Select`. Match upstream, then hold it.

## Evidence

Artifacts: `.agents/vivianastack/listview-row-checkbox-name/` (`plan.md`,
`drill.md` verdict `go`). Cwd
`/home/emoporemilio/projects/viviana-hub/ui`. Revision `2c08b406`.

`d0bd4f8f` added `aria-labelledby` = checkbox id + row id on
`createGridListSelectionCheckbox`, matching RAC
`useGridListSelectionCheckbox`. AccName 1.2: labelledby (2C) wins over
`aria-label` (2D). The checkbox id is already in that traversal, so 2D
yields `"Select"`; the row is also referenced, so it contributes only
its `aria-label` `"Project brief"` (description stays on the row's own
labelledby). Concatenation: `"Select Project brief"`. The tests still
queried exact `"Select"` from `12879b42`. Source is right; the test was
stale.

Before: `vp test run packages/solid-spectrum/test/ListView.test.tsx` →
2 failed | 9 passed (11). Both dumps: checkbox Name `"Select Project
brief"`; unable to find name `"Select"` at `:62` and `:142`.

After the three query retargets (and oxfmt wrap): same command → 11
passed (11).

`vp run test:run` → Test Files 10 failed | 280 passed (290); Tests 19
failed | 5960 passed | 1 expected fail | 6 skipped (5986). None of the
19 are ListView / CardView / Tree / Table / GridList checkbox name;
pre-existing at this HEAD (ColorField hex case, ContextualHelp, snapshots,
NumberField `aria-required`, Switch Space).

`vp run check` failed on format in `#37`, `#444`, `#447` (not named
paths; already on HEAD). Named `ListView.test.tsx` was not in that list
after `vp fmt`. `vp run typecheck` exit 0. `git diff --check` exit 0.
No changeset (test-only; `check-changeset-required.mjs` exit 0 per drill).

## Done when

Both tests pass for the upstream-matching reason, `vp run test:run` is
green, and a changeset is present if package source changed.

## Relationship

Child of #24. Related to the #260 family. Distinct from merged #307.
Release train #443 lists this as ordered work. Follow-up, not this
ticket: `packages/solid-spectrum/src/gridlist/index.tsx:1362`
hardcodes English `aria-label` `"Select"` on top of solidaria intl;
upstream S2 `ListView.tsx:847-852` renders `<Checkbox slot="selection" />`
with no `aria-label`.
