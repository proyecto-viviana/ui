---
kind: plan
status: done
completed: 2026-07-15
---

# Recertification Program — COMPLETE (2026-07-15)

> **Historical record.** The pair-oracle recertification march is finished. This
> file is the outcome summary; the full component-by-component blow-by-blow lives
> in [`archive/recertification-full.md`](archive/recertification-full.md). The
> standing acceptance bar it enforced is [`certification.md`](certification.md) —
> that doc stays live and is what future ports are held to.

## What it was

A machinery-not-judgment program to mechanically enforce the certification bar.
The comparison app mounts real React Spectrum S2 and our Solid port side-by-side;
**twelve pair-oracle drivers** run the same scenario against both stacks and
assert the outputs match — no hand-maintained expected values, so upstream moves
the bar automatically. Every component's unit of work ended red→green: divergence
found → fixed to match upstream → guarded by the test that would catch its
regression. When the march completed, "accepted" came to mean "its suite is
green," and it keeps meaning that on every future commit.

**Pinned oracle:** React Spectrum S2 `1.5.1`, React Aria Components `1.19.0`,
react-aria `3.50.0`. Re-bump the pins together when Adobe releases (see
`upstream-sync.md`).

## Outcome — the whole march is done

- **Phase 1 — drivers: 12/12 (D1–D12).** State-matrix style diff (D1), motion
  filmstrip (D2), strict pixel diff (D3), event-sequence oracle (D4), focus &
  keyboard trails (D5), AX tree & announcements (D6), contrast (D7), target size
  (D8), forced colors (D9), RTL/i18n (D10), timing under a mocked clock (D11),
  SSR/hydration (D12).
- **Phase 2 — the march: all six tiers certified.**
  - Tier 1 primitives, Tier 2 form fields, Tier 3 overlays — done.
  - Tier 4 collections — **18/18** (Picker → the keyboard-DnD DragManager port).
  - Tier 5 date/time/color — **12/12** (Calendar → ColorSwatchPicker; ColorEditor
    out of scope — S2 1.5.1 ships none).
  - Tier 6 custom Viviana layer — **12/12** (Chip → PageLayout). No upstream pair,
    so D1/D2/D3 are out, D5/D6 run inline, and D7/D8 assert against WCAG in the
    absolute (`assertAA` / 24px target) rather than against a styled S2 oracle.
- **Phase 3 — closers: CP9.82–86.** `guard:style-macro-parity`, `guard:idiomatic-
solid`, the gated WCAG-AAA report, the D3 waiver burn-down, and retiring the
  audit scaffolding.
- **Post-march:** the D4 Tabs touch-tap event-ordering red was closed by binding
  roving to `focusin` (React delegation) rather than the native `focus` event.

## What "certified" means now

A component is accepted when its pair-oracle driver suite is green, and it stays
accepted only while that holds. `comparison:test:certified` is the standing gate;
which drivers are in-scope per component (and why any were scoped out) is recorded
in the archived full log. New ports are held to `certification.md`.
