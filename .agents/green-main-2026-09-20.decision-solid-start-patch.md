# Decision — the `build:web` blocker is a rename, and we patch it (conductor, 2026-09-20)

Verified from the published tarballs:

- `@solidjs/web@2.0.0-rc.8` `server-functions/server` exports
  `parseServerFunctionUrl(url)` and `serverFunctionUrl(id, boundArgs?)`.
- `@solidjs/web@2.0.0-rc.9` (published 2026-09-18) renamed them:
  `parseServerFunctionActionUrl(url)` and
  `serverFunctionActionUrl(fn | id, ...boundArgs)`. `serverFunctionUrl` now
  takes a function, not an id.
- `@tanstack/solid-start@2.0.0-rc.8` is the newest `rc` and was built against
  rc.8. It uses the old names in exactly one file,
  `dist/esm/server-functions-handler.js`: the import on line 4 and three call
  sites (`getSolidServerFunctionId`, `withSolidServerFunctionId` ×2). Every
  other symbol it imports from `@solidjs/web/server-functions*` exists in rc.9.

Do **not** pin the workspace back to rc.8 (our peers floor is rc.9; two Solid
copies in one graph break reactivity) and do not alias in Vite.

Do this, one commit `#545:`:

1. `vp exec pnpm patch @tanstack/solid-start@2.0.0-rc.8`, edit only that file
   (check for a `dist/cjs` twin and patch it the same way if it exists):
   `parseServerFunctionUrl` → `parseServerFunctionActionUrl`,
   `serverFunctionUrl(serverFnId)` → `serverFunctionActionUrl(serverFnId)`,
   and the import list to match. `vp exec pnpm patch-commit <dir>`.
2. The patch file under `patches/` and the `patchedDependencies` entry are the
   whole change. It is keyed to the exact version, so pnpm refuses the install
   the day TanStack moves — the patch cannot outlive its reason. Put that one
   sentence, and the two tarball facts above, in a comment beside the entry.
3. Prove it: `vp run build:web` exits 0. Then boot the built Worker once
   (`vp preview` for apps/web or the existing `test:web` step) and show a
   route answers 200 — a build that resolves is not a server that runs.
4. If anything else in rc.9 breaks TanStack at runtime, stop, write it under
   `## Left red` with the output, and keep the patch commit only if
   `build:web` is green with it.

No new dependency. No push.
