# Conductor decision — the four admin `createResource` sites, 2026-09-20

Port them. The refetch side is proven: `.agents/green-main-2026-09-20.refresh-probe.mjs`
(run it: `node .agents/green-main-2026-09-20.refresh-probe.mjs`) prints, on
`@solidjs/signals@2.0.0-rc.9`:

```
initial read (pending): undefined
after settle: a:1 calls 1 seen [null,"a:1"]
after refresh: resolved a:2 read a:2 calls 2 seen [null,"a:1","a:2"]
during source change: a:2
after source change: b:3 calls 3 seen [null,"a:1","a:2","b:3"]
fire-and-forget refresh: b:4 calls 4
```

So `refresh(memo)` re-invokes the fetcher, `await refresh(memo)` resolves with
the new value, a source change keeps the stale value until the new one lands,
and the first read is `undefined`. That is `createResource` as these panels use
it — none of them reads `.loading`, `.error` or `.state`, and every read site is
already `Show when={x()}` or `x()?.`.

Your probe most likely used the three-argument form. Solid 2's `createMemo` is
`(compute, options)`: a third argument is ignored, so `loadingValue` never
applied and the first read threw `NotReadyError`.

## The form

```ts
import { createMemo, refresh } from "solid-js";

const docs = createMemo<DocsPayload | undefined>(() => fetchDocs(), { loadingValue: undefined });
const onChanged = () => {
  void refresh(docs);
  void refresh(git);
};
```

- `[x] = createResource(fetcher)` → `createMemo<T | undefined>(() => fetcher(), { loadingValue: undefined })`.
- `refetch()` → `refresh(x)`; `await refetchDoc()` → `await refresh(doc)`.
- `DocsPanel`: `createResource(source, fetcher)` skipped the fetch on a falsy
  source. Keep that: the compute is **not** `async`; it reads `props.openPath`
  and returns `path ? fetchDoc(path) : undefined`.
- Type the memo with `| undefined` as the `loadingValue` doc asks. No helper,
  no wrapper, no new file: four call sites, the framework's own idiom.
- No `Loading` boundary is needed: with `loadingValue` the read never throws,
  so the existing `Show … fallback` lines stay the loading state.

Verify with `vp run build:web`, then carry on down the chain. The admin route
is dev-only; if you can, load `/admin` under `vp run dev:web` once and confirm
Reload and Save refetch — if the dev server is not practical here, say
"unverified in browser" in the log and move on.

## Peers check

Leave `vp exec pnpm peers check` red for now with your evidence; the owner
decides. Do not add `allowAny`. If `guard:dependency-security` is what stops
the chain, run the remaining steps individually past it and record each
result, so everything else that is red is known.
