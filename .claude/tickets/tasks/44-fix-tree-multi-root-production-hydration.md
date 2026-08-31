---
id: 44
type: task
title: "Fix styled collection production hydration"
created: 2026-08-20
parent: 32
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task tree-multi-root-hydration" }
  - {
      state: open,
      at: 2026-08-20,
      note: "expanded after the Glasselated plan audit found the same unported fixes in solid-spectrum Tree and GridList",
    }
---

Fix the production hydration failures in the styled Tree and GridList layers.

## Evidence and hypothesis

The route sweep reproduced the failure twice. Development rendering works, but
the production build throws while walking `nextSibling` and replaces the page
with the error boundary. A wrapper around `Tree` prevents the failure.

The `viviana-ui` implementation has three fixes with focused SSR and hydration
tests:

- It does not construct an unused framed collection branch during hydration.
- Static GridList items register during render, and the item accessor is not a
  server-frozen memo.
- Tree and GridList read a `children` prop once before they inspect or render it.

The matching `solid-spectrum` source does not have these fixes. This is not an
S2 styling difference. It is a Solid rendering difference that affects
installed SSR consumers. Confirm each failure against a production build before
copying the applicable structure.

## Scope

- Prove the Tree-with-sibling failure and each affected GridList/Tree children
  form in `solid-spectrum`.
- Compare the current `viviana-ui` fixes with Solid's hydration rules.
- Keep the public S2 API and computed styling unchanged.
- Ask the owner before changing the parity-locked implementation boundary.
- Add SSR, hydrate, post-hydration interaction, and production-route evidence.
- Remove any temporary wrapper only after the unwrapped route passes.

## Done when

Both styled packages produce stable Tree and GridList markup. Static and dynamic
collections hydrate without a mismatch, retain their items, and respond after
hydration. The production route sweep passes without the temporary Tree wrapper.

## Relationship

Replaces `tree-multi-root-hydration` from the retired debt ledger and preserves
the `solid-spectrum` collection gaps from the former Glasselated port plan.
Ticket #102 owns the separate first-paint slot-styling problem.
