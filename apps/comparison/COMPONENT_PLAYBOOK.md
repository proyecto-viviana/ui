# Component Playbook v2

Read [`docs/adr/0001-s2-styling-source-of-truth.md`](../../docs/adr/0001-s2-styling-source-of-truth.md)
first. Every styled decision in this playbook follows that ADR.

---

## Why This Version Exists

The previous playbook described WHAT to check. This one describes HOW to verify
each item so nothing is assumed. Every missed ARIA attribute, every animation
divergence, every focus bug has a structural cause: an audit step existed in
prose but had no concrete verification procedure. This playbook closes that gap
by producing a specific artifact — a grep result, a snapshot diff, a test
assertion — at every step.

Work one component at a time. Complete all phases in order. Do not skip ahead to
screenshots.

---

## Prerequisites

- Comparison app running: `cd apps/comparison && bun dev`
- Playwright CLI available as `$PWCLI`
- React S2 source at `apps/comparison/node_modules/@react-spectrum/s2/src/`
- React Aria source at `apps/comparison/node_modules/react-aria-components/src/`
- React Stately source at `apps/comparison/node_modules/@react-stately/`
- React Aria hooks at `apps/comparison/node_modules/@react-aria/`

---

## Phase −1 — Comparison App Pre-flight

Run this phase first, for every component — new and existing alike. It
establishes that the comparison surface is complete before any audit begins.
For existing components it is a health-check; for new ones it is a setup guide.
A component that fails any item here cannot be audited by the later phases.

### −1.1 Manifest entry

```bash
grep -n '"<slug>"' apps/comparison/src/data/comparison-manifest.ts
```

If absent: add a `ComparisonEntry` to `comparison-manifest.ts` with the correct
`slug`, `title`, `category`, `componentStatus`, and `layers` record. Every
`LayerTrack` must have `react` and `solid` status fields set to `"live"` or
`"missing"` — not left blank.

### −1.2 Component group membership

```bash
grep -n '"<slug>"' apps/comparison/src/data/component-groups.ts
```

If absent: add the slug to the correct group in `componentGroupDefinitions`.
Run `e2e/sidebar-groups.spec.ts` after adding.

### −1.3 Demo model

```bash
ls apps/comparison/src/data/<slug>-demo.ts
```

If absent: create `apps/comparison/src/data/<slug>-demo.ts` following the
existing pattern (e.g. `datepicker-demo.ts`). It must export:

- `<Component>DemoDefaults` — the initial prop state object
- Option arrays for every prop that has a fixed set of values (`sizeOptions`,
  `variantOptions`, etc.)

Then import and register it in `apps/comparison/src/data/component-controls.ts`
alongside the existing entries.

### −1.4 React fixture

```bash
ls apps/comparison/src/components/react/fixtures/<slug>.tsx 2>/dev/null || \
  grep -r '"<slug>"' apps/comparison/src/components/react/
```

The React fixture must:

- Import the real `@react-spectrum/s2` component (not a stub)
- Accept props from `comparison:controls-change` and re-render reactively
- Expose `data-comparison-control-root` on the outermost fixture wrapper
- Serialize the current props as `data-comparison-control-props`

### −1.5 Solid fixture

```bash
ls apps/comparison/src/components/solid/fixtures/<slug>.tsx 2>/dev/null || \
  grep -r '"<slug>"' apps/comparison/src/components/solid/
```

The Solid fixture must satisfy the same contract as the React fixture:

- Import from `@proyecto-viviana/solid-spectrum`
- Listen to `comparison:controls-change` and update reactively
- Expose `data-comparison-control-root` (exactly one per fixture)
- Serialize current props as `data-comparison-control-props`

### −1.6 Side-panel controls wiring

```bash
grep -n '"<slug>"' apps/comparison/src/data/component-controls.ts
```

If absent or incomplete: add a `ComponentControlGroup` entry with
`coverage: "modeled"`. Controls must use the real S2 prop names. Do not invent
props that S2 does not expose publicly.

### −1.7 Visual state matrix entry

```bash
grep -n '"<slug>"' apps/comparison/src/data/visual-state-matrix.ts
```

If absent: add a `VisualStateCoverage` entry with at minimum these
`VisualStateTarget` rows (mark `pairDiff: "planned"` if not yet committed):

| id                         | label         | kind          |
| -------------------------- | ------------- | ------------- |
| `default`                  | Default state | `static`      |
| `disabled`                 | Disabled      | `static`      |
| `invalid`                  | Invalid       | `static`      |
| `size-s` through `size-xl` | Each size     | `static`      |
| `keyboard-open`            | Keyboard open | `keyboard`    |
| `focus-visible`            | Focus visible | `interaction` |

