---
id: 539
type: task
title: "Purge register wording and unbacked counts from the landing page and Button docs"
created: 2026-09-17
status: merged
history:
  - {
      state: open,
      at: 2026-09-17,
      note: "Filed after the fact. The work landed in 226a5d4e and 28539460 without an owning ticket; this ticket records it.",
    }
  - {
      state: merged,
      at: 2026-09-17,
      note: "226a5d4e drops the design-register vocabulary from apps/web/src/routes/index.tsx and removes the stale parity and test counts it advertised, including '2,118 certified parity checks'. 28539460 replaces register with theme in the viviana-ui Button comments, its docs route, and Buttons.geometry.test.tsx.",
    }
---

Drop the "design register" vocabulary from public surfaces, and remove
the parity and test counts the landing page advertised without a runnable
proof behind them.

## Scope

- `apps/web/src/routes/index.tsx`
- `apps/web/src/routes/viviana-ui/docs/components/button.tsx`
- `packages/viviana-ui/src/button/Button.tsx`,
  `packages/viviana-ui/test/Buttons.geometry.test.tsx`
- Wording and counts only. No component behavior, no styling.

## Done when

No public surface says "register" for a theme, and the landing page
states no parity or test count that a check in this repository does not
produce.

## Relationship

The counts it removed are the same class of claim #194 is ratcheting:
the certified-suite postcard is stale, so any number derived from it is
unbacked until #194 lands. Removing them from the landing page does not
close #194.

## Proof

Working directory: `ui`.

| Kind   | Command                      | Result                                                                      |
| ------ | ---------------------------- | --------------------------------------------------------------------------- |
| source | `git show 226a5d4e 28539460` | 4 files; wording and counts only                                            |
| local  | `pnpm run check`             | exit 0; 4258 files formatted, 0 lint findings in 3111, `tsc --noEmit` clean |
