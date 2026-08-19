---
kind: plan
status: current
---

# Adversarial Repository Audit

Status: live audit in progress.
Update when: an audit axis is inspected, evidence changes a finding, or work
stops and the next investigator needs an exact resumption point.

Started: **2026-08-19**.

## Question being answered

What is actually done, missing, unsafe, unclear, or next in Viviana UI, and does
the integrated repository match the owner's model in the details—especially
behavior ownership, S2 and Kumo styling provenance, meaningful parity evidence,
accessibility, security, dependencies, releases, organization, and explanations
for outsiders?

This is an adversarial audit. A passing command is evidence only for the
specific failure modes that command can detect. Existing status documents,
baselines, test counts, route counts, export counts, and screenshots are claims
to verify rather than conclusions to inherit.

## Audit target and starting state

- Working directory: `/home/emoporemilio/projects/viviana-hub/ui`
- Branch at start: `main`
- `HEAD` at start: `32ad3307` (`Declare the ui support policy`)
- `origin/main` at start: `395f015e`; local `main` is one commit ahead.
- The worktree was already materially dirty at the start. It includes an
  untracked `packages/kumo`, Kumo comparison work, documentation edits, package
  and lockfile edits, build/smoke-script edits, and a large web landing-page
  edit. These are owner changes and must not be reset or overwritten.
- The prior repository assessment is dated 2026-08-09 at `20fb6164`. Its facts
  are useful hypotheses but are not current evidence for this audit target.

The audit target is the complete current working tree, because that is the
owner's current intended integration state. Findings must distinguish committed
`HEAD`, uncommitted integration work, generated/ignored evidence, and remote
state.

## Evidence labels

- **Verified** — inspected directly in current source/configuration or
  reproduced by a command whose detection boundary is understood.
- **Partially verified** — some branches or layers were inspected; named gaps
  remain.
- **Claimed** — a document, baseline, report, or prior run says it is true, but
  this audit has not independently established it.
- **Disproved** — current evidence contradicts the claim.
- **Unknown** — not yet investigated or blocked on unavailable evidence.

Severity describes owner risk, not code aesthetics:

- **P0** — publishing, compromise, destructive release, or evidence-integrity
  risk requiring action before ordinary parity work.
- **P1** — user-observable correctness/parity, accessibility, architectural
  ownership, or outsider-facing trust is materially wrong or unsupported.
- **P2** — bounded maintainability, organization, or explanation debt that can
  cause future drift.
- **P3** — local cleanup or polish.

## Work ledger

| Axis                                  | State       | Current checkpoint                                                                                                                                                                                                                                             |
| ------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository truth and claimed status   | in progress | The dated assessment/client contract are retired from the live read path; final measured `status.md` refresh waits for the validation ladder.                                                                                                                  |
| Package/dependency/build graph        | in progress | Full graph migrated; peer/frozen-install/audit checks and real six-package build passed, but final aggregate and external-consumer qualification remain.                                                                                                       |
| State/ARIA/component boundaries       | partial     | High-risk Dialog, overlay isolation, and Grid deletion paths were traced and fixed; a new import inventory exposes the much larger upper-layer ownership review still owed.                                                                                    |
| S2 styling provenance                 | partial     | S2 1.6 tokens/macro foundation is source-aligned and focused tests pass; Viviana is a documented owner-ratified fork, while source-map warnings and long-term convergence remain open.                                                                         |
| Kumo architecture and provenance      | partial     | Package/fixture target Kumo 2.11.0 and release now fails closed; paired browser behavior and visual evidence remain absent.                                                                                                                                    |
| Test relevance and evidence integrity | partial     | First complete 2176 certified run: 2164 pass / 6 fail / 6 skip (knownDivergence fixme). D12, AlertDialog AX, ActionMenu list D1/D5, and Dialog close-button D1/D3/D5 stay closed. Next: the four red families in `work-queue.md` census item 1.                 |
| Accessibility and i18n                | partial     | S2 AlertDialog description mapping, ActionMenu overlay focus, and Dialog trap-cycle/hover ring are closed. Remaining AX/keyboard: TableView Select All mixed, Tabs arrow, Toast alert role, TreeView tab-forward. DateField did not surface on the 2176 run.   |
| Security and dependencies             | partial     | Full and production audits now report zero known vulnerabilities and run in release readiness; response-header/CSP policy and app-boundary review remain open.                                                                                                 |
| Release and supply chain              | partial     | SHA-pinned actions/same-SHA checks remain positive; Kumo's npm/trusted-publisher prerequisites are now executable and negative-tested, not prose-only.                                                                                                         |
| Applications and deployment           | partial     | Web/comparison trust boundaries were inspected; prop-table HTML is hardened, but response security headers and browser-level Kumo proof remain open.                                                                                                           |
| Documentation and outsider clarity    | partial     | Public install/styling and sibling-layer descriptions are corrected; stale technical-debt and evidence-note generations still need normalization.                                                                                                              |
| Organization and resumability         | partial     | This audit is indexed as plan of record with an executable layer inventory; large fixtures, 59 suppressions, and competing stale debt prose remain.                                                                                                            |

