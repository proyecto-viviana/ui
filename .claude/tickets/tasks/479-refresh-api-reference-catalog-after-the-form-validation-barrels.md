---
id: 479
type: task
title: "Refresh the API reference catalog after the form-validation barrels"
created: 2026-09-05
parent: 26
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "api-reference sibling left extract output uncommitted: pages.json propCount 3394→3435 plus union-member order on ComboBox, SearchField, SegmentedControl, TextField. Generated reference only.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Commit the five generated files. Do not rewrite comparison. Do not version.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "Named-path add of the five extract files. guard:api-reference --check is the gate.",
    }
---

`scripts/extract-api-reference.ts` writes the committed docs catalog.
Last night's form-validation barrels moved the public prop surface.
The extract output was left in the working tree.

## Done when

`apps/web/src/data/api-reference/pages.json` records `propCount` 3435.
`vp run guard:api-reference` matches git.

## Relationship

Child of #26. Distinct from #210 (own-page guard) and #443 (release
train). No Changeset: generated app data.
