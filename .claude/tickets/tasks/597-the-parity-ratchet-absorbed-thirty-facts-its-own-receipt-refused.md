---
id: 597
type: task
title: "The parity ratchet absorbed thirty facts its own receipt had refused, and only fourteen of them were ever classified"
created: 2026-09-21
parent: 544
status: verified
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings: `ratchets/parity-rebless-outruns-receipt` (high, confirmed) and `test-integrity/parity-baseline-re-blessed-against-own-finding` (low, partly). `2b444a89` moved `scripts/upstream-test-parity-baseline.json` by +30 under `--allow-growth 573`, and its message says all thirty were classified. Receipt `34064bae`, written just before it, concluded the opposite: the baseline is untouched, nothing re-blessed, no test file edited, because bucket 3 proved none of them wrong. Of the thirty, **14 were classified** - 7 literally, 7 more by the `role|form` group - and 16 were never examined. The 'wrong-shape bug' line in the message is about roles only, `check-upstream-test-parity.ts:25`",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "the skeptic narrowed the second finding and the narrowed version is what this ticket owns. Nothing is buried: the baseline's `growthLog` records ticket 573, the date and all thirty facts verbatim, `2b444a89`'s message names the nine artifacts, and #579 files the filename mis-pairing. The same commit also shrank `coverageGaps` and `upstreamOnly`. The receipt's stated condition was 'stop and tell me', not 'never absorb'. So the survivor is narrow and real: the oracle was made green by widening the allowlist rather than by fixing the mis-pairing, and sixteen facts entered a ratchet without anybody looking at them. Also carries `components-src/stale-pin-in-audit-brief` and `solidaria-src/upstream-pin-baseline`, which are the same subject from the other side: the brief handed to the audit fleet named S2 1.5.1 / RAC 1.19.0, the tree pins **1.7.0 / 1.21.0 / react-aria 3.52.0 / react-stately 3.50.0**, and the range was in fact graded against the tree's pin, so no verdict in the receipt is invalid",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "deferred to the release after the RC by the owner's soft-launch cut, see #544; the ticket keeps its owner and nothing here is waived or closed",
    }
  - {
      state: verified,
      at: 2026-10-07,
      note: "Fixture-owned roles are no longer filed on the host: a raw or imported form owns role form, a raw textarea owns role textbox, and an imported Dialog, ContextualHelp, or ContextualHelpTrigger owns role dialog. The omit re-measure moved suspects 242 to 234 with coverageGaps 44 and upstreamOnly 11 and added no fact. The baseline suspects list drops those eight, so the nine known-bogus pairs are absent rather than allowlisted; checkbox|role|form had already left under #579. The #573 growth entry keeps eighteen facts, each with a reason, and drops the twelve the re-measure or the #579 re-key made historical. The sixteen unread facts are classified below and in .agents/close-gates-2026-09-20.log.md; none is a wrong assertion. The synthetic missing-oracle fixture now quotes S2 1.7.0 and RAC 1.21.0, matching scripts/upstream-pin.json. upstream-sync.md already had the live pin. vp run guard:upstream-test-parity is green at suspects 234 to 234, coverageGaps 44, upstreamOnly 11.",
    }
---

## Scope

1. Examine the sixteen facts nobody looked at, and record the classification
   for each — the same shape `34064bae` used for the fourteen. A ratchet row
   that nobody has read is not a ratchet.
2. Fix the pairing rule in `check-upstream-test-parity.ts` so it pairs by the
   component a test renders rather than by the file's basename (#579 is the
   ticket for the rule; this is its first consumer). Then re-measure. The nine
   artifact facts should disappear rather than stay allowlisted.
3. Revert the growth that the re-measurement makes unnecessary, and leave in
   the `growthLog` only what survives with a reason attached.
4. Correct the pin wherever the campaign quotes it. The tree is right; the
   brief and the `installed-comparison-deps-lag-pin` memory entry are behind.
   No live document in `.claude/current/` carries the stale pin —
   `upstream-sync.md:13` already says 1.7.0 / 1.21.0 — so this is a brief-level
   fix, checked here and recorded in the audit receipt.

## Done when

