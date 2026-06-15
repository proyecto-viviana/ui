# Proyecto Viviana — Harsh Review: Synthesis (2026-06-15)

Synthesis of 11 parallel evidence lanes (`01`–`11` in this folder). Standard: the
repo's own Rules #1–#7. Severity tally across lanes: **~24 Critical, ~40 High** —
but several Criticals are the _same root cause_ seen from different lanes (Menu
focus, `@ts-nocheck`, the missing CI gate ladder each recur), so the distinct
count is lower than the sum.

Headline claims below were re-verified by the orchestrator directly against source.

---

## The verdict

The documented standard is **Rule #1: "a certified port, or it isn't ported."**
The shipped reality is **"a plausible reimplementation that looks right in the dev
app, merged green because nothing checks otherwise."** The gap between those two
is the finding. `status.md` reports "strict green 69/69" while the type checker is
off in 35 files, the certification gates aren't in CI, 59/69 components have only
screenshot tests, and the flagship Menu is screen-reader-unusable. Per Rule #6,
the docs are overstating the code.

---

## Five structural wounds

### 1. The spine was reimplemented, not ported (Rule #4/#5, stack-wide)

The shared machinery upstream factors into one place is, here, missing or inert —
and re-hand-rolled inside each widget:

- **stately:** `Selection`/`SelectionManager` rewritten with a different
  anchor+current model (`createSelectionState.ts:241-269`); submenu state absent
  (`createMenuState.ts:112`).
- **solidaria:** no `useSelectableCollection`/`useSelectableList`/`useSelectableItem`,
  no `ListKeyboardDelegate`; every widget inlines its own arrow/Home/End
  (`createMenu.ts:201-406`); RTL arrow-flip absent.
- **components:** `useContextProps`/`useSlottedContext`/`composeRenderProps`
  exported with **zero call sites** (dead); `TextContext` is `createContext<null>(null)`
  and can't carry slots → description slot never wires → `aria-describedby` absent.

Each missing primitive becomes N divergent copies — Rule #5 "patch #50" at the
architecture level, and why the same bug (Menu focus) reappears identically across
widgets. **Fix:** port `SelectionManager`, `ListKeyboardDelegate`/`useSelectable*`,
and `useContextProps`/slot plumbing; delete the per-widget copies.

### 2. The flagship Menu is screen-reader-unusable (verified)