## Findings register

### A-001 — The live health assessment does not describe the current audit target

- Severity: **P1** for project-control accuracy.
- Evidence state: **verified; control-plane remediation in progress**.
- Evidence: `.claude/current/repo-assessment.md` is dated 2026-08-09 at
  `20fb6164`; current `HEAD` is `32ad3307`, `origin/main` is `395f015e`, and the
  worktree contains material uncommitted Kumo, app, dependency, tooling, and
  documentation changes.
- Consequence: statements such as current gate health, vulnerability counts,
  package count, release readiness, task totals, and styling boundaries cannot
  be repeated as current facts without refresh and inspection.
- Remediation: `repo-assessment.md` is now marked `superseded`, the completed
  `ui-client-contract.md` is marked `done`, and the current-doc index points to
  this audit rather than either dated plan. `steering.md`, `work-queue.md`, and
  `roadmap.md` no longer select work from the old dependency/upstream state.
- Remaining action: rebuild `status.md` from the final current-tree validation
  ladder; retain old command results only as dated historical comparisons.

### A-002 — The strict component-parity report validates evidence labels, not the evidence

- Severity: **P1** for certification integrity.
- Evidence state: **verified**.
- Evidence: `apps/comparison/scripts/report-component-parity.ts` implements
  validation-note coverage with `existsSync` only. It does not parse the note's
  status, ten current gate rows, permitted outcomes, blockers, source ledger, or
  evidence paths. Its visual-evidence check trusts manually authored
  `react`/`solid`/`pairDiff` labels from `visual-state-matrix.ts`; it does not
  resolve the listed specs or prove that a test covers the labeled state. The
  default strict mode also subtracts the nine slugs frozen in
  `parity-strict-baseline.json`; only `--strict-full` exposes them as failures.
- Direct contradiction: the component-note index says Card/CardView are partial,
  Picker is partial, and Provider is pre-pass, while the same page reports
  complete validation-note and current visual/asserted counts and a passing
  strict audit. Those statements measure file/label presence, not current-gate
  acceptance.
- Consequence: a green `comparison:report:parity:strict` is useful inventory and
  anti-regression evidence, but cannot support a claim that a component is
  ported or current-gate accepted under Rule #1.
- Required action: make machine-readable component status and all ten gate
  outcomes the source of report truth; resolve and validate every referenced
  evidence file/test case; rename the existing headline so its narrower meaning
  is unmistakable. Preserve a backlog baseline only as an explicit incomplete
  status, never under a 100%-parity claim.

### A-003 — Component acceptance records use incompatible generations and vocabularies

- Severity: **P1** for status accuracy and agent continuity.
- Evidence state: **verified**, with the full per-file normalization inventory
  still to be checked into a generated report.
- Evidence: the current acceptance playbook requires ten gates and permits only
  `complete`, `partial`, and `not-started`. Existing notes include nine-gate
  tables with `done` (Accordion), tables using `passing` (Checkbox), older tables
  using `accepted`, and genuinely partial rows (for example DatePicker and
  Card/CardView). `playbook/components/README.md` acknowledges a legacy cohort
  that predates the known-defect gate, but also publishes a passing strict
  snapshot based on note presence.
- Consequence: readers and agents can interpret `accepted`, `passing`, `done`,
  and file presence as equivalent to all-current-gates `complete` when they are
  not. This makes progress non-additive: later agents can close or reopen work
  without a single status model detecting the change.
- Required action: define one schema and migrate every note mechanically;
  historical command evidence may remain, but current status must be derived
  from current gate rows and unresolved defects.

### A-004 — Current visual-evidence records contain stale test-file pointers

- Severity: **P1** for evidence traceability.
- Evidence state: **verified**.
- Evidence: a filesystem resolution pass over the `e2e/*.spec.ts` strings in
  `apps/comparison/src/data/visual-state-matrix.ts` found 13 referenced files
  that do not exist: the ColorArea, ColorSlider, ColorWheel, ColorSwatch,
  ColorSwatchPicker, ColorField, Calendar, DateField, TimeField, DatePicker,
  RangeCalendar, and DateRangePicker visual specs plus Calendar's contract
  spec. Several were superseded by `e2e/certified/*.certified.spec.ts`, but the
  matrix and report were not migrated and no guard resolves the pointers.
- Consequence: the report can label evidence current even when a future
  investigator cannot run the named proof. A replacement may be stronger, but
  provenance is broken until the exact scenario/case is linked.
- Required action: replace free-form `spec` strings with validated structured
  references to file, driver, case, and state; fail CI when any reference does
  not resolve.

