---
id: 220
type: task
title: "Absorb the 2026-09 upstream train"
created: 2026-09-01
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "pin moved to f56660b (1.21.0 / 1.7.0); inventory ticketed 228–242; certified 1962/2124 with 158 visual failures all class (b) on #240",
    }
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

## Atomic task map

| Upstream item                                                               | Ticket                                  |
| --------------------------------------------------------------------------- | --------------------------------------- |
| TokenField `selectedRange` / `withSelectedRange` / Firefox IME              | note on #118                            |
| NavigationTree                                                              | #228                                    |
| Menu `MenuLoadMoreItem` + `renderEmptyState`                                | #229                                    |
| Tabs RTL vertical ArrowLeft/ArrowRight                                      | #230; note on #201                      |
| Interaction modality on window refocus; RAC barrel `setInteractionModality` | #231                                    |
| DialogTrigger nested in Tabs                                                | #232                                    |
| Select / ComboBox inside Dialog                                             | #233                                    |
| iOS 26 overlay `pageTop`/`pageLeft`                                         | #234                                    |
| FocusScope null restore target                                              | #235                                    |
| Calendar `isDateUnavailable` outside visible range                          | #236                                    |
| ColorField Enter commit                                                     | #237                                    |
| `selectOnFocus` autofocus selection                                         | #238                                    |
| Table drop past last row                                                    | #239                                    |
| S2 tokens 14.15.0 + icon `1lh` (ADR 0001)                                   | #240                                    |
| Shadow-DOM `preventFocus` / RangeCalendar                                   | #241                                    |
| `usePreventScroll` kebab-case `setStyle`                                    | #242                                    |
| SideNav rewritten onto NavigationTree                                       | note on #126                            |
| `optimize-locales-plugin` hook filters                                      | note on #198 (#219 item 4)              |
| `inputRef` callback-ref typing                                              | skip (React-internal typing)            |
| LoadMoreItem default className string tweaks                                | skip (docs/className)                   |
| `page.ts` deletion / page-css build                                         | skip (S2 build internals)               |
| TypeScript 7                                                                | skip (compiler, not a port)             |
| `@react-spectrum/ai`                                                        | skip (separate package, not this stack) |
| Tooltip / Formisch / Menu typeahead docs                                    | skip (docs-only)                        |

## Evidence

SHAs: old `5ecb3333001313e83898cd07644227897e3bae1f` (1.20.0 / 1.6.0); new
`f56660b234bd588751c9f35b85d6fe6e17e45ccf` (1.21.0 / 1.7.0). Both tags
resolve to `f56660b`. Oracle HEAD after fetch: `f56660b`. GitHub Releases
were not published (`gh release view` 404); records used:
https://react-aria.adobe.com/releases/v1-21-0 and
https://react-spectrum.adobe.com/releases/v1-7-0. Diff summary:
`output/audit-2026-09/train-2026-09/diff-summary.md`.

Pin: `scripts/upstream-pin.json` `f56660b` / S2 1.7.0 / RAC 1.21.0;
comparison `@react-spectrum/s2@1.7.0`, `react-aria-components@1.21.0`,
`react-aria@3.52.0`, `react-stately@3.50.0`, `@internationalized/date@3.12.4`;
styled packages `@adobe/spectrum-tokens@14.15.0`.

Guards: `guard:upstream-oracle` pass; `guard:upstream-freshness` pass
(current); `guard:spectrum-tokens-pin` pass; `guard:rac-parity` pass;
`guard:dnd-keyboard-parity` pass; `guard:virtualizer-keyboard-parity` pass.
`guard:rac-export-gap` fail (expected): missing `MenuLoadMoreItem` and
`NavigationTree*`. `guard:upstream-test-parity` fail before baseline regen
(new unmatched `navigationtree`, `rangecalendar.shadow`, `shadowdomfocus`);
pass after `--write-baseline`. Baseline also dropped two Tabs we-only key
facts (`arrowdown`, `arrowleft`) and one Meter coverage gap.

Certified 2026-09-02: 158 failed, 4 skipped, 1962 passed (28.9m). Log:
`output/audit-2026-09/train-2026-09/certified.log`. Every failure is class
(b) React styling at 1.7.0 (icon `1lh`, tokens 14.15.0, ActionButtonGroup
vertical width) — #240; ADR 0001, do not hand-tune or loosen thresholds.
No class (a) behavior failures and no class (c) harness API breakage.
Contract: 93 passed. Pair: 6 passed (asserted budgets).

## Relationship

Opened by the owner decision on #216. Follows #82. Re-aims #118. Touches
#201 (Tabs RTL) and #219 item 4 (locales). Children #228–#242 sit under
initiative #34 (a task cannot parent a task on this board).
