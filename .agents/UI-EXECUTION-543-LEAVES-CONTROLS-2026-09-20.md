# UI #543 leaves + controls execution receipt

Date: 2026-09-20

## Authority and provenance

- Verified starting `HEAD`, `main`, and `origin/main`: `1af842e769f4b279055c9f38b434333aa6f9a86e`.
- Eligibility check passed against the canonical policy before editing.
- At the Stage A source generation's initial snapshot, the dirty set was exactly 23 paths: 18 inherited Stage A fixture sources and five unrelated protected #534 paths. The shared fixture test was then clean, and the index was empty.
- Stage A was externally accepted before the conductor explicitly released Stage B. Its accepted task-scope snapshot was 19 files, 792 insertions, and 241 deletions, with 52/52 shared fixture tests passing; Stage B therefore began from 24 dirty paths: those 19 accepted task paths plus the five protected #534 paths. Its index was empty.
- No install, dependency/config/public API change, provider access, delegation, staging, commit, push, PR, or external message was performed.

## Bounded source result

Stage A preserved the accepted 18 presentation-leaf fixture repairs. Stage B changed only these ten released action/basic-control fixture sources:

- `actionbar.tsx`
- `actionbutton.tsx`
- `actionbuttongroup.tsx`
- `actiongroup.tsx`
- `buttongroup.tsx`
- `dropzone.tsx`
- `form.tsx`
- `togglebutton.tsx`
- `togglebuttongroup.tsx`
- `toolbar.tsx`

Each fixture-owned `onSettled` callback now directly returns its existing teardown. ActionGroup and Toolbar retain their separate inner-control and outer-provider/theme owners. Listener types, callback identities, initialization, and component state remain in place. Form synchronizes its existing filtered comparison-props data attribute without rebuilding its form or focused input.

The only test path changed was `apps/comparison/test/solid-integration/fixtures.hydrate.test.tsx`. Its 52 accepted Stage A cases remain, extended with 20 Stage B cases covering exact registration/removal tuples, live controls/theme semantics, inert disposal, clean remount, retained identity/focus, and rendered press, toggle, selection, and keyboard-focus behavior.

## Census and proof

- Baseline before Stage A: 65 registrations in 62 files.
- Accepted Stage A: 47 registrations in 44 files, a reduction of 18 registrations in 18 files.
- Final Stage B: 35 registrations in 34 files, a further reduction of 12 registrations in 10 files.
- Combined bounded result: 30 registrations removed across 28 fixture files.

Final passing proof:

- Focused Stage B: 20 passed, 52 skipped; `/tmp/ui-543-leaves-controls-stage-b-focused-attempt-3.log`.
- Whole shared fixture file: 72/72 passed; `/tmp/ui-543-leaves-controls-stage-b-whole-file.log`.
- Scoped census: 0 registrations in 0 Stage B files; `/tmp/ui-543-leaves-controls-stage-b-census-scoped.log`.
- Repository census: 35 registrations in 34 files; `/tmp/ui-543-leaves-controls-stage-b-census-total.log`.
- Scoped format check passed; `/tmp/ui-543-leaves-controls-stage-b-format-check.log`.
- Scoped lint passed; `/tmp/ui-543-leaves-controls-stage-b-lint.log`.
- The one authorized root typecheck passed; `/tmp/ui-543-leaves-controls-stage-b-typecheck.log`.

Resolved intermediate focused attempts are retained honestly:

- `/tmp/ui-543-leaves-controls-stage-b-focused-attempt-1.log`: three failures exposed inaccurate ButtonGroup/DropZone test expectations and Form's stale filtered data attribute.
- `/tmp/ui-543-leaves-controls-stage-b-focused-attempt-2.log`: two Form failures exposed use of the old one-argument effect signature.
- Both causes were corrected inside the released fixture/test scope before the final passing proof.

## Commands

All Vite+ commands used the installed runtime prefix `PATH=/home/emoporemilio/.local/share/vite-plus/js_runtime/node/24.21.0/bin:$PATH`, one heavy process at a time, and test commands used `--maxWorkers=1`.

```text
timeout --signal=INT --kill-after=10s 300s env PATH=... node_modules/.bin/vp test run --config apps/comparison/vitest.solid-hydrate.config.ts apps/comparison/test/solid-integration/fixtures.hydrate.test.tsx --testNamePattern='action/basic controls' --maxWorkers=1
timeout --signal=INT --kill-after=10s 300s env PATH=... node_modules/.bin/vp test run --config apps/comparison/vitest.solid-hydrate.config.ts apps/comparison/test/solid-integration/fixtures.hydrate.test.tsx --maxWorkers=1
git ls-files <the ten Stage B fixtures> | /home/emoporemilio/.local/share/vite-plus/js_runtime/node/24.21.0/bin/node /tmp/ui-543-forms-census.mjs
git ls-files | /home/emoporemilio/.local/share/vite-plus/js_runtime/node/24.21.0/bin/node /tmp/ui-543-forms-census.mjs
timeout --signal=INT --kill-after=10s 120s env PATH=... node_modules/.bin/vp fmt --check <the ten Stage B fixtures and shared test>
timeout --signal=INT --kill-after=10s 180s env PATH=... node_modules/.bin/vp lint <the ten Stage B fixtures and shared test>
timeout --signal=INT --kill-after=10s 600s env PATH=... node_modules/.bin/vp run typecheck
```

