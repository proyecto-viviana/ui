---
"@proyecto-viviana/ui": patch
---

Button, ActionButton, ToggleButton and LinkButton read an enclosing `Form` the way solid-spectrum's do. The size default no longer hides the Form's value, and ActionButton, ToggleButton and LinkButton now read the Form at all, so `<Form size="XL">` reaches them and a local `size` still wins.

The same four also resolve `isDisabled` through the Form/Skeleton proxy: `<Form isDisabled>` disables them, a `Skeleton` disables them even when they set `isDisabled={false}`, and an enclosing `ActionButtonGroup` stays the last resort below the button's own prop. A `NotificationBadge` inside an ActionButton greys out with the resolved value, and a `MenuTrigger`'s `isDisabled` no longer buries the Form or a `Skeleton` on a ToggleButton.
