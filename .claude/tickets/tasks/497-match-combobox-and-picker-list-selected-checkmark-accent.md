---
id: 497
type: task
title: "Match ComboBox and Picker list selected-checkmark accent"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement overlay-list-checkmark-accent: checkmark call { isSelected, isFocused, size }; isFocused drives accent focused stop; option isFocusVisible aligned to isFocused after pointer-open",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "ComboBox/Picker list selected checkmark and label match S2 baseColor stops. Pointer-open React keeps data-focus-visible on the focused row; Solid did not. Checkmark still takes { isSelected, isFocused, size } only (class, not icon styles, flexShrink 0). Option keeps hover/press; isFocusVisible := isFocused || isFocusVisible. No isFocused: accent on the option macro. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: combobox D1 6 / D7 2 / D9 6 passed; combobox D3 6 failed compositor class (size-s dark 0.25493421052631576 9920/38912, same as CI retry-1, not the 0.022 color band); picker D1+D3+D7+D9 20 passed. Slice 3 icon size not taken (picker D3 exact-pair). Waivers []. git diff --check clean. Did not start #498/#499/#511.",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "remainder after independent test fail: ComboBox D3 overlay-wide ~0.25 was the D3 clone frame contained by the lower ComboBox portal (CDP clipped site chrome at 0,0), not the option isFocusVisible remap. Picker overlay sits higher so the sibling probe still painted.",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "ComboBox D3 exact-pair: D3 clone probe mounts on document.body and copies color/color-scheme. ComboBox option isFocusVisible := isFocused || isFocusVisible kept (D7 Pro ink; React pointer-open listboxItem still paints the selected-row ring). Checkmark still { isSelected, isFocused, size } only. Picker product untouched. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: ComboBox list D1+D3+D7+D9 20 passed; Picker list D1+D3+D7+D9 20 passed. Waivers []. git diff --check clean. Did not start #498/#499/#511. No knownDivergence.",
    }
  - {
      state: next,
      at: 2026-09-21,
      note: "reopened: regressed in combobox only. Certification Gates run 35554086311 on 1a98e250 reports the same four pairs under the same inner label `default · checkmarkSelected`, 22 combobox-list rows. b33a0a74 (2026-09-15) replaced the fix's second half with `const isFocusVisible = () => isFocused() && isFocusVisibleModality()` at packages/solid-spectrum/src/combobox/index.tsx:672, so a pointer-open drops data-focus-visible and the checkmark falls back to the default accent stop. Picker keeps both halves (picker/index.tsx:489 and :1178) and its checkmark passes. Not token drift: our spectrum-theme accent mapping is byte-identical to @react-spectrum/s2 1.7.0 and matches @adobe/spectrum-tokens 14.15.0, so #240 is not implicated. Evidence: .agents/certified-169-census-2026-09-21.md.",
    }
  - {
      state: merged,
      at: 2026-09-22,
      note: "combobox half landed; picker product untouched, as the reopened scope says. Cause, measured rather than inferred: `useOption` returns `isFocused && selectionManager.isFocused && isFocusVisible()` - a read of the GLOBAL interaction modality at render, with no ring of its own - and RAC `ListBoxItem` hands that one value to both `listboxItem` and `checkmark` (`@react-spectrum/s2` `ComboBox.tsx:470` and `:505-512`, `Menu.tsx:252-256`). Our `createOption` instead ANDs a per-element `createFocusRing()` (`packages/solidaria/src/listbox/createOption.ts:178,225,242`), which virtual focus never sets because a ComboBox option never takes DOM focus - `aria-activedescendant` carries it. On the certified list panel after the pointer open the React row carries `data-focus-visible` and ours carries none, so React paints one `baseColor` stop up on both the row ink and the checkmark: checkmark dark `rgb(105,149,254)` vs `rgb(86,129,255)`, light `rgb(39,77,234)` vs `rgb(59,99,251)`; D7 row ink dark `rgb(242,242,242)` vs `rgb(219,219,219)`, light `rgb(19,19,19)` vs `rgb(41,41,41)`. Fix: `ComboBoxOption` recomputes upstream's answer once and spreads it into both atoms (`packages/solid-spectrum/src/combobox/index.tsx:1258-1289`). Neither atom moved and both stay byte-faithful to S2 - `comboBoxOption` mirrors `listboxItem`, `comboBoxCheckmark` keeps plain `color: baseColor('accent')` plus `b33a0a74`'s S2 token size map - and `ComboBoxItem` is an alias of `ComboBoxOption`, so one fix covers both. This restores the 2026-09-07 decision `isFocusVisible := isFocused || isFocusVisible` that `b33a0a74` removed. PROOF, cwd /home/emoporemilio/projects/viviana-hub/ui, WSL `COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer` from `.env.local`, heavy lock taken and released around each heavy command; same command both times: `cd apps/comparison && VIVIANA_GATE=1 npx playwright test e2e/certified/combobox.certified.spec.ts --grep 'ComboBox list' --reporter=line`. Pre-fix **22 failed / 6 passed (2.1m), exit 1**; that run listed 28 tests because a temporary probe spec was still on disk, so of the 26 certified cases 22 failed and 4 passed (D5 focus trail, D6 AX, D8 target size, D10 RTL focus trail) and the 2 extra passes were the probe, since deleted. Every failure carried the same inner label `default · checkmarkSelected`. Post-fix, after `VIVIANA_GATE=1 vp run comparison:build` (exit 0, `0/33 cache hit`): **26 passed (1.8m), exit 0** - 22 of 22 green, none left red, and the 4 already green stayed green. Brief-vs-tree disagreement, tree wins: the reopened note points at `combobox/index.tsx:672`, which at HEAD is `ComboBoxFieldGroup` - a different half of `b33a0a74`, and right as it stands; what `b33a0a74` actually removed is this option remap plus the checkmark atom's `isFocused: baseColor('accent').isFocusVisible` override. viviana-ui: no change. `scripts/layer-boundary-baseline.json` lists `combobox/index.tsx` as a diverged fork and the register does not share the gap - its option ink already lifts on `isFocused` (`packages/viviana-ui/src/combobox/index.tsx:485-487`), the remap never existed there (`git show b33a0a74^`), and it has no pair oracle. `vp run guard:layer-boundary` exit 0, 524 identical / 84 diverged, 0 new forks, 0 unbaselined. Left open for a headless ticket, measured here: `packages/solidaria/src/interactions/createInteractionModality.ts:113-115` opens `handleClickEvent` with `if (!e.isTrusted) return;`, added by `61b7b7f4` with no comment, where react-aria's `useFocusVisible.ts` has no such guard - so a `detail: 0` click, which is what an AT click is and what `clickLocator` dispatches, puts upstream in `virtual` modality and leaves ours in `pointer`. While that guard and the per-element ring in `createOption` stand, the styled layer is the only place the answer can be corrected: a faithful `isFocused && isFocusVisibleModality()` written here evaluates false in our stack and would have left all 22 red. Residual, stated rather than hidden: after a real mouse click ours now paints the focused stop where upstream would not; the keyboard case, the common one, is right and was wrong before. `certified-waivers.json` stays `[]` and `certified-case-floor.json` is untouched. Changeset `.changeset/combobox-option-focus-visible-modality.md` for `@proyecto-viviana/solid-spectrum`; `vp exec tsx scripts/check-changeset-required.mjs` exit 0, `vp lint` on the changed file exit 0, `git diff --check` clean. Merged rather than verified because this seat does not push, so the next `certified report` job at the pushed sha owns the head count.",
    }
  - {
      state: merged,
      at: 2026-09-22,
      note: "second review of `d997d01f`: two of its statements were wrong and are corrected here, and the fix is now guarded. CORRECTION 1, the cause. The note above says our `createOption` ANDs a per-element `createFocusRing()` that virtual focus never sets. Measured in jsdom on this tree, with the remap removed: a keyboard-opened ComboBox option carries `data-focus-visible`, so the ring IS armed under virtual focus - `ListBox` mirrors the focused key onto the option with `moveVirtualFocus` (`packages/solidaria-components/src/ListBox.tsx:676`) and its synthetic focus event drives `createFocus`. The sole cause is the modality read: `packages/solidaria/src/interactions/createInteractionModality.ts:113-115` drops untrusted clicks, react-aria 3.52.0 does not (`handleClickEvent` read from the pinned source map: `if (!openLink.isOpening && isVirtualClick(e))`, no `isTrusted`), and `isVirtualClick` covers `detail === 0`, which upstream's own comment calls `Keyboards, Assistive Technologies, and element.click()`. A pointer-opened option is therefore focus-visible upstream and not here. CORRECTION 2, the residual. The note above says ours now paints the focused stop after a real mouse click where upstream would not, and leaves the reader to assume hover ink. Hover ink does not diverge: `baseColor`'s hovered, focused and pressed stops all resolve through the same state-independent `nextColorStop` (`packages/solid-spectrum/src/style/spectrum-theme.ts`, as S2 1.7.0 does), so a hovered row is identical on both sides. What diverges is `focusRing()`'s 2px outline plus the lifted ink a mouse-focused row keeps once the pointer has left it. That was undisclosed; it is now an entry under group B of `.claude/current/certification-debt.md`. GUARD. `d997d01f` landed with no test, which is how `b33a0a74` deleted the same remap unnoticed six days earlier. `packages/solid-spectrum/test/ComboBox.test.tsx` now holds `paints a pointer-focused option and its selected checkmark at the focus stop`: pointer open, `defaultSelectedKey=2`, class-atom assertion on the selected row and its checkmark, focused vs the same row once `{ArrowUp}` moves focus off. It has to be the pointer open - under a keyboard open `createOption` already answers focus-visible on its own, so the remap changes nothing there and nothing there could catch its removal. PROOF, cwd /home/emoporemilio/projects/viviana-hub/ui, same command both times, `vp test run packages/solid-spectrum/test/ComboBox.test.tsx --maxWorkers=2`: with `optionFocusVisible` neutered to `return renderProps` (pre-fix), **1 failed / 32 passed, exit 1**, red on both halves - checkmark focus-stop atoms `expected 1, got 0` and the row differing by exactly the one `backgroundColor.isFocused` atom; restored, **33 passed, exit 0**. `vp test run packages/solid-spectrum/test/Picker.test.tsx --maxWorkers=2` 22 passed, exit 0. The assertion keeps declaration atoms only: the macro prefixes its dev `-macro-dynamic-` markers and its custom-property atoms with `-`, and the checkmark's `--iconPrimary` `forcedColors` value already moves on `isFocused` alone, which would have answered the assertion without saying anything. DUPLICATE. The remap was written out twice, in combobox and picker. It now lives once, in `packages/solid-spectrum/src/utils/option-focus-visible.ts`, an internal module - not in the package `exports`, not a vite entry, not re-exported from `src/index.ts`, so no public name is minted - carrying the rationale, the divergence and the ticket that ends it. Both call sites spread it. Picker keeps its second, non-S2 mechanism, `pickerCheckmark`'s `isFocused: baseColor('accent').isFocusVisible` (`packages/solid-spectrum/src/picker/index.tsx:489`); removing it is #612's, since it changes picker paint and the reopened scope says picker product is untouched here. viviana-ui, measured rather than asserted this time: `comboBoxOption` lifts the row ink on `isFocused` (`packages/viviana-ui/src/combobox/index.tsx:485-487`), but `comboBoxCheckmark` is plain `baseColor('accent')` spread with raw render props (`:543,1285`), so the register's checkmark does sit at the default stop while the row is pointer-focused. That is not a defect to fix here: the register has no pair oracle, its focus signal is the row ink, and the stop is its own design choice - but #612 moves the modality globally and will lift that checkmark too, which is named in its blast radius. CHANGESETS. Two unreleased changesets described this surface in contradicting terms; `.changeset/combobox-option-focus-visible-modality.md` is deleted and `.changeset/combobox-option-focus-visible.md` now carries one statement, with the mouse-click divergence and #612 in it. Released 0.7.0 (`a2e5220c`) already had both halves of the 2026-09-07 fix, so the net change a consumer sees here is the atom cleanup, not a new paint. `vp exec tsx scripts/check-changeset-required.mjs` exit 0. `#612` filed for the one-line headless fix and the three styled compensations it deletes. Waivers: this ticket adds none. `apps/comparison/e2e/certified-waivers.json` is not `[]` as the note above says - it holds five entries since #578 (#584 x2, #583 x2, #609, all expiring 2026-10-21) and none is a combobox row. `## Done when` above was still the 40-title text from 2026-09-07 and is rewritten to the reopened 22-row scope. Not re-run here: the certified shard, unchanged since `d997d01f` proved it; `merged`, not `verified`, because this seat does not push.",
    }
