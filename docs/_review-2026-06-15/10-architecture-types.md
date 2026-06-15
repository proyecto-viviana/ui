# Architecture / Layer Boundaries + Type & Code Hygiene — Review 2026-06-15

Reviewer lane: 10 of 11 parallel reviewers.
Standard: AGENTS.md Rule #4 (layer chain; S2 styling in solid-spectrum only) and Rule #3
(names with reach are owner-steered), plus Rule #5 (structure not patches).
Scope: `packages/*` source only; `react-spectrum/` ignored.

---

## Findings (worst-first)

### [Critical] viviana-ui bypasses solid-spectrum and imports directly from solidaria-components

- **Evidence:**
  - `packages/viviana-ui/src/custom/conversation/index.tsx:3` — `import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components"`
  - `packages/viviana-ui/src/custom/chip/index.tsx:3` — same
  - `packages/viviana-ui/src/custom/nav-header/index.tsx:3` — same
  - `packages/viviana-ui/src/custom/event-card/index.tsx:3` — same
  - `packages/viviana-ui/package.json` — `"@proyecto-viviana/solidaria-components": "workspace:*"` listed as a production dependency (confirmed).
- **Why:** Rule #4 mandates one direction only: `solid-stately → solidaria → solidaria-components → solid-spectrum → @proyecto-viviana/ui`. `viviana-ui` reaching directly into `solidaria-components` skips the solid-spectrum layer and uses a raw headless Button with no S2 wrapper, meaning any button-level ARIA / state contract changes in `solidaria-components` bypass the styled-layer firewall. The four components are product-facing and ship in the public package.
- **Fix:** Introduce a `PressableButton` (or reuse the existing `ButtonContext` / unstyled variant) in `solid-spectrum` that wraps the `solidaria-components` `Button` with the correct context wiring, then have the four `viviana-ui` custom components import from `@proyecto-viviana/solid-spectrum` only. Remove `solidaria-components` from `viviana-ui/package.json` `dependencies` once no import remains.

---

### [High] solid-spectrum has 35 files with `@ts-nocheck` at line 1 — type checking disabled in the styled layer

- **Evidence:**
  - Total `@ts-nocheck` files: `packages/solid-spectrum/src/` — **35 of 593** source files (~6%).
  - Style subsystem (6 files): `style/style-macro.ts:1`, `style/types.ts:1`, `style/spectrum-theme.ts:1`, `style/runtime.ts:1`, `style/tokens.ts:1`, `style/index.ts:1`.
  - Component files with `@ts-nocheck` (29 files, selected): `calendar/DatePicker.tsx:1`, `calendar/DateField.tsx:1`, `calendar/DateRangePicker.tsx:1`, `calendar/TimeField.tsx:1`, `calendar/index.tsx:1`, `calendar/RangeCalendar.tsx:1`, `combobox/index.tsx:1`, `picker/index.tsx:1`, `textfield/index.tsx:1`, `textfield/TextArea.tsx:1`, `textfield/s2-textarea-styles.ts:1`, `gridlist/index.tsx:1`, `numberfield/index.tsx:1`, `slider/index.tsx:1`, `slider/RangeSlider.tsx:1`, `radio/index.tsx:1`, `checkbox/index.tsx:1`, `card/index.tsx:1`, `cardview/index.tsx:1`, `tag-group/index.tsx:1`, `switch/ToggleSwitch.tsx:1`, `tabs/TabsPicker.tsx:1`, `searchfield/index.tsx:1`, `button/s2-button-styles.ts:1`, `button/s2-action-button-styles.ts:1`, `button/s2-progress-circle-styles.ts:1`, `menu/s2-menu-styles.ts:1`, `s2-internal/style-utils.ts:1`, `s2-internal/page.macro.ts:1`.
  - Annotated reason (where given): "style-system types need a dedicated pass; removing this would require fixing ~20 style-definition type mismatches unrelated to component behavior."
  - Additional explicit `any` count in solid-spectrum (`: any` / `as any` / `<any>`, excluding `keyof any`): **36 sites** across component and style files.
