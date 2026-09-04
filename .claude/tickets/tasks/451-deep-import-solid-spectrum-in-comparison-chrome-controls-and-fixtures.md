---
id: 451
type: task
title: "Deep-import solid-spectrum in comparison chrome, controls, and fixtures"
created: 2026-09-04
parent: 136
status: verified
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (a); owner-confirmed title. Parent is #136 (a task cannot parent a task).",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; slice (a) after #455 ead40e9f. No ticket-session.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "chrome/controls/fixtures/D12 off the barrel onto subpaths; parent-subpath for compound members; dropped exact-package alias; solid dist jsx in plugin include; package-root guard.",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at de696c30; chrome/controls/fixtures/D12 off the barrel onto subpaths.",
    }
---

Switch comparison chrome, controls, fixtures, and D12 islands off the
`@proyecto-viviana/solid-spectrum` barrel onto per-file subpaths (S2 docs
use `@react-spectrum/s2/Button`). A leftover package-root specifier on any
docs-layout graph re-eager-loads `src/index.ts` on the first lazy fixture.

Compound members reuse an existing parent key (PickerItem → `./Picker`);
do not mint new public names. Remaining barrel symbols need #455 first, or
documented harness-relative `src/` paths if that ticket has not landed.

## Done when

Button CDP shows zero package-root / `src/index.ts` and no `Calendar.*`
CSS; only the current-slug fixture. `demoHitCount` is #262. Guard fails a
package-root specifier in chrome, controls, fixtures, and D12.
`vp run comparison:test:fixture-registry-split` stays green.
`vp run comparison:build` chunk sizes unchanged or better.

## Relationship

Child of #136. Slice (a) of #255. After or with #455. Before #452. Do not
reopen #250. Distinct from #261 and #262. Related to #454 only as a
predecessor on the #255 graph, not client-nav.

## Evidence

Artifacts: `.agents/vivianastack/comparison-app-route-load/` (`plan.md` slice
(a), `grill.md` verdict `go`). Cwd
`/home/emoporemilio/projects/viviana-hub/ui`. Baseline HEAD `622bc7af`.
#455 already exported subpaths (`ead40e9f`).

Source: 94 chrome/controls/fixture/D12 files now import
`@proyecto-viviana/solid-spectrum/<Name>` (PickerItem → `./Picker`, Radio →
`./RadioGroup`, createIcon → `./Icon`, parseColor → `./ColorArea`, table
slots → `./TableView`, DialogTrigger → `./Dialog`). Zero package-root
`from "…/solid-spectrum"` in those named files. Dropped exact-package
alias in `apps/comparison/astro.config.mjs`; added
`solid-spectrum/dist/**/*.jsx` to Solid include (and React exclude). Guard
`package-root-import` on chrome, controls, fixtures, D12.
`COMPOSITION_SLUGS` unchanged. Registries still dynamic `import()`. No
changeset (comparison app is not published). `apps/web` untouched. #250
not reopened. Not #261/#262/#452/#453/#454.

Local: `vp run comparison:test:fixture-registry-split` 7 passed (cwd ui).
`vp run --filter @proyecto-viviana/comparison guard:fixture-registry-split`
`fixture registry split: ok`. `git diff --check` exit 0. Node
`import.meta.resolve` of Button/Picker/RadioGroup/Icon/Disclosure/TableView
hits `packages/solid-spectrum/dist/*.js` (Disclosure →
`disclosure-export.js`). Comparison `astro check` not cheap (builds
workspace deps) — not run. `comparison:build` not run.

Live measure: `apps/comparison/scripts/measure-route-load.mjs` absent;
`COMPARISON_BASE_URL` unset; `:4321` closed. Did not start astro. Button
CDP / Calendar CSS / chunk sizes not measured this slice.
