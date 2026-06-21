---
kind: process
status: current
---

# Upstream sync — pinning and absorbing React Spectrum releases

Status: Current source of truth.
Update when: the pinned upstream version changes or the absorption process changes.

How the vendored upstream oracle is pinned, how a new Adobe release is absorbed,
and how `guard:upstream-test-parity` mechanically maps our component tests onto
the upstream React Aria Components + React Spectrum S2 executable spec.

## The pinned oracle

`./react-spectrum` is the upstream monorepo, vendored as our executable
reference (manual parity work _and_ the `guard:upstream-test-parity` sweep). It
is **gitignored** (`.gitignore` → `react-spectrum`) and ~220 MB, so it is never
committed — but it is **pinned, not floating**. The pin lives in a tracked file,
`scripts/upstream-pin.json`: release umbrella tag, commit SHA, and the resolved
`@react-spectrum/s2` / `react-aria-components` versions.

Current pin (2026-06-19): `@adobe/react-spectrum@3.47.2`, commit `1c84a49a`,
`@react-spectrum/s2@1.5.0`, `react-aria-components@1.19.0`. The 1.18/1.4 → 1.19/1.5
absorb backlog is **Train 6 (T-34…T-50)** in
[upstream-release-audit.md](./upstream-release-audit.md).

The tree is materialized as a **shallow checkout at the tag** (nested `.git`),
which makes release-to-release diffing first-class. `guard:upstream-test-parity`
prints a **DRIFT** banner when the actual vendored versions don't match the pin —
so "I don't think the vendored copy is the latest" is now a one-command check.

Three distinct staleness axes, don't conflate them:

- **tree vs. pin** (is the vendored checkout the one we pinned?) — the DRIFT
  banner above.
- **pin vs. latest upstream** (has Adobe shipped something newer than our pin?) —
  `guard:upstream-freshness` (`scripts/check-upstream-freshness.ts`). It asks
  GitHub for the latest RAC + S2 tags and exits non-zero when the pin is behind,
  naming the gap. It runs **report-only in `certification-gates.yml`**, so a new
  release surfaces as a ❌ cell on every PR instead of sitting unnoticed; run it
  by hand anytime with `vp run guard:upstream-freshness`. When it goes red, work
  the "Absorbing a new upstream release" steps below.
- **installed comparison deps vs. pin** (does `apps/comparison/node_modules`
  match the pin?) — **it usually doesn't.** Those deps are resolved by the
  comparison app's own dependency ranges, not by the pin, so they lag. As of
  2026-06-20 the installed tree is two trains behind: s2 `1.3.0` / RAC `1.17.0` /
  `@react-aria/utils` `3.33.0` vs the pin's `1.5.0` / `1.19.0` / `3.34.1`. This
  matters because `source-index.md` lists the installed `@react-aria` /
  `@react-spectrum/s2` paths as the first parity authority — **for a pinned-parity
  port, read the vendored `./react-spectrum` source instead** (or diff the
  installed version against the pin first). Two real near-misses: `isFocusable`'s
  `skipVisibilityCheck` (T-57) and `useAutocomplete`'s `autoFocusOnMount` (T-58)
  exist at the pin but not in the stale installed copies. Same family as the
  "confirm flags vs source" lesson — confirm the _version_, too.

### Materialize / re-materialize the tree

For a fresh clone, or after the pin moves and the tree is stale:

```bash
git clone --depth 1 --branch '@react-spectrum/s2@1.4.0' \
  https://github.com/adobe/react-spectrum react-spectrum
```

## Absorbing a new upstream release

When Adobe ships a new `@react-spectrum/s2` / `react-aria-components`:

1. **Find latest + confirm the release train.**
   ```bash
   git ls-remote --tags https://github.com/adobe/react-spectrum \
     | grep -E 'refs/tags/(@react-spectrum/s2@|react-aria-components@)[0-9.]+$' \
     | sort -t@ -k2 -V | tail
   ```
   Resolve the two tags to SHAs and confirm they share one commit (Adobe releases
   the monorepo as a train; one commit carries both packages).

2. **Refresh the oracle to the new tag** (shallow fetch into the nested repo):
   ```bash
   git -C react-spectrum fetch --depth 1 origin '@react-spectrum/s2@<NEW>'
   git -C react-spectrum checkout FETCH_HEAD
   ```

3. **See exactly what upstream changed** — tests are the contract change, `src`
   is the behavior change:
   ```bash
   git -C react-spectrum diff <OLD_SHA> <NEW_SHA> -- \
     packages/react-aria-components/src  packages/react-aria-components/test \
     packages/@react-spectrum/s2/src     packages/@react-spectrum/s2/test
   ```

4. **Read the release notes for intent.** The contract gate (step 5) only diffs
   ARIA *vocabulary*, so it is blind to the changes that don't add or remove an
   asserted role: behavioral/focus/event fixes, new props or options, and
   deprecations. Those are described only in Adobe's release notes — and there is
   **no per-package `CHANGELOG.md`** in the tree; Adobe publishes one GitHub
   Release per package per minor (`React Aria Components v1.18.0`,
   `React Spectrum S2 v1.4.0`, …) plus the website. Read both for the range you
   just crossed:
   ```bash
   gh release view 'react-aria-components@<NEW>' --repo adobe/react-spectrum
   gh release view '@react-spectrum/s2@<NEW>'    --repo adobe/react-spectrum
   # browse the train:  gh release list --repo adobe/react-spectrum
   # or the website:    https://react-spectrum.adobe.com/releases/
   ```
   For every entry touching a component we ship, decide port-vs-skip the same way
   the sweep does (component-wrong → fix + changeset; already-correct → record
   it in the validation note). A behavioral fix that changes no role trips no
   gate — the notes are the only signal it happened. New components land here as
   "no port test exists" in the gate; the notes say whether they're worth porting.

   The standing backlog of this triage — every release since the S2 1.0.0 major,
   already broken into atomic port-vs-skip tickets with first-pass status — lives
   in [`upstream-release-audit.md`](./upstream-release-audit.md) (oldest train
   first). Extend it with each new train you cross.

5. **Re-run the mechanical gates** against the new spec:
   ```bash
   vp run guard:upstream-test-parity   # contract-vocabulary diff (this doc)
   vp run guard:rac-parity
   vp run guard:rac-export-gap
   vp run guard:dnd-keyboard-parity
   vp run guard:virtualizer-keyboard-parity
   ```

6. **Triage** every newly-flagged (or newly-resolved) component against the
   authoritative upstream source, and update that component's validation note
   under Gate 3 (Upstream React Source Parity) in
   `../../apps/comparison/playbook/components/`.

7. **Bump `scripts/upstream-pin.json`** (tag, commit, versions, `pinnedAt`) in the
   same change, so the pin and the tree never drift silently.

> The upstream **test surface itself moves between releases.** By `s2@1.4.0` the
> old `@react-spectrum/<area>/test/*.test.js` per-component V3 suites were
> deleted; S2 component tests now live in `packages/@react-spectrum/s2/test/*.test.tsx`
> and several RAC tests became `.test.tsx` (Menu, Tree, ListBox.browser). When the
> layout shifts, update `UPSTREAM_TEST_ROOTS` / the matcher in
> `scripts/check-upstream-test-parity.ts`.

