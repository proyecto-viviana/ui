---
id: 636
type: task
title: "Deliver a child Button press to FileTrigger"
created: 2026-10-08
parent: 31
priority: high
status: next
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner added Visualmode D21 to the autonomous remaining-work program.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queue FileTrigger composition with the top next-RC Visualmode defects; no new public responder API authorized.",
    }
---

## Scope

UI owns Visualmode D21. A Button inside FileTrigger reportedly does not click
the hidden file input. Current headless FileTrigger handles press on a wrapper;
pinned RAC supplies PressResponder to its child. Determine the smallest repair
through existing private composition and Button context while preserving
documented child contracts. Name exact FileTrigger, existing composition and
regression paths before dispatch. No new public responder, dependency or
consumer edits; request an owner decision before any new public surface.

## Done when

A child Button opens the file input once for pointer, Enter and Space presses.
The child's own handler runs once. Disabled behavior, selecting the same file
again, input click propagation and supported custom/raw children remain correct.

## Proof

Reproduce a real headless/styled Button inside FileTrigger against inherited
source. Spy on actual hidden input click with exact counts and exercise the
existing file selection contract. Use native browser proof where required for
composition; synthetic input clicks do not prove an OS dialog appeared.
Qualify the candidate and report actual published fixing versions.

## Relationship

Child of #31, prioritized by #87 before next RC. Producer for Visualmode
#10163, whose CanvasEntryFileField and Assets dock click an input manually.
Related #631 press count and #557 native focus proof remain separate owners.
Source request: visualmode/visualmode/.agents/ui-requests-2026-10-07/D21-button-in-filetrigger-opens-no-dialog.md.
Patch Changeset belongs to the repaired headless layer; no consumer workaround
removal before installed release verification.
