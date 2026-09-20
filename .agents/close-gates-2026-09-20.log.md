# close-gates — 2026-09-20

Writer seat, ticket #553 (slices 0, 4–10) and #194 (slices 1–3).
Brief: `.agents/close-gates-2026-09-20.task.md`.

## Now

Slice P — the chain steps after `build`. Resumed after the previous worker
died at 12:33; brief `.agents/close-gates-2026-09-20.resume.task.md`.

## Slice L — land the conductor's notes

No gate, no planted defect: a records-only commit. `cae7c0c7`.

- `.agents/CONDUCTOR-PENDING-2026-09-20.md` LAUNCHES rows → the table in
  `.agents/audit-2026-09-20/LAUNCHES.md`, plus a `## Panes and briefs` table
  for the two columns the existing table does not carry, and the later state
  entries.
- Its VERIFIED rows → `VERIFIED.md`, one row each in the existing
  `| lens | finding | reproduced by | outcome |` format, with a
  `## Not reproduced` section for the claims the conductor explicitly did not
  reproduce.
- Friction items 13–18 → #552, under a new `### Added while the 2026-09-20
  audit ran` heading so the numbering stays sequential; each item names
  whether it is repo, hub or harness.
- Minted #553, #554, #555. `ls .claude/tickets/tasks | tail` showed 552 as the
  highest id, so the three ids the conductor named were free.
- `vp run docs:generate` → regenerated `.claude/current/roadmap.md` and
  `.claude/current/status.md`, both in this commit.
- The pending file is committed as the record, as the brief asks.
  `.agents/drafts-548/` is not staged.
  `.agents/green-main-2026-09-20.decision-solid-start-patch.md` is not staged
  either — it belongs to slice P, with the patch.

## Slice P — patch `@tanstack/solid-start` so `build:web` resolves

Red, before:

```
$ vp run build:web
[MISSING_EXPORT] "parseServerFunctionUrl" is not exported by
"@solidjs/web@2.0.0-rc.9/server-functions/dist/server.js"
  at @tanstack/solid-start@2.0.0-rc.8/dist/esm/server-functions-handler.js:4:90
```

Checked the decision's two claims against the installed trees before patching:

- rc.9's `server.js` export list has `parseServerFunctionActionUrl`,
  `serverFunctionActionUrl` and `serverFunctionUrl`, and no
  `parseServerFunctionUrl`.
- `serverFunctionActionUrl(id)` still takes a bare id —
  `urlTargetId` (`server.js:307-311`) accepts a string — and renders the same
  `serverFunctionAddress` that `parseServerFunctionActionUrl`
  (`server.js:2249-2252`) parses, so the rename round-trips. `serverFunctionUrl`
  in rc.9 throws unless it is handed a declared-GET function reference
  (`server.js:320-327`), which is why the id call site must move to the action
  helper, not stay put.
- `grep -rln` over the package found three files naming the old symbols:
  `dist/esm/server-functions-handler.js`, its `.map`, and `src/*.ts`. No
  `dist/cjs` twin exists. Per the decision the patch edits the one file that
  runs; the map and the unbuilt `src` are left alone to keep the patch minimal.

Repair: `vp exec pnpm patch @tanstack/solid-start@2.0.0-rc.8`, rename the
import and the three call sites, `pnpm patch-commit`. The patch is 4 changed
lines in one file; the `patchedDependencies` entry carries the reason in a
comment above it.

Green, after:

```
$ vp run build:web
BUILD:WEB EXIT=0
$ cd apps/web && vp preview      # the built Worker
URL=http://localhost:4173
GET / -> 200
```

### Chain state

Steps of `ci:release-readiness` after `build`, one at a time, memory checked
before each (`free -m`, `available` over 3000 MB) and vitest held to
`--maxWorkers=2`.

| step | exit | first failure |
| --- | --- | --- |
| `typecheck:apps` | pending | |
| `test:run` | pending | |
| `test:ssr` | pending | |
| `test:hydrate` | pending | |
| `test:web` | pending | |
| `test:comparison-data` | pending | |
