# Lens 4c — Dead Links in the Public Face

Audit of `/home/emoporemilio/projects/viviana-hub/ui` against brief `.agents/audit-2026-09-20/BRIEF.md` and task `.agents/audit-2026-09-20/lens4c-links.task.md`. Read-only analysis. Upstream oracle: `react-spectrum/` and local filesystem/routes.

## Coverage

- **Markdown files**:
  - `README.md` (root): examined
  - `CREDITS.md` (root): examined
  - `CONTRIBUTING.md` (root): skipped — file does not exist in checkout
  - `packages/geist/README.md`: examined (0 links)
  - `packages/kumo/README.md`: examined (0 links)
  - `packages/solid-spectrum/README.md`: examined
  - `packages/solid-stately/README.md`: examined
  - `packages/solidaria-components/README.md`: examined
  - `packages/solidaria/README.md`: examined
  - `packages/viviana-ui/README.md`: examined (0 links)
- **Web App Components & Routes**:
  - `apps/web/src/components/Header.tsx`: examined
  - `apps/web/src/routes/**` (182 route files across `apps/web/src/routes`): examined all `href=`, `to=`, and `<Link` targets, including dynamic routes generated from data collections (`apiPages`, `EXAMPLES`, `LAND_CARDS`, `PANELS`, `navItems`).

---

## External URLs (Not Fetched)

Every external URL used across the scoped files listed once with its usage location(s). As required, none were fetched:

