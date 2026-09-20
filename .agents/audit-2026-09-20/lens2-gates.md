# Lens 2 — Gate integrity (ticket #546, 2026-09-20)

Can a check report green on a broken tree? Every gate is assumed to be lying
until the exit path is read.

## Coverage

Examined:

- `.github/workflows/` — all six: `certification-gates.yml`, `release.yml`,
  `release-readiness.yml`, `changesets-check.yml`, `site-gate.yml`,
  `journeys-nightly.yml`. Triggers, `needs` edges, `if:` conditions, both
  `continue-on-error` sites, action pinning, and the publish path.
- Certified suite gate chain: `apps/comparison/playwright.config.ts`,
  `e2e/reporters/certified-summary.ts`, `scripts/certified-summary.ts`,
  `scripts/certified-waivers.ts`, `scripts/merge-certified-reports.ts`,
  `e2e/certified-waivers.json`, `e2e/drivers/*` (`test.fixme` /
  `knownDivergences`), retries, and the "2,177 cases" figure.
- Root `package.json` script graph: every `guard:*`, `ci:*`, `pr:check*`,
  `release:*`, `a11y:*` and `comparison:test*` entry, plus reachability of each
  from a workflow (computed, `scratchpad/wire2.mjs`). No script body masks an
  exit code.
- All 53 files under `scripts/` and `apps/comparison/scripts/`, scanned for
  vacuous-pass patterns (never-fails, empty catch, missing-input-treated-as-ok,
  unhandled async main); the gate-bearing ones read in full:
  `check-release-evidence.mjs`, `check-release-prerequisites.mjs`,
  `check-publish-drift.mjs`, `check-package-artifacts.mjs`,
  `check-entry-import-budget.ts`.
- Test discovery: `vitest.ssr.config.ts`, `vitest.hydrate.config.ts`,
  `apps/comparison/vitest.config.ts`, and the root `test:*` entry points against
  the 567 committed test files.
- All 6,794 `it`/`test` blocks scanned for an assertion token
  (`scratchpad/noassert.mjs`).
- Stale-artifact surfaces: both `playwright.config.ts` `webServer` blocks, the
  `comparison-dist-${{ github.run_id }}` artifact hand-off, and the guards that
  read `dist/`.
- Snapshots regenerated in the Solid 2 codemod commit `163f4377` (one file,
  `packages/solid-spectrum/test/__snapshots__/regression.test.tsx.snap`),
  reduced to an attribute-multiset diff and traced to `Portal` in
  `@solidjs/web` 2.0.0-rc.9.

Skipped, and why:

- No builds, installs, dev servers or browser runs (brief: read-only, another
  worker holds the writer seat). Every claim below is read from source or from a
  `git` / `node -e` command a reviewer can re-run in under two minutes.
