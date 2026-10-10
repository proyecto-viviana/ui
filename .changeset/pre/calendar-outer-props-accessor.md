---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
---

Allow createCalendarState to receive an outer props accessor and resolve current props throughout state derivation, navigation, validation and callbacks. Preserve object props support and the existing Calendar value and selection signatures. Keep inferred date subtypes usable in Calendar hooks by requiring only the state capabilities each hook consumes.