### A-005 — The certified suite deliberately excludes unresolved parity branches from pass/fail

- Severity: **P1** where the suite or a component is described as fully
  certified; otherwise the explicit divergences are useful backlog evidence.
- Evidence state: **partially verified**; the 2026-08-19 2176 run classifies
  Playwright's 6 skipped as the six registered `knownDivergence` `test.fixme`
  cases. Deferred dimensions in spec comments are still uninventoried.
- Evidence: scenario drivers turn configured `knownDivergence` and
  `knownDivergences` cases into Playwright `test.fixme`, so they remain visible
  but cannot fail the suite. The 2026-08-19 2176 run's **6 skipped** are exactly
  those six: Slider D6 default, RangeSlider D6 default, TableView D6 sorted,
  Breadcrumbs D6 overflow, DatePicker D4 `placeholder · open-escape-close`,
  DateRangePicker D4 `placeholder · open-escape-close`. Certified specs also
  explicitly defer observable dimensions such as DnD pointer drag, Virtualizer
  horizontal behavior, Tooltip motion/focus, and several i18n/RTL or
  forced-color branches — those are comments, not Playwright skips.
- Consequence: “certified suite passed” means all non-excluded registered cases
  passed; it does not mean the component is a full port under Rule #1. This is
  especially risky when a note separately says `accepted` for an implemented
  subset.
- Required action: publish suite output as three counts—passing obligations,
  expected failures, and unregistered/deferred obligations—and make any
  divergence or deferred user-observable upstream branch block full component
  acceptance.

### A-006 — TableView adapts certification around an unratified architecture divergence

- Severity: **P1** for architecture, parity, accessibility, and test coverage.
- Evidence state: **verified**.
- Evidence: the Solid TableView uses a native `<table>` plus spacer-row
  virtualization while upstream Spectrum S2 uses a `div[role="grid"]`
  structure. Its certification record consequently declares major driver areas
  structurally impossible or non-applicable, including structure,
  virtualization, focus, and interaction branches. No current ADR or
  owner-ratified exception was found.
- Consequence: this may be a defensible local architecture, but until it is an
  explicit product decision the harness is adapting acceptance around a
  divergence rather than proving that the port mirrors upstream.
- Required action: owner-ratify and document the exception with its semantic
  contract, or converge on the upstream structure. In either case, do not call
  the currently excluded behavior fully certified.

### A-007 — Kumo is honestly experimental, but implementation has outrun its durable plan and parity evidence

- Severity: **P1** for status integrity and eventual port acceptance.
- Evidence state: **verified** for the current Button pilot.
- Evidence: the new Kumo package currently contains only Button and clearly
  documents omitted upstream exports. Its API, size values, loader behavior,
  and CSS closely follow Kumo 2.11.0. Package, fixture, landing, and experiment
  descriptions now identify that pin and the current experimental state, but
  there is no paired browser specification holding the
  behavior or computed visual contract. Existing unit tests cover basic
  DOM/class/event cases, not form submission/reset, focus-visible behavior,
  SSR/hydration, event ordering, or React-vs-Solid parity.
- Consequence: a later agent could read the plan rather than the tree, or infer
  maturity from the fixture that its current evidence does not support.
- Remediation: version/status prose is synchronized and Kumo is explicitly
  blocked from its first release until external npm prerequisites are recorded
  (A-012).
- Remaining action: add paired behavioral and computed-style evidence against
  the pinned upstream, then keep the package classified as an experiment rather
  than a port until the full gate is met.

### A-008 — The owner-ratified Viviana source fork has a frozen convergence baseline, not a resolved ownership structure

- Severity: **P1** for architecture, organization, maintainability, and
  styling ownership.
- Evidence state: **verified**.
- Evidence: `glasselated-port.md` and `visual-system-lane.md` establish that the
  owner deliberately authorized Viviana to become its own design system while
  retaining Spectrum's shape. The code implements that as an explicit
  reskinned source fork: the current guard expects 609 shared paths (533
  byte-identical and 76 intentionally divergent), plus 41 Viviana-only paths. The
  layer-boundary guard freezes this baseline and rejects new unbaselined forks,
  but it does not establish a single implementation source or prevent semantic
  drift inside the 76 existing divergent files. The current architectural
  direction is therefore ratified; the long-term code-ownership mechanism is
  still transitional.
- Important positive evidence: the exact pinned S2 token check passes, the
  20-case style-macro parity corpus produces byte-identical output to upstream,
  and the current invented-utility guard passes. The failure is ownership and
  convergence, not a blanket failure of the generation machinery.
- Required action: document whether the complete fork is the permanent
  ownership model or a convergence backlog. If convergence remains the goal,
  create structure that generates or composes shared implementation rather
  than treating the frozen duplicate tree as the destination. Strengthen the
  guard so edits within already-divergent files cannot silently broaden the
  divergence.

