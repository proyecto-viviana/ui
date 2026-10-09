---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Forward zero-argument TableCell children without render props and track their signal reads through a reactive fragment. Preserve static children and argument-taking render callbacks.

Keep the shared TableRow chevron slot stable while forwarding live expansion button props, so the retained chevron updates its accessible label on expand and collapse.

Preserve Space and Enter defaults for nested text inputs in selectable items by checking the original keyboard target before the combined press handlers run. Keep row and plain-text descendant activation and virtual-focus behavior unchanged.
