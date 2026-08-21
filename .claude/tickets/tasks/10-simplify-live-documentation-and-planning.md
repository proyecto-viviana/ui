---
id: 10
type: task
title: "Simplify the live documentation and planning system"
created: 2026-08-20
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the latest-work and documentation organization review",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "fixed the first acceptance-report defect and recorded the full document classification",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "confirmed the declared ticket authority and documented the current admin conflict",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "completed the repository-wide documentation census and ticketed latest-work risks",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "owner confirmed the ticket board and admin projection architecture; implementation started in #12",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "cut over /admin, migrated active task state, generated work views, and started the retained-doc rewrite",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "reduced the live current-doc surface to stable references and generated views, with all open audit work on the ticket board",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "validated the simplified operating surface, ticket board, generated views, admin tests, web typecheck, and pinned upstream oracle",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "verified the task authority, reduced live docs, Simplified English pass, generated evidence, contract checks, and admin projection",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "closed the documentation reorganization after all focused organization tickets passed; follow-up engineering gaps remain in their owning tickets",
    }
---

The repository had multiple sources for work state, volatile results, and
completed history. This ticket coordinates the focused cleanup tasks. It does
not replace them.

## Current outcome

- Ticket #12 verifies `.claude/tickets` as the only writable work-state source.
- Ticket #13 verifies the 13-file live documentation surface.
- Ticket #14 generates work views and structured WCAG evidence.
- Ticket #15 verifies the Simplified English–aligned retained prose.
- Ticket #16 enforces the live set, index, links, statuses, and plan boundary.
- Ticket #21 fixed the scheme-relative prop-table link boundary.
- Ticket #36 verifies the ticket-backed `/admin` projection and editor.
- Git history stores retired plans and completed operational records.
- Ticket #19 owns the attribution plan that formerly lived under public
  `docs/`.

## Next work

The documentation reorganization is complete. Continue the engineering work in
this order:

1. Complete the acceptance evidence model in #11.
2. Prove the behavior gaps in #17, #18, and #20.
3. Resolve source-map evidence in #22.
4. Audit built JSX refs in #23.
5. Continue attribution work in #19 after the owner decisions recorded there.

Keep status and execution evidence in the owning ticket or generated report.
Do not add a second planning surface.

## Done when

- One short operational surface identifies the current state and next action.
- One structured task source owns work state.
- Stable references do not repeat volatile status facts.
- Completed plans and logs do not remain in the live documentation surface.
- Retained prose is STE-aligned and preserves technical meaning.
- Executable checks enforce the documented organization.

## Relationship

Coordinates #11 through #23. Existing tickets #1, #3, #4, #5, #6, and #9 keep
their current scope.