## The contract-vocabulary oracle (`guard:upstream-test-parity`)

`scripts/check-upstream-test-parity.ts`. For each component it matches our
`packages/*/test/<C>.test.tsx` to the upstream RAC + S2 test files (by normalized
name, with S2↔RAC aliases: `tableview`→`table`, `treeview`→`tree`,
`picker`→`select`, …) and diffs the **contract vocabulary** both sides assert:

- **ARIA roles**, hard-asserted only (`getByRole`/`findByRole`/`toHaveAttribute('role', …)`);
- **accessible names** (`{ name }`, `getByLabelText`, `aria-label`);
- **aria-\* attributes** (incl. Testing-Library state options `{ selected }`,
  `{ expanded }`, … → `aria-selected`, `aria-expanded`);
- **keyboard keys** (`fireEvent.keyDown` `key:`, `user.keyboard('{…}'` / `'[…]'`).

It reports, per component, **WE-ONLY** (we assert a shape upstream never does —
the prime "wrong shape" suspect, e.g. the Toast `listbox`/TagGroup `listbox`
class) and **UPSTREAM-ONLY** (a shape upstream asserts that we never test — a
coverage gap), ranked with **roles weighted ×10** because a diverging role is
almost always a genuine semantic error, while a diverging aria-\*/key is usually
just broader coverage on our side.

It is a **triage aid, not an oracle of truth** — always confirm a flag against
the authoritative source before changing a test. Known limits:

- **File-level vocabulary.** A test that renders auxiliary widgets contributes
  their roles. Example: `Switch` is flagged we-only `{button}`, but the Switch
  itself asserts `role=switch` 46× (matching upstream); the `button` is a
  focus-steal control in the same story. Pollution shows on both sides.
- **Names are example-specific** (data fixtures) — reported, never scored.
- **Unit tests only.** Our `apps/web/e2e` / `apps/comparison/e2e` specs are a
  separate surface — and the original Toast `Dismiss`/`listbox` divergence lived
  *there*. Folding E2E specs in (bucketed by `test()` title) is a later layer.
- `queryByRole` and `[role="x"]` selector strings are deliberately ignored
  (presence/absence probes and candidate enumerations, not assertions).

## Latest sweep — 2026-06-16 (pin `s2@1.4.0` / `rac@1.18.0`)

45 components matched; 17 raw role-divergence flags. Regenerate anytime with
`vp run guard:upstream-test-parity`. **17 is a ceiling, not a bug count** — triage
(confirming each against source) has so far produced **two** confirmed
component-side fixes — **numberfield** (emitted the wrong roles; commit `0702d3b1`)
and **searchfield** (missing the S2 `FieldGroup` role; commit `2574335f`) — plus
two **component-correct** cases where only test coverage was added (**datefield** /
**timefield**), and reclassified the rest into the buckets below. The headline lesson:

