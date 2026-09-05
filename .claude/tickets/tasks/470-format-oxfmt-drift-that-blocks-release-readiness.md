---
id: 470
type: task
title: "Format the oxfmt drift that blocks release-readiness"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "ci:release-readiness died on vp check. HEAD 06dbbe0f had 27 unformatted files. Comparison sibling owns apps/comparison/**; this ticket formats tickets plus package files outside that tree.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. vp fmt on the named package and ticket paths. Leave comparison playbook and styled-shared to the recertify sibling.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "Wrap-only oxfmt on tickets and package files. Two comparison files still fail format; those stay the recertify sibling's.",
    }
---

`vp run ci:release-readiness` starts with `vp check`. Last night's
form-validation / Radio cluster landed with oxfmt wrap drift, so the
gate never reached tests.

This is whitespace. No behavior change. Do not retune S2 tokens. Do not
rewrite comparison.

## Done when

`vp fmt --check` is clean on the named ticket and package files. A
package test is not required; the gate is format. Two comparison files
remain the recertify sibling's: `apps/comparison/playbook/components/color-family-validation-notes.md`
and `apps/comparison/src/components/solid/fixtures/styled-shared.tsx`.

## Relationship

Child of #443. Distinct from #194 (certified postcard) and from
PreviewTrigger/#117 product work. Formatting `createPreviewTrigger.ts`
is wrap-only so `vp check` can pass the solidaria tree.
