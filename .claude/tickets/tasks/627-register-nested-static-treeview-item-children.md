---
id: 627
type: task
title: "Register nested static TreeViewItem children"
created: 2026-10-08
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode T6. Source-confirmed on local main and in 0.8.0-rc.0. No red test. Static TreeItem returns null before nested children mount, and treeItemFromStatic copies no children. The data form keeps hierarchy, so visualmode is not blocked. Do not close as unreproduced.",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "A static TreeViewItem nested inside another static TreeViewItem mounts as a child row. The two-sibling static test still passes, and the dynamic items path is unchanged.",
    }
---

Nested static `TreeViewItem` children never become rows. A `TreeView` with
no `items` takes the static path (`usesStaticChildren`). Each `TreeItem`
registers itself and then `return null` while `StaticTreeCollectionContext`
is set (`packages/viviana-ui/src/tree/index.tsx` around line 962, and the
solid-spectrum copy). The nested item never mounts, so it never registers.
`treeItemFromStatic` copies id, key, value, textValue, isDisabled, and
hasChildItems, and does not copy children.

The dynamic path is a different code path. `items` plus a render function
walks `item.children`, so hierarchy survives. Visualmode uses that data form
and is not blocked. There is no failing test: `supports static TreeViewItem
children` in `packages/solid-spectrum/test/Tree.test.tsx` renders two sibling
rows only.

Seen on visualmode mock-up pages with `0.8.0-rc.0`. The same early return is
on local main. Do not close this as unreproduced, and do not claim a red
test that does not exist.

## Done when

A static `TreeViewItem` nested inside another static `TreeViewItem` mounts as
a child row, and the existing two-sibling static test still passes. The
dynamic `items` path stays the one visualmode already uses.

## Relationship

Child of #24. From visualmode T6. Nothing in visualmode waits on it. Lower
than #624, #329, #84, #625, and #626.

## Bounded typing qualification — 2026-10-08

Original runtime implementation remains verified. Conductor admitted the sole
SOURCE implementer at base `3a4bed87e4bcea183b57fd1b70336cbacea896c1`,
generation `210d9018-65b4-48df-9d13-67206ae658f3`. Prior #84 generation is
owned-stopped. Codex astra low is the authorized fallback for recorded Grok/AGY
quota failures. This qualification narrows only the static probe insertion in
the two styled Tree sources, adds row-state and UI nested-static proof in the
two admitted suites, and regenerates status/roadmap. No public API or runtime
change, new Changeset, commit, push, or publish is admitted. Independent review
and conductor exact-generation stop remain pending. Evidence is under
`/tmp/ui-627-evidence-2026-10-08`.

Qualification result: root compiler diagnostics fell from 23 (8 package, 15
script) to 21 (6 package, 15 script), removing only the two static-probe
TS2322 errors. Both probes capture children once inside the parent context,
mount static JSX, and leave functions for real row-state evaluation. No cast,
fabricated props, or public signature change. The new tests retain visible
selected/expanded/collapsed text and matching ARIA, validate real render props,
and prove single nested-static UI registration. Keyboard Space is the selection
trigger; it is not proof of pointer selection. Existing Spectrum static siblings,
three levels, and dynamic direct-item fields remain covered.

The ordinary four-suite run is not green: 41/42 pass, with the unchanged UI
rename `commits on blur` failing on both original and patched sources. SSR (1)
and fresh-output hydration (2) pass. Scoped format/lint pass. Final logs,
compiler controls, restoration hashes, artifact identities, and exact counts
are in the evidence directory; independent review and owned-stop are pending.

Separately identified runtime debt: the draft mounted function-child tests'
ordinary label-span pointer selection left both text and `aria-selected` false
on original and patched sources. This is not an invalid contract: an ordinary
nested label is an allowed closest-row press target. Keyboard proof does not
resolve this observation. Minimum separately admitted diagnosis: use the two
owning styled Tree test files to compare selection callbacks, native event
target/modality, focus, ARIA, and row/checkbox/label controls. Trace read-only
through `solidaria/src/selection/createSelectableItem.ts` and
`solidaria/src/tree/createTreeItem.ts`; no lower-layer repair is established or
admitted. If selection changes but text does not, inspect the styled Tree
row-state evaluation. Otherwise diagnose the event/selection boundary first.

The blur failure's cause remains unqualified: distinguish a replaced or
unfocused captured input, lost TextField blur forwarding, and TreeRenameField's
row-focus suppression/disposal guards. Minimum proposed additional test scope
is `packages/viviana-ui/test/Tree.rename.test.tsx`: assert the same connected,
focused input after input dispatch, move focus outside, and observe native blur,
callback, editor removal, and no restored row focus. That path stays readonly
in this dispatch. Any repair requires separate admission after cause isolation;
possible owners are the UI Tree rename handler or the TextField/focus chain.
No runtime repair or Changeset is included here.
