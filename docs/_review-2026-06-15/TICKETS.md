# Turning the 2026-06-15 review into tickets

How to convert the audit (`00-SYNTHESIS.md` + lanes `01`–`11`) into independent,
actionable tickets — the method, then the decomposed backlog.

## Granularity: what the findings are, and what they are not

The findings are at **diagnostic** grain (~24 Critical / ~40 High across 11 lanes),
not **execution** grain. Three things stand between a finding and a ticket:

1. **Duplication.** Several Criticals are one root cause seen from multiple lanes
   (Menu focus ×2; `@ts-nocheck` ×3). Deduped, the ~64 findings collapse to the
   **9 root causes** already written as the new `tech-debt.md` entries.
2. **Uneven size.** They range from a ~10-line fix (Menu focus) to a multi-week
   port (`SelectionManager`). A backlog needs every item normalized to one
   reviewable PR.
3. **Hidden dependencies.** Many component fixes _delete a per-widget copy_ of
   logic that the shared spine should own — so they are blocked by the spine ports
   and cannot all start in parallel.

So the review gives you the raw material, not drop-in tickets. The systematic step
is: **dedupe → classify → slice to one PR → draw dependency edges → topo-sort.**

## The ticket grain (definition of done, inherited from Rule #1/#7)

> One ticket = one PR that (a) changes **one concern in one layer**, (b) carries a
> **failing-capable test** that proves it, (c) leaves the tree green.

"Done" is not "code changed" — it is "the certification evidence exists." This is
just the repo's own Rule #1 bar applied at ticket scope, so acceptance criteria
write themselves: the ticket's test is the proof the corresponding upstream branch
is now held.

## Classify each root cause → slicing strategy

| Type               | Roots                                                                                               | How to slice                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Enablement**     | CI gates; `@ts-nocheck`; lint rules                                                                 | Horizontal; slice by gate or by package/batch. No upstream dependency — start now. |
| **Spine**          | `SelectionManager`; `ListKeyboardDelegate`/`useSelectable*`; `useContextProps`+slots; submenu state | Port-ticket (primitive + its own tests), then **per-consumer** migration tickets.  |
| **Component**      | Menu focus; Picker API; TreeView API; calendar alignment/i18n; slider; ComboBox nav                 | Vertical; **one component end-to-end = one ticket**, each with a contract spec.    |
| **Sweep / policy** | macro routing (14); sub-path exports (19); i18n strings; Button passthrough; dead natives           | Batchable; one sweep ticket, or N small ones if review load is high.               |

## Reuse the existing tracker — don't invent one

