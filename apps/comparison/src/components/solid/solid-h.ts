import h from "solid-js/h";
import { createMemo } from "solid-js";
import { createComponent } from "solid-js/web";

type ComponentLike = string | ((props: never) => unknown);
type Props = Record<string, unknown>;
type Child = unknown;
type Children = readonly Child[];
type MarkedRenderProp<T> = ((item: T) => unknown) & {
  readonly __comparisonRenderProp: true;
};
const RENDER_PROP_MARKER = "__comparisonRenderProp";
const HC_THUNK = Symbol("comparison-hc-thunk");

type HcThunk = (() => unknown) & { [HC_THUNK]?: true };

/**
 * Comparison-app wrapper around `solid-js/h`.
 *
 * Intrinsic elements delegate to `h`. Solid components do NOT: `solid-js/h`
 * defers component creation into thunks that dom-expressions unwraps inside a
 * shared array render effect, so the effect that CREATES sibling components is
 * the same tracked scope that READS their returned reactive accessors (e.g. a
 * `Show`-rooted TabPanel). When one accessor flips, the effect re-runs,
 * disposes every sibling it owns, and `h`'s one-shot thunks hand back the same
 * dead nodes — connected DOM whose reactivity is permanently disposed.
 *
 * Instead, components mirror compiled-JSX semantics: `createComponent` plus a
 * lazy `children` getter that eagerly instantiates hc component children and
 * memo-wraps plain function children, so creation always happens one owner
 * level above the accessor-unwrapping insert effect.
 *
 * For Solid components, pass child thunks as arrays. A zero-argument function
 * child is ambiguous in `solid-js/h`: it can look like a render prop while also
 * being a normal child accessor, which can leave context/state readers stale.
 */
export function hc(
  component: ComponentLike,
  props?: Props | null,
  children?: Children | MarkedRenderProp<any>,
) {
  const normalizedProps = normalizeCallbackProps(component, props);

  if (typeof children === "function" && children[RENDER_PROP_MARKER] !== true) {
    throw new TypeError("Use child arrays, or renderProp(fn) for intentional render props.");
  }

  if (typeof component === "string") {
    if (typeof children === "function") {
      return h(component as never, normalizedProps ?? {}, children);
    }
    if (children === undefined) {
      return h(component as never, normalizedProps ?? {});
    }
    return h(component as never, normalizedProps ?? {}, [...children]);
  }

  const builtProps = unwrapAccessorProps(cloneProps(normalizedProps));
  if (typeof children === "function") {
    builtProps.children = children;
  } else if (children !== undefined) {
    const slots = [...children];
    Object.defineProperty(builtProps, "children", {
      configurable: true,
      enumerable: true,
      get: () => resolveChildSlots(slots),
    });
  }

  const thunk: HcThunk = () => createComponent(component as never, builtProps);
  Object.defineProperty(thunk, HC_THUNK, { value: true, enumerable: false });
  return thunk as unknown as ReturnType<typeof h>;
}

/**
 * Resolve a component's child slots at `props.children` access time, i.e.
 * inside the parent's insert effect (correct context, stable owner):
 * - hc component thunks are instantiated eagerly, exactly like compiled JSX
 *   instantiates static component children; their returned accessors are left
 *   intact for the insert machinery to track in its own downstream effect.
 * - plain zero-argument functions (dynamic expressions, `h` element thunks,
 *   tree-building closures) are wrapped in a memo, exactly like compiled JSX
 *   memo-wraps `{expression}` children, so their tracked reads re-run only the
 *   memo — never the shared effect that owns sibling components.
 */
function resolveChildSlots(slots: readonly Child[]) {
  const resolved = slots.map((child) => {
    if (typeof child !== "function") {
      return child;
    }
    if ((child as HcThunk)[HC_THUNK] === true) {
      return (child as HcThunk)();
    }
    return createMemo(() => resolveDeep((child as () => unknown)()));
  });
  return resolved.length === 1 ? resolved[0] : resolved;
}

function resolveDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(resolveDeep);
  }
  if (typeof value === "function" && (value as HcThunk)[HC_THUNK] === true) {
    return resolveDeep((value as HcThunk)());
  }
  return value;
}

export function renderProp<T>(fn: (item: T) => unknown) {
  Object.defineProperty(fn, RENDER_PROP_MARKER, {
    value: true,
    enumerable: false,
  });
  return fn as MarkedRenderProp<T>;
}

function normalizeCallbackProps(component: ComponentLike, props?: Props | null) {
  if (!props || typeof component === "string") {
    return props;
  }

  // `solid-js/h` treats zero-argument function props on components as dynamic
  // accessors. Preserve callback-shaped props so reading them does not fire.
  let normalized: Props | undefined;
  const descriptors = Object.getOwnPropertyDescriptors(props);

  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!isCallbackProp(key) || typeof descriptor.value !== "function") {
      continue;
    }

    normalized ??= Object.defineProperties({}, descriptors) as Props;
    const callback = descriptor.value;
    Object.defineProperty(normalized, key, {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: () => callback,
    });
  }

  return normalized ?? props;
}

function isCallbackProp(key: string) {
  return key.startsWith("on") || key.startsWith("render");
}

/**
 * Mirror `solid-js/h`'s dynamic-prop convention on the component path: a
 * zero-argument function prop is a reactive accessor and becomes a getter that
 * calls it. Callback-shaped keys (`on*`/`render*`), `ref`, and `children` stay
 * raw — normalizeCallbackProps already pinned the callbacks, and children are
 * handled by the slot machinery.
 */
function unwrapAccessorProps(props: Props): Props {
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(props))) {
    if (key === "ref" || key === "children" || isCallbackProp(key)) {
      continue;
    }
    const accessor = descriptor.value;
    if (typeof accessor !== "function" || accessor.length !== 0) {
      continue;
    }
    Object.defineProperty(props, key, {
      configurable: true,
      enumerable: true,
      get: () => (accessor as () => unknown)(),
    });
  }
  return props;
}

function cloneProps(props?: Props | null) {
  return props == null
    ? {}
    : (Object.defineProperties({}, Object.getOwnPropertyDescriptors(props)) as Props);
}
