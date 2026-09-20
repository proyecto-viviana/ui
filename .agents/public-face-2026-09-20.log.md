# Public Face Landing Log — 2026-09-20

## Files Landed
- `README.md`
- `CONTRIBUTING.md`
- `packages/geist/README.md`
- `packages/kumo/README.md`
- `packages/solid-spectrum/README.md`
- `packages/solid-stately/README.md`
- `packages/solidaria-components/README.md`
- `packages/solidaria/README.md`
- `packages/viviana-ui/README.md`

## Corrections Applied or Skipped
- **Entry 1 (Adobe section names no pinned version)**: Applied. Inserted pinned upstream bullet under the existing `Source:` bullet in `CREDITS.md`.
- **Entry 2 (Kumo version pair is unlinked)**: Applied. Inserted current source reference bullet directly after `Initial source version` bullet in `CREDITS.md`.
- **Entry 3 (Bare URL in Geist section)**: Applied. Wrapped `https://vercel.com/geist/button` with angle brackets `<https://vercel.com/geist/button>` in `CREDITS.md`.
- **Skipped**: None. All three entries were unambiguous.

## Grep Output
`grep -rn '@next' README.md CONTRIBUTING.md packages/*/README.md`:
```
README.md:50:npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
packages/solid-spectrum/README.md:16:npm install @proyecto-viviana/solid-spectrum@rc solid-js@next @solidjs/web@next
packages/solid-stately/README.md:16:npm install @proyecto-viviana/solid-stately@rc solid-js@next @solidjs/web@next
packages/solidaria-components/README.md:16:npm install @proyecto-viviana/solidaria-components@rc solid-js@next @solidjs/web@next
packages/solidaria/README.md:16:npm install @proyecto-viviana/solidaria@rc solid-js@next @solidjs/web@next
packages/viviana-ui/README.md:16:npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
```

## Commit SHA
- Commit SHA: `a6a9e71702d58949d7dff6ad77f5aac715cf2162` (`a6a9e717`)
- Commit message: `#548: land the package READMEs, the front door and CONTRIBUTING`

## Audit cross-check

