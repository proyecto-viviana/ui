---
"@proyecto-viviana/ui": patch
"@proyecto-viviana/solidaria": patch
---

Add optional TreeView inline label renaming with F2 or double press, Enter to commit, Escape to cancel, and blur to commit. Keep editing keys inside the field and preserve its caret during protective refocus.

Prevent selectable-item focus effects from subscribing to reactive reads made by synchronous native, custom, or virtual focus handlers. Controlled editor updates no longer trigger unintended row focus through those reads, preserving editor focus and immediate blur commits.