### A-010 — Live and public documentation describes incompatible Viviana styling architectures

- Severity: **P1** for outsider understanding and future-agent decisions.
- Evidence state: **verified; immediate contradictions remediated**.
- Discovery evidence: `ui-client-contract.md` said the Viviana-owned macro token map
  is deferred pending an owner product decision and describes `./style` as a
  Spectrum re-export. The committed code now contains a large package-local
  Glasselated macro theme, color ramps, additional semantic properties, and a
  package-local macro build. The later `glasselated-port.md` and
  `visual-system-lane.md` prove that this was owner-authorized, but the older
  contract remains marked current and its dependency/wave table still calls
  UC-02 Part B deferred. Separately, the published-package README says Viviana
  “builds on `@proyecto-viviana/solid-spectrum`,” while the current dependency
  graph and architecture make the styled packages siblings over
  `solidaria-components`. Those reader-facing contradictions are corrected in
  the current worktree as described below.
- Consequence: an outsider cannot form one correct model of whether Viviana is a
  skin layered over Spectrum, a macro-token override, or an independently
  built fork. An agent following the current-doc index can also reopen a
  decision already made by the owner.
- Remediation: `ui-client-contract.md` is now completed/historical; the package
  README states the sibling/fork relationship and no longer claims a Spectrum
  runtime dependency; its Vite example and source comment match the actual
  package; the root install example no longer double-imports `theme.css` even
  though `components.css` already includes it. Current architecture and release
  policy describe which headless implementation is shared and which styled
  source is intentionally forked.
- Remaining action: remove or rewrite superseded architecture statements inside
  other live debt/plan prose as they are found; public consumer smoke must still
  qualify the final package graph.

### A-009 — The live technical-debt surface contradicts current code and current guard results

- Severity: **P1** for clarity, organization, resumability, and agent safety.
- Evidence state: **verified** for the invented-utility contradiction; other
  stale sections remain under review.
- Evidence: `.claude/current/README.md` directs agents to treat
  `tech-debt.md` as live operating context. That file simultaneously marks the
  invented-utility launch guard complete and later claims 14 public components
  still use the removed utility families. The current source scan and
  `guard:invented-utilities` both show those named families are absent. Other
  later prose appears to describe an older visual-only certification
  generation.
- Consequence: because this is in the designated current surface rather than an
  archive, a new agent can make decisions from mutually incompatible project
  states.
- Required action: mechanically separate active debt from dated observation,
  delete superseded live prose as the repository policy requires, and generate
  factual counts from current source where possible.

### A-011 — A critical vulnerable serialization runtime reaches the deployed web application

- Severity: **P0 at discovery; remediated dependency path, P1 residual app-hardening review**.
- Evidence state: **verified and dependency remediation reproduced**.
- Discovery evidence: the pre-migration full audit reported 27 vulnerable package instances
  (1 critical, 17 high, 8 moderate, 1 low), and the production-only audit still
  reports 16 (1 critical, 10 high, 4 moderate, 1 low). The critical advisory is
  `seroval@1.5.1`, patched in `>=1.5.3`. Recursive dependency tracing shows that
  `solid-js@1.9.12` brings that exact vulnerable copy into every public package,
  `apps/comparison`, and the deployed TanStack Solid Start `apps/web`. A second
  patched `seroval@1.5.4` under the TanStack packages does not remove the Solid
  runtime's vulnerable copy. At discovery, no audit or vulnerability threshold
  was wired into the workflows or root CI scripts.
- Consequence: green type, behavior, accessibility, and release gates do not
  establish a safe dependency graph. The package-manager audit's displayed
  importer path is also insufficient for impact classification because
  deduplication can print one workspace path while the same vulnerable node is
  reachable from others; `why -r` is required.
- Remediation: the owner approved the full dependency migration on 2026-08-19.
  Solid is now 1.9.15, the vulnerable Seroval node is gone, and both full and
  production audits report zero known vulnerabilities. `guard:dependency-security`
  checks peers, rejects high-or-worse anywhere, and rejects low-or-worse in the
  production graph; release readiness runs it.
- Remaining action: complete aggregate/app behavior qualification and the
  response-header/CSP review in A-020. Registry audits are a current-database
  signal, not a proof that application trust boundaries are safe.

### A-012 — The release workflow can attempt Kumo's first publish before its documented prerequisite exists

- Severity: **P0 at discovery; remediated by fail-closed automation**.
- Evidence state: **verified and negative-tested**.
- Discovery evidence: `packages/kumo/package.json` declares a non-private public package
  at `0.0.0`; `.changeset/experimental-kumo-button.md` requests a minor release;
  `.changeset/config.json` does not ignore it; and `changeset:publish` publishes
  the complete pending public set. The release policy explicitly says Kumo's
  npm package/trusted publisher is not registered and says not to publish it,
  but neither `check-publish-drift.mjs`, `check-changeset-required.mjs`, the
  same-SHA evidence barrier, nor `release.yml` encoded that prerequisite before
  the remediation below.
