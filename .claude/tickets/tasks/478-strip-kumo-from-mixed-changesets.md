---
id: 478
type: task
title: "Strip Kumo from mixed changesets"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "After #477 ignore, four unpublished files still name Kumo next to a releasable package. Changesets v3 rejects that set. ci:changesets fails. Leave experimental-kumo-button.md Kumo-only.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Drop @proyecto-viviana/kumo from children-one-read, reactive-one-read-children, ship-attribution-files, vite-plus-pack-config.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "ci:changesets PASS. guard:release-prerequisites PASS, SKIP Kumo 0.0.0. Bump list has no Kumo. experimental-kumo-button.md left Kumo-only.",
    }
---

#477 ignores workspace Kumo. Four pending changesets still name it
beside Adobe-stack packages:

- `children-one-read.md`
- `reactive-one-read-children.md`
- `ship-attribution-files.md`
- `vite-plus-pack-config.md`

`experimental-kumo-button.md` is Kumo-only and stays.

## Done when

Those four files do not name Kumo. `vp run ci:changesets` and
`vp run guard:release-prerequisites` are green. Do not
`changeset:version`.

## Relationship

Child of #443. Remainder of #477. Distinct from #447.
