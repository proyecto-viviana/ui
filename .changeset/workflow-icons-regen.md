---
"@proyecto-viviana/solid-spectrum": patch
---

Regenerate the S2 workflow icons against the vendored upstream (T-22). Copies the 8 icons that landed upstream since the last sync — `ArrowCurvedIcon`, `ArrowUpSendIcon`, `BookmarkSingleFilledIcon`, `PremiumIconIcon`, `StopProcessingIcon`, `ZoomFitToHeightIcon`, `ZoomFitToScreenIcon`, `ZoomFitToWidthIcon` — and reruns the icon codegen, bringing the `s2wf-icons` set to 410. Each is exported from the `s2wfIcons` namespace.
