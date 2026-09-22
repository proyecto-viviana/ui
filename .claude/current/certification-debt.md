---
kind: reference
status: current
---

# Certification debt

Status: live reference.
Update when: the certified suite totals change, a named group is closed, or
the Site Gate axe finding changes.

The gates work. The port is not certified. This page names the failures by
**cause**, not by component × driver. The component × driver table is already
in the certified-summary reporter; it cannot tell you which single fix closes
the most cells.

Do not start component work from this page without re-running the suite.
Do not raise D3 / D13 thresholds. Do not revert `95d30443`. Do not change
Meter `role="meter progressbar"`.

## Where it stands, 2026-09-22

Certification Gates **35689146611** at `d6745471`, merge job `106625669687`:
**2146 passed, 27 failed, 4 skipped, 0 waived, 0 flaky** — the same 2177 tests
as the two runs in `## Counts` below, which are the 2026-09-18 snapshot and are
kept because the group map under `## Groups` is written against them. That job's
per-component table holds **107 components**, five with a failing row and the
other **102** green, and it is row-for-row identical to the table run
35668806426 at `b22a44eb` wrote, which this section used to head.

`d6745471` is not HEAD. Three commits stand between them and all three bear on
this page: `d997d01f` and `6031691e` (#497) give the ComboBox option upstream's
focus-visible answer, which is the defect behind the 22 rows below, and
`cd38e04e` (#578) rewrites the waiver patterns, which is why that job reports
`0 waived` where the same records now waive 5. Treat the table below as a
reading of `d6745471`. What is still owed is a `certified report` job at a sha
carrying both `cd38e04e` and #497's two; #578 owns that reading, and no seat
here can take it — the suite needs both stacks built across eight shards and
this checkout does not push.

The 27, from that job's own `### Unwaived failures` list rather than retyped.
Driver split: D1 6, D3 6, D9 6, D7 2, D10 2, D2 2, D13 2, D4 1.

| Component           | Drivers                       | n   | Ticket                      |
| ------------------- | ----------------------------- | --- | --------------------------- |
| `combobox-list`     | D1 6, D3 6, D9 6, D7 2, D10 2 | 22  | #497 — fix, never waived    |
| `picker-trigger`    | D13 2                         | 2   | #584 — waived to 2026-10-21 |
| `togglebutton`      | D2 1                          | 1   | #583 — waived to 2026-10-21 |
| `togglebuttongroup` | D2 1                          | 1   | #583 — waived to 2026-10-21 |
| `tabs`              | D4 1                          | 1   | #609 — waived to 2026-10-21 |

**None of the 27 is crash-class.** Every one is a behaviour or paint
difference against the pair oracle; nothing throws, nothing fails to render.
And none of the 39 group-A pressed-pixel rows below is in this list.

Four of the five components are waived in
`apps/comparison/e2e/certified-waivers.json`, which held `[]` until #578 — five
entries under three tickets. Measured against the 27 failure records run
35689146611 itself wrote, read out of its `certified-shard-{2,5,7,8}`
artifacts: **5 waived, 22 unwaived**, `waiverGateFails: true`, 0 load problems.
That run reported `0 waived` on those same records — the five patterns were
inert until `certifiedCaseTitle` became the one title builder.

One entry per case, five in all, since #578's review on 2026-09-22 — a single
entry cannot name the causes of two rows honestly, and #584's covered three
causes while describing one. Every pattern is anchored `^…$` on the whole
haystack, which starts with the file the case is **declared** in: for a
driver-declared case that is `e2e/drivers/…`, not the spec. The spec path sits
in the title, and the **project** sits in front of it — `chromium › certified/…`
— so a pattern that steps from the file straight to the spec matches nothing.
The breadth is no longer a claim: a test runs
every entry against Playwright's own `--list` discovery of all 2177 certified
cases and fails unless it matches exactly one.

That does not contradict the owner rule three sections down. A waiver here
changes no threshold and closes no ticket: it names a deferral, carries the
ticket's real board state and an expiry meaning the next release, discloses
every cause on the row, and stops waiving the moment the ticket closes or the
date passes. The expiry is the one part still approximate — no release date
exists anywhere in this tree, so the loader enforces a 60-day horizon
(`MAX_WAIVER_HORIZON_DAYS`) and the entries read `2026-10-21`; #610 owns
binding it to the release itself. The blocking `certified report` job still
exits 1, on #497's 22, until a run past `d997d01f` reads them again — see
group B.

## Counts

The 2026-09-18 snapshot. Two runs, same 2177 tests:

| Run                    | Command / source                                                                                                          | Passed |  Failed | Skipped | Waived | Flaky | Revision   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | -----: | ------: | ------: | -----: | ----: | ---------- |
| CI Certification Gates | run `35286043422`, `certified-summary-from-ci.md`                                                                         |   2051 | **122** |       4 |      0 |     1 | `3aeed2f9` |
| Local (this write-up)  | `apps/comparison` Playwright `e2e/certified`, 8 workers, `certified-summary.ts`; `generatedAt` `2026-09-18T01:38:58.245Z` |   2049 | **124** |       4 |      0 |     0 | `f3172f61` |

The local 124 is the inventory below. The extra 2 versus CI are group K
(Dialog leftover overlay). Every other group matches CI 122 one-for-one.

Driver split of the local 124: D3 68, D1 18, D9 12, D4 8, D2 8, D10 4,
D13 3, D7 2, D8 1.

Kind of the 124:

| Kind                                             | Count | Groups                                     |
| ------------------------------------------------ | ----: | ------------------------------------------ |
| Shared bug (one code path, many cells)           |    59 | A 39 + D 12 + F 8                          |
| Unported / pair-oracle miss                      |    63 | B 22 + C 21 + E 11 + G 4 + H 2 + J 2 + I 1 |
| Test asserting something upstream never promised |     0 | —                                          |
| Local-only isolation (not in CI 122)             |     2 | K                                          |

## Cheapest fix

**Group A — pressed-state pixel pair. One fix, 39 failures.**

Every one of those 39 is a D3 `pressed` screenshot on Button, ActionButton,
ToggleButton, or ToggleButtonGroup. Ratios are tiny (1–162 pixels). Zero
tolerance still fails them, and that is the bar. This is not ticket #240
(1lh icon sizing).

Next by count: B ComboBox selected paint (22), C Picker list 16px (21),
D Form size M (12), E Calendar dark wash (11). D is probably less code than
B or C; it is not the most cells.

## Groups

Cheapest first. Counts are from classifying the 124 unwaived titles in
`/tmp/certified-summary.local-124.json` (copy of the local
`certified-summary.json`) against the Playwright `error-context.md` files
those tests left. Unmatched after that pass: 0.

### A — Pressed-state pixel pair — 39

Shared bug.

| Component         | Driver |   n |
| ----------------- | ------ | --: |
| ToggleButtonGroup | D3     |  15 |
| ToggleButton      | D3     |  12 |
| Button            | D3     |   6 |
| ActionButton      | D3     |   6 |

Every error line is `· pressed screenshot mismatch`. Examples: Button
`accent-fill` dark 92/12096 (bounds ~59×31); ToggleButton `size-xl` dark
1/13776; ActionButton default dark 46/12576; ToggleButtonGroup compact
light 162/22464. Light and dark both fail. Default / quiet / selected /
emphasized / compact / justified / vertical / size-xl all fail the same
frame.

One pressScale / pressed-paint path. Do not raise the D3 threshold.

### B — ComboBox selected-option paint — 22

Unported paint on the selected row. All `combobox-list`. Not overlay crop
(ticket #248 is a different shape).

| Driver |   n | What the oracle compared               |
| ------ | --: | -------------------------------------- |
| D1     |   6 | `checkmarkSelected` `currentColor`     |
| D3     |   6 | pixel, selected-row band ~2.1–2.6%     |
| D9     |   6 | forced-colors, same checkmark color    |
| D10    |   2 | RTL, same checkmark color              |
| D7     |   2 | selected label “Pro” contrast vs React |

Checkmark color (D1 / D9 / D10): dark React `rgb(105, 149, 254)` vs Solid
`rgb(86, 129, 255)`; light React `rgb(39, 77, 234)` vs Solid
`rgb(59, 99, 251)`. D3 mismatch sits in the selected-row band (size-m dark:
1145/47872, bounds top 68–107), not a full-width overlay crop.

D7 still **AAA both sides**. Light selected label: React `rgb(19,19,19)` on
`rgb(225,225,225)` ratio 14.21 vs Solid `rgb(41,41,41)` ratio 11.13. Dark:
React `rgb(242,242,242)` on `rgb(50,50,50)` ratio 11.45 vs Solid
`rgb(219,219,219)` ratio 9.26. D7 fails because it diffs the React number,
not because WCAG fails.

ComboBox list D8 (target size) passed. Distinct from group C.

**Closed on this checkout, not yet on a run.** `d997d01f` (#497) gives the
option upstream's focus-visible answer, and the same shard under the same
command went **22 failed / 6 passed** to **26 passed** here. The head count
above still carries these 22 because run 35689146611 at `d6745471` predates the
commit.

### C — Picker list 16px short / options 16px wide — 21

Unported listbox geometry. All `picker-list`. Three options; Solid is
missing 8+8 list padding.

| Driver |   n | Delta                                      |
| ------ | --: | ------------------------------------------ |
| D1     |   6 | target height S 88→72, M 112→96, L 136→120 |
| D3     |   6 | `height delta` 16                          |
| D9     |   6 | forced-colors, same heights                |
| D10    |   2 | RTL, same heights                          |
| D8     |   1 | option width 192→208; height 32 matches    |

Open ticket #252 (virtualize ComboBox/Picker listboxes as S2) is a
candidate, not proof this is ListLayout.

### D — Form size shadowed by Button default `size: "M"` — 12

Shared bug. All `form`. D1 6 + D3 6 (size-s / size-l / size-xl × dark/light).
size-m Form cells passed.

D1: `grid-template-rows` second track is always `32px` (M). React S=`24px`,
L=`40px`, XL=`48px`. Example size-s dark: React `64px 24px` / height 108px
vs Solid `64px 32px` / height 116px. D3: `height delta` 8 (S, L) or 16 (XL).

S2 Button does `props = useFormProps(props)` then default `size = 'M'` only
when size is still undefined. Solid
`packages/solid-spectrum/src/button/Button.tsx` merges `{ size: "M" }`
before `useFormProps`; `useFormProps` returns the local value when it is
defined, so Form context never wins.

### E — Calendar / RangeCalendar dark-theme paint wash — 11

Unported dark tokens. D3 dark only (light passed). Calendar 6 + RangeCalendar 5. Shared bounds on the default cell: `left 39 top 41 right 248 bottom 267`,
~3.4–7.9% of 89280 px (Calendar default dark 3058/89280; RangeCalendar
default dark 7032/89280). Solid reads as light tokens on a dark canvas
(range highlight pale, numbers/nav dim).

### F — Disabled pointer `defaultPrevented` true vs false — 8

Shared bug. D4 disabled `mouse-click` + `touch-tap` on Button, ActionButton,
ToggleButton, ToggleButtonGroup (2 each). Solid `defaultPrevented: true`,
React `false`. Same press/click path; not a per-component event map.

### G — DatePicker / DateRangePicker enter translate Y+4 vs Y−4 — 4

Unported enter placement. D2 `open · open-enter` and the reduced-motion twin,
DatePicker and DateRangePicker (2+2). React `translate: "0px 4px"` vs Solid
`"0px -4px"`. Related to open ticket #251 (popover enter/exit), not proven
to be only that ticket.

### H — Picker trigger `data-focused` / `data-open` vs RAC — 2

Unported data attributes. `picker-trigger` D13 journeys
`open-arrow-enter-reopen-scroll-escape` step 0 and `keyboard-only` step 1.
Solid trigger carries `data-focused` + `data-open`; React trigger `data: {}`.
On `keyboard-only` step 1 the selected option is also missing React’s
`data-focus-visible`. Not group C (list height). Overlaps #254; does not
close it by itself.

### I — ComboBox Escape extra `onSelectionChange(null)` — 1

Unported event. `combobox-field` D13 journey CB-OC-03 step 5 (Escape). Solid
emits `onSelectionChange(null)` before `onOpenChange`; React does not.
`e2e/journeys/combobox.ts` types S, x, Backspace, Escape.

### J — ToggleButton reduced-motion hover still animates on React — 2

Unported (Solid is quieter than the oracle). D2 reduced-motion
`default · hover-transition` on ToggleButton and ToggleButtonGroup.
React still plays 150ms `background-color` / `color` transitions
(`cubic-bezier(0.45, 0, 0.4, 1)`). Solid: `[]`. The oracle is the live
React panel, so this is a pair miss, not a test inventing a promise.

### K — Dialog leftover overlay — 2 (local only)

Not in CI 122. D2 Dialog `modal-open · open-enter` and the reduced-motion
twin. `getByRole('dialog')` expected 0, received 1 after the enter sample.
Treat as isolation / exit until it reproduces on CI.

## What is not a group

- **A test asserting something upstream never promised:** 0 of 124. Every
  cell diffs the live Adobe panel or a computed contract taken from it.
- **Ticket #240 (1lh icons):** not group A. Those 39 are pressed-state
  pixels, including ToggleButton `size-xl` dark at 1/13776.
- **Ticket #248 (list transparency / misplacement):** not group B. ComboBox
  list PNGs place the list correctly; the miss is selected-row paint.
- **Meter `aria-allowed-attr`:** not in the 124. Site Gate only. See below.
- **Raising D3 / D13 thresholds or adding a waiver:** not a fix. Owner rule.

## Site Gate — WCAG 2.2 AA

Not contrast. Do not name two colors.

CI run `35291788795` (`site-gate`, HEAD `578b2f96`),
`vp run a11y:axe:aa` → `e2e/playground-axe.spec.ts` `-g "WCAG 2.2 AA"`.

- **Rule:** `aria-allowed-attr` (axe-core 4.13). Help: “Elements must only
  use supported ARIA attributes”. Impact: critical. WCAG 4.1.2.
- **Assertion:** `apps/web/e2e/playground-axe.spec.ts:135` in that revision
  (`logViolations` / `expect(results.violations).toEqual([])` inside the
  dark/light loop).
- **Element:** playground Meter,
  `<div id="solidaria-cl-713" … role="meter progressbar"
aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"
aria-valuetext="75%">`. Same class, 8 nodes (`solidaria-cl-713` …
  `solidaria-cl-727`; last node `aria-label="Progress"`).
- **Dark:** logged `[dark] WCAG 2.2 AA violations (1): aria-allowed-attr
(8 nodes)`, then two retries, then 1 failed. **Light:** the same test
  body is `[2/2]` in that job; serial describe, so light did not produce
  its own violation dump after dark failed. The nodes are not theme-specific.

axe-core 4.13 does not split the fallback token list `meter progressbar`,
so it rejects `aria-valuenow` / `min` / `max` / `valuetext` on a valid
meter. Upstream `useMeter` emits that role on purpose. The port matches
(`packages/solidaria/src/meter/createMeter.ts`). Unit axe already
`axe.configure`s `*:not([role="meter progressbar"])`.
`apps/web/e2e/examples.spec.ts` post-filters the same nodes.

**Correct fix:** post-filter `aria-allowed-attr` nodes whose live `role` is
`meter progressbar`. Do not change the role.

Applied in this change:

- `apps/web/e2e/playground-axe.spec.ts` — html-string filter (playground
  snippets include the role). Local `vp run a11y:axe:aa` after the filter:
  2 passed (dark and light WCAG 2.2 AA, 57.7s).
- `apps/comparison/e2e/comparison-axe.spec.ts` — same filter, plus a live
  `document.querySelector(target).getAttribute("role")` lookup, because
  comparison-axe truncates `node.html` before the role token. Comparison
  Meter route was not re-run in this write-up.

## How counted

- Local certified: `cd apps/comparison && stdbuf -oL -eL pnpm exec playwright
test e2e/certified --workers=8 --reporter=line
--reporter=./e2e/reporters/certified-summary.ts` after
  `node scripts/check-upstream-oracle.mjs --acquire` and
  `vp run comparison:build`. Host:
  `COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`.
- Group map: classify each of the 124 unwaived titles; confirm cause from
  `error-context.md` (pressed vs default, checkmarkSelected, height 16,
  `defaultPrevented`, translate Y, leftover dialog, …). Sum 124, unmatched 0.
- CI 122: parse failed cells from run `35286043422` certified report.
  Same groups as local except K = 0.
- Site Gate: job log `105435997427` and the downloaded dark
  `error-context.md`.