Add overlay rows (`open`, `keyboard-navigate`, `dismiss`) for components with
popups.

### −1.8 E2E spec skeleton

```bash
ls apps/comparison/e2e/<slug>-visual.spec.ts
```

If absent: create the file with at minimum:

- A `test` that opens the comparison route and takes a screenshot of both React
  and Solid canvases
- A `test.describe` block named after the component

Even a skeleton with a single snapshot test is enough to unblock Phase 6.

### −1.9 Comparison page loads

```bash
"$PWCLI" open http://127.0.0.1:4321/components/<slug>/ --headed
"$PWCLI" snapshot
```

Assert:

- Page renders without a JS error or blank canvas
- Both React and Solid cards are visible
- Side-panel controls are physically visible and clickable (not hidden behind
  sticky nav)

This is the gate. If the page does not load cleanly, stop and fix it before
Phase 0.

---

## Phase 0 — Intelligence Gathering (run before any code)

### 0.1 MCP doc pull

Run these MCP calls at the start of every component session and record the
output in the component's validation plan:

```
get_react_aria_page "<ComponentName>"
get_react_aria_page "<ComponentName>" "Keyboard Interactions"
get_react_aria_page "<ComponentName>" "Accessibility"
get_s2_page "<ComponentName>"
```

If the component composes sub-components (e.g. DatePicker uses Calendar,
DateField, DateSegment), pull each one separately. If a corresponding hook page
exists (`useDatePicker`, `useCalendar`, etc.), pull that too.

From the MCP output, extract and write down:

1. **Props table** — every prop, its type, its default, its description.
2. **ARIA role tree** — the exact JSX tree from the API section showing every
   role and slot.
3. **Keyboard interaction table** — every key and its effect.
4. **Accessibility section** — every `aria-*` attribute and the condition that
   triggers it.

These four items are ground truth for Phases 2–6. If the MCP output conflicts
with React source code, the source code wins — but record the discrepancy.

### 0.2 Skill reference

The `react-aria` and `react-spectrum-s2` skills load reference files locally.
Use them for:

- `references/testing/<ComponentName>/testing.md` — exact interaction simulation
  patterns to mirror in Solid unit tests (use `list_react_aria_pages` if you are
  not sure whether a testing guide exists for this component).
- `references/internationalized/date/` — CalendarDate, ZonedDateTime, Time
  types for any date/time component.
- `references/guides/forms.md` — form integration contract for field components.
- `references/guides/collections.md` — collection API contract for list/grid
  components.

The skills answer "how does React Aria expect consumers to integrate this?" The
MCP tools answer "what is the exact API and ARIA contract?" Both are needed.

---

## Phase 1 — Source File Map

Before any code comparison, locate every file in both stacks. Record all paths.
A missing Solid file is a gap to port before anything else.

```bash
COMPONENT="DatePicker"   # change per component

# React reference
find apps/comparison/node_modules/@react-spectrum/s2/src -name "${COMPONENT}.tsx"
find apps/comparison/node_modules/react-aria-components/src -name "${COMPONENT}.tsx" 2>/dev/null
find apps/comparison/node_modules/@react-aria -name "use${COMPONENT}.ts" 2>/dev/null
find apps/comparison/node_modules/@react-stately -name "use${COMPONENT}State.ts" 2>/dev/null

# Solid counterparts
# Layer 1 — state
find packages/solid-stately/src -name "create${COMPONENT}State.ts"

# Layer 2 — ARIA/behavior hooks
find packages/solidaria/src -name "create${COMPONENT}.ts"

# Layer 3 — headless components
find packages/solidaria-components/src -name "${COMPONENT}.tsx"

# Layer 4 — styled
find packages/solid-spectrum/src -name "${COMPONENT}.tsx" -o \
     -path "*/${COMPONENT,,}*" -name "index.tsx" 2>/dev/null
```

---

## Phase 2 — Layer 1 Audit: State (`solid-stately` vs `react-stately`)

### 2.1 State interface completeness

Every property and method on the React state interface must have a Solid
counterpart. Extract both interfaces and diff them:

```bash
# React state interface
grep -n "^\s\+readonly \|^\s\+[a-zA-Z][a-zA-Z]*[?:]" \
  apps/comparison/node_modules/@react-stately/<pkg>/src/use${COMPONENT}State.ts \
  | head -50

# Solid state interface
grep -n "^\s\+readonly \|^\s\+[a-zA-Z][a-zA-Z]*[?:]" \
  packages/solid-stately/src/<dir>/create${COMPONENT}State.ts \
  | head -50
```