- Positive evidence: workflow actions are pinned by SHA, publishing uses OIDC
  on a GitHub-hosted runner, the release job checks three same-SHA workflows,
  and publish-drift is checked before Changesets runs.
- Discovery consequence: once the changeset reached `main` and its version PR was
  merged, automation could attempt Kumo's publish. Missing trusted-publisher
  registration can fail the release, and multi-package publication is not a
  transaction: failure can leave an externally visible partial release.
- Remediation: `scripts/release-prerequisites.json` records the npm-package and
  trusted-publisher prerequisites as unsatisfied. The guard skips the deliberate
  `0.0.0` non-candidate, but fails any nonzero Kumo version until both booleans
  and independently verifiable evidence are present. Changesets checks,
  `changeset:publish`, and negative contract fixtures enforce the barrier.
- Remaining action: independently register and verify both external
  prerequisites before changing the ledger to satisfied. The ledger is a
  fail-closed control; it cannot verify an external claim by itself.

### A-013 — Current parity targets are pinned one release behind their upstreams

- Severity: **P1** for incomplete behavioral absorption.
- Evidence state: **pin remediation verified; behavior absorption partial**.
- Discovery evidence: the comparison oracle used `@react-spectrum/s2@1.5.1`,
  `react-aria-components@1.19.0`, `react-aria@3.50.0`, and
  `react-stately@3.48.0`; the Kumo fixture used 2.10.0. The migrated pins are
  described below.
- Consequence: evidence created against the old oracle established parity to
  that dated train, not today's upstream behavior. A
  dependency-only bump is insufficient because source/oracle pins, generated
  evidence, behavior ledgers, and regression obligations move together.
- Remediation: Adobe dependencies, oracle, comparison dependencies, and
  `scripts/upstream-pin.json` now align exactly to commit
  `5ecb3333001313e83898cd07644227897e3bae1f` (S2 1.6.0, RAC 1.20.0,
  react-aria 3.51.0, react-stately 3.49.0); Kumo is 2.11.0. Train-8 tickets
  T-61…T-99 were filed, and T-65, T-75, T-81, and the T-99 foundation have
  source-matched implementations/regressions in this worktree.
- Remaining action: resolve every `?` and ⛔ ticket and recertify affected
  observable branches. Pin alignment is not behavior absorption; missing RAC
  exports now total five and missing S2 support values total thirteen.

### A-014 — The live release policy gives the wrong dependency closure for Viviana UI

- Severity: **P1** for release planning and outsider/agent understanding.
- Evidence state: **verified and remediated in current policy**.
- Evidence: `release-policy.md` says `@proyecto-viviana/ui` depends on
  `solid-spectrum` plus `solidaria-components` and describes `solid-spectrum`
  as part of its coherent publish closure. The actual manifest has no
  `solid-spectrum` dependency: both styled packages are siblings over the same
  headless foundation, and Viviana directly depends on tokens, macro tooling,
  `solid-stately`, `solidaria`, and `solidaria-components`.
- Consequence: a release operator can add unnecessary package bumps while
  missing the actual direct closure, and an outsider receives the same false
  styling-layer model identified in A-010.
- Remediation: the policy now derives Viviana's direct closure from its manifest
  and states that `solid-spectrum` and Viviana are styled siblings. The package
  README and Vite integration comment use the same model.

### A-015 — Vite Plus reported successful package builds while ignoring six package configurations

- Severity: **P0 at discovery for publish integrity; remediated locally**.
- Evidence state: **verified by artifact inspection and a negative contract fixture**.
- Evidence: after the official Vite Plus migration, six packages still named
  `tsdown.config.ts`. Vite Plus 0.2.9 does not load those files, so `vp pack`
  exited successfully with its default entry while omitting intended entry
  points and declaration/export targets. The previous build lane checked only
  process exit status, not the package manifest contract.
- Consequence: a green release build could produce a tarball whose declared
  imports and types did not exist. Unit tests resolving workspace source would
  not detect the installed-consumer failure.
- Remediation: all six pack configurations are now `vite.config.ts` files using
  `defineConfig({pack: ...})`; legacy configs are removed. The root build ends
  with `guard:package-artifacts`, which recursively resolves every `main`,
  `module`, `types`, and non-pattern export target and rejects legacy config
  names. It currently validates 802 manifest targets across all six public
  packages, and its missing-artifact path is negative-tested.
- Remaining action: rerun the external tarball consumer after final migration
  stabilization and keep the artifact guard in every publish path.

### A-016 — Generated declarations were committed beside Stately source and shadowed the source graph

