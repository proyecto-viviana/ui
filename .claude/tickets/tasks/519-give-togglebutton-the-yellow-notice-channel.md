---
id: 519
type: task
title: "Give ToggleButton the yellow notice channel"
created: 2026-09-09
status: open
history:
  - { state: open, at: 2026-09-09, note: "filed from the Terminal Glass port handoff on 117a2886" }
---

A selected `ToggleButton` has exactly one loud form: `isEmphasized`, which fills
with `interactive-fill` and white ink
(`packages/viviana-ui/src/button/s2-action-button-styles.ts:151-156`, `:174`).
In this register `interactive-fill` is the fuchsia ask, and the ask is rationed to
one filled instance per view. There is no yellow form, though the rest of the
family has one: `Button variant="warning"` is the yellow/`notice` channel with
black ink (`packages/viviana-ui/src/button/types.ts:32-36`), and `Badge` has
`variant="notice"` painting `--status-signal` with black ink
(`packages/viviana-ui/src/badge/index.tsx:189`, `:233`). `ToggleButton` has no
`variant` prop at all (`packages/viviana-ui/src/button/ToggleButton.tsx:91-108`).

The handoff's raise-hand control is that yellow: selected it fills
`var(--status-signal)` with `#1a1400` ink, unselected it is transparent with
yellow ink, and its outlined twin is a yellow border and yellow label
(`screens/Terminal Glass App.dc.html:345`, `:547`;
`screens/Terminal Glass Lab - Lesson Player.dc.html:310`). Raising a hand is a
transient detail, which is what yellow reports; it is not the screen's ask.

The live screen carries it twice and has to say it two other ways: both toggles
are `isEmphasized` and therefore fuchsia
(`apps/web/src/routes/examples/live.tsx:205-213`, `:242-244`), with a separate
`Badge variant="notice"` next to one of them to carry the yellow the toggle
should have been (`live.tsx:238-240`). That also spends fuchsia fill on a
non-ask, which is the budget the examples e2e checks per screen.

## Scope

`packages/viviana-ui/src/button/ToggleButton.tsx` and
`s2-action-button-styles.ts` (the selected fill, ink, border and the pressed /
hovered / focus-visible steps), `button/group-context.ts` so a
`ToggleButtonGroup` passes it down the way it already passes `isEmphasized`
(`ToggleButton.tsx:146-153`), the buttons and status showcase panels, then
`live.tsx`.

The API question the owner decides: the prop name, and that this is an explicit
documented local addition — S2's `ToggleButton` has no channels, so Rule #2 gives
no upstream answer. **Recommended default:** `variant?: "accent" | "notice"`,
default `"accent"` (today's behaviour byte-identical), inherited from the group
context the same as `isEmphasized`, using the two names the family already
speaks — `Badge`'s `notice` for the channel and `accent` for the fuchsia. Selected
`notice` fills `--status-signal` with black ink; unselected `notice` keeps the
control's rest surface with yellow ink and a yellow rim, so the off state is
still legibly the same control. Veto it if the owner prefers `Button`'s
`warning` spelling for the same channel, or a `channel` prop that could later
take `metric` and `fault` too.

Yellow ink is black ink here — never white — and red stays reserved for fault.
A `notice` toggle never counts against the one-fuchsia-fill budget, and that is
the point of the ticket.

## Done when

- `ToggleButton variant="notice"` selects to yellow fill with black ink in both
  schemes, and inherits from `ToggleButtonGroup`.
- `/examples/live`'s two raise-hand toggles use it, drop `isEmphasized`, and the
  screen's single fuchsia fill is its `+ Create` — held by the existing per-screen
  fuchsia check in `apps/web/e2e/examples.spec.ts`.
- The `HAND UP` badge stays or goes on its own merits, not as the yellow stand-in.
- Contrast passes for black-on-yellow in the selected, hovered, pressed and
  focus-visible states in both schemes; the focus ring is the existing one,
  recoloured only through tokens.
- A regression test names the failure: `variant="notice"` selected must not
  resolve to `--accent-cta`.

## Proof

```
vp run build:viviana-ui
vp run build:web
vp run guard:examples-purity
vp exec --filter @proyecto-viviana/web -- playwright test e2e/examples.spec.ts
vp run a11y:axe:aa
vp run a11y:contrast
vp run api:extract && vp run guard:api-reference
```

Plus a minor Changeset on `@proyecto-viviana/ui` (additive prop).

## Relationship

One of the five library gaps the Terminal Glass port surfaced: #515, #516, #517,
#518. Sibling concern to #103 (Glasselated mirror gaps). Example route:
`/examples/live`. Distinct from the S2-parity ToggleButton work under #136 —
#500 and #511 (pressed D3 raster) and #484 (reduced-motion budget) — which is
upstream-parity certification work, not a register channel.
