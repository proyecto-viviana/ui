---
id: 474
type: task
title: "Restore the Adobe header last line on createFormReset"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "createFormReset's Apache block had a baked-in line number on the last comment line (`    10| * governing…`). guard:attribution-headers compared that block to upstream useFormReset and mismatched.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Drop the stray line-number prefix so the header matches upstream useFormReset.ts.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "Header last line matches createFormValidation / upstream useFormReset. No behavior change.",
    }
---

`packages/solidaria/src/form/createFormReset.ts` is an exact mapping of
`packages/react-aria/src/utils/useFormReset.ts`. The last line of the
Adobe block was copied with a line number still in the text, so the
port prefix no longer started with the upstream header.

## Done when

The Adobe block matches upstream `useFormReset.ts`.
`vp run guard:attribution-headers` stays green on a clean tree.

## Relationship

Child of #443. Distinct from #473 (local-review hashes) and #463 (the
form-reset behavior). No Changeset: comment-only.
