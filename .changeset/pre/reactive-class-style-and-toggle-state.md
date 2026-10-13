---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Follow a signal-driven `class` and `style` on the headless components that read them once at setup, and let a ToggleButton follow `isSelected` when the caller starts or stops supplying it. A ToggleButton with reactive `isSelected` and `isDisabled` no longer logs `STRICT_READ_UNTRACKED`.
