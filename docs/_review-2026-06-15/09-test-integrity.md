---
reviewer: lane-09-test-integrity
date: 2026-06-15
scope: TEST INTEGRITY — does the suite actually enforce the certification bar?
---

# Test Integrity Review — 2026-06-15

Lane: TEST INTEGRITY. Standard: AGENTS.md Rule #1 (8-dimension certification) and Rule #7
(tests must be able to fail for the reason they exist).

---

## Executive Summary

The suite is structurally sound at the unit-test layer and has real behavioral depth in the
comparison harness for the ~10 components that have contract specs. The critical gap is **systematic
dimension coverage**: of 69 tracked S2 components, 59 have visual-only e2e coverage (no keyboard,
form, focus-return, or announcement tests at the harness layer), and the 8-dimension certification
bar is not enforced by any gate or report. The RUN_AXE env-gate silently skips the five
strongest axe scans in CI unless the flag is set, and the 39-entry regression snapshot file
has no behavioral assertions — it can catch regressions but not port correctness.

---

## Findings (Worst First)

### [Critical] 59 of 69 components have visual-only e2e coverage — keyboard/focus/forms/announcements untested at the harness layer

- Evidence:
  - `apps/comparison/e2e/` contains 60 `*-visual.spec.ts` files and 11 `*-contract.spec.ts` files.
  - The contract specs cover only: accordion, actionbar, actionmenu, breadcrumbs, button-family,
    calendar, card-cardview, menu, styled-contract, modeled-controls, component-theme.
  - Approximately 59 of 69 catalogue components have no contract spec that asserts keyboard
    navigation, focus management, form submission, or live-region announcements.
  - `page.keyboard.press()` appears 94 times across all e2e files, but only 12 files contain it —
    and several calls are Escape key to close an overlay being screenshotted, not navigation tests.
  - The `a11y:check` gate (`vp run a11y:check`) does NOT include any keyboard/focus e2e tests.
    The `comparison:test:contract` target runs only the 11 contract specs.
- Why: Rule #1 names keyboard/focus, forms/validation, and behavior/timing as required evidence
  dimensions. Rule #7 says a test must be able to fail for the reason it exists. Visual screenshots
  cannot catch a broken Tab order, a missing focus-return, or a failed form submit. For the 59
  components that have no contract spec, the keyboard/focus/forms/announcements dimensions of
  certification are simply unproven at the harness level. The status report (`status.md`) shows
  `69/69 validation notes` and `comparison:report:parity:strict` green, but neither of those
  guards whether those dimensions exist.
- Fix: For each component with only a visual spec, add a contract spec that covers at minimum:
  (a) keyboard navigation to/through the component, (b) focus return after overlay dismissal
  where applicable, (c) ARIA attribute contract (role, aria-label/labelledby, aria-expanded/
  selected/checked as relevant), (d) form behavior where applicable. Prioritize interactive
  components (Combobox, Select/Picker, DatePicker, Tabs, Toast, TagGroup, Tree, Table, Dialog)
  because they have the highest keyboard surface area and the most user-observable failures.

---

### [Critical] RUN_AXE env-gate silently skips the five strongest axe scans in CI unless manually set

- Evidence:
  - `apps/web/e2e/playground-axe.spec.ts:85,98,113,125,137`: all five substantive axe tests
    include `test.skip(!runAxe, "Queued until RUN_AXE=1")`.
  - `package.json:58,60`: `a11y:axe:aa` and `a11y:axe:playground` prefix their command with
    `RUN_AXE=1`. The `a11y:check` gate calls `a11y:axe:aa` which does set the flag.
  - However, the test runner scripts that invoke `playwright test` directly (e.g., `test:e2e`)
    do not set `RUN_AXE=1`, so if anyone runs the web e2e suite outside the `a11y:*` scripts,
    all five scans are silently skipped — the test file passes with 0 failures.
  - The comparison app axe scan (`comparison-axe.spec.ts`) has no env-gate: it runs as part of
    `comparison:test:a11y` unconditionally. This is the right pattern.
- Why: Rule #7: "no silent environment skips." A test that passes without executing its logic
  is a false green. The playground axe scan is the only WCAG 2.2 AA gate across the full
  rendered component surface; silently skipping it on every non-`a11y:*` test run means the
  nominal CI run can be green while AA regressions exist.
