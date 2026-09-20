# UI #543 common-form lifecycle slice — 2026-09-20

Start `067d485e537ec4abe773e9a529be07f66bb0d438`, `main`, already accepted and
pushed. One authorized source writer; index left empty. Five separate #534
paths remained byte-identical and outside this slice. Detailed commands and
failures: `/tmp/ui-543-forms-result.md`; raw final logs:
`/tmp/ui-543-forms-{focused-final,test-lint-final,test-format-final}.log`.

## Bounded change

TextField, TextArea, SearchField, NumberField, Slider, RangeSlider, Switch and
RadioGroup now return their existing listener cleanup directly from
`onSettled`. The two listeners, callback identities, initialization, values,
providers and public/component contracts are unchanged. Accepted helper and
adjacent-fixture inspection found no keyed/materialization repair to make.

The existing hydrate-config fixture test adds actual live-control coverage for
input/change/clear, focused number/slider/radio/switch keyboard behavior, both
focused RangeSlider thumbs, same-node retention, live props/theme, exact
listener removal, inert disposal and clean remount. SearchField exposes no
observable submit contract, so inert Enter coverage was removed and no API was
invented.

## Evidence and limits

The shared-defect red control emits `CLEANUP_IN_FORBIDDEN_SCOPE` at the original
TextField nested cleanup. It then does not exit after timeout's `SIGINT` because
of the separately tracked vmThreads/config-inheritance collection debt; after
the configured ten-second grace, timeout escalates to `SIGKILL` and returns 124. No config was changed.

Final focused proof passes 25/25 (one file). The TypeScript-AST census over
tracked `apps/comparison` sources reports 65 forbidden registrations in 62
files, exactly eight fewer than the prior 73/70. Root typecheck and scoped
source/test lint and format passed before review; after the test-only review
correction, the focused 25/25 plus test-file lint/format each pass again.
Generated status/roadmap views are current: both documented wrappers reproduce
the sandbox's tsx IPC `listen EPERM`, while direct installed-Node `--import tsx`
generation and validation exit 0 (`docs:check passed`). The coordination
formatter could not write the read-only `.agents` mount; its exit 2 is retained
in the ledger rather than bypassed.

This is real client-side control execution under the hydrate test config, not
actual SSR render/hydration or styling/browser certification. The initial
system `vp` wrapper's Node-download DNS failure, an abandoned direct-module
attempt, intermediate test-authoring failures, and remaining warning/config
debt stay in the detailed ledger. No browser lane was needed for these DOM and
keyboard contracts; no install, provider call, dependency/config/product API,
warning suppression or assertion weakening occurred.

## Still open

#543 and #531 remain in-progress. Sixty-five forbidden registrations in 62
comparison fixture files, actual fixture SSR/hydration, strict-warning and
broader app/config debt remain. This slice does not accept #531 or #537 and is
not release proof. Stop for independent review and conductor commit handoff.

Final audit: HEAD and `origin/main` remain
`067d485e537ec4abe773e9a529be07f66bb0d438`; index empty; `git diff --check`
passes. The dirty set is exactly the authorized #543 paths plus the five
protected #534 paths, whose handoff SHA256 values all match exactly.
