---
id: 605
type: task
title: "ActionButton's NotificationBadge takes the group-resolved size where upstream takes the raw prop"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "found while fixing #602's review, receipt `.agents/602-actionbutton-form-disabled-2026-09-21.md` under *What this receipt does not prove*. `packages/solid-spectrum/src/button/ActionButton.tsx:374-382` builds `NotificationBadgeContext` with `get size() { const currentSize = size(); return currentSize === 'XS' ? undefined : currentSize; }`, and `size()` is `local.size ?? 'M'` (`:206`) — the group-resolved size with an `M` floor. Upstream is `size: props.size === 'XS' ? undefined : props.size` (`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:431`), the raw prop: `size` is a separate local from the group destructuring (`:347`), and the group publishes only `ActionButtonGroupContext` (`ActionButtonGroup.tsx:130`), which `useSpectrumContextProps` does not read. So upstream leaves the badge's own `size = 'S'` default (`NotificationBadge.tsx:132`) standing on a plain ActionButton and inside an `ActionButtonGroup size=...`, where ours passes `M` and the group's size. Read from source, not measured: a badge inside an ActionButton also carries the context's positioning `styles`, so its atom string differs from a bare badge's whatever the size — proving this needs a pair render against the upstream oracle, not a class comparison. Pre-existing, older than #602; no test covers badge size inside a button",
    }
---

## Scope

Mirror `@react-spectrum/s2@1.7.0/src/ActionButton.tsx:431`: the
`NotificationBadgeContext` `size` is the button's own `size` prop after
`useFormProps` — the proxy, not the group-resolved `size()` and not the `M`
floor. Only that one getter in
`packages/solid-spectrum/src/button/ActionButton.tsx`. Non-goal: the
`isDisabled` and `staticColor` getters beside it, which #602 settled against
the same upstream lines.

## Done when

A badge inside a plain `<ActionButton>` renders at `S`, a badge inside
`<ActionButtonGroup size="L"><ActionButton>` renders at `S`, and an explicit
`<ActionButton size="L">` still renders its badge at `L` — each proved against
the upstream pair, since the atom string alone cannot separate size from the
context's positioning styles.

## Proof

A pair-oracle case in `apps/comparison`, or a test that reads the rendered
badge geometry rather than its class. Say which, and show the case failing on
the current source first.

## Relationship

Child of #544. Residue of #602's review, recorded in
`.agents/602-actionbutton-form-disabled-2026-09-21.md`.
`packages/solid-spectrum` is published, so a behaviour change here owes a
changeset.
