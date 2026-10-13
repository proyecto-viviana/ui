---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

`mergeProps` combines a signal-driven `class` or `style` when it is read, so it keeps updating after a merge with other classes or styles. Its one-time walk over a spread props object, and a `ref` read through `splitProps`, no longer log `STRICT_READ_UNTRACKED` in a component body.
