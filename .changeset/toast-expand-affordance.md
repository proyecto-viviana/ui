---
"@proyecto-viviana/solid-spectrum": patch
---

Only render the toast stack "Show all" expand affordance when a `ToastContainer`
provides the expand/collapse context. A bare `ToastRegion` (the low-level
region, which has no container context) previously rendered a "Show all" button
whose press handler was a no-op, so the collapsed stack could never expand.
`Toast` now gates the affordance on a `canExpand` flag that `ToastRegion` sets
from the presence of a `ToastContainer` — mirroring the upstream split where the
S2 `ToastContainer`, not the low-level region, owns stack expansion.