- Fix: Either (a) remove the `test.skip(!runAxe, …)` guards and always run the scans, or
  (b) require `RUN_AXE=1` to be set in all CI jobs that include the web e2e suite, not just
  `ci:a11y`. Document clearly which gates do and do not enforce axe.

---

### [High] regression.test.tsx: 39 innerHTML snapshots with no behavioral assertions — pure snapshot coverage for the entire solid-spectrum layer

- Evidence:
  - `packages/solid-spectrum/test/regression.test.tsx` (1,157 lines): 39 calls to
    `toMatchSnapshot()` across all major components, all asserting `normalizeIds(container.innerHTML)`.
  - The snapshots contain heavily munged S2 macro class names (e.g., `_Le13 Oh13 Olc13`) that
    are implementation tokens, not semantic claims.
  - The file does render and click some components (e.g., menu click to open), but the only
    final assertion is the snapshot, not a behavioral assertion about state changes, ARIA
    attributes, or callback payloads.
  - `packages/solid-spectrum/test/__snapshots__/regression.test.tsx.snap` (91 lines): snapshot
    content is obfuscated macro class names and HTML structure, not human-readable contract.
- Why: Rule #7: "no tests whose named logic lives only in the test body." These snapshots can
  detect inadvertent DOM structure changes but cannot fail on behavioral regressions: a broken
  Tab order, a missing `aria-expanded`, or a callback that fires the wrong payload will all
  produce a passing snapshot. The snapshot for AlertDialog is literally `""` (line 9 of the snap
  file), meaning that component's regression test asserts only that it renders something or nothing.
- Fix: For every snapshot test, add at minimum one behavioral assertion alongside the snapshot:
  the ARIA role/label/state of the rendered element, or the callback payload, or the keyboard
  response. Convert the snapshot to a computed-contract check (aria attributes + computed style
  keys) rather than a raw innerHTML string.

---

### [High] Live-region/announcement dimension broadly absent — infrastructure built but not used

- Evidence:
  - `packages/solidaria/test-utils/live-region-monitor.ts`: full `createLiveRegionMonitor`
    implementation with `waitForAnnouncement`, `Announcement` type, and `MutationObserver`
    watcher. Exported from the test-utils package.
  - `rg createLiveRegionMonitor`: found in only ONE test file:
    `packages/solidaria-components/test/Toast.test.tsx:396`.
  - That single usage (`Toast.test.tsx:407–411`) is tautological: it checks
    `expect(monitor.announcements).toBeDefined()` and `expect(Array.isArray(monitor.announcements)).toBe(true)`.
    The comment explicitly says "Even if no announcements are captured…" — meaning the test passes
    whether or not any announcement fires.
  - No other component uses the live-region monitor, and no comparison e2e test asserts
    announcement content for any component (drag-drop, selection, loading text, etc.).
- Why: Rule #1 lists "live regions, loading text, selection announcements" as part of the ARIA
  & accessibility dimension. Rule #7: the Toast live-region test is a tautology — it can never
  fail on a live-region regression because it does not assert any announcement was made.
- Fix: Replace the tautological Toast test with `monitor.waitForAnnouncement(/…/)` asserting
  the actual notification text. Add live-region assertions to components whose upstream uses
  `announce()`: ActionBar ("Actions available."), DragAndDrop, selection collections, and
  loading/empty states in collection components.

---

### [High] I18n/RTL dimension untested in unit tests; only 8 of 69 components have any RTL e2e coverage

- Evidence:
  - `rg -rn "RTL|locale|direction.*rtl|useLocale" packages/ --include="*.test.tsx"` → 0 results.
    No unit test in solidaria, solidaria-components, or solid-spectrum sets a non-English locale
    or asserts RTL rendering behavior.
  - At the e2e layer, only 8 component specs have any RTL or non-Latin-script locale test:
    accordion, button, calendar, colorarea, colorslider, datefield, disclosure, rangecalendar.
    The remaining ~61 of 69 components have no RTL e2e coverage.
  - Most RTL tests assert geometry (chevron rotation, thumb position) rather than keyboard
    direction reversal (ArrowLeft moves focus right in RTL, ArrowRight moves left).
  - Only `calendar-contract.spec.ts:219` and `rangecalendar-visual.spec.ts:481` test RTL
    keyboard behavior; all other RTL tests are computed-style geometry checks.
  - The ProviderParity test at `packages/solid-spectrum/test/ProviderParity.test.tsx` asserts
    `dir="rtl"` is set on the provider DOM element for `locale="ar-SA"`, but does not verify
    any child component behavior under RTL.
