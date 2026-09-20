# SolidJS Patterns

Patterns specific to our SolidJS implementation vs React-Aria.

## Props as Accessors

React-Aria hooks take props objects. In SolidJS, we wrap in accessors for reactivity:

```typescript
// React-Aria
function useButton(props: ButtonProps) { ... }

// Solidaria
function createButton(
  props: MaybeAccessor<ButtonProps>,  // Can be object or () => object
  ref: () => HTMLElement | null
) { ... }
```

Usage:

```typescript
// Static props
createButton({ onPress: handlePress }, () => ref);

// Reactive props (from component props)
createButton(
  () => ({ onPress: props.onPress }),
  () => ref,
);
```

## Ref Pattern

```typescript
// React
const ref = useRef<HTMLButtonElement>(null);
<button ref={ref} />

// SolidJS
let ref: HTMLButtonElement | null = null;
<button ref={(el) => (ref = el)} />

// For hooks, pass a getter
createButton(props, () => ref);
```

## State vs Signal

```typescript
// React
const [value, setValue] = useState("");

// SolidJS
const [value, setValue] = createSignal("");
// Note: value is a function - call it: value()
```

## Effects

```typescript
// React - runs after render
useEffect(() => {
  console.log(count);
}, [count]);

// SolidJS - runs synchronously when dependencies change
createEffect(() => {
  console.log(count()); // Auto-tracked
});
```

## DOM Event Paths vs Synchronous Updates (IMPORTANT)

Solid signal updates can mutate the live DOM while a native event is still
bubbling. React Aria often uses this ownership check in press and interaction
hooks:

```typescript
nodeContains(e.currentTarget, getEventTarget(e));
```

That is the right upstream rule: ignore events that did not originate inside the
current press target. In React, the synthetic event system and batching usually
mean the original target node is still attached while parent handlers run. In
Solid, a child `onPointerDown` can synchronously replace or remove that target
before the parent handler sees the same event. A live DOM containment check then
returns `false` even though the user's press really started inside the parent.

Use a dispatch-path fallback only for this same-event ownership question:

```typescript
function eventPathContains(parent: EventTarget | null | undefined, event: Event): boolean {
  const target = getEventTarget(event);
  if (parent instanceof Node && target instanceof Node && nodeContains(parent, target)) {
    return true;
  }

  return typeof event.composedPath === "function" && event.composedPath().includes(parent);
}
```

Rules for using this pattern:

1. Keep the upstream `nodeContains(parent, getEventTarget(event))` check first.
2. Use `composedPath()` only to answer "was this target in the browser dispatch
   path for this event?" not as a general replacement for live DOM containment.
3. The parent/current target must appear in the composed path, so outside events
   and portal-bubbled events are still rejected.
4. Add a regression where a child pointer handler synchronously replaces the
   original target before the parent press handler runs.

Current application: `solidaria/src/interactions/createPress.ts` uses this to
keep parent presses active when Solid replaces a child target during
`pointerdown`. This is a Solid timing adapter, not a behavioral fork: the same
user action should produce the same press/selection behavior as upstream React
Aria.

## Synthetic Keyboard Clicks and Press Modality (IMPORTANT)

React Aria sometimes funnels keyboard activation through the same downstream
click/press path as pointer activation. Menu items are one example: Space/Enter
keyboard handling can call `target.click()` so item action, selection, and close
logic share the same path.

In Solid, native event handlers run synchronously and our `createPress` sees
that synthetic click before later menu action code runs. `createPress` correctly
classifies the click as `virtual`, but Menu close defaults distinguish keyboard
activation from pointer/virtual activation (for example, Enter in a
multiple-selection menu closes by default, while a pointer click stays open).
Without a scoped guard, the intentional keyboard click can overwrite the
keyboard modality before the menu action layer reads it.

Rules for this pattern:

1. Do not monkey-patch `click()` or `createPress` globally.
2. Let `createPress` keep classifying real virtual clicks as virtual; this is
   needed for assistive technology and non-pointer activation.
3. For an intentional keyboard `.click()`, preserve the keyboard modality only
   around that dispatch and reset the guard in `finally`.