For each property: same name, same semantic meaning. Reactivity wrapping
(`Accessor<T>` in Solid vs plain value in React) is expected and correct. A
missing property is always a bug.

### 2.2 Derived state computation

Derived booleans (e.g. `isInvalid`, `isPending`, `isSelected`) are often
computed from multiple inputs in React Stately. Verify each one:

```bash
# All isX derivations in React
grep -n "const is\|let is" \
  apps/comparison/node_modules/@react-stately/<pkg>/src/use${COMPONENT}State.ts

# Same in Solid
grep -n "const is\|let is\|createMemo.*is" \
  packages/solid-stately/src/<dir>/create${COMPONENT}State.ts
```

Pay special attention to `isInvalid`: React Stately often derives it from both
an explicit prop AND constraint violations (min/max, unavailable date, required
but empty). The Solid version must match both branches.

### 2.3 Callbacks

```bash
grep -n "onChange\|onFocus\|onBlur\|onOpen\|onClose\|onSelect" \
  apps/comparison/node_modules/@react-stately/<pkg>/src/use${COMPONENT}State.ts

grep -n "onChange\|onFocus\|onBlur\|onOpen\|onClose\|onSelect" \
  packages/solid-stately/src/<dir>/create${COMPONENT}State.ts
```

Every callback that React Stately fires must fire in Solid with the same value
type and under the same condition.

---

## Phase 3 — Layer 2 Audit: Behavior/ARIA Hooks (`solidaria` vs `react-aria`)

This is the highest-risk layer. Every ARIA bug and every focus bug originates
here. Do not treat this phase as a skim.

### 3.1 ARIA attribute completeness

From Phase 0.1, you have the complete ARIA attribute list from the MCP
Accessibility section. Now verify every one in source:

```bash
# Every aria-* the React hook produces
grep -n '"aria-' \
  apps/comparison/node_modules/@react-aria/<pkg>/src/use${COMPONENT}.ts

# Every aria-* the Solid hook produces
grep -n '"aria-' \
  packages/solidaria/src/<dir>/create${COMPONENT}.ts
```

For every attribute in the React output, the Solid hook must produce the same
attribute under the same condition. The following are the most commonly missed:

| Attribute               | Common miss                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| `aria-haspopup`         | Wrong value (`"true"` instead of `"dialog"` or `"listbox"`) or absent      |
| `aria-controls`         | Only set when open — absent on closed state is correct                     |
| `aria-expanded`         | Must toggle on open/close                                                  |
| `aria-activedescendant` | Must update during keyboard navigation in collections                      |
| `aria-required`         | Must come from both explicit prop AND field group context                  |
| `aria-invalid`          | Must come from both explicit prop AND constraint violation                 |
| `aria-disabled`         | React Aria uses `aria-disabled`, not HTML `disabled`, on non-form elements |
| `aria-describedby`      | Must chain: description ID + error ID + any external describedby           |
| `aria-labelledby`       | Must include both label ID and trigger ID for composite widgets            |
| `aria-label`            | Must be absent when a visible `aria-labelledby` chain covers the element   |
| `aria-modal`            | Must be on dialog overlays                                                 |
| `aria-multiselectable`  | Must be present for listboxes with multi-selection                         |

### 3.2 ARIA role completeness

Every role in the MCP ARIA tree must be present in the Solid hook output:

```bash
grep -n '"role"\|role:' \
  apps/comparison/node_modules/@react-aria/<pkg>/src/use${COMPONENT}.ts

grep -n '"role"\|role:' \
  packages/solidaria/src/<dir>/create${COMPONENT}.ts
```

Roles are never optional. A wrong or missing role is a critical accessibility
bug. Pay attention to role differences between similar-looking components:
`listbox` vs `grid`, `group` vs `radiogroup`, `dialog` vs `alertdialog`.

### 3.3 Focus management

```bash
# React Aria focus behavior
grep -n "focus\|FocusScope\|autoFocus\|manageFocus\|tabIndex" \
  apps/comparison/node_modules/@react-aria/<pkg>/src/use${COMPONENT}.ts | head -30

# Solid focus behavior
grep -n "focus\|FocusScope\|autoFocus\|tabIndex" \
  packages/solidaria/src/<dir>/create${COMPONENT}.ts | head -30
```

Verify:

- On open: focus moves to the correct initial target (first cell, first
  segment, first option).
- FocusScope `contain` is used for all modal overlays.
- FocusScope `restoreFocus` is used so focus returns to the trigger on dismiss.
- `data-focus-visible` is set when navigating by keyboard, absent after mouse
  interaction.
