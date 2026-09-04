---
"@proyecto-viviana/solidaria": patch
---

Keep ActionGroup item native `disabled` live when `disabledKeys` change after mount. `createActionGroupItem` passes an Accessor into `createButton` instead of a one-shot boolean.
