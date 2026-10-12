---
id: 640
type: task
title: "Qualify InlineAlert ARIA and status request"
created: 2026-10-08
parent: 24
priority: high
status: merged
history:
  - { state: open, at: 2026-10-08, note: "Owner added Visualmode D25." }
  - {
      state: next,
      at: 2026-10-08,
      note: "Prove existing ARIA and fixed-role contracts; status extension needs a product decision.",
    }
  - { state: in-progress, at: 2026-10-12 }
  - {
      state: merged,
      at: 2026-10-12,
      note: "Both styled InlineAlerts carry the fixed-role proof; D25 is a request past upstream, and the status choice waits on the owner in #650.",
    }
---

## Scope

UI owns D25 classification and regression proof in both styled InlineAlerts.
Pinned S2 fixes role to alert and uses default DOM filtering, which excludes
caller labeling and aria-live; local twins match this runtime contract.
Their broad JSX declaration accepts these props syntactically but does not
make them effective. Prove and record this distinction before any extension.
Name exact paths before dispatch. A real supported-attribute failure permits
separately admitted parity repair. No role override, Status export, dependency
or new styling product is authorized.

## Done when

Both siblings have runnable caller label/live and pinned-role proof. Each
allegation has a source-grounded disposition. Present a concrete status
extension choice for owner decision and record its follow-up; do not silently
ship a public extension or call existing fixed-role parity a defect.

## Proof

Use owning tests with explicit role, label and live-region assertions, reactive
attributes where supported, and pinned S2 comparison. Save an old-source failure
only for a real parity repair. Run applicable checks. Proof-only classification
has no product Changeset or invented fixing release; a forwarding repair needs
normal publication and installed-consumer proof.

## Relationship

Child of #24, queued by #87. Producer for Visualmode #10153/#10226.
Request: `visualmode/visualmode/.agents/ui-requests-2026-10-07/D25-inlinealert-takes-only-the-role-alert.md`.
Verified #177 distinguishes the existing headless Alert and forbids minting a
second Alert or folding it into S2 InlineAlert/AlertDialog. Do not claim existing
Alert supplies status without proof. Future extensions need owner-steered scope.
The earlier `/tmp/ui-D25-D26-triage-2026-10-08.md` forwarding claim used
the wrong helper. Corrected import-chain evidence and executable proof plan:
`/tmp/ui-640-worker-2026-10-08.md`. Both twins import the solidaria filter,
whose default accepts id/data without labelable attributes. No product
repair, fixing release or status extension is claimed by this correction.

## Disposition — 2026-10-12

D25 makes three allegations. Pinned S2 `InlineAlert.tsx` spreads
`filterDOMProps(props)` with no options and then writes `role="alert"`; both
local twins do the same through the solidaria filter.

| Allegation                               | Finding                                                                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| The role is always `alert`               | True, and it is the pinned S2 contract. Not a defect.                                                                                  |
| A caller `role` is dropped               | True. The fixed `role="alert"` is written after the filtered props.                                                                    |
| `aria-label` and `aria-live` are dropped | True. The default filter passes `id` and `data-*` only; labelable attributes need `labelable: true`, which upstream does not set here. |

No supported attribute fails, so there is no parity repair, no Changeset and no
fixing release. `packages/solid-spectrum/test/InlineAlert.test.tsx` and
`packages/viviana-ui/test/InlineAlert.test.tsx` each render an InlineAlert with
`role="status"`, `aria-label`, `aria-live`, `id` and a data attribute, and
assert that the root is the only `alert`, that no `status` exists, that the
label and live-region attributes are absent, and that `id` and the data
attribute arrive:

```bash
vp test run packages/solid-spectrum/test/InlineAlert.test.tsx packages/viviana-ui/test/InlineAlert.test.tsx
```

Two files, five cases, all pass. `packages/viviana-ui` had no InlineAlert test
before this.

A notice that must not interrupt is a request past upstream. #650 holds the
choice for the owner. VisualMode keeps its two plain panels (#10153, #10226)
until that is decided.