- Embedded interactive elements (clear button, stepper, trigger) do NOT cause a
  transient `blur` on the surrounding field. Record the React event order from
  the browser's Event Listeners panel and assert the Solid order matches.

### 3.4 Keyboard handler completeness

From the MCP Keyboard Interactions table, list every key. For each, verify the
handler exists and produces the same effect:

```bash
# React key handlers
grep -n '"Arrow\|"Enter\|"Escape\|"Tab\|"Home\|"End\|"Page\|"Space\|" "' \
  apps/comparison/node_modules/@react-aria/<pkg>/src/use${COMPONENT}.ts

# Solid key handlers
grep -n '"Arrow\|"Enter\|"Escape\|"Tab\|"Home\|"End\|"Page\|"Space\|" "' \
  packages/solidaria/src/<dir>/create${COMPONENT}.ts
```

A missing key handler is a silent failure: no error, just wrong behavior.

---

## Phase 4 — Layer 3 Audit: Headless Components (`solidaria-components` vs `react-aria-components`)

### 4.1 Slot/JSX tree

From the MCP API section you have the exact JSX tree. Verify the Solid
component matches it:

- Same root element type (div, span, input, etc.)
- Same named slots and their element types
- Same `slot=` prop values on child elements
- Same render-prop signature if the component accepts function children

```bash
# React slot structure
grep -n "slot=\|SlotContext\|SlottedContextValue\|<Provider" \
  apps/comparison/node_modules/react-aria-components/src/${COMPONENT}.tsx | head -30

# Solid slot structure
grep -n "slot=\|Context\|createContext\|Provider" \
  packages/solidaria-components/src/${COMPONENT}.tsx | head -30
```

### 4.2 Data attributes

`data-*` state attributes drive every S2 CSS selector rule. A missing
`data-hovered` means hover styles never fire in any theme.

```bash
# React data attributes
grep -n '"data-' \
  apps/comparison/node_modules/react-aria-components/src/${COMPONENT}.tsx

# Solid data attributes
grep -n '"data-\|dataAttr' \
  packages/solidaria-components/src/${COMPONENT}.tsx
```

Every `data-*` attribute in the React source must exist in the Solid source.
Required set: `data-hovered`, `data-pressed`, `data-focused`, `data-focus-visible`,
`data-disabled`, `data-selected`, `data-invalid`, `data-readonly`, `data-open`,
`data-placement`. Not every component uses all of them — match what React uses.

### 4.3 Context propagation

```bash
grep -n "useContext\|Context\|createContext" \
  apps/comparison/node_modules/react-aria-components/src/${COMPONENT}.tsx | head -20

grep -n "useContext\|Context\|createContext" \
  packages/solidaria-components/src/${COMPONENT}.tsx | head -20
```

Verify: every context the React component reads is also read in Solid; every
context the React component provides is also provided in Solid. Context misses
cause props to silently not propagate into children (e.g. `isDisabled` not
reaching child items).

### 4.4 Hidden form input

For all form-connected components (DatePicker, Picker, Checkbox, RadioGroup,
Slider, Switch, NumberField, TextField, SearchField, etc.):

```bash
grep -n "HiddenInput\|<input\|hidden.*input" \
  apps/comparison/node_modules/react-aria-components/src/${COMPONENT}.tsx

grep -n "HiddenInput\|<input\|hidden.*input" \
  packages/solidaria-components/src/${COMPONENT}.tsx
```

React Aria Components inject a hidden `<input>` for form submission and native
browser validation. If absent in Solid, `required` validation and form
submission data are broken.

### 4.5 Portal/overlay

For components with overlays:

```bash
grep -n "Portal\|Overlay\|modal\|usePopover\|<PopoverContext" \
  apps/comparison/node_modules/react-aria-components/src/${COMPONENT}.tsx

grep -n "Portal\|createPopover\|modal" \
  packages/solidaria-components/src/${COMPONENT}.tsx
```

Verify: same portal target, same `isModal` flag, scroll lock applied, backdrop
click dismisses the overlay.

---

## Phase 5 — Layer 4 Audit: S2 Styled Component (`solid-spectrum` vs `@react-spectrum/s2`)

Read the React S2 source in full before touching the Solid version. The source
is at `apps/comparison/node_modules/@react-spectrum/s2/src/${COMPONENT}.tsx`.

### 5.1 Style function inventory