- Why: Rule #1 explicitly names "direction (RTL), number/date/calendar formatting, hour cycle,
  message catalogs" as the i18n dimension. No gate in `a11y:check` or `comparison:test:*` enforces
  RTL coverage across the component catalogue.
- Fix: For interactive components that have directional keyboard behavior (all collection
  components, date/time fields, sliders, tabs), add a contract test that verifies ArrowLeft/Right
  reversal in RTL. For text-formatting components (DateField, TimeField, Calendar), extend
  locale coverage to cover at minimum Arabic and Hebrew (bidirectional scripts).

---

### [High] 4 keyboard/segment-navigation tests silently skipped in DateField due to jsdom limitation — no Playwright replacement exists

- Evidence:
  - `packages/solidaria-components/test/DateField.test.tsx:239,249,271,280`: four `it.skip()`
    for "should increment segment on Arrow Up", "should decrement on Arrow Down", "should navigate
    to previous segment with Arrow Left", and "should accept numeric input."
  - Comments cite "contenteditable keyboard events don't fire handlers in jsdom" — a legitimate
    limitation.
  - No `datefield-contract.spec.ts` or comparable Playwright test covers these behaviors at
    the harness level.
  - The acceptance gate for DateField (`apps/comparison/playbook/components/datefield-validation-notes.md`)
    notes these behaviors in the source branch ledger but there is no test-level proof.
- Why: Rule #7: "no silent environment skips." These are the PRIMARY user-observable behaviors
  of a date field — segment increment/decrement is its entire keyboard model. The skip comments
  correctly identify the limitation but the behavior remains unproven with no compensating test.
- Fix: Add a Playwright test in `apps/comparison/e2e/datefield-visual.spec.ts` (or a new
  `datefield-keyboard.spec.ts`) that presses `ArrowUp`/`ArrowDown` in the date field and asserts
  segment value changes on both the React and Solid sides, proving both produce identical
  increment behavior.

---

### [Medium] Default pair-diff thresholds tolerate up to 40% pixel mismatch — tests pass while React and Solid diverge significantly

- Evidence:
  - `apps/comparison/e2e/default-state-cases.ts`: the 6 default visual cases use
    `maxMismatchRatio` of 0.18 (Button), 0.22 (ActionButtonGroup), 0.34 (Provider), and 0.40
    (ButtonGroup, 40% of pixels may differ).
  - `apps/comparison/e2e/live-styled-visual.spec.ts:35,40,45`: SelectBoxGroup, Card, and
    CardView use `maxMismatchRatio: 0.42` with `maxDimensionDelta: 128`.
  - `apps/comparison/e2e/treeview-visual.spec.ts:175,236`: TreeView uses 0.42–0.48 with
    dimension delta of 48–56px.
  - Only 3 of 61 visual specs use `exactPairDiff` (zero pixel tolerance):
    `calendar-visual`, `actionmenu-visual`, `rangecalendar-visual`.
- Why: A test that passes with 40% pixel mismatch cannot detect a port that renders differently
  — a wrong color, wrong size, or wrong layout can be hidden within the tolerance. The status
  report (`status.md`) says "56 with strict pair-diff tests" but the default-state-pair-diff
  suite's own note says thresholds are "until component-specific strict parity is reached" —
  suggesting many of those 56 are not strict. This undercuts Rule #1's visual parity dimension.
- Fix: Audit the tolerance values component by component. Components whose styled layer is
  finalized (accepted per validation notes) should be ratcheted to `exactPairDiff` or at worst
  a very small threshold (≤0.01). Large tolerances should be treated as tech debt with a
  recorded date for tightening, not a permanent acceptance.

---

### [Medium] 3 React Suspense tests and 1 scrollRef test silently skipped in Table — no Solid-idiomatic replacement

- Evidence:
  - `packages/solidaria-components/test/Table.test.tsx:1561,2726,2730,2734`: four `it.skip()`.
  - The Suspense tests say "React-specific upstream coverage; Solid resources/transitions are
    covered outside this RAC-title parity slice" — but no test anywhere in the suite covers
    Solid's async loading/Suspense equivalent (createResource, Show, Suspense boundary).
  - The `scrollRef` skip says the upstream already skips it, but provides no Solid evidence.
- Why: Rule #7 and Rule #1 behavior dimension. Async/loading states and controlled scroll refs
  are user-observable behavior that upstream tests and the certification bar require.
