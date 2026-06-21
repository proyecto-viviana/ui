---
kind: roadmap
status: current
items:
  - id: component-certification
    title: Per-component certification
    status: in-progress
    window: { start: 2026-05-20, target: 2026-07-15 }
    docs: [work-queue.md, certification.md]
  - id: support-export-parity
    title: Support-export parity with React S2
    status: done
    window: { start: null, target: 2026-07-31, finished: 2026-06-21 }
    docs: [tech-debt.md]
  - id: comparison-docs-overhaul
    title: Comparison docs-site rollout
    status: in-progress
    window: { start: 2026-06-01, target: 2026-06-30 }
    docs: [work-queue.md]
  - id: package-build-migration
    title: Native Vite Plus package builds
    status: in-progress
    window: { start: 2026-05-10, target: 2026-06-25 }
    docs: [tech-debt.md, tooling.md]
  - id: admin-dashboard
    title: Dev-only admin dashboard
    status: in-progress
    window: { start: 2026-06-13, target: 2026-06-20 }
    docs: [admin-dashboard.md]
  - id: ui-release-promotion
    title: Promote @proyecto-viviana/ui releases
    status: open
    window: null
    docs: [release-policy.md, steering.md]
  - id: certification-enforcement
    title: Enforce the certification gate ladder in CI
    status: in-progress
    window: null
    docs: [tech-debt.md, certification.md]
  - id: headless-spine-port
    title: Port the shared headless spine
    status: open
    window: null
    docs: [tech-debt.md]
  - id: consumer-delivery
    title: Ship correctly to installed consumers
    status: open
    window: null
    docs: [tech-debt.md]
  - id: upstream-api-parity
    title: Prune component APIs to the upstream surface
    status: open
    window: null
    docs: [tech-debt.md]
  - id: upstream-parity-loop
    title: Absorb upstream releases and hold behavioral parity
    status: in-progress
    window: null
    docs: [upstream-release-audit.md, press-path-epic.md, upstream-sync.md]
  - id: license-compliance
    title: Per-file Apache-2.0 attribution headers
    status: open
    window: null
    docs: [tech-debt.md]
---

# Roadmap

Status: Current source of truth.
Update when: an initiative is added, changes status, or its window or docs shift.

The initiative axis behind `/admin`. High-level items live here; the low-level
tasks that deliver them live in the `tasks:` frontmatter of the doc each item
points to (`work-queue.md`, `tech-debt.md`, `admin-dashboard.md`), linked back by
`roadmap:` id. `vp run docs:check` enforces that every in-progress item has at
least one task, every task points at a real item, and done state matches a
recorded finish date.

These are live initiatives, not mock data. Each one below names a real exit and
a home doc carrying its tasks; the dependency-ordered program that sequences all
of them — and names the single item in flight right now — is in **Execution
sequence** at the foot of this page.

## Initiatives

- **component-certification** — the standing per-component certification loop;
  collection and overlay families next. Tasks in `work-queue.md`.
- **support-export-parity** — **DONE 2026-06-21.** Closed the missing React S2
  support exports (`comparison:report:exports` reports 0 missing). Tracked in
  `tech-debt.md`.
- **comparison-docs-overhaul** — roll the comparison app onto the S2 docs site.
  Tasks in `work-queue.md`.
- **package-build-migration** — move every package onto native Vite Plus
  packaging, one at a time. Tasks in `tech-debt.md`.
- **admin-dashboard** — this dev-only dashboard: the `/admin` route plus the
  `.claude/current` tracking model. Tasks in `admin-dashboard.md`.
- **ui-release-promotion** — promote `@proyecto-viviana/ui` from prerelease to
  stable once certification thresholds hold. See `release-policy.md`.