| External URL | Where Used |
| :--- | :--- |
| `https://astro.build/` | `CREDITS.md:125` |
| `https://example.com` | `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:31` (code snippet), `apps/web/src/routes/solid-spectrum/playground.tsx:923, 938` |
| `https://fonts.googleapis.com` | `apps/web/src/routes/__root.tsx:28` |
| `https://fonts.googleapis.com/css2?family=Geist+Pixel:ELSH@1..80&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;700;800&display=swap` | `apps/web/src/routes/__root.tsx:34` |
| `https://fonts.gstatic.com` | `apps/web/src/routes/__root.tsx:29` |
| `https://github.com` | `apps/web/src/routes/showcase/buttons.tsx:115` |
| `https://github.com/adobe/react-spectrum` | `CREDITS.md:25` |
| `https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/react-aria/src/utils/shadowdom/ShadowTreeWalker.ts` | `CREDITS.md:49` |
| `https://github.com/cloudflare/kumo` | `CREDITS.md:62` |
| `https://github.com/halfmage/pixelarticons` | `CREDITS.md:110` |
| `https://github.com/kobaltedev/kobalte` | `CREDITS.md:81` |
| `https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/ShadowTreeWalker.ts` | `CREDITS.md:51` |
| `https://github.com/proyecto-viviana` | `apps/web/src/routes/solid-spectrum/docs/components/button.tsx:96` (code snippet), `100`; `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:34`; `apps/web/src/routes/solid-spectrum/docs/hooks/create-button.tsx:91`; `apps/web/src/routes/viviana-ui/docs/hooks/create-button.tsx:91` |
| `https://github.com/proyecto-viviana/ui` (via `REPO_URL`) | `apps/web/src/components/Header.tsx:190`; `apps/web/src/routes/solid-spectrum/index.tsx:139` |
| `https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md` (via `repoUrl`) | `apps/web/src/routes/index.tsx:323` |
| `https://github.com/proyecto-viviana/ui/blob/main/docs/adr/0001-s2-styling-source-of-truth.md` | `packages/solid-spectrum/README.md:38` |
| `https://github.com/proyecto-viviana/ui/blob/main/packages/geist/README.md` (via `repoUrl`) | `apps/web/src/routes/index.tsx:417` |
| `https://github.com/proyecto-viviana/ui/blob/main/packages/kumo/README.md#evidence-and-limits` (via `repoUrl`) | `apps/web/src/routes/index.tsx:449` |
| `https://github.com/proyecto-viviana/ui/tree/main/.claude/current` (via `repoUrl`) | `apps/web/src/routes/index.tsx:479` |
| `https://github.com/proyecto-viviana/ui/tree/main/apps/comparison/src/pages/experiments/kumo-button` (via `repoUrl`) | `apps/web/src/routes/index.tsx:456` |
| `https://github.com/proyecto-viviana/ui/tree/main/packages/geist` (via `repoPackageUrl("geist")`) | `apps/web/src/routes/index.tsx:413` |
| `https://github.com/proyecto-viviana/ui/tree/main/packages/kumo` (via `repoPackageUrl("kumo")`) | `apps/web/src/routes/index.tsx:445` |
| `https://github.com/proyecto-viviana/ui/tree/main/packages/solid-spectrum` (via `repoPackageUrl("solid-spectrum")`) | `apps/web/src/routes/solid-spectrum/ecosystem.tsx:180` |
| `https://github.com/proyecto-viviana/ui/tree/main/packages/solid-stately` (via `repoPackageUrl("solid-stately")`) | `apps/web/src/routes/solid-spectrum/ecosystem.tsx:195` |
| `https://github.com/proyecto-viviana/ui/tree/main/packages/solidaria` (via `repoPackageUrl("solidaria")`) | `apps/web/src/routes/solid-spectrum/ecosystem.tsx:190` |
| `https://github.com/proyecto-viviana/ui/tree/main/packages/solidaria-components` (via `repoPackageUrl("solidaria-components")`) | `apps/web/src/routes/solid-spectrum/ecosystem.tsx:185` |
| `https://github.com/proyecto-viviana/ui/tree/main/packages/viviana-ui` (via `repoPackageUrl("viviana-ui")`) | `apps/web/src/routes/solid-spectrum/ecosystem.tsx:175` |
| `https://playwright.dev/` | `CREDITS.md:128` |
| `https://proyectoviviana.org` (via `PARENT_APP_URL`) | `apps/web/src/routes/solid-spectrum/ecosystem.tsx:208` |
| `https://tanstack.com/` | `CREDITS.md:123` |
| `https://vercel.com/font` | `CREDITS.md:113` |
| `https://vercel.com/geist` | `README.md:91`; `CREDITS.md:73` |
| `https://vercel.com/geist/button` | `CREDITS.md:70` |
| `https://vite.dev/` | `CREDITS.md:127` |
| `https://vitest.dev/` | `CREDITS.md:127` |
| `https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum` | `apps/web/src/routes/index.tsx:68` |
| `https://www.npmjs.com/package/@proyecto-viviana/ui` | `apps/web/src/routes/index.tsx:68` |
| `https://www.solidjs.com/` | `CREDITS.md:121` |

---

## Relative and Internal Links Table

All relative/internal links across the scoped files, their source locations, resolved local targets, and verification status (`EXISTS` or `DEAD`):

