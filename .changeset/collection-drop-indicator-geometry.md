---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
---

Render collection drop indicators as RAC does: before each item, after only the last in level. Treat after(item) and before(next) as the same gap, and focus that indicator after keyboard pickup so DragManager does not leave focus on the collection.
