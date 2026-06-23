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

## Getter Pattern for Controlled Components (IMPORTANT)

When passing props to state creation functions, **never use arrow functions returning object literals**. Use objects with getters instead.

### The Problem

```typescript
// ❌ BAD - props are captured when the object is created
const state = createToggleState(() => ({
  isSelected: ariaProps.isSelected, // Read immediately, not reactive!
  onChange: ariaProps.onChange,
}));
```

Even though we're passing a function, the object literal inside evaluates `ariaProps.isSelected` immediately when the function runs. The value gets "frozen" and won't update when the parent changes the prop.

### The Solution

```typescript
// ✅ GOOD - props are read lazily via getters
const state = createToggleState({
  get isSelected() {
    return ariaProps.isSelected;
  },
  get onChange() {
    return ariaProps.onChange;
  },
});
```

Getters defer reading until the state function actually accesses the property, which happens inside a reactive context.

### Why This Happens

In React, components re-run on every prop change, so this pattern works. In SolidJS:

1. Component functions run **once**
2. Reactivity comes from signals tracked in reactive contexts
3. Object literals evaluate their properties immediately
4. Getters defer evaluation until access time

### Where to Apply This

Use getters when calling state creation functions in `solidaria-components`:

| Function                   | Package       |
| -------------------------- | ------------- |
| `createToggleState`        | solid-stately |
| `createRadioGroupState`    | solid-stately |
| `createCheckboxGroupState` | solid-stately |
| `createTextFieldState`     | solid-stately |

```typescript
// In solidaria-components/src/Switch.tsx
const state = createToggleState({
  get isSelected() {
    return ariaProps.isSelected;
  },
  get defaultSelected() {
    return ariaProps.defaultSelected;
  },
  get onChange() {
    return ariaProps.onChange;
  },
  get isReadOnly() {
    return ariaProps.isReadOnly;
  },
});

// In solidaria-components/src/RadioGroup.tsx
const state = createRadioGroupState({
  get value() {
    return props.value;
  },
  get defaultValue() {
    return props.defaultValue;
  },
  get onChange() {
    return props.onChange;
  },
  get isDisabled() {
    return props.isDisabled;
  },
  // ... etc
});
```

### Quick Test

If controlled mode doesn't work (parent signal changes but component doesn't update), check if you're using getters.

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

1. **Include `'children'` in the split list** when the component accesses `props.children`, so children don't leak into `domProps`
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

In SolidJS, children are **lazily evaluated** - they're only evaluated when they're actually rendered. This has critical implications for context propagation.

### The Problem

When you access `children` via `splitProps` or destructuring before rendering them inside a context provider, the children evaluate **outside** the provider's context.

```typescript
// ❌ BAD - breaks context propagation
export function ModalOverlay(props: ModalOverlayProps) {
  const [local, rest] = splitProps(props, [
    'children',  // This causes early evaluation!
    'class',
    // ...
  ])

  return (
    <ContextProvider value={state}>
      <div>{local.children}</div>  // Children already evaluated OUTSIDE provider!
    </ContextProvider>
  )
}
```

### The Solution

Never include `'children'` in `splitProps`. Use `props.children` directly in the render:

```typescript
// ✅ GOOD - preserves context propagation
export function ModalOverlay(props: ModalOverlayProps) {
  const [local, rest] = splitProps(props, [
    'class',  // NO 'children' here!
    // ...
  ])

  return (
    <ContextProvider value={state}>
      <div>{props.children}</div>  // Children evaluated INSIDE provider!
    </ContextProvider>
  )
}
```

### Also Avoid the `children()` Helper

The SolidJS `children()` helper also causes early evaluation:

```typescript
// ❌ BAD - children() evaluates immediately
import { children } from 'solid-js'

function MyComponent(props) {
  const resolved = children(() => props.children)  // Evaluated NOW!

  return (
    <ContextProvider>
      {resolved()}  // Too late - already evaluated outside context
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
