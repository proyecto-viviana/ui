---
id: 489
type: task
title: "Compile solid-spectrum subpaths from source in the comparison app"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the first sharded certified run after #451 (de696c30): 732 certified failures, 600 of them field D1s",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "public JSX subpaths aliased to src entries in the comparison Vite config; guard:comparison-atom-css on the built dist, wired into the comparison-build job",
    }
---

#451 dropped the exact-package alias so the comparison chrome, controls, and
fixtures import `@proyecto-viviana/solid-spectrum/<Name>` subpaths. With no
alias, package.json's `solid` condition resolves those to the prebuilt
`packages/solid-spectrum/dist/<Name>.jsx`. The style macro had already run
inside that package build: the class lists are baked in and their CSS lives
only in the package's `dist/styles.css`, which the comparison app never loads.
Nine fixture files still reach `src/button/s2-*-styles.ts` by relative path,
so the app also compiled the same rules and minted its own atoms for them.
Only the modules the app compiles itself get their rules emitted into the
app's stylesheets, so 65 atoms in the shipped JS had no CSS at all, and
`C1xyRcb17` — the field `gridTemplateAreas` rule, referenced from 15 chunks
— left every dist-resolved S2 field root at `grid-template-areas: none`.
That took 600 of the 732 failures in the 2026-09-07 Certification Gates run
(CI shards 1–8 on `2de33553`), with `field-validity`, `form`, every
text/date/color field, and every field-composing picker red on D1.

## Structure

One macro compile per build. `apps/comparison/astro.config.mjs` derives an
alias per public export whose `solid` target is a `.jsx` file, pointing it at
the matching `packages/solid-spectrum/src/<entry>.ts` (`./Disclosure` →
`disclosure-export.ts`), and throws at config time if an export has no source
entry. The JSX-free `./style` and `./style/runtime` keep their explicit
aliases; the package root stays unaliased so the #451 `package-root-import`
guard keeps its meaning. `scripts/check-comparison-atom-css.mjs`
(`vp run guard:comparison-atom-css`) reads `apps/comparison/dist` and fails
when any postfix-`17` atom in a shipped class list (JS string literals,
inline scripts, prerendered `class` attributes) has no rule in the shipped CSS
(bundled stylesheets and inline `<style>` blocks). It runs in the
`comparison-build` job right after `comparison:build`, before any shard
starts.

## Done when

`guard:comparison-atom-css` fails on the `2de33553` dist (65 atoms,
`C1xyRcb17` in 15 chunks) and passes on the rebuilt dist. Field D1s in the
certified suite go green on the next Certification Gates run; the remaining
reds are triaged separately. `vp run comparison:test:fixture-registry-split`
and the comparison `guard:fixture-registry-split` stay green.

## Residual

The nine relative-path imports of `s2ButtonText`, `s2ActionButtonText`, and
`s2ToggleButtonText` stay: those helpers are not on any public subpath, and
publishing them is a name with reach (Rule #3), not a harness decision. They
are consistent under one compile. One app build still mints the same
`grid-template-areas: "label" "input" "helptext"` rule under two atom names
(`C1xyRcb17`, `Cxaocre17`), each with CSS; why the hash differs by site is
not established, and the guard holds the invariant regardless.

## Relationship

Child of #136. Follows #451 and #455. Feeds #194 (certified record pinned to
HEAD) and the #443 release train.
