---
"@proyecto-viviana/solidaria-components": patch
---

Correct the shared event adapter to call canonical and legacy inverted tuple callbacks with an undefined receiver instead of binding the tuple, preserving data and the original event. Retain EventListenerObject method receivers and reuse the shared adapter for Tab event composition. This adapter contract differs from native Solid DOM dispatch, which binds the DOM node.