- **Why:** `@ts-nocheck` silences the entire TypeScript compiler for those files. In the styled layer — where component API contracts, style macro types, and S2 token bindings all meet — type errors are the primary signal that a port diverged from upstream or that a prop contract broke. Rule #1 (certified port) depends on the type system as a first-pass correctness layer. 35 silenced files make it impossible to know whether API changes compile.
- **Fix:** Create a tracked issue (`docs/adr/` or `.claude/current/`) that names the style-system types pass as a first-class workstream. Methodically remove `@ts-nocheck` file by file, starting with the style subsystem (`style/style-macro.ts`, `style/types.ts`) where the `any` density is highest (23 of 36 total hits), then calendar components. Each file removed should be gated on a green `tsc --noEmit`. Do not batch-remove without fixing the errors.

---

### [High] viviana-ui package.json sub-path export map is incomplete: 19 paths present in solid-spectrum are absent from viviana-ui

- **Evidence:**
  - Sub-paths in `packages/solid-spectrum/package.json` exports but absent from `packages/viviana-ui/package.json` exports: `./ActionMenu`, `./Breadcrumbs`, `./Calendar`, `./Card`, `./CardView`, `./ColorArea`, `./ColorField`, `./ColorSlider`, `./ColorSwatch`, `./ColorSwatchPicker`, `./ColorWheel`, `./Disclosure`, `./GitHubIcon`, `./ListView`, `./Menu`, `./RangeCalendar`, `./Tabs`, `./TreeView`, `./style/runtime`.
  - The `viviana-ui` `"."` barrel does `export * from "@proyecto-viviana/solid-spectrum"` so the named symbols resolve; but any consumer writing `import { Tabs } from "@proyecto-viviana/ui/Tabs"` (sub-path import) gets a `ERR_PACKAGE_PATH_NOT_EXPORTED` runtime error.
- **Why:** Rule #3: public API surface for a package consumers depend on must be consistent and complete. A consumer cannot tree-shake to a specific component path, and the discrepancy is invisible at development time if they happen to use the barrel.
- **Fix:** Add the 19 missing sub-path entries to `packages/viviana-ui/package.json` `exports`, mirroring the solid-spectrum pattern (add `.ts` stub files that `export * from "@proyecto-viviana/solid-spectrum/ComponentName"`). The `./style/runtime` entry should also be added since it is used by the macro system.

---

### [Medium] Three complete viviana-ui custom components are invisible: no export stub, no exports-map entry

- **Evidence:**
  - `packages/viviana-ui/src/custom/header/index.tsx` — 64 LOC, complete `Header` component.
  - `packages/viviana-ui/src/custom/nav-header/index.tsx` — 98 LOC, complete `NavHeader` component (imports HeadlessButton directly — also a Critical violation above).
  - `packages/viviana-ui/src/custom/lateral-nav/index.tsx` — 131 LOC, complete `LateralNav`/`NavSection`/`NavLink`/`NavItem` components.
  - No `Header.ts`, `NavHeader.ts`, or `LateralNav.ts` stub files exist in `packages/viviana-ui/src/`.
  - None of the three appear in `packages/viviana-ui/package.json` exports map.
  - The `packages/viviana-ui/src/index.ts` barrel does not re-export them.
  - They are accessible only via direct path in tests: `packages/viviana-ui/test/CustomInteractions.test.tsx:7` — `import { NavHeader } from "../src/custom/nav-header"`.
- **Why:** Rule #3: if these are intended package exports they must appear in the exports map. If they are dead code, they should be deleted. Shipping code that is unreachable by package consumers (and invisible to lint tooling that scans the exports map) is patch-as-structure: the components exist as half-formed deliverables with no published surface.
- **Fix:** Decide: (a) publish — add stub `.ts` files and exports-map entries; or (b) delete (or move to `apps/comparison/`) if these are not intended to be shipped. Either way, resolve the dead-code ambiguity.

---

### [Medium] solid-spectrum non-style component files: @ts-nocheck applied to avoid component-level type errors (acknowledged but undated debt)