```bash
# Every named style object/function in React S2
grep -n "const .*= style(\|const .*Styles\|= css(" \
  apps/comparison/node_modules/@react-spectrum/s2/src/${COMPONENT}.tsx

# Same in Solid
grep -n "const .*= style(\|const .*Styles\|= css(" \
  packages/solid-spectrum/src/<dir>/${COMPONENT}.tsx
```

Every named style function must exist in the Solid port. Each one carries
conditional token logic (hover, pressed, disabled, size variants) that the CSS
system relies on.

### 5.2 Render-state variables

Derived booleans gate the CSS condition branches. Missing ones produce wrong
styles silently.

```bash
# React render-state variables
grep -n "const is[A-Z]\|let is[A-Z]\|const has[A-Z]" \
  apps/comparison/node_modules/@react-spectrum/s2/src/${COMPONENT}.tsx

# Solid render-state variables
grep -n "const is[A-Z]\|let is[A-Z]\|const has[A-Z]" \
  packages/solid-spectrum/src/<dir>/${COMPONENT}.tsx
```

Trace each derived bool back to where it is used in a style call and confirm
the Solid version passes the same bool to the same style branch.

### 5.3 Slot context providers

```bash
grep -n "SlotContext\|TextContext\|IconContext\|<Provider\|SlottedContextValue" \
  apps/comparison/node_modules/@react-spectrum/s2/src/${COMPONENT}.tsx

grep -n "Context\|Provider" \
  packages/solid-spectrum/src/<dir>/${COMPONENT}.tsx
```

S2 uses slot contexts to pass size, variant, and emphasis into child components
(icons, labels, descriptions). Missing providers means children ignore parent
props.

### 5.4 Animation inventory

```bash
# React S2 animations
grep -n "pressScale\|transform\|scale\|transition\|entering\|exiting\|animation" \
  apps/comparison/node_modules/@react-spectrum/s2/src/${COMPONENT}.tsx

# Solid animations
grep -n "pressScale\|transform\|scale\|transition\|entering\|exiting\|animation" \
  packages/solid-spectrum/src/<dir>/${COMPONENT}.tsx
```

Animations to verify for each component type:

| Animation type              | Where it lives                                              | How to verify                                                                                  |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Press scale                 | JS inline transform driven by `isPressed` render prop       | Check computed `transform` on `mousedown`, assert `scale(0.97)` or matching value              |
| Overlay enter/exit          | CSS transition on `data-entering`/`data-exiting` attributes | Inspect element during open animation; assert `opacity` and `transform` transition             |
| Selection indicator sliding | CSS `transform: translateX()` or `left` transition          | Inspect indicator element; assert `transition` property present and value changes on selection |
| Spinner/pending             | `@keyframes` rotation                                       | Assert `animation` property on spinner element                                                 |
| Switch thumb slide          | CSS `transform: translateX()`                               | Assert `transition` on thumb; assert transform value changes on toggle                         |
| Focus ring                  | CSS `outline` or `box-shadow` on `[data-focus-visible]`     | Assert outline appears after keyboard focus, absent after mouse focus                          |

Every animation in React S2 must have an equivalent in Solid. Custom CSS
approximations that are not token-driven are ADR violations.

### 5.5 Generated CSS class verification

After a Solid build, for every class the Solid component emits to the DOM:

```bash
# Get all classes from a rendered Solid component (via DOM inspection or test output)
# Then for each class <cls>:
grep -c "\.<cls>" packages/solid-spectrum/src/s2-generated.css
```

A count of 0 means the class was invented in the Solid port without a
corresponding CSS rule — this is always a bug. Every class must trace back to a
`style()` call that went through the S2 style compiler.

To get the full class list of a live component quickly:

```javascript
// In Playwright or browser console
[...document.querySelector('[data-framework="solid"] [your-selector]').querySelectorAll("*")]
  .flatMap((el) => [...el.classList])
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort();
```

---

## Phase 6 — Runtime Verification

These checks happen in the browser before any screenshot. Screenshots validate
appearance; these checks validate the contract beneath it.

### 6.1 Accessibility tree snapshot

```bash
"$PWCLI" open http://127.0.0.1:4321/components/<slug>/ --headed
"$PWCLI" snapshot
```

From the snapshot, verify against the MCP ARIA role tree:

- Root element has the correct role
- Every interactive element has a computable accessible name (no role without a
  name)
- No interactive element has `role="none"` or `role="presentation"` unless
  intentional
- `aria-labelledby` references an existing element ID
- `aria-describedby` chains all IDs (description + error + external)
- `aria-haspopup` value matches the overlay type (`"dialog"`, `"listbox"`,
  `"grid"`, `"tree"`)

