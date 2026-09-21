---
"@proyecto-viviana/solidaria-components": patch
---

Popover: a flipped popover enters from its flipped side. The `placement` render prop reports the measured axis as soon as positioning lands, as RAC's `PopoverInner` does, instead of holding the requested axis for the whole enter.
