---
id: 455
type: task
title: "Export remaining solid-spectrum subpaths"
created: 2026-09-04
parent: 136
status: verified
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 export-subpaths child; owner-confirmed title after grill listed 89 missing keys. Parent is #136 (a task cannot parent a task).",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; 55 remaining export keys plus parent-subpath for compound members. Slice 0 of T7, not #451 deep-import.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "55 ./Name keys; wrappers match ./Button; compound members reuse parents (PickerItem → ./Picker, createIcon → ./Icon). Changeset patch. package-artifacts + 89/89 resolve.",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at ead40e9f; 55 ./Name keys; 89 names map; compound members reuse parents.",
    }
---

Comparison already imports 89 named symbols from the
`@proyecto-viviana/solid-spectrum` barrel that have no `exports` subpath
key. Names already exist on the barrel; this ticket adds
`exports["./Accordion"]` and the rest, plus a Changeset. Compound members
reuse an existing parent key (`PickerItem` → `./Picker`). Do not invent
new public names.

Chrome/controls/D12 subset that blocks #451 even if fixtures wait: Badge,
CloseIcon, Content, ContextualHelp, Divider, Heading, Keyboard, Link,
MenuHamburgerIcon, Meter, Radio, RadioGroup, SearchIcon, createIcon.

Distinct from #227 (generate S2-shaped per-file export modules). This
slice only publishes keys for names the harness already imports.

## Done when

`package.json` `exports` keys exist for the symbols #451 will import.
Compound members use parent keys. Changeset on `solid-spectrum`. Packed
package exposes the new subpaths. No new public name that is not already
on the barrel.

## Relationship

Child of #136. Slice of #255. Blocks #451. Distinct from #227.

## Evidence

Artifacts: `.agents/vivianastack/comparison-app-route-load/` (`plan.md`,
`grill.md` verdict `go`, lock pick 1). Cwd
`/home/emoporemilio/projects/viviana-hub/ui`. Baseline HEAD `01efa9e3`.

Added **55** `exports` keys (not 89): each missing dedicated module gets
`./Name` with types/solid/import/default siblings pointing at
`dist/Name.{d.ts,jsx,js}`, matching `./Button`. Compound members reuse
parents — existing `./Picker` `./Tabs` `./Menu` `./TreeView` `./ListView`
`./SegmentedControl` `./Breadcrumbs` `./Card` `./Disclosure` `./ColorArea`
(`parseColor`); new `./Accordion` `./ComboBox` `./Dialog` `./RadioGroup`
`./TableView` `./SelectBoxGroup` `./TagGroup` `./Toast` `./Tooltip`
`./Icon` (`createIcon` / `createIllustration`, S2 `exports/Icon.ts`).
No `./PickerItem`, `./Radio`, `./createIcon`. `src/` not used.

Local: `vp run build:solid-spectrum` exit 0 (tsc emit included).
`vp run guard:package-artifacts` PASS (1040 manifest targets).
`vp run guard:attribution-headers` PASS (254 reviewed-local).
`vp exec tsc --noEmit -p packages/solid-spectrum/tsconfig.build.json`
exit 0. `vp exec tsx` resolve: 89/89 names map to an export key and
Node `require.resolve` succeeds. `git diff --check` exit 0.

Source: `packages/solid-spectrum/package.json` `exports`,
`packages/solid-spectrum/vite.config.ts` `subpathEntries`, 55
`src/<Name>.ts` wrappers, `.changeset/export-remaining-solid-spectrum-subpaths.md`
(`@proyecto-viviana/solid-spectrum` patch),
`scripts/attribution-local-reviews.json`. Comparison app imports
untouched. `apps/web` untouched. Not pushed.
