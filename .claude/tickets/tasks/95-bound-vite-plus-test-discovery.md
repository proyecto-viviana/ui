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
