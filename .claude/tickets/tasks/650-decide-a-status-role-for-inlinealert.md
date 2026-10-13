---
id: 650
type: task
title: "Decide a status role for InlineAlert"
created: 2026-10-12
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Follow-up of #640: VisualMode D25 asks for a notice that does not interrupt; needs an owner decision on a public name.",
    }
  - {
      state: merged,
      at: 2026-10-12,
      note: "Owner chose 1: role alert or status on the ui InlineAlert only. Verification waits on VisualMode replacing its two plain panels.",
    }
---

## Scope

VisualMode needs a notice with the InlineAlert look that a screen reader
announces politely (`role="status"`), for the World light overflow notice and
the Project backup notice (VisualMode #10153, #10226). Pinned S2 InlineAlert
fixes the role to `alert`, and #640 proved both local twins match it. Anything
here is an extension past upstream and a public name, so the owner chooses.

The choices:

1. `@proyecto-viviana/ui` InlineAlert takes `role?: "alert" | "status"`,
   default `alert`. `solid-spectrum` stays a mirror of S2.
2. Both styled packages take the prop.
3. A separate status component with the same look.
4. No extension. VisualMode keeps its plain panels.

Recommendation: 1. It is one prop on the skin the product owns, it changes no
default, and it leaves the S2 mirror exact. `aria-label` and `aria-live` stay
out: `role="status"` already implies a polite live region, and the heading
labels the notice.

No dependency, no change to `solid-spectrum`, no consumer edit.

## Done when

The owner has picked one choice. For 1 to 3: an InlineAlert, or the new part,
rendered with the status role is found by `getByRole("status")` and not by
`getByRole("alert")`, the default stays `alert`, and the role follows a
reactive prop. For 4: this ticket is dropped with the owner's reason.

## Proof

Owning tests in the styled package that gains the prop, replacing the
fixed-role assertion from #640 only where the choice changes it. A patch
Changeset for that package.

## Relationship

Child of #24. Follow-up of #640. Producer for VisualMode #10153 and #10226.
Request:
`visualmode/visualmode/.agents/ui-requests-2026-10-07/D25-inlinealert-takes-only-the-role-alert.md`.

## Decision and proof — 2026-10-12

Owner: choice 1. `packages/viviana-ui/src/inlinealert/index.tsx` declares
`role?: "alert" | "status"` and writes `status` only for that value, so any
other role still renders `alert`. `solid-spectrum` is unchanged and keeps the
#640 fixed-role case.

`packages/viviana-ui/test/InlineAlert.test.tsx`, two cases: the default is an
alert that drops a caller label and live region; `role="status"` is found by
`getByRole("status")` and not by `alert`, and follows a signal back to
`alert`. The second case fails on the source before this change.

```bash
vp test run packages/viviana-ui/test/InlineAlert.test.tsx
```

Patch Changeset `.changeset/ui-inlinealert-status-role.md`.
