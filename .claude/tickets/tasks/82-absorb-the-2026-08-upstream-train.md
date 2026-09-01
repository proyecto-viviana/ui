---
id: 82
type: task
title: "Absorb the 2026-08 upstream train"
created: 2026-08-20
parent: 34
status: in-progress
history:
  - { state: next, at: 2026-08-20, note: "migrated from legacy task upstream-train-2026-08" }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "pins and classification are complete; confirmed behavior gaps remain",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "moved every remaining Train 8 branch from the release ledger to durable tickets",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "triaged the refreshed test oracle; mapped missing suites and Meter label composition to tickets",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: dropped verified remaining-branch rows #108, #122, #17, and #18",
    }
---

Absorb React Spectrum S2 1.6.0 and React Aria Components 1.20.0 after the
qualified release train is resolved.

Work the release notes, source diff, official documentation, and upstream tests
as a separate parity change. The 2026-08-09 freshness checkpoint was beyond the
then-pinned S2 1.5.1 and RAC 1.19.0 oracles; verify current pins first.

## Current evidence

The Adobe oracle and dependencies now align to commit
`5ecb3333001313e83898cd07644227897e3bae1f`: S2 1.6.0, React Aria Components
1.20.0, `react-aria` 3.51.0, and `react-stately` 3.49.0. Kumo is 2.11.0.
Train-8 tickets T-61 through T-99 are classified, and no `?` state remains.
The refreshed test oracle also confirms open suite gaps for PreviewTrigger,
TokenField, and SideNav. Ticket #130 owns the Meter child-label relationship.

## Remaining branches

Work these tickets in dependency order. Pin alignment and export presence are
not behavior absorption.

| Upstream item | Repository ticket                       |
| ------------- | --------------------------------------- |
| T-62          | #109 — FileTrigger and DropZone focus   |
| T-63          | #110 — fractional Table width           |
| T-64          | #111 — virtual pointer detection        |
| T-68, T-88    | #84 — drag-and-drop subsystem           |
| T-70          | #112 — Table resize lifecycle           |
| T-71          | #113 — Dialog overlay id                |
| T-72          | #114 — Virtualizer item observation     |
| T-73          | #115 — multiple ComboBox value contract |
| T-77          | #116 — Tree Checkbox context            |
| T-80          | #117 — PreviewTrigger                   |
| T-82          | #118 — TokenField                       |
| T-84          | #119 — Firefox date-segment focus       |
| T-85          | #120 — platform detection               |
| T-87          | #89 — TableView structure decision      |
| T-89          | #121 — Switch field positioning         |
| T-92          | #123 — global scroll across Shadow DOM  |
| T-94          | #124 — empty TextArea height            |
| T-95          | #125 — Select generics                  |
| T-96          | #126 — SideNav                          |
| T-99          | #127 — Adobe prose surface              |

Verified and dropped from this table: #108 (T-61), #122 (T-90), #17 (T-83),
and #18 (T-93). Keep the Table structure decision in #89. Work shared lower
layers before styled consumers. Run the browser-only cases in their required
engines and mobile environments.

## Done when

The train is classified and absorbed under the upstream-sync playbook, every
ticket above is verified, pins
and oracles match the selected upstream commit, and all required parity gates
pass.

## Relationship

Replaces `upstream-train-2026-08` from `.claude/current/tech-debt.md`. GitHub
issue #23 holds the original external scope.
