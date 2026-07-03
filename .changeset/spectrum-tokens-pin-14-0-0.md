---
"@proyecto-viviana/solid-spectrum": patch
---

Pin `@adobe/spectrum-tokens` to exact `14.0.0` — the version the pinned
upstream S2 (1.5.1) builds against. The previous `^14.5.0` range had drifted
five minor releases ahead of the oracle: 357 of the token values our style
macro consumes differed from what upstream ships, silently diverging rendered
colors. A new `guard:spectrum-tokens-pin` fails the gate ladder if the
declared, installed, and pinned-oracle versions ever disagree again.
