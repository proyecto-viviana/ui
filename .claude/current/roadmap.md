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
    status: open
    window: { start: null, target: 2026-07-31 }
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

These items are seeded mock entries so the dashboard renders against real
structure; replace them with live initiatives as the work is actually scheduled.

## Initiatives

- **component-certification** — the standing per-component certification loop;
  collection and overlay families next. Tasks in `work-queue.md`.
- **support-export-parity** — close the missing React S2 support exports. Tracked
  in `tech-debt.md`.
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
