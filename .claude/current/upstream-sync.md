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
`vp run guard:upstream-test-parity`. **17 is a ceiling, not a bug count** — the
first pass of triage (confirming each against source) found *zero* confirmed bugs
so far and reclassified the flags into the buckets below. The headline lesson:

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
test doesn't, and there's no S2 unit test to anchor it → confirm against S2
**source**, then record as an intentional local extra in the validation note).
- **breadcrumbs** [42] `{navigation, menu, menuitem, button}` — the S2 collapse-to-overflow-menu + nav landmark.
- **button** [20] / **select** [20] `{progressbar}` — S2 `isPending` spinner / async-loading list.
- **disclosure** [30] `{group, region}` — DisclosureGroup wrapper + disclosure panel.

**Bucket C — field-wrapper role nuances to reconcile** (the `upstream-only` side
is the signal: upstream asserts a `group` role on the field we may not).
- **datefield** [23] / **timefield** [20] — we-only `{button, presentation}` ‖ upstream-only `{group}`.
- **numberfield** [17] `{spinbutton}` ‖ `{group, textbox}`; **searchfield** [15] / **popover** [17] `{textbox}`; **menu** [12] `{presentation}`.

**Bucket D — genuine coverage gaps (`upstream-only` roles we never assert)** —
the most actionable real work; port the upstream structural assertions.
- **autocomplete** [10] — we assert only `combobox`; upstream covers `searchbox, menu, menuitem, textbox, group, separator, button, dialog`. Far thinner — port it.
- **calendar** / **rangecalendar** — we never assert the grid structure (`row, rowgroup, gridcell, option, columnheader`). Add it.
- **tree** `{menu, rowgroup, rowheader}`, **datepicker**/**daterangepicker** `{grid, gridcell, textbox}`, **dialog** `{gridcell, group, menuitem}`, **tabs** `{button, tooltip}`, **toolbar** `{checkbox, link, textbox}`, **taggroup** `{group, tooltip}`.
- COVERAGE-GAPS section (no role overlap at all): **gridlist, tooltip, colorswatch, selectboxgroup, filetrigger, dropzone**.
- UNMATCHED, no port test exists: **actionbuttongroup, coachmark, colorarea/picker/slider/wheel, customdialog, group, hiddendateinput, labeledvalue, virtualizedmenu**.

**Already clean.** **toast** (upstream-only `{alert}` is the alert/status variant;
aria-only) and **taggroup** are role-clean — the earlier `listbox`/`Dismiss`
reconciliations hold. (That original Toast divergence lived in the **E2E** specs,
not these unit tests — see the "unit tests only" limit above.)

See `certification.md` (Gate 3) for where this guard sits in the ladder.
