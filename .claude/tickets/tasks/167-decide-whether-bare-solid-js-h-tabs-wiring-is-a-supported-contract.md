---
id: 167
type: task
title: "Decide whether bare solid-js/h Tabs wiring is a supported contract"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: merged,
      at: 2026-09-01,
      note: "recorded as an upstream limit; keep it.fails; compiled JSX / hc is the supported path; patterns.md documents it",
    }
  - { state: verified, at: 2026-09-01, note: "owner 2026-09-01" }
---

## Cause

`it.fails("bare solid-js/h fixture wiring zombies the tab DOM")` keeps the
suite green while the named behavior is broken. Adjacent tests prove the `hc`
workaround.

## Decision

Owner 2026-09-01: documented upstream limit, not a Tabs defect. Keep
`it.fails`. Do not count it as Tabs evidence. The supported contract is
compiled JSX, and `hc` inside the comparison harness. Bare `h` is out of
envelope.

## Done when

The decision is recorded on this ticket.

## Relationship

F-TEST-012. Owner decision. See `.claude/reference/patterns.md`.
