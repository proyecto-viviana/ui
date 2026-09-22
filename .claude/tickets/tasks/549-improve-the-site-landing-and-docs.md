---
id: 549
type: task
title: "Improve the site landing and docs, then deploy"
created: 2026-09-20
parent: 544
status: open
blocked: true
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "opened under #544 for ui.proyectoviviana.org, blocked on #545: the site does not build on Solid 2 until then. Owner gave standing deploy authority for this campaign, conditional on a green Site Gate for the exact revision. Write paths: apps/web only",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings. `apps-web/ci-never-rendered-a-web-page`, medium, confirmed: no CI run in this campaign has rendered a single `apps/web` route, because Site Gate is the only thing that does and it is `disabled_manually` - which also means this ticket's Done-when, Site Gate green plus a clean-dir walk, re-proves no claim row today. `apps-web/icon-page-claims-every-prop`, low: the icon reference page asserts completeness while documenting 3 of its interface's props. Also owed here as a fact-fix under #546's lens 4: `apps/web/src/routes/solid-spectrum/docs/index.tsx:106-109`, the getting-started snippet, is missing its `createSignal` import. The landing page's install line is #600.",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "#544's path now names the lens 4 re-proof as this ticket's obligation alongside #548's, at the Site stage and before #547 publishes. #546 is `merged` with lens 4 unproved and its status is not walked back, so the rows it handed over are re-proved here: every lens 4a/4b claim this ticket's pages carry is re-proved row by row, not by a gate result - Site Gate proves no claim row even once S5 enables it.",
    }
  - {
      state: open,
      at: 2026-09-22,
      note: "queue item (a) done: the round-1 finding `apps-web/icon-page-claims-every-prop` is fixed at its generator. `routeFile()` in `scripts/extract-api-reference.ts:446` wrote `Every prop <C> accepts in <pkg>` onto all 84 reference pages, and the extractor keeps a member only when `declaringPackage()` finds its declaration file under this workspace's `packages/` - so everything a props interface inherits through `extends JSX.*Attributes` was never listed and the sentence was false on every page with a DOM-typed base. The sentence now reads `The N props declared for <C> in <pkg> and the packages under it - inherited DOM attributes are not listed`. Proof, run at 7569d4a7 with the edit in place: `vp run guard:api-reference` exit 1, `DRIFT` on all 84 pages; `vp run api:extract` exit 0, `wrote 84 reference pages`; `vp run guard:api-reference` exit 0, `checked 84 reference pages`. The 84 regenerated descriptions measure 123-137 characters, inside `apps/web/e2e/seo.spec.ts:72-75` (>40, <=170); `scripts/extract-api-reference.test.ts` 3 passed; `vp lint` exit 0 on both changed kinds of file. Nothing but the one description line changed in each page (85 files, 85 insertions, 85 deletions). Residual, not touched: the on-page lede `ApiReference.tsx:49` says `The complete prop surface of <C>`, the same overclaim in conductor-owned copy - the page's own closing paragraph already says the element's standard attributes are left out, so the two disagree and the conductor owns the wording.",
    }
  - {
      state: open,
      at: 2026-09-22,
      note: "review of the note above, at `767ceae6`. Three problems raised, all three confirmed against the tree; two fixed here, one is a correction to this ticket's own record. (1) The replacement sentence swapped one wrong number for another: `propCount` summed every interface on the page but the wording attributed it to the page's component by name, wrong on 39 of the 84 pages - `icon` said 12 where `SpectrumIconProps` declares 3, `table` 258 where `TableProps` declares 54, `menu` 152 vs 41, `tree` 145 vs 38, `breadcrumbs` 90 vs 18, `text` 85 vs 14 - and `provider`'s 19 was not even a page total anyone could reach, since `ProviderInheritedProps` repeats six of `ProviderProps`' 13. `routeFile()` now counts `page.entries[0]`, which `buildPageData()` puts first precisely because it is the page's own component. (2) `inherited DOM attributes are not listed` understated `declaringPackage()`, which drops every member declared outside this workspace's `packages/`: `ProviderProps extends ParentProps` (`packages/viviana-ui/src/provider/index.tsx:63`), so `children` is declared by `solid-js` and `provider.json` lists 13 props without it. The clause now reads `props inherited from outside them are not listed`, which is the filter. It does not also name DOM attributes because of the 170-character SEO ceiling (`apps/web/e2e/seo.spec.ts:77`): measured, this wording runs 131-146 characters across the 84 pages and the shortest wording that names them runs 157-172. The page's closing paragraph names them already. The missing `children` is its own defect, ticketed #615 (614 is drafted in the conductor's plan, so the next free number here is 615). (3) Correction to the note above: `apps-web/icon-page-claims-every-prop` is NOT fixed and stays open. What was fixed is the `<meta name=description>`, which renders in the head; the sentence a visitor reads, `ApiReference.tsx:49` `The complete prop surface of <C>`, is untouched and still contradicts `:78-81` on the same page. It needs a sentence written, so it is queued for Fable as entry 2 of `.agents/COPY-QUEUE-2026-09-20.md`; entry 3 queues `apps/web/src/routes/docs/index.tsx:46`, where `3493 props` is every row the 84 pages render (measured: 187 interfaces, 3493 rows, 433 distinct prop names, 2130 rows on the 84 pages' own components) rather than a count of distinct props. `pages.json` is unchanged at 3493; the number is loose, not false, and which number the sentence should name is the conductor's call. Proof, run now at `767ceae6`: the new `routeFile` test in `scripts/extract-api-reference.test.ts` fails on the pre-fix generator (`expected The 12 props declared for SpectrumIco... to contain The 3 props declared for SpectrumIcon`) and passes after it, 4 passed; `vp run api:extract` exit 0, `wrote 84 reference pages`; `vp run guard:api-reference` exit 0, `checked 84 reference pages`; every one of the 84 descriptions re-read and matched against its page JSON - 84 agree with `entries[0].props.length` and the component they name, 0 disagree; lengths 131-146, none outside (40, 170]; only the one description line changed per page, and no page JSON changed. Unpushed, so no CI has seen it. The brief named this work `#549547`; there is no such ticket, and all three problems are #549's, so the commit says #549.",
    }
---

## Scope

1. Landing: say what the family is, show live components above the fold, give
   the Solid 2 install line, and route to docs, the theme studio, and the
   comparison evidence.
2. Docs: a getting-started path that works on Solid 2 from an empty project,
   a package-choice page, SSR and styling setup, and a status page generated
   from the certification data rather than typed by hand.
3. Keep the Glasselated register and the library's tokens. The app never
   redeclares a library token name. Demos of `solid-spectrum` keep Spectrum.
4. Every page passes the site's axe and contrast gate. Fix contrast at the
   token, not per page.
5. Deploy with the guarded target only.

## Done when

The getting-started steps work when followed literally in a clean directory.
Site Gate is green on the revision. The deployed site serves that revision.

## Proof

The clean-directory transcript, the Site Gate run id, `guard:deploy-target`
output, and the deployed revision marker.

## Relationship

Child of #544. Blocked by #545. Shares its claim list with #548.
