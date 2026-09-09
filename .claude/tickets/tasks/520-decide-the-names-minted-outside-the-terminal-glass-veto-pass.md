---
id: 520
type: task
title: "Decide the names minted outside the Terminal Glass veto pass"
created: 2026-09-09
status: open
history:
  - { state: open, at: 2026-09-09, note: "filed from the Terminal Glass port handoff on 117a2886" }
---

Rule #3: names with reach are owner-steered, never minted silently. The veto pass
of 2026-09-09 ("ok go") accepted a fixed list — `HudFrame` / `PixelMeter` /
`TerminalLog` / `SceneBackdrop`, `Button variant="terminal"`, `TabList trailing`,
`ProgressBar trackStyle` + `segments`, `SearchField shortcut`, `Well tone` +
`size`, `Image isPixelated`, `display-xl/lg/md`. Five more names were minted
during implementation and three colour calls were made against the brief for
contrast. None of the eight has been ruled on. `.claude/current/glasselated-port.md:105-108`
already records them as review debt; this ticket closes it.

Each item below: where it lives, what was asked, what shipped and why, and one
recommended ruling. Veto per item.

**1. `CardPreview` `tag`** — `packages/viviana-ui/src/card/index.tsx:131` (prop),
`:1246` (render into `previewTag`). Not asked for; the handoff draws a category
stamp over the media corner (Lab §06). It cannot be a plain child (the preview
clips content to the card radius, the stamp floats above that clip) and it
cannot be a context-styled `Badge` (`getAllowedOverrides()` admits only
positioning, so the scrim fill cannot ride `styles`). Both `/examples/explore`
uses go through it (`apps/web/src/routes/examples/explore.tsx:81,120`).
**Recommend keep, name unchanged.** It is a slot, not a variant; `tag` is what
the handoff calls it and there is no S2 word to mirror.

**2. `Meter variant="metric"`** — `packages/viviana-ui/src/meter/index.tsx:51`
(union), `:93` (JSDoc), `:289` (fill). The B brief asked for channel fills on the
8px track but named no variant; the register's fourth channel (cyan
`--status-metric`) had no home, so a metric meter borrowed `informative`, which
is a different channel. **Recommend keep.** `metric` is already the ruled
vocabulary elsewhere — approved `PixelMeter channel="metric"`, `Badge`
`variant="metric"` (`badge/index.tsx:237`), `StatusLight`. A fifth spelling here
would be the drift.

**3. `AppShell` `hasAsk`** — `apps/web/src/components/examples/AppShell.tsx:65,83`,
one consumer at `apps/web/src/routes/examples/settings.tsx:74`. App-level, not
library: `AppShell` is not exported from `@proyecto-viviana/ui` and never
appears in `/docs`. Added in C4–C6 so settings can spend zero fuchsia (C-1 gives
every other screen an ask). **Recommend keep.** Its reach stops at
`apps/web/src/components/examples`, and it pairs with the shell's existing
`askFilled` prop — one vocabulary for the ask, two facets.

**4. `--scan-travel`** — read by the `scanDown` keyframe
(`packages/viviana-ui/src/style/motion.ts:122`, default `100vh`), set by
`packages/viviana-ui/src/hudframe/index.tsx:119` and
`packages/viviana-ui/src/view/SceneBackdrop.tsx:126`. Asked for: the handoff's
theater scan line. Shipped as a bare custom property so a bounded frame can cap
the travel at its own height instead of falling a viewport. The problem is the
namespace: unprefixed `--*` names in `viviana-tokens.css` are the public token
surface, while component-private variables carry `--pv-` (`--pv-hud-ink`,
`--pv-pending-fill`, `--pv-pixel-ink`, `--pv-ring-fill`). `--scan-travel` reads
as a token and is not one. **Recommend rename to `--pv-scan-travel`** and keep
it private: both setters are library components, so no consumer needs it.

