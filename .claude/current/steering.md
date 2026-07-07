---
kind: reference
status: current
---

# Steering

Status: live reference.
Update when: direction, current focus, open decisions, non-goals, or checks
change.

The short direction layer above the work queue. Read this before choosing a task;
use `work-queue.md` for implementation detail.

## Direction

Viviana UI is Proyecto Viviana's published open-source UI suite and design
system, built on Solid. Its foundation is the unofficial Solidaria and Solid
Spectrum port stack for Adobe's React Stately, React Aria, React Aria
Components, and React Spectrum S2.

The port stack stays strict about parity: the same public behavior,
accessibility model, keyboard model, and S2 styling branches in Solid. A
component should not be described as ported until the evidence bar in
`certification.md` is met — and the recertification march
(`recertification.md`) is the mechanism that enforces that bar, component by
component, against the live upstream oracle.

## Current Focus

Name/surface parity is closed (all pin guards green). Depth parity is the
recertification march: ~37/70 styled components certified (Tiers 1–3 done —
Tier 3 closed 2026-07-06 with DropZone/FileTrigger; next Tier 4, opening with
Picker). The 2026-07-06
validation pass confirmed the
certified tiers are genuinely strong — and found that the biggest current risk
is **process, not code**: CI has been dark on main since 2026-06-24, the
release train is jammed, and live rot (7 unit failures, 2 a11y smoke failures,
format drift) has already accumulated unseen. Stabilize the pipeline first,
then keep marching.

## Now (P0 — stabilization)

- ~~**Push main and wire CI to run on it**~~ (`tech-debt.md` →
  `ci-main-gate-wiring`) — DONE 2026-07-06. Both `release-readiness.yml` and
  `certification-gates.yml` now trigger on push-to-main, with the three orphaned
  checks (certified suite, jsx-deopt-size, upstream-test-parity) wired in.
  Validated end-to-end: the first main pushes caught 5 latent `typecheck:apps`
  errors that had rotted in while CI was dark; fixed (`73903a5b`), re-run green.
  Certified suite stays report-only until `ci-gates-required` (D4 policy).
- **Unjam the release train** (`release-train-unjam`): version PR #7, 101
  pending changesets, npm one patch behind on 3 packages — the SSR hydration
  fix has never reached installed consumers.
- ~~**Burn down live rot** (`main-rot-burndown-2026-07`)~~ — DONE 2026-07-06.
  All three were stale tests, not source bugs: the ContextualHelp/Menu/ActionMenu
  cluster asserted the pre-CP9.34 heading-slot divergence; the Toolbar `End` /
  ActionBar `Home` tests asserted Home/End that CP9.3 removed as invented. Tests
  realigned to upstream + format drift fixed. check / test:run / a11y:check green.
