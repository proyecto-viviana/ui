---
kind: reference
status: current
---

# Claude visual-system design lane (opened 2026-07-18)

Status: time-boxed authoring lane, recorded before the work began.
Update when: the lane's scope, branch, merge disposition, or provenance changes,
or when the lane closes at merge.

This repository's operating brief (`AGENTS.md`) and `steering.md` treat the
credited maintainer session as the editing lane. The owner authorized a scoped
exception on 2026-07-18, recorded here before work began, for a visual-system
and aesthetics pass on a paired design branch. This note is the viviana-ui half
of a two-repository lane; the Education repository records the platform half in
its `documentation/engineering/work-provenance.md`, which points here for this
side.

## The lane

- **Authoring lane.** Claude designs and implements the visual system in this
  repository: it retunes the Viviana UI token layer to the blue + amber
  frosted-glass system and adds the surface / blur / edge-glass / glow token
  families. As prerequisites for a cleanly consumable library it also routes the
  currently-unstyled components through the S2 style macro (`macro-route-styled`
  in `tech-debt.md`) and retires the invented Tailwind-vocabulary utility styling
  repo-wide per `tailwind-removal.md`. Any presentation-only component the
  handoff needs is added at the viviana-ui layer.
- **Boundary and discipline.** The retune flows through the sanctioned channels
  only — the `--color-*` CSS-variable theme layer plus new brand token families
  consumed by components as `[var(--color-*)]` arbitrary values, and S2-macro
  styling generated from S2 tokens. It does **not** hand-author component-surface
  CSS tuned to pass a screenshot (ADR 0001 / `AGENTS.md` Rule #4). Parity and
  behavior certification are not weakened: each styled-layer conversion is
  re-certified on its paint and behavior dimensions (D1/D3/D7/D8 + D5/D6) per
  `certification.md`, and every published-package `src`/manifest change carries a
  Changeset per `release-policy.md`.
- **Naming.** The design system's canonical name is **Viviana UI**. The design
  handoff's internal "Aurora Glass" label is inherited handoff vocabulary and is
  not adopted into code, tokens, or docs.
- **Branch.** `design/visual-system-claude-v1`, paired with a branch of the same
  name in the Education repository. External design inputs — the owner's Claude
  design projects and the design handoff — live outside this repository and are
  not committed as source. Any image or design artifact promoted into the library
  is recorded in the relevant manifest and in `CREDITS.md`/`NOTICE` as its license
  requires, naming tool, owner direction, source, license, and integrating commit.
- **Merge and ownership.** Claude authors the branch as design and implementation
  source material. The maintainer session reviews it, merges it, and takes it
  over; all later adjustment and maintenance proceed in that lane. The merge
  records adoption of Claude-authored visual work — it does not relabel the
  authorship, and it does not make Claude an ongoing repository-editing lane.
- **Disclosure and git attribution.** The squash-merge commit carries a
  plain-prose line naming this lane and pointing here. Consistent with this
  repository's standing policy, no `Co-Authored-By`, "generated with", or similar
  per-commit trailer is used — they are noisy and can mislead about
  responsibility. That prohibition does not permit hiding tool assistance:
  accurate repository-level and asset-level provenance is required here and in the
  relevant manifests.

## Non-goals for this lane

- No change to the port stack's public behavior, accessibility model, keyboard
  model, or S2 styling branches beyond routing unstyled surfaces through the
  macro and swapping in the Viviana token theme.
- No hand-authored component-surface CSS in library packages or the comparison
  app (ADR 0001).
- No new barrel/export names without a report identifying a real missing upstream
  export; no minting of token or component names with public reach outside the
  owner-steered vocabulary.
