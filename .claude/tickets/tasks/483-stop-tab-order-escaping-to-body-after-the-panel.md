---
id: 483
type: task
title: "Stop tab order escaping to body after the tab panel"
created: 2026-09-06
parent: 24
status: open
history:
  - { state: open, at: 2026-09-06, note: "VUI-003, reproduced by an installed consumer against 0.6.2 and 0.6.3 and still present in main source; the other six ledger entries were re-audited at the same time and three are already fixed here" }
---

`createTabPanel` makes the panel a tab stop unconditionally, so Tab from the
tab list lands on the panel and the next Tab leaves the widget entirely
instead of reaching the panel's own first control.

## Cause

`packages/solidaria/src/tabs/createTabs.ts:598-599` returns a literal
`tabIndex: 0`. The comment directly above it describes the ARIA APG rule — the
panel is only a tab stop when it holds no tabbable child — but the code never
implements the condition. This is byte-identical to what shipped in
`@proyecto-viviana/ui@0.6.3` (tag `0f1e1198`); 317 commits on `main` have not
touched it.

Three ledger siblings were re-audited on 2026-09-06 and need no work here:
VUI-001 was fixed by `842cfdc5` (`createTabs.ts:331-336` moves focus
synchronously in the keydown handler) and VUI-006 by `abafbd4d`. Both carry
named passing tests. This entry did not move.

## Work

- Port a `createHasTabbableChild` primitive into `packages/solidaria`. Check
  what the repo already has before adding one — the tabbable/focus-scope
  helpers under `solidaria` may already expose the query.
- Change `createTabPanel` to take a panel-element accessor and return
  `tabIndex: hasTabbableChild() ? undefined : 0`.
- Wire the `ref` at every call site, since the primitive now needs the element:
  `packages/viviana-ui/src/tabs/index.tsx:1262` and `:1338`,
  `packages/solidaria-components/src/Tabs.tsx:716` and `:766`,
  `packages/solid-spectrum/src/tabs/index.tsx:1041` and `:1124`.
- Cover both directions in a package test: a panel with a focusable child must
  not be a tab stop, and an empty panel must stay one. The child must be able
  to appear *after* mount — a panel that gains its first control later has to
  drop out of the tab order.
- `packages/viviana-ui/test/Tabs.test.tsx` does not exist and must be created.
- Add a changeset. It joins the pending pile; it does not ship by itself.

Stale branch `fix/183-vui-003-tabs-panel-tabindex` holds the shape of this
change at `ffdd3e51`. It is 232+ commits behind `main` and is not mergeable as
a branch; its non-Button hunks still apply. Revive the hunks onto `main`, do
not merge the branch.

## Out of scope

- The Button hunks carried by that same branch. They belong to #486.
- Any change to arrow-key roving (#194's certified `grid-nav` trail, `#482`).
- Versioning or publishing. The release is #448 under #443.

## Done when

Tab from the tab list reaches the panel's first control, not `body`, in a
package test in both public packages, and the empty-panel case still stops on
the panel. A changeset is present.

## Relationship

Child of #24. VUI-003 in the La Frontera consumer defect ledger
(`documentation/development/viviana-ui-defect-ledger.md`); that ledger entry
closes only when a corrected release is consumed, which is #448's business,
not this ticket's. Sequenced by La Frontera's
`producer-release-and-cutover-sequence-2026-09-06.md`. Does not claim that
checkout.
