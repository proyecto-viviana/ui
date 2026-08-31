---
id: 131
type: task
title: "Support static Meter labels during hydration"
created: 2026-08-20
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "found while adding the headless hydration evidence for #130",
    }
---

A headless Meter hydrates when a render child creates its Label. This is the
path that the styled Meters use. A direct static Label renders correctly on the
server and in a client-only render, but it causes a hydration-key mismatch.

The focused probe failed while the client expected the default `label` element
and the server contained the Meter context's `span` element. A custom Provider
wrapper did not change the result. This indicates an ownership or evaluation
order problem, not a missing context value in normal rendering.

## Done when

- A direct `<Meter><Label>…</Label></Meter>` child hydrates over server markup.
- The label remains a `span` with the ID used by `aria-labelledby`.
- The render-child path remains green.
- A focused regression test fails if either path changes.

## Relationship

Ticket #130 owns the shared Label context and the styled Meter migration. This
ticket owns only the direct-static-child hydration branch.
