---
kind: reference
status: current
tasks:
  - id: remaining-work-ladder
    title: Go through every leftover audit item, one slice at a time
    state: in-progress
    roadmap: component-certification
    planned: { start: 2026-08-19, target: null }
    note: >-
      Durable remaining-work goal: walk every leftover audit item to
      closed, owner-blocked, or dated evidence. First complete 2176
      certified run (2026-08-19): 2164 pass / 6 fail / 6 skip
      (knownDivergence fixme). TableView mixed, Tabs D4/D5, Toast D6
      alert, TreeView D5, comparison-axe 80/80, ui:smoke, and
      a11y:contrast 154/154 are closed. Next slice: a11y:smoke
      (ContextualHelp outside-click is the remaining failure), then
      routes / seo / api-reference. Then Kumo evidence, Train 8,
      evidence schema, owner decisions, hygiene. Overlay/focus is a
      separate commit from the pre-existing dirty audit/Kumo tree.
      Do not skip ahead.
  - id: toast-comparison-viewer
    title: Rebuild Toast comparison viewer around docs-style trigger buttons
    state: done
    finished: 2026-06-24
    roadmap: comparison-docs-overhaul
    planned: { start: 2026-06-24, target: 2026-06-25 }
  - id: cert-button
    title: Prove Button visual + a11y states
    state: done
    finished: 2026-07-03
    roadmap: component-certification
    planned: { start: 2026-06-10, target: 2026-06-18 }
    note: Superseded-and-completed by the recertification march — Button was the D1–D8 pilot.
  - id: cert-checkbox
    title: Prove Checkbox visual + a11y states
    state: done
    finished: 2026-07-04
    depends: [cert-button]
    roadmap: component-certification
    planned: { start: 2026-06-18, target: 2026-06-25 }
    note: Superseded-and-completed by the recertification march — Checkbox certified in Tier 2.
  - id: comparison-docs-collections
    title: Port collection component pages to the docs site
    state: in-progress
    roadmap: comparison-docs-overhaul
    planned: { start: 2026-06-05, target: 2026-06-16 }
    note: >-
      Re-scope through GitHub issue #27 and the catalogue-to-route map before
      continuing. The 2026-06 target is stale; code/report evidence chooses the
      remaining pages.
---

# Work Queue

Status: live task-picking order.
Update when: a wave changes, a P0 closes, or a dependency/owner decision moves
the pick order.

`steering.md` owns direction. `adversarial-audit.md` owns the current finding
register, remediation status, risk controls, and exact resumption point. This
page is the short selector.

## Remaining-work goal (2026-08-19)

This is the live goal until **every leftover audit item** is fixed,
owner-blocked, or documented with dated evidence. It is the program for this
worktree: walk the numbered census in order, one slice at a time — diagnose
against pinned upstream at the owning layer, fix, verify, document in
current-docs, `git commit --only` that slice. Do not skip ahead because a
later item looks easier. A-findings that this wave already closed stay closed;
the census is the remainder of `adversarial-audit.md` plus the Train-8 tickets
that A-013 still owes.

**Constraints (hold for the whole census):** do not reset or split the dirty
tree; do not expand Kumo; do not patch S2 styling in comparison; do not treat
pins or green floors as absorption; TableView native-table (A-006) and Viviana
fork/convergence (A-008) stay owner-steered — ask; do not silently ratify.
Overlay/focus source commits separately from the pre-existing dirty
audit/Kumo tree. Do not push.

**Done when:** each numbered item has a current-docs note plus the evidence
that closed it (green certified/smoke/site/classification, an owner decision,
or a dated block), and `status.md` is rebuilt from this census (A-001).

### Closed this wave

- D12 slashless-route SSR capture (`bdb90f60`, A-033).
- AlertDialog AX description slot (`a9bfb8db`).
- ActionMenu list D5 overlay arrow-roving and D1 `outline-width` (menu-root
  auto-focus after paint with `focusVisible: true`).
- Dialog close-button D5 trap-cycle (FocusScope re-collect + contain).
- Dialog close-button D1 hover / D3 pixel (RAC `focusSafely` virtual
  `runAfterTransition` so contain-restore lands after hover `pointermove`).
