---
id: 521
type: task
title: "Restore the handoff details omitted from the examples"
created: 2026-09-09
status: open
history:
  - { state: open, at: 2026-09-09, note: "filed from the Terminal Glass port handoff on 117a2886" }
---

The ten `/examples` screens are the proof that `@proyecto-viviana/ui` can build a
whole product surface unaided, so every place a screen quietly stops matching
the handoff is a claim the surface does not actually support. C1–C6 recorded
each one honestly rather than faking it with app CSS — the purity guard
(`scripts/check-examples-purity.ts`) would have caught that anyway. This ticket
collects them, separates the ones the examples can fix from the ones that need a
library part, and closes the first set.

Handoff is read-only at `/mnt/c/Users/emili/Downloads/design_handoff_terminal_glass`.
Studies 4d/4e/4f live in `screens/Terminal Glass Lab - Home Studies.dc.html`; the
App screens in `screens/Terminal Glass App.dc.html`; §-numbered parts in
`screens/Terminal Glass Lab.dc.html`.

### Blocked on a library part

**1. Explore hero gradient scrim.** Handoff `Terminal Glass Lab - Home Studies.dc.html:244`
paints the featured journey's title and lede over
`linear-gradient(180deg,rgba(2,3,5,.45),transparent 30%,transparent 50%,rgba(2,3,5,.92))`
laid on the media; `:257` repeats a lighter one
(`rgba(2,3,5,.3) → transparent 35% → rgba(2,3,5,.9)`) on each grid tile.
`apps/web/src/routes/examples/explore.tsx:8-12` says why it was skipped: a scrim
is paint, and the app may not author paint, so the hero keeps the card grammar
instead — media in `CardPreview` under `HudFrame` brackets
(`explore.tsx:75-90`), words beneath, same content and order. The tiles took the
same treatment (`explore.tsx:120-122`). There is no library answer today:
`CardPreview` clips its content and admits only positioning through
`getAllowedOverrides()`, and `SceneBackdrop`'s `veil` is the register's dither,
not a bottom-weighted legibility scrim. **This needs a new affordance on
`CardPreview`** — a scrim behind overlaid content, at the handoff's two
strengths. It is a name with reach, so propose it and get the ruling before
implementing (Rule #3); do not mint it in passing the way the five in #520 were.
Not covered by #515–#519.

### Restorable inside the examples

**2. "▴ open editor".** Handoff `Terminal Glass Lab - Home Studies.dc.html:336`,
study **4f Playground**: the file strip is `estimator.glsl ●` / `scene.json` /
`console`, then a flush-right `▴ open editor` in `--status-info` — the
affordance that opens the shader drawer the study's own label describes. The
port ships the strip as `Tabs variant="terminal"` with the approved `TabList`
`trailing` slot (`apps/web/src/routes/examples/playground.tsx:183-203`), but the
trailing slot carries per-file readouts invented for the port instead —
"156 lines · ● modified" / "42 keys · saved" / "1 warning · 0 errors"
(`playground.tsx:52-58`). So one omission and one invention in the same slot.
**Restore it**: put `▴ open editor` in `trailing` as the handoff has it —
recommend a `ToggleButton size="S" isQuiet` so the drawer state is real rather
than decorative — and drop the invented readouts. No library change; the slot
already exists.

**3. Playground viewport chips.** `playground.tsx:150-176` renders the HUD
readouts as `Badge fillStyle="bold"` where the handoff has bare mono text over
the render (`Home Studies.dc.html:332-333`, 10.5px `.08em` with a text-shadow).
`fillStyle="subtle"` measured 4.17:1 over the photo and fails AA, so the chips
went bold. **Recommend keep as shipped** and record it — the handoff's own
recipe is a text-shadow, which is paint the examples may not author, and a
shadow is not a contrast mechanism axe will accept anyway.

**4. Landing lede.** `apps/web/src/routes/examples/landing.tsx:98` uses
`typeRoles.body` where the handoff sets the lede at 18px. Blocked on the missing
role — **cross-references #518** (ELSH + 18px lede type roles). Restore in the
same pass as that ticket, not here.

### Not restorable, and not a gap

**5. avatar-3.** The examples map it to `avatar-2` under decision B-9/C-6, and
`apps/web/public/examples/` ships `avatar-1.png`, `avatar-2.png`,
`avatar-nova.png` only. The handoff does not ship `avatar-3.png` either:
`screens/assets/` has avatar-1, avatar-2 and avatar-nova and nothing else, while
`Terminal Glass Lab.dc.html:229` references `assets/avatar-3.png` — a dead
reference in the source material, so there is no file, no size and no licence to
check. It is also moot: the avatar stack that used it is a Lab §05 composite
that appears in no App screen, and no `/examples` screen renders a stack today
(`live.tsx:104` is a single 24px `Avatar`). **Close it as a handoff defect**, not
a port divergence.

### Also found sweeping the C-notes

**6.** `profile.tsx:38-43,96-101` — the activity map reads one aggregate value
(129 active days of 182) because `PixelMeter shape="grid"` fills from a single
value and cannot show `HEAT`'s per-cell levels. **#515.**

**7.** `profile.tsx:49` — `SceneBackdrop src="/examples/bg-city.png"` in both
schemes; the handoff wants `bg-city.png` on dark and `bg-scene.png` on light,
and routes may not import `@/utils/theme`. **#516.**

**8.** `live.tsx:192-193` — `TerminalLog` is `white-space: pre` with no wrap
mode, so the chat backlog needs `.ex-live-log > * { width: max-content }` and a
focusable wrapper to keep the scroll region reachable. **#517.**

**9.** `live.tsx:206-208,242-243` — raise-hand is `ToggleButton isEmphasized`
plus a notice `Badge`; the handoff's control is yellow. **#519.**

**10.** `apps/web/src/components/examples/AppShell.tsx:97-112` — a gap none of
#515–#519 covers: `LinkButton` has no `isQuiet` (only `ActionButton` and `Link`
do), so the rail's four inactive slots are outlined `LinkButton`s against a
quiet selected `ToggleButton`, where the handoff draws five quiet glyphs with a
fill only on the active one. **Either add `isQuiet` to `LinkButton` or say the
rail keeps the outline** — recommend adding it, since `LinkButton` is otherwise
a `Button` in every respect and the asymmetry will bite every consumer building
a nav rail.

