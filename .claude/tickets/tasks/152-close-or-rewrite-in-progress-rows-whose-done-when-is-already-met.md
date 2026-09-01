---
id: 152
type: task
title: "Close or rewrite in-progress rows whose done-when is already met"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: merged,
      at: 2026-09-01,
      note: "verified #28; rewrote #82 remaining-branch table and #87 resume-here; kept #56 in-progress because #57 and #58 are open",
    }
  - { state: verified, at: 2026-09-01, note: "owner 2026-09-01" }
---

## Cause

Initiative #28 is in-progress with verified children and a met done-when.
#87 still says start with #11. #82 still lists verified #108/#122/#17/#18.
#56 is in-progress while #57 and #58 are open.

## Decision

Owner 2026-09-01:

- Verify #28. #137 is new security work, not leftover #28 scope.
- Rewrite #82 and #87. Keep both in-progress.
- Keep #56 in-progress. Its done-when names open children #57 and #58.

## Done when

No in-progress ticket's resume-here list names only verified children.

## Relationship

F-DOCS-003.
