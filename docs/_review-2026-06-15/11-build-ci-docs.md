# Build / CI / Release / Performance + Docs Drift — Audit 2026-06-15

Reviewer lane: 11 of 11.
Standard: AGENTS.md Rule #1 (gate ladder must be enforced, not documented theater),
Rule #6 (code/config wins over docs).

---

## Findings (worst-first)

---

### [Critical] The entire certification gate ladder — lint, typecheck, parity guards, and the strict parity report — is absent from CI

**Evidence:**

- `.github/workflows/release-readiness.yml:35-36` — the only readiness job runs
  `pnpm run ci:release-readiness`, which expands to `vp run build && vp run test:run`
  (`package.json` lines 83, `ci:release-readiness` script). That is: build + unit tests only.
- `.github/workflows/accessibility-playground.yml:38-39` — runs `pnpm run ci:a11y`
  (axe AA + smoke).
- `.github/workflows/changesets-check.yml:40` — runs `pnpm run ci:changesets`
  (changeset discipline only).
- `.github/workflows/release.yml` — triggers on push to `main`; runs
  `changesets/action` to create version PRs or publish. No quality gate.
- **None of the four workflows contains any of the following scripts:**
  `vp run check` (Oxlint + typecheck), `vp run guard:rac-parity`,
  `vp run guard:rac-export-gap`, `vp run guard:dnd-keyboard-parity`,
  `vp run guard:virtualizer-keyboard-parity`, `vp run comparison:report:parity:strict`,
  `vp run comparison:test:pair`, `vp run comparison:test:contract`,
  `vp run docs:check`, `vp run guard:docs-routes`.
  Confirmed by `grep -rn` across all four workflow files — zero hits.