- First complete 2176 certified run (2026-08-19, after overlay/focus):
  **2164 passed / 6 failed / 6 skipped**. Contract 93/93 stays a floor
  (A-031). Do not claim certification while remaining reds stay open.
- TableView mixed Select All (`91c7991e`).
- Tabs D4 `arrow-next-from-selected` and D5 `arrow-roving` — keydown
  DOM focus plus batched `isFocused`/`focusedKey`; certified Tabs
  23/23. Do not set `isFocused` on native `focus` (steals D4
  touch-tap).
- Toast D6 `neutral` alert role — S2/Viviana render RAC
  `UNSTABLE_ToastContent` so the message is `role="alert"`;
  certified Toast 37/37.
- TreeView D5 tab-forward / End — keyboard landing already matched;
  End's extra `[tabindex]` nodes are S2 Virtualizer unmounting
  offscreen rows (`treeview-div-grid-paint`). Collection tab-stop
  census on the End walk. Do not excludeFromTabOrder row checkboxes.
- Dependency/security path (A-011 graph, A-012 Kumo fail-closed, A-013 pins,
  A-015 Vite Plus configs, A-016 stale declarations) — `ui:smoke`,
  comparison-axe 80/80, and `a11y:contrast` 154/154 are in; `ci:site`
  still needs a11y:smoke (ContextualHelp outside-click), routes, seo,
  and api-reference before A-001's measured `status.md` refresh.
- Web contrast 154/154 — Viviana chips/status/list selection use the
  register's AA fill/ink (`--interactive-fill`, `--text-link`,
  `--text-secondary`, `negative-1000`); type-page Provider islands
  sit on opaque `base`; RangeSlider stamps `data-disabled` so
  inactive label/output is WCAG 1.4.3 incidental (matching Slider).
  `apps/web` consumes `@proyecto-viviana/ui` from dist, so token
  edits need `vp run build:viviana-ui` before Playwright preview.

### Census — every leftover item, in order

#### 1. Certified reds (closed this wave, A-032 remainder)

Diagnose at the owning layer. Do not treat TableView mixed-checkbox as a
silent ratification of A-006 (native-table vs `div[role=grid]`): both stacks
already expose `role=grid` in D6, and the only AX diff is Select All mixed.

1. **TableView D6 `default` and `disabled` — closed.** Select All mixed
   now matches RAC (`!isEmpty && !isSelectAll`) and the native input
   re-applies `indeterminate` after Chromium clears it on `checked`
   writes. Certified TableView D6: 4 pass / 1 skip (`sorted`
   knownDivergence).
2. **Tabs D4 `horizontal-regular · arrow-next-from-selected` — closed.**
   Arrow/Home/End now move DOM focus in the tablist keydown handler
   (Solid `createEffect` is after paint, too late for D4 keyup).
   Collection `isFocused` is batched with `focusedKey` so the previous
   tab's focus-move effect cannot steal a touch tap. Headless `Tab`
   tracks its element with a signal ref. Certified Tabs: 23/23.
3. **Tabs D5 `horizontal-regular · arrow-roving` — closed.** Same
   keyboard-nav fix. Solid active tab moves Overview → Parity → Testing.
4. **Toast D6 `neutral` — closed.** Headless `ToastContent` is the RAC
   live region (`role="alert"`, `aria-atomic`, hidden until mounted).
   S2 and Viviana render that component instead of a raw div. Certified
   Toast: 37/37 including D6 `neutral`.
5. **TreeView D5 `default · tab-forward` — closed.** Active trail
   already matched on Tab / ArrowDown / ArrowUp / Home / End (Weekly
   Report → Budget → Client Notes → Budget → Documents → Archive). The
   only census miss was after End: S2 Virtualizer unmounts offscreen
   rows (`treeview-div-grid-paint`); the port keeps document flow. Do
   not `excludeFromTabOrder` row checkboxes — React Select is
   `tabindex=0` at rest (tab-backward already pair-diffs that). End
   now records the collection tab-stop (treegrid + focused row).
   Certified TreeView D5: tab-forward, end-jump, tab-backward.

