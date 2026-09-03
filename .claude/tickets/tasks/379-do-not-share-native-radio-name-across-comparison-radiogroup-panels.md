---
id: 379
type: task
title: "Do not share native radio name across comparison RadioGroup panels"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 radiogroup functional pass: both fixtures emit name=plan in one document so native radio grouping is document-wide. named-rest Solid starter is data-selected=true but input.checked=false; named-submit-starter React {plan:starter}, Solid {}. Isolated visibility:hidden / inert of React still leaves Solid unchecked. Isolated click Pro then submit both {plan:pro} because that click makes that panel the checked member. createRadio already has a checked-sync effect, but it only re-runs on the selection signal so a sibling group uncheck never recovers",
    }
---

HTML radios with the same `name` are one group for the whole
document. The comparison RadioGroup route mounts React and Solid
fixtures side by side and both emit `name="plan"` when that control
is set.

React's VDOM re-applies `checked` on every render, so the React
starter stays checked even while Solid's starter is in the same
native group. Solid's controlled `data-selected` stays `true` and
`input.checked` becomes `false`. FormData from the Solid panel is
then `{}`.

`visibility:hidden`, `inert`, and `display:none` of the other panel
do not ungroup native radios. `createRadio` already tries to sync
`input.checked` from `isSelected()`, but that effect only re-runs
when the selection signal or `syncVersion` changes — a sibling
group uncheck never wakes it.

## Evidence

`http://127.0.0.1:4341/components/radiogroup/?name=plan`, islands
mounted. Injected per-panel `form[data-fp-form]` + `requestSubmit`.

|                                      | React               | Solid           |
| ------------------------------------ | ------------------- | --------------- |
| rest `input.checked` (starter)       | true                | false           |
| rest `data-selected` (starter)       | true                | true            |
| rest submit                          | `{plan: "starter"}` | `{}`            |
| click Pro in that panel, then submit | `{plan: "pro"}`     | `{plan: "pro"}` |

Isolating Solid (`visibility:hidden` + `inert` on React) still
leaves Solid starter `checked=false`. Clicking Pro in the isolated
Solid panel then submits `{plan:pro}` on both.

Unnamed default rest (auto `react-aria…` / `solidaria-cl-228`)
already matches, because the generated names do not collide.

## Done when

The comparison RadioGroup fixtures do not share a native radio
`name` across panels, so a `?name=plan` rest submit is
`{plan:starter}` from each panel independently. A walk fails if
Solid submits `{}` while React submits `{plan:starter}` solely
because the other panel is in the document.

## Relationship

Child of #26. Found by #260. Harness: two fixtures, one `name`.
Solid `createRadio` checked-sync would also recover a production
page with two RadioGroups sharing a name; do not treat that as
this ticket's Done when. Distinct from #376 (custom validity). Do
not start #254.
