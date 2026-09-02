---
id: 220
type: task
title: "Absorb the 2026-09 upstream train"
created: 2026-09-01
parent: 34
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
---

## Cause

Adobe tagged `f56660b` as react-aria-components 1.21.0 and
@react-spectrum/s2 1.7.0. Our oracle is `5ecb333` (1.20.0 / 1.6.0). Under the
train-completion definition the owner set on #216 (pin moved, inventory
ticketed, certified green), #82's train is complete and this one opens now.

Known from the 1.21.0 release record (S2 1.7.0 shares the tag; read its
record in step 5 of the playbook):

- TokenField selection API: `caretPosition` → `selectedRange`,
  `withSelectedRange`; IME composition fix in Firefox. #118 must target this
  API, not the 1.20 alpha.
- New `NavigationTree` component.
- Menu: async loading (`MenuLoadMoreItem`) and `renderEmptyState`.
- Tabs: ArrowLeft / ArrowRight consistent in RTL vertical orientation
  (overlaps #201).
- Interaction modality kept on window refocus (Safari focus ring);
  `setInteractionModality` exported.
- DialogTrigger nested inside Tabs; Select / ComboBox inside a Dialog.
- Overlays: iOS 26 positioning; `FocusScope` null restore target.
- Calendar: selecting outside the visible range with `isDateUnavailable`;
  ColorField commits on Enter; collections select the autofocused item under
  `selectOnFocus`; Table drop past the last row inserts at the end.
- `optimize-locales-plugin` applies hook filters (relevant to #219 item 4).
- Upstream moved to TypeScript 7.

## Work

Follow `.claude/current/upstream-sync.md` "Absorbing a new upstream release".
The pin move (step 9: `scripts/upstream-pin.json`, `apps/comparison`
manifest, token pin, vendored checkout) is the first task and lands before the
functional pass so the pass compares against current React. Diff source and
tests (step 4), create one ticket per unresolved delta (step 6), run the
mechanical guards (step 7), re-run the certified suite against the new
oracle, and record the atomic task map here.

## Done when

Pin, comparison manifest, token pin, and vendored checkout agree on
`f56660b`; `guard:upstream-oracle` and `guard:upstream-freshness` are green;
every 1.21.0 / 1.7.0 delta has a ticket listed here; the certified suite is
green at the new pin (step 11).

## Relationship

Opened by the owner decision on #216. Follows #82. Re-aims #118. Touches
#201 (Tabs RTL) and #219 item 4 (locales).
