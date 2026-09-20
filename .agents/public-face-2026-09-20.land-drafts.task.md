# Land the #548 README drafts — public-face worktree

You work ONLY inside `/home/emoporemilio/projects/viviana-hub/ui/.claude/worktrees/public-face`
(branch `public-face`). Never edit, stage or commit in the main checkout. Never
push. Never read `.env*`. No installs, no builds, no tests. No AI attribution in
any commit.

Drafts live (read-only for you) in
`/home/emoporemilio/projects/viviana-hub/ui/.agents/drafts-548/`.

## Steps

1. Copy each draft over its target inside the worktree, same relative path:
   `README.md`, `CONTRIBUTING.md`, and the seven `packages/<dir>/README.md`.
2. In the copied files, fix the install lines:
   - our packages: `@next` becomes `@rc` (e.g. `@proyecto-viviana/ui@rc`);
   - `solid-js@2.0.0-rc.9 @solidjs/web@2.0.0-rc.9` becomes
     `solid-js@next @solidjs/web@next`;
   - any sentence that says the release is on the `next` tag now says the `rc` tag.
   Leave `npm install -D unplugin-parcel-macros` and the geist "fails" sentence alone.
3. Apply each entry of `CREDITS-corrections.md` to `CREDITS.md` exactly as
   written. If an entry is ambiguous, skip it and say so in your log.
4. Check: `grep -rn '@next' README.md CONTRIBUTING.md packages/*/README.md`
   may only show `solid-js@next` and `@solidjs/web@next`.
5. Commit inside the worktree, these paths only, one commit:
   `#548: land the package READMEs, the front door and CONTRIBUTING`.
   If the pre-commit hook fails, do not bypass it; write the error in your log and stop.
6. Write a short log to
   `/home/emoporemilio/projects/viviana-hub/ui/.agents/public-face-2026-09-20.log.md`:
   files landed, corrections applied or skipped, the grep output, the commit sha.
