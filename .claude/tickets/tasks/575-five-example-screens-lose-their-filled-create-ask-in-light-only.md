---
id: 575
type: task
title: "Five example screens lose their filled + Create ask in light scheme only, so a11y:smoke is red"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: 'found by the conductor running step 251 of the ladder, `VIVIANA_GATE=1 vp run a11y:full`, the first time it could run since `build:web` started passing. The first two legs are green - playground axe 10/10, comparison axe 81/81 - and the third, `a11y:smoke`, is 7 failed / 67 passed. Five of the seven are this: `/examples/explore`, `explore-empty`, `lesson`, `profile` and `playground` each fail `lost its filled "+ Create" ask`, expected 1 received 0, at `apps/web/e2e/examples.spec.ts:205`. The set is exact: those five are precisely the entries whose `fuchsiaFill` is `+ Create` in `apps/web/src/components/examples/registry.ts`, and no other. And it is scheme-asymmetric - every one of them passes in `[dark]` and fails in `[light]`, on the same page and the same assertion. Evidence `.agents/chain-walk-2026-09-20/ladder-axe-full.out.txt`. The other two failures are a different cause and are #576',
    }
  - {
      state: open,
      at: 2026-09-21,
      note: 'diagnosed by the close-gates writer. The button really is a different colour, so the gate is right and the helper stays. It is not the lightningcss hypothesis. Sampling `/examples/lesson` under `pv-theme=light` every ~60ms: `+ Create` first paints `rgb(255, 79, 195)`, the dark `--fuchsia-500`, while the probe already resolves the light `rgb(217, 18, 143)`. It is mid-transition at ~760ms (`rgb(222, 27, 150)`, its own 0.15s `background-color` transition, with `getAnimations()` listing it) and settles by ~830ms. Dark never moves. Cause: `__root.tsx:110`''s pre-paint script sets `<html data-color-scheme>` from `pv-theme`, but `useTheme`''s signal starts at `"dark"` (`apps/web/src/utils/theme.ts:22`) and reads storage only in `onSettled` (`initGlobalTheme`). The examples tree is client-rendered (the server HTML carries only `<html data-color-scheme="dark">`), so `ExamplesShell`''s `<Provider colorScheme={theme()}>` mounts dark under a light `<html>` and flips after settle, and the transition animates the flip: a light-scheme user sees the dark palette flash on every load. The test measures as soon as `h1` exists, so it lands inside that window. Which screens miss is a race: at HEAD, `vp run a11y:smoke` is 71/3 with explore-empty, lesson and playground failing, while explore and profile made it this time. Fix site: `apps/web/src/utils/theme.ts`, starting the client signal from the scheme the pre-paint script already resolved (one owner, per `ThemeToggle.tsx:3`). That is under `apps/web/src/**`, so, as this ticket asks, the boundary goes to the conductor before any edit. Not fixed here',
    }
---

## Scope

`examples.spec.ts` guards decision C-1 — one filled fuchsia ask per screen,
never two — and guards it in both directions. The cap is
`filled.length <= 1`; the floor, at `:202-206`, is that a screen whose registry
entry claims the `+ Create` fill must actually paint it, "otherwise a shell that
stopped rendering the CTA would pass the cap". The floor is what is failing, so
what the gate is reporting is a screen that stopped painting its ask.

How it measures, which is the part that matters here
(`apps/web/e2e/examples.spec.ts:42-59`):

1. read `--accent-cta` off `[data-examples]`, deliberately not off `<html>` —
   the comment above the helper says why, and it is the same trap this
   repository has hit before;
2. set a hidden probe's `background-color` to that value and read the probe's
   _computed_ colour back, which resolves the `var()` chain in the examples
   root's context;
3. walk every `button`, `a` and `[role=button]` and count those whose computed
   `backgroundColor` string **equals** the probe's.

So a failure means one of two things, and they are not the same defect: the
button really stopped being painted with the CTA colour, or the two sides of an
exact string comparison stopped resolving to the same colour through different
paths. Decide which before changing anything.

## What is already known

- The failing set is exactly the five `+ Create` entries. The other five
  screens carry a different `fuchsiaFill` string, so they never reach line 205
  and would not report this even if they had the same defect. **Do not read
  "five screens" as "five bugs"** — one shell paints that button.
- Light fails, dark passes, on the same assertion. Whatever moved is
  scheme-specific.
- `--accent-cta` is `var(--fuchsia-500)` at `packages/viviana-ui/src/viviana-tokens.css:346`
  and is not redeclared in the light block; `--fuchsia-500` is `#ff4fc3` at
  `:268` and `#d9128f` at `:666`, inside `[data-color-scheme="light"]`. So the
  token is _meant_ to resolve per scheme by redefining its input, and both
  sides of the comparison should follow the same redefinition.

## The hypothesis worth testing first, and it is only a hypothesis

This repository has a recorded trap with exactly this shape: lightningcss
downlevels `light-dark()` into `--lightningcss-light` / `--lightningcss-dark`
atoms, and cannot see `color-scheme` through a `var()`, so a value can resolve
one way on an element that carries the scheme and another on an element that
merely inherits it. A probe appended to the examples root and a button nested
several levels inside it are exactly two such elements. That would produce a
light-only, exact-equality-only failure with the button still looking correct
to the eye.

Test it before believing it: print both strings. If the button's computed
background and the probe's differ only as two spellings of the same colour, the
defect is in the measurement and the fix is in the helper. If the button is
genuinely a different colour in light, the defect is in the register or the
shell and the helper is doing its job.

**Say which one it was in the ticket.** A gate that was right and got loosened
is the worst outcome available here, and it is the outcome that looks like
success.

## Ownership, before any edit

The likely fix sites straddle a boundary. `packages/viviana-ui/**` and
`apps/web/e2e/**` are this seat's. `apps/web/src/components/examples/**` is
shell code, not page copy, so the owner's 2026-09-20 exception for the
`public-face` worktree — which names "page content under `apps/web/src/**`" —
does not obviously cover it and does not obviously exclude it. If the fix lands
in the shell, say so in the ticket and let the conductor settle the boundary
rather than deciding it inside a commit.

## Done when

`vp run a11y:smoke` exits 0 for these five screens in both schemes, the ticket
records which of the two causes it was with the two colour strings that proved
it, and — if the fix was in the helper — the gate still fails when the shell
genuinely stops rendering the ask. Prove that last one by removing the button
in a scratch edit and watching it go red, then revert.

## Relationship

Child of #544. Step 251 of `.github/workflows/certification-gates.yml`, which
is the last blocking step of the `gates` job and could not run at all until
`1df7af51` made `build:web` pass. Sibling of #576, which is the other two
failures of the same run and a different cause.

Bears on the Glasselated register's create channel, which is where
`--accent-cta` and the yellow create colour were last steered; that work is
recorded in the campaign memory, not in a ticket, so read the token file rather
than assuming.
