# Current Status

Fresh-chat handoff for Proyecto Viviana S2 parity work. Read this before
continuing component parity, then check the current git state because this file
records intent and recent evidence, not a substitute for `git status`.

## Latest Entry - 2026-05-07

### Current state

- SelectBoxGroup horizontal illustration parity was repaired after a regression
  report. The issue was in
  `packages/solid-spectrum/src/selectboxgroup/index.tsx`.
- React S2 reference was checked in
  `apps/comparison/node_modules/@react-spectrum/s2/src/SelectBoxGroup.tsx`.
  React uses horizontal grid areas
  `"illustration . label" "illustration . description"` and slot providers
  for label, description, and illustration behavior.
- Solid was emitting/applying horizontal SelectBox classes that computed to
  `grid-template-areas: none` in Chromium, so label, description, and the
  illustration slot auto-placed incorrectly.
- A follow-up check showed the comparison fixtures were also using `createIcon`
  for `slot="illustration"`, which only produced a small 20px glyph. React now
  uses S2 `createIllustration`; Solid exposes and uses a matching
  `createIllustration` helper for this fixture.
- The actual viewer default now sets SelectBoxGroup `withIllustrations: true`
  in `apps/comparison/src/pages/components/[slug].astro` and in both framework
  fixtures. The default `/components/selectboxgroup/` product surface therefore
  shows illustration artwork without requiring a hidden query parameter.
- Solid now normalizes `slot`, `data-slot`, and `data-rsp-slot` children, then
  applies the horizontal grid areas and illustrated row sizing after slot
  discovery. The illustrated horizontal state now shows 48x48 artwork in both
  React and Solid.
- A second follow-up fixed the remaining ugly alignment regression in the
  comparison viewer. React's SelectBoxGroup root is a `div`, while Solid's root
  is a semantic `ul`; Solid was still inheriting browser list defaults
  (`margin: 15px 0px`, `padding-left: 40px`, `list-style-type: disc`). The
  Solid root now resets margin, padding, and list style so options start at the
  same root offset as React.
- The SelectBoxGroup screenshot gates in
  `apps/comparison/e2e/collection-button-controls-visual.spec.ts` were tightened
  from `0.42` mismatch / `96px` dimension tolerance to `0.18` or `0.12`
  mismatch / `48px` dimension tolerance, and the illustration helper no longer
  accepts the selection-indicator SVG as proof that the illustration is visible.
- The SelectBoxGroup geometry guard now also asserts root width, root margin,
  root padding, root list style, and the first option's left offset inside the
  root. This is the guard that would have caught the `ul` UA-style regression.
- Commit for this slice: `Fix SelectBoxGroup illustration layout parity`.
- Follow-up commit for root alignment: `Fix SelectBoxGroup root list spacing`.

### Validation and evidence

- Validation plan before coding:
  - React S2 file: `SelectBoxGroup.tsx`.
  - Solid file: `packages/solid-spectrum/src/selectboxgroup/index.tsx`.
  - Route/query states:
    `/components/selectboxgroup/?selectionMode=multiple&selectedKeys=starter,pro&orientation=horizontal`
    and
    `/components/selectboxgroup/?selectionMode=multiple&selectedKeys=starter&orientation=horizontal&withIllustrations=true&disablePro=true`.
  - Expected roles: listbox root, option items, selected starter/pro states,
    disabled Pro option, no selection change on forced disabled press.
  - Browser checks: option size, grid areas/rows/columns, label/description
    positions, visible illustration geometry, hover text ramp, interactive
    controls dispatch, keyboard selection commit.
- Live probe after the illustration follow-up showed React and Solid both at
  368x84 for the first horizontal illustrated option, with label/description
  left at 92px and the illustration visible at 48x48, left 34px, top 18px
  relative to the option.
- Live probe for default `/components/selectboxgroup/` confirmed both mounted
  roots serialize `withIllustrations: true` and both render visible 48x48
  illustration SVGs.
- Live probe after the root reset confirmed React and Solid roots both measure
  368px wide with `margin: 0px`, `padding: 0px`, Solid `list-style-type: none`,
  first option root offset `0px`, option size 368x84, illustration 48x48 at
  left 34px/top 18px, and label/description left 92px.
