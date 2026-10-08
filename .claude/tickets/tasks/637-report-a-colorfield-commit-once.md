---
id: 637
type: task
title: "Report a ColorField commit once"
created: 2026-10-08
parent: 24
priority: high
status: next
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner added Visualmode D22 to the autonomous remaining-work program.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queue equivalent-color commit repair before next RC. Root data attributes match upstream; no inputProps API authorized.",
    }
---

## Scope

UI owns Visualmode D22's repeated ColorField callback. Enter followed by blur
reportedly commits the same color twice. Inspect solid-stately/src/color/createColorFieldState.ts
against pinned useColorFieldState's equivalent-color suppression. Preserve
supported channels, alpha, formats and controlled behavior. Name exact owning
state/hook/headless/styled regression paths before dispatch; no dependencies,
consumer edits or new public props.

The attribute-placement half differs from upstream: RAC ColorField filters
global DOM props onto its root div, as the local headless component does.
Keep that contract. Existing ColorFieldInput can receive its own DOM props;
do not move or duplicate root data attributes or add inputProps silently.
Any new styled input-targeting API requires separate owner steering.

## Done when

Typing a new valid value, pressing Enter and then blurring reports one committed
change. Recommitting an equivalent color adds no change, while a genuinely
different color remains observable. Empty/null, controlled refusal, alpha and
channel edits retain correct semantics. Root attributes remain on the root.

## Proof

Reproduce the repeated callback against inherited source and test exact counts
through state and real field interaction. Compare equivalent spellings and
different supported colors/channels without collapsing meaningful precision or
alpha changes. Verify root and explicit input attributes against upstream.
Run existing candidate gates and report actual published fixing versions.

## Relationship

Child of #24, prioritized by #87 before next RC. Producer for Visualmode
#10163/#10220; CanvasEntryWorldEnvironmentSection currently drops a color equal
to the held value. Source request:
visualmode/visualmode/.agents/ui-requests-2026-10-07/D22-colorfield-reports-twice-and-keeps-attributes-on-its-wrapper.md.
Patch Changeset belongs to the lowest repaired layer; rollback stays in color
commit behavior. Attribute expansion is not part of this authorized repair.
