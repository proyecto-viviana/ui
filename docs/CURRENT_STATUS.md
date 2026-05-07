# Current Status

Fresh-chat handoff for Proyecto Viviana S2 parity work. Read this before
continuing component parity, then check the current git state because this file
records intent and recent evidence, not a substitute for `git status`.

## Latest Entry - 2026-05-07

### Current state

- `main` is at `08b5fae Prevent Picker portal focus scroll`, after
  `0b81125 Fix Picker and ComboBox menu parity`.
- The latest completed slice focused on Picker and ComboBox overlay behavior,
  focus stability, option styling, and comparison guards.
- `0b81125` aligned Picker and ComboBox menu parity across the comparison
  playbook, `picker-visual` and `combobox-visual` Playwright guards,
  `solid-spectrum` ComboBox, `solidaria-components` ComboBox/ListBox/Select,
  and ARIA select/listbox/combobox hooks.
- `08b5fae` fixed Picker's first pointer-open portal behavior so opening the
  menu does not scroll the page to the portaled focus target. It updated
  `packages/solidaria-components/src/Select.tsx`,
  `packages/solidaria/src/index.ts`, and
  `apps/comparison/e2e/picker-visual.spec.ts`.

### Validation and evidence

- Picker and ComboBox now have committed focused guards in
  `apps/comparison/e2e/picker-visual.spec.ts` and
  `apps/comparison/e2e/combobox-visual.spec.ts`.
- Picker guards cover invalid required XL screenshots/geometry, trigger DOM
  stability through open and select, first pointer-open scroll stability,
  keyboard preview before commit, Enter-open behavior, and open popover/option
  layout.
- ComboBox guards cover invalid required XL geometry, browser typing with focus
  and controlled marker stability, keyboard focus ring, closed Enter behavior,
  and selected open list layout.
- Useful rerun command:

  ```bash
  vp run build
  vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/picker-visual.spec.ts e2e/combobox-visual.spec.ts e2e/modeled-controls-contract.spec.ts --reporter=line
  ```

- For docs-only handoff edits, run `git diff --check`.

### Known traps

- Do not patch Solid from final screenshots alone. Compare live React Spectrum
  S2 behavior first, then inspect the relevant React S2 source.
- Interaction timelines matter. Assert transient focus, scroll, hover, active
  descendant, and keyboard preview states instead of only the final selected or
  open screenshot.
- Open overlays with real pointer and keyboard flows. Programmatic clicks can
  bypass focus, pointerup, portal, and scroll bugs that users hit.
- First-open portal behavior is a separate state. Check page scroll before and
  after opening, the active element, the actual DOM focus target, and focus
  return.
- Picker and ComboBox bugs can cross wrapper code, headless hooks, adapter
  identity/lifecycle, focus utilities, and generated S2 styling. Inspect each
  layer against React S2 before patching a symptom in one layer.
- Treat the comparison viewer as a product surface. Side-panel controls, sticky
  navigation, control markers, and serialized props must be validated in the
  browser.
- Keep viewer controls faithful to the real React Spectrum S2 docs surface. Do
  not invent knobs that React S2 does not expose; use focused query routes and
  specs for source-only fixture states.

### Next likely work

- Re-check the visual state matrix, open issues, and current git state before
  selecting the next component slice.
- If continuing the form/input batch, use the playbook row for the next target
  component and write the validation matrix before touching code.
- Re-run the Picker and ComboBox focused guards after any shared overlay,
  focus, listbox, or adapter-lifecycle change.

## Standing Process Findings

- Validate the plan before coding. Name the exact React S2 files, Solid files,
  route/query states, expected roles, and browser checks before changing
  component code.
- Always inspect live React S2 behavior and source first. Treat screenshots and
  previous port assumptions as leads, not the source of truth.
- Compare interaction timelines, not only terminal states. Focus, scroll, hover,
  press, keyboard preview, selection commit, dismissal, and focus return can all
  diverge briefly enough to miss in a static screenshot.
- Promote useful Playwright CLI findings into committed e2e guards. Manual
  evidence is part of discovery; the suite is the durable handoff.
- Validate the comparison viewer itself. Modeled controls must drive both React
  and Solid mounted DOM, not only update serialized props.

## End-of-Slice Checklist

- [ ] React S2 source and live behavior reviewed.
- [ ] Component-specific validation plan written before coding.
- [ ] Interaction timeline evidence gathered with Playwright CLI or focused
      browser checks.
- [ ] Comparison viewer controls validated for modeled components.
- [ ] Useful CLI findings promoted into committed e2e guards.
- [ ] Build and focused tests run, or skipped with a recorded reason.
- [ ] `docs/CURRENT_STATUS.md` updated with current state, validation, traps,
      next work, and commit information.
- [ ] Final commit recorded in this handoff.