| Link | Where | Target | Status |
| :--- | :--- | :--- | :--- |
| `packages/viviana-ui/README.md` | `README.md:44` | `packages/viviana-ui/README.md` | EXISTS |
| `LICENSE` | `README.md:80` | `LICENSE` | EXISTS |
| `NOTICE` | `README.md:82` | `NOTICE` | EXISTS |
| `LICENSE-APACHE-2.0` | `README.md:83` | `LICENSE-APACHE-2.0` | EXISTS |
| `CREDITS.md` | `README.md:86` | `CREDITS.md` | EXISTS |
| `packages/kumo/LICENSE-CLOUDFLARE` | `README.md:89` | `packages/kumo/LICENSE-CLOUDFLARE` | EXISTS |
| `LICENSE` | `CREDITS.md:6` | `LICENSE` | EXISTS |
| `NOTICE` | `CREDITS.md:8, 28, 53` | `NOTICE` | EXISTS |
| `LICENSE-APACHE-2.0` | `CREDITS.md:8` | `LICENSE-APACHE-2.0` | EXISTS |
| `packages/kumo/LICENSE-CLOUDFLARE` | `CREDITS.md:64` | `packages/kumo/LICENSE-CLOUDFLARE` | EXISTS |
| `src/index.ts` | `packages/solid-spectrum/README.md:51` | `packages/solid-spectrum/src/index.ts` | EXISTS |
| `src/index.ts` | `packages/solid-stately/README.md:37` | `packages/solid-stately/src/index.ts` | EXISTS |
| `src/index.ts` | `packages/solidaria-components/README.md:54` | `packages/solidaria-components/src/index.ts` | EXISTS |
| `src/index.ts` | `packages/solidaria/README.md:37` | `packages/solidaria/src/index.ts` | EXISTS |
| `#main-content` | `apps/web/src/components/Header.tsx:121` | `id="main-content"` in route layouts (`showcase/route.tsx`, `docs/route.tsx`, `examples/route.tsx`, `index.tsx`, `solid-spectrum/docs/route.tsx`, `solid-spectrum/index.tsx`, `solid-spectrum/playground.tsx`, `theme.tsx`, `viviana-ui/docs/route.tsx`, `solid-spectrum/ecosystem.tsx`) | EXISTS |
| `/` | `apps/web/src/components/Header.tsx:150` | `apps/web/src/routes/index.tsx` | EXISTS |
| `/` | `apps/web/src/components/Header.tsx:166` | `apps/web/src/routes/index.tsx` | EXISTS |
| `/showcase` | `apps/web/src/components/Header.tsx:169` | `apps/web/src/routes/showcase/index.tsx` | EXISTS |
| `/viviana-ui/docs` | `apps/web/src/components/Header.tsx:175` | `apps/web/src/routes/viviana-ui/docs/index.tsx` | EXISTS |
| `/solid-spectrum/docs` | `apps/web/src/components/Header.tsx:178` | `apps/web/src/routes/solid-spectrum/docs/index.tsx` | EXISTS |
| `/examples` | `apps/web/src/components/Header.tsx:181` | `apps/web/src/routes/examples/index.tsx` | EXISTS |
| `/theme` | `apps/web/src/components/Header.tsx:184` | `apps/web/src/routes/theme.tsx` | EXISTS |
| `/favicon.ico` | `apps/web/src/routes/__root.tsx:27` | `apps/web/public/favicon.ico` | EXISTS |
| `/` (redirect in beforeLoad) | `apps/web/src/routes/admin.tsx:16` | `apps/web/src/routes/index.tsx` | EXISTS |
| `/viviana-ui/docs` | `apps/web/src/routes/docs/index.tsx:56` | `apps/web/src/routes/viviana-ui/docs/index.tsx` | EXISTS |
| `/showcase` | `apps/web/src/routes/docs/index.tsx:60` | `apps/web/src/routes/showcase/index.tsx` | EXISTS |
| `/solid-spectrum/docs` | `apps/web/src/routes/docs/index.tsx:64` | `apps/web/src/routes/solid-spectrum/docs/index.tsx` | EXISTS |
| `/docs/components/${page.slug}` (84 pages via `apiPages`) | `apps/web/src/routes/docs/index.tsx:81` | `apps/web/src/routes/docs/components/${page.slug}.tsx` (all 84 component routes exist) | EXISTS |
| `/docs` | `apps/web/src/routes/docs/route.tsx:144` | `apps/web/src/routes/docs/index.tsx` | EXISTS |
| `/docs/components/${page.slug}` (84 pages via `apiPages`) | `apps/web/src/routes/docs/route.tsx:184` | `apps/web/src/routes/docs/components/${page.slug}.tsx` (all 84 component routes exist) | EXISTS |
| `/examples/lesson` | `apps/web/src/routes/examples/home.tsx:132, 171` | `apps/web/src/routes/examples/lesson.tsx` | EXISTS |
| `/examples/explore` | `apps/web/src/routes/examples/home.tsx:135` | `apps/web/src/routes/examples/explore.tsx` | EXISTS |
| `/examples/${example.slug}` (10 screens: `landing`, `home`, `explore`, `explore-empty`, `lesson`, `theater`, `live`, `profile`, `settings`, `playground`) | `apps/web/src/routes/examples/index.tsx:36` | `apps/web/src/routes/examples/${slug}.tsx` (all 10 route files exist) | EXISTS |
| `/examples/explore` (from `NAV`) | `apps/web/src/routes/examples/landing.tsx:78` | `apps/web/src/routes/examples/explore.tsx` | EXISTS |
| `/examples/live` (from `NAV`) | `apps/web/src/routes/examples/landing.tsx:78` | `apps/web/src/routes/examples/live.tsx` | EXISTS |
| `/examples/playground` (from `NAV`) | `apps/web/src/routes/examples/landing.tsx:78` | `apps/web/src/routes/examples/playground.tsx` | EXISTS |
| `/examples/${card.slug}` (`lesson`, `explore`, `live` from `LAND_CARDS`) | `apps/web/src/routes/examples/landing.tsx:154` | `apps/web/src/routes/examples/${slug}.tsx` | EXISTS |
| `/examples/settings` | `apps/web/src/routes/examples/profile.tsx:66` | `apps/web/src/routes/examples/settings.tsx` | EXISTS |
| `/examples/explore` | `apps/web/src/routes/examples/profile.tsx:69` | `apps/web/src/routes/examples/explore.tsx` | EXISTS |
| `/examples/lesson` | `apps/web/src/routes/examples/theater.tsx:133` | `apps/web/src/routes/examples/lesson.tsx` | EXISTS |
| `/viviana-ui/docs` | `apps/web/src/routes/index.tsx:80, 347` | `apps/web/src/routes/viviana-ui/docs/index.tsx` | EXISTS |
| `/solid-spectrum/docs` | `apps/web/src/routes/index.tsx:80, 354` | `apps/web/src/routes/solid-spectrum/docs/index.tsx` | EXISTS |
| `#libraries` | `apps/web/src/routes/index.tsx:319` | `<section id="libraries">` in `apps/web/src/routes/index.tsx:332` | EXISTS |
| `/showcase` | `apps/web/src/routes/showcase/buttons.tsx:111` | `apps/web/src/routes/showcase/index.tsx` | EXISTS |
| `/showcase/${panel.slug}` (15 panels: `buttons`, `inputs`, `selection`, `pickers`, `status`, `chips`, `navigation`, `collections`, `overlays`, `datetime`, `color`, `cards`, `sliders`, `type`, `scene`) | `apps/web/src/routes/showcase/index.tsx:86` | `apps/web/src/routes/showcase/${slug}.tsx` (all 15 panel route files exist) | EXISTS |
| `#` (placeholder link) | `apps/web/src/routes/showcase/navigation.tsx:181, 182, 185, 188` | Self-reference hash anchor | EXISTS |
| `#` (breadcrumb placeholder) | `apps/web/src/routes/solid-spectrum/docs/components/breadcrumbs.tsx:71, 79, 91, 100, 126, 139, 151, 163, 177, 185` | Self-reference hash anchor | EXISTS |
| `/current` (inside example code string: `code={`<Link href="/current" aria-current="page">Current Page</Link>`}`) | `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:70` | `apps/web/src/routes/current.tsx` (fictitious route in demo code string) | DEAD |
| `/solid-spectrum/docs/installation` | `apps/web/src/routes/solid-spectrum/docs/index.tsx:164` | `apps/web/src/routes/solid-spectrum/docs/installation.tsx` | EXISTS |
| `/solid-spectrum/docs/components/button` | `apps/web/src/routes/solid-spectrum/docs/index.tsx:173` | `apps/web/src/routes/solid-spectrum/docs/components/button.tsx` | EXISTS |
| `/solid-spectrum/docs/hooks/create-button` | `apps/web/src/routes/solid-spectrum/docs/index.tsx:182` | `apps/web/src/routes/solid-spectrum/docs/hooks/create-button.tsx` | EXISTS |
| `/solid-spectrum` | `apps/web/src/routes/solid-spectrum/docs/route.tsx:353` | `apps/web/src/routes/solid-spectrum/index.tsx` | EXISTS |
| `/solid-spectrum/docs` | `apps/web/src/routes/solid-spectrum/docs/route.tsx:539, 559` | `apps/web/src/routes/solid-spectrum/docs/index.tsx` | EXISTS |
| `/solid-spectrum/docs/installation` | `apps/web/src/routes/solid-spectrum/docs/route.tsx:539, 559` | `apps/web/src/routes/solid-spectrum/docs/installation.tsx` | EXISTS |
| `/solid-spectrum/docs/components/${slug}` (44 components from `import.meta.glob("./components/*.tsx")`) | `apps/web/src/routes/solid-spectrum/docs/route.tsx:539, 559` | `apps/web/src/routes/solid-spectrum/docs/components/${slug}.tsx` (all 44 exist) | EXISTS |
| `/solid-spectrum/docs/hooks/${slug}` (`create-button`, `create-press` from `import.meta.glob("./hooks/*.tsx")`) | `apps/web/src/routes/solid-spectrum/docs/route.tsx:539, 559` | `apps/web/src/routes/solid-spectrum/docs/hooks/${slug}.tsx` (both exist) | EXISTS |
| `/solid-spectrum/playground` | `apps/web/src/routes/solid-spectrum/docs/route.tsx:578` | `apps/web/src/routes/solid-spectrum/playground.tsx` | EXISTS |
| `/solid-spectrum/docs` | `apps/web/src/routes/solid-spectrum/index.tsx:135` | `apps/web/src/routes/solid-spectrum/docs/index.tsx` | EXISTS |
| `/viviana-ui/docs/installation` | `apps/web/src/routes/viviana-ui/docs/index.tsx:157` | `apps/web/src/routes/viviana-ui/docs/installation.tsx` | EXISTS |
| `/viviana-ui/docs/components/button` | `apps/web/src/routes/viviana-ui/docs/index.tsx:166` | `apps/web/src/routes/viviana-ui/docs/components/button.tsx` | EXISTS |
| `/viviana-ui/docs/hooks/create-button` | `apps/web/src/routes/viviana-ui/docs/index.tsx:175` | `apps/web/src/routes/viviana-ui/docs/hooks/create-button.tsx` | EXISTS |
| `/viviana-ui/docs` | `apps/web/src/routes/viviana-ui/docs/route.tsx:306` | `apps/web/src/routes/viviana-ui/docs/index.tsx` | EXISTS |
| `/viviana-ui/docs` | `apps/web/src/routes/viviana-ui/docs/route.tsx:492, 512` | `apps/web/src/routes/viviana-ui/docs/index.tsx` | EXISTS |
| `/viviana-ui/docs/installation` | `apps/web/src/routes/viviana-ui/docs/route.tsx:492, 512` | `apps/web/src/routes/viviana-ui/docs/installation.tsx` | EXISTS |
| `/docs` | `apps/web/src/routes/viviana-ui/docs/route.tsx:492, 512` | `apps/web/src/routes/docs/index.tsx` | EXISTS |
| `/viviana-ui/docs/components/button` | `apps/web/src/routes/viviana-ui/docs/route.tsx:492, 512` | `apps/web/src/routes/viviana-ui/docs/components/button.tsx` | EXISTS |
| `/viviana-ui/docs/hooks/create-button` | `apps/web/src/routes/viviana-ui/docs/route.tsx:492, 512` | `apps/web/src/routes/viviana-ui/docs/hooks/create-button.tsx` | EXISTS |
| `/viviana-ui/docs/hooks/create-press` | `apps/web/src/routes/viviana-ui/docs/route.tsx:492, 512` | `apps/web/src/routes/viviana-ui/docs/hooks/create-press.tsx` | EXISTS |
| `/showcase` | `apps/web/src/routes/viviana-ui/docs/route.tsx:531` | `apps/web/src/routes/showcase/index.tsx` | EXISTS |