Formatting writes used the same bounded 11-path set and are logged at `/tmp/ui-543-leaves-controls-stage-b-format-write.log` and `/tmp/ui-543-leaves-controls-stage-b-format-write-2.log`.

## Limits

The shared fixture proof is real-control CSR through Solid `render`; it is not actual fixture SSR/hydration proof. Remaining lifecycle/config/warning debt, broader app and web work, four-layer builds, attribution, packaging, and release gates remain open. Tickets #543 and #531 remain `in-progress`; no ticket, foundation, port, packaging, or release acceptance is inferred.

## Final docs and checkout verification

The required direct-Node commands ran once after the final ticket edits:

```text
/home/emoporemilio/.local/share/vite-plus/js_runtime/node/24.21.0/bin/node --import tsx scripts/generate-work-views.ts --write
/home/emoporemilio/.local/share/vite-plus/js_runtime/node/24.21.0/bin/node --import tsx scripts/check-docs-current.ts
```

Generation changed only `.claude/current/roadmap.md` and `.claude/current/status.md`; the current-doc check passed. Raw logs are `/tmp/ui-543-leaves-controls-stage-b-docs-generate.log` and `/tmp/ui-543-leaves-controls-stage-b-docs-check.log`.

Final task scope is 34 paths with 1369 insertions and 276 deletions: the 28 named fixtures, shared fixture test, two tickets, two generated current views, and this receipt. The full dirty set is exactly those 34 paths plus the five protected #534 paths below, for 39 paths total. `git diff --check` passes; `HEAD`, `main`, and `origin/main` all remain at the verified start SHA; the index is empty.

```text
.agents/UI-EXECUTION-543-LEAVES-CONTROLS-2026-09-20.md
.claude/current/roadmap.md
.claude/current/status.md
.claude/tickets/initiatives/531-solid-2-foundation-upgrade-vanguard.md
.claude/tickets/tasks/543-restore-solid-2-comparison-app-development.md
apps/comparison/src/components/solid/fixtures/styled/actionbar.tsx
apps/comparison/src/components/solid/fixtures/styled/actionbutton.tsx
apps/comparison/src/components/solid/fixtures/styled/actionbuttongroup.tsx
apps/comparison/src/components/solid/fixtures/styled/actiongroup.tsx
apps/comparison/src/components/solid/fixtures/styled/avatar.tsx
apps/comparison/src/components/solid/fixtures/styled/avatargroup.tsx
apps/comparison/src/components/solid/fixtures/styled/badge.tsx
apps/comparison/src/components/solid/fixtures/styled/buttongroup.tsx
apps/comparison/src/components/solid/fixtures/styled/card.tsx
apps/comparison/src/components/solid/fixtures/styled/divider.tsx
apps/comparison/src/components/solid/fixtures/styled/dropzone.tsx
apps/comparison/src/components/solid/fixtures/styled/form.tsx
apps/comparison/src/components/solid/fixtures/styled/icons.tsx
apps/comparison/src/components/solid/fixtures/styled/illustratedmessage.tsx
apps/comparison/src/components/solid/fixtures/styled/illustrations.tsx
apps/comparison/src/components/solid/fixtures/styled/inlinealert.tsx
apps/comparison/src/components/solid/fixtures/styled/labeledvalue.tsx
apps/comparison/src/components/solid/fixtures/styled/link.tsx
apps/comparison/src/components/solid/fixtures/styled/linkbutton.tsx
apps/comparison/src/components/solid/fixtures/styled/meter.tsx
apps/comparison/src/components/solid/fixtures/styled/progressbar.tsx
apps/comparison/src/components/solid/fixtures/styled/progresscircle.tsx
apps/comparison/src/components/solid/fixtures/styled/provider.tsx
apps/comparison/src/components/solid/fixtures/styled/skeleton.tsx
apps/comparison/src/components/solid/fixtures/styled/statuslight.tsx
apps/comparison/src/components/solid/fixtures/styled/togglebutton.tsx
apps/comparison/src/components/solid/fixtures/styled/togglebuttongroup.tsx
apps/comparison/src/components/solid/fixtures/styled/toolbar.tsx
apps/comparison/test/solid-integration/fixtures.hydrate.test.tsx
packages/solidaria-components/test/Button.test.tsx
packages/solidaria-components/test/Tooltip.test.tsx
packages/solidaria/src/interactions/createHover.ts
packages/solidaria/test/createHover.test.tsx
packages/solidaria/test/createTooltip.test.tsx
```

Protected paths remain byte-identical to the initial snapshot and unstaged:

```text
7c51470ec2dd4ba385a1af66c136efc99f14659e443f740d5d2c7e97294a8f33  packages/solidaria-components/test/Button.test.tsx
0bec2fbe0a4855ed6749da0104e7f6029bb65066cfe4bbaf67b67fb0d4fa1eac  packages/solidaria-components/test/Tooltip.test.tsx
31c0be0a17cfa870e9ad180d3faef79a8d164df0bce6d390f70db8e84944e0f5  packages/solidaria/src/interactions/createHover.ts
f3b7574fd4b1cd8965083c2e4df94044d7d139067936cebb823995508a67e1ae  packages/solidaria/test/createHover.test.tsx
4492658cdb3af38c57c2a67e7f36bc3e8b4953a435f2f65e3cd1b457ad3d7b86  packages/solidaria/test/createTooltip.test.tsx
```

SOURCE STOPPED — ready for independent final review. Only the later named coordination committer may stage, commit, or push the accepted complete scope.
