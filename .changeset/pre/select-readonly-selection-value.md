---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Accept a readonly multiple Select value in state and both hidden form adapters. Multiple state keeps that readonly list, onChange receives a separate mutable copy, and the public value and onChange callbacks keep their mode types.

Preserve an explicit controlled null value instead of falling back to internal selection state.