---

## DEAD Rows Only

| Link | Where | Target | Status |
| :--- | :--- | :--- | :--- |
| `/current` | `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:70` | `apps/web/src/routes/current.tsx` | DEAD |

*Note*: `/current` is located within the `code` string prop of an `<Example>` component (`code={`<Link href="/current" aria-current="page">Current Page</Link>`}`) illustrating how `aria-current="page"` works. The rendered JSX immediately below it does not use `href="/current"`, using `<Link onPress={() => {}} aria-current="page">Components</Link>` instead. If evaluated as a routable link target, no file `apps/web/src/routes/current.tsx` exists.

---

## Findings

### LOW Fictitious `/current` route demonstrated in Link documentation code snippet
- where: `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:70`
- what: The "Current Page" `<Example>` demonstrates `<Link href="/current" aria-current="page">Current Page</Link>` in its `code` string, but no `/current` route exists in `apps/web/src/routes`.
- proof: `ls apps/web/src/routes/current*` exits with error code 2 (No such file or directory). The live rendered preview at lines 72-78 uses `onPress` instead of `href="/current"`.
- expected: Example code should either reference an existing route (e.g. `/solid-spectrum/docs/components/link`), a hash anchor (e.g. `#current`), or clearly mark dummy placeholder URLs to avoid confusing consumers who copy snippet code.
- blast radius: Readers copying example code from `solid-spectrum` Link component documentation.

