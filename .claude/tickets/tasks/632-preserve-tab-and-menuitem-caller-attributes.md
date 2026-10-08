---
id: 632
type: task
title: "Preserve Tab and MenuItem caller attributes"
created: 2026-10-08
parent: 24
priority: high
status: next
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner requested reproduction, tested repair, and release reporting for Visualmode's October requests.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queued with the top Visualmode consumer work before the next RC, following active source work and qualification blockers.",
    }
---

## Scope

UI owns Visualmode D18: Tab drops caller data attributes and MenuItem drops
caller aria-haspopup/aria-expanded on 0.8.0-rc.0. Confirm pinned RAC DOM filtering
and MenuItem/useMenuItem context composition before fixing the lowest owner.
Preliminary source inspection shows upstream DOES forward caller popup ARIA
with caller precedence; declining that forwarding as beyond upstream is not
supported by this pin. Use SubmenuTrigger for managed cascades. Name exact
source/test paths before dispatch. No new cascade API or consumer edits.

## Done when

Caller data/global attributes reach role=tab and update/remove reactively
without remounting; managed identity, ARIA, and state keep upstream precedence.
MenuItem forwards popup ARIA according to upstream, including reactive values
and caller/context precedence consistently in behavior, render props, and DOM.
Ordinary items and SubmenuTrigger keyboard/focus behavior retain their contract.
Each repair has a failing pre-fix regression. Any actual beyond-upstream
extension is declined with evidence as the owner authorized.

## Proof

Run focused Tabs and Menu suites, related hooks, and styled consumption tests.
Cover static/reactive forwarding, ordinary-item absence, managed-state negative
controls, and SubmenuTrigger interactions. Preserve certified Tabs and menu
modality/focus checks. Record actual proof and published fixing versions after
candidate qualification.

## Relationship

Child of #24, prioritized by #87 alongside #631. Producer for Visualmode
#10202; timeline markers currently live on Text and cascades are hand-built.
Source request in the hub:
visualmode/visualmode/.agents/ui-requests-2026-10-07/D18-tab-and-menuitem-drop-attributes.md.
Coordinate with #617 reactive filtering and #534 Menu repairs. Patch Changesets
cover changed owning packages; rollback stays within attribute forwarding.
