---
kind: process
status: current
---

# Upstream sync — pinning and absorbing React Spectrum releases

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

Current pin (2026-06-16): `@adobe/react-spectrum@3.47.1`, commit `791377f`,
`@react-spectrum/s2@1.4.0`, `react-aria-components@1.18.0`.

The tree is materialized as a **shallow checkout at the tag** (nested `.git`),
which makes release-to-release diffing first-class. `guard:upstream-test-parity`
prints a **DRIFT** banner when the actual vendored versions don't match the pin —
so "I don't think the vendored copy is the latest" is now a one-command check.

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

4. **Re-run the mechanical gates** against the new spec:
   ```bash
   vp run guard:upstream-test-parity   # contract-vocabulary diff (this doc)
   vp run guard:rac-parity
   vp run guard:rac-export-gap
   vp run guard:dnd-keyboard-parity
   vp run guard:virtualizer-keyboard-parity
   ```

5. **Triage** every newly-flagged (or newly-resolved) component against the
   authoritative upstream source, and update that component's validation note
   under Gate 3 (Upstream React Source Parity) in
   `../../apps/comparison/playbook/components/`.

6. **Bump `scripts/upstream-pin.json`** (tag, commit, versions, `pinnedAt`) in the
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
- **calendar** / **rangecalendar** — we never assert the grid structure (`row, rowgroup, gridcell, option, columnheader`). Add it.
- **tree** `{menu, rowgroup, rowheader}`, **datepicker**/**daterangepicker** `{grid, gridcell, textbox}`, **dialog** `{gridcell, group, menuitem}`, **tabs** `{button, tooltip}`, **toolbar** `{checkbox, link, textbox}`, **taggroup** `{group, tooltip}`.
- COVERAGE-GAPS section (no role overlap at all): **gridlist, tooltip, colorswatch, selectboxgroup, filetrigger, dropzone**.
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
- [ ] **2. calendar / rangecalendar** — port grid structure (`row, rowgroup, gridcell, option, columnheader`).
- [ ] **3. tree / datepicker / daterangepicker / dialog / tabs / toolbar / taggroup** — port the per-component `upstream-only` roles listed in Bucket D.
- [ ] **4. no-overlap components** — gridlist, tooltip, colorswatch, selectboxgroup, filetrigger, dropzone (no role overlap at all today).
- [ ] **5. unmatched (no port test exists)** — actionbuttongroup, coachmark, color{area,picker,slider,wheel}, customdialog, group, hiddendateinput, labeledvalue, virtualizedmenu. Decide port-vs-skip per component.

For each remaining item, the verdict is still **component-wrong vs test-wrong**:
read upstream source first, then either fix the component (+ changeset) or add
the missing assertion. Record the outcome on the matching Bucket line above.

See `certification.md` (Gate 3) for where this guard sits in the ladder.
