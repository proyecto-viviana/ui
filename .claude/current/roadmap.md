---
kind: roadmap
status: current
items:
  - id: launch
    title: Deploy the docs site and make the packages usable by external users
    status: done
    window: { start: 2026-07-24, target: 2026-07-24, finished: 2026-07-24 }
    docs: [launch.md, status.md]
  - id: recertification
    title: Pair-oracle recertification march (COMPLETE 2026-07-15)
    status: done
    window: { start: 2026-07-03, target: 2026-07-15, finished: 2026-07-15 }
    docs: [recertification.md, archive/recertification-full.md]
  - id: component-certification
    title: Per-component acceptance
    status: in-progress
    window: { start: 2026-05-20, target: null }
    docs: [repo-assessment.md, certification.md, tech-debt.md]
  - id: support-export-parity
    title: Support-export parity with React S2
    status: in-progress
    window: { start: null, target: null }
    docs: [repo-assessment.md, tech-debt.md]
  - id: comparison-docs-overhaul
    title: Comparison docs-site rollout
    status: in-progress
    window: { start: 2026-06-01, target: null }
    docs: [repo-assessment.md, work-queue.md, tech-debt.md]
  - id: package-build-migration
    title: Native Vite Plus package builds
    status: in-progress
    window: { start: 2026-05-10, target: null }
    docs: [repo-assessment.md, tech-debt.md, tooling.md]
  - id: admin-dashboard
    title: Dev-only admin dashboard
    status: in-progress
    window: { start: 2026-06-13, target: null }
    docs: [admin-dashboard.md]
  - id: ui-release-promotion
    title: Promote @proyecto-viviana/ui releases
    status: in-progress
    window: { start: 2026-07-06, target: null }
    docs: [repo-assessment.md, release-policy.md, tech-debt.md]
  - id: certification-enforcement
    title: Enforce the evidence checks in CI
    status: done
    window: { start: 2026-06-16, target: 2026-08-08, finished: 2026-08-08 }
    docs: [certification.md, tech-debt.md]
  - id: headless-spine-port
    title: Port the shared headless spine
    status: in-progress
    window: null
    docs: [repo-assessment.md, tech-debt.md]
  - id: consumer-delivery
    title: Ship correctly to installed consumers
    status: open
    window: null
    docs: [repo-assessment.md, tech-debt.md]
  - id: upstream-api-parity
    title: Prune component APIs to the upstream surface
    status: open
    window: null
    docs: [repo-assessment.md, tech-debt.md]
  - id: upstream-parity-loop
    title: Absorb upstream releases and hold behavioral parity
    status: in-progress
    window: null
    docs: [repo-assessment.md, upstream-release-audit.md, upstream-sync.md]
  - id: license-compliance
    title: Per-file Apache-2.0 attribution headers
    status: open
    window: null
    docs: [tech-debt.md]
---

# Roadmap

Status: live initiative map.
Update when: an initiative changes state, its owning docs change, or the
dependency order in `repo-assessment.md` changes.

The roadmap is the initiative axis behind `/admin`; task-level truth lives in
the `tasks:` frontmatter of the linked docs. The detailed whole-repository
assessment, gate workflow, execution waves, risk register, and GitHub ticket
links live in `repo-assessment.md`.

## Current program

The launch and recertification programs are complete. CI enforcement is also
complete: protected `main` requires the four measured contexts and publication
is bound to same-revision evidence. They remain here as completed outcomes, not
as work selectors.

The active program has five dependency-ordered fronts:

1. **Operational safety** — explicitly authorize and observe the qualified
   version release; remediate the current dependency advisories; make local gate
   preconditions deterministic.
2. **Upstream absorption** — move the exact oracle from S2 1.5.1 / RAC 1.19.0 to
   the available S2 1.6.0 / RAC 1.20.0 train, with source/test/release-note
   classification before porting.
3. **Parity closure** — remove the nine frozen strict-control gaps and port the
   seven missing S2 exports, including the shared DnD subsystem.
4. **Structural convergence** — consume the already-ported headless spine,
   retire upper-layer duplication in bounded batches, finish consumer delivery,
   and complete package-build migration.
5. **Public completeness** — close the catalogue documentation map, finish the
   admin projection, then work license and type/lint hygiene without displacing
   user-visible correctness.

These are not five independent backlogs. Upstream absorption precedes parity
closure so evidence is not built against a pin that is immediately replaced;
shared-spine and layer-convergence work precede per-widget cleanup so behavior is
fixed once at the lowest owner; documentation follows proven behavior so prose
does not become a second source of truth.

## Initiative exits

- **component-certification** exits when all 78 official entries have current,
  applicable evidence and the strict modeled-control baseline is empty.
- **support-export-parity** exits when the S2 value-export report has zero
  missing names and the exported behavior is certified, not merely present.
- **comparison-docs-overhaul** exits when every official catalogue entry maps to
  an intentional, behavior-backed docs destination.
- **package-build-migration** exits when every public package builds through the
  chosen native pipeline and clean-checkout consumers no longer depend on stale
  artifacts.
- **admin-dashboard** exits when the dev-only dashboard faithfully projects the
  live task/roadmap documents without a second state store.
- **ui-release-promotion** exits for this train when PR #20 publishes all five
  intended versions with provenance and the exact release SHA is observed green.
- **headless-spine-port** exits when the shared upstream state, selection,
  keyboard, focus, and slot machinery is consumed rather than copied per widget.
- **consumer-delivery** exits when installed tarballs expose and style the same
  supported surface proven in-repo, including SSR/hydration.
- **upstream-api-parity** exits when local public differences are either removed
  or explicitly documented owner-approved additions.
- **upstream-parity-loop** is standing work: each upstream train is closed only
  when every observable change is classified and the same-SHA gate ladder is
  green.
- **license-compliance** exits when derivative-source attribution is complete
  and guarded.

## Completed outcomes

- **launch** — the docs site is live at `ui.proyectoviviana.org`; truthful
  install/product positioning, route/SEO/contrast checks, safe deploy targeting,
  and generated flagship API reference are in place. Remaining docs coverage is
  continuing product work, not an unlaunched state.
- **recertification** — six tiers, 12/12 drivers, and Phase-3 closers completed
  2026-07-15. The suite is now a standing blocking gate.
- **certification-enforcement** — completed 2026-08-08 with strict protected-main
  contexts, administrator enforcement, and no force pushes/deletions. Open
  type/lint/contract debt now belongs to component certification rather than
  falsely keeping CI enforcement open.
