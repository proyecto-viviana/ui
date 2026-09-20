# Private Solid 2 renderer

The installed `@astrojs/solid-js` 7.0.2 adapter targets Solid 1. This app uses
the already-installed Solid 2 compiler and runtime through this private adapter;
the dependency declarations and published packages are unchanged. `LICENSE`
preserves the original Astro adapter's MIT attribution.

The renderer pairs an owned props store and `Loading` boundary on the server
and client. It awaits complete `renderToStream` output before returning markup
to Astro: this is buffered async SSR, not shell-first HTTP streaming. Request
IDs, default/named slots, client-only rendering, prop updates, unmount cleanup
and visible server failures retain their existing roles.

Astro can hydrate islands at different times. The bootstrap holds click/input
events per unopened island, then hands only that island's events to Solid's
native replay. It also prevents delegated parent handlers from consuming a
nested pending island's event twice. Older root updates are flushed before a
new hydration context starts. Tests cover settled roots and fully delivered
async payloads; arbitrary overlapping unresolved roots, live chunk arrival,
CSR-only parents and navigation lifecycle are not certified by these tests.

## Local proof

Run from the repository root, in order, to generate fresh fixtures:

```sh
vp test run --config apps/comparison/vitest.solid-ssr.config.ts --maxWorkers=1
vp test run --config apps/comparison/vitest.solid-hydrate.config.ts --maxWorkers=1
vp run comparison:dev
```

Use `/components/button/` for the side-by-side manual viewer and `/d12/button/`
for the real SSR island. Other component pages still require their owning
migration/behavior checks. The panel tests in the client lane exercise actual
CSR loading/error/disposal semantics, not panel SSR hydration.

Solid refresh is disabled to align dev compilation with the paired hydration
harness. A clean dev process passes the focused browser proof; an automatic
Vite restart has also exposed unresolved key drift. Refresh itself has not
been isolated as the cause: the early comparison also restarted the process.
Restart the process if that occurs, and retain the diagnostics. Do not suppress
warnings or treat this workaround as full dev-server/route acceptance. Ticket
#543 tracks these limits and the remaining build/route gates.