Do this for both the React canvas and the Solid canvas. Differences are bugs.

### 6.2 DOM structure parity

In Playwright, compare the DOM structure level-by-level:

```javascript
// Number of DOM levels between label and interactive target
// Same element types for interactive targets (button not div, input not span)
// Same slot elements present (icon, text, description, error-message)
const reactDepth = await page
  .locator('[data-framework="react"] [role="group"]')
  .evaluate((el) => el.querySelectorAll("*").length);
const solidDepth = await page
  .locator('[data-framework="solid"] [role="group"]')
  .evaluate((el) => el.querySelectorAll("*").length);
// These need not be identical, but a large gap signals a structural difference.
```

Specifically check: same element types for the interactive target (a `<button>`
in React must not be a `<div tabIndex=0>` in Solid unless React Aria itself uses
that pattern), same slot elements present and in same order.

### 6.3 Keyboard navigation sequence

For every row in the MCP Keyboard Interactions table, execute the sequence with
real keyboard events:

```javascript
const field = page.locator('[data-framework="solid"] [role="group"]');
await field.focus();

await page.keyboard.press("ArrowDown");
// Assert: aria-activedescendant updated (for collection components)
// Assert: focused item has data-focused="true"
// Assert: focused item has data-focus-visible="true"

await page.keyboard.press("Enter");
// Assert: value committed or overlay opened
// Assert: focus at correct target after commit

await page.keyboard.press("Escape");
// Assert: overlay closed
// Assert: focus returned to trigger
```

Use `.press()` for all keyboard assertions — never `.click()` for keyboard
tests. The sequence must prove both React and Solid behave identically.

### 6.4 Focus lifecycle (for components with embedded buttons)

```javascript
// For DatePicker, NumberField, SearchField, ComboBox, Picker, etc.
// Click the field area (not the trigger button)
await page.click('[data-framework="solid"] .field-input-area');

// Wait one frame
await page.waitForTimeout(16);

// Assert: focus is on the field input, not the trigger
// Assert: no blur/focus events were fired during the click
// Verify by checking document.activeElement in the browser
const focused = await page.evaluate(() => document.activeElement?.getAttribute("role"));
expect(focused).toBe("spinbutton"); // or 'textbox', 'combobox', etc.
```

Record the React event order using DevTools → Event Listeners. The Solid event
order must match. A transient `blur` that React does not emit is a focus
stability bug.

### 6.5 Interaction state verification

For each of: hover, focus-visible, pressed, selected/checked, open, disabled,
invalid:

```javascript
async function getStateStyles(locator) {
  return locator.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      borderColor: cs.borderColor,
      outline: cs.outline,
      transform: cs.transform,
      opacity: cs.opacity,
    };
  });
}

// Before hover
const before = await getStateStyles(target);
// Hover
await target.hover();
const after = await getStateStyles(target);
// Assert: backgroundColor changed (or borderColor, or whatever S2 changes on hover)
expect(before.backgroundColor).not.toBe(after.backgroundColor);
```

Compare the same state between React and Solid — not just that the value
changed, but that it changed to the same value.

For `disabled`: hover and press the disabled component and assert that hover
styles do NOT apply. React Aria suppresses hover/press on disabled elements.

### 6.6 Geometry parity

```javascript
async function box(locator) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
}

const r = await box(page.locator('[data-framework="react"] [role="group"]'));
const s = await box(page.locator('[data-framework="solid"] [role="group"]'));

expect(Math.abs(r.w - s.w)).toBeLessThanOrEqual(2);
expect(Math.abs(r.h - s.h)).toBeLessThanOrEqual(2);
```

Required geometry checks per component:

- Root element dimensions
- Icon bounding box (position and size relative to root)
- Text baseline vs icon centerline (alignment delta ≤ 1px)
- Trigger button position within field
- Overlay placement (top, left, width, height after open)
- Hit area for all interactive elements (minimum 32×32px)

Run geometry checks at every size variant (S, M, L, XL). Size variants
frequently diverge because they route through different style branches.

### 6.7 Animation frame verification

For animated states (press, overlay open/close, selection change):

```javascript
// Capture the transform immediately after mousedown (press scale)
await page.mouse.down();
const duringPress = await getStateStyles(button);
expect(duringPress.transform).toMatch(/scale\(0\.9/);
await page.mouse.up();
const afterRelease = await getStateStyles(button);
expect(afterRelease.transform).toBe("none");
```

For overlay animations, use `page.waitForTimeout(50)` after open and verify
the transition is mid-flight (opacity between 0 and 1, or transform mid-value),
not that it jumped instantly to final state.