- **Evidence:**
  - `packages/solid-spectrum/src/calendar/DatePicker.tsx:1` — comment: "style-system types need a dedicated pass; removing this would require fixing ~20 style-definition type mismatches unrelated to component behavior."
  - Same pattern in `DateRangePicker.tsx:1`, `DateField.tsx:1`, `TimeField.tsx:1`.
  - These are the calendar component layer (not the style subsystem), meaning the component-specific prop types and JSX bindings are also unchecked.
- **Why:** The calendar components are among the most complex; DatePicker/DateRangePicker each exceed 850 LOC. Unchecked prop contracts at this complexity mean type regressions will surface only at runtime. Separately itemized from the style-system `@ts-nocheck` because the fix path is different (component generics vs. macro types).
- **Fix:** Create a focused fix branch for the four calendar files. Start with `DateField.tsx` (has the most specific error description). The style-system generics pass needed for calendar/date components should be coordinated with the style subsystem `@ts-nocheck` removal.

---

### [Medium] viviana-ui custom components use off-S2-scale numeric dimensions

- **Evidence:**
  - `packages/viviana-ui/src/custom/nav-header/index.tsx:23` — `height: 70` (not in S2 spacing scale: `{..., 64, 80, ...}`)
  - `packages/viviana-ui/src/custom/nav-header/index.tsx:45` — `height: 42` (not in S2 spacing scale: `{..., 40, 44, ...}`)
  - `packages/viviana-ui/src/custom/lateral-nav/index.tsx:113` — `width: 300` (not in S2 spacing scale; S2 width has named keywords + size tokens, no 300 step)
  - The style macro passes these as raw pixel values via `calc(${pxToRem(n)} * var(--s2-scale))`, making them scale-responsive but outside the S2 token vocabulary.
- **Why:** Rule #2 (mirror upstream, don't invent) and ADR 0001 (S2 token-derived values, not hand-authored): even though these are product-brand components rather than S2 ports, the style macro is the S2-token engine. Using values outside the token ramp is hand-tuning. The values cannot be caught by `@ts-nocheck`-free type checking because the macro accepts `number` for sizing via `SizingProperty`.
- **Fix:** Replace with nearest S2 spacing token (e.g., `height: 64` for nav-header, not 70; use S2 `height: 40` or `height: 44` for the button slot, not 42; use `width` string token or compose a variable for sidebar width). If 300px sidebar is a Viviana brand token, define it as a CSS custom property and reference it via `"[var(--vv-sidebar-width)]"` to make intent explicit.

---

### [Low] solidaria-components 14 non-null assertions in virtualizer height calculations

- **Evidence:**
  - `packages/solidaria-components/src/Table.tsx:1145,1173,1230,1258` — `virtualRange()!.offsetTop` / `virtualRange()!.offsetBottom`
  - `packages/solidaria-components/src/Tree.tsx:1363,1403` — same pattern
  - `packages/solidaria-components/src/Menu.tsx:1169,1196` — same
  - `packages/solidaria-components/src/GridList.tsx:619,646` — same
  - `packages/solidaria-components/src/ListBox.tsx:629,656` — same
  - `packages/solidaria-components/src/Button.tsx:272,275` — `dialogTriggerContext!.state.toggle()` / `popoverTriggerContext!.state.toggle()`
- **Why:** 12 of the 14 are clustered in virtualized rendering paths that only execute when the virtualizer is active — a legitimate conditional guard is present in each case but the assertion removes the null from the type. The `Button.tsx` assertions are different: they fire against context values that may genuinely be absent.
- **Fix:** Replace `Button.tsx:272` and `Button.tsx:275` with optional chaining (`?.toggle()`). For the virtualizer paths, assert once with a guard (`if (!virtualRange()) return`) rather than repeating `!` on every access.

---

### [Low] solid-spectrum patch markers: 16 in src/, 5 with open questions (TODO/FIXME flavor)

