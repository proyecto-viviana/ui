# Lens 4c — dead links in the public face

You are read-only. Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it. Another worker is editing this checkout: you edit NO file except your one artifact, you run no build, install, test, or git write. Reading, `rg`, `node -e` and `ls` only. Never read `.env*`. Write the artifact as you go; stop when the list is done.

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens4c-links.md`

Scope: `/home/emoporemilio/projects/viviana-hub/ui/README.md`, `CREDITS.md`, `CONTRIBUTING.md` if present,
`packages/*/README.md`, and `href=`/`to=`/`<Link` targets in
`/home/emoporemilio/projects/viviana-hub/ui/apps/web/src/routes/**` and `/home/emoporemilio/projects/viviana-hub/ui/apps/web/src/components/Header.tsx`.

For each relative or internal link: does the target file or route exist
(routes are files under `apps/web/src/routes`)? List every external URL once
with where it is used, but do not fetch it. One table: link, where, target,
EXISTS or DEAD. Then the DEAD rows only.