- Validated with:

  ```bash
  vp run --filter @proyecto-viviana/comparison build
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/collection-button-controls-visual.spec.ts -g "SelectBoxGroup.*committed pair screenshots|SelectBoxGroup illustrated disabled option state has committed pair screenshots" --update-snapshots --reporter=line
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/collection-button-controls-visual.spec.ts -g "SelectBoxGroup" --reporter=line
  vp fmt packages/solid-spectrum/src/s2-generated.css --write
  vp run --filter @proyecto-viviana/solid-spectrum build
  vp run --filter @proyecto-viviana/comparison build
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/collection-button-controls-visual.spec.ts -g "SelectBoxGroup" --reporter=line
  ```

- The focused SelectBoxGroup suite result after snapshot refresh and threshold
  tightening: 7 passed.
- The focused SelectBoxGroup suite result after the root reset and root geometry
  assertions: 7 passed.

### Why the tests did not catch it earlier

- They do catch it when the SelectBoxGroup spec is run; the current broken
  state failed the focused SelectBoxGroup suite before the fix.
- Recent form/input focused runs did not include
  `e2e/collection-button-controls-visual.spec.ts`, so this collection-control
  regression was outside the executed batch.
- The old screenshot thresholds were too broad for this component, and the
  illustration helper could match an unrelated SVG. That made the durable guard
  weaker than the live regression required.
- The tests also lacked root-level geometry checks. The broken state still had
  roles, options, labels, and SVGs in the DOM, but Solid's native `ul` margin and
  padding shifted the rendered product surface.

### Known traps

- Do not rely on final screenshots alone for SelectBoxGroup. Inspect computed
  grid areas, rows, columns, and slot geometry because invalid grid-area CSS can
  leave the DOM present but visually wrong.
- Because Solid uses a `ul` for SelectBoxGroup, always verify root margin,
  padding, list-style, root width, and option offset against React. Browser UA
  list styles can make the component look obviously wrong while ARIA and slot
  assertions still pass.
- React icons and illustrations are separate S2 paths. `createIcon` remains a
  20px icon even with `slot="illustration"`; use `createIllustration` when the
  fixture is meant to exercise SelectBoxGroup illustration behavior.
- A raw `css()` class imported directly in component source may remain in the JS
  bundle without being emitted into the page CSS. Verify computed styles in the
  comparison viewer after rebuilds.
- SelectBoxGroup lives with collection/button controls, not the form/input
  specs. Run its focused spec after shared collection, listbox, icon, or slot
  style changes.

### Next likely work

- Continue the S2 parity queue from the current status after this commit. If
  staying near form/input, DateField, DatePicker, DateRangePicker, and TimeField
  remain likely candidates, but first re-check the current visual matrix and git
  state.
- If shared icon or generated S2 style handling changes, rerun the focused
  SelectBoxGroup spec because illustration visibility can regress while the DOM
  still contains an SVG.

---

## Previous Entry - 2026-05-07

### Current state

- The latest in-progress slice continues the Form/Input batch after
  `44f2b43 Update handoff after ComboBox press fix`.
- SearchField S2 parity was tightened against live React Spectrum S2 behavior
  and source:
  `apps/comparison/node_modules/@react-spectrum/s2/src/SearchField.tsx`,
  `TextField.tsx`, and `Field.tsx`.
- Solid SearchField now merges its SearchField-specific field-group padding
  override through `mergeStyles`, matching React S2's `FieldGroup` plus
  SearchField `styles={style({paddingStart: 'pill', paddingEnd: 0})}` path.
  The failing live geometry was React 228px group width, 24px start padding,
  0px end padding versus Solid 240px, 18px, 18px.
- The obsolete plain CSS SearchField pill-padding helper was removed from
  `packages/solid-spectrum/src/searchfield/s2-searchfield-styles.ts` and the
  generated S2 CSS now drops only that stale utility class.
- The comparison viewer had a modeled-controls regression for Picker:
  `apps/comparison/src/pages/components/[slug].astro` omitted `picker` from
  the side-panel defaults map, so the generic controls script dispatched empty
  props. The viewer defaults now match `pickerDemoDefaults`. This did not
  change Picker overlay, selection, press, or focus code.

### Validation and evidence

- Validation plan before coding:
  - React S2 files: `SearchField.tsx`, `TextField.tsx`, `Field.tsx`.
  - Solid files: `packages/solid-spectrum/src/searchfield/index.tsx`,
    `packages/solid-spectrum/src/searchfield/s2-searchfield-styles.ts`,
    `packages/solidaria-components/src/SearchField.tsx`.
  - Routes/query states:
    `/components/searchfield/?isInvalid=true&isRequired=true&size=XL` and
    `/components/picker/` for side-panel modeled controls.
  - Expected roles: SearchField textbox/search input plus clear button when
    non-empty; Picker button/combobox-like select trigger remains covered by
    existing Picker specs.
  - Browser checks: root/group/input/search-icon/clear-button geometry,
    controlled typing and clear, post-clear focus stability, side-panel prop
    dispatch into both React and Solid roots.
