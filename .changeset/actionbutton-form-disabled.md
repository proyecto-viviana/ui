---
"@proyecto-viviana/solid-spectrum": patch
---

ActionButton resolves `isDisabled` through the Form proxy, so `<Form isDisabled>` disables it and a `Skeleton` disables it even when it sets `isDisabled={false}`, as upstream does. An enclosing `ActionButtonGroup` stays the last resort, below the button's own prop, matching S2's `isDisabled={props.isDisabled ?? group.isDisabled}`.