`vp run guard:upstream-test-parity` is green at a baseline where every row has
a recorded classification, the oracle pairs by rendered component, and the nine
known-bogus pairs are gone rather than allowed.

## Proof

The re-measurement's output before and after the pairing fix, with the row
counts; the sixteen classifications; the diff of the `growthLog`.

## Relationship

Child of #544, stage S3. Blocks nothing and is blocked by nothing, which is
exactly why it has been easy to defer — and why it is written down with a stage
number. #579 owns the oracle's attribution rule; #573 is the commit this is
residue of; #577 is the general shape.

## The thirty, classified

The fourteen from `34064bae` stay classified in
`.agents/close-gates-2026-09-20.log.md` under `#573 — bucket 3 first`. Seven
are the `role|form` grips (`checkbox`, `combobox`, `numberfield`, `radiogroup`,
`searchfield`, `select`, `textfield`). Five more are `tabs|role|textbox`,
`searchfield|role|dialog`, `checkbox|role|img`, `combobox|role|presentation`,
and `select|role|presentation`. The receipt prose covers `tabs|aria|aria-hidden`
and `switch|aria|aria-checked`. None of them was a wrong assertion.

The sixteen nobody had read, same shape. Every answer is no.

| fact                                | our test asserts the wrong thing? | what it actually is                                                                                                                                                                                                                                                                |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colorfield\|key\|pageup`           | no                                | PageUp steps the color spinbutton, `solid-spectrum/test/ColorField.test.tsx:108-116`. `useSpinButton.ts:78`. RAC `ColorField.test.js` sends Enter at 143 and 157, not PageUp.                                                                                                      |
| `colorfield\|key\|pagedown`         | no                                | PageDown steps that same field back. `useSpinButton.ts:96`. RAC ColorField tests do not send PageDown.                                                                                                                                                                             |
| `numberfield\|key\|pageup`          | no                                | PageUp steps 5 to 6, `solid-spectrum/test/NumberField.test.tsx:44-50`. RAC `NumberField.test.js` sends Enter and asserts `aria-invalid` at 539, not PageUp.                                                                                                                        |
| `numberfield\|key\|pagedown`        | no                                | PageDown steps 6 to 5 in that same test. RAC NumberField tests do not send PageDown.                                                                                                                                                                                               |
| `colorswatchpicker\|key\|pageup`    | no                                | Roving tabindex PageUp without changing selection, `solid-spectrum/test/ColorSwatchPicker.test.tsx:178-221`. `useSelectableCollection.ts:425`. RAC `ColorSwatchPicker.test.js` sends Enter at 175 only.                                                                            |
| `colorswatchpicker\|key\|pagedown`  | no                                | PageDown in that same test, including the disabled-swatch skip. `useSelectableCollection.ts:424`.                                                                                                                                                                                  |
| `combobox\|key\|end`                | no                                | End moves to the last open option and keeps `aria-labelledby` resolved. `solid-spectrum/test/ComboBox.test.tsx:579-604` and `solidaria-components/test/ComboBox.test.tsx:385`. `useSelectableCollection.ts:433`. RAC `ComboBox.test.js:883` sends Escape, Enter, and Tab, not End. |
| `previewtrigger\|key\|tab`          | no                                | `user.keyboard("{Tab}")` moves focus into the preview, `solidaria-components/test/PreviewTrigger.test.tsx:189-232`. RAC `PreviewTrigger.test.js` is the pair; its `user.tab()` calls are not scored.                                                                               |
| `rangecalendar\|key\|enter`         | no                                | Enter sets the range start and advances focus, `solid-spectrum/test/RangeCalendar.test.tsx:248-264` and `solidaria-components/test/RangeCalendar.test.tsx:656`. RAC `RangeCalendar.test.tsx:557` is `aria-invalid` only and sends no Enter. No S2 RangeCalendar test.              |
| `taggroup\|key\|escape`             | no                                | Escape clears selection, `solidaria-components/test/TagGroup.test.tsx:882-901`. `useSelectableCollection.ts:360` and `:435`. RAC `TagGroup.test.js` sends Enter at 814, 827, 854, and 884, not Escape.                                                                             |
| `taggroup\|key\|tab`                | no                                | Shift+Tab through the tag and its remove button, `solidaria-components/test/TagGroup.test.tsx:693-721`. RAC `TagGroup.test.js:689` and `:694` are comments, so the key regex does not score them.                                                                                  |
| `datepicker\|aria\|aria-valuenow`   | no                                | Segment spinbuttons expose `aria-valuenow`, `solid-spectrum/test/DatePicker.test.tsx:314-331`. RAC `DatePicker.test.js:376` asserts the absence of `aria-expanded`, not `aria-valuenow`. No S2 DatePicker test.                                                                    |
| `dialog\|aria\|aria-controls`       | no                                | No longer measured after #579. `solidaria-components/test/Dialog.test.tsx:191-219` reads `aria-controls` on the trigger inside an outermost `DialogTrigger`, so the fact files under `dialogtrigger` and is not scored.                                                            |
| `form\|aria\|aria-invalid`          | no                                | Asserted on the input after a blocked required submit, `solid-spectrum/test/Form.test.tsx:488-508`. Filed under form because Form is outermost. RAC `Form.test.js` does not mention `aria-invalid`. Kept.                                                                          |
| `searchfield\|aria\|aria-expanded`  | no                                | The ContextualHelp button's expanded state, `solid-spectrum/test/SearchField.test.tsx:280`, in the same test as the dialog fixture. Kept.                                                                                                                                          |
| `table\|aria\|aria-multiselectable` | no                                | The grid sets it when `selectionMode` is multiple, `solidaria-components/test/Table.test.tsx:3078-3088`. `useGrid.ts:225`. RAC Table tests do not assert it.                                                                                                                       |

## What left the floor

#579 already pairs by the outermost rendered component. This slice does not
redo that rule. It stops filing a fixture-owned role on the host: role form
when the render mounts a raw or imported form and the subject is not form,
role textbox when the render mounts a raw textarea and the subject is not
textarea, and role dialog when the render mounts an imported Dialog,
ContextualHelp, or ContextualHelpTrigger and the subject is not that owner.
`form|role|form`, `searchfield|role|textbox`, and the presentation roles stay.

Before the omit the post-#579 floor measured suspects 242, coverageGaps 44,
upstreamOnly 11. After the omit, still against that baseline: suspects
242 → 234 (Δ-8), coverageGaps 44, upstreamOnly 11, and no new fact. The eight
that left the measurement are `combobox|role|form`, `numberfield|role|form`,
`radiogroup|role|form`, `searchfield|role|dialog`, `searchfield|role|form`,
`select|role|form`, `tabs|role|textbox`, and `textfield|role|form`.
`checkbox|role|form` was already unmeasured, because that test renders an
imported Form and the fact lives as `form|role|form`.

The suspects array drops those eight, 242 → 234. The nine known-bogus pairs
are absent from it. The #573 growth entry keeps the eighteen facts that still
hold, each with a `reasons` string, and drops twelve:
`checkbox|role|form`, `checkbox|role|img` (re-keyed to `checkboxgroup|role|img`
by #579), the six form roles still in the suspects list plus
`searchfield|role|dialog` and `tabs|role|textbox`, `switch|aria|aria-checked`
(now `tabswitch`), and `dialog|aria|aria-controls` (now under `dialogtrigger`).
Ticket 618 still records `datepicker|role|form` and `daterangepicker|role|form`.
The #579 growth entry is unchanged. After that edit,
`vp run guard:upstream-test-parity` reports suspects 234 → 234 (Δ0),
coverageGaps 44 → 44 (Δ0), upstreamOnly 11 → 11 (Δ0), PASS.

## Pin

`scripts/upstream-pin.json` stays at S2 1.7.0 / RAC 1.21.0. `.claude/current/upstream-sync.md`
already says that, and `.agents/audit-2026-09-21/OWNERS.md` already records the
brief correction. The synthetic missing-oracle fixture in
`scripts/test-ci-guard-contracts.mjs` was the in-repo quotation still on
1.5.1 / 1.19.0; it now quotes 1.7.0 / 1.21.0. The check still only requires a
non-zero exit that names `upstream-backed checks cannot run`. Dated comparison
comments, changelogs, and #82 stay as history. #601 is not closed here.
