---
"@proyecto-viviana/solid-spectrum": patch
---

ActionButton resolves `isDisabled` through the Form proxy, so `<Form isDisabled>` disables it and a `Skeleton` disables it even when it sets `isDisabled={false}`, as upstream does. An enclosing `ActionButtonGroup` stays the last resort, below the button's own prop, matching S2's `isDisabled={props.isDisabled ?? group.isDisabled}`, and a `NotificationBadge` inside the button greys out with it.

ToggleButton reads the same way inside a `MenuTrigger`: the trigger no longer forces `isDisabled` over the Form or a `Skeleton`, and it stays below the button's own prop, so `<MenuTrigger isDisabled><ToggleButton isDisabled={false}>` opts out as upstream's does.