- Severity: **P1** for build/type determinism.
- Evidence state: **verified and remediated**.
- Evidence: 142 tracked `.d.ts` and `.d.ts.map` outputs existed under
  `packages/solid-stately/src`. The current toolchain resolved these stale twins
  during the full build and failed before it reached the real TypeScript
  sources. Generated output in `src` also lets declarations drift independently
  from implementation.
- Remediation: all 142 generated twins are removed. `guard:source-artifacts`
  scans every public-package source tree and allows only the two intentional
  JSON-module ambient declarations; a negative fixture proves an added source
  artifact fails the guard. Release readiness runs it.

### A-017 — Styled package builds emit broken-source-map warnings

- Severity: **P2**, escalating to P1 if published maps cannot debug their
  corresponding output.
- Evidence state: **verified warning; mapping fidelity unknown**.
- Evidence: the true Vite Plus build completes but emits repeated
  `SOURCEMAP_BROKEN` warnings from the macro-transformed Spectrum and Viviana
  sources, plus an unused `deps.onlyBundle` warning for
  `@adobe/spectrum-tokens`. A structural scan established that emitted map JSON
  parses, source paths stay package-relative, and referenced files exist. That
  does not prove generated positions map to the correct source locations.
- Consequence: published code can be functionally correct while stack traces,
  browser debugging, and downstream coverage point to the wrong source.
- Required action: create a small transformed fixture with a known generated
  location and assert reverse mapping to its authored line, then fix the macro
  transform or disable misleading maps deliberately. Remove the stale bundle
  directive if it has no current effect.

### A-018 — The layer-boundary guard does not enforce lowest-layer behavior ownership

- Severity: **P1** for Rule #4 architecture and future parity drift.
- Evidence state: **verified inventory; semantic classification incomplete**.
- Evidence: `guard:layer-boundary` compares only the Spectrum and Viviana source
  trees. It freezes new forks between those siblings but cannot detect behavior
  implemented in both upper packages instead of `solid-stately`, `solidaria`,
  or `solidaria-components`. The new `report:layer-imports` inventory finds 360
  runtime lower-layer bindings in 84 Spectrum files and 362 in 85 Viviana files;
  most are expected headless-component composition, but direct ARIA/runtime
  symbols include `FocusScope`, `createFocusRing`, `createHover`, `createLabel`,
  `createMeter`, `createPreventScroll`, `createProgressBar`, and
  `createTabPanel`. Kumo has one runtime binding, the headless Button.
- Consequence: a green sibling-diff guard can coexist with duplicated or forked
  ARIA/state behavior in both siblings. Counts alone cannot distinguish
  legitimate primitive composition from misplaced ownership.
- Required action: review the inventory family by family against upstream
  source. Encode forbidden ownership patterns only after classification; do not
  ban legitimate composition to improve a metric. First priority is duplicated
  state machines, keyboard/focus logic, and ARIA generation, not types, locale
  helpers, or component wrapping.

### A-019 — Public-package type safety has a frozen 59-file blind spot

- Severity: **P1** where a suppressed file implements public behavior; P2 for
  the aggregate maintenance risk.
- Evidence state: **verified**.
- Evidence: `guard:ts-nocheck-budget` passes because exactly 59 public-package
  files match the 59-file baseline. The guard correctly prevents growth and
  relocation, but the compiler still cannot validate those implementations.
  Many suppressions are in the styled component surfaces where upstream API
  and render-prop typing are part of parity.
- Consequence: `vp run check` can be green while public generic inference,
  forwarded props, context types, or ref contracts drift inside suppressed
  files.
- Required action: burn down by behavior family with consumer/type tests that
  fail before each suppression is removed. Publish both `current` and `ceiling`
  counts; never describe the passing budget as type completeness.

### A-020 — The deployed applications have no explicit response-security policy

- Severity: **P1** for public application hardening.
- Evidence state: **verified from current route/Worker code; hosted headers not yet probed**.
- Evidence: neither the TanStack Solid Start app nor the comparison asset Worker
  sets CSP, `X-Content-Type-Options`, `Referrer-Policy`, or
  `Permissions-Policy`. The web root contains an inline pre-paint theme script
  and external Google Fonts; the comparison app uses same-origin fixture iframes
  and inline scripts. A blanket strict CSP or `X-Frame-Options: DENY` would
  therefore break current behavior, and `apps/web/src/server.ts` is not the
  configured Wrangler entry.
- Consequence: browser defaults, CDN behavior, and framework defaults silently
  define the security boundary. A future content injection has fewer containment
  layers, while an agent adding generic headers in the wrong entry can create a
  false assurance or break the oracle harness.
- Required action: design and test separate header contracts for the docs app
  and comparison harness at their actual response boundaries. Move/hash/nonce
  the theme bootstrap as needed, decide font hosting, preserve only the frame
  relationships the comparison harness needs, and verify deployed responses.

### A-021 — Vendored prop descriptions could inject markup into generated comparison docs