### LOW Hardcoded GitHub organization URLs bypass `REPO_URL` constant in documentation examples
- where: `apps/web/src/routes/solid-spectrum/docs/components/button.tsx:96, 100`; `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:34`; `apps/web/src/routes/solid-spectrum/docs/hooks/create-button.tsx:91`; `apps/web/src/routes/viviana-ui/docs/hooks/create-button.tsx:91` (5 occurrences)
- what: Five doc examples hardcode `https://github.com/proyecto-viviana` directly instead of using `REPO_URL` (`https://github.com/proyecto-viviana/ui`) from `@/lib/site`.
- proof: `rg -n 'https://github.com/proyecto-viviana"' apps/web/src/routes` finds 5 occurrences. `apps/web/src/lib/site.ts:1-12` states the architectural requirement: "Every GitHub URL on the site now derives from `REPO_URL`, so the name can only be wrong in one place."
- expected: Use `REPO_URL` from `@/lib/site` or cite the full repository URL rather than pointing to the bare organization page.
- blast radius: Documentation examples in `solid-spectrum` and `viviana-ui`.

---

## Verdict

Ship the release candidate regarding links. Across all public documentation, package READMEs, and the web application routes, **zero live navigational links are broken**. All 84 API reference component pages, 10 example screens, 15 showcase panels, and 44 solid-spectrum component documentation routes correctly map to real route files in `apps/web/src/routes/**`.

Three things to fix first:

1. **Normalize doc snippet URLs**: Update `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:70` to reference a valid route or anchor instead of `/current`.
2. **Standardize GitHub URLs in doc examples**: Replace hardcoded `https://github.com/proyecto-viviana` in the 5 component/hook doc examples with `REPO_URL` or canonical repository URLs per `@/lib/site.ts` policy.
3. **Add CONTRIBUTING.md**: The repository has `README.md` and `CREDITS.md` with complete attribution and license references, but lacks `CONTRIBUTING.md` at the root.
