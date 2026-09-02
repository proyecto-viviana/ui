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

## JSX.Element Props Cause Hydration Errors (IMPORTANT)

In SolidJS SSR, passing `JSX.Element` directly as a prop value causes "template2 is not a function" hydration errors.

### The Problem

```typescript
// ❌ BAD - causes hydration mismatch
interface ChipProps {
  icon?: JSX.Element;
}

// Usage that breaks SSR:
<Chip icon={<span>★</span>} />
```

The JSX is evaluated during SSR differently than during client hydration, causing a mismatch.

### The Solution

Use a render function pattern instead:

```typescript
// ✅ GOOD - SSR-safe
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

Any component prop that accepts JSX for custom rendering:

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

1. **Include `'children'` in the split list** when the component accesses `props.children`, so children don't leak into `domProps`. `splitProps` does not evaluate children; a getter read does. Splitting `children` is fine. Reading the getter twice is not (see Hydration-Key Parity).
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

In SolidJS, children are **lazily evaluated** - they're only evaluated when
they're actually rendered. This has critical implications for context
propagation. `splitProps` does **not** evaluate children; accessing the getter
does.

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

Solid's `children()` helper (often imported as `resolveChildren`) memos the
_resolved_ child nodes. A mixed-text child such as `count: {n()}` becomes a
text-node snapshot. Rendering that snapshot after hydration keeps the server
value; the signal can update and the label will not.

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
counting static items). Do not then render the resolved snapshot as the visible
content if that content may contain reactive text or a child whose output
changes.

### When it is wrong

Any rendered content that may contain reactive text (`count: {n()}`) or a child
component whose output changes. That includes styled wrappers that resolve
children only to decide a text-only `<span>` / `<Text>` wrap.

### The adapter

```tsx
// ✅ GOOD — re-access the getter; do not flatten mixed text
const content = createMemo(() => local.children);
const textChild = () => getSingleTextChild(content());
return textChild() !== undefined ? <span>{textChild()}</span> : content();
```

Rendering `{local.children}` / `{props.children}` directly is also correct when
you do not need to probe.

### The one-read rule

`props.children` is a getter. Read it **once** before probing `typeof`:

```tsx
const raw = local.children; // single read → server and client emit the same count
const isRenderProp = typeof raw === "function" && raw.length > 0;
```

A second read on the server re-instantiates nested components and desyncs
hydration keys. #184 is the Form+TextField cost of instantiating children a
different number of times on server vs client. See Hydration-Key Parity below.

### Hydration

If the server and client instantiate children a different number of times —
`children()` on one side, a memoized getter on the other, or two getter reads
on the server only — Solid's per-render hydration-key counter drifts and the
mismatch aborts interactivity for the whole route.

---

## SSR-Compatible Styled Components Pattern (IMPORTANT)

Styled UI components that wrap headless components must avoid inline render functions to prevent SSR hydration mismatches.

### The Problem

Inline arrow functions as `children` create new function identities between server and client renders:

```typescript
// ❌ BAD - Creates new function on every render
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

Use CSS data attributes for conditional styling and render children directly:

```typescript
// ✅ GOOD - No render functions, uses data attributes
<HeadlessSelect class={getClassName}>
  {children}
  <Icon class="transition-transform data-open:rotate-180" />
</HeadlessSelect>
```

