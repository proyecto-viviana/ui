---
id: 451
type: task
title: "Deep-import solid-spectrum in comparison chrome, controls, and fixtures"
created: 2026-09-04
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (a); owner-confirmed title. Parent is #136 (a task cannot parent a task).",
    }
---

Switch comparison chrome, controls, fixtures, and D12 islands off the
`@proyecto-viviana/solid-spectrum` barrel onto per-file subpaths (S2 docs
use `@react-spectrum/s2/Button`). A leftover package-root specifier on any
docs-layout graph re-eager-loads `src/index.ts` on the first lazy fixture.

Compound members reuse an existing parent key (PickerItem → `./Picker`);
do not mint new public names. Remaining barrel symbols need #455 first, or
documented harness-relative `src/` paths if that ticket has not landed.

## Done when

Button CDP shows zero package-root / `src/index.ts` and no `Calendar.*`
CSS; only the current-slug fixture. `demoHitCount` is #262. Guard fails a
package-root specifier in chrome, controls, fixtures, and D12.
`vp run comparison:test:fixture-registry-split` stays green.
`vp run comparison:build` chunk sizes unchanged or better.

## Relationship

Child of #136. Slice (a) of #255. After or with #455. Before #452. Do not
reopen #250. Distinct from #261 and #262. Related to #454 only as a
predecessor on the #255 graph, not client-nav.
