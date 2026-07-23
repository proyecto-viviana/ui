---
"@proyecto-viviana/solidaria-components": minor
---

Add `ElementTag` and route every string-tag render through it.

`<Dynamic component={someString}>` is unsafe anywhere that can render after
hydration settles: Solid's `createDynamic` string branch calls `getNextElement()`
with no `template` argument, and once `sharedConfig.done` is set — hydration
finished, `sharedConfig.context` still live — it falls through to `template()`
and throws `TypeError: template is not a function`. Any deferred child lands on
that path: a `<Show>` that flips, a Suspense resolution, a portal.

`ElementTag` renders each known tag as real JSX, so the compiler emits a
`template()` the hydration registry can adopt and clone afterwards. Text, Link,
Separator, VisuallyHidden, Landmark and BreadcrumbItem now render through it;
unknown tags still fall back to `<Dynamic>`.

Select's hidden native `<select>` also stops labelling object items
`[object Object]` — it now mirrors createListState's derivation
(textValue/label/name/title, then the item's key).
