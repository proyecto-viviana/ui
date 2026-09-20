# Cross-check the landed READMEs against the audit — public-face worktree

You work ONLY inside `/home/emoporemilio/projects/viviana-hub/ui/.claude/worktrees/public-face`
(branch `public-face`). Never edit, stage or commit in the main checkout. Never
push. Never read `.env*`. No installs, no builds, no tests. No AI attribution.

Read (in the main checkout, read-only):
`/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens3-consumer.md`,
`lens4a-site-claims.md`, `lens4b-site-examples.md`, `lens4c-links.md`.

## Steps

1. List every finding in those four files that is about `README.md`,
   `CONTRIBUTING.md`, `CREDITS.md` or a `packages/*/README.md`.
2. For each, open the file as it now stands in the worktree and decide:
   `GONE` (the new text no longer has the defect), `STILL` (it does), or
   `N/A` (the finding is about something else). Quote the line you judged.
3. Fix only `STILL` findings of these two kinds, inside the worktree:
   - a dead relative link: point it at the file that exists, or remove the link;
   - an import in an example naming something the package's `src/index.ts`
     does not export: use the exported name. Verify with `grep` in `src/index.ts`.
   Anything else `STILL`: do not fix, list it.
4. If you changed anything, one commit in the worktree, only the files you
   changed: `#548: fix the links and example imports the audit found`.
5. Append a section `## Audit cross-check` to
   `/home/emoporemilio/projects/viviana-hub/ui/.agents/public-face-2026-09-20.log.md`:
   one table row per finding (source file + id, verdict, quoted line, action),
   then the commit sha or "no commit".