- Severity: **P2 at discovery because input is trusted build-time upstream;
  remediated defense in depth**.
- Evidence state: **verified with adversarial regression cases**.
- Evidence: `renderPropDescription` escaped text content but interpolated a
  Markdown link target into an HTML `href` without attribute escaping or scheme
  validation. A malicious or compromised upstream description could break the
  attribute and introduce active markup in the generated site.
- Remediation: text and attribute escaping are separate, URL tokens accept only
  `http`, `https`, root-relative, and fragment targets without controls/spaces,
  and rejected targets render inert text. Four regressions cover normal source
  markup, quote injection, unsafe schemes, and local/fragment links;
  `test:comparison-data` runs in release readiness.

### A-022 — Several skipped tests described stale limitations instead of proving behavior

- Severity: **P1** for evidence honesty.
- Evidence state: **partially remediated; six package skips remain classified**.
- Evidence: four DateField tests for increment, decrement, previous-segment
  focus, and numeric input were skipped despite the equivalent TimeField paths
  working. They are now executable and pass with concrete value/focus assertions.
  Remaining package skips are one Table `scrollRef` upstream-title placeholder,
  three React Suspense-only cases, one jsdom-geometry RTL TimeField case with a
  paired browser path, and one full-width-digit TimeField case whose old comment
  overstated browser evidence.
- Remediation: DateField now proves the four behaviors, and the TimeField comment
  states the exact lower parser and ASCII browser evidence instead of claiming a
  browser-level full-width regression.
- Remaining action: replace the full-width skip with a browser case or a
  component-level environment that exercises the real input path; convert the
  Table placeholder to explicit inventory rather than a skipped test. Continue
  to report certified `fixme` and deferred dimensions separately from passes.

### A-023 — “Update all dependencies” has three deliberate compatibility ceilings

- Severity: **P2** for dependency-policy clarity, not a security finding.
- Evidence state: **verified against the installed peer graph and registry on 2026-08-19**.
- Evidence: all compatible workspace dependencies were upgraded. Three latest
  versions remain intentionally unselected: `@testing-library/jest-dom` 7 is
  outside `unplugin-solid` 2's declared `^5.16 || ^6` peer range; jsdom 30.0.1
  crashes on disconnected-node `getComputedStyle`; and TypeScript 7 is outside
  `@astrojs/check` 0.9.10's declared `^5 || ^6` range. The graph therefore pins
  jest-dom 6.9.1, jsdom 29.1.1, and TypeScript 6.0.3; peer check, the full unit
  suite, and frozen install pass.
- Required action: revisit when those dependents publish compatible peer ranges.
  Do not force-install a nominal latest version and then treat warnings as
  harmless; keep all three ceilings visible in current status.

### A-024 — Vite Plus's cold dependency scan is noisy and non-hermetic

- Severity: **P2** for tooling determinism.
- Evidence state: **open**.
- Evidence: despite `noDiscovery`, a cold `vp test` dependency scan traverses
  ignored/vendored HTML outside the intended package-test surface. It did not
  block the 269-file suite, but its inputs and diagnostics are broader than the
  command's apparent contract.
- Required action: reduce or explicitly bound discovery, then add a regression
  that proves ignored/vendor trees cannot affect test collection.

### A-025 — Migration failures exposed tests coupled to generated details

- Severity: **P1** for evidence relevance.
- Evidence state: **partially remediated**.
- Evidence: generated S2 class names and empty serialized `style` attributes
  changed during the toolchain upgrade, breaking snapshots without a user
  behavior change. Structural snapshots now normalize generated classes and
  retain semantic/state assertions; IllustratedMessage tests now assert the
  meaningful branch rather than generated output trivia.
- Required action: apply the same standard when future snapshots fail: prove
  observable structure/state and move exact styling evidence to computed or
  React-vs-Solid browser contracts.

### A-026 — Select's multiple-selection integration had real drift

- Severity: **P1** for behavior parity.
- Evidence state: **remediated at the package-test floor**.
- Evidence: migration triage exposed incorrect multiple/toggle behavior and
  listbox focus integration. The implementation and regressions were repaired.
- Required action: retain the browser pair evidence in the certified lane; unit
  coverage alone does not close keyboard/focus parity.

### A-027 — Press cleanup evidence did not cover transient browser state

- Severity: **P1** for interaction evidence.
- Evidence state: **strengthened, not fully certified**.
- Evidence: Checkbox and Switch regressions now observe transient native-click
  press state and cleanup instead of asserting only the final state.
- Required action: preserve these failure-mode assertions and complete their
  paired browser coverage where React timing is user-observable.

### A-028 — One ColorSwatchPicker failure was stale test logic

- Severity: **P2** for test trustworthiness.
- Evidence state: **remediated**.
- Evidence: the test encoded an obsolete expectation rather than current
  upstream behavior; it was corrected only after comparison with source and the
  real component contract.
