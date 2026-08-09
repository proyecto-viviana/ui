---
kind: reference
status: done
---

# Launch

Status: completed program summary (2026-07-24).
Update when: a factual correction changes the recorded launch outcome. Current
execution lives in `repo-assessment.md`.

The completed plan that took Proyecto Viviana public: docs site deployed,
packages discoverable and documented for external users. Distilled from the
repo-wide audit of **2026-07-24**. Remaining catalogue guidance moved to the
comparison-docs program and GitHub issue #27; it is not an unlaunched state.

## The reframe

The audit's central finding is that **the packages are not the blocker — they
already ship and they already work**. Verified, not assumed:

- `vp run ui:smoke` passes: all five tarballs installed into a throwaway project
  _outside the workspace_, DOM + SSR built, a styled `<button>` rendered.
  149/149 export-map files present, 36/36 JS subpaths resolve, 64/64 rendered
  classes backed by a CSS rule, no `src/` leak.
- Local `main` == `origin/main` == npm, 0 ahead / 0 behind, all five packages
  published. OIDC trusted publishing works end-to-end with provenance.
- Unit suite green: 265 files, 5535 passed, 1 expected-fail, 10 skipped.
- 11 of 12 static guards green; S2 catalogue parity 78/78, zero gap.

What was _not_ ready is the **documentation surface and the deployed site**. The
site had never been deployed under a name of its own — see B6 below, which is
the finding that cost the most to get right. It now serves from
`https://ui.proyectoviviana.org`. What remains is the docs surface: the launch
problem is a docs problem, not a library problem, and this plan is ordered
accordingly.

## The two-product problem

The single most important structural gap, because it misleads every new user.

The repo ships two products on one stack:

|                                             | `@proyecto-viviana/solid-spectrum`                                  | `@proyecto-viviana/ui`                                                               |
| ------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| What it is                                  | S2-parity port, pinned to Spectrum 1.5.1                            | The Viviana register (Glasselated)                                                   |
| Visual identity                             | Adobe Spectrum, parity-locked                                       | Geist trio, glass + pixel                                                            |
| Docs-site coverage                          | 45 hand-written doc pages with live examples, playground, ecosystem | 82 **generated** API pages under `/docs` (3,367 props), plus the `/showcase` gallery |
| What the root README tells users to install | —                                                                   | **this one**                                                                         |

So the package we point users at has no reference documentation, and the fully
documented package is the one framed as the parity substrate.