**Why (Rule #1):** `certification.md` defines a gate ladder with two tiers — a floor
(`vp run check`, `vp run test:run`, `vp run a11y:check`) and "the real bar"
(`comparison:test:pair`, `comparison:test:contract`, `comparison:report:parity:strict`,
plus all four `guard:*` scripts). `status.md` calls `comparison:report:parity:strict`
"expected to pass" and says "treat a failure as a blocking regression."
`steering.md` says in-scope failures "block." None of this is actually enforced on PRs.
A contributor who breaks `guard:rac-parity`, introduces a type error, or degrades the
strict parity report can merge green. The gate ladder is documented theater.

**Why (Rule #6):** The doc claims these gates block; the workflow files say they don't.
The code (workflows) is the ground truth per Rule #6, and it contradicts the docs
(`certification.md`, `status.md`, `steering.md`, `release-policy.md`).

**Most important omission within this finding:** `vp run check` (format + lint +
typecheck) is not in CI at all. A PR containing TypeScript type errors, dead code
importing wrong symbols, or a lint violation merges without any automated objection.
The pre-commit hook (`vite-hooks/pre-commit`) runs `vp staged`, but that is a local
opt-in, not a CI gate, and it only runs on staged files.

**Fix:** Add a `static-gate` CI job to `release-readiness.yml` that runs `vp run check`
(lint + typecheck) before the build step, and add a second job that runs
`vp run comparison:report:parity:strict` and `vp run guard:rac-parity` plus
`vp run guard:rac-export-gap`. The comparison test suite (`comparison:test:pair`,
`comparison:test:contract`) can remain optional or a separate non-blocking job until
runtime is acceptable on CI, but the static parity guards are fast and should block.

---

### [Critical] `bench:vitals` references a workspace package that does not exist — the script silently fails

**Evidence:**

- `package.json` script: `bench:vitals = vp exec --filter benchmarks-web-vitals -- playwright test`
- `pnpm-workspace.yaml` lists only `packages/*`, `apps/web`, `apps/comparison`.
  There is no `benchmarks/web-vitals` directory and no package with
  `"name": "benchmarks-web-vitals"` anywhere in the tree (confirmed by search).
- `bench:all` chains `bench:bundle && bench:runtime && bench:vitals`, so it will
  always fail at the third step.
- No workflow invokes `bench:*`, so this failure is currently invisible.

**Why (Rule #5 / tech-debt principle):** `bench:vitals` is a dangling reference — it
points to infrastructure that was never created. It is not labeled as a stub or a
future goal in any tracked debt entry (`tech-debt.md` has no mention of web-vitals).
This is exactly the "parallel truth with no exit" anti-pattern Rule #5 flags.

**Fix:** Either create the `benchmarks/web-vitals` package with a minimal Playwright
config and add it to `pnpm-workspace.yaml`, or delete the `bench:vitals` and
`bench:all` scripts and add a tech-debt entry describing what is missing. Do not leave
a broken public script in `package.json`.

---

### [High] `ci:release-readiness` omits `vp run check` — format, lint, and typecheck are not part of any CI gate

**Evidence:**

- `package.json`: `ci:release-readiness = vp run build && vp run test:run`.
  `vp run check` (`vp check && vp run typecheck`) is not included.
- `release-policy.md` states: "PR enforcement mirrors these locally:
  `Changesets Check` = `ci:changesets`, `Release Readiness` = `ci:release-readiness`,
  `Accessibility Gate` = `ci:a11y`; together they match `vp run pr:check`."
  But `vp run pr:check` = `vp run pr:check:fast && vp run ci:a11y` =
  `ci:changesets + ci:release-readiness + ci:a11y`. `vp run check` is not in
  `pr:check:fast` or `pr:check`.
- `certification.md:59` includes `vp run check` as a floor gate: "Floors (fast, run
  constantly): `vp run check # format, lint (type-aware), typecheck`."

**Why (Rule #1/#6):** The certification doc places `check` at the floor — the bare
minimum. The CI and `pr:check` scripts omit it. A PR with type errors or lint
violations gets `Release Readiness: pass`. The floor is not enforced. The docs claim
the floor is in `pr:check`; the script chain says otherwise.

**Fix:** Add `vp run check` as the first step of `ci:release-readiness` (before build),
or add it as a dedicated `static-gate` job. Update `release-policy.md` to accurately
describe what `ci:release-readiness` runs.

---

### [High] Benchmark infrastructure has no baselines, no budgets, and no CI gate — results cannot regress

**Evidence:**

- `benchmarks/bundle-size/results/bundle-sizes.json` exists but its `"timestamp"`
  is `2026-02-08T08:32:41.494Z` (four months before the review date of 2026-06-15),
  and both `pv_version` and `rs_version` are `"unknown"` — meaning the script ran
  but couldn't resolve package metadata. The JSON is a stale artifact with no version
  attribution.
- `benchmarks/runtime/README.md` explicitly states results are "not saved to JSON —
  too much variance." There is no baseline; there is no regression signal.
- No workflow invokes any `bench:*` script (confirmed: zero hits across all four
  workflow files).
- No budget file, no threshold config, no CI failure path exists for either benchmark.

**Why (Rule #1):** A benchmark that cannot fail is not a gate. `bench:bundle` produces
a results file but no comparison against a previous baseline, so a 50% bundle-size
regression is invisible. `bench:runtime` explicitly discards output. Neither can block
a PR. This is scaffolding, not a tracked performance signal.

**Fix (minimum viable):** For bundle size: git-commit a `benchmarks/bundle-size/results/baseline.json`
(a named, versioned snapshot) and add a budget check step to `analyze.ts` that exits
non-zero if the gzip delta vs baseline exceeds a threshold. For runtime: either persist
results or remove the claim that this is a measurement surface. Add at least one
`bench:*` step to CI, or explicitly document these as developer-only tools in
`tech-debt.md`.

---

### [High] Thirteen lint rules silenced in `vite.config.ts`, including critical TypeScript safety rules, with no CI gate to surface violations

**Evidence:**

- `vite.config.ts` (root) `lint.rules` block disables:
  `typescript/no-floating-promises`, `typescript/await-thenable`,
  `typescript/no-base-to-string`, `typescript/restrict-template-expressions`,
  `typescript/unbound-method`, `eslint/no-unused-vars`,
  `eslint/no-unused-expressions`, and six more — 13 rules total, confirmed by
  reading the file.
- `tech-debt.md` records that `typeCheck` is intentionally off in the Vite Plus
  lint block (separate `vp run typecheck` runs after `vp check`), but the `vp run check`
  composite is itself absent from CI (see High finding above), so neither the
  weakened lint pass nor the separate typecheck step gates PRs.

**Why:** Several silenced rules (`no-floating-promises`, `await-thenable`) catch
async correctness bugs that are invisible without type-aware analysis and that map
directly to the Solid reactivity traps documented in `architecture.md`. Silencing them
is a known trade-off, but the trade-off is only defensible if the typecheck gate at
least runs in CI — and it does not.

**Fix:** Restore CI enforcement of `vp run check` (see High #1). Review whether
`no-floating-promises` and `no-unused-vars` can be re-enabled now that `tsgolint`
behavior is understood. Document each silenced rule's rationale inline when it cannot
be re-enabled.

---

### [Medium] `tech-debt.md` entries lack owner and deadline — "exit" conditions are described but unowned

**Evidence:**

- `tech-debt.md` YAML frontmatter shows three open tasks (`pkg-build-spectrum-dts`,
  `pkg-build-remaining`, `support-export-audit`). The first has `target: 2026-06-20`
  (five days after review date); the second and third have no deadline.
- None of the prose debt entries (lint type-checking runs separately, axe color-contrast
  excluded, visual-state coverage debt, support-export gap, license attribution
  incomplete) names an owner.
- The color-contrast exclusion entry has no target date; `tech-debt.md` has been the
  home for this since at least the status refresh on 2026-06-12.

**Why (Rule #5):** Rule #5 requires every patch and prototype to have "a deadline to
become real structure or be deleted — never a parallel truth." An exit condition
without an owner or date is a wish, not a commitment. The debt will persist
indefinitely.

**Fix:** Add an owner field to every debt entry (even "owner: tbd" is better than
nothing); add target dates to the color-contrast and visual-state coverage entries.
Consider making `docs:check` validate that tech-debt entries with `state: in-progress`
have a `target` date.

---

### [Medium] `status.md` "strict audit green" claim overstates behavioral certification depth

**Evidence:**

- `status.md:21`: "Strict S2 audit: `comparison:report:parity:strict`: modeled
  controls `69/69`, validation notes `69/69`, evidence `69/69`."
- But `report-component-parity.ts` (the strict script) gates on: manifest entries
  present, sidebar entries present, control groups modeled (not gap/empty), fixtures
  present, validation notes present, and current visual/asserted evidence present.
  It does NOT check gate-outcome tables, does NOT verify that acceptance gates are
  `complete`, and does NOT check whether pair-diff tests pass.
- `status.md:23`: "Visual-state coverage: `349` states tracked, `113` with current
  React/Solid visual evidence, `56` with strict pair-diff tests." So 293/349 states
  (84%) lack current visual evidence and 293/349 lack pair-diff tests.
- The strict report exits 1 on any blocking gap OR any `noCurrentVisualEvidence`.
  But "current visual/asserted evidence" (`hasCurrentVisualEvidence`) requires at
  least one state with `react: 'visual'|'asserted'` AND `solid: 'visual'|'asserted'`
  AND `pairDiff` not `planned`/`blocked`. This is a much weaker bar than "every
  rendering-affecting state has a computed contract or strict pair-diff test"
  (the exit condition in `tech-debt.md`).

**Why (Rule #6):** A reader of `status.md` who sees "strict audit: green, 69/69" and
"evidence 69/69" will infer much more behavioral coverage than exists. The script
confirms structural metadata (files exist, controls modeled) and at least one
visual-evidence state per component — not that the ten acceptance gates are complete
or that behavior/a11y is tested. This is a doc claim that misrepresents reality.

**Fix:** Add a caveat sentence to the `status.md` snapshot row: "Strict report green
means structural metadata and at least one visual-evidence state per component, not
acceptance-gate completion." The count `56/349 pair-diff tests` should be called out
as the behavioral depth signal, not buried three lines below the green claim.

---

### [Medium] `release-policy.md` describes CI coverage that does not match the actual workflows

**Evidence:**

- `release-policy.md:46-48`: "PR enforcement mirrors these locally: `Changesets Check`
  = `ci:changesets`, `Release Readiness` = `ci:release-readiness`, `Accessibility Gate`
  = `ci:a11y`; together they match `vp run pr:check`."
- `vp run pr:check` = `vp run pr:check:fast && vp run ci:a11y` = `ci:changesets +
ci:release-readiness + ci:a11y`. `vp run pr:check:fast` does NOT include
  `vp run check` (lint/typecheck).
- The doc says "together they match `vp run pr:check`." This is literally accurate
  but implies `pr:check` is the full gate. `pr:check` itself omits `vp run check`.
  A reader following the "run `pr:check` locally before opening a PR" instruction
  will never run lint or typecheck locally either.

**Why (Rule #6):** The release-policy doc, when read alongside the certification doc
(which calls `vp run check` a floor), creates contradictory guidance: one says check is
a floor, the other implies `pr:check` is the full local bar. The conflict should be
resolved so the local and CI bars match and are clearly stated.

**Fix:** Either add `vp run check` to `pr:check:fast` (which fixes the local bar too),
or update `release-policy.md` to explicitly note that `pr:check` does not run format/
lint/typecheck and that those should be run separately as `vp run check` before PR.

---

### [Low] Bundle-size benchmark results have stale, `"unknown"` version metadata with no refresh protocol

**Evidence:**

- `benchmarks/bundle-size/results/bundle-sizes.json:4-8`: `"timestamp": "2026-02-08"`,
  `"pv_version": "unknown"`, `"rs_version": "unknown"`.
- `analyze.ts` derives PV version from `packages/solid-spectrum/package.json` and RS
  version from `apps/comparison/package.json` dependencies. Both returned "unknown"
  during the last run, meaning the resolution paths may have been wrong at capture time.
- No `README.md` instruction or CI job says when to refresh this file.

**Why:** The bundle-size JSON is the only persisted benchmark artifact. Its metadata
cannot answer "what version was this measured against?" making it useless for
regression tracking. The `results/` folder is tracked in git (file exists in tree),
so stale JSON is part of the repo's permanent record.

**Fix:** Fix `getPackageVersions()` path resolution (it uses `resolve(__dirname, ...)`
which should work — investigate why it returned "unknown"); add a `--update-baseline`
flag that saves a dated snapshot; document in `benchmarks/bundle-size/README.md` when
to update the baseline.

---

### [Low] `docs:check` and `guard:docs-routes` are defined but never run in CI

**Evidence:**

- `package.json`: `docs:check = vp exec tsx scripts/check-docs-current.ts` and
  `guard:docs-routes = vp exec tsx scripts/check-doc-routes.ts`.
- Zero hits for either script name in any `.github/workflows/*.yml` file.
- `AGENTS.md`, `certification.md`, and `status.md` list `docs:check` in the refresh
  command block but do not call it a CI gate.

**Why:** `scripts/check-docs-current.ts` validates `.claude/current/` frontmatter
status headers and task-tracking consistency. Without CI enforcement, a contributor
can commit a doc with a missing or incorrect `status:` header, a broken roadmap
reference, or a task-tracking inconsistency and it will merge green. This is a
lower-severity finding because these are internal docs (not public API), but it
contradicts the "docs integrity gate" framing in `check-docs-current.ts` header.

**Fix:** Add `vp run docs:check && vp run guard:docs-routes` to the
`ci:release-readiness` composite or as a fast pre-flight in the `release-readiness`
workflow. Both scripts are read-only and fast.

---

## Suspected (unconfirmed)

- **`vp staged` pre-commit hook coverage is unknown.** The hook runs `vp staged`
  (mapped to lint-staged via `vite.config.ts staged` config), which runs `vp check --fix`
  on staged files. This runs Oxfmt + Oxlint on the staged diff. Typecheck is NOT in
  `vp staged` — it only runs in `vp check` (the full form). So even locally, a commit
  with a type error passes the pre-commit hook. Severity depends on how many contributors
  skip `vp run check` before opening PRs. Not confirmed because hook installation is
  opt-in (`vp config`).

- **`comparison:report:parity:strict` may be stale relative to current code.** The last
  `status.md` refresh was 2026-06-12, but the current git branch has modified files
  (`ActionMenu.tsx`, `Menu.tsx`, `ActionMenu.test.tsx`) that could affect parity state.
  The status snapshot is authoritative only at the moment it was last refreshed from
  scripts. No automated mechanism keeps it current between refreshes.

- **The `typecheck:web` script (`vp run build && tsc -p apps/web/tsconfig.json`) is
  also absent from CI.** `typecheck:all` = `typecheck + typecheck:web`; neither appears
  in any workflow. If `apps/web` has type errors introduced by a PR, they are
  undetectable in CI.

---

## Severity Summary

| Severity  | Count | Items                                                                                                                     |
| --------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| Critical  | 2     | Gate ladder absent from CI; `bench:vitals` dangling script                                                                |
| High      | 3     | `check` (lint/typecheck) missing from CI; no benchmark baselines/CI gate; 13 lint rules silenced with no CI enforcement   |
| Medium    | 3     | `status.md` overstates certification depth; `release-policy.md` misrepresents CI coverage; `tech-debt.md` entries unowned |
| Low       | 2     | Bundle-size results stale with `"unknown"` versions; `docs:check`/`guard:docs-routes` not in CI                           |
| Suspected | 3     | (see above)                                                                                                               |

**Single most important fix:** Add `vp run check` (lint + typecheck) and
`vp run comparison:report:parity:strict` as blocking CI jobs in
`release-readiness.yml`. Every other gap compounds from the fact that regressions in
type safety, lint correctness, and parity audit can merge green today.
