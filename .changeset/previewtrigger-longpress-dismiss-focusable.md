---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

PreviewTrigger long-press is touch-only like RAC useLongPress. Overlay portals reset FocusableContext so preview actions do not inherit trigger ARIA. Dismiss restore does not reopen the preview.
