---
id: 159
type: task
title: "Call Solid EventHandlerUnion without unknown double casts"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-09-25,
      note: "shared callEventHandler and SolidEventHandlerUnion across solidaria-components without double casts",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "D18 review found a receiver mismatch in the shared dispatcher and requires bounded consolidation of the private Tab adaptation.",
    }
---

## Cause

`createRadioGroup` / `createRadio` already type props as Solid JSX
attributes. RadioGroup still double-casts to a single-function handler
because `EventHandlerUnion` includes the bound-tuple form. ComboBox extracted
`callInputKeyDown`; ContextualHelpTrigger extracted `callHandler`. RadioGroup
alone has 26 inline casts.

## Work

Share one typed EventHandlerUnion caller at the RAC layer.

## Done when

RadioGroup, Checkbox, DateField, DatePicker, and TimeField do not
`as unknown as` those handlers.

## Relationship

F-TS-010.

## Round-2 note (2026-09-01)

New evidence: the two extracted callers disagree on Solid's bound-tuple order. Installed `BoundEventHandler` is `{0: fn, 1: data}`; ComboBox does `handler[0](handler[1], e)` (correct), ContextualHelpTrigger does `handler[1].call(handler[0], e)` (inverted, throws on a real bound tuple). One shared typed caller fixes the inversion.

## Reopened consolidation — 2026-10-08

#632 uses bare bound-handler invocation in its local Tab adapter
because the existing shared components helper invokes the tuple member with
the tuple as its receiver. The aria private helper already uses bare invocation.
This is recorded duplication debt under the hub's never-third-copy rule.

Before a separately registered source slice, admit exact shared helper and
owning test paths. Consolidate the components dispatcher and Tab adaptation
using the already exported helper and retaining its public types. Qualify normal functions,
canonical [fn, data] tuples including undefined data, the local adapter's undefined receiver,
original event identity, EventListenerObject method receiver, callback removal
and consumer event order. Inspect the existing inverted-tuple compatibility
branch before deciding its scope; do not silently remove supported behavior.
Run all actual dispatcher consumers and preserve #632 caller-before-managed
and caller-onClick exclusion. Existing cast cleanup remains historical proof;
this reopening does not invalidate or reimplement it.

Independent inspection: `/tmp/ui-632-final-review-2026-10-08.md`. No shared
helper repair or passing consolidation tests are claimed yet.

## Registered implementation — 2026-10-08

Owner-authorized Codex gpt-6-astra LOW fallback after saved Grok/AGY quota
failures. Base `24442a1c180fef437e3e31ffff315efc4f9956d9`; generation
`cd172a71-13b6-4483-8946-ca7446486c6a`, registration
`/tmp/ui-159-registration-2026-10-08.json`. Preceding #630 generation closed.
Eligibility check passed before edits. Conductor reviews, owned-stops and
integrates; worker never commits.

Exact admission: `packages/solidaria-components/src/utils.tsx`,
`packages/solidaria-components/src/Tabs.tsx`,
`packages/solidaria-components/test/utils.test.tsx`,
`packages/solidaria-components/test/Tabs.test.tsx`,
`.changeset/receiver-safe-event-dispatch.md`, this ticket, and generated
`.claude/current/status.md` / `.claude/current/roadmap.md` through their generator.
All other repository paths are read-only, including #632 and attribution metadata.

Solid establishes [fn, data] order; its pinned native DOM runtime binds the
DOM node as receiver. This is a deliberate public adapter correction from
tuple receiver to undefined, not universal Solid bare-call parity. Preserve
inverted compatibility with canonical-first precedence and object method receivers.
Historical cast-cleanup proof above remains valid. Under #547, deduplicate
release notes for this correction; keep #534 tuple-order and #632 forwarding
behavior claims distinct.

## Implementation proof — 2026-10-08

Extracted canonical and inverted callbacks before invocation; canonical wins
when both entries are callable. Tabs now uses the shared helper at both sites,
retaining live caller reads, caller-before-managed order, hover/managed props
and caller-onClick exclusion. Existing Tabs integration test remains unchanged.

Pre-fix focused run: 8 receiver failures, 131 passes; exact data/event and once
assertions precede receiver assertions. All six mutable/readonly/indexed cases
(object and undefined payload), canonical-first and inverted receivers failed.
Plain-function and object-method controls passed. Old Tabs passed; it is direct
integration coverage, not a causal negative control. Final focused: 139 passed;
all nine named consumer suites: 541 passed. Scoped formatting and lint passed.

Canonical typecheck exits 2 with 15 diagnostics in unedited scripts. Package
attribution guard passes; attribution-header guard exits 1 for other listed
files (no utils/Tabs mismatch). Metadata remains read-only for #19. Hub audit
exits 1 (13/38 checks failed, including sandbox child-process EPERM). Worker gh
read exits 4 because local authentication is absent. No browser, build, release
or full certification qualification; #19 final hashes and G17 builds remain.

Raw commands, cwd, exits and logs: `/tmp/ui-159-evidence-2026-10-08/`.
Handoff: `/tmp/ui-159-worker-result-2026-10-08.md`. Ticket stays open pending
independent conductor review, exact-generation stop and integration.
