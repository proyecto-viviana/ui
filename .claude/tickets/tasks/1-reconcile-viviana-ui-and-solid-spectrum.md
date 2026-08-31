---
id: 1
type: task
title: "Govern the solid-spectrum to viviana-ui derivative boundary"
created: 2026-08-01
parent: 32
status: open
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
  - {
      state: open,
      at: 2026-08-02,
      note: "premise corrected to match the repository's explicit layered architecture",
    }
---

`viviana-ui` and `solid-spectrum` share **533 identical files, 28,092 lines**. Not similar —
identical. The remainder has diverged in both directions, so neither is a clean superset of the
other any more.

This repository defines a deliberate layer chain:
`solid-stately` → `solidaria` → `solidaria-components` → `solid-spectrum` →
`@proyecto-viviana/ui`. Shared content between the upper layers is therefore not, by itself,
proof that one package should disappear. The risk is ungoverned copying: S2 behavior can fork
below its authority and Viviana branding can leak downward.

`solid-spectrum` owns Spectrum S2 styling and behavior. `@proyecto-viviana/ui` may wrap,
compose, theme, and add Viviana-native components, but must not fork ARIA/state behavior or
silently take ownership of Spectrum fixes.

## Scope

- Classify the shared surface as re-export, composition, generated derivative, intentional
  branding fork, or accidental copy.
- Make #2 enforce the architectural direction, not byte identity.
- Keep S2 fixes and styling authority in `solid-spectrum`; keep Viviana tokens, themes, and
  native components in `@proyecto-viviana/ui`.
- Replace accidental copies with imports, re-exports, composition, or generation where the
  semantic contract is actually shared.
- Record release and compatibility policy for the derivative boundary. Do not attempt a
  big-bang merge.

## Done when

No ARIA/state behavior or Spectrum fix has two authorities; intentional generated or branded
derivatives are documented and validated; and both independently releasable package contracts
remain coherent.

## Relationship

Findings `L1-ui-is-a-fork-not-a-layer` (CONFIRMED),
`L8-design-system-forked-inside-its-own-repo`. Those names preserve the
2026-08-01 audit record; this ticket corrects their implied collapse boundary.
Consolidation row R2.6. Blocked in practice by #2.
This ticket also replaces legacy task `upper-layer-convergence` from
`.claude/current/tech-debt.md`; both records describe the same owner-steered
upper-layer boundary work.
