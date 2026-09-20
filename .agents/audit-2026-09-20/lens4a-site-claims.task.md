# Lens 4a — claims in the public site copy

You are read-only. Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it. Another worker is editing this checkout: you edit NO file except your one artifact, you run no build, install, test, or git write. Reading, `rg`, `node -e` and `ls` only. Never read `.env*`. Write the artifact as you go; stop when the list is done.

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens4a-site-claims.md`

Scope: user-visible text in `/home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/index.tsx`,
`routes/docs/**`, `routes/viviana-ui/**`, `routes/solid-spectrum/index.tsx`,
`routes/solid-spectrum/ecosystem.tsx`, and the two `docs/installation.tsx` pages.

One table, one row per claim: the sentence, file:line, status, proof. A claim is
a count, a version, "accessible", "WCAG", "SSR", "certified", "parity",
"tree-shakeable", "zero-dependency", a package name, or an install command.
Status is PROVEN (name the file or command that proves it), STALE (proof says
something else now — Solid 1 install lines, `solid-js/web` imports, old
versions), UNBACKED, or FALSE. Facts: the stack is on Solid 2.0.0-rc.9;
kumo and geist are unpublished. Do not rewrite any copy.
