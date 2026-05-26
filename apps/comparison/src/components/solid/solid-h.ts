import h from "solid-js/h";

type ComponentLike = string | ((props: never) => unknown);
type Props = Record<string, unknown>;
type Child = unknown;
type Children = readonly Child[];
type MarkedRenderProp<T> = ((item: T) => unknown) & {
  readonly __comparisonRenderProp: true;
};
const RENDER_PROP_MARKER = "__comparisonRenderProp";

/**
 * Comparison-app wrapper around `solid-js/h`.
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

  if (typeof children === "function") {
    if (children[RENDER_PROP_MARKER] === true) {
      return h(component as never, normalizedProps ?? {}, children);
    }

    throw new TypeError("Use child arrays, or renderProp(fn) for intentional render props.");
  }

  if (children === undefined) {
    return h(component as never, normalizedProps ?? {});
  }

  const propsWithChildren =
    typeof component === "string" ? (normalizedProps ?? {}) : cloneProps(normalizedProps);

  return h(component as never, propsWithChildren, [...children]);
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

function cloneProps(props?: Props | null) {
  return props == null
    ? {}
    : (Object.defineProperties({}, Object.getOwnPropertyDescriptors(props)) as Props);
}