**5. `HudFrame channel="live"` painting red** — `packages/viviana-ui/src/hudframe/index.tsx:18`
(union), `:67` (`live: "[var(--status-fault)]"`). The paint is right and already
argued in place: fuchsia is rationed to one filled ask per view (DECISIONS 2,
B-3) and a frame around media is never that ask, so a recording frame takes
`--status-fault`. The name is the problem — `Badge variant="live"` is fuchsia
`--accent-live` (`badge/index.tsx:235,256,277,313`), so one word now means two
colours in one register. **Recommend keep the red, rename the value to
`channel="recording"`**, leaving `live` to mean fuchsia everywhere.

**6. Toast `info` on create ink** — `packages/viviana-ui/src/toast/index.tsx:534`.
Brief asked only that `info` map to the CTA fuchsia (no new variant). Shipped
`create-ink` rather than the family's white because white on the night fuchsia
fill measures 2.9:1; `create-ink` flips with the ground — white on the daylight
fill 4.74:1, near-black `#1a0512` on the night fill 6.66:1. **Recommend keep.**

**7. Streak chip ink** — `packages/viviana-ui/src/badge/index.tsx:229`
(`notice` subtle ink `var(--status-signal)`) over `:305` (16% `--yellow-500`
wash). This one matches the brief exactly — `--status-signal` is `--yellow-text`,
which is what the handoff specifies for the streak chip. The contrast-driven
re-pick landed on its siblings instead: subtle `accent`/`informative` step to
`blue-1000` (`:225-226`) because `--text-link` on the light accent wash measures
4.14:1, breaking the otherwise value-for-value mirror of the outline map.
**Recommend keep both** — the chip as briefed, the sibling step-down as a
measured exception, and record that the subtle mirror has one documented hole.

**8. Terminal button ink** — `packages/viviana-ui/src/button/s2-button-styles.ts:389`
(fill) and `:411` (outline). Brief asked for `--terminal-prompt` (`--blue-400`).
That is ~2.4:1 on the light well (`#3d9be8` on `#e9eff6`) and fails AA outright.
`blue-1100` is the same ramp's end stop and is byte-identical to
`--terminal-prompt` in the dark scheme (`#99d8ff`), so the night rendering is
the handoff's exactly and only daylight darkens to `#094aa2` (~9:1).
**Recommend keep.**

## Scope

Rule the eight. Land only the rulings that change code — on the recommendations
above that is items 4 and 5, both renames inside `@proyecto-viviana/ui`. A
rename touches the generated `/docs` prop tables, so `api:extract` reruns with
it. No `solid-spectrum`, no `apps/comparison`. Do not re-open anything on the
approved veto list.

## Done when

The owner has ruled on each of the eight, and the rulings are appended to the
"Terminal Glass (v2) — 2026-09-09" status section of
`.claude/current/glasselated-port.md`, replacing the review-debt paragraph at
`:105-108` with the decision. Any rename has landed with a Changeset on
`@proyecto-viviana/ui` (the register's major bump,
`.changeset/terminal-glass-register.md`, is already open — patch it rather than
adding a second).

## Proof

```
vp run build:viviana-ui
vp run build:web
vp run guard:api-reference
vp run a11y:contrast
```

Plus the affected showcase panels by eye: `/showcase/scene` (HudFrame channel,
SceneBackdrop scan), `/showcase/status` (Meter metric), `/showcase/cards`
(CardPreview tag), `/showcase/chips` (streak), `/showcase/overlays` (info
toast), `/showcase/buttons` (terminal). Scope `a11y:contrast` to those routes if
the runner takes a filter; it is a 1–2 h full pass otherwise.

## Relationship

Closes the naming debt recorded in `.claude/current/glasselated-port.md:105-108`.
Sibling of #521, which owns the handoff details the examples left out. Feeds
#103, which owns the remaining register-to-library decisions. Distinct from the
library gaps #515–#519 — those are missing capability, this is unruled
vocabulary. Item 3 alone is app-level (`apps/web/src/components/examples`), not
package API.