4. Add a modality-dependent regression: e.g. in Menu multiple selection, Enter
   closes by default but pointer click does not.

Current application: `solidaria/src/menu/createMenuItem.ts` wraps its deliberate
keyboard `.click()` so the menu-specific action/close layer observes the same
keyboard user action upstream React Aria does. This is a local event-order
adapter, not a behavioral fork.

## Synthetic Menu Mouse Clicks and Selection Feedback (IMPORTANT)

React Aria menu items also synthesize a click for the native menu interaction
where a user presses on the trigger, drags into the open menu, and releases on
an item. Upstream `useMenuItem` handles the release target by calling
`target.click()` in the different-origin mouse `onPressUp` branch, while
`useSelectableItem` selects that same target on mouse press-up.

In Solid, those native handlers run synchronously on the same element. The
selectable hook first selects the release target from `onPressUp`, then the
menu layer's intentional `target.click()` can re-enter the selectable press
handler as a virtual click. In a multiple-selection menu, that second virtual
selection toggles the release target back off even though the menu action still
fires. Upstream React still emits two public `onSelectionChange` callbacks in
this path because both selection requests compute from the same pre-render
controlled selection snapshot.

Rules for this pattern:

1. Keep upstream's `target.click()` behavior in the menu layer; it is the native
   menu drag-release activation path.
2. Do not change `createPress`'s global virtual-click behavior; assistive
   technology and programmatic activation still need it.
3. Suppress only the selectable-item state mutation during the menu layer's
   deliberate different-origin mouse click, replay the duplicate selection
   notification with the first press-up payload, and still allow the menu action
   click handler to run.
4. Hold the behavior with a React-vs-Solid comparison regression: the release
   target stays selected, React's duplicate selection callback count is matched,
   and action fires once.

Current application: `solidaria/src/menu/createMenuItem.ts` wraps the
`createSelectableItem` click handler while dispatching its deliberate mouse
`target.click()`, and replays the first press-up selection payload through the
lower selection state. This is a scoped Solid event-order adapter, not a monkey
patch.

## Controlled Components Pattern

React re-renders force DOM state. SolidJS needs explicit sync:

```typescript
// Sync DOM with state (especially for radio/checkbox)
createEffect(() => {
  const input = inputRef();
  if (input) {
    input.checked = isSelected();
  }
});
```

## MaybeAccessor Pattern

Allows both static and reactive values:

```typescript
type MaybeAccessor<T> = T | (() => T);

function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

// Usage in hook
function createToggle(props: MaybeAccessor<ToggleProps>) {
  const getProps = () => access(props);
  // Now getProps() always returns current props
}
```

## State helpers re-access props (IMPORTANT)