- **Evidence:**
  - `packages/solid-spectrum/src/style/spectrum-theme.ts:various` — 5 inline TODOs:
    - "are these fallbacks supposed to be different than above?"
    - `"body-2xs": fontSizeToken("font-size-50")` — "seems like there is no token for this"
    - `borderSpacing: baseSpacing` — "separate x and y"
    - "do we need separate x and y properties?"
  - `packages/solidaria/src/interactions/createFocus.ts:~89` — "Synthetic blur event handler for Firefox bug" (unnamed/unlinked bug)
  - `packages/solidaria/src/dialog/createDialog.ts:~61` — workaround note about announce timing
  - Remaining 10 entries in solid-spectrum are icon size variant names (`XXL`, `XXXL`) not true patch markers.
- **Why:** Rule #5: patches without deadlines become parallel truths. The four `spectrum-theme.ts` questions are upstream alignment gaps that affect token fidelity (Rule #2). The Firefox blur workaround is unlabeled with a bug link.
- **Fix:** For each of the four spectrum-theme questions, open a verification task: cross-check the Adobe upstream (`react-spectrum/packages/dev/s2/src/style/`) to confirm whether these are known gaps or bugs. Link the Firefox bug in `createFocus.ts` and the announce-timing issue in `createDialog.ts` to their upstream issue tracker entries. Convert open questions to confirmed decisions or documented known deviations.

---

## Type Safety Summary (per-package density)

| Package              | `@ts-nocheck` files | `: any`/`as any`/`<any>` sites | Non-null `!` | `@ts-ignore`/`@ts-expect-error` |
| -------------------- | ------------------- | ------------------------------ | ------------ | ------------------------------- |
| solid-stately        | 0                   | 1                              | 7            | 0                               |
| solidaria            | 0                   | 2                              | 5            | 0                               |
| solidaria-components | 0                   | 0                              | 14           | 1 (FileTrigger — webkit attr)   |
| solid-spectrum       | **35**              | **36**                         | 0            | 5+                              |
| viviana-ui           | 0                   | 0                              | 0            | 0                               |

The type debt is concentrated almost entirely in `solid-spectrum`. The lower three layers (`solid-stately`, `solidaria`, `solidaria-components`) are in good shape.

---

## Code Complexity Summary (top files by LOC)

| Package              | Top files                                                                                    | LOC                          |
| -------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| solidaria-components | Color.tsx, Table.tsx, Tree.tsx, Menu.tsx                                                     | 2411, 2191, 1890, 1761       |
| solid-spectrum       | color/index.tsx, style/spectrum-theme.ts, gridlist/index.tsx, tree/index.tsx, tabs/index.tsx | 1819, 1523, 1305, 1277, 1170 |
| solidaria            | interactions/createPress.ts, dnd/createDroppableCollection.ts, popover/calculatePosition.ts  | 911, 799, 764                |
| solid-stately        | color/Color.ts, combobox/createComboBoxState.ts                                              | 1054, 790                    |

The `solidaria-components/Color.tsx` (2411 LOC) and `solidaria-components/Table.tsx` (2191 LOC) are the largest single files in the repo. No duplication of utility logic was found across layer boundaries (`filterDOMProps`, `mergeProps`, `useRenderProps` are each defined exactly once in `solidaria-components/src/utils.tsx`).

---

## Suspected (unconfirmed)

- **Suspected Medium:** The `solidaria-components/src/index.ts` (972 LOC) re-exports everything as a flat barrel including data hooks re-exported from `solid-stately` (e.g., `createListData`, `createTreeData`, `createAsyncList`). This creates a second public entry point for `solid-stately` state primitives, bypassing the stated chain. Whether this is intentional pass-through or an accidental double-export surface was not confirmed in this pass.
- **Suspected Low:** `packages/solid-spectrum/src/slider/index.tsx` uses inline `style={{...}}` JSX props with string pixel values (`"4px"`, `"16px"`) at lines 526, 539, 568, 576 — these appear to be runtime-computed layout values for the slider track that the style macro cannot express as tokens. Whether these should be CSS custom properties or macro-expressible was not verified against upstream.