Tailwind's `data-*` variants (`data-open:`, `data-selected:`, `data-focused:`) provide SSR-safe conditional styling.

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
      {/* Render children directly - no arrow functions */}
      {local.children}
      {/* Use data attributes for conditional styling */}
      <Icon class="data-open:rotate-180" />
      <Indicator class="hidden data-selected:block" />
    </HeadlessComponent>
  )
}
```

---

## Hydration-Key Parity: Read `props.children` Once, Build Conditional JSX Lazily (CRITICAL)

Solid assigns every SSR node a **hydration key** from a single per-render counter
(`sharedConfig.getNextContextId()`), advanced once for every DOM element
(`getNextElement`), every `createComponent`, and every `createUniqueId`. Client
hydration replays the **exact same walk** and expects the keys in the exact same
order. If the server advances the counter a different number of times than the
client — even by one — the client eventually asks for a key the server never
emitted and Solid throws a **Hydration Mismatch**
(`Unable to find DOM nodes for hydration key: <k>`). Critically, that single
mismatch **aborts hydration for the entire route**, not just the offending
subtree: the whole page renders but silently loses all interactivity.

Two authoring patterns desync the counter. Both are easy to write and neither
fails SSR _or_ client render in isolation — only the paired hydrate run catches
them. A third — `children()` flattening mixed text into a snapshot — is named
in `children()` snapshots mixed text above (#135 / #168 / #169); it can also
advance keys a different number of times on server vs client when the snapshot
and a live getter instantiate children differently (#184).

### Bug class 1 — reading a props-children getter more than once

`props.children` is a getter. **On the server, every access re-instantiates any
component the JSX holds** (each read re-runs `createComponent` for a nested
`<Text>`, icon, etc.), so N reads emit N instances and advance the counter N
times. **On the client the same getter is memoized after the first read**, so N
reads yield 1 instance. Read children twice on the server (a common shape: one
read to _probe_ whether it's a render-prop function, a second to use the value)
and the server emits one extra element than the client — mismatch.

```tsx
// ❌ BAD - two reads of local.children; server double-instantiates a <Text> child
function hasRenderChildren() {
  return typeof local.children === "function" && local.children.length > 0; // read #1
}
function ResolvedTabContent() {
  const value = hasRenderChildren()
    ? (local.children as Fn)(renderProps) // read #2 (server re-instantiates <Text>)
    : local.children; // ...or here
  return typeof value === "string" ? <span>{value}</span> : value;
}
```

```tsx
// ✅ GOOD - read local.children EXACTLY ONCE, then branch on the captured value
function ResolvedTabContent() {
  const rawChildren = local.children; // single read → server & client emit the same count
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

This is why the solid-refresh section above insists on
`const children = local.children;` — it is not only about context scope; a single
read is what keeps the hydration-key count equal on both sides.

### Bug class 2 — eagerly-built conditional JSX that only one branch returns

A `const framed = (<div>…</div>)` is evaluated **eagerly**, the moment the line
runs — even if the function goes on to `return collection` instead. Under
hydration that eager evaluation still calls `getNextElement` for a wrapper the
server (which took the other branch) never rendered → the client walks one DOM
node ahead of the server → mismatch.

```tsx
// ❌ BAD - `framed` is built even when we return `collection`; its <div> steals a key
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

Instrument the allocator and diff the SSR vs client allocation order — the first
index where the two sequences diverge names the exact call site:

```ts
import { sharedConfig } from "solid-js"; // NOTE: core, NOT "solid-js/web" (undefined there)

const seq: string[] = [];
const orig = sharedConfig.getNextContextId;
sharedConfig.getNextContextId = function () {
  const id = orig.call(this);
  seq.push(id + " <- " + new Error().stack?.split("\n")[2]?.trim());
  return id;
};
// run renderToString for the SSR trace, hydrate for the client trace, then diff seq.
```

The runner swallows `console.log`; `writeFileSync` the sequence to a scratch file
and compare. A matching prefix that diverges at index K, where the server has one
extra `_$ssrElement <- <ChildComponent>` allocation, is the double-read fingerprint.

### Where This Applies

Any styled component that wraps a headless collection and forwards `props.children`
that may be a render-prop **or** hold a nested component (`<Text>`, an icon):

- `viviana-ui` `Tab` / `TabPanel` (`src/tabs/index.tsx`) — `ResolvedTabContent`,
  `TabPanel.renderedChildren`
- `viviana-ui` `GridListItem`/`ListViewItem` and `GridList` (`src/gridlist/index.tsx`)
  — `ResolvedItemContent` (read-once) **and** the framed `label`/`description`/
  `renderActionBar` wrapper (lazy branch)
- Guard with paired SSR + hydrate regressions
  (`test/Collections.ssr.test.tsx`, `test/Collections.hydrate.test.tsx`): a
  fixture whose child is a real `<Text>` (not a raw string) is what exposes the
  double-instantiation; a plain-string fixture will not.

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

When using `solid-refresh` (Vite's HMR for SolidJS), component functions get wrapped in `createMemo`. This can cause context lookup issues.

### The Problem

```typescript
// ❌ BAD - useContext evaluated in solid-refresh memo wrapper
function Radio(props: RadioProps) {
  const state = useContext(RadioGroupStateContext);  // Called in memo BEFORE Provider renders
  if (!state) {
    throw new Error('Radio must be used within a RadioGroup');
  }
  return <RadioImpl state={state} {...props} />;
}
```

With `solid-refresh`, the component becomes roughly:

```typescript
const Radio = createMemo(() => {
  const state = useContext(RadioGroupStateContext); // Evaluated too early!
  // ...
});
```

### The Solution

Use `createMemo` + `Show` to defer context lookup:

```typescript
// ✅ GOOD - Context lookup deferred via Show's callback
function Radio(props: RadioProps) {
  const getState = createMemo(() => useContext(RadioGroupStateContext));

  return (
    <Show when={getState()} fallback={null} keyed>
      {(state) => <RadioImpl radioProps={props} state={state} />}
    </Show>
  );
}
```

Key points:

1. Wrap `useContext` in `createMemo` - this makes the context access reactive
2. Use `Show` with a callback `{(state) => ...}` - the callback runs AFTER the parent Provider renders
3. Use `fallback={null}` instead of throwing - HMR may temporarily have missing context

### For Parent Components

Also ensure parent components use `local.children` directly, not `renderProps.renderChildren()`:

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
