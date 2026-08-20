---
id: 120
type: task
title: "Align platform and user-agent detection"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-85" }
---

Reconcile the shared platform detector with the pinned upstream implementation.

The local code lacks `userAgentData.brands`, CriOS/CrMo, FxiOS, the iOS WebKit
exception, `isSafari`, and upstream caching. It also reads platform sources in a
different order.

## Done when

The detector and every local consumer are audited. Tests cover the supported
browser and platform matrix without inventing an environment contract. Part of
#82.