---

## Phase 7 — Test Coverage Requirements

### 7.1 Unit tests (`packages/solid-spectrum/test/<Name>.test.tsx`)

Unit tests prove the ARIA contract in isolation, without a browser. Every
component must have tests for all of the following. Use `getByRole` queries —
never `querySelector` or `getByTestId` for ARIA-contract assertions.

**ARIA semantics (required for every component)**

```typescript
// Correct root role
getByRole("group", { name: "Label" }); // DatePicker, NumberField, etc.
getByRole("button", { name: "Label" }); // ActionButton, etc.
getByRole("textbox", { name: "Label" }); // TextField, etc.

// aria-describedby includes description ID
const group = getByRole("group", { name: "Label text" });
const desc = getByText("Description text");
expect(group.getAttribute("aria-describedby")).toContain(desc.id);

// aria-describedby includes error ID when invalid
const error = getByText("Error message");
expect(group.getAttribute("aria-describedby")).toContain(error.id);

// aria-required
expect(group).toHaveAttribute("aria-required", "true");

// aria-invalid
expect(group).toHaveAttribute("aria-invalid", "true");

// aria-disabled
expect(group).toHaveAttribute("aria-disabled", "true");

// Overlay trigger attributes (for components that open overlays)
const trigger = getByRole("button", { name: /open/i });
expect(trigger).toHaveAttribute("aria-haspopup", "dialog"); // or 'listbox'
expect(trigger).toHaveAttribute("aria-expanded", "false");
```

**Controlled value**

```typescript
// defaultValue renders
render(() => <Component defaultValue={someValue} />);
// Assert: displayed value matches

// onChange fires with correct type
const onChange = vi.fn();
render(() => <Component onChange={onChange} />);
// Interact → Assert: onChange called with expected type
```

**State propagation**

```typescript
// isDisabled prevents interaction
render(() => <Component isDisabled />);
await userEvent.click(trigger);
// Assert: overlay did not open

// isReadOnly allows focus but prevents change
render(() => <Component isReadOnly value={val} />);
// Assert: input is focusable
// Assert: typing does not change value
```

### 7.2 E2E tests (`apps/comparison/e2e/<name>-visual.spec.ts`)

Required for every component:

- [ ] Default state screenshot pair-diff (React vs Solid, zero tolerance)
- [ ] Each size variant screenshot (S, M, L, XL) — pair-diff per size
- [ ] Disabled state screenshot pair-diff
- [ ] Invalid + description state screenshot pair-diff
- [ ] Geometry assertion: root, icon, text (delta ≤ 2px)
- [ ] Keyboard open → navigate → select → dismiss sequence
- [ ] Focus returned to trigger after dismiss
- [ ] Side-panel controls drive both React and Solid DOM (not just prop marker)
- [ ] Light and dark theme screenshots
- [ ] Hover state does NOT apply to disabled component (click + hover assertion)
- [ ] At least one real browser typing or interaction test (not just click)

The side-panel controls test must assert that the mounted DOM changed — not
just that the serialized prop marker updated. For example: after toggling
`isDisabled`, assert `aria-disabled` is present on the component root.

---

## Phase 8 — Sign-off Checklist

Do not call a component done until every item below is explicitly verified.
Record the result of each item (pass / gap / intentional deviation) in the
CURRENT_STATUS.md handoff entry.

### Layer 1 — solid-stately

- [ ] Every property in the React state interface exists in Solid
- [ ] `isInvalid` and other derived booleans trace the same inputs as React
- [ ] Every callback fires with the same value type and conditions

### Layer 2 — solidaria

- [ ] Every `aria-*` from MCP Accessibility section is produced under the same condition
- [ ] Every ARIA role from MCP role tree is emitted
- [ ] Every keyboard handler from MCP Keyboard Interactions table is present
- [ ] Focus scope (contain/restore/auto) matches React Aria
- [ ] `aria-describedby` chains all IDs: description + error + external
- [ ] Embedded interactive elements do not emit transient blur on the surrounding field

### Layer 3 — solidaria-components

- [ ] JSX slot tree matches react-aria-components (same slots, same slot names)
- [ ] Every `data-*` state attribute matches react-aria-components output
- [ ] Every context React provides is also provided in Solid
- [ ] Hidden form input is present for form-connected components
- [ ] Portal behavior matches: same target, same modal flag, scroll lock

### Layer 4 — solid-spectrum