Two independent lanes (fidelity #02, APG #07) converged; verified in source. Arrow
keys call `state.setFocusedKey(...)` (`createMenu.ts:217-400`), flipping each
item's `tabIndex` 0/-1 (`createMenuItem.ts:159`) — the declarative half of roving
tabindex — but **nothing calls `element.focus()` and there is no
`aria-activedescendant`** in the menu module. Navigation moves state, never real
DOM focus or the AT cursor. The only `.focus()` calls in the menu surface are
`trigger.focus()` for close-restoration in ActionMenu. **Fix:** on focusedKey
change, imperatively focus the active element (or adopt aria-activedescendant).
~10 lines; the difference between "renders" and "accessible."

### 3. Ships unstyled / broken to real consumers; only looks right in the dev app

Two breakages, same shape — "works in apps/web, broken on npm":

- **Styling (#05):** macro engine is byte-identical to S2 (good), but 14 public
  components (ListBox/Select/Toolbar/Well/StepList/Separator…) bypass it and
  hand-author utility classes against **non-existent tokens** (`text-primary-200`,
  `bg-bg-400`) with no Tailwind/UnoCSS build. They render only because `apps/web`
  ships `local-utilities.css` backfilling the classes (`select/index.tsx:167-223`,
  `listbox/index.tsx:96-189`). On npm: unstyled. The comparison harness masks it
  by running in the same scaffolding.
- **Exports (#10):** 19 solid-spectrum sub-path exports missing from viviana-ui's
  map → `import … from "@proyecto-viviana/ui/Tabs"` throws for an installed
  consumer.

**Fix:** route every styled component through the macro (delete hand-authored CSS);
add the missing sub-path exports; point the harness at the _built package_ so
"looks right in dev" can't hide "broken on install."

### 4. Certification bar documented, not enforced; tests can't catch the drift (Rule #1/#7) — KEYSTONE

The mechanism by which all the above merges green:

- **Gate ladder absent from CI (#11):** zero CI invocations of `vp run check`,
  `guard:*`, `comparison:report:parity:strict`, `comparison:test:pair/contract`,
  `docs:check`.
- **Type checking off in the styled layer:** 35 solid-spectrum files `@ts-nocheck`
  (0 in all three lower packages — verified). `vp run typecheck` _does_ run in CI
  (via `build` in `release-readiness`) but passes green because `tsc` skips those
  35 files — the styled layer is unchecked. 13 lint rules `"off"` at
  `vite.config.ts:36-48` (incl. `no-floating-promises`, `no-unused-vars`), and
  `vp check` (lint) runs in no workflow.
- **Axe floor opt-in:** 5 WCAG scans `test.skip` unless `RUN_AXE=1` (verified);
  `test:e2e` passes with zero axe assertions.
- **Behavior dimensions unproven:** 59/69 components visual-only e2e (#09); 293/349
  documented states have no pair-diff (#11). The one live-region test is
  tautological (permits zero announcements, `Toast.test.tsx:407-411`); a calendar
  test asserts the known-wrong default alignment (`createCalendarState.test.ts:758-769`);
  a viviana-ui test green-lights a private component (#06).

**Fix:** make the gate ladder a required CI check — typecheck (after removing
`@ts-nocheck`), `vp run check`, `comparison:test:contract/pair`, ungated axe. Make
green mean what the docs say.

### 5. Invention where the rules say mirror (Rule #2)

Upper layers _add_ surface upstream lacks, so it certifies against nothing:

- **Picker** invents `value`/`defaultValue`/`onChange`/`renderValue`; S2 exposes
  only `selectedKey`/`onSelectionChange` (`picker/index.tsx:99-104`).
- **TreeView** grafts CardView's `selectionStyle`/`renderActionBar`/`overflowMode`
  onto a component whose only S2 prop is `onAction`.
- **viviana-ui** silently minted public names (Header/NavHeader/LateralNav — also
  dead code, confirmed by #06 _and_ #10) — Rule #3 violation.
- **i18n** is the same disease in the data layer: calendar cells hardcode English
  " selected" and omit "Today" (`createCalendarCell.ts:169-171`); grid has no
  accessible name; date segments drop the field label; 0 unit tests set a
  non-English locale (#09) so the drift is unprotected.

**Fix:** prune invented props to the upstream surface; route announcements through
the existing i18n string-formatter (already shipped — don't reinvent); add a
non-English locale to the contract suite.

---

## What's genuinely solid (keeping the read honest)

- Macro engine, theme, tokens, pressScale are **byte-identical to S2** (#05) — the
  hardest part is right.
- **viviana-ui does not fork** ARIA or state; it composes headless primitives and
  uses the macro correctly (#06). The behavior-boundary holds at the top.
- Headless **primitives are mostly correct** (#08): aria-describedby wiring, the
  intentional aria-modal omission; ListBox/ComboBox/Tree/Table/Tabs/TagGroup/
  Tooltip/Toast spot-checked clean (#07).
- The **standard itself is excellent** — Rules #1–#7, certification.md, ADR 0001,
  the comparison harness. The discipline isn't the problem; it isn't wired to CI.

## Two honest reconciliations

1. **viviana-ui → solidaria-components Button:** #10 flagged Critical, #06 said
   "not a fork." Verified: 4 natives import `Button as HeadlessButton`
   (conversation/chip/nav-header/event-card). **Not** a behavior fork (headless
   Button reused), but **is** a layer-skip past solid-spectrum. Severity: **High,
   not Critical.** Fix: add an unstyled Button passthrough in solid-spectrum and
   re-route.
2. **Version pin:** macro audit (#05) found the build targets S2 **1.3.0** while
   the vendored oracle is **1.1.0**. Structural findings unaffected; exact
   token-value claims are "vs 1.1.0." Re-pin the vendored tree to 1.3.0 before the
   next token audit.

---

## Fix only three things (in order)

1. **Wire the gate ladder into CI and turn type checking back on** — remove the 35
   `@ts-nocheck`, run typecheck + `vp run check` + ungated axe as required checks.
   Without this, nothing else stays fixed. (#11, #04, #10, #09)
2. **Port the three spine primitives** — SelectionManager, ListKeyboardDelegate/
   useSelectable\*, useContextProps/slots — and delete the per-widget copies.
   Closes the most Criticals at once: Menu focus, aria-describedby, selection
   drift together. (#01, #02, #03)
3. **Make "ships correctly" true** — route all styled components through the macro
   (delete hand-authored utility CSS), add the 19 missing sub-path exports, point
   the comparison harness at the built package. (#05, #10)

Everything else — calendar alignment, RangeSlider, invented Picker/TreeView props,
RTL coverage — is real but downstream of these three.
