---
id: 8
type: task
title: "Make route-wide color contrast blocking"
created: 2026-08-08
status: done
history:
  - { state: open, at: 2026-08-08, note: "opened from the project and CI review" }
  - {
      state: done,
      at: 2026-08-08,
      note: "154 generated routes and all 61 live playground sections pass axe color-contrast in both themes; gate added to ci:site",
    }
  - {
      state: done,
      at: 2026-08-08,
      note: "expanded playground audit classified and promoted after 10/10 playground, 80/80 comparison, and 44/44 smoke",
    }
---

The blocking accessibility command scanned one playground and disabled axe
`color-contrast`. As a result, shared text and fill roles could fail throughout
the published site without turning CI red.

## Scope

- Derive the route set from the generated router tree rather than maintain a
  second list.
- Check every route in light and dark with axe's `color-contrast` rule enabled.
- Repair shared roles at their source, preserve the S2 style-macro boundary, and
  document any standards-backed exemption in the test.
- Exercise every live playground section with `color-contrast` enabled so
  interaction-state examples cannot hide behind the route's initial collapsed
  state.
- Run the passing sweep from the blocking Site Gate.

## Resolution

`apps/web/e2e/contrast.spec.ts` runs one test per generated route and checks both
themes. The initial full run was `80` passing / `74` failing routes; token,
shared-chrome, style-macro, and demo-chrome repairs reduced it to `154/154`.
The blocking `a11y:axe:aa` playground scan now opts into axe contrast and expands
all `61/61` sections before scanning. It caught additional active-state defects
that a route-at-rest sweep cannot see: a local TabSwitch retained the browser's
native button fill, Spectrum demos sat on a tinted app surface rather than their
Provider container, and a headless ListBox used a decorative palette rung as a
text surface. Those were repaired in their owning layers; upstream S2 error and
link colors were left exact.

Both browser suites import one exemption list. `[data-disabled]` is its only
entry, because WCAG 2.2 SC 1.4.3 excludes inactive controls and Solid Aria
exposes that state on the component root. A second exemption cannot be added to
one suite without becoming visible to the other.

`a11y:contrast` now runs inside `a11y:check`, which is part of blocking
`ci:site` / Site Gate, and `a11y:axe:aa` fails on playground contrast as part of
that same chain. This is a site-level floor; component certification still
requires interaction-state and upstream-parity evidence.

## Adjacent full-audit closure

The same pass made `a11y:full` honest rather than merely non-blocking. WCAG
2.1/2.2 AA and best-practice rules are strict in both themes. The audit found
and closed two non-contrast defects: the playground heading outline skipped a
level, and the `aria-label`-only Select branch did not give its trigger the
upstream accessible name. The Select repair lives in `solidaria`, mirrors
React Aria's exact `aria-labelledby` construction, and is held by unit name
assertions plus the real-browser experimental scan.

Two classes are attached as reports instead of being hidden or allowed to mask
other failures:

- WCAG AAA permits only `color-contrast-enhanced` and records all nodes (`95`
  dark / `225` light); every other AAA rule fails the test.
- Experimental permits only the `22`-node-per-theme `focus-order-semantics`
  report for Tag rows, whose focusable row/gridcell structure exactly mirrors
  React Aria's `useTag` → `useGridListItem`; every other experimental rule fails.

Final full-audit evidence: playground `10/10`, comparison `80/80`, and browser
smoke `44/44`.

## Relationship

Closes `tech-debt.md` → "axe color-contrast excluded from the blocking gate".
Complements ticket #2: a passing check that CI never invokes is not a gate.