The next four are the actionable initiatives distilled from the 2026-06-15 harsh
review (archived under `docs/_review-2026-06-15/`); their tasks live in
`tech-debt.md`. Slugs are provisional (Rule #3) — owner to confirm names.

- **certification-enforcement** — wire the certification gate ladder into CI:
  report-only first (`certification-gates.yml`), then required once the styled
  layer type-checks and the suites are green.
- **headless-spine-port** — port `SelectionManager`, `ListKeyboardDelegate` /
  `useSelectable*`, and `useContextProps` + slots to their lowest layer, then
  migrate the per-widget copies onto them.
- **consumer-delivery** — make "ships correctly" true on npm: route styled
  components through the macro, add the missing sub-path exports, fix the boundary
  skips.
- **upstream-api-parity** — prune invented component props (Picker, TreeView) and
  hardcoded i18n strings back to the upstream surface.

These two carry the standing parity rule and the licensing chore:

- **upstream-parity-loop** — the #1 product rule in motion: absorb each upstream
  RAC/S2 release and close the behavioral gaps it exposes. Tickets in
  `upstream-release-audit.md`; the cross-hook press-path epic is scoped in
  `press-path-epic.md`; pinning and absorption mechanics in `upstream-sync.md`.
- **license-compliance** — add the per-file Apache-2.0 derivative-source headers
  the ported packages still lack (`tech-debt.md`; full plan in
  `docs/license-compliance-plan.md`).

## Execution sequence

The initiatives above are the _what_; this is the _order_. The program is
dependency-ordered, not priority-ranked: bounded correctness work leads, the
shared-spine port is the load-bearing middle most other tracks hang off, and the
delivery/compliance/release chores trail because they gate on coverage, a product
decision, or are pure housekeeping. Depth for every item already lives in the
linked doc — this section sequences, it does not restate.

**Critical path.** `headless-spine-port` is the root enabler. Its three keystones
(`SelectionManager`, `ListKeyboardDelegate` / `useSelectable*`, `useContextProps`
\+ slots) delete the per-widget duplication behind the recurring
selection / keyboard / `aria-describedby` bugs, and they gate
`certification-enforcement`'s `contract-spec-burndown`, which in turn gates
`ci-gates-required`. Everything else interleaves around that spine.

### Phase 1 — bounded correctness, no dependencies (now)

1. **GridList Space double-toggle** (`upstream-parity-loop` ▸
   `gridlist-double-toggle`) — **DONE 2026-06-21 (commit d03dac43).** Twin of the
   Table bug fixed 2026-06-19: the item hook and the grid hook both toggled on
   Space and neither stopped propagation. Resolved evidence-first (see _The first
   item_ below). Fixed per-widget now, subsumed by the spine port later — a
   conscious triage, not an oversight: the latent bug shipped fixed today and the
   fix mirrors one already landed.
2. **`ts-nocheck-style`** (`certification-enforcement`) — **DONE 2026-06-21.**
   Dropped `@ts-nocheck` from the 6 `style/` files. Removing it surfaced 21
   strict-mode errors (20× `TS7053` string-index implicit-any, 1× `TS7006`
   param) that upstream's `noImplicitAny:false` silently suppresses; reconciled
   each faithfully with minimal null-checked loose-lookup casts (mirroring
   upstream's effective `any`) plus a `tokens.ts` strip-default fix for the
   synthetic `esModuleInterop` `default` key. `vp run typecheck` + 5384 package
   tests green; type-only, no behavior change. The root type-hygiene enabler
   beneath the gate ladder; the ~29 component files remain
   (`ts-nocheck-components`, Phase 4).

### Phase 2 — standalone parity absorption (interleavable)

- **`table-focus-ring`** (T-59) — TableView cell focus-ring `--topFocusRing`
  re-architecture; visual-regression risk, so isolate it.
- **`rac-form-field-wrappers`** — **DONE 2026-06-21.** Absorbed the 9 unported RAC
  Checkbox / Radio / Switch `Field` / `Button` / `FieldContext` names into
  `solidaria-components`, mirroring upstream's 1.19 split (`*Field` owns state +
  validation + help text; `*Button` is the clickable label + indicator). The
  field→button handoff uses a native `Internal*Context` read inside the provider
  (the `Show … keyed` owner pattern) because `<Provider>`/`TextContext` are inert
  (`port-context-slots`); `description`/`errorMessage` bridged to `aria-describedby`
  by hand. `guard:rac-export-gap` now reports 0 RAC names missing; 18 new tests +
  typecheck + a11y green. The deprecated monolith wrappers stay the styled primaries
  (we did **not** add hard `@deprecated` tags — see tech-debt).
- **`autocomplete-collection-bridge`** — wire `SearchField` / `Menu` onto the
  autocomplete contexts (Bucket D).
- **`upstream-api-parity`** — `picker-api-upstream`, `treeview-api-upstream`,
  `calendar-i18n-strings`.
- **`support-export-parity`** — **DONE 2026-06-21.** The 21 missing S2 support
  exports (`support-export-audit`): the slotted-props contexts, `PickerSection` /
  `ComboBoxSection`, and the helper/hook re-exports are wired and
  `comparison:report:exports` reports 0 missing support exports. The two
  parity-restoring fixes (Skeleton force-disable merge order on the form fields;
  `slot` restored on `ToggleSwitchProps`) landed with it.

### Phase 3 — the shared-spine port (the load-bearing middle)

Within `headless-spine-port`: `port-selection-manager` →
`port-list-keyboard-delegate` → `port-context-slots`, then the migrations
(`migrate-menu-spine`, `migrate-listbox-spine`, `migrate-combobox-nav`,
`migrate-describedby-slots`) and `port-submenu-state`. The **press-path epic** is
the item-hook half of this same move, folded into `upstream-parity-loop` because
it is ticket-driven: Phases 0–1 landed (`onSelect` split + `createSelectableItem`);
**`press-path-phase2`** migrates the three item hooks
(`createGridListItem` / `createTreeItem` / `createTableRow`) onto the shared hook
(carrying T-51 / T-56), then **`keyboard-nav-behavior`** (T-34) layers the
`keyboardNavigationBehavior='tab'` model on top.

### Phase 4 — enforcement capstone (gates on Phases 1–3)

`certification-enforcement`, in order: `ts-nocheck-components` (~29 files,
batched) → `lint-rules-reenable` (13 rules) → `contract-spec-burndown` (the 59
visual-only components — gated on the spine keystones) → `ci-gates-required`
(flip the ladder from report-only to required — the capstone that makes "green"
mean the documented bar passed; this also retires the axe color-contrast
exclusion and folds the separate lint type-check back into the gated run).

### Phase 5 — delivery, compliance, release (gated on coverage / a decision)

- **`consumer-delivery`** — `macro-route-styled` (14), `viviana-ui-subpath-exports`
  (19), `viviana-ui-button-passthrough`, `dead-natives`. Driven by real client
  need (the UC track), not parity.
- **`package-build-migration`** — finish `pkg-build-spectrum-dts`, then
  `pkg-build-remaining`. Independent infra; interleave freely.
- **`license-compliance`** — the per-file Apache-2.0 headers (12/989 done),
  batched alongside other passes over each package.
- **`ui-release-promotion`** — UC-02 Part B is **deferred** (needs a product/design
  decision on the Viviana-owned macro token map — nothing upstream to mirror);
  UC-06 is **downstream** (the `viviana-social` repo). The staged changesets are
  ready to publish on the owner's call (`release-policy.md`).

### Continuous (always running, not a phase)

- **`component-certification`** — the standing per-component loop (`cert-button` in
  flight, `cert-checkbox` next; collection / overlay families after). Visual-state
  rows → pair-diff / contract tests.
- **`comparison-docs-overhaul`** — port the remaining collection / overlay pages
  to the docs site.
- **`admin-dashboard`** — the `/admin` route and this tracking model itself.

### Not backlog (recorded so they are not re-litigated)

- The **8 skipped tests** are intentional and verified: 4 jsdom `contenteditable`
  limits in `DateField.test.tsx`, 1 mirrored upstream skip in `Table.test.tsx`
  (`scrollRef`), 3 React-Suspense-specific titles Solid covers elsewhere.
- **Visual-state coverage** (349 tracked / 113 evidence / 56 pair-diff) is tracked
  coverage debt under `component-certification`, not a separate initiative.

### The first item — GridList Space double-toggle (DONE 2026-06-21)

**Resolved in commit d03dac43.** Evidence before code, per the recorded caveat
(`tech-debt.md` and the `gridlist-space-double-toggle-followup` memory). The open
question was whether real DOM focus rests on the row or the grid container after
keyboard entry — if the container, deleting the grid-level Space handler would
break selection. The browser evidence settled it: GridList **auto-advances focus
into the first row on container focus** (RAC parity), and a Table-style
focus-following effect now carries real focus onto the focused row by a stable
`data-key`, so the row owns Space/Enter exactly as upstream. What was done:

1. Reproduced in a real browser with window-level focus tracing. Finding: a real
   `Tab` lands focus on the first row and it sticks; the apparent "focus stays on
   the container" was a Playwright `locator.focus()` artifact (it re-asserts the
   grid when the focus-following effect moves focus synchronously inside
   `grid.focus()`), not a component bug.
2. Mirrored upstream `useSelectableCollection` (no Space/Enter case — the item
   owns selection): removed the grid-level Space/Enter block, added the
   focus-following effect + `data-key`, and gave `createGridListItem` an
   `"all"`-gated interaction guard. Updated the unit tests to fire on the focused
   item, not the grid.
3. Re-ran the full package suite (5384 passed) and `a11y:check` (all three
   sub-gates green); added `apps/web/e2e/gridlist-focus.spec.ts` as the
   browser-evidence contract (roving focus + single-toggle, real-Tab entry).
