---
"@proyecto-viviana/solidaria-components": minor
"@proyecto-viviana/solid-spectrum": minor
"@proyecto-viviana/ui": patch
---

Remove MenuButton from the RAC and S2 barrels. Compose MenuTrigger + Button, and keep the ui-package helper as a documented local addition.

```tsx
<MenuTrigger>
  <Button>Actions</Button>
  <Menu>{/* items */}</Menu>
</MenuTrigger>
```