- [ ] Every S2 style function exists in the Solid port
- [ ] Every render-state bool gates the same style conditions
- [ ] Every class emitted to DOM has a rule in s2-generated.css
- [ ] Animations match: press scale, overlay enter/exit, selection indicator, pending spinner
- [ ] Slot context providers match (TextContext, IconContext, etc.)
- [ ] Icon sizing uses `fontRelative()` or S2 style system — no hardcoded px

### Runtime

- [ ] ARIA tree snapshot matches MCP role tree on both React and Solid canvases
- [ ] Every key in MCP Keyboard Interactions table verified with real keyboard events
- [ ] Focus lifecycle verified for all embedded interactive elements
- [ ] Interaction state styles match React vs Solid (hover, focus, pressed, disabled, invalid)
- [ ] Geometry within 2px tolerance at all size variants
- [ ] Animation frames verified (not just final state screenshots)

### Tests

- [ ] Unit tests cover all ARIA semantics using `getByRole` queries
- [ ] Unit tests cover controlled value, onChange, isDisabled, isReadOnly, isRequired
- [ ] E2E screenshot pair-diffs committed and passing
- [ ] E2E keyboard interaction test committed
- [ ] E2E side-panel controls test asserts DOM state (not just prop marker)
- [ ] E2E disabled component hover/press guard committed

### Docs

- [ ] `docs/CURRENT_STATUS.md` has a fresh handoff entry with: current state,
      commits, validation that passed, known gaps, next work, skipped checks with
      reasons

---

## Anti-patterns

These are never acceptable:

- Tuning CSS by eye (adjusting padding, radius, or color values by hand) — use
  the S2 style system; if it looks wrong, trace the style declaration.
- `querySelector` in unit test assertions for ARIA contracts — use `getByRole`.
- Committing screenshots before the DOM contract (roles, attributes, focus,
  keyboard) is verified.
- Marking a component done because the screenshot matches — screenshots cannot
  prove ARIA roles, keyboard behavior, or focus stability.
- Adding a class to the DOM that does not exist in `s2-generated.css`.
- Using `UNSAFE_style` or `UNSAFE_className` in S2 components.
- Hardcoded pixel values for sizes that S2 derives from tokens or `fontRelative()`.
- Checking "final focus" without verifying the full focus lifecycle.
- Verifying only mouse-open behavior for overlays without also verifying
  keyboard-open (the initially focused item can legitimately differ).

---

## MCP Quick Reference

| When                             | Tool                                                   | Purpose                                |
| -------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| Start of every component session | `get_react_aria_page "<Name>"`                         | Full props, API, role tree             |
| Start of every component session | `get_react_aria_page "<Name>" "Keyboard Interactions"` | Complete keyboard table                |
| Start of every component session | `get_react_aria_page "<Name>" "Accessibility"`         | Complete ARIA attribute list           |
| Start of every component session | `get_s2_page "<Name>"`                                 | S2 props, slot structure, styling      |
| Phase 3 ARIA audit               | `get_react_aria_page "use<Name>"`                      | Hook-level ARIA contract               |
| Any sub-component                | `get_react_aria_page "<SubComponent>"`                 | e.g. Calendar, DateField, Popover      |
| CSS token audit                  | `get_style_macro_property_values "<property>"`         | Valid token values for a property      |
| Enumerating related pages        | `list_react_aria_pages`                                | Find all hook/component pages          |
| Icon name                        | `search_s2_icons "<term>"`                             | Correct S2 icon name for visual parity |

---

## Batch Plans and Component Navigation

See the following sections below for per-family batch plans and interactive
control retrofit status. These sections are additive — this v2 protocol applies
to every component in every batch.

---

## Interactive Controls Requirement

Every component page must have a modeled interactive comparison control surface
before it is considered complete. Requirements:

- `ComponentControlGroup` entry with `coverage: "modeled"` and real S2 prop names.
- Both React and Solid fixtures listen to `comparison:controls-change`.
- Both expose `data-comparison-control-root` and `data-comparison-control-props`.
- A Playwright test that changes side-panel controls and asserts mounted DOM
  changed (not just serialized props).
- Controls are physically clickable at the default Playwright viewport (sticky
  nav must not cover the form).

---

## Screenshot Rule

Screenshots validate implementation. They do not define implementation.

If a screenshot fails: inspect the S2 style declaration and Solid style-system
output before changing CSS. If a screenshot passes: it does not mean the ARIA
contract, keyboard behavior, or focus lifecycle is correct.

---

## End-of-Component Lifecycle

A component is not done until `docs/CURRENT_STATUS.md` has a handoff entry.
The entry must include: current state, commits, validation that passed, known
traps, next likely work, and any skipped checks with reasons. The handoff entry
is part of the done definition.
