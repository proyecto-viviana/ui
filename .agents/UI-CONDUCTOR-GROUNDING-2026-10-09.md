# UI conductor grounding — 2026-10-09

The owner selected green main and Solid 2 RC readiness, before publication.
The owner confirmed the dirty files belong to the previous session to continue.
I created an active execution goal with that scope and no fixed token budget.

Three GPT-6.1 Sol agents at medium effort inspected CI, tickets, and dirty work.
They returned findings without source edits, builds, or process control.
The conductor retained scope, decisions, acceptance, and integration.

## Observed source and CI

Main and origin/main identify `3298de6ac337c3fddb7e2db584b4819f58789eca`.
The starting tree has 35 modified tracked files and 10 untracked files.
The agent compared the dirty patch and status with the previous checkpoint.
They match; the source repairs still need their recorded acceptance work.
Generated status and roadmap lag the dirty tickets.

- [Readiness](https://github.com/proyecto-viviana/ui/actions/runs/37939978932)
  fails dependency security: seven full-graph and three production advisories.
- [Certification](https://github.com/proyecto-viviana/ui/actions/runs/37939978819)
  stalls in TagGroup hydration. Its certified report has 2,225 passes,
  38 failures, four skips, and zero waivers. Pair-floor ActionButton also fails.
- [Site](https://github.com/proyecto-viviana/ui/actions/runs/37939979112)
  reports 174 failed routes and one pass, with CSP and Landing hydration errors.
- [Release](https://github.com/proyecto-viviana/ui/actions/runs/37947491299)
  is skipped. Historical RC0 delivery does not qualify the current repairs.

## Selected plan

The existing ticket tree supplies the implementation slices and acceptance.
The selected queue follows the
[#547 checkpoint](../.claude/tickets/tasks/547-publish-the-solid-2-rc-to-the-rc-dist-tag.md#owner-pause-checkpoint--2026-10-09),
with the owner's current publication boundary:

1. Establish fresh supported OS/herdr custody and the serialized runtime slot.
   Resolve publication control before any green candidate push.
2. Qualify applied Calendar #533, FocusScope #645, ActionButton/Badge #537,
   and TagGroup #542. Preserve complete owning suites and independent review.
3. Complete Slider #74/#76 integration and proof; diagnose Landing #648;
   qualify CSP #90, Breadcrumb #429, Table #646, and installed consumer repairs.
4. Execute approved existing-dependency remediation #647 and its five probes.
   Qualify actual installed and packed consumers before the full gate run.
5. Integrate accepted ticket slices and changesets; regenerate/check views.
   Run static/build/package, complete SSR then hydration, browser, and
   certification qualification. The target is zero failures, skips, and waivers.
6. Obtain green Certification, Readiness, and Site at the final identical SHA.
   Record local packed-consumer proof and the RC readiness handoff.
   Keep versions unchanged and leave #547 publication unfinished.

One GPT-6.1 Sol medium source worker per editing session was selected.
Read-only preparation and independent review can run beside that worker.
The conductor accepts exact source and proof, then takes the commit handoff.
The supported launch and commit routes are
[agent launch](../../vivianastack/docs/procedures/agent-launch.md) and
[ticket execution](../../vivianastack/docs/procedures/ticket-execution.md).

## Unresolved publication choice

Release automatically invokes the publisher after same-SHA green evidence.
Pending notes do not prevent that invocation. Historical RC0 versions suggest
a no-op, but static inspection cannot guarantee the current registry plan.
The owner was asked to choose manual-only Release for this phase, or local-only
qualification with automation unchanged. No answer was received at this receipt.
No candidate push, version stage, publication, or deployment was performed.

## Checks

`eligibility-view --root . --check` passed from the ecosystem root.
`git diff --check` passed before this receipt.
The required ecosystem gate first hit sandbox subprocess restrictions.
Its approved rerun completed: 36 of 38 gates passed. Document-shape and link
checks fail on existing public-face worktree links, including `../AGENTS.md`.
No product test, build, install, or source-worker runtime started in grounding.

## Subsequent owner scope decision

After this receipt was written, the owner selected:

> Keep Release automation unchanged; end this goal at local qualification
> without pushing a green candidate.

That decision supersedes the pending publication choice and the remote green
acceptance in plan steps 1 and 6. The active execution goal now ends with an
exact-source candidate qualified through the local release-readiness,
certification, site, and packed-consumer checks, plus a reviewable handoff.
Release remains unchanged. Do not push a candidate, stage versions, publish,
or deploy. Local qualification is evidence for repairing main; it does not
establish that remote main is green. Keep remote green and publication work
explicitly outstanding in #547.

The remaining implementation queue, worker policy, and fresh runtime custody
requirements still apply. No additional scope answer is required to begin
the local work.

## Subsequent owner runtime-slot decision

The owner approved one heavy-runtime slot for this UI conductor and one for
VisualMode main, usable concurrently. This supersedes global serialization in
the original goal wording and plan step 1. The authoritative shared rule is
[hub AGENTS.md](../../AGENTS.md#heavy-runtime-slots); #547 records its effect on
UI admission. Each slot still serializes its own heavy invocations and requires
verified predecessor closure. Source-worker custody and writer ownership remain
required. The local-only publication boundary above still applies.

## Subsequent owner execution exception

The owner said: “make an exception don't go through the os just work on this
repo”. This resolves the failed-launch blocker for this repo-local RC goal.
Direct GPT-6.1 Sol medium workers may implement and run proof. The local UI
AGENTS.md and #547 record the exception. One source writer, independent
acceptance, the UI runtime slot and local-only boundary remain in force.
The blocked goal's full implementation and qualification scope resumes; no
publication, deployment, candidate push or version stage is authorized.

## Subsequent owner live-release objective

On 2026-10-09 (2026-10-10 UTC), the owner made a green full release the
priority and explicitly selected:

> Complete the live release, including push and automatic publication.

This supersedes the earlier local-only, no-version, no-push and
stop-before-publication boundary. The active objective is to restore green
main, resolve the Solid 2 RC blockers, qualify the complete release candidate,
and complete the existing automatic release with verified registry results.
Release automation remains unchanged. Version preparation must follow the
existing Changesets prerelease policy and approved package matrix.

The conductor continues directly in this repo using GPT-6.1 Sol medium
workers, owns source integration and remote writes, and preserves the
independent UI and VisualMode runtime slots. Existing regressions, native
acceptance, SSR/hydration, complete readiness, certification, site and clean
packed-consumer checks remain required. Qualification precedes the candidate
push; all remote release evidence must refer to the actual final candidate
SHA. Successful workflow completion and the published versions, dist-tags
and package dependency closure must be verified before this goal is complete.
Historical RC0 evidence does not qualify the new release.

The goal service exposes status changes but no objective edit. This owner
addendum records the revised objective while the existing goal remains active.

## Owner overnight continuation — 2026-10-10 UTC

The owner asked the conductor to work autonomously while they sleep. Continue
the live RC release objective above, with direct GPT-6.1 Sol medium workers and
one source writer. No scope question remains pending. If a new owner decision
is needed, prepare a concrete proposal for their return and continue independent
work. Record actual remaining gates and publication evidence without claiming
success for unrun checks.