- Required action: continue classifying failures as product, integration,
  environment, or stale evidence before changing implementation.

### A-029 — Astro 7 exposed a real SSR/DOM integration boundary

- Severity: **P1** for application integration.
- Evidence state: **build path remediated**.
- Evidence: the comparison app initially selected the wrong Solid distribution
  across SSR and browser paths. Aliases now preserve JSX-aware package entry
  selection, Kumo's browser-only fixture is explicit, and all 98 comparison
  pages build.
- Required action: keep both build and hydration behavior in the release lane;
  an Astro typecheck alone cannot prove this boundary.

### A-030 — Astro's preview process contract changed under agent execution

- Severity: **P2** for harness reliability.
- Evidence state: **remediated**.
- Evidence: Astro 7's preview command auto-backgrounded in this environment,
  so Playwright could lose ownership of the server. The harness now starts a
  foreground `vp preview` process.
- Required action: keep server ownership and teardown explicit; do not leave
  dev or preview processes after validation.

### A-031 — The contract suite is green but covers only a floor

- Severity: **P1** for status honesty.
- Evidence state: **verified**.
- Evidence: `comparison:test:contract` passes 93/93 after the migration. It
  proves rendered catalogue and Button-family contracts, not the full parity
  dimensions required by certification.
- Required action: always report this separately from the certified browser
  result and never use it to label all components accepted.

### A-032 — The current certified browser lane is red on relevant behavior

- Severity: **P0** for release/certification claims.
- Evidence state: **full 2176 completed once; four product families still red**.
- Evidence: first complete run 2026-08-19 after overlay/focus (`67a66591`):
  **2164 passed / 6 failed / 6 skipped** (15.5m, 8 workers). D12, AlertDialog
  AX, ActionMenu list D1/D5, and Dialog close-button D1/D3/D5 stayed green.
  The six failures are four families: TableView D6 `default` and `disabled`
  (Select All missing `[checked=mixed]`), Tabs D4 `arrow-next-from-selected`
  and D5 `arrow-roving` (ArrowRight does not move from Overview), Toast D6
  `neutral` (inner `alert` vs `text`), TreeView D5 `tab-forward` (extra
  checkbox/collapse tab stops). The six skips are the registered
  knownDivergences listed under A-005.
- Required action: diagnose each red family at the owning layer, re-run those
  families, keep overlay/ActionMenu/Dialog green, and keep reporting pass /
  skip-fixme / deferred separately. Do not claim certification.

### A-033 — Slashless D12 routes SPA-fell back to the marketing homepage

- Severity: **P1** for evidence honesty; **remediated**.
- Evidence state: **verified and fixed**.
- Evidence: `dist/d12/button/index.html` already contained
  `<button>Save</button>`. `curl` of Vite preview `/d12/button` returned the
  comparison homepage (`<title>Solid Spectrum</title>`, HTTP 200);
  `/d12/button/` served the island. D12's JS-disabled capture used the
  slashless URL, so the driver reported a missing server-rendered button.
- Remediation: `ssrPageRoute` in `e2e/drivers/ssr-hydration.ts` canonicalizes
  directory routes to a trailing slash; both D12 specs name the directory URL.
  All five D12 cases pass (`Button` baseline and four text-entry-callback
  cases).
- Remaining action: none for D12. Do not treat this as Button SSR parity.

## Confirmed controls (not acceptance by themselves)

- The S2 token package is exactly pinned to the installed upstream version.
- The style macro matches the pinned upstream macro on the repository's 20-case
  capability corpus.
- The named legacy invented utility-token families are absent from the scanned
  library source trees.
- Package manifest targets and source-artifact cleanliness now have executable
  guards with negative fixtures; these establish artifact presence/placement,
  not runtime correctness.
- Full and production dependency audits currently report zero known
  vulnerabilities, peer ranges resolve, and the frozen lockfile installs.
- Kumo's first-publish prerequisites fail closed once its version is nonzero.
- The upper-layer boundary guard is active with a 533-identical/76-divergent
  baseline. The import inventory deliberately remains a report, not a verdict.

## Resumption checkpoint

`status.md` is the canonical short handoff. The remaining-work census in
`work-queue.md` is the program through every leftover finding. D12, AlertDialog
description mapping, ActionMenu list D1/D5, and Dialog close-button D1/D3/D5
are closed. The 2176 run is complete once (2164/6/6). Next: the four red
families (TableView mixed Select All, Tabs arrow, Toast alert role, TreeView
tab-forward).

After targeted red/green work, run the validation ladder in `status.md`
sequentially because build lanes share `dist` trees. The packed-consumer smoke
and site lane remain unrun after the final migration. Preserve the owner's
pre-existing changes, keep task/frontmatter state synchronized with any fixes,
and update both this finding register and `status.md` before stopping again.
