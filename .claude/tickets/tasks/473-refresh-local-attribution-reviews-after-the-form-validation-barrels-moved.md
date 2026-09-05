---
id: 473
type: task
title: "Refresh local attribution reviews after the form-validation barrels moved"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "guard:attribution-headers failed Certification Gates. Six reviewed-local files changed content without a matching contentSha256. createFormReset was listed once; its Adobe block already matches upstream useFormReset.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Re-read the six unmarked barrels/helpers: still local-module-surface or local-solid-helper. Stamp the current SHA-256 in attribution-local-reviews.json.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "guard:attribution-headers PASS. 471 exact headers, 254 local reviews. Six hashes only.",
    }
---

`guard:attribution-headers` records a content hash for unmarked local
files so a later rewrite cannot silently drop the review. Last night's
form-validation / Radio cluster and the typecheck barrels moved six of
those files without updating the inventory.

The six are still local: package index barrels, ComboBox's re-export
surface, and the overlay `contexts.ts` helper. This ticket does not
change product behavior.

## Done when

`vp run guard:attribution-headers` is green. The six hashes match the
files on disk.

## Relationship

Child of #443. Distinct from #35 / #19 (the original header pass) and
from #471 (Popover/Link/ActionMenu types). Do not treat an Adobe header
rewrite as this ticket.
