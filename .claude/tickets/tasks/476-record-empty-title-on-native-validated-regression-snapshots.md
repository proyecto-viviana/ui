---
id: 476
type: task
title: "Record empty title on native-validated regression snapshots"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: 'test:run: 5 solid-spectrum regression snapshots fail. Sole delta is title="" on NumberField, Radio, ComboBox, Select, and Tabs overflow <select> after createFormValidation calls setCustomValidity.',
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: 'Git v2. Update those snapshots. Do not retune S2 tokens. title="" is the native validity wiring from last night''s cluster.',
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "regression.test.tsx 50 passed. Five snapshots updated. No other HTML delta.",
    }
---

`createFormValidation` calls `setCustomValidity`. The browser then
exposes `title=""` on a currently-valid control. Last night's
form-validation cluster wired that path; the Solid-only regression
snapshots still expected no title.

## Done when

`packages/solid-spectrum/test/regression.test.tsx` is green. The five
snapshots include `title=""` and no other delta.

## Relationship

Child of #443. Distinct from #470 (format) and ADR 0001 (do not restyle
S2 to make a screenshot pass). These are HTML snapshots, not pixels.