| Source File + ID | Verdict | Quoted Line | Action |
| --- | --- | --- | --- |
| lens3-consumer.md: CRITICAL changeset publish from this tree ships Solid 2 onto latest | N/A | `packages/solid-stately/package.json:3`: `"version": "0.5.2"` | None (finding is about package.json versions and Changesets publish plan) |
| lens3-consumer.md: CRITICAL pre enter tag is both the npm dist-tag and the -X.N identifier | N/A | `packages/viviana-ui/package.json:3`: `"version": "0.7.0"` | None (finding is about Changesets pre mode tags) |
| lens3-consumer.md: CRITICAL SSR consumers that miss the solid condition crash in template() | STILL | `packages/viviana-ui/README.md:92`: `import solid from "vite-plugin-solid";` | Do not fix (Vite config / SSR condition / Solid 2 JSX import source in README; outside allowed fix scope) |
| lens3-consumer.md: HIGH peer range admits 2.0.0-rc.10 / 2.0.0 / 2.1.0, but @solidjs/web@latest is 2.0.0-rc.0 and does not satisfy it | GONE | `README.md:50`: `npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next` | None (install blocks now specify `@rc` tag and pin `solid-js@next @solidjs/web@next`) |
| lens3-consumer.md: HIGH the only off-workspace consume proof is local, --legacy-peer-deps, and Button-only | N/A | `scripts/consume-pack-smoke.mjs:226`: `npm install --legacy-peer-deps` | None (finding is about consume smoke test script) |
| lens3-consumer.md: HIGH workspace:* survives changeset version and becomes an exact pin at pnpm publish | N/A | `.changeset/config.json:11`: `"fixed": []` | None (finding is about Changesets pnpm publish dependency rewrite) |
| lens3-consumer.md: MEDIUM unpublished 2026-09-12 version train already absorbed breaking API | N/A | `packages/solidaria-components/CHANGELOG.md:7`: `## 0.6.0` | None (finding is about CHANGELOG.md headings and version bump) |
| lens3-consumer.md: MEDIUM published solid-spectrum CSS default still points at src/ | N/A | `packages/solid-spectrum/package.json:227`: `"./components.css": {` | None (finding is about package exports, not a defect in README) |
| lens3-consumer.md: LOW ignored kumo changeset is leftover, not a mixed-file bomb | N/A | `.changeset/config.json:16`: `"ignore": ["@proyecto-viviana/kumo", "@proyecto-viviana/geist"]` | None (finding is about changeset files) |
| lens3-consumer.md: LOW no engines, SPDX license string change, sideEffects CSS glob | N/A | `packages/viviana-ui/package.json:5`: `"license": "MIT AND Apache-2.0"` | None (finding is about package.json fields) |
| lens4a-site-claims.md: Claim at installation.tsx:77 (False package re-export / stacking claim) | N/A | `apps/web/src/routes/solid-spectrum/docs/installation.tsx:77`: `The five packages stack. Each one re-exports the layer beneath it` | None (finding is about `apps/web/src/routes/**/installation.tsx`) |
| lens4a-site-claims.md: Claim at installation.tsx:130,132 (Stale Solid 1 installation commands) | N/A | `apps/web/src/routes/solid-spectrum/docs/installation.tsx:130`: `<Code>{\`npm install @proyecto-viviana/ui solid-js\`}</Code>` | None (finding is about `apps/web/src/routes/**/installation.tsx`) |
| lens4a-site-claims.md: Claim at solid-spectrum/index.tsx:161 (Stale test count 3,680 tests) | N/A | `apps/web/src/routes/solid-spectrum/index.tsx:161`: `<StatCard title="3,680 tests"` | None (finding is about `apps/web/src/routes/solid-spectrum/index.tsx`) |
| lens4b-site-examples.md: HIGH Missing createSignal import in primary solid-spectrum getting-started example | N/A | `apps/web/src/routes/solid-spectrum/docs/index.tsx:93`: `<code>{\`import { Button } from '@proyecto-viviana/solid-spectrum';` | None (finding is about `apps/web/src/routes/solid-spectrum/docs/index.tsx`) |
| lens4b-site-examples.md: HIGH Missing DateValue type import in importCode for date components | N/A | `apps/web/src/routes/solid-spectrum/docs/components/calendar.tsx:42`: `importCode={\`import { Calendar } from '@proyecto-viviana/solid-spectrum';` | None (finding is about `apps/web/src/routes/solid-spectrum/docs/components/*.tsx`) |
| lens4b-site-examples.md: MEDIUM Missing companion component imports in importCode for composite examples | N/A | `apps/web/src/routes/solid-spectrum/docs/components/virtualizer.tsx:69`: `importCode={\`import { Virtualizer` | None (finding is about `apps/web/src/routes/solid-spectrum/docs/components/*.tsx`) |
| lens4b-site-examples.md: LOW Non-compilable pseudo-code ellipsis (...) in JSX attribute positions | N/A | `apps/web/src/routes/solid-spectrum/docs/components/combobox.tsx:90`: `<ComboBox items={foods} size="sm" label="Small" placeholder="Filter..." ...>` | None (finding is about `apps/web/src/routes/solid-spectrum/docs/components/combobox.tsx`) |
| lens4c-links.md: Coverage / Verdict 3: Add CONTRIBUTING.md (missing at repository root) | GONE | `CONTRIBUTING.md:1`: `# Contributing` | None (`CONTRIBUTING.md` was created and landed in commit `a6a9e717`) |
| lens4c-links.md: LOW Fictitious /current route demonstrated in Link documentation code snippet | N/A | `apps/web/src/routes/solid-spectrum/docs/components/link.tsx:70`: `code={\`<Link href="/current" aria-current="page">Current Page</Link>\`}` | None (finding is about `apps/web/src/routes/solid-spectrum/docs/components/link.tsx`) |
| lens4c-links.md: LOW Hardcoded GitHub organization URLs bypass REPO_URL constant in documentation examples | N/A | `apps/web/src/routes/solid-spectrum/docs/components/button.tsx:96`: `href="https://github.com/proyecto-viviana"` | None (finding is about `apps/web/src/routes/...`) |

no commit
