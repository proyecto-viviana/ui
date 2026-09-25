---
id: 124
type: task
title: "Match empty TextArea height"
created: 2026-08-20
parent: 24
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-94" }
  - {
      state: verified,
      at: 2026-09-24,
      note: "ported upstream S2 Chrome ::before top-padding rule on field group and alignSelf start on textarea input with centerBaselineBefore; verified with solid-spectrum unit tests, comparison visual and certified test suites",
    }
---

Port the pinned S2 Chrome `::before` top-padding branch for an empty TextArea.

The local field group uses baseline alignment and does not include the upstream
conditional padding calculation.

## Done when

The style macro produces the upstream rule and real-browser computed and visual
evidence passes for every S2 size and density, empty and non-empty. Part of #82.