`createToggleState` does **not** freeze a `() => ({ isSelected })` object.
It calls `access(props)` on every read
(`packages/solid-stately/src/toggle/createToggleState.ts:51-64`). The same is
true of the other solid-stately helpers: they re-access, they do not snapshot.
F-SOLID-012 verified this; comments that say the accessor form "freezes"
controlled mode are wrong (listed on ticket #192 for #168 to remove).

```typescript
// Live — getProps() re-runs access(props) on every isSelected / setSelected / toggle
const state = createToggleState(() => ({
  isSelected: ariaProps.isSelected,
  onChange: ariaProps.onChange,
}));
```

What **does** freeze a prop is destructuring in a Solid component body (the body
runs once): `const { isSelected } = props`. That is what
`guard:idiomatic-solid` flags. Read `props.x` at each use, or split with
`splitProps`.

Getters on a plain object are still a valid way to pass lazy fields into a
helper that reads `props.isSelected` as a property rather than through
`access()`. They are not required to keep `createToggleState` live.

```typescript
const state = createToggleState({
  get isSelected() {
    return ariaProps.isSelected;
  },
  get onChange() {
    return ariaProps.onChange;
  },
});
```

## Cleanup

```typescript
// React
useEffect(() => {
  return () => cleanup(); // Return cleanup function
}, []);

// SolidJS
createEffect(() => {
  onCleanup(() => cleanup()); // Register cleanup
});
```

## Context

```typescript
// React
const Ctx = createContext(null);
const value = useContext(Ctx);

// SolidJS
const Ctx = createContext<State | null>(null);
const value = useContext(Ctx); // Same API
```

## Render Props in Components

```typescript
// solidaria-components pattern
<Switch>
  {(renderProps) => (
    <span data-selected={renderProps.isSelected}>
      {renderProps.isSelected ? 'On' : 'Off'}
    </span>
  )}
</Switch>
```

The `renderProps` object contains reactive values like `isSelected`, `isHovered`, etc.

## JSX-Valued Props and Evaluation Ownership

JSX-valued props are not inherently incompatible with SSR. Their evaluation
point matters: a contextual child must run under its provider, and server/client
initial structure must agree. Historical `template2 is not a function` failures
are not evidence for banning all JSX-valued props under Solid 2.

### The Problem

```typescript
// A JSX-valued prop: validate the component's actual consumption path.
interface ChipProps {
  icon?: JSX.Element;
}

// This signature alone does not establish a hydration defect:
<Chip icon={<span>★</span>} />
```

Do not eagerly read this prop outside the owner where its content belongs.

### The Solution

An existing render-function API can make deferred evaluation explicit. It is
not a reason to change a public JSX-valued API without an owning regression:

```typescript
// Explicit deferred-content API; still requires paired SSR/hydration proof.
interface ChipProps {
  icon?: string | (() => JSX.Element);
}

function Chip(props: ChipProps) {
  const renderIcon = () => {
    const icon = props.icon;
    if (!icon) return null;
    if (typeof icon === 'string') return icon;
    return icon();  // Call the function
  };

  return (
    <button>
      <Show when={props.icon}>
        <span>{renderIcon()}</span>
      </Show>
      ...
    </button>
  );
}

// Usage:
<Chip icon="★" />                       // String icon
<Chip icon={() => <MyIconComponent />} />  // Function returning JSX
```

### Where This Applies

Review the evaluation point of custom content, including:

- Icons in Chip, Menu, ListBox components
- Custom content in TimelineItem
- Custom labels or descriptions

## splitProps DOM Attribute Forwarding (IMPORTANT)

Sub-components in `solidaria-components` use `splitProps` to separate known props from the rest. The "rest" must be captured and spread onto the root DOM element, or consumer-provided attributes like `aria-label`, `data-testid`, and `id` are silently dropped.

### The Problem

```typescript
// ❌ BAD - rest object is discarded
export function NumberFieldInput(props: NumberFieldInputProps) {
  const [local] = splitProps(props, ['class', 'style', 'slot']);
  // Any aria-label, data-testid, id passed by the consumer is lost!
  return <input {...ariaProps} class={renderProps.class()} />;
}
```

### The Solution

```typescript
// ✅ GOOD - rest captured as domProps and spread on element
export function NumberFieldInput(props: NumberFieldInputProps) {
  const [local, domProps] = splitProps(props, ['class', 'style', 'slot']);
  return <input {...domProps} {...ariaProps} class={renderProps.class()} />;
}
```

### Rules

1. **Include `'children'` in the split list** when the component accesses `props.children`, so children don't leak into `domProps`. `splitProps` does not evaluate children; a getter read can. Share a child value where classification and insertion must use the same result, under the intended owner (see Hydration-Key Parity).
2. **Spread `{...domProps}` first** on the DOM element — ARIA/behavior props should come after so they can override
3. **Extend the interface** with DOM attributes so TypeScript accepts them:
   ```typescript
   export interface MyComponentProps
     extends
       SlotProps,
       Omit<JSX.HTMLAttributes<HTMLButtonElement>, "class" | "style" | "children"> {
     // component-specific props...
   }
   ```

### Where This Applies

All sub-components in `solidaria-components` that render a DOM element and use `splitProps`. This includes ~35 components across Menu, Select, NumberField, ComboBox, Color, Table, SearchField, Slider, GridList, Tree, TagGroup, ContextualHelpTrigger, and SelectionIndicator.

---

## SolidJS Children and Context Propagation (CRITICAL)

JSX children are commonly exposed through lazy getters. Evaluating a getter can
construct them before insertion, which matters for context propagation.
`splitProps` does not evaluate children; accessing the getter can.

### The Problem

Calling the children getter in JavaScript _before_ the provider is in the tree
(or resolving them with `children()` and then inserting the snapshot) evaluates
children **outside** the provider's context.

```typescript
// ❌ BAD - JS read instantiates children before the provider
export function ModalOverlay(props: ModalOverlayProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])
  const early = local.children  // getter ran OUTSIDE the provider

  return (
    <ContextProvider value={state}>
      <div>{early}</div>
    </ContextProvider>
  )
}
```

### The Solution

Keep the getter unread until JSX under the provider. Splitting `children` onto
`local` is fine — `{local.children}` inside the provider still evaluates there.

```typescript
// ✅ GOOD - getter runs when the provider inserts children
export function ModalOverlay(props: ModalOverlayProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <ContextProvider value={state}>
      <div>{local.children}</div>
    </ContextProvider>
  )
}
```

### Where This Applies

- Modal/ModalOverlay components
- DialogTrigger wrapping Dialog/Modal
- Any component that provides context to its children
- Overlay containers with Portal

### Reference

- https://github.com/solidjs/solid/issues/182
- https://github.com/solidjs/solid/discussions/574

---

## `children()` snapshots mixed text (CRITICAL)

Solid's `children()` helper (often imported as `resolveChildren`) resolves
children for inspection. Repository regressions found mixed-text children such
as `count: {n()}` becoming snapshots when consumed through these adapters:
the signal updated but the hydrated label did not. Do not assume every use of
`children()` loses reactivity; test the actual wrapper and consumption path.

This is the class #135 hit on Button, that #168 still has on ActionButton,
ToggleButton, LinkButton, Badge, Radio, SegmentedControl, and TagGroup, and
that #169 has on SelectBoxGroup. The landed Button adapter is
`createMemo(() => local.children)` (or rendering the getter directly) — it
re-runs the children getter instead of flattening dynamic members.
`guard:idiomatic-solid` flags snapshot-rendered `children()` sites; those
exports stay on a frozen baseline until #168 / #169 remove them.

### When `children()` is the right tool

Use it to _probe structure_: `.toArray()`, `.length`, or a `typeof` check on a
static child tree (Focusable/Pressable inspecting a single element, Breadcrumbs
counting static items). If the adapter materializes a snapshot for inspection,
do not assume it remains live when inserted as visible content. Prove updates
and adoption at the owning wrapper.

### Snapshot regressions to protect

Exercise rendered reactive text (`count: {n()}`) and child components whose
output changes, including styled wrappers that resolve children to choose a
text-only `<span>` / `<Text>` wrap. The regression is a snapshot that loses those
updates, not the presence of `children()` by itself.

### The adapter

```tsx
// ✅ GOOD — re-access the getter; do not flatten mixed text
const content = createMemo(() => local.children);
const textChild = () => getSingleTextChild(content());
return textChild() !== undefined ? <span>{textChild()}</span> : content();
```

Rendering `{local.children}` / `{props.children}` directly is also correct when
you do not need to probe.

### Share a value without freezing it

When classifying and inserting authored children, use the same value for both
operations within that evaluation:

```tsx
const raw = local.children; // evaluate under the intended owner
const isRenderProp = typeof raw === "function" && raw.length > 0;
```

This repository's helpers distinguish positive-arity render props from
zero-argument accessors; that is an API convention, not a universal Solid rule.
Repeated evaluation can instantiate additional children. #184 records the
Form+TextField regression that motivated sharing the result. It does not prove
that every getter read allocates a key, or that client getters are universally
memoized. Keep tracked evaluation for reactive inputs and defer contextual
children until their provider exists; a setup-time snapshot is not a general fix.

### Hydration

Validate compatible owner allocation, initial state and rendered structure with
fresh paired SSR/hydration. Require original node adoption and subsequent
behavior, not merely an absence of exceptions. See Hydration-Key Parity below.

---

## SSR-Compatible Styled Components Pattern (IMPORTANT)

Styled wrappers may use their headless component's supported render-prop API.
The callback must be evaluated under the intended owner, with compatible
initial structure and reactive values on server and client.

### The Problem

An inline render function is not itself a hydration defect. Function identity
does not need to match across server and client processes:

```typescript
// Valid API shape; validate owner placement and initial output.
<HeadlessSelect>
  {(renderProps) => (
    <>
      {children}
      <Icon class={renderProps.isOpen ? 'rotate' : ''} />
    </>
  )}
</HeadlessSelect>
```

### The Solution

When only styling depends on state, existing data attributes can avoid an
unnecessary render callback. They are an option, not a replacement for callbacks
that provide required content or behavior:

```typescript
// Alternative for styling-only state.
<HeadlessSelect class="group">
  {children}
  <Icon class="transition-transform group-data-open:rotate-180" />
</HeadlessSelect>
```

Tailwind's `data-*` variants (`data-open:`, `data-selected:`, `data-focused:`)
can style attributes already provided by the headless component.
Descendants do not inherit those attributes: target the attribute-bearing
element itself or use an explicit ancestor/group selector, as above.

### Pattern for Styled Components

```typescript
export function StyledComponent(props) {
  const [local, headlessProps] = splitProps(props, ['class', 'children'])

  const getClassName = (renderProps) => {
    // Dynamic classes based on renderProps - OK for class prop
    return computeClasses(renderProps)
  }

  return (
    <HeadlessComponent {...headlessProps} class={getClassName}>
      {/* Preserve lazy child evaluation under the headless owner. */}
      {local.children}
      {/* Descendant styling needs a selector for the state-bearing ancestor. */}
    </HeadlessComponent>
  )
}
```

---

## Hydration-Key Parity: Owners, Initial State and Lazy Construction (CRITICAL)

The installed Solid 2 rc.9 runtime uses owner-scoped hierarchical IDs, not one
global render counter. `sharedConfig.getNextContextId()` obtains the next child
ID of the current owner. Component owners are transparent; memos, computed
initializers, effects and `onSettled` registrations can affect owner allocation.
Server effects can reserve owners even when browser callbacks do not execute.
Do not skip a real registration only on the server or pad counters to hide a
mismatch. Literal signals and computed initializers have different allocation
semantics; inspect the installed implementation before generalizing.

Hydration needs compatible owner allocation, initial state and rendered
structure. Marker-based hydration does not remove these requirements. Missing
keys can throw or warn and create detached nodes; tag mismatches can warn. The
failure is not universally a whole-route abort, and no exception does not prove
successful adoption. Paired tests must reject diagnostics and verify node
identity and behavior.

The patterns below have caused repository regressions. They are reasons to
preserve justified child sharing and lazy construction, not a universal rule
about how many times any getter may be read.

### Bug class 1 — reading a props-children getter more than once

An authored children getter can construct components when evaluated. Probing
one evaluation and inserting another may use distinct child instances or owners.
Whether that diverges across SSR/hydration depends on the compiled getter and
its consumers; client getters are not universally memoized after their first
read. Share the result when classification and insertion must refer to the same
children, without moving evaluation outside their provider or freezing updates.

```tsx
// Avoid separate evaluations for classification and insertion.
function hasRenderChildren() {
  return typeof local.children === "function" && local.children.length > 0;
}
function ResolvedTabContent() {
  const value = hasRenderChildren() ? (local.children as Fn)(renderProps) : local.children;
  return typeof value === "string" ? <span>{value}</span> : value;
}
```

```tsx
// Share one value within the intended evaluation/owner.
function ResolvedTabContent() {
  const rawChildren = local.children;
  const isRenderProp =
    typeof rawChildren === "function" &&
    (rawChildren as (...a: unknown[]) => JSX.Element).length > 0;
  const contentValue = isRenderProp
    ? (rawChildren as (rp: TabRenderProps) => JSX.Element)(renderProps)
    : rawChildren;
  const value = resolveChildAccessor(contentValue);
  return typeof value === "string" ? <span ...>{value}</span> : value;
}
```

For reactive inputs, an owned memo can share one result per tracked evaluation.
Do not turn this local capture into a universal setup-time snapshot. Keep lazy
provider boundaries and existing stable render-prop lifetime semantics.

### Bug class 2 — eagerly-built conditional JSX that only one branch returns

A `const framed = (<div>…</div>)` is evaluated eagerly, even if the function
returns `collection` instead. An unused wrapper can claim nodes absent from the
server output, or move already-adopted collection nodes into detached DOM. Build
only the selected initial structure. The Tree regression also protects against
moving a shared collection into an unused wrapper; strings on the server do not
move nodes the way client DOM construction does.

```tsx
// ❌ BAD - constructs an unused wrapper that may claim or move live nodes.
const framed = (
  <div class={wrapper()}>
    {label}
    {collection}
    {description}
  </div>
);
return local.label || local.description ? framed : collection;
```

```tsx
// ✅ GOOD - construct the wrapper only inside the branch that returns it
if (local.label || local.description || local.renderActionBar) {
  return (
    <div class={wrapper()}>
      {local.label ? <div>{local.label}</div> : null}
      {collection}
      {local.description ? <div>{local.description}</div> : null}
    </div>
  );
}
return collection;
```

### Diagnosing a mismatch

1. Generate fresh SSR output with `vitest.ssr.config.ts`, then hydrate that
   fixture with `vitest.hydrate.config.ts` and the fail-closed `hydrateOverSsr`
   helper. Both compiler halves must retain hydratable output in test mode.
2. Capture server ID strings and original DOM nodes before hydration. Assert
   generated ID equality, exact node/ref adoption and subsequent interactions.
   Put a generated-ID sibling in the same owner after a suspect hook or branch
   to expose allocation differences that a nested child alone can hide.
3. Preserve exact missing-key, tag-mismatch and unclaimed-node diagnostics.
   Inspect the relevant installed compiler/runtime and actual authored-child
   evaluation path. If temporary instrumentation is needed, restore it in
   `finally`; a flat allocator call count cannot establish owner-tree parity.
4. Prove genuine streaming separately: observe an unresolved shell, deliver
   the later fragment and assert its adoption, updates and cleanup. Completed
   `renderToString` output or an already-complete stream is not that proof.

### Where This Applies

Any styled component that wraps a headless collection and forwards `props.children`
that may be a render-prop **or** hold a nested component (`<Text>`, an icon):

- `viviana-ui` `Tab` / `TabPanel` (`src/tabs/index.tsx`) — `ResolvedTabContent`,
  `TabPanel.renderedChildren`
- `viviana-ui` `GridListItem`/`ListViewItem` and `GridList` (`src/gridlist/index.tsx`)
  — `ResolvedItemContent` (shared evaluation) **and** the framed `label`/`description`/
  `renderActionBar` wrapper (lazy branch)
- Guard with paired SSR + hydrate regressions
  (`test/Collections.ssr.test.tsx`, `test/Collections.hydrate.test.tsx`): a
  fixture with a real `<Text>` child exercises component ownership that a plain
  string does not.

---

## Bare `solid-js/h` Sibling Reactivity (upstream limit)

The published Solid contract is compiled JSX. The comparison harness uses `hc`,
which mirrors compiled-JSX creation. Bare `solid-js/h` is not a supported
consumer path.

`solid-js/h` creates sibling components inside one tracked insert effect.
When a sibling `Show` flips, that effect re-runs, disposes every sibling it
owns, and `h` hands back dead nodes. Tabs wired with bare `h` therefore leave
zombie DOM after a panel change. This is an upstream hyperscript limitation,
not a Tabs state-machine defect.

Keep `packages/solid-spectrum/test/TabsFixtureRepro.test.tsx` as `it.fails`
documentation. Do not count that case as Tabs evidence. Ticket #167 records
the owner decision.

---

## Overlay Positioning Pattern (IMPORTANT)

Overlay components (Popover, Tooltip, Dialog) need careful positioning to work correctly.

### Use position: fixed with viewport coordinates

Overlays rendered in Portal should use `position: fixed` and coordinates directly from `getBoundingClientRect()`:

```typescript
const updatePosition = (): boolean => {
  const trigger = getTriggerRef();
  if (!trigger || !overlayRef) return false;

  const triggerRect = trigger.getBoundingClientRect();

  // CRITICAL: Validate dimensions - display:contents wrappers return zeros
  if (triggerRect.width === 0 || triggerRect.height === 0) {
    return false; // Need to retry
  }

  // For overlay dimensions, use offsetWidth/offsetHeight (more reliable)
  const overlayWidth = overlayRef.offsetWidth;
  const overlayHeight = overlayRef.offsetHeight;
  const offset = 8;

  // Calculate position based on placement
  let top = triggerRect.bottom + offset; // 'bottom' placement
  let left = triggerRect.left + (triggerRect.width - overlayWidth) / 2; // centered

  setPositionStyles({
    top: `${top}px`,
    left: `${left}px`,
    visibility: "visible",
  });

  return true;
};
```

### Position calculation with retry logic

Use retry logic to handle timing issues with `display: contents` wrappers and deferred layout:

```typescript
createEffect(() => {
  if (!isOpen()) return;

  let retryCount = 0;
  const maxRetries = 5;

  const tryUpdatePosition = () => {
    const success = updatePosition();
    if (!success && retryCount < maxRetries) {
      retryCount++;
      // setTimeout more reliable than rAF across environments (JSDOM)
      setTimeout(tryUpdatePosition, 16);
    }
  };

  requestAnimationFrame(tryUpdatePosition);
});
```

### Visibility: start visible for accessibility

For tooltips, start visible at 0,0 instead of hidden. This ensures the tooltip is always accessible to screen readers and testing tools, even if positioning happens asynchronously:

```typescript
const [positionStyles, setPositionStyles] = createSignal({
  top: "0px",
  left: "0px",
  visibility: "visible", // Always accessible, position updates async
});
```

For dialogs/popovers where a flash at 0,0 would be jarring, use `visibility: 'hidden'` initially.

### Handle display: contents wrappers

Elements with `display: contents` have `getBoundingClientRect()` returning zeros. Find the first visible child:

```typescript
const findVisibleChild = (el: Element): HTMLElement | null => {
  if (el instanceof HTMLElement) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return el;
    }
    for (const child of el.children) {
      const found = findVisibleChild(child);
      if (found) return found;
    }
  }
  return null;
};

// In TriggerWrapper for tooltips
const handleRef = (span: HTMLSpanElement) => {
  const visibleChild = findVisibleChild(span);
  props.ref(visibleChild || span);
};
```

---

## Trigger Ref Protection Pattern (IMPORTANT)

When a trigger component (PopoverTrigger, DialogTrigger) provides context to its children, buttons INSIDE the overlay content may mistakenly register as the trigger.

### The Problem

```tsx
<PopoverTrigger>
  <Button>Open</Button> {/* ← Should be trigger */}
  <Popover>
    <Button>Cancel</Button> {/* ← Also sees PopoverTriggerContext! */}
    <Button>Confirm</Button> {/* ← And this one too! */}
  </Popover>
</PopoverTrigger>
```

All buttons see the same context and try to register. The last one wins, breaking positioning.

### The Solution

Only set the trigger ref once - the first button to register is the actual trigger:

```typescript
export function PopoverTrigger(props: PopoverTriggerProps) {
  let triggerRef: HTMLElement | null = null;
  let triggerRefSet = false;  // Guard flag

  const contextValue = createMemo(() => ({
    // ...state handlers...
    setTriggerRef: (el: HTMLElement | null) => {
      // Only set once - first button is the trigger
      if (!triggerRefSet && el) {
        triggerRef = el;
        triggerRefSet = true;
      }
    },
  }));

  return (
    <PopoverTriggerContext.Provider value={contextValue()}>
      {props.children}
    </PopoverTriggerContext.Provider>
  );
}
```

### Where This Applies

- PopoverTrigger with action buttons in popover
- DialogTrigger with close/confirm buttons in dialog
- MenuTrigger with button menu items
- Any trigger wrapper where content contains interactive elements

---

## ComboBox Blur Handling Pattern (IMPORTANT)

When implementing dropdown components (ComboBox, Select with search), clicking on dropdown options can cause blur events that close the menu before the click completes.

### The Problem

When clicking on a non-focusable element (like `<li>` with `tabIndex=-1`):

1. Input loses focus (blur event fires)
2. Blur handler closes the menu
3. Click event never fires because the target is gone

### The Solution

Use `requestAnimationFrame` to delay blur handling:

```typescript
const handleBlur = (e: FocusEvent) => {
  // Delay blur handling to allow click events to complete
  requestAnimationFrame(() => {
    // Check if menu was already closed by option click
    if (!state.isOpen()) {
      return;
    }

    // Check if focus moved to an expected target
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget?.closest(`[id="${listBoxId}"]`)) {
      return;
    }

    // Close the menu
    state.close();
  });
};
```

Additionally, prevent focus from being stolen by adding capture-phase handlers on the listbox:

```typescript
const setupMouseDownHandler = (el: HTMLUListElement) => {
  if (el) {
    el.addEventListener("mousedown", (e) => e.preventDefault(), true);
    el.addEventListener("pointerdown", (e) => e.preventDefault(), true);
  }
};
```

### Key Insights

1. **relatedTarget is null**: When clicking on `<li>` with `tabIndex=-1`, the browser doesn't know where focus is going, so `e.relatedTarget` is `null`
2. **preventDefault on mousedown**: Prevents the default focus-stealing behavior
3. **Global pointerdown listener**: Track clicks inside the listbox using a document-level capture listener since `createPress` calls `stopPropagation()`
4. **requestAnimationFrame timing**: Allows the click event to complete before checking whether to close

---

## solid-refresh HMR and Context Propagation (IMPORTANT)

Historical refresh investigations exposed child-evaluation ownership mistakes.
Do not generalize an old wrapper transform to the installed plugin: inspect the
actual emitted wrapper when diagnosing development-only behavior. Paired SSR/
hydrate tests disable refresh instrumentation; they do not certify HMR.

In rc.9, `useContext` reads context from the current owner. Wrapping that read
in a memo does not create a missing provider ancestor or make a static context
lookup reactive. `Show` is not a scheduling guarantee that a provider will
appear. Preserve required missing-context errors; do not replace them with a
silent null fallback to hide an ownership defect.

### For Parent Components

Keep contextual children lazy until they are evaluated under the provider.
Direct children and supported render-prop helpers can both satisfy this; inspect
the helper's owner/evaluation behavior instead of banning it by name:

```typescript
// ✅ GOOD - Children rendered directly in context scope
const resolvedChildren = () => {
  const children = local.children;
  if (typeof children === 'function') {
    return children(renderValues());
  }
  return children;
};

return (
  <ContextProvider value={state}>
    {resolvedChildren()}  {/* Evaluated INSIDE provider */}
  </ContextProvider>
);
```

### Where This Applies

- RadioGroup + Radio
- Tabs + Tab
- CheckboxGroup + Checkbox
- Any parent-child component pair using context

---

## Testing with requestAnimationFrame Positioning (IMPORTANT)

Overlay components (Popover, Tooltip, Dialog) use `requestAnimationFrame` to position after initial render. This causes test issues.

### The Problem

```typescript
// In component - position after render
const [positionStyles, setPositionStyles] = createSignal({
  visibility: "hidden", // Start hidden
});

createEffect(() => {
  requestAnimationFrame(() => {
    setPositionStyles({ visibility: "visible", top: "100px", left: "50px" });
  });
});
```

In tests:

```typescript
// ❌ FAILS - rAF hasn't executed yet
await user.click(button);
screen.getByRole("dialog"); // Element has visibility: hidden, not accessible!
```

### The Solution

Use `waitFor` to allow `requestAnimationFrame` to complete:

```typescript
// ✅ GOOD - Wait for visibility change
await user.click(button);

await waitFor(() => {
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
```

### With Fake Timers

If the test uses `vi.useFakeTimers()` (common for tooltip delay testing), switch to real timers for rAF tests:

```typescript
it('should have role="tooltip"', async () => {
  vi.useRealTimers();  // Switch to real timers

  render(() => (/* ... */));

  await waitFor(() => {
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  vi.useFakeTimers();  // Restore for other tests
});
```

### Key Insight

`vi.useFakeTimers()` does NOT mock `requestAnimationFrame` in JSDOM. Tests using fake timers but relying on rAF need to temporarily use real timers.
