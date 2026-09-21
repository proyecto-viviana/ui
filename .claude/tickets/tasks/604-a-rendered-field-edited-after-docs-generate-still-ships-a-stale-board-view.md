---
id: 604
type: task
title: "A rendered ticket field edited after docs:generate still ships a stale board view, and CI is the only detector"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "the residue of #588 scope item 1, split out because #588 is merged and the lifecycle is forward-only. #588 closed the respelling half of the ordering hole - the stamp now hashes the seven fields the views print, so the pre-commit formatter and any edit to `created`, `subtitle`, `app` or `history` leave it alone. The half still open is the one the hole was named for: a change to `path`, `id`, `type`, `title`, `status`, `blocked` or `parent` made after `vp run docs:generate` has run leaves both views stale inside the commit that wrote them, and the closing flip to `merged` is exactly that shape and is the commonest one on this board",
    }
---

## Scope

Make a commit that changes a rendered ticket field and leaves
`.claude/current/status.md` and `.claude/current/roadmap.md` behind either
impossible to write or refused by a named check that runs before the
certification ladder spends anything.

Constraints already established, so nobody re-derives them:

- A `docs:check` step inside `vp staged` is not the shape. `vp staged` is
  lint-staged bundled at `node_modules/vite-plus/dist/staged/bin.js`, where
  `concurrent` defaults to `true` and `true` becomes `Infinity`, so a second
  pattern on `.claude/tickets/**` would read those files while
  `vp check --fix` rewrites them in place.
- `docs:check` reads the working tree, not the index, so as a pre-commit step
  it would let an unstaged edit to any other ticket decide the verdict of a
  commit that does not contain it.
- #588 records its cost as 1.23 s warm; re-measure before quoting it.

Two shapes that fit, neither chosen: regenerate from the staged index inside
the hook and re-stage, serialized after the formatter; or a
`guard:generated-views` CI step placed ahead of the ladder, so the red is
named at the top instead of truncating the ladder at `docs:check`.

Non-goal: changing what the stamp hashes. That is `boardRevisionOf` in
`scripts/generate-work-views.ts` and #588 settled it.

## Done when

A commit that edits a rendered ticket field without regenerating the views is
refused, and the refusal is reproducible from a clean checkout. If the answer
is a CI guard rather than a hook, its step runs before the first heavy gate
and names the stale view.

## Proof

A scripted attempt at such a commit, refused, with its exit code; and either
the hook run or the CI run id whose new step is green on a clean board.

## Relationship

Child of #544. Residue of #588 scope item 1; #588 owns the stamp, this ticket
owns the ordering. Related to #577: a ratchet that cannot report its own
staleness is the same shape as a board whose views cannot.
