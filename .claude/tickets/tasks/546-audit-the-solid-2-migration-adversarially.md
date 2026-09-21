---
id: 546
type: task
title: "Audit the Solid 2 migration and the release gates adversarially"
created: 2026-09-20
parent: 136
status: merged
history:
  - {
      state: next,
      at: 2026-09-20,
      note: "opened under #136 by owner direction (#544). Targeted lenses, not a re-census of #136's open children. Read-only: lenses write only to .agents/audit-2026-09-20/",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "every finding now has an outcome, which is this ticket's Done when. .agents/audit-2026-09-20/VERIFIED.md holds the table: lenses 1, 2, 3 and 5 reproduced row by row, fixed in a named commit or ticketed at #553, #554, #555 or #568. The six rows that sat under `Not reproduced` are settled today. Two were already fixed and the receipt did not say so - the createToastRegion header by `002ea401` and the 12 dead imports by `8db7c298`, both #555 item 8, both re-checked against the tree rather than against the commit message. Two are real and already owned: the apps/web Worker stamps none of the five headers apps/comparison stamps, which #555's own scope hands to #549, and the style-macro `new Function` at style-macro.ts:527,530 in both twins, which #90 already names at :24-27 as the CSP cost - it is Adobe's runtime fallback and parity says keep it. One is rejected on a reading the lens could not take: Modal's aria-hide effect does read a non-reactive let, and cannot run before the ref is assigned, because ModalContent is instantiated only inside the Show at Modal.tsx:320 with children behind a getter at :578-585, so the ref callback at :613 fires during the same creation pass. The last is #554's informational createTrackedEffect debt. Lens 4 is not re-proved here by design: its three claim inventories are #548's and #549's input and both re-prove every row they consume. Two of lens 4b's HIGHs were spot-checked anyway and are still live - the getting-started snippet at solid-spectrum/docs/index.tsx:106 calls createSignal without importing it, and calendar.tsx:42, datefield.tsx:27 and datepicker.tsx:31 omit `type DateValue` from the importCode above an example that uses it. Both are fact-fixes inside apps/web and belong to #549. Merged, not verified: no seat other than this one has re-run the table",
    }
---

## Scope

#136 audited the Solid 1 tree. The Solid 2 port (#531) then rewrote imports
and reactivity across seven packages by codemod, and it already dropped one
import line that no local gate caught. Attack what changed since, and the
gates that should have caught it.

Lenses, one read-only worker each:

1. **Codemod damage.** Dropped or mangled imports, `solid-js/web` remnants,
   Solid 2 semantic changes applied mechanically: batching, effect timing,
   `splitProps` and `mergeProps` behavior, store and context changes,
   destructured reactive props.
2. **Gate integrity.** Every `guard:*`, CI job, and certified runner: can it
   pass while broken? Swallowed exit codes, `|| true`, piped exits, skipped
   shards, waivers, stale `dist`, checks that parse nothing and report green.
3. **Consumer install path.** Pack the seven packages and install them in a
   clean Solid 2 consumer outside the workspace: peer ranges, `exports`
   conditions, types, CSS delivery, SSR import, publish drift.
4. **Public claims against the tree.** Every count, "certified", "supported",
   and "WCAG" claim in the READMEs, site, and docs, each traced to a runnable
   proof or marked unbacked.
5. **Accessibility and security spot check.** Overlay focus containment,
   live regions, `innerHTML` and URL sinks, the docs Worker's headers.

Each lens appends findings as it goes to
`.agents/audit-2026-09-20/<lens>.md`: severity, path and line, a runnable
reproduction, and the expected behavior with its upstream source.

## Done when

Every finding is either reproduced by the conductor and ticketed under #136,
fixed in its own commit, or rejected with the reason written beside it. No
finding is accepted on a worker's word.

## Proof

The five artifact files, the verification table in the session receipt, and
the ticket ids opened from it.

## Relationship

Child of #136. Feeds #547's go or no-go and #548's claim list. Lens 2 overlaps
#194; its findings land there.
