---
id: 586
type: task
title: "The accent fill is used as ink and fails AA on the landing page, and the error boundary that catches the dead routes fails AA too"
created: 2026-09-21
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "found by the conductor running `vp run a11y:contrast` locally on `eb75ee0e` — the third of the five `ci:site` legs, and the second of them to come back red. The run reached 170 of 174 routes before the harness stopped it for machine memory; six routes had already failed and the tally was complete enough to trace every one to a token. Filed as one ticket because both halves are `apps/web` colour and both block the same gate, but they are two independent causes and the Work section keeps them apart",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "both fixes landed; the closing full 174 run is still owed. Half one: the three ink readers in studio.css (register-card badge, closing mark, hero gradient start) read the existing `--text-link`, 6.24:1 on #202630 dark and 6.25:1 on white light, so no new token name was minted; `interactive-fill` and the fill/ring readers of `--pv-accent-solid` are untouched. Half two: ErrorFallback message reads `--text-secondary`, the button `--interactive-fill` under `--text-on-accent`. Targeted runs, dists rebuilt, VIVIANA_GATE=1 RUN_AXE=1: `/`, `/admin`, `/showcase/inputs`, `/showcase/parity` and `/solid-spectrum/docs/components/combobox` 5 passed. Only combobox still throws, so it alone exercises the boundary. Mutation: badge ink back on the fill fails `/` with 8x [dark] #0a6fef on #202630 = 3.28; message back to #9ca3af fails combobox [light] 2.34; button back to #3b82f6/white fails combobox 3.67 in both schemes. `/docs/components/tree` passes alone with 9 GB free, so the crash reads as memory pressure, not a renderer bug; not split. The full run was started and stopped by the harness at 24/174 for low machine memory; it needs a machine with headroom",
    }
---

## The defect

`vp run a11y:contrast` fails six routes. Thirty instances, four distinct colour
pairs, and all four trace to two declarations.

    16  [dark]  #0a6fef on #202630 = 3.28  (needs 4.5)
    12  [both]  #ffffff on #3b82f6 = 3.67  (needs 4.5)
     2  [light] #9ca3af on #f3f6fa = 2.34  (needs 4.5)

### Half one — the accent fill is being used as ink

`/` and `/admin`, dark only, on `.pv-register-card__status`: the "Published ·
Glasselated theme", "Published · Spectrum S2" and two "Unpublished · 1-Button
study" badges on the landing page.

The chain is three hops and ends in a token:

    apps/web/src/components/theme/studio.css:278   color: var(--pv-accent-solid, #3b82f6)
    apps/web/src/components/theme/studio.css:24    --pv-accent-solid: var(--interactive-fill)
    packages/viviana-ui/src/style/glasselated-ramps.ts:286
        "interactive-fill": { light: "#0b5dc2", dark: "#0a6fef" }

`glasselated-ramps.ts:29` records the ratio this token was checked at — "6.25:1
/ 4.63:1 under white". Under _white_. It is a fill colour, verified as a fill,
and `studio.css:278` paints it as text on `--surface-raised`, which resolves to
`#202630` in dark. There it is 3.28:1.

So this is not a landing-page bug and must not be fixed on the landing page.
Either the badge stops using a fill token for ink, or the ramp gains an ink
token with a ratio verified against the surfaces it is painted on. The second is
the real fix; the same `--pv-accent-solid` is read at `studio.css:602` and
`:637` as well.

### Half two — the error boundary is itself below AA

`/showcase/inputs`, `/showcase/parity` and
`/solid-spectrum/docs/components/combobox` fail on colours that are not theirs.
They are the colours of `apps/web/src/routes/__root.tsx`:

    :83   <p style={{ color: "#9ca3af", ... }}>{props.error.message}</p>
    :88   background: "#3b82f6"   — with white text

Two hardcoded hexes, `#9ca3af` at 2.34:1 and white-on-`#3b82f6` at 3.67:1.
Those three routes are throwing — the first two are Class B and the third is
Class A in `.agents/site-gate-2026-09-21.routes.md` — so what the spec measured
is the fallback, not the page. The fallback shown to a user whose page just
broke is the last surface that should be unreadable.

Fixing the routes removes these three from the tally and leaves the boundary
just as inaccessible for the next thing that throws. Fix the boundary.

### And one route crashes the renderer

`/docs/components/tree` fails with `page.goto: Page crashed`, not a contrast
reading. Note the path: the route sweep found `/solid-spectrum/docs/components/tree`
dead, which is a different page. This one takes Chromium down. It is recorded
here because this run is where it surfaced; if it wants its own ticket after a
look, split it out rather than widening this one.

## Scope

1. `packages/viviana-ui/src/style/glasselated-ramps.ts` and the three
   `--pv-accent-solid` readers in `apps/web/src/components/theme/studio.css`
   (`:278`, `:602`, `:637`). Give accent-as-ink its own token, verified against
   the surfaces it lands on in both schemes, and leave `interactive-fill` alone
   as a fill.
2. `apps/web/src/routes/__root.tsx:83` and `:88`. Replace the two literals with
   tokens that meet AA in both schemes.

Write-path note for the conductor before dispatch: the #544 public-face grant
gives that worktree "page content under `apps/web/src/**`". A token fix and an
error-boundary style are not page content, so both halves belong to the main
writer — but say so explicitly when dispatching, because the file paths overlap
the grant's.

Non-goal: the routes themselves. Twenty-two of them are dead and that is #545.

## Done when

`vp run a11y:contrast` passes all 174 routes, and the landing page badges read
at 4.5:1 or better in both schemes.

## Proof

`vp run a11y:contrast`, full 174, recorded here. Mutation-prove half one by
putting `#0a6fef` back as the badge ink and watching `/` fail again. The run
that found this stopped at 170/174 under memory pressure; the closing run must
be complete.

## Relationship

Child of #544. Blocks `ci:site`, and so Site Gate, alongside #545. Half two is
downstream of #545 for the count of failing routes but not for the fix. The
token half is the case
`~/.claude/.../memory/docs-contrast-failures-are-token-level.md` already
records: same colours, several pages, fix the token.
