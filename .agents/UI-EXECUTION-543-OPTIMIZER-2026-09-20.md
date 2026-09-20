# UI #543 vmThreads optimizer repair

Source endpoint: `c8ea5ec4c1f3f9ef4e37c7149df7dfd68002b176` plus the unstaged
`vitest.hydrate.config.ts` repair. `origin/main` matched that endpoint before
editing. The index was empty. The five protected #534 paths matched their
handoff SHA-256 values before and after this work.

## Change

Vitest 4.1.11 creates `__vitest_vm__` for `vmThreads` and makes it a client
consumer. Installed Vite+ 0.2.9 inherits root `optimizeDeps` only into the
named `client` environment; the custom environment therefore resolved with
`noDiscovery: false` and no entries, falling back to `**/*.html` discovery.

The only source change applies the existing policy where the tests run:

```ts
environments: {
  __vitest_vm__: {
    optimizeDeps: {noDiscovery: true, include: []},
  },
},
```

No loader, vendored source, dependency, warning, assertion, or comparison
hydrate config changed.

## Controlled evidence

All commands used the installed Node 24.21.0 runtime, `node_modules/.bin/vp`,
and at most one worker. Full commands, exit codes, caches, inventory and raw-log
paths are in `/tmp/ui-543-optimizer-result.md`.

- Cold unchanged-source comparison hydrate: exit 0, 4 files / 61 cases. The
  resolved environment was `consumer: "client"`, `noDiscovery: false`, empty
  include. One failed scan emitted exactly three `PARSE_ERROR` diagnostics:
  `react-spectrum/examples/rac-spectrum-tailwind/src/index.js:5`,
  `react-spectrum/examples/s2-parcel-example/src/index.js:18`, and
  `react-spectrum/scripts/icon-builder-fixture/src/index.js:18`. The failed scan
  created `deps___vitest_vm__/_metadata.json` with empty optimized/chunk maps.
- Fresh repaired producers: root SSR 29 files / 78 cases and comparison SSR
  1 file / 8 cases, both exit 0.
- Fresh repaired consumers: root hydrate 27 files / 98 cases and comparison
  hydrate 4 files / 61 cases, both exit 0. Both resolved the custom environment
  with `noDiscovery: true`, empty include, emitted zero scan/parse diagnostics,
  and created no dependency-optimizer directory.
- The comparison before/after file names and all 61 case names are identical.
- Scoped lint and format checks pass. Documentation generation and freshness
  checks pass; their exact commands and logs are recorded in the detailed
  ledger.

## Limits

The comparison hydrate tests intentionally exercise rejected client renders
and record their existing Solid failure-path diagnostics; root SSR/hydrate also
retain existing non-optimizer diagnostics. This repair claims only removal of
the unwanted dependency scan. It does not close #543 or #531, certify remaining
lifecycle/warning/web work, repeat unrelated lanes, or make a release/waiver
claim. Commit, push, acceptance, and independent review remain conductor-owned.
