# Lens 4b — do the site's code examples compile against today's exports?

You are read-only. Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it. Another worker is editing this checkout: you edit NO file except your one artifact, you run no build, install, test, or git write. Reading, `rg`, `node -e` and `ls` only. Never read `.env*`. Write the artifact as you go; stop when the list is done.

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens4b-site-examples.md`

Scope: every code example shown to the reader (strings, template literals,
`<code>`/`<pre>` blocks, CodeBlock props) in `/home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/**/docs/**`.

For each example: file:line, the package it imports from, each imported name,
and whether that name is exported by that package's `src/index.ts` (follow
`export *`). Flag imports from `solid-js/web` or `solid-js/store` and any
`onMount`, `createResource`, `Suspense`, `splitProps` — Solid 2 removed or
moved them. One table; then a short list of the broken examples only.