Re-run remaining red families after each owning-layer fix. Keep
ActionMenu list, Dialog close-button, TableView mixed, Tabs, and Toast
green. Do not patch comparison CSS.

#### 1b. Certified skip / fixme / deferred split (A-005)

Playwright's **6 skipped** on the 2176 run are the six registered
`test.fixme` **knownDivergences**, not silent `test.skip`:

| Case | Kind | Tracked reason |
| --- | --- | --- |
| Slider D6 `default` | knownDivergence | `slider-thumb-native-input-semantics` |
| RangeSlider D6 `default` | knownDivergence | same thumb/native-input AX value |
| TableView D6 `sorted` | knownDivergence | sort-description `textValue` data-model vs S2 JSX Column |
| Breadcrumbs D6 `overflow` | knownDivergence | oracle measurement-timing (Solid collapse is correct) |
| DatePicker D4 `placeholder · open-escape-close` | knownDivergence | React batched vs Solid sync dismiss event-order |
| DateRangePicker D4 `placeholder · open-escape-close` | knownDivergence | same dismiss event-order |

Deferred dimensions (DnD pointer drag, some i18n/RTL/forced-color
branches, virtualizer horizontal, Tooltip motion, etc.) live in certified
spec comments and are **not** Playwright skips. Item 5 (evidence schema)
must inventory those as unregistered obligations; they block full
component acceptance under Rule #1.

#### 2. External qualification (current slice, A-001 remaining, A-015 remaining)

`vp run ui:smoke` **passed** (packed six tarballs; consumer DOM+SSR;
159/159 export files; 38/38 JS subpaths; 68/68 CSS classes; macro
SOURCEMAP_BROKEN warnings remain, A-017). `ci:site` package build
passed. comparison-axe **80/80**: WCAG 2.2 `target-size` is disabled on
the smoke scan (S2 compact ActionGroup is 21px; D8 pair-diff is the
authority; playground WCAG 2.2 AA already did this). Provider captions
use comparison docs ink keyed on the caption itself — `--cmp-pink` was
3.27:1 on S2 dark base, and React's nested Provider has no
`data-color-scheme` for a descendant override. `a11y:contrast`
**154/154**: landing `/` and `/admin` use `--text-primary`; showcase
chrome labels use `--text-secondary`; Viviana chips, selected list
options, status lights, field labels/values, and errors use the
register's AA pairings (`--interactive-fill` under `--text-on-accent`,
`--text-link` accent ink, `--text-secondary`, `negative-1000` /
`notice-1100` / `positive-1000`). Type-page Provider scheme-override
islands use opaque `background="base"` (`layer-1` is frosted glass).
Disabled RangeSlider stamps `data-disabled="true"` on the group so
axe's WCAG 1.4.3 incidental exemption matches Slider. S2 RangeSlider
still lacks that stamp — sibling gap, not this slice.

Remaining `ci:site`: `a11y:smoke` is **43/44** — ContextualHelp
"closes on outside interaction" (`playground-components.spec.ts`)
stays open after `body.click({x:1,y:1})`; Escape close and Popover
outside-click pass. Then routes, seo, api-reference. Rebuild
`status.md` measured rows after those finish. Keep reporting
contract 93/93 separately from certified (A-031).

#### 3. Kumo Button evidence (A-007)

Paired browser behavior and visual contracts only. Keep first-publish
fail-closed (A-012). Do not grow the experiment. External npm /
trusted-publisher registration stays owner/external.

#### 4. Train 8 classification (A-013 remaining)

Port only source-confirmed behavior. Remaining tickets in
`upstream-release-audit.md`:

- **?** — T-62, T-63, T-64, T-66, T-68, T-70, T-71, T-72, T-73, T-74,
  T-76, T-77, T-78, T-79, T-83, T-84, T-85, T-88, T-89, T-90, T-91,
  T-94, T-95, T-98.
- **⛔** — T-61, T-80, T-82, T-87 (TableView interactive grid; owner with
  A-006), T-92, T-96, T-97.
- **◑** — T-93 (FocusScope without scroll; overlay/focus wave landed
  related `focusSafely` / `runAfterTransition` — re-classify against
  remaining T-93 branches), T-99 (style-macro `_.prose` foundation).