- `apps/web` TanStack Solid 1 dependency (#545) — declared out of scope.
- The ~30 non-gate `report:*` / `docs:*` scripts flagged `NEVER-FAILS` by the
  scan: they are reporters, not gates, and are not claimed as guards.
- Whether a 25-minute shard timeout still runs its `if: always()` upload step —
  `UNPROVEN` without a live run; if it does not, the missing artifact makes the
  merge fail closed on the shard-count check, so it is not load-bearing here.

## Findings

### CRITICAL A certified spec that fails to *load* passes the certified gate

- where: `.github/workflows/certification-gates.yml:630` (`continue-on-error: true`
  on the `certified shard` step) + `apps/comparison/e2e/reporters/certified-summary.ts:53-92`
  (the reporter only implements `onBegin` / `onTestEnd` / `onEnd`) +
  `apps/comparison/scripts/merge-certified-reports.ts:139-141` (the merge job's
  only failure condition is `waiverGateFails`).
- what: The eight `certified` shard jobs swallow Playwright's exit code by
  design; the *entire* pass/fail decision is re-derived in `certified-report`
  from the per-shard `certified-summary.N.json`. That JSON is built purely from
  `onTestEnd` callbacks. A spec file that throws at module load — a bad import,
  a syntax error, a `throw` at top level — produces **zero** `onTestEnd` calls,
  so it contributes nothing to `totals`, nothing to `cells`, and nothing to
  `unwaived`. Playwright reports it through `onError`, which this reporter does
  not implement. The shard exits non-zero, `continue-on-error` eats that, the
  merge sees 8 well-formed summaries with no unwaived failures and exits 0.
- proof: `sed -n '625,640p' .github/workflows/certification-gates.yml` shows
  `continue-on-error: true` on the only step that runs the suite.
  `grep -n "onError\|onBegin\|onTestEnd\|onEnd" apps/comparison/e2e/reporters/certified-summary.ts`
  → no `onError`. `merge-certified-reports.ts` exits non-zero only at line 68
  (no summaries at all), line 81 (shard count ≠ 8), line 136 (html merge) and
  line 140 (`waiverGateFails` = problems ∪ unwaived).
  Smallest planted defect: add `throw new Error("x");` to the top of
  `apps/comparison/e2e/certified/tooltip.certified.spec.ts`. One shard goes red,
  is ignored, and `certified report` is green with ~30 fewer cases.
- expected: The merge must fail on any shard that did not exit 0. Either drop
  `continue-on-error` and gate on the shard jobs, or have each shard record its
  Playwright exit status into the summary and have the merge assert it, plus an
  `onError` hook that records load-time errors as unwaived failures.
- blast radius: The whole recertification bar. This is exactly the class of
  defect that shipped on main this week (a lost `import {` in
  `merge-certified-reports.ts`); the certified gate is structurally blind to it.

### CRITICAL The certified gate has no case-count floor — deleting a spec is green

- where: `apps/comparison/scripts/certified-summary.ts:119-156` and
  `apps/comparison/scripts/merge-certified-reports.ts:77-82`.
- what: The only structural assertion in the merge is "I found exactly
  `CERTIFIED_SHARD_TOTAL` (8) summary files". Nothing asserts how many *cases*
  ran. `totals.passed` / `totals.skipped` are reported in the step summary and
  never compared to anything. Delete a `*.certified.spec.ts`, rename it out of
  the `--shard` glob, or wrap a file in `test.describe.skip`, and the gate is
  green with a smaller number in a table nobody diffs.
- proof: `grep -n "baseline\|expected\|floor\|minimum" apps/comparison/scripts/certified-summary.ts apps/comparison/scripts/merge-certified-reports.ts`
  → nothing. `waiverGateFails` (`certified-waivers.ts:269-271`) is
  `problems.length > 0 || unwaived.length > 0` — a suite that ran zero tests
  satisfies both.
  Smallest planted defect: `git rm apps/comparison/e2e/certified/tooltip.certified.spec.ts`.
  Certified report: green.
- expected: A committed per-component × driver case-count baseline that the
  merge ratchets against, so cases can only go up without an explicit baseline
  edit. This is what ticket #194 ("ratchet certified skipped counts…") is for,
  and it is still open — so the "2,177-case" claim repeated across
  `.agents/UI-*.md` is a typed number, not a gate.
- blast radius: Every certification claim in `.claude/current/certification.md`
  and every `.agents/` review that cites a case count.

### CRITICAL `knownDivergences` is a second waiver channel with no ticket, no expiry and no gate

- where: `apps/comparison/e2e/drivers/ax.ts:134,166`, `events.ts:127`,
  `motion.ts:170,200`, `timing.ts:81`, `validity.ts:312,349` — each does
  `test.fixme(true, divergence)`. Declared in 11 certified specs
  (`breadcrumbs`, `slider`, `rangeslider`, `tableview`, `alertdialog`,
  `colorslider`, `colorwheel`, `colorarea`, `colorswatch`,
  `colorswatchpicker`, `field-validity`).
- what: `certified-waivers.json` is the *policed* channel — every entry needs a
  positive-integer ticket that exists on the board and is not closed, plus a
  `YYYY-MM-DD` expiry, and a stale entry fails the job
  (`certified-waivers.ts:219-251`). `certified-waivers.json` is currently `[]`,
  which is what "zero waivers" in the reviews means. But `knownDivergences`
  routes around all of it: `test.fixme` makes the result `skipped`
  (`certified-summary.ts` reporter `classifyResult`, line 147-151), skipped is
  counted into `totals.skipped` and **never** gated. No ticket, no expiry, no
  board check, no report section.
- proof: `cat apps/comparison/e2e/certified-waivers.json` → `[]`.
  `grep -rn "knownDivergence" apps/comparison/e2e/certified/*.ts | grep -c ":"`
  → live `knownDivergences:` blocks in 5 specs plus prose in 6 more.
  `waiverGateFails` never reads `totals.skipped`.
  Smallest planted defect: add `knownDivergences: { "default": "flaky on CI" }`
  to any scenario. The divergence is now permanently invisible and green.
- expected: Either route `knownDivergences` through `certified-waivers.json`
  (ticket + expiry + board status), or have the merge fail when
  `totals.skipped` exceeds a committed baseline. `validity.ts:34` and
  `field-validity.certified.spec.ts:29` already write down the honesty rule in
  prose — prose is not a gate.
- blast radius: Every "zero-waiver certification" claim in `.agents/` and the
  certification doc.

### HIGH CI retries turn a flaky certified failure into a pass, and `flaky` never gates

- where: `apps/comparison/playwright.config.ts:38` (`retries: process.env.CI ? 2 : 0`)
  + `apps/comparison/e2e/reporters/certified-summary.ts:74-80`.
- what: On CI every certified case gets two retries. A case that fails then
  passes is classified `passed`, with `cell.flaky += 1`. `flaky` is reported in
  the markdown totals and is not part of `waiverGateFails`. So a genuine
  1-in-3 regression — precisely what a runtime swap to Solid 2 RC produces —
  reports green.
- proof: `classifyResult` (`certified-summary.ts:147-151`) keys on
  `result.status`; Playwright sets the last attempt's status. `waiverGateFails`
  (`certified-waivers.ts:269`) reads only `problems` and `unwaived`.
  Smallest planted defect: a driver assertion that fails on ~40% of runs. Green
  in CI, red locally (`retries: 0`).
- expected: Fail the merge when `totals.flaky > 0`, or carry a flaky budget in
  the same ratchet as the case count. Retries are for infrastructure noise;
  nothing here distinguishes the two.
- blast radius: The recertification bar, in the one release where runtime
  timing changed under every component.


### MEDIUM Snapshots were the only oracle for the Solid 2 DOM change, and the codemod commit reblessed them

- where: `packages/solid-spectrum/test/__snapshots__/regression.test.tsx.snap` (the only
  `*.snap` in `163f4377`, 16 +/16 −); the blessed structural delta originates at
  `packages/solidaria-components/src/Popover.tsx:888-895`.
- what: Solid 2's `Portal` no longer inserts a wrapper element — it splices children
  into the mount between text markers — so the `ref` callback at `Popover.tsx:890`
  that set `el.style.display = "contents"` is now never invoked, and the
  `<div style="display: contents;">` that wrapped the focus-scope sentinels, the
  underlay and the popover is gone from the DOM. Nothing in the gate chain noticed:
  `Portal`'s Solid 2 type declares only `{ mount?, children }`, but
  `JSX.IntrinsicAttributes` declares `ref?: Ref<unknown>` for *every* component, so
  `typecheck` accepts a ref that is silently dropped. The single check that did see the
  change was the snapshot, and it was regenerated in the same commit.
- proof:
  - `sed -n '1977,2012p' node_modules/@solidjs/web/dist/web.js` — `portalImpl` creates
    three `document.createTextNode("")` markers and never reads `props.ref` or creates
    an element.
  - `sed -n '78,81p' node_modules/@solidjs/web/types/index.d.ts` — `Portal(props: { mount?: Element; children: JSX.Element })`; no `ref`.
  - `sed -n '246,248p' node_modules/@solidjs/web/types/jsx.d.ts` — `interface IntrinsicAttributes { ref?: Ref<unknown> }`, which is why passing it typechecks.
  - `git show 163f4377 -- packages/solid-spectrum/test/__snapshots__/regression.test.tsx.snap`
    — the Menu/ActionMenu hunks drop the outer `<div style="display: contents;">`.
- expected: a dropped `ref` on a component that cannot honour it should fail a gate, and
  a DOM-structure change during a runtime migration should be a reviewed diff, not a
  re-recorded baseline. Upstream RAC uses `createPortal` with no wrapper
  (`react-spectrum/packages/react-aria/src/Overlay.tsx`), so the *resulting* DOM is
  closer to upstream than before — the defect is that no gate distinguished this
  outcome from a regression.
- blast radius: every `*.snap` regenerated in a migration commit blesses whatever the
  new runtime produced. The rest of `163f4377`'s deltas are attribute-value and
  attribute-order churn (`data-expanded=""`→`"true"`, `suppresscontenteditablewarning`,
  inline-style property order) and were checked and found benign; this was the one
  structural change.
- smallest planted defect it would miss: delete the `contain` prop from the `FocusScope`
  at `Popover.tsx:899` and re-run `vp run test` with `-u` once; focus containment is
  gone and the snapshot records the new, smaller DOM as the baseline.

### CRITICAL `guard:release-prerequisites` checks nothing — it is the last gate before `changeset publish`

- where: `scripts/check-release-prerequisites.mjs:67` (the loop) and
  `scripts/release-prerequisites.json` (its entire input). Wired at `package.json`
  `"changeset:publish": "vp run guard:release-prerequisites && vp run build && changeset publish"`
  and `"ci:changesets"`, and run in the privileged Release job.
- what: the guard only inspects packages listed in `release-prerequisites.json`. That
  file lists exactly one package, `@proyecto-viviana/kumo`, and kumo is at version
  `0.0.0`, so it takes the `SKIP` branch at line 97 and is never checked either. The six
  other publishable packages — including the five that actually ship — are absent from
  the config, so the loop never sees them. The guard then prints `PASS`. Its only real
  assertion, `prerequisite.satisfied === true` with a non-empty `evidence` string, is in
  any case self-attested prose that nothing re-runs.
- proof:
  ```
  node scripts/check-release-prerequisites.mjs
  # SKIP: @proyecto-viviana/kumo@0.0.0 is not a publish candidate.
  # release prerequisites — PASS   (exit 0)
  node -e 'for(const d of require("fs").readdirSync("packages")){try{const m=require(`./packages/${d}/package.json`);if(!m.private)console.log(m.name,m.version)}catch{}}'
  # @proyecto-viviana/geist 0.0.0 / kumo 0.0.0 / solid-spectrum 0.7.0 /
  # solid-stately 0.5.2 / solidaria 0.5.0 / solidaria-components 0.6.0 / ui 0.7.0
  ```
  One entry in, one entry skipped, exit 0 — under two minutes to re-run.
- expected: a release prerequisite gate should enumerate publish candidates from the
  tree (the same set `check-publish-drift.mjs` derives at `scripts/check-publish-drift.mjs:41-60`:
  non-private `packages/*` minus `.changeset/config.json` `ignore`) and fail on any
  candidate with no entry, rather than trusting a hand-written allowlist that has fallen
  six packages behind.
- blast radius: every npm publish. `@proyecto-viviana/ui@0.6.0` already shipped broken
  once; this is the gate that is supposed to stand between that and the registry, and it
  is a no-op for `@proyecto-viviana/ui`.
- smallest planted defect it would miss: any of them. There is no input to this gate that
  concerns a shipping package, so no defect in one can fail it.

### MEDIUM `guard:publish-drift` only diffs `src/`, so a manifest-only drift is invisible

- where: `scripts/check-publish-drift.mjs:95-99` (`unreleasedSourceFiles` diffs
  `packages/<dir>/src` alone).
- what: the guard's own header reasons that only `src/` matters because `files` is
  `["dist","src"]` and `dist` is generated. But npm always publishes `package.json`
  itself, and that file carries `exports`, `dependencies`, `peerDependencies` and
  `sideEffects` — all consumer-visible. A commit that changes only a manifest is drift by
  the guard's own definition and the guard cannot see it.
- proof: `sed -n '94,100p' scripts/check-publish-drift.mjs` — the git range is restricted
  to `--  packages/<dir>/src`. The same header at lines 3-26 states the failure mode this
  guard exists to prevent (a published tarball whose contents lag the resolved version),
  which a manifest change produces exactly as well as a source change.
- expected: diff the package's published surface, i.e. `src` plus `package.json`.
- blast radius: consumers of any published package.
- smallest planted defect it would miss: add a new subpath to `exports` in
  `packages/solidaria/package.json` with no changeset. In-repo everything resolves
  through workspace links and stays green; the published tarball keeps the old `exports`
  under a version consumers already have cached, and the new subpath 404s.

### Checked and sound (no finding)

- `scripts/check-publish-drift.mjs:100-107` refuses to answer on a shallow clone rather
  than reporting clean — correct fail-closed behaviour, and the pattern the other guards
  should copy.
- `scripts/check-package-artifacts.mjs` fails closed on a missing source map: an
  attributed source with no mapped build output is pushed as a problem
  (`check-package-artifacts.mjs:129-137`), so dropping sourcemaps cannot silently zero
  the check.
- `scripts/check-release-evidence.mjs` genuinely pins the release to a SHA: all three of
  `certification-gates.yml`, `release-readiness.yml`, `site-gate.yml` must be
  `completed`+`success` for the exact `RELEASE_SHA` on `main`, and both a completed
  non-success and the 15-minute timeout exit 1.
- The four `async function main()` scripts with no `.catch` (`check-rac-parity.ts`,
  `check-rac-export-gap.ts`, `check-dnd-keyboard-parity.ts`,
  `check-virtualizer-keyboard-parity.ts`) fail closed: Node's default
  `--unhandled-rejections=throw` exits 1.
- No root `package.json` script masks an exit code (`|| true`, a pipe, `; exit 0`,
  `2>/dev/null`): verified by scanning all script bodies.
- `guard:deploy-target` is not unwired — `apps/web/package.json` runs it as the first
  step of `deploy`.

### CRITICAL 148 unit tests in `apps/comparison` never run in CI, including the SSR/hydrate suite

- where: `package.json:74-75` (`test:web`, `test:comparison-data`), `package.json:73`
  (`"test:run": "vp test run packages scripts"`), `vitest.ssr.config.ts:28` and
  `vitest.hydrate.config.ts:45` (both `include: ["packages/**/…"]`),
  `apps/comparison/vitest.config.ts:17` (`include: ["e2e/drivers/**/*.unit.test.ts"]`).
- what: every root test entry point is scoped to a directory or a single file.
  `test:run` covers `packages` and `scripts` only; the SSR and hydrate configs glob
  `packages/**`; `test:comparison-data` names exactly one file,
  `apps/comparison/src/data/prop-tables.test.ts`. The result is that 15 of the 27 test
  files under `apps/` — 148 `it`/`test` cases — are reachable from no workflow. Nine of
  them have a dedicated `comparison:test:*` script in the root `package.json` that no
  workflow calls, which is why they read as covered.
- proof:
  ```
  # what CI actually runs from apps/comparison:
  #   test:comparison-data        -> src/data/prop-tables.test.ts
  #   comparison:test:certified-waivers -> src/data/certified-waivers.test.ts
  #   comparison:test:journeys-driver   -> e2e/drivers/**/*.unit.test.ts
  grep -n include apps/comparison/vitest.config.ts vitest.ssr.config.ts vitest.hydrate.config.ts
  node -p 'require("./package.json").scripts["test:run"]'   # "vp test run packages scripts"
  find apps -name '*.test.ts*' | grep -v node_modules       # 27 files
  ```
  The 15 unreached files: `src/data/{acceptance-schema,chrome-css-coalesce,chrome-published-condition,client-router,combobox-picker-fixture-form,demo-control-split,demo-url,fixture-registry-split,report-component-parity-options}.test.ts`,
  `src/worker.test.ts`, and all five of `test/solid-integration/*.{ssr,hydrate}.test.tsx`.
- expected: `ci:release-readiness` should discover tests, not enumerate them. The
  `comparison:test:*` scripts exist, so the intent was to run them.
- blast radius: worst in exactly this week's context. `test/solid-integration/` holds 91
  of the 148 cases and is the only suite that exercises SSR output and client hydration
  of the comparison renderer — the failure mode a Solid 1 → Solid 2 runtime swap
  produces. It did not run against `163f4377`.
- smallest planted defect it would miss: break hydration in the comparison renderer, e.g.
  return a different element tag on the server than on the client. All 91
  solid-integration cases fail locally and CI stays green.

### HIGH npm itself is installed from an unpinned range in the job that holds the publish token

- where: `.github/workflows/release.yml:57-58` — `run: npm install -g npm@^11.5.1`.
- what: the `release` job holds `contents: write`, `pull-requests: write` and
  `id-token: write`, and ends by publishing to npm. Every third-party action in that same
  job is pinned to a commit SHA, and lines 75-78 spell out why: a mutable reference
  "lands here unreviewed, in the one job that holds `contents: write`,
  `pull-requests: write` and an npm publish token." The npm upgrade one step earlier
  resolves a caret range at job time and gets whatever the registry serves.
- proof: `sed -n '30,88p' .github/workflows/release.yml` — `actions/checkout`,
  `pnpm/action-setup`, `actions/setup-node` and `changesets/action` are all
  `@<40-hex> # vN`; line 58 is the one mutable dependency in the job.
- expected: the repository's own stated rule, applied to npm: pin the exact version
  (`npm@11.5.1`) and bump it deliberately.
- blast radius: the publish path for all seven packages, plus write access to the repo.
- smallest planted defect it would miss: a new npm 11.x patch that changes packing or
  provenance behaviour ships into the release job with no diff anywhere in this repo.

### HIGH `Changesets Check` is `pull_request`-only in a repository that commits straight to main

- where: `.github/workflows/changesets-check.yml:3-5` (`on: pull_request` only), which is
  the sole caller of `ci:changesets` (`package.json`), which is the sole caller of
  `scripts/check-changeset-required.mjs` and `scripts/check-changeset-status.mjs`.
- what: 200 of the last 211 commits on `main` are non-merge commits landed directly, so
  this workflow structurally almost never fires. `guard:publish-drift` was rescued out of
  it into `release.yml:72-73`, but `check-changeset-required` and
  `check-changeset-status` were not, and no other workflow runs them. They are dead
  gates. `check-release-evidence.mjs` does not list `Changesets Check` among the three
  workflows it requires, so a release is never blocked on them either.
- proof:
  ```
  sed -n '1,12p' .github/workflows/changesets-check.yml      # on: pull_request
  git log --oneline -200 --merges | wc -l                    # 11
  grep -rn "check-changeset" .github/workflows package.json  # only via ci:changesets
  sed -n '1,40p' scripts/check-release-evidence.mjs          # three required workflows, not this one
  ```
- expected: the same `push: branches: [main]` trigger the other three gate workflows
  carry, or the two checks folded into `ci:release-readiness`.
- blast radius: the changeset discipline the whole release flow rests on.
- smallest planted defect it would miss: land a source change on a publishable package
  with no changeset at all. `guard:publish-drift` in `release.yml` would still catch a
  `src/` change — but a `package.json`-only change (see the `guard:publish-drift`
  finding above) passes both.

### MEDIUM `guard:package-sourcemaps` is claimed as a contract holder but runs nowhere

- where: `package.json:111` defines
  `"guard:package-sourcemaps": "node scripts/check-package-macro-sourcemaps.mjs"`;
  `.claude/current/tooling.md:172` states "`guard:package-sourcemaps` holds its
  contract" for `selectPackPasses` in `scripts/package-macro-plugin.mjs`.
- what: the script is named in exactly three places — its own definition, its own PASS
  message, the tooling doc, and a closed ticket. No workflow, no composite `ci:*` or
  `guard:*` script, and no package-level `package.json` invokes it.
- proof:
  `grep -rn "package-sourcemaps\|check-package-macro-sourcemaps" --include=*.json --include=*.yml --include=*.md . | grep -v node_modules`
  returns `package.json:111`, `scripts/check-package-macro-sourcemaps.mjs:85`,
  `.claude/current/tooling.md:172`, `.claude/tickets/tasks/22-…md:64`. None is a caller.
- expected: per this repository's own craft rule — "A claim is a debt. Write that
  something is guarded … only with a runnable proof" — either wire it into
  `ci:release-readiness` or delete the claim.
- blast radius: published sourcemap fidelity for the style-macro packages, unguarded
  while documented as guarded.
- smallest planted defect it would miss: change `selectPackPasses` so the macro pass runs
  after the sourcemap pass; published `dist/*.js.map` stops mapping to authored source
  and nothing reports it.

### HIGH Four headless-core unit tests assert nothing while claiming a behavior

- where:
  - `packages/solidaria/test/createFormValidation.test.tsx:122` — "should commit validation on invalid event"
  - `packages/solidaria/test/createFormValidation.test.tsx:229` — "should commit validation on change event"
  - `packages/solidaria/test/createFocusRing.test.tsx:346` — "should set isFocusVisible to true initially when autoFocus is true and focused"
  - `packages/solidaria-components/test/Toast.test.tsx:340` — "global queue should have hasExitAnimation enabled"
- what: each body renders, fires an event, and ends on a comment instead of an
  assertion. Three of the four comments openly concede it:
  `"(we can't easily test preventDefault here, but we can verify it runs)"`,
  `"// Validation should be committed"`, `"// Without actual focus, isFocusVisible is false"` —
  that last one contradicts its own title. `createFocusRing.test.tsx:349` assigns
  `result` and never reads it. `Toast.test.tsx:340` never inspects `hasExitAnimation`
  or the queue's state. All four run under `test:run` and count as passes.
- proof: scanned all 6,794 `it`/`test` blocks across the 567 committed test files for any
  of `expect(`, `assert`, `toMatchSnapshot`, `.rejects`, `.resolves`, `axe`, `checkA11y`
  in the block body; 21 blocks flagged, of which these four are real (the other 17 are
  `describe`/`beforeEach`/`test.use` headers or delegate to an asserting helper).
  Script kept at `scratchpad/noassert.mjs`; or read the four line ranges directly —
  `sed -n '122,150p' packages/solidaria/test/createFormValidation.test.tsx`.
- expected: a test named for a behavior asserts that behavior, or is deleted. Upstream's
  equivalents do assert — e.g. `react-spectrum/packages/@react-stately/form` and
  `@react-aria/form` tests check `validationState.displayValidation`.
- blast radius: the three named behaviors — native validation commit on `invalid`,
  native validation commit on `change`, and global-toast exit animation — have zero
  regression coverage while reading as covered in both the file and the green count.
- smallest planted defect it would miss: delete the `invalid`/`change` listeners from
  `createFormValidation`. Both tests still pass.

### MEDIUM `guard:entry-import-budget` silently skips any entry that is not built

- where: `scripts/check-entry-import-budget.ts:141` (`if (!existsSync(entryFile)) return null; // not built`)
  and `:209` (`if (!measured) continue;`).
- what: an entry whose built file is absent is skipped rather than reported. The
  `measuredEntries === 0` check at `:224` only catches the case where *every* entry is
  unbuilt; a partial build passes on whatever did build. The gate runs immediately after
  `build` in `certification-gates.yml`, so the window is narrow, but the budget's own
  count is never asserted against the budget file's entry count.
- proof: `sed -n '137,150p;205,232p' scripts/check-entry-import-budget.ts`.
- expected: fail on any budgeted entry that did not resolve, the way
  `--write-baseline` already does at `:222` (`throw new Error(\`${entry.package} ${entry.entry} is not built.\`)`).
- blast radius: one entry's module ceiling stops being enforced without a signal.
- smallest planted defect it would miss: stop emitting one package's `dist` entry; its
  ceiling is no longer checked and the gate still prints a verdict.

### Note — the "2,177 cases" figure is an observation, not an assertion

`.claude/tickets/initiatives/136-run-the-2026-09-full-repo-audit.md:161` records
"certified discovery is 2,177", and ~20 `.agents/` execution records repeat it as the
release bar. Nothing in the gate chain compares a run's discovered count against it:
`apps/comparison/scripts/certified-summary.ts` carries no baseline, floor or minimum, and
`merge-certified-reports.ts` exits non-zero only on a missing shard summary, a shard
count other than 8, a `playwright merge-reports` failure, or `waiverGateFails`. The number
is therefore typed into documents rather than enforced — which is the mechanism behind the
"no case-count floor" finding above, restated here because the figure is quoted as
evidence in release decisions.

### MEDIUM Every local gate run can pass against a stale build, and local runs are what the `.agents/` receipts record

- where: `apps/comparison/playwright.config.ts:79` and `apps/web/playwright.config.ts:35`,
  both `reuseExistingServer: !process.env.CI`. `apps/web/playwright.config.ts:33`'s
  `command` is `vp build && vp preview --port 4000`, which is skipped entirely when a
  server already answers on that port.
- what: in CI the servers are started fresh, so CI is sound. Locally, any preview server
  left running on `:4000` (web) or the comparison preview port satisfies the `url` probe,
  the `command` — including its `vp build` — never runs, and the whole certified suite,
  `a11y:check`, `a11y:full`, `test:routes`, `test:seo` and `test:api-reference` grade the
  previous build. The release evidence quoted in ticket notes and `.agents/` receipts
  ("SSR 74/74 then hydrate 82/82", "2,177-case same-revision") is produced by exactly
  these local runs, so a receipt can attest a revision it never exercised.
- proof: `grep -n reuseExistingServer apps/*/playwright.config.ts`; the web config's
  build is inside `webServer.command`, which Playwright skips on server reuse.
- expected: `reuseExistingServer: false` for any run whose output is recorded as
  evidence, or a served-revision probe — the certified reporter already captures
  `git rev-parse HEAD` (`apps/comparison/e2e/reporters/certified-summary.ts:44`) but only
  for the *runner*, never for the *served bundle*, so the two can disagree silently.
- blast radius: every locally produced evidence receipt, which is how this repository
  records "proved closure".
- smallest planted defect it would miss: break any styled component, leave yesterday's
  preview running, and run `vp run comparison:test:certified`. It is green, and the
  summary JSON stamps today's HEAD on it.

### Note — `a11y:full` and `a11y:check` are not the same bar

`a11y:full` (run in `certification-gates.yml`) is
`a11y:axe:playground && a11y:axe:comparison && a11y:smoke`; `a11y:check` (run via
`ci:site` in `site-gate.yml`) is `a11y:axe:aa && a11y:axe:comparison && a11y:contrast && a11y:smoke`.
Neither is a superset: the blocking certification job never runs `a11y:contrast`, and the
site job never runs the unrestricted playground axe sweep. `a11y:ci` is an alias for
`a11y:check` that no workflow calls.

## Verdict

**No. I would not cut an rc from this tree.**

Not because the tree is known bad — because the gate chain cannot tell me it is
good. The three things that decide a release each have a hole big enough to walk
a regression through:

1. The certified suite, the repository's stated recertification bar, gates on
   `waiverGateFails` alone. That predicate is blind to a spec that failed to
   load, to a spec that no longer exists, to a spec parked behind
   `knownDivergences` → `test.fixme`, and to a failure that passed on one of
   CI's two retries. A green certified report is consistent with a suite that
   ran nothing.
2. `guard:release-prerequisites` — the last gate before `changeset publish` —
   asserts nothing about any package that will publish. It iterates one entry,
   skips it, and prints `PASS`.
3. 148 unit tests under `apps/` never run in CI, 91 of them the SSR and
   hydration suite for the comparison renderer. That is the exact coverage a
   Solid 1 → Solid 2 runtime swap needs, and it did not run against `163f4377`.

The framing in the brief — a syntax error and 373 unformatted files sitting on
main across eleven red pushes — is consistent with this shape. These are not
gates that broke; they are gates that were never load-bearing, wearing names
that say otherwise. The repository's own craft rule covers it: *a claim is a
debt*. `guard:package-sourcemaps` is documented as holding a contract and runs
nowhere; nine `comparison:test:*` scripts exist for tests no workflow calls;
`Changesets Check` guards a pull-request flow this repository does not use.

Three things I would fix first, in order:

1. **Give the certified gate a floor.** Add `onError` to
   `CertifiedSummaryReporter` and record a discovered-case count per shard; fail
   `merge-certified-reports.ts` on any reporter error and on a total below a
   committed baseline. This closes findings 1, 2 and the "2,177" note together,
   and it is the smallest change with the largest reach.
2. **Make `ci:release-readiness` discover tests instead of listing them**, so the
   15 unreached files under `apps/` run — starting with
   `apps/comparison/test/solid-integration/`, before the rc.
3. **Make `guard:release-prerequisites` enumerate publish candidates from the
   tree** (reusing `check-publish-drift.mjs:41-60`) and fail on any candidate
   with no entry. Until then, treat it as absent rather than as a gate.

Everything else in this file is real but survivable. These three are the
difference between "the gates passed" meaning something and meaning nothing.