- Fix: Replace the React Suspense skips with Solid-idiomatic async loading tests using
  `createResource`/`Suspense`. The `scrollRef` skip should either be un-skipped with a
  Solid-native implementation or documented as an explicit, named gap in the Table validation note.

---

### [Low] SSR/hydrate tests: only 3 SSR + 2 hydrate files exist, covering only Picker and TextField

- Evidence:
  - SSR: `Picker.ssr.test.tsx`, `TextField.ssr.test.tsx`, `createDisclosure.ssr.test.tsx`.
  - Hydrate: `Picker.hydrate.test.tsx`, `TextField.hydrate.test.tsx`.
  - The SSR tests assert `typeof html === "string"` and `html.length > 0` — minimum smoke.
  - The hydrate tests are real regression guards (asserting no `console.error` or thrown error
    during hydration). The design is correct but coverage is narrow.
- Why: Any component with dynamic IDs (`createUniqueId`), conditional portals, or overlay
  content gated on `useIsHydrated()` is an SSR regression risk. Only Picker and TextField
  are currently guarded.
- Fix: Add SSR + hydrate test pairs for Dialog, DateField, ComboBox, Select, and Tooltip — all
  use portals or conditional-render patterns that are likely to produce hydration drift.

---

### [Low] DnD/virtualizer keyboard guards are static source analysis, not behavioral assertions

- Evidence:
  - `scripts/check-dnd-keyboard-parity.ts` and `scripts/check-virtualizer-keyboard-parity.ts`:
    both scripts use regex pattern matching on source file text to verify that certain symbols
    (`keyboardDelegate`, `resolveFallbackKeyboardTarget`) appear in the source. They do not
    execute the code or simulate keyboard events.
  - `guard:dnd-keyboard-parity` passes if the strings exist in the source; it cannot fail on a
    runtime bug in the keyboard fallback.
- Why: Rule #7 requires tests that prove behavior. A regex guard on source text cannot catch
  a logical inversion, wrong key name, or incorrect callback argument.
- Fix: Add behavioral tests in `solidaria-components` that simulate keyboard DnD (press Enter
  on a draggable item, arrow to target, press Enter to drop) and assert the correct callbacks
  fire in the correct order.

---

## Suspected (Unconfirmed)

- **Suspected: `comparison:report:parity:strict` does not verify the 8-dimension evidence
  exists per component** — it appears to check route/catalogue metadata (modeled controls,
  validation note presence, evidence file existence) rather than whether keyboard/focus/forms/
  announcement tests actually exist. If true, a component can be "strict-green" with no
  keyboard or announcement tests. Unconfirmed: I did not read `scripts/report-component-parity.ts`
  in full.

- **Suspected: the `n` alias for `assertNoA11yViolations` visible in the rg output from
  Disclosure/Meter/Separator tests is a transient search artifact** — direct file inspection
  confirmed those files import `assertNoA11yViolations` by its full name. No aliased short
  identifier was found. No issue here.

- **Suspected: the `comparison-page.ts` helper's `waitForComparisonRouteReady` may not wait
  for Solid hydration to complete**, only for Astro islands to reach count 0 — meaning
  screenshots in visual specs may capture pre-hydration state in some cases. Unconfirmed:
  requires tracing `waitForComparisonRouteReady` implementation.

---

## Summary Table

| Severity | Finding                                                                     | Count |
| -------- | --------------------------------------------------------------------------- | ----- |
| Critical | 59/69 components: visual-only e2e, no keyboard/focus/forms                  | 1     |
| Critical | RUN_AXE gate silently skips 5 WCAG scans outside `a11y:*`                   | 1     |
| High     | 39 regression snapshots, no behavioral assertions                           | 1     |
| High     | Live-region monitor built, used once tautologically, 0 assertions elsewhere | 1     |
| High     | I18n/RTL absent in unit tests, only 8/69 components with any RTL e2e        | 1     |
| High     | 4 DateField keyboard behaviors silently skipped, no Playwright replacement  | 1     |
| Medium   | Pair-diff tolerances up to 40-48% pass for ~56 visual tests                 | 1     |
| Medium   | 3 Suspense + 1 scrollRef silently skipped in Table, no Solid replacement    | 1     |
| Low      | SSR/hydrate coverage: only 2 components (Picker, TextField)                 | 1     |
| Low      | DnD/virtualizer guards are regex source checks, not behavior                | 1     |