The substrate already exists: `tech-debt.md` frontmatter `tasks:`
(`id`/`title`/`state`/`roadmap`/`depends`/`planned`), grouped by `roadmap:` items,
projected by the `/admin` dashboard. The `depends:` field already encodes a
dependency graph (`pkg-build-remaining depends: [pkg-build-spectrum-dts]`).
Ticketing the review = adding `tasks:` entries with `depends:` edges under roadmap
items. **IDs and roadmap names are owner-steered (Rule #3)** — those below are
_proposed_, pending sign-off before they are wired into the dashboard.

## Proposed backlog (topo-sorted into waves)

Acceptance column states the failing-capable proof. Layer is the lowest layer the
change belongs in (Rule #4).

### Wave 0 — independent leaf fixes (no deps; parallelizable now)

| id (proposed)                   | title                                                                                      | layer                       | source  | acceptance                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ci-gates-report-only`          | Run the full gate ladder in CI as a **non-blocking** job                                   | CI                          | #11     | a PR workflow runs typecheck + `vp run check` + `comparison:test:contract`/`pair` + `guard:*` + ungated axe and reports results |
| `menu-focus-roving`             | Move real focus on `focusedKey` change in Menu                                             | solidaria                   | #02/#07 | Playwright: `document.activeElement` (or `aria-activedescendant`) tracks arrow/Home/End nav                                     |
| `picker-api-upstream`           | Drop invented `value`/`onChange`/`renderValue`; expose `selectedKey`/`onSelectionChange`   | solid-spectrum              | #04     | `guard:rac-parity` matches S2 Picker surface; selection contract test                                                           |
| `treeview-api-upstream`         | Drop grafted CardView props; expose only `onAction`                                        | solid-spectrum              | #04     | prop surface == S2 TreeView                                                                                                     |
| `calendar-default-alignment`    | Fix start-vs-center default; **rewrite the test that asserts the bug**                     | solid-stately               | #01     | pair-diff vs upstream default alignment; old test now asserts correct                                                           |
| `calendar-i18n-strings`         | Route cell " selected"/"Today", grid name, segment label through `createStringFormatter`   | solidaria                   | #08     | contract test in a non-English locale asserts localized names                                                                   |
| `macro-route-styled`            | Route the 14 hand-authored components through `style()`; delete `local-utilities.css`      | solid-spectrum              | #05     | **built package** renders styled with no app CSS; visual pair-diff vs built output (split per-component if review load is high) |
| `viviana-ui-subpath-exports`    | Add the 19 missing sub-path exports                                                        | viviana-ui                  | #10     | test imports each sub-path from the built package without throwing; `guard:rac-export-gap` clean                                |
| `viviana-ui-button-passthrough` | Unstyled Button passthrough in solid-spectrum; re-route 4 natives off solidaria-components | solid-spectrum / viviana-ui | #06/#10 | no viviana-ui import from solidaria-components (guard)                                                                          |
| `ts-nocheck-style`              | Remove `@ts-nocheck` from the 6 `style/` files + fix surfaced errors                       | solid-spectrum              | #04/#10 | files compile under typecheck; pragma gone                                                                                      |
| `ts-nocheck-components`         | Remove `@ts-nocheck` from the ~29 component files (batched) + fix errors                   | solid-spectrum              | #04/#10 | typecheck green; pragma gone (may be 2–3 batches)                                                                               |
| `lint-rules-reenable`           | Re-enable the 13 disabled rules in `vite.config.ts` (or justify each inline)               | root config                 | #11     | rules on; `vp check` green                                                                                                      |
| `replace-tautological-tests`    | Replace the live-region tautology + the green-tests-private-component                      | tests                       | #06/#09 | each test now fails when the behavior is absent                                                                                 |
| `dead-natives`                  | Delete or wire `Header`/`NavHeader`/`LateralNav`                                           | viviana-ui                  | #06/#10 | no orphaned exports, or each has a consumer                                                                                     |

### Wave 1 — spine foundations (each independent of the others)

| id (proposed)                 | title                                                                                            | layer                | source | acceptance                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | -------------------- | ------ | ---------------------------------------------------------------- |
| `port-selection-manager`      | Port `SelectionManager`/`Selection` (anchor+current) to upstream model                           | solid-stately        | #01    | unit tests mirror upstream replace/toggle/range/anchor semantics |
| `port-list-keyboard-delegate` | Port `ListKeyboardDelegate` + `useSelectableCollection`/`List`/`Item`; include RTL flip          | solidaria            | #02    | delegate unit tests + RTL arrow-direction test                   |
| `port-context-slots`          | Make `useContextProps`/`useSlottedContext`/`composeRenderProps` live; `TextContext` slot-capable | solidaria-components | #03    | description slot emits `aria-describedby`; `data-rac` emitted    |
| `port-submenu-state`          | Add submenu state to `createMenuState`                                                           | solid-stately        | #01    | submenu open/close/focus state tests                             |

### Wave 2 — consumer migrations (blocked by Wave 1; mutually independent)

| id (proposed)               | title                                                                              | depends                                                 | acceptance                                             |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `migrate-menu-spine`        | Re-route Menu onto ported manager+delegate; delete per-widget arrow/selection copy | `port-selection-manager`, `port-list-keyboard-delegate` | Menu nav/selection contract test; per-widget copy gone |
| `migrate-listbox-spine`     | Same for ListBox (and switch `ul/li` → `div[role]`)                                | same                                                    | ListBox contract test; roles match upstream            |
| `migrate-combobox-nav`      | Fix filtered-list nav onto the delegate                                            | `port-list-keyboard-delegate`                           | ComboBox filtered arrow-nav contract                   |
| `migrate-describedby-slots` | Wire `aria-describedby` across components onto the ported slot path                | `port-context-slots`                                    | computed-description test where upstream has one       |

### Wave 3 — ratchet (close the loop)

| id (proposed)            | title                                                                        | depends                     | acceptance                                           |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------- |
| `ci-gates-required`      | Flip the gate ladder from report-only to **required**                        | backlog green               | PRs blocked on any gate failure                      |
| `contract-spec-burndown` | Keyboard/focus/announcement contract specs for the 59 visual-only components | spine + per-component fixes | rollup; sub-ticketed per component; each gets a spec |

## Dependency graph (the edges that matter)

```
ci-gates-report-only ─────────────────────────────────► ci-gates-required
                                                              ▲
port-selection-manager ─┐                                     │
port-list-keyboard-deleg ├─► migrate-menu-spine ──────────────┤
                         ├─► migrate-listbox-spine ───────────┤
                         └─► migrate-combobox-nav ────────────┤
port-context-slots ───────► migrate-describedby-slots ────────┤
(all per-component fixes) ────────────────────────────► contract-spec-burndown ─► ci-gates-required
```

Everything in Wave 0 is a leaf — no inbound edges — so it can start immediately and
in parallel. `ci-gates-required` is the single sink: it ratchets only once the
backlog it would block is green.

## Suggested sequencing (maps to the synthesis "fix only three things")

1. **`ci-gates-report-only`** first — it makes every later ticket _verifiable_ without
   yet blocking anyone (visibility before enforcement).
2. **The three spine ports** (Wave 1) next — they unblock the most Wave 2 work and
   close the most Criticals per unit effort.
3. **`macro-route-styled` + the export/Button/exports sweeps** in parallel — they make
   "ships correctly" true for real consumers.
4. **`ci-gates-required`** last — flip to blocking once the above land, so green means
   what the docs claim.