- Live browser probe after the SearchField fix confirmed both React and Solid
  field groups at 228px width, 24px start padding, and 0px end padding for the
  invalid required XL route.
- Validated with:

  ```bash
  vp run build
  vp run --filter @proyecto-viviana/solid-spectrum build
  vp run --filter @proyecto-viviana/comparison build
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/searchfield-visual.spec.ts --reporter=line
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/modeled-controls-contract.spec.ts -g "Picker side-panel controls" --reporter=line
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/numberfield-visual.spec.ts -g "both steppers hover" --reporter=line
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/checkbox-visual.spec.ts e2e/checkboxgroup-visual.spec.ts e2e/radiogroup-visual.spec.ts e2e/numberfield-visual.spec.ts e2e/searchfield-visual.spec.ts e2e/switch-visual.spec.ts e2e/textfield-visual.spec.ts e2e/textarea-visual.spec.ts e2e/slider-visual.spec.ts e2e/modeled-controls-contract.spec.ts --reporter=line
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/searchfield-visual.spec.ts e2e/modeled-controls-contract.spec.ts -g "SearchField|Picker side-panel controls" --reporter=line
  vp fmt packages/solid-spectrum/src/s2-generated.css --write
  git diff --check
  ```

- Browser Playwright needed escalation outside the sandbox after Chromium
  started failing with `sandbox_host_linux.cc:41 shutdown: Operation not
permitted`. The escalated focused and full comparison runs passed.
- Full focused form/input suite result: 51 passed.
- Final focused SearchField plus Picker modeled-controls result after the last
  comparison rebuild: 5 passed.

### Known traps

- SearchField's React S2 field group starts from the shared `FieldGroup` style
  but then applies a SearchField-specific style override. In Solid, that kind
  of override must use `mergeStyles`; appending a plain CSS class can lose to
  generated S2 class order and change intrinsic field width.
- The generated S2 CSS can pick up formatter churn after the build generator
  runs. Re-run `vp fmt packages/solid-spectrum/src/s2-generated.css --write`
  before committing if the generated CSS diff is larger than the intended
  class-level change.
- The comparison viewer defaults map is part of the product surface. A modeled
  `ComponentControlGroup` is not sufficient if the page script lacks matching
  defaults for that slug.
- Do not reopen Picker overlay/press behavior for this slice. The only Picker
  change here is viewer-side controls dispatch.

### Next likely work

- Continue the form/input tightening pass by re-running the matrix and choosing
  the next actual failing or planned state. Date/time controls are likely the
  next broader batch once form/input remains green.
- If a shared field style changes again, re-run TextField, TextArea,
  SearchField, NumberField, Picker, ComboBox, and modeled-controls guards.
- Commit for this slice: `Fix SearchField S2 padding parity` (latest commit at
  handoff update time).

---

## Previous Entry - 2026-05-07

### Current state

- The latest code slice is `4eaaad5 Fix ComboBox first option press`, after
  `8e1113c docs: add S2 parity handoff lifecycle`,
  `08b5fae Prevent Picker portal focus scroll`, and
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
- `4eaaad5` fixed ComboBox's first option pointer selection. The first click
  could leave the option stuck in pressed/hovered state because Solid started a
  press from the pointer-event branch's `mousedown` fallback even when
  `pointerdown` did not start on the option. The fix aligns ComboBox listbox
  options with React Aria's virtual focus, different-press-origin, and target
  `pointerup` behavior.

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
  first pointer option commit/close behavior, and selected open list layout.
- Validated `4eaaad5` with:

  ```bash
  vp run --filter @proyecto-viviana/solidaria build
  vp run --filter @proyecto-viviana/solidaria-components build
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/combobox-visual.spec.ts -g "first pointer selection" --reporter=line
  COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/combobox-visual.spec.ts --reporter=line
  git diff --check
  ```

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
- ComboBox first pointer selection is sensitive to the native event sequence.
  In Chromium, the first click can deliver `pointerdown` and `mousedown` to
  different hit-test targets around a portaled option. The pointer-event branch
  must not start a press from `mousedown`; it should only preserve focus there.
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