**Resolution adopted 2026-07-24:** `@proyecto-viviana/ui` is the flagship — the
thing users install and the thing the site leads with. `solid-spectrum` is
documented as the parity substrate underneath it, and stays the correct choice
for anyone who wants Adobe Spectrum's look rather than Viviana's. This matches
what the root README already says; the site is what has to catch up. Recorded
here rather than silently encoded, because it is a naming-and-positioning call
with public reach (AGENTS.md rule #3).

## Launch-blocking findings

Each is tracked in `tech-debt.md`; IDs below are stable references.

| ID  | Finding                                                                                                                                                                                                   | Evidence                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| B1  | 6 broken GitHub links — `github.com/proyecto-viviana/proyecto-viviana` 404s; the repo is `proyecto-viviana/ui`                                                                                            | `Header.tsx:181`, `solid-spectrum/index.tsx:130`, `ecosystem.tsx:165,170,175,180`                                             |
| B2  | Installation page is materially wrong — never mentions `@proyecto-viviana/ui`, tells users to hand-author `:root` custom properties instead of importing the shipped stylesheets, omits `vivianaMacros()` | `apps/web/src/routes/solid-spectrum/docs/installation.tsx`; contradicted by `packages/viviana-ui/README.md`, which is correct |
| B3  | ~~No API docs for the flagship package — 238 exported names, zero reference pages~~ **Resolved 2026-07-24**: `/docs` serves 82 generated pages / 3,367 props, guarded by `guard:api-reference`; see below | `packages/viviana-ui/src/index.ts`; `scripts/extract-api-reference.ts`                                                        |
| B4  | `vp check` RED on main — 174 files with format drift, invisible in CI because `ci:release-readiness` has no format step and `certification-gates.yml` runs everything `continue-on-error: true`           | `vp check` exit 1                                                                                                             |
| B5  | `docs:check` RED — 9 errors (5 missing status headers, 1 bad roadmap ref, 2 done-without-finished-date, 1 invalid roadmap status)                                                                         | gate output                                                                                                                   |
| B6  | ~~Site is 24 days stale~~ → **the docs site had no deploy target of its own**; its worker name was the live production app's. Resolved: Worker `viviana-ui-docs` on `ui.proyectoviviana.org`              | `wrangler versions view`; see below                                                                                           |
| B7  | npm metadata gaps — no `homepage` on any of the 5 packages; `viviana-ui` has 0 keywords and an internal-jargon description                                                                                | `package.json` × 5                                                                                                            |
| B8  | `a11y:smoke` RED (12 failed / 32 passed) — stale test selectors, not a product regression                                                                                                                 | see below                                                                                                                     |

### B3 resolution — the reference is generated, not written

`/docs` now serves **82 component pages covering 3,367 props** across 183
interfaces of `@proyecto-viviana/ui`, and **not one line of it is
hand-authored**. `vp run api:extract` builds a `ts.createProgram` over the
package barrel, walks `getApparentType(...).getProperties()` for every exported
component's props type, and writes one JSON payload per page plus one TSX route
per page. `vp run guard:api-reference` re-runs the extractor with `--check` and
fails if the committed output no longer matches the types — so a prop renamed in
the package breaks CI rather than quietly turning a docs page into a lie. It is a
blocking step in `certification-gates.yml`.

Three decisions did the real work:

**The member filter is structural, not a list.** The naive walk returns **40,966
members** — `BadgeProps` alone reports 456, because `HTMLAttributes` drags in
every DOM event handler `solid-js` declares. A member's _declaring file_ answers
the question cleanly: keep what is declared under `/packages/`, drop what comes
from the JSX namespace. That single rule cuts 40,966 → **3,367** and lifts JSDoc
coverage from 24% to **87.7%**, with **zero hand-maintained allowlist**
(`BadgeProps`: 456 → 12). The only hand-kept input in the whole generator is
`OWN_PAGE`, a 21-name set that promotes a few sub-components to their own page,
and it fails safe — a name missing from it means a slightly busier page, not a
wrong one.

**One JSON per page, never one per register.** The first cut imported a single
register-wide module from the layout, which folded every prop table into one
shared chunk: **136.31 kB gz**. Per-page payloads plus a small `pages.json` index
for the sidebar took the shared chunk to **908 B gz**, the renderer to 2.5 kB gz,
and the worst per-page route (`table`) to 11 kB gz.

**Divergence is precomputed per page, in the direction the reader is standing.**
The two registers share prop _names_ but not prop _values_: viviana-ui's `Button`
adds `'warning' | 'success' | 'create'` and lacks solid-spectrum's `'premium' |
'genai'`. A shared table would print a lie to whichever package the reader
installed, so each page carries its own diff (24 divergences site-wide) and
renders it as a callout above the table.

The head titles are suffixed ` props` because `/docs/components/accordion` and
`/solid-spectrum/docs/components/accordion` otherwise collide on one title —
caught by `test:seo`, which is exactly what it is for. `check-doc-routes.ts` was
generalized from a single hardcoded base path to a list of trees and now covers
**129 docs routes**; `MINIMUM_EXPECTED_ROUTES` went 60 → 140 (the site parses
154). `e2e/api-reference.spec.ts` reads the same JSON the pages import and
requires it on screen, because a page whose data loaded but whose table rendered
nothing would still clear the route sweep's text floor on its intro prose alone.

One accessibility note, recorded so it is not rediscovered: an axe probe of the
new pages returns real `color-contrast` failures, but **the same probe returns
the same failures with the same computed colours on the pre-existing
`/solid-spectrum/docs/components/badge`**. They are token-level, they are filed
with measurements in `tech-debt.md`, and they are not this feature's to fix. The
one failure that _was_ this feature's — an `opacity: 0.55` on the "Not yet
documented" placeholder, 2.0:1 and the worst ratio on the page — is fixed here.

### B8 root cause

All 12 failures share one cause. The Glasselated rebuild (`8a8db7d4`,
`88c07da4`) replaced the playground's `<p>` readouts with solid-spectrum's
`<Text>`, and `TextProps extends BaseContentProps<HTMLSpanElement>` — `Text`
renders a **`<span>`**. Five selectors still pin the `p` tag:

- `e2e/calendar-regression.spec.ts:35` — `locator("p").filter({hasText: /\d+ of \d+ visible/})`, against `components/playground/sections.tsx:66`
- `e2e/playground-components.spec.ts:318,340,362,415` — `locator("p", {hasText: "Selected:"})`, against the `DemoReadout` helper in `components/playground/advanced-data-color-sections.tsx:196`

The 8 calendar failures die in _setup_, at the first `expectVisibleCount(page, 0)`
before any interaction, polling a `<p>` that no longer exists until the 15s
timeout. Confirmed not the stale-preview trap: no listener on the test ports and
`apps/web/dist` was rebuilt during the run; it reproduces on a clean rebuild.

### B6 re-scoped — the deploy target is not ours

The audit read "last Cloudflare deployment 2026-06-30" as _our_ site going
stale. Checked before deploying, that turned out to be the wrong reading, and
the correction is the more important finding.

`apps/web/wrangler.jsonc` declared `name: "proyecto-viviana"`. The Worker by
that name in this account is the **live parent application**. `wrangler versions
view 7693d091-…` on the current deployment shows a D1 binding, a
`WEB_CLIENT_SECRET`, and `APP_URL=https://proyectoviviana.org` /
`AUTH_URL=https://auth.proyectoviviana.org` / `ENVIRONMENT=production` on
compatibility date 2026-06-27; ours declares no bindings and 2025-12-01. From
outside, `https://proyectoviviana.org` 302s to `/es` and serves a locale-routed
app that 404s `/es/showcase` — none of our routes exist there.

So `vp run deploy` from this repo would have uploaded the docs site **over a
running production application**. The 2026-06-30 date is that app's last deploy
(by CI — author `undefined`); the manual deploys from 06-22 to 06-29 are most
likely this site, which means the two have been sharing one worker name and the
app won last.

No host was reserved for the docs either: `ui.proyectoviviana.org`,
`docs.proyectoviviana.org` and `proyecto-viviana.workers.dev` all failed to
resolve, and nothing in the repo documented a target. That made Phase 4 an owner
decision rather than an engineering task, and the owner took it the same day:
**Worker `viviana-ui-docs`, custom domain `ui.proyectoviviana.org`** — a
subdomain of the domain that already exists, so the apex stays with the parent
app. `SITE_URL` moved with it, which moved all 70 canonicals, the OG URLs and
the sitemap; `public/robots.txt` repeats the origin and `test:seo` asserts they
agree.

`guard:deploy-target` (`scripts/check-deploy-target.mjs`) is what keeps the near
miss from recurring: it runs as the first step of `deploy` and refuses the
production app's name outright. It guards the deploy path, not the branch — it
is expected to exit 1 whenever the name is wrong — so it is deliberately not in
`certification-gates.yml`.

Same probe answered the other open question: **`https://proyecto-viviana.uy` has
no DNS record at all** — the ecosystem tile's link to the parent project was
dead. It now goes through `PARENT_APP_URL` in `@/lib/site`, pointing at
`https://proyectoviviana.org`, where the parent app actually serves.

### Why B4, B5 and B8 were invisible

`accessibility-playground.yml` is correctly blocking (zero `continue-on-error`)
but triggers **only on `pull_request`** — and work lands straight on `main`, so
it has never run on this work. `release-readiness.yml` does not include a11y or
a format check. `certification-gates.yml` runs all 19 gates report-only.

The lesson generalizes: **a gate that cannot fire is not a gate.** Making the
existing gates actually block is itself a launch item, not a nice-to-have.

**Closed 2026-07-24** (`tech-debt.md` → `launch-gates-cannot-fire`, which carries
the full inventory). 18 gates in `certification-gates.yml` are now blocking;
3 stay advisory and each states inline what would promote it. The a11y workflow
became `site-gate.yml` running `ci:site` (a11y + the 72-route sweep), and
`ci:release-readiness` gained `vp run check`. Two guards that lived in
`package.json` but in no workflow at all — `guard:invented-utilities` and
`guard:outbound-links` — were wired in while promoting.

The method mattered as much as the result: **every gate was run locally and
observed green before its `continue-on-error` came off.** Promoting a gate you
have not measured is the same mistake as writing one that cannot fire — it just
fails later and louder. The three that are still advisory are advisory precisely
because they were measured and were not green. `comparison:test:certified` shows
the rule working in both directions: it was held back for a day as unmeasured,
then run to completion (2169 passed, 7 skipped, exit 0, 17.2 min) and promoted on
the evidence — which also retires the long-standing assumption that the deferred
D4 event-ordering policy was keeping it red.

**Closed 2026-08-08:** the later incident repair expanded Certification to 26
blocking steps with one freshness advisory. After hosted PR head
`98670653651fc4bd11d6e2338a05212bef019f1a` passed all four intended contexts,
strict `main` protection was enabled for exactly `certification-gates`,
`changesets-check`, `release-readiness`, and `site-gate`, with administrator
enforcement and no force pushes or deletions. That closes `ci-gates-required`.

## Coverage gaps (not launch-blocking, but next)

- **~31–40 of 78 catalogue components have no docs page.** 45 pages exist, 7 of
  which are aliases covering multiple components. Missing include ActionButton,
  ActionMenu, Autocomplete, Avatar, Card, CardView, CheckboxGroup, all six
  `Color*`, Divider, Form, InlineAlert, LabeledValue, ListBox, ListView,
  ProgressCircle, RadioGroup, RangeSlider, SegmentedControl, StatusLight,
  StepList, TableView, ToggleButton, TreeView.
- ~~**E2E covers 5 of 75 routes**~~ — **closed 2026-07-24.** `vp run test:routes`
  sweeps all 72 URLs, derived from the generated route tree. It immediately found
  a docs page that was already shipping broken (`tree-multi-root-hydration`),
  which is what "would ship silently" meant in practice. Axe still scans only the
  playground. Note for anyone writing a smoke check here: the root ErrorBoundary
  answers **200 with a full page of text**, so a page that throws looks healthy to
  status, byte-length and console checks alike — the sweep asserts the boundary is
  absent, and that assertion is the whole test.
- ~~**SEO surface essentially absent**~~ — **closed 2026-07-24.** All 70
  indexable routes now set their own title, description, canonical and OG tags
  through `apps/web/src/seo.ts`; `robots.txt` ships in `public/` and
  `sitemap.xml` is generated at build time from the route tree. `vp run test:seo`
  is the gate, and it deliberately asserts each title is the route's _own_ rather
  than merely present — the root fallback made "has a title" pass for all 72
  routes while every one of them said "Proyecto Viviana".
- **7 S2 exports still missing**, all drag-and-drop (`LabeledValueContext`,
  `useDragAndDrop`, `DragPreview`, `DIRECTORY_DRAG_TYPE`,
  `is{Text,File,Directory}DropItem`) — tracked as `dnd-subsystem-port`.
- **`macro-route-styled`** — 14 components still ship unstyled to installed
  consumers.

## Phases

Ordered so that nothing public is fixed while the tracking layer still lies
about it, and nothing deploys while a gate is red.

**Phase 0 — record and clean.** Land this file; refresh `status.md` from the
scripts; repoint `steering.md`; file every finding as a task; clear the 9
`docs:check` errors; delete the stale docs trees; clear the 174-file format
drift and the tracked strays.

**Phase 1 — make the gates real.** Fix the 5 e2e selectors (B8). Promote
`vp check` and `docs:check` to blocking, and fire the a11y gate on push to main,
not only on PRs.

**Phase 2 — make the site truthful.** Fix the 6 GitHub links (B1). Rewrite the
installation page around the real shipped-CSS story (B2). Make the nav and
landing carry the two-product story. Add npm metadata (B7).

**Phase 3 — make it safe to deploy.** ☑ Route-sweep smoke over all 75 routes;
per page `head:`; robots.txt and sitemap. Both gates (`test:routes`,
`test:seo`) run from `ci:site`.

**Phase 4 — deploy.** ☑ Done 2026-07-24. The owner decision that blocked it (see
"B6 re-scoped" above) settled on Worker `viviana-ui-docs` served from
`https://ui.proyectoviviana.org` as a Custom Domain, so wrangler owns the DNS
record and the zone cannot drift from the Worker. `SITE_URL` moved with it —
every canonical and the whole sitemap derive from that one constant — as did
`homepage` on the five published packages. Deployed version
`61f0f535-b187-4da0-8968-38cee17eecbf`, 354 files uploaded; `/`, `/showcase`,
`/solid-spectrum/docs/components/picker`, `/theme`, `/robots.txt` and
`/sitemap.xml` all verified 200 against the live origin, `/admin` 307 as
designed, and the head of a docs page carries its own title and canonical. The
parent application was re-checked afterwards and is untouched.

**Phase 5 — continuing product work, outside launch.** viviana-ui API docs (B3)
were done 2026-07-24 with 82 generated pages under `/docs`. Remaining authored
Spectrum guidance, `dnd-subsystem-port`, and `macro-route-styled` now run through
`repo-assessment.md`; they do not reopen the completed deployment.

## Non-goals for launch

- Certifying anything new. The recertification march is complete and shelved;
  launch does not reopen it.
- Reaching 100% component docs coverage before deploying. A truthful site with
  45 documented components beats an undeployed site with 78.
- Publishing new package versions. The packages on npm are current and pass the
  out-of-workspace smoke; launch is about making them findable and documented.
