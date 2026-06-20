---
"@proyecto-viviana/solid-spectrum": patch
---

Breadcrumbs: invoke `onAction` with the item key only

The collapsed-overflow menu forwarded its `onAction` straight to the inner
`Menu`, which calls `onAction(key, value)`. That leaked the menu item's value
as a second argument to the consumer. `Breadcrumbs.onAction` is key-only
(matching upstream React Spectrum), so the breadcrumb menu now drops the value
before invoking the handler.