- Also classify the remaining missing RAC exports (five) and missing S2
  support values (thirteen) named in A-013.

#### 5. Evidence schema (A-002, A-003, A-004, A-005 remainder)

Machine-readable ten-gate records with validated pointers. Stop counting
labels and file presence. Replace stale `visual-state-matrix.ts` spec
strings. Publish suite output as passing obligations / expected
fixmes / unregistered-or-deferred obligations.

#### 6. Owner decisions (ask; do not silently ratify)

- TableView native-table vs upstream `div[role=grid]` (A-006, T-87).
- Viviana fork/convergence ownership (A-008).
- TabSwitch / SegmentedControl public/register boundary (`steering.md`).

#### 7. Hygiene

- Response-header / CSP contracts (A-020, residual A-011 app-hardening).
- 59 `@ts-nocheck` files (A-019).
- Macro sourcemaps (A-017).
- Stale `tech-debt.md` (A-009).
- Leftover superseded architecture prose (A-010) as found.
- Remaining package skips (A-022): full-width TimeField browser case;
  Table `scrollRef` placeholder → explicit inventory.
- Press-cleanup paired browser coverage (A-027).
- Snapshot standard when generated-class tests fail (A-025, ongoing).

#### 8. Lowest-layer ownership (A-018)

The layer-boundary guard freezes the sibling fork; it does not prove
behavior lives in stately/aria. Use `report:layer-imports` as the work
list, not a verdict. Compatibility ceilings (A-023) stay documented.
Vite Plus noisy cold scan (A-024) is last.

## Pick order

1. Remaining-work goal above, starting at `ci:site` (`a11y:smoke`
   ContextualHelp outside-click, then routes / seo / api-reference).
2. Complete and validate the dependency/toolchain migration, including actual
   package artifacts, consumer tarballs, peer compatibility, and security gates.
3. Finish classifying the pinned RAC 1.20 / S2 1.6 train and port only
   source-confirmed behavior gaps (`upstream-release-audit.md` T-61…T-99).
4. Prove the Kumo Button through paired browser behavior and visual contracts;
   keep its executable publish prerequisite closed until npm setup is verified.
5. Normalize component-acceptance records and make reports resolve the evidence
   they claim instead of counting labels and file presence.
6. Refresh measured facts and commands in `status.md` after the integration
   validation ladder completes.
7. Then pick one dependency-bounded parity cluster from
   `labeledvalue-strict-parity` / issue #24 or `dnd-subsystem-port` / issue #25.
8. Pick shared-spine and upper-layer convergence work before a per-widget copy
   of the same concern.
9. Pick docs pages only after their behavior is proven and the catalogue mapping
   identifies the real gap.
10. Use maintenance tasks to fill bounded gaps, not to displace active
    user-visible correctness.

## Active workstreams

- **Wave 0 — safety:** dependency/security validation, package-artifact truth,
  release prerequisites, and clean-checkout gate preconditions.
- **Wave 1 — upstream:** finish the finite S2 1.6.0 / RAC 1.20.0 behavioral
  absorption against the already-updated oracle.
- **Wave 2 — parity closure:** nine strict controls and seven exports/DnD.
- **Wave 3 — architecture:** headless-spine consumption, upper-register
  convergence, consumer-delivery, and package-build batches.
- **Wave 4 — public completeness:** catalogue docs, admin projection, license,
  and hygiene.
- **Bounded Kumo pilot:** land the one-component baseline, present it honestly
  on the root landing, build paired evidence, align the sibling proposal, then
  hold a continue/pause/delete review. It does not weaken or re-order the Adobe
  parity waves.

## Evidence discipline

- `comparison:report:parity:strict` currently passes against a nine-entry
  baseline. Report command state and accepted debt state separately.
- The full certified suite is mandatory for an oracle, shared behavior, or
  parity component change.
- Do not run package-cleaning aggregate build lanes concurrently; they share
  `dist` trees.
- Until issue #28 closes, prefer canonical aggregate lanes over standalone app
  typecheck on a clean checkout.
- Update task state, validation evidence, status, and code in the same commit.
- A task is complete on `main` only after the four required contexts are green
  for the exact resulting SHA.