**11.** Layout-only residue, no action, recorded so it is not re-discovered:
`Card size` fixes width, so screens carry `.ex-*-card { width: 100% }` /
`.ex-*-pane { width: 100% }` to let the grid decide (C1–C3, C4–C6). That is box
metrics and the purity guard allows it.

## Scope

Close items 2, 3 and 5 in `apps/web` — no library change, no widening of the
purity allowlist beyond the two exceptions already pinned in
`scripts/check-examples-purity.ts:50-56` (`ExamplesShell.tsx`,
`ThemeToggle.tsx`). Item 1 needs an owner ruling on a `CardPreview` name before
any code. Items 4 and 6–9 belong to #515–#519 and are listed here only so the
divergence set is in one place; item 10 needs a ruling. Routes stay on
`@proyecto-viviana/ui`, `solid-js`, `@tanstack/solid-router`,
`@/components/examples/*`, `@/styles/*`, `@/seo`; no `style=` attributes; only
`ex-*` classes; `examples.css` stays layout-only under `[data-examples]`.

## Done when

`/examples/playground`'s file strip carries `▴ open editor` and no invented
readouts; the bold viewport chips and the avatar-3 close are recorded in the
"Terminal Glass (v2) — 2026-09-09" status section of
`.claude/current/glasselated-port.md`; the owner has ruled on the `CardPreview`
scrim name (item 1) and on `LinkButton isQuiet` (item 10). Every screen still
spends its budgeted fuchsia.

## Proof

```
vp run build:web
vp run guard:examples-purity
vp exec --filter @proyecto-viviana/web -- playwright test e2e/examples.spec.ts
vp run a11y:axe:aa
```

The e2e run covers the fuchsia rule directly (`apps/web/e2e/examples.spec.ts:193-204`,
DECISIONS C-1): at most one fuchsia fill per view, exactly one on lesson,
explore, explore-empty, profile and playground, zero on settings. All ten slugs
× both schemes. Known pre-existing red to leave alone: `test:hydrate` has one
Tabs failure.

## Relationship

Sibling of #520, which owns the vocabulary minted outside the veto pass — item 1
and item 10 must not repeat that pattern. Cross-references the library gaps
#515 (PixelMeter per-cell grid), #516 (SceneBackdrop per-scheme `src`), #517
(TerminalLog wrap mode), #518 (ELSH + 18px lede roles) and #519 (ToggleButton
notice variant); items 4 and 6–9 land there, not here. Feeds #103, which owns
the remaining register-to-library gaps. Routes touched:
`apps/web/src/routes/examples/{explore,playground,landing,profile,live}.tsx` and
`apps/web/src/components/examples/AppShell.tsx`.
