---
id: 95
type: task
title: "Bound Vite Plus test discovery"
created: 2026-08-20
parent: 27
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-024" }
  - {
      state: verified,
      at: 2026-10-07,
      note: "unit vmThreads was the cold scan that still read every HTML file: resolved __vitest_vm__ had noDiscovery false and no entries, so the vendor page and the gitignored dist twin were scan inputs. That read-set check failed before the __vitest_vm__ noDiscovery bound and the scoped regression passes 3/3 after it. Every package-test environment now resolves noDiscovery true with an empty include",
    }
---

A cold Vite Plus test dependency scan can traverse ignored or vendored HTML
outside the package-test surface. `noDiscovery` did not make the scan hermetic.

## Scope

- Identify the inputs that enter the cold dependency scan.
- Reduce or explicitly bound discovery to intended test sources.
- Add a regression fixture that proves ignored and vendor trees cannot affect
  test collection or diagnostics.

## Done when

The cold scan reads only declared test inputs, and an out-of-scope fixture fails
before the fix and passes after it.

## Bounded script typing qualification, 2026-10-08

Admitted by the conductor at base `02f87b5670b7a57795613ce35043ff61ed73cf85`,
generation `54403dfb-e9b1-4448-9926-57ad1be77f7e`. The registered source
implementer owns only this ticket and `scripts/vite-plus-test-discovery.test.ts`;
`status.md` and `roadmap.md` may change only through the normal generator.
The conductor reviews, stops this generation, and commits. Prior verified
discovery behavior and broader qualification limits remain in force.

The existing expect-error now sits immediately above the closing import line,
with the imported names preserved. Formatting keeps that adjacency. The
old-source compiler control reported 3 diagnostics: owned TS2578 at 12:1 and
TS7016 at 19:8, plus inherited TS2339 at
`scripts/check-upstream-test-parity.ts:779:52`. Final formatted typecheck
exits 2 with exactly that one inherited diagnostic; both owned errors are gone.

The first sandboxed focused suite completed with exit 1: 2 passed, 1 failed,
3 total. Temporary `/tmp` preload instrumentation captured the actual
vmThreads child: the explicit Node 24.21.0 executable returned a spawnSync
EPERM error alongside status 0 and empty stdout. The same exact command
extracted from base source reproduced this failure. Outside Vitest the exact
child prints `PROBLEMS []`; trace markers complete all seven configs.

The unchanged focused suite passes outside the restrictive sandbox: exit 0,
3/3 tests. A separate temporary capture confirms child status 0, no signal,
error null, and stdout `PROBLEMS []`, with all seven before/after config
markers completed. The base-source child also completes identically. No
process.exit origin was found: this was a sandbox spawn error. No runtime
repair or scope amendment is needed. Failed receipts remain separate.

Only the existing directive moved. No test source instrumentation was
needed; original/current source copies and byte-exact source preservation
are recorded under `/tmp/ui-95-*`. Imported names, all three meaningful
tests, environment stripping, assertions, and both timeouts remain intact.
Ignored dist twins are absent after the existing teardown. Scoped format,
lint, and docs checks pass; docs commands required sandbox elevation for
tsx IPC. Generated views have no content changes.

Raw commands, exits, logs, source identities, and check applicability are
bound in `/tmp/ui-95-evidence-manifest.json`; the worker handoff is
`/tmp/ui-95-worker-result-2026-10-08.md`. The previous verified lifecycle and
accepted discovery behavior remain historical evidence. The conductor independently reviews, owns the exact-generation stop, and
accepts/integrates/commits; this worker claims no candidate or release readiness.