> **The top-ranked "bug" was the oracle's own blind spot.** Our combined
> `ToggleButton.test.tsx` asserts `getByRole("radio")` for a single-select
> `ToggleButtonGroup` — which the RAC `ToggleButton` test never does, so it ranked
> #1. But the **S2 `ToggleButtonGroup.test.tsx` asserts exactly `getAllByRole('radio')`**
> (selection items are radios) — our test is *correct*. The real defect was a
> missing Base+Group alias (our one suite vs upstream's split files). Fixed with
> `togglebuttongroup→togglebutton` + `checkboxgroup→checkbox`; both dropped their
> false role flag. _Always confirm against source before touching a test._

**Bucket A — benign file-level pollution** (the component's own role matches
upstream; the extra role is an auxiliary widget in the same story). No action.
- **checkbox** `{button}`, **switch** `{button}` — a "steal focus" control beside
  the real `checkbox`/`switch` (asserted correctly, many times).

**Bucket B — sanctioned S2 extras** (we test a real S2 behavior the RAC *unit*
test doesn't → all three **confirmed against S2 source** 2026-06-16; our we-only
assertions are legitimate richer coverage, not invented roles. No code/test changes).
- **breadcrumbs** [42] `{navigation, menu, menuitem, button}` — ✅ confirmed: `s2/src/Breadcrumbs.tsx` imports `Menu, MenuItem, MenuTrigger`; `BreadcrumbMenu` renders `<Menu items><MenuItem>` for the collapsed overflow, and breadcrumbs are a `navigation` landmark.
- **button** [20] / **select** [20] `{progressbar}` — ✅ confirmed: `s2/src/Button.tsx` `isPending` → `usePendingState` → `isProgressVisible` renders `ProgressCircle` (progressbar); `s2/src/Picker.tsx` `loadingState` → `showButtonSpinner` / `isLoading` ProgressCircle.
- **disclosure** [30] `{group, region}` — ✅ confirmed: `s2/src/Accordion.tsx` wraps items in RAC `DisclosureGroup` (role=group) and exposes `DisclosurePanel` (`role?: 'group' | 'region'`).

**Bucket C — field-wrapper role nuances to reconcile** (the `upstream-only` side
is the signal: upstream asserts a `group` role on the field we may not).
- **datefield** [23] / **timefield** [20] — ✅ **reconciled** (commit `6a3c7775`, 2026-06-16): *not* a component bug. `createDateField` already emits `role="group"` on the standalone field wrapper (and `role="presentation"` when embedded in a DatePicker, mirroring upstream `useDateField`'s `roleSymbol` switch). The oracle only saw `group` as `upstream-only` because our coverage exercised it via `querySelector` — invisible to the vocabulary extractor; added explicit `getByRole("group")` assertions at the solidaria-components layer. Oracle now reports `upstream-only {—}` for roles on both. Residual we-only `{button, presentation}` are benign — the contextual-help button + the `DateInput` presentation container / literal segments (Bucket A). A reminder that `querySelector('[role=…]')` is an oracle blind spot, like `queryByRole`.
- **numberfield** [17] `{spinbutton}` ‖ `{group, textbox}` — ✅ **reconciled** (commit `0702d3b1`, 2026-06-16): confirmed *component* bug, not a test divergence. Upstream `useNumberField` wraps `useSpinButton` but overrides its output (`role: null`, `aria-valuenow/min/max/text: null`) because a spinbutton can't be focused with VoiceOver. Component now renders a `textbox` inside the `role=group` wrapper with `aria-roledescription="number field"`; tests + regression snapshot updated; changeset bumps all three packages. _Oracle still shows score 9 — pure ARIA-vocab noise: our `.not.toHaveAttribute("aria-value*")` negative assertions are miscounted as usage. No role divergence remains._
- **searchfield** [15] `{textbox}` ‖ `{group}` — ✅ **reconciled** (commit `2574335f`, 2026-06-16): confirmed *component* gap at the **S2 layer**. S2's SearchField field shell is a `FieldGroup` (RAC `<Group>` → `role="group"`) around the icon, input, and clear button; ours rendered the same shell as a roleless `<div>` (the RAC SearchField has no group, so the group is S2-only). Added `role="group"`; oracle now reports `upstream-only {—}` for roles. Residual we-only `{textbox}` is the deliberate `type="text"` override test (benign — upstream's `type` prop, exercised). Changeset bumps solid-spectrum.
- **popover** [17] `{textbox}` ‖ `{—}` — benign (Bucket A): our Popover test renders a `textbox` as example content; no upstream gap. No action.
- **menu** [12] `{presentation}` ‖ upstream-only `{textbox}` — the upstream `textbox` is the Autocomplete / search-header-in-Menu scenario we don't cover; a test-scenario gap (→ Bucket D), not a role bug.

**Bucket D — genuine coverage gaps (`upstream-only` roles we never assert)** —
the most actionable real work; port the upstream structural assertions.
- **autocomplete** [10] — ✅ **resolved** (test rename, 2026-06-16): the `combobox` we-only was a *filename-collision false positive*. `solid-spectrum/test/Autocomplete.test.tsx` actually tested `SearchAutocomplete` — a bespoke v3-style styled ComboBox (`role=combobox`, correct), which the oracle's `canon()` merged onto RAC's *headless* Autocomplete. Renamed → `SearchAutocomplete.test.tsx`; it now buckets as ours-no-upstream (no S2 Autocomplete exists upstream — only ComboBox + SearchField) and the suspect clears (38→37). Our real headless port is `solidaria-components/Autocomplete.tsx`, which faithfully mirrors RAC's `<Provider>`-only controller (no combobox/DOM); its test drives it via bespoke `TestInput`/`TestList` consumers (`getByTestId`). The residual `upstream-only {searchbox, menu, menuitem, textbox, group, separator, button, dialog}` is now a *coverage gap*, not a role bug: upstream exercises the headless Autocomplete by composing real SearchField+Menu(+Dialog) auto-wired through the autocomplete contexts, but our SearchField/Menu don't consume those contexts yet (only `Autocomplete.tsx` references the hooks). Closing it is a consumer-wiring port, not a test tweak — don't fake it with bespoke consumers asserting searchbox/menu.
- **calendar** / **rangecalendar** — ✅ **resolved** (test coverage, 2026-06-16): **test-wrong (thin)**, not component-wrong. Our `CalendarGrid` already renders a native `<table role="grid">` → `<thead>`/`<tbody>` (`rowgroup`) → `<tr>` (`row`) → `<th scope="col">` (`columnheader`) → `<td role="gridcell">`, so the structure was present via implicit roles all along; the test just probed it with `querySelector`/class names (invisible to the oracle's `getByRole` extractor). Added `within(grid).getAllByRole("rowgroup"|"columnheader"|"row"|"gridcell")` structural assertions mirroring upstream (`solidaria-components/test/{Calendar,RangeCalendar}.test.tsx`). Calendar role-gap `{columnheader, listbox, option, row, rowgroup}` → `{listbox, option}`; rangecalendar `{gridcell, option, row, rowgroup}` → `{option}`. The residual `listbox`/`option` are **not** Calendar structure — they come from upstream's custom-heading **composition demos** (a `Select`+`ListBox` month picker, lines 750-775, and a native `<select>`), which exercise Select/ListBox *through* the heading slot; deliberately skipped (redundant with those components' own suites). Remaining score is benign we-only aria/keys (we test more nav keys than the RAC unit test). No component change → no changeset.
- **datepicker**/**daterangepicker** `{grid, gridcell, textbox}` — ✅ **resolved** (test-thin, `aac26482`): calendar-in-popover grid/gridcell + native-validation hidden textbox; residual is benign aria/keys vocab. **taggroup** `{group}` — ✅ **resolved** (test-thin, `aac26482`): empty-state `getByRole("group")`. **tabs** `{button, tooltip}`, **toolbar** `{checkbox, link, textbox}`, **dialog** `{gridcell, group, menuitem}` — composition-content skips (example *children*, not intrinsic roles; no action). **tree** `{menu, rowgroup, rowheader}` — `menu` = ActionMenu-on-rows composition (skip); **`{rowgroup, rowheader}` = genuine component gap → item 3b** (shared `createGridListSection` port for Tree+GridList).
- COVERAGE-GAPS section (no role overlap at all) — ✅ **triaged** (`541a9a1f`, see worklist item 4): **gridlist** `{gridcell}` fixed (test-thin), `{rowgroup}`→item 3b, `{button}`=composition; **colorswatch** `{img}` = canon-bucketing artifact (covered in `Color.test.tsx`); **selectboxgroup** `{button}` = harness composition; **tooltip** `{button}` / **filetrigger** `{link}` = trigger composition; **dropzone** = aria-only (no role gap).
- UNMATCHED, no port test exists: **actionbuttongroup, coachmark, colorarea/picker/slider/wheel, customdialog, group, hiddendateinput, labeledvalue, virtualizedmenu**.

**Already clean.** **toast** (upstream-only `{alert}` is the alert/status variant;
aria-only) and **taggroup** are role-clean — the earlier `listbox`/`Dismiss`
reconciliations hold. (That original Toast divergence lived in the **E2E** specs,
not these unit tests — see the "unit tests only" limit above.)

## Resume point — ordered worklist (pick up here)

Single source of truth for *where the sweep stands*. Work top to bottom; tick a
box and add the commit when done. Re-run `vp run guard:upstream-test-parity`
after each to confirm the flag clears.

**Done**
- [x] Bucket A — benign file-level pollution. No action.
- [x] Bucket B — sanctioned S2 extras (breadcrumbs / button / select / disclosure), all confirmed against S2 source (`52a606a1`).
- [x] Bucket C — numberfield fix (`0702d3b1`), searchfield fix (`2574335f`), datefield/timefield coverage (`6a3c7775`), popover/menu triaged.

**Remaining (in order)**
- [x] **0. Pre-existing Table PageDown failures** — `Table.test.tsx` 3 tests (`ArrowDown`/`End`/`PageDown` "should not focus the load more row", ~line 1160-1256). **Component-wrong**, not test-wrong: the keyboard delegate already lands the focused *key* on the last data row (the loader, rendered outside the collection, is never a nav target), but the roving-tabindex→DOM-focus bridge in `createTable.ts` was gated on the grid's logical `state.isFocused`. That signal is only set by the grid's own **non-bubbling** `focus`/`blur` handlers (mirror of upstream `useSelectableCollection`, but upstream's `onFocus` is focusin-based so it fires for descendant/row focus too). When focus lands directly on a row — pointer click, or the test's `rows[1].focus()` — `isFocused` stays false and the bridge never moved browser focus, so arrow/End/PageDown updated the roving tabindex without moving DOM focus. Fix: gate the bridge on the *physical* `el.contains(document.activeElement)` instead of `isFocused` (the contains() check already prevented focus-stealing from off-table). Avoids the alternative `setFocused(true)`-in-`createTableRow` fix, which tripped a loader-present re-render that dropped focus to `<body>`. `solidaria/src/table/createTable.ts`; full Table suite + solidaria/solidaria-components green (3341 pass).
- [x] **1. autocomplete** [10] — ✅ **resolved as a false positive** (test rename, 2026-06-16). The score-10 `combobox` we-only was a *filename collision*: `solid-spectrum/test/Autocomplete.test.tsx` tested the bespoke `SearchAutocomplete` (a styled ComboBox — `combobox` is the correct role), which `canon()` merged onto RAC's *headless* Autocomplete. Renamed → `SearchAutocomplete.test.tsx` → suspect clears (38→37). The real headless port (`solidaria-components/Autocomplete.tsx`) mirrors RAC's `<Provider>`-only controller. Residual `upstream-only` roles downgraded to a tracked **coverage gap** (Bucket D line above): upstream composes real SearchField+Menu(+Dialog) auto-wired via the autocomplete contexts; our SearchField/Menu don't consume them yet, so closing it needs a consumer-wiring port — not a test tweak (don't fake with bespoke consumers).
- [x] **2. calendar / rangecalendar** — ✅ **resolved** (test coverage, 2026-06-16). **Test-wrong (thin)**: `CalendarGrid` already emits the full native-table structure (`rowgroup`/`row`/`columnheader`/`gridcell` via `<table role=grid>`/`<thead>`/`<tbody>`/`<tr>`/`<th scope=col>`/`<td role=gridcell>`); the test only probed it via `querySelector`. Added `within(grid).getAllByRole(...)` structural assertions → role-gap collapses to the upstream **composition demos** (`{listbox, option}` calendar, `{option}` rangecalendar — a `Select`+`ListBox`/native-`<select>` month-picker in the heading slot), deliberately skipped as redundant with Select/ListBox's own suites. No component change → no changeset. Both suites green (82 pass).
- [x] **3. datepicker / daterangepicker / taggroup / tabs / toolbar / dialog** — ✅ **triaged** (`aac26482`, 2026-06-17). Verdicts:
  - **datepicker** / **daterangepicker** — **test-wrong (thin)**, role gaps cleared. The popover reveals the embedded Calendar/RangeCalendar (intrinsic `grid` + day `gridcell`); the test only opened it via `querySelector`. Added `findByRole("grid")` + `within(grid).getAllByRole("gridcell")` on open. Also asserted the native-validation hidden input is a `textbox` (`getByRole("textbox", {hidden:true})`, only present under `validationBehavior==="native"` per `HiddenDateInput.inputType()`). datepicker `{gridcell, textbox}`→∅, daterangepicker `{grid, gridcell}`→∅. Residual score (5/4) is benign we-only aria/keys vocab (`aria-haspopup`/`aria-required`/`escape` etc.) vs upstream's `aria-labelledby`/`aria-selected` (calendar-internal) — not role bugs. Test-only, no changeset.
  - **taggroup** — **test-wrong (thin)**, `group` cleared. An empty TagGroup emits `role="group"` (not `grid`) per `createTagGroup.ts:143` `role: hasItems ? "grid" : "group"`; added `getByRole("group")` to the empty-state test. Residual `upstream-only {tooltip}` = a `TooltipTrigger` on a tag in upstream's example (composition demo, skip); aria/keys are vocab.
  - **tabs** `{button, tooltip}`, **toolbar** `{checkbox, link, textbox}`, **dialog** `{gridcell, group, menuitem}` — **deliberate composition-content skips**, no action. Our components emit the correct *intrinsic* roles (`tab`/`tablist`/`tabpanel`, `toolbar`, `dialog`); every `upstream-only` role here is an example **child** placed *inside* the component by upstream's test (TooltipTrigger on a tab; checkbox/link/textbox inside a toolbar; a table/group/menu inside a dialog). Asserting them would test Tooltip/Checkbox/Link/Table/Menu, not Tabs/Toolbar/Dialog — redundant with those suites and "mirror, don't invent."
  - **tree** — **component-wrong** (genuine ARIA-structure gap), split out as item **3b** below.
- [x] **3b. tree + gridlist section ARIA semantics** — ✅ **resolved** (full faithful port, 2026-06-17). **component gap** (NOT test-thin). Upstream `TreeSection` renders `role="rowgroup"` (+`aria-label`/`aria-labelledby` to the header) and `TreeHeader` renders `role="row"` › `role="rowheader"` (via `useGridListSection`, `react-aria/src/gridlist/useGridListSection.ts` — tiny: `rowProps{role:row}`, `rowHeaderProps{id,role:rowheader}`, `rowGroupProps{role:rowgroup,...labels}`, with `state`/`ref` unused). **Our** `TreeSection`/`TreeHeader` (`Tree.tsx:1869-1875`) delegate to the generic `Section`/`Header` (`Collection.tsx:237/283`) → `<div data-section>` / `<div role="heading">`, so we emit neither `rowgroup` nor `rowheader` (oracle: tree upstream-only `{rowgroup, rowheader}` + we-only `{heading}` = the flip side). **Same gap in `GridList`**: our `GridListHeader` (`GridList.tsx:908`) is a role-less `<div>` and `GridListSection` is the generic `Section` — upstream `TreeHeader` literally reuses `GridListHeader`. **Faithful fix = a shared port:** add `createGridListSection` to `solidaria/src/gridlist/` (mirror upstream; we already have `createLabels` + `createId`; the conditional-id from `useSlotId` we can source structurally — header present? — instead of a post-mount DOM probe), wire it through both `GridList` (Section→rowgroup, Header→row›rowheader via `GridListHeaderContext`+a new `GridListHeaderInnerContext`) and `Tree`, add `getAllByRole("rowgroup")` + `within(header).getByRole("rowheader")` tests for **both**, **+ changeset** (touches published `solidaria`/`solidaria-components`). tree `{menu}` = ActionMenu-on-rows composition (skip); we-only `{progressbar}` = example loading spinner (benign); `aria-colindex` rides along with the grid-section port.
  **Outcome:** ported exactly as planned. New `createGridListSection` (`solidaria/src/gridlist/createGridListSection.ts`, mirroring `useGridListSection`) returns `rowProps{role:row}` / `rowHeaderProps{id,role:rowheader}` / `rowGroupProps{role:rowgroup,...labels}`; the conditional heading id comes from a new SSR-safe `createSlotId` (`solidaria/src/ssr/index.tsx`, analogue of `useSlotId` — labels the rowgroup only once the header is in the DOM). `GridListSection`/`GridListHeader` rewired (Section→rowgroup, Header→row›rowheader via `GridListHeaderContext` + new `GridListHeaderInnerContext`); `TreeSection`/`TreeHeader` reuse those GridList primitives exactly as upstream. **Solid gotcha:** the header children must be evaluated *only inside* the providers (pass `children: undefined`/constant `values` to `useRenderProps`) — Solid resolves `useContext` by owner-at-call-time, so touching `local.children` during section setup instantiates the header outside the providers and nulls its contexts. Tests rewritten to assert the rowgroup + `within(header).getByRole("rowheader")` labelling for both (`Tree.test.tsx`, `GridList.test.tsx`); 8 Virtualizer section-header assertions flipped `heading`→`rowheader`. Changeset `tree-gridlist-section-rowgroup-semantics.md` (patch ×2). **Oracle after:** tree role-divergence drops to `we-only {progressbar} ‖ upstream-only {menu}` (both pre-existing skips — `{rowgroup, rowheader}` cleared); **gridlist** leaves the suspects list entirely (only the pre-existing `button | aria-rowindex | keys` coverage gap remains — `{rowgroup}` cleared, no `{rowheader}` we-only introduced). Suites green: Tree+GridList+Virtualizer 143 pass; typecheck clean (bar the 2 pre-existing parity-script errors).
- [x] **4. no-overlap components** — ✅ **triaged** (`541a9a1f`, 2026-06-17). Verdicts:
  - **gridlist** `{button, gridcell, rowgroup}` — **gridcell test-wrong (thin)**, fixed: `createGridListItem.ts:181/204` emits `role:"row"›role:"gridcell"`, but the suite only asserted grid+row; added `getAllByRole("gridcell")`. `rowgroup` (+`aria-rowindex`) = the **item 3b** section port (same gap as Tree). `button` = composition (buttons placed inside items).
  - **colorswatch** `{img}` — **canon-bucketing artifact**, no action. `createColorSwatch.ts:46` emits `role:"img"` and it's **already behaviorally asserted** (4× `getByRole("img")` in `solidaria-components/test/Color.test.tsx`, via ColorSwatch + ColorSwatchPickerItem). That file canons to `color` (ours-no-upstream bucket); the `colorswatch`-canon test (`solid-spectrum/test/ColorSwatch.test.tsx`) is an export-surface test by design. Real coverage exists — don't add a redundant render test just to satisfy the text-matcher.
  - **selectboxgroup** `{button}` — **test-harness composition skip**. Our SelectBoxGroup emits the real `listbox`+`option` structure (asserted). Upstream S2's extra `button` is a *harness control* (`getByRole('button', {name: 'Select Option 2'})` — a custom button clicked to drive controlled selection, `SelectBoxGroup.test.tsx:637`), not part of the component.
  - **tooltip** `{button}` — composition skip (the `TooltipTrigger`'s trigger button; our Tooltip emits `role="tooltip"`, asserted). **filetrigger** `{link}` — composition skip (FileTrigger renders `<span>{children}</span>` with no intrinsic role; upstream's example uses a `Link` child, ours a `button` — the trigger child is user-provided). **dropzone** — no role gap at all (aria-only: `aria-labelledby` + keys); no action.
- [x] **5. unmatched (no port test exists)** — ✅ **triaged** (2026-06-17): all **skip-or-covered**, no new component work. Three sub-classes:
  - **Covered (canon-bucketing / transitive), no action.** `colorarea`/`colorslider`/`colorwheel`/`colorpicker` — heavily behaviorally tested in `solidaria-components/test/Color.test.tsx` (114 refs), which canons to `color` (ours-no-upstream); upstream splits them into per-component test files. `hiddendateinput` — internal DatePicker form-submission helper, covered via `DatePicker.test.tsx` (the native-validation hidden-`textbox` assertion added in item 3). `group` — `Collection.tsx` Group primitive (`role="group"`, line 341) is asserted via `getByRole("group")` across **10+ consumer suites** (Collection, DateField, NumberField, Disclosure, Checkbox, TagGroup, ListBox, TimeField, Menu, Color). `actionbuttongroup` — a thin wrapper that renders `<HeadlessToolbar>` (so `role="toolbar"`, covered by the Toolbar suite + exercised in ActionBar/ButtonFamilyContext/Wave4Components). `customdialog` — S2 `dialog/Dialog.tsx` variant; dialog semantics covered by the Dialog suite.
  - **Not ported (component absent), skip until built.** `coachmark`, `virtualizedmenu` — no src in the repo (`grep` = NONE). When ported, add a paired test then.
  - **Display-only, no meaningful intrinsic role, skip.** `labeledvalue` — renders label+value text; upstream's only role assertion is `getByRole('link')` for the link-*value* variant (S2 `LabeledValue.test.tsx`). Low-risk display component; no role port warranted.

---

### Sweep complete — Bucket D fully triaged (2026-06-17)

Items 0-5 done, **including item 3b** (✅ 2026-06-17): the shared `createGridListSection` port for Tree + GridList `rowgroup`/`rowheader` — the one genuine component gap the sweep surfaced — is now landed (see item 3b above for the full outcome). **No component fixes outstanding.** Everything else was either **test-thin** (assertions added: table focus, autocomplete rename, calendar/rangecalendar grid, datepicker/daterangepicker grid + hidden-textbox, taggroup empty group, gridlist gridcell), a **canon-bucketing artifact** (colorswatch/color*/hiddendateinput covered under a sibling test file), **composition-content** (example children: tabs/toolbar/dialog/tree-menu/taggroup-tooltip/filetrigger-link/selectbox-harness-button), or **not-yet-ported** (coachmark/virtualizedmenu). The oracle is **report-only (exit 0)**; residual scores are benign we-only aria/keys vocab (we assert more nav keys than the RAC unit tests) — not role bugs.

For each remaining item, the verdict is still **component-wrong vs test-wrong**:
read upstream source first, then either fix the component (+ changeset) or add
the missing assertion. Record the outcome on the matching Bucket line above.

See `certification.md` (Gate 3) for where this guard sits in the ladder.

---

## Source-level behavioral sweep — `disabledBehavior` (Tree / GridList / ListBox / Menu / Table)

A sweep that runs *alongside* the vocab oracle above, against the same pinned
source: read the upstream **hook + component + unit tests** for one behavior,
diff against ours, fix faithfully with vitest tests + a **patch** changeset.
Owning workstream: per-component certification (collection/overlay families).
First aspect closed — `disabledBehavior` — 2026-06-18.

**Authoritative semantics (re-verified from pinned source).** Three predicates,
three *different* gates — the point of the flag is that they are not the same
check:

- **default** — `disabledBehavior = 'all'` for List/ListBox/Menu/Table/Tree
  (`react-stately/src/selection/useMultipleSelectionState.ts:68`; RAC `Menu`
  passes `...props` to `useTreeState`, no override).
- **nav skip** — `ListKeyboardDelegate.isDisabled`
  (`react-aria/src/selection/ListKeyboardDelegate.ts:90-95`):
  `disabledBehavior === 'all' && (item.props.isDisabled || disabledKeys.has(key))
  && item.props.disabledBehavior !== 'selection'`.
- **focus / `onAction`** — `SelectionManager.isDisabled`
  (`react-stately/src/selection/SelectionManager.ts:527-533`): same shape as nav
  skip, **also gated on `'all'`** → returns `false` under `'selection'`.
- **selection** — `SelectionManager.canSelectItem` → `canSelectItemIn`
  (`SelectionManager.ts:510-525`): raw `disabledKeys.has(key) ||
  item.props.isDisabled`, **regardless of `disabledBehavior`**. `select()` /
  `toggleSelection` / `replaceSelection` self-guard on it (`:345/371/250`).

So for a key in `disabledKeys`: under **`'all'`** (default) it is skipped in nav,
not focusable, no `onAction`, not selectable; under **`'selection'`** it is
focusable + navigable + **`onAction` fires** + still **not selectable** (the only
thing the flag turns off is selection).

**Divergence found & fixed.** All four collection components skipped disabled
items in keyboard nav *unconditionally*, so a `'selection'`-disabled item could
never be focused — `disabledBehavior: 'selection'` was effectively dead. Fix: an
`isNavigationDisabled(state, key) = state.isDisabled(key) && disabledBehavior ===
'all'` helper routed through every nav site, mirroring
`ListKeyboardDelegate.isDisabled`. Selection paths were already correct
(raw-block via the state's selection guards). API-shape note: GridState/TreeState
are flat → `disabledBehavior` is a **property** (`state.disabledBehavior ===
'all'`); ListState/MenuState wrap SelectionState → it is an **Accessor**
(`state.disabledBehavior() === 'all'`).

- **Tree** — `8cc7eccf` (`solid-stately/.../tree`, `solidaria/.../createTree*`).
- **GridList** — `535be089` (`solidaria/src/gridlist/createGridList.ts`,
  `solid-stately/src/grid` + Table forwarding). New `createGridList` nav suite
  (8 tests) + `createGridState` disabled-behavior `describe` (3). Changeset
  `gridlist-disabled-key-navigation` (patch solid-stately + solidaria).
- **ListBox** — `64c454ea` (`solidaria/src/listbox/createListBox.ts`; both
  `findNextEnabledKey` loops routed through the helper). +2 tests (no-skip under
  `'selection'`; still blocks Space-select). Changeset `listbox-…` (patch
  solidaria).
- **Menu** — `9645db50` (`solidaria/src/menu/createMenu.ts`; nav-gated local
  drives arrows/Home/End/PageUp/PageDown + `findNextNonDisabledKey`). +2 tests.
  Changeset `menu-…` (patch solidaria).

Adding the required `disabledBehavior` to `GridState` forced **Table** (extends
`GridState`) to carry it: optional `disabledBehavior` on `TableStateOptions`,
threaded into `createTableState`'s `createGridState` call, plus a forwarding
getter — faithful (upstream `useTableState` accepts it via the selection-state
props). Verified green: `tsc` exit 0; **246 tests / 8 files** (createTreeState,
createGridState, createTableState, createTreeGridState, createTree,
createGridList, createListBox, createMenu).

**Resolved — the action-under-`'selection'` edge** (`1a55ba70`, 2026-06-18).
Upstream fires `onAction` for a `'selection'`-disabled item
(`SelectionManager.isDisabled` is `'all'`-gated → false here) while still
blocking selection (`canSelectItem` raw-false). Our Enter/Space **activation**
guard used the raw `state.isDisabled(focusedKey)`, so under `'selection'` we
fired **neither** `onAction` nor selection. Fix: gate the activation branch on
the navigation-disabled check (`disabledBehavior === 'all'`) in all four
components, mirroring `useSelectableItem`'s `allowsActions`. Selection stays
blocked because the mutators (`select` / `toggleSelection` / `replaceSelection`)
self-guard on the raw disabled check (`SelectionManager.canSelectItem`), so
activating a disabled key fires `onAction` while `select()` no-ops. GridList and
Tree keep their separate Space/selection branch raw (selection always blocked);
Menu and ListBox share one Space/Enter branch that now fires `onAction` while the
toggle no-ops. Added a per-component "Enter fires onAction but does not select"
test (and flipped the Menu test that encoded the old behavior); changeset
`disabled-selection-onaction.md` (patch solidaria). The four suites stay green
(134 tests); `tsc` exit 0.

**Resolved — wrapper plumbing** (`7de4ea89`, 2026-06-18): the `disabledBehavior`
prop is now exposed and forwarded through the `solidaria-components` collection
wrappers. `GridList` and `Menu` gained the prop (next to `disabledKeys`) and
forward it to `createGridState` / `createMenuState`; `Table` already accepted it in
its props type and split list but dropped it before `createTableState` — both
ternary branches now forward it. `ListBox` and `Tree` already did, and `MenuSection`
(Menu Path B) was already correct. The `solid-spectrum` styled wrappers need no
change: each extends `Omit<Headless…Props>` (without omitting `disabledBehavior`)
and spreads the rest onto the headless component, so the prop forwards transparently
— and unlike the headless enumeration that bit Table, a spread-rest can't silently
drop it. Discriminating wrapper tests focus a disabled-for-`'selection'` item
(keyboard nav lands on it and `onAction` fires); they fail if the prop defaults back
to `'all'`. Changeset `gridlist-menu-table-disabledbehavior.md` (patch
solidaria-components).

## Source-level behavioral sweep — `selectionBehavior: 'replace'` (highlight selection)

Next aspect of the sweep. Upstream oracle: `react-aria/src/selection/useSelectableItem.ts`.

**Contract (`onSelect`, 144-182).** On activation: keyboard non-contiguous modifier
→ toggle; `selectionMode === 'none'` → return; **single mode → ignore
`selectionBehavior`** (`isSelected && !disallowEmptySelection ? toggle : replace`);
`shiftKey` → extend; `selectionBehavior === 'toggle' || isCtrlKeyPressed || touch ||
virtual` → toggle; else → replace. The action model (249-256): `hasPrimaryAction =
allowsActions && (behavior === 'replace' ? !allowsSelection : !allowsSelection ||
isEmpty)`; `hasSecondaryAction = allowsActions && allowsSelection && behavior ===
'replace'`. Under `replace`, single-click **selects** (replace) and the row action
is **secondary** — it fires on double-click (`onDoubleClick`, modality `mouse`,
401-409). Touch long-press → `onSelect` + `setSelectionBehavior('toggle')`
(411-422).

**Resolved — single-mode `select()`** (`solid-stately`, 2026-06-19): our
`createSelectionState.select()` (the consolidated `onSelect`, used by Menu / ListBox
/ ActionGroup) short-circuited single mode on `behavior === 'replace'` and called
`replaceSelection`, so a re-selected item stayed selected — a single-mode highlight
ListBox/Menu could never clear by re-activating its row. Now it mirrors upstream:
single mode ignores `selectionBehavior` (`isSelected && !disallowEmptySelection ?
toggle : replace`). Tests in `collections.test.ts` cover re-select-deselects (empty
allowed), re-select-keeps (empty disallowed), replace-on-different-key, and the
multiple-mode replace/ctrl-toggle split. Changeset
`selection-single-mode-replace.md` (patch solid-stately).

**Not yet ported — the `replace`-mode action model (architectural).** Upstream's
single-click-selects / double-click-acts split (where, under `replace` with
selection enabled, the row action is the **secondary** action) is **not** wired up.
Our collection item hooks that drive grids/trees/tables inline activation on **raw
pointer events** rather than going through `select()` / upstream `usePress`:
- `gridlist/createGridListItem.ts` `handleActivation` (45-89) and
  `tree/createTreeItem.ts` (74-92) conflate selection with action — the `replace`
  branch fires `onAction` on a single-click of the **sole-selected** row
  (`isSelected() && selectedKeys.size === 1`) instead of `replaceSelection`, and have
  no double-click path at all.
- `table/createTableRow.ts` is further along — pointer-down/up disambiguation
  (`didSelectOnPointer` / `didActionOnPointer`, 144-170), a `forceReplace` select
  path (99/105), and an `onDblClick` (173-180) — but that dblclick only activates an
  `href` link under `replace`; the general row action still fires on the **single**
  activation (167-168) rather than as a double-click secondary action.

None route through `select()` / `usePress`, none thread `pointerType` (touch/virtual
⇒ toggle) into `select()` (its event param is only `shiftKey/ctrlKey/metaKey`), and
none implement touch **long-press → `setSelectionBehavior('toggle')`**. Closing this
faithfully means routing item activation through a press-based path and threading
`hasPrimaryAction` / `hasSecondaryAction` + `pointerType` — a cross-hook epic, scoped
separately from the bounded `select()` fix above.

## Source-level behavioral sweep — typeahead / `KeyboardDelegate` search

Aspect of the sweep covering type-to-select. Upstream oracles:
`react-aria/src/selection/useTypeSelect.ts` (the hook) and
`react-aria/src/selection/ListKeyboardDelegate.ts` `getKeyForSearch` (330-351). Our
port: `solidaria/src/selection/createTypeSelect.ts`.

**Contract.** `getKeyForSearch(search, fromKey)`: `key = fromKey || getFirstKey()`
— starts **at** `fromKey` *inclusive* — then iterates `getNextKey` with **no internal
wrap**, matching via `Intl.Collator.compare(textValue.slice(0, search.length),
search) === 0`. The hook (`useTypeSelect`) calls it once from the focused key, then,
if that misses, **retries from the top** (`getKeyForSearch(search)` with no
`fromKey`) — that retry is the only wrap. In the **pinned 1.19** hook the keydown
(bubble) guard blocks on `!character || ctrlKey || metaKey || **altKey** ||
!contains || (search.length === 0 && char === ' ')` — i.e. it **does bail on
`altKey`** — and on a successful char match it `preventDefault`/`stopPropagation`s,
while on a no-match it resets the search + clears the timeout + returns. A space
*within* a non-empty search is appended and `preventDefault`/`stopPropagation`'d so
the collection doesn't toggle selection. The 1.19 refactor binds **both**
`onKeyDownCapture` (Space-during-search only, so it precedes the collection's own
keydown) **and** `onKeyDown` (characters), and cleans up the debounce timeout on
unmount. (An earlier reading below claimed "no `altKey`" / "`onKeyDownCapture`
only" — that was pre-1.19 and is superseded by the T-35 note.)

**Resolved — start-at + altKey + space** (`solidaria`, 2026-06-19). Three faithful
fixes to `createTypeSelect`:
- **Start *at* the focused key, no internal wrap.** Was `(fromIndex + 1) %
  items.length` with a modulo-wrapping loop — i.e. start *after* the focus and wrap
  inside `getKeyForSearch`. That advanced off an item the typed prefix still matched
  (e.g. typing "F" on a focused "Foo" jumped to a later "Foo Bar"). Now starts at
  `fromIndex` and scans to the end only; the hook's existing from-top retry
  (`getKeyForSearch(collection, search, null, …)`) provides the wrap, mirroring
  upstream.
- **Removed the extra `altKey` guard** — _later reverted by T-35_ (see below):
  this read upstream as guarding only `ctrlKey`/`metaKey`, but pinned 1.19 _does_
  bail on `altKey`, so T-35 re-added the guard.
- **Corrected the dual-handler comment** (no behavior change). In Solid a capture
  handler delivered via `{...typeSelectProps}` spread is **not** wired as a working
  capture listener, so the bubble `onKeyDown` is the path that actually fires — the
  old "capture for production, bubble for tests" comment was wrong, and the binding
  is unchanged (both kept) because capture-via-spread is inert, not double-firing.

Tests in `createTypeSelect.test.tsx` cover: stays-on-current-when-prefix-still-
matches, multi-char accumulation, from-top wrap when nothing at/after matches,
Ctrl/Meta/Alt blocked (updated by T-35), and space-in-active-search appended +
`defaultPrevented`. Changeset `typeahead-start-at-key.md` (patch solidaria).

**Resolved — 1.19 keydown refactor (T-35)** (`solidaria`, 2026-06-19). Reconciled
`createTypeSelect` against the pinned-1.19 `useTypeSelect`, landing the four
behavioral deltas the earlier sweep notes hadn't: (a) **re-added the `altKey`
bail** to the bubble guard — reversing the `dfd4d37b` allowance, since pinned 1.19
bails on `ctrlKey || metaKey || altKey`; (b) `preventDefault()`/`stopPropagation()`
on a **matching character** (previously only on Space-during-search); (c) on a
**no-match** reset `search=''` + `clearTimeout` + `timeout=undefined` + return so
the next keystroke starts fresh; (d) `onCleanup` clears the pending debounce on
**unmount** (upstream's `useEffect` teardown). The handler is now a genuine
capture/bubble split (matching upstream's two returned handlers) rather than one
aliased function, with the search/focus + debounce-restart factored into shared
helpers. **The capture handler stays inert through the spread** (Solid limitation),
so the live bubble `onKeyDown` is the working path — and it also covers a mid-search
Space because upstream's bubble bail only rejects a **leading** Space. Consumer
shims are N/A (our `createSelect`/`createMenu`/`createListBox`/`createComboBox` only
spread `typeSelectProps`; the alias lived solely in `createTypeSelect`), and raw DOM
events never carry `continuePropagation`, so upstream's `!('continuePropagation' in
e)` guards collapse to unconditional `stopPropagation`. New discriminating tests:
Alt-bail (rewrote the former "allows Alt" case), `preventDefault` on a char match,
and reset-on-no-match — all 3 fail against the pre-port source. Changeset
`typeselect-keydown-faithful-parity.md` (patch solidaria).

**Resolved — collator matching** (`solidaria`, 2026-06-19). `getKeyForSearch` now
compares the leading substring with an `Intl.Collator` (`usage: 'search'`,
`sensitivity: 'base'`) created via the existing `createCollator`, mirroring upstream
`ListKeyboardDelegate` / `useSelectableList` (`collator.compare(textValue.slice(0,
search.length), search) === 0`). Was a naive `toLowerCase().startsWith`, which only
folded ASCII case; now case- and diacritic-insensitive (a plain `e` matches "Éclair").
A diacritic test covers it. Changeset `typeahead-collator-matching.md` (patch solidaria).

**Still deferred:** _true_ capture-phase binding (a ref-based `addEventListener` so
the capture handler actually fires before the collection's own keydown). T-35
reproduced the capture/bubble split faithfully but the spread-delivered capture
handler remains inert; the live bubble path covers the observable behavior
(including mid-search Space). This is the only remaining typeahead gap.

## Source-level behavioral sweep — Escape key (ListBox)

Aspect of the sweep covering Escape in selectable collections. Upstream oracle:
`react-aria/src/selection/useSelectableCollection.ts` Escape case (343-353). Our
port: `solidaria/src/listbox/createListBox.ts`.

**Contract.** Upstream only acts when `escapeKeyBehavior === 'clearSelection'` (the
default) **and** `!disallowEmptySelection` **and** `manager.selectedKeys.size !== 0`;
then it `stopPropagation()` + `preventDefault()` + `clearSelection()`. When there is
nothing to clear (or empty is disallowed, or `escapeKeyBehavior === 'none'`) it does
**nothing** — crucially no `preventDefault` — so Escape bubbles to an enclosing
overlay (popover / combobox / dialog) to dismiss it.

**Resolved — conditional Escape** (`solidaria`, 2026-06-19). `createListBox`
previously called `e.preventDefault()` on **every** Escape and cleared whenever empty
was allowed. That swallowed Escape inside overlays even with no selection (so the
overlay couldn't close), and never `stopPropagation`'d, so an Escape that *did* clear
could also bubble up and close the overlay. Now gated on `!disallowEmptySelection() &&
!isEmpty()` with `stopPropagation` + `preventDefault` + `clearSelection` only on that
path; otherwise Escape is left untouched. (`isEmpty()` returns false for select-all,
matching upstream's `size !== 0`.) Menu (`onClose` on Escape) and ComboBox (`revert`
only when open) have their own correct, overlay-specific Escape paths — unchanged.
Tests in `createListBox.test.tsx` assert clear-path `preventDefault`+`stopPropagation`
and the no-selection bubble-through. Changeset `listbox-escape-conditional.md` (patch
solidaria).

**Resolved — `escapeKeyBehavior` opt-out (T-53)** (`solidaria`, 2026-06-20). The
conditional Escape above was still hard-coded to the default `'clearSelection'`
path. `createListBox` now takes the `escapeKeyBehavior: 'clearSelection' | 'none'`
prop (default `'clearSelection'`), gating the clear branch on
`(escapeKeyBehavior ?? 'clearSelection') === 'clearSelection'` so `'none'` leaves
Escape entirely untouched (no clear, no `preventDefault`/`stopPropagation`). The
headless `ListBox` component forwards it to the hook via its props rest-spread
(not in the `local`/`stateProps` `splitProps` groups, so it lands in `ariaProps`),
and `filterDOMProps` keeps it off the DOM; upstream S2 doesn't surface it at the
styled layer, so neither does `solid-spectrum`. Two discriminating tests in
`createListBox.test.tsx` ('none' doesn't clear/swallow; explicit 'clearSelection'
does). Changeset `listbox-escape-key-behavior.md` (patch solidaria).

## Source-level behavioral sweep — navigation-key consumption (ListBox + Menu)

Aspect covering arrow/Home/End in selectable collections. Upstream oracle:
`react-aria/src/selection/useSelectableCollection.ts` (Arrow* 211-280, Home 281-297,
End 298-314). Our ports: `solidaria/src/listbox/createListBox.ts` and
`solidaria/src/menu/createMenu.ts`.

**Contract.** For the arrow keys upstream computes the target key first and only calls
`e.preventDefault()` **inside** `if (nextKey != null)` — at a boundary with no wrap (or
in an empty collection) the arrow is left alone to bubble (so an enclosing scroll
region / page can act). Home and End additionally bail with an early `return` (no
`preventDefault`, no focus move) when `manager.focusedKey === null && e.shiftKey`:
Shift+Home/End has no anchor to extend a selection from.

**Resolved — gate the consume on a target** (`solidaria`, 2026-06-19). `createListBox`
previously called `e.preventDefault()` unconditionally at the top of each Arrow case
(and on every Home/End), so a standalone ListBox swallowed boundary arrows that moved
nothing — the same over-eager-consume class as the Escape fix above. Now `preventDefault`
for ArrowUp/Down and the horizontal ArrowLeft/Right runs only once `findNextEnabledKey`
returns a key; Home/End early-`break` when nothing is focused and Shift is held (the
guard is shift-specific — plain Home/End still enters at the first/last item). Tests in
`createListBox.test.tsx` assert the boundary no-`preventDefault` (Arrow + horizontal),
the wrap-on still-consumes case, the positive moves-focus `preventDefault`, and the
Shift+Home/Shift+End no-op. Changeset `listbox-nav-key-consumption.md` (patch solidaria).

`createMenu` carried the identical unconditional-`preventDefault` on its ArrowDown/Up
and Home/End (no ArrowLeft/Right here — submenu open/close lives in a separate trigger).
Same gate applied (`menu-nav-key-consumption.md`, patch solidaria): arrows consume only
when `findNextNonDisabledKey` returns a key; Home/End early-`break` on Shift with nothing
focused. Menu additionally handles PageDown/PageUp (geometry-based), which still
`preventDefault` unconditionally — gating those on a focused key + a found target is
deferred (see below), since it touches the `clientHeight` paging branch. ListBox has no
Page keys at all (also deferred below).

## Source-level behavioral sweep — open items (now ticketed)

The carried-forward sweep findings are now part of the **single backlog** in
[upstream-release-audit.md](./upstream-release-audit.md) — tickets **T-51…T-55**
(plus the typeahead capture-phase item folded into **T-35**, since the 1.19
`useTypeSelect` refactor is exactly that capture/bubble work). This doc keeps the
per-behavior **evidence** (the sections above); that doc holds the actionable tickets.
No second checklist lives here anymore. Old item → ticket map:

- **T-51** — `replace`-mode action model (architectural epic). Evidence: the
  `selectionBehavior: 'replace'` section above ("Not yet ported"). High risk /
  cross-hook; shares the item-hook press-path migration with **T-34**
  (`keyboardNavigationBehavior`) — sequence together.
- **T-52** — `select()` multiple-mode fidelity (`ctrlKey||metaKey` → platform-aware
  `isCtrlKeyPressed`; thread `pointerType` so touch/virtual forces `toggleSelection`,
  per `useSelectableItem.ts:174`). Bundle with T-51.
- **T-35** — **✔ ported** (2026-06-19): the 1.19 `useTypeSelect` refactor — capture/bubble
  split, `altKey` bail, `preventDefault`/`stopPropagation` on a char match, reset-on-no-match,
  unmount cleanup (changeset `typeselect-keydown-faithful-parity.md`). Evidence: the
  "Resolved — 1.19 keydown refactor (T-35)" note in the typeahead section above. _Only_ the
  true capture-phase binding (ref-based `addEventListener`) remains deferred — the live
  bubble path covers the observable behavior.
- **T-53** — **✔ ported** (2026-06-20): `escapeKeyBehavior: 'clearSelection' | 'none'`
  opt-out on `createListBox` (default `'clearSelection'`); `'none'` leaves Escape
  untouched. Evidence: the "Resolved — `escapeKeyBehavior` opt-out (T-53)" note in
  the "Escape key (ListBox)" section above. Changeset `listbox-escape-key-behavior.md`.
- **T-54** — PageUp/PageDown navigation gating (`createListBox` measures no paging
  geometry; `createMenu` `preventDefault`s its `clientHeight` paging unconditionally).

**Resolved:** typeahead collator-based matching — done 2026-06-19 (`solidaria`):
`getKeyForSearch` compares the leading substring with an `Intl.Collator`
(`usage: 'search'`, `sensitivity: 'base'`) from `createCollator`. See the typeahead
section above ("Resolved — collator matching").