---

Certification Gates run [34155176389](https://github.com/proyecto-viviana/ui/actions/runs/34155176389) on `0d84b016`: **40** unwaived titles, one paint miss.

ComboBox list and Picker list fail D1, D3, D7, and D9 on the selected checkmark. D1/D9 inner label is `default · checkmarkSelected`. Light computed `border-*-color` is React `rgb(39, 77, 234)` vs Solid `rgb(59, 99, 251)`; dark is `rgb(105, 149, 254)` vs `rgb(86, 129, 255)`. D3 is gesture `default` (not pressed): mismatchRatio ~0.022–0.026, `maxChannelDelta` 173–226. D7 size-m contrast is 14.21 vs 11.13 light and 11.45 vs 9.26 dark.

This is not the #489 field-root class (those D1 cells are 0-failed). D10 on the same lists is a different miss (#498). Picker D5 arrow-roving is #499.

## Titles (40)

- combobox-list D1/D3/D9: size-s|m|l × dark|light (18)
- combobox-list D7: size-m × dark|light (2)
- picker-list D1/D3/D9: size-s|m|l × dark|light (18)
- picker-list D7: size-m × dark|light (2)

## Work

Find the selected-item checkmark / accent token in `solid-spectrum` listbox option styles (style macro, ADR 0001) and match S2. Prove with focused `vp exec` D1+D3+D7+D9 on `combobox` and `picker` list cases. Do not patch comparison CSS.

## Done when

The 22 `combobox-list` rows of the reopened scope below — not the 40 of 2026-09-07,
whose picker half closed — are green on a named certified run at or past
`d997d01f`. Locally, the styled guard holds them: `paints a pointer-focused option
and its selected checkmark at the focus stop` in
`packages/solid-spectrum/test/ComboBox.test.tsx` fails if the remap goes.
No `.comparison-spectrum-*` component rule and no threshold moved. This ticket
adds no waiver; `apps/comparison/e2e/certified-waivers.json` holds five entries
since #578, none a combobox row, and a sixth would need the owner.

## Reopened scope, 2026-09-21

Combobox only, 22 rows. Picker's half of the original 40 is green; picker-list's
21 reds on run 35554086311 are a different defect — one property, `height`, 16px
short at every size in both schemes, no accent colour anywhere in the shard — and
they do not belong to this ticket.

## Relationship

Triage class of #493. Sibling under #136 because scheme v1 / `validateTicketBoard` rejects a task parent. Distinct from #498 (overlay RTL dir) and #499 (D5). Does not absorb #490.