- ~~**Finish Toast**~~ (recertification CP9.35) — DONE 2026-07-06, **37/37 green**.
  Landed the first D6 live-region evidence (`role="alert"` in the AX tree), a D7
  `<span>` wrapper fix, and — root-causing the D6 dismiss-cross miss — a **global**
  bare-ui-icon fix in `createUIIcon` (no forced `role="img"`/auto-`aria-hidden`,
  matching upstream's raw svg assets), which retired the `ui-icon-decorative-ax-node`
  cross-cutting divergence and kept axe green. `info` glyph D3 sub-pixel waiver only.
- ~~**Certify DropZone/FileTrigger**~~ (recertification CP9.36) — DONE 2026-07-06,
  **31/31 first-run green, zero port fixes** (fully faithful). Closes Tier 3. Drove
  the non-gesture states (focus-visible, drop-target) via `beforePanel`; confirmed the
  `id`/`aria-describedby`/`aria-details` drop matches upstream's `delete DOMProps.id` +
  `filterDOMProps` filtering. No sub-pixel waiver (no ui-icon glyph in the box).

## Next (P1 — the Tier 4-enabling tracks, run in parallel)

Decisions resolved 2026-07-06 (see Open Decisions). All three certified-march
prerequisites are now execution tracks, run concurrently where they don't touch
the same files. Dependency edges noted; the full task graph mirrors these.

- ~~**Backfill D5/D6 on Menu and ActionMenu**~~ (`menu-actionmenu-d5-d6-backfill`)
  — DONE 2026-07-06 (CP9.37–9.39). Was the test case for the keyboard-composite
  bar, now adopted into `certification.md`.
- **Track A — D9/D10 drivers** (`recert-drivers-d9-d12`): land forced-colors
  (D9) + RTL/i18n (D10) as re-run modes over the existing D1/D5 oracles,
  calibrate on a pilot (ToggleButton), then re-run the certified Tiers 1–3.
  *Independent of the port source — parallelizable with Track B.* Blocks Picker
  (Picker certifies against the full applicable driver set including D9/D10).
- **Track B — D4 microtask-defer** (`d4-microtask-defer`): land the callback
  defer mechanism in the ports and clear the 5 deferred D4 reds (Tabs ×2,
  Dialog ×2 + the ActionButton-class memo-rebuild watch-list). *Touches
  collection/overlay port source — must NOT run concurrently on the same files
  as Picker.* Blocks Picker's D4 driver.
- **Track C — Picker/Select cert** (`picker-popover-anchor`,
  `picker-item-checkmark`): the highest-value single certification —
  production-broken for installed consumers (popover at 0,0; checkmark on every
  row). *Blocked by Track A (driver set) and Track B (D4 on a collection).*
  Certify against the full applicable driver set once A + B land.
- **`macro-route-styled`** (`tech-debt.md`): 14 components ship unstyled to
  installed consumers; app CSS masks it in-repo. Consumer-delivery priority,
  independent — can slot alongside any track.

## Later

- Tier 4–6 of the march (collections, overlays, date/time; then the long tail).
- The DnD subsystem port (`dnd-subsystem-port`) — the one un-ported surface;
  blocks TableView/TreeView DnD rows and the last 6 S2 support exports.
- Headless-spine consumption: Menu/ListBox/ComboBox still run pre-spine
  selection wiring; migrate as their march slots come up, not before.
- Package-build migration; release-bar tightening per package
  (`release-policy.md`).

## Open Decisions

None currently open — the three that gated the Tier 4 start were resolved
2026-07-06 (owner call). The march now runs four active tracks (release unjam
under "Now" + the three Tier-4-enabling tracks under "Next") in parallel where
they don't touch the same files; the dependency edges are in "Next".

**Resolved 2026-07-06:**

- **D4 event-ordering policy → (a) microtask-defer the ports.** Solid callbacks
  are deferred to match React's batched-effect ordering so installed consumers
  see the faithful upstream event order; this keeps the parity rule (diverge only
  where React→Solid makes it genuinely impossible, then a documented per-case
  waiver — not a standing oracle-normalized divergence that compounds across
  collections). Implementation tracked as `d4-microtask-defer` in `tech-debt.md`;
  it lands the defer mechanism + clears the 5 deferred reds (Tabs ×2, Dialog ×2,
  and the ActionButton-class watch-list) before Picker's D4 driver runs.
- **D9/D10 sequencing → before Tier 4.** Forced-colors (D9) + RTL/i18n (D10)
  drivers land and the certified Tiers 1–3 re-run against them first, so we don't
  re-march the certified set later. Tracked as `recert-drivers-d9-d12`.
- **Certification bar for keyboard composites → adopted.** "D5+D6 mandatory for
  keyboard-heavy composites" is now in `certification.md` ("Driver
  applicability"); the Menu/ActionMenu backfill (`menu-actionmenu-d5-d6-backfill`,
  CP9.37–9.39) was the test case and is complete.

## Non-Goals

- Counting exports, routes, a green axe run, or a stable screenshot as
  acceptance.
- Per-side committed PNG baselines as focused acceptance gates.
- Hand-authored S2 component-surface CSS in the comparison app (ADR 0001).
- Adding barrel names without a report identifying a real missing upstream
  export.
- Relaunching fleet-census audits — the march supersedes them
  (`recertification.md`).

## Gates

The evidence bar and its commands live in `certification.md`; the march harness
in `recertification.md`. `comparison:report:parity:strict` and the certified
suite are expected to pass. Status is refreshed from scripts (`status.md`),
never from memory.

## Before A Task

- Which component or parity gap does this move toward acceptance?
- What upstream behavior is the authority, and where is it in installed source?
- Which gates prove it — beyond axe and export counts?

After a task, update this page only if the steering state changed; otherwise
update `status.md`, `work-queue.md`, or the component validation note that owns
the surface.
