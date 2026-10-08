---
id: 127
type: task
title: "Port the Adobe prose macro surface"
created: 2026-08-20
parent: 25
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-99" }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "prose is exported from @proyecto-viviana/solid-spectrum/style and its generated class and CSS match pinned @react-spectrum/ai/src/style/prose.ts (l7UR1, 22175 bytes). viviana-ui style/index.ts and spectrum-theme.ts stay on their register forks, so the macro is not copied there. The AI component package stays out (#220). Owner confirmation, docs, visual branches, and installed-consumer evidence remain.",
    }
---

Complete the prose surface introduced with the S2 1.6 style macro.

The shared macro ordering and typography conditional-map foundation are present.
The Adobe prose macro and component surface is not ported.

## Done when

The owner confirms the public surface, generated styles match pinned S2 source,
and exports, types, docs, visual branches, and installed-consumer evidence pass.
Part of #82.
