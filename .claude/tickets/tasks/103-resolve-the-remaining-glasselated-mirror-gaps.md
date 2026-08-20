---
id: 103
type: task
title: "Resolve the remaining Glasselated mirror gaps"
created: 2026-08-20
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "created from the verified open deltas in the nine frozen-register mirror panels",
    }
---

The nine side-by-side mirror panels still contain real differences between the
frozen Glasselated register and `@proyecto-viviana/ui`. Some differences may
need a Viviana component change. Others may be correct app-level composition.
The owner must choose the public design boundary before an API changes.

## Verified starting inventory

- Panel 01: the terminal action and circular notification control have no exact
  component form. The plus-glyph difference comes from the frozen spec itself.
- Panels 04 and 08: `Well` cannot select the tutor surface.
- Panel 06: Card media is fixed to a 3:2 context style; the register needs a
  110px preview. Its blurred overlay, discrete lesson meter, and bare console
  state also use substitutions.
- Panel 07: the final prompt/caret is omitted. `LabeledValue` cannot apply the
  register's channel ink to each label.
- Panel 08: quiet ListView rows retain separators except on the last row,
  descriptions stack below labels, and Badge cannot produce a bare micro tag.
- Panel 08 also depends on ticket #102 for correct server-rendered slot layout.

The former Panel 04 NotificationBadge composition gap is closed. `Tab` now
provides `NotificationBadgeContext`; remove the stale mirror claim.

## Scope

- Compare each labeled `GAP`, `NEAR-MISS`, and `SUBSTITUTION` with the frozen
  register source and current component source.
- Ask the owner which differences belong in the public Viviana design system.
  Do not invent a variant, component, prop, or export name.
- Implement accepted library work only in `viviana-ui`. Do not change
  `solid-spectrum` styling for the register.
- Use existing component composition for app-only decoration when it preserves
  semantics and behavior.
- Replace resolved or intentional notes with short factual comments.
- Add component, visual, theme, reduced-motion, SSR, and hydration evidence for
  each accepted user-observable branch.

## Done when

Every mirror difference is either closed by tested implementation or recorded
as an explicit owner decision. No stale gap claim remains in the mirror source,
and the parity route shows the selected boundary in both color schemes.

## Relationship

The stable register boundary lives in `.claude/current/glasselated-port.md`.
Git history holds the completed 2026-07-22 port log.
