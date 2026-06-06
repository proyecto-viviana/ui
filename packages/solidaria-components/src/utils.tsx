/**
 * Utility functions for solidaria-components
 * Port of react-aria-components/src/utils.tsx
 */

import {
  type JSX,
  type Accessor,
  type FlowComponent,
  type ParentComponent,
  createContext,
  useContext,
  createMemo,
  createSignal,
  onMount,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";

/**
 * Render props pattern - children can be a function that receives state
 */
export type RenderChildren<T> = JSX.Element | ((renderProps: T) => JSX.Element);

/**
 * Class name can be a string or a function that computes based on state
 */
export type ClassNameOrFunction<T> = string | ((renderProps: T) => string);

/**
 * Style can be an object or a function that computes based on state
 */
export type StyleOrFunction<T> = JSX.CSSProperties | ((renderProps: T) => JSX.CSSProperties);

/**
 * Common render props interface
 */
export interface RenderPropsBase<T> {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<T>;
  /** The CSS className for the element. A function may be provided to compute the class based on state. */
  class?: ClassNameOrFunction<T>;
  /** The inline style for the element. A function may be provided to compute the style based on state. */
  style?: StyleOrFunction<T>;
}

/**
 * Slot props for named slots
 */
export interface SlotProps {
  /** A slot name for the component. */
  slot?: string;
}

export const DEFAULT_SLOT = "default";

/**
 * Return type for useRenderProps
 */
export interface RenderPropsResult<T> {
  /** Accessor for class - safe to call anytime */
  class: Accessor<string>;
  /** Accessor for style - safe to call anytime */
  style: Accessor<JSX.CSSProperties | undefined>;
  /**
   * Render the children. This is a function that returns JSX, NOT a getter.
   * For SSR compatibility, this should be called within the JSX tree.
   *
   * Usage in components:
   *   {renderProps.renderChildren()}
   *
   * Or if you need the raw children/function:
   *   {renderProps.renderChildren()}
   */
  renderChildren: () => JSX.Element;
  /** The raw children prop (function or JSX) - use renderChildren() in most cases */
  children: RenderChildren<T> | undefined;
  /** The render props values accessor */
  values: Accessor<T>;
}

/**
 * Resolves render props (children, class, style) based on component state.
 *
 * For SSR compatibility, children are NOT evaluated eagerly. Instead:
 * - Use `renderChildren()` to render children with current values
 * - Or access `children` directly if you need the raw prop
 *
 * This avoids the getter pattern that causes SSR hydration mismatches.
 */
export function useRenderProps<T extends object>(
  props: RenderPropsBase<T> & { defaultClassName?: string },
  values: Accessor<T>,
): RenderPropsResult<T> {
  // Don't destructure children — access lazily to avoid eager evaluation
  // that would trigger child component creation before context providers mount.
  const { class: className, style, defaultClassName = "" } = props;

  // Compute class and style eagerly (they don't depend on context)
  const computedClass = createMemo(() => {
    const currentValues = values();
    return typeof className === "function"
      ? className(currentValues)
      : (className ?? defaultClassName);
  });

  const computedStyle = createMemo(() => {
    const currentValues = values();
    return typeof style === "function" ? style(currentValues) : style;
  });

  // Return object with explicit function for rendering children
  // Children are accessed lazily during render (inside context providers)
  return {
    class: computedClass,
    style: computedStyle,
    renderChildren: () => {
      const currentValues = values();
      const children = props.children;
      return typeof children === "function" ? children(currentValues) : children;
    },
    get children() {
      return props.children;
    },
    values,
  };
}

export function composeRenderProps<T extends object>(
  base: RenderPropsBase<T> | undefined,
  override: RenderPropsBase<T> | undefined,
): RenderPropsBase<T> {
  if (!base) return override ?? {};
  if (!override) return base;
  return {
    children: override.children ?? base.children,
    class: override.class ?? base.class,
    style: override.style ?? base.style,
  };
}

/**
 * Context value that can be null or the actual value
 */
export type ContextValue<T> = T | null;

/**
 * Creates a context with props and ref merging support
 */
export function createSlottedContext<T>() {
  return createContext<T | null>(null);
}

/**
 * Use context with null check
 */
export function useSlottedContext<T>(
  context: ReturnType<typeof createContext<T | null>>,
): T | null {
  return useContext(context);
}

export function useContextProps<TProps extends object, TRef>(
  props: TProps,
  ref: TRef,
  context?: ContextValue<Partial<TProps>>,
): [TProps, TRef] {
  if (!context) return [props, ref];
  return [{ ...(context as TProps), ...props }, ref];
}

export const Provider: ParentComponent<{
  values: Array<[ReturnType<typeof createContext<unknown>>, unknown]>;
}> = (props) => {
  return props.children;
};

/**
 * Converts boolean state values to data attributes
 */
export function dataAttr(value: boolean | undefined): "" | undefined {
  return value ? "" : undefined;
}

/**
 * Creates data attributes from render props
 */
export function createDataAttributes<T extends Record<string, boolean | string | undefined>>(
  values: T,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "boolean") {
      result[`data-${camelToKebab(key)}`] = value ? "" : undefined;
    } else if (value !== undefined) {
      result[`data-${camelToKebab(key)}`] = value;
    }
  }

  return result;
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Remove data attributes from props (for internal use)
 */
export function removeDataAttributes<T extends Record<string, unknown>>(props: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (!key.startsWith("data-")) {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Filter DOM props - keep only valid DOM attributes.
 *
 * @param props - Component props to filter
 * @param options - Options for filtering (global: include global attrs)
 * @returns Object containing only valid DOM props. Use type parameter R to specify return type.
 */
export function filterDOMProps<R extends object = Record<string, unknown>>(
  props: object,
  options: { global?: boolean } = {},
): R {
  const { global = false } = options;
  const result: Record<string, unknown> = {};

  const globalAttrs = new Set([
    "id",
    "class",
    "style",
    "tabIndex",
    "role",
    "title",
    "lang",
    "dir",
    "hidden",
    "draggable",
    "accessKey",
    "contentEditable",
    "spellcheck",
  ]);

  const ariaAttrs = /^aria-/;
  const dataAttrs = /^data-/;
  const eventHandlers = /^on[A-Z]/;

  for (const key in props) {
    if (
      Object.prototype.hasOwnProperty.call(props, key) &&
      ((global && globalAttrs.has(key)) ||
        ariaAttrs.test(key) ||
        dataAttrs.test(key) ||
        eventHandlers.test(key))
    ) {
      result[key] = (props as Record<string, unknown>)[key];
    }
  }

  return result as R;
}

export interface ClientOnlyProps {
  /** The children to render only on the client */
  children: JSX.Element;
  /** Optional fallback to render during SSR and initial hydration */
  fallback?: JSX.Element;
}

/**
 * ClientOnly component - renders children only on the client side.
 *
 * During SSR, renders the fallback (or nothing).
 * During hydration, renders the same fallback to match SSR.
 * After hydration completes, switches to render children.
 *
 * This is useful for components that rely on browser APIs or
 * have different server/client output.
 *
 * @example
 * ```tsx
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <Calendar />
 * </ClientOnly>
 * ```
 */
export const ClientOnly: FlowComponent<ClientOnlyProps> = (props) => {
  // On server, always render fallback
  if (isServer) {
    return <>{props.fallback}</>;
  }

  // On client, track if we've hydrated
  const [isHydrated, setIsHydrated] = createSignal(false);

  // onMount runs after hydration is complete
  onMount(() => {
    setIsHydrated(true);
  });

  return (
    <Show when={isHydrated()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
};

/**
 * Returns true only on the client after hydration is complete.
 * Can be used to conditionally render client-only content.
 *
 * @example
 * ```tsx
 * const hydrated = useIsHydrated();
 * return (
 *   <Show when={hydrated()} fallback={<Placeholder />}>
 *     <ClientOnlyComponent />
 *   </Show>
 * );
 * ```
 */
export function useIsHydrated(): Accessor<boolean> {
  // On server, always return false
  if (isServer) {
    return () => false;
  }

  // On client, start false (so the first render matches the server, which
  // emitted nothing for hydrated-gated content) and flip to true after mount.
  const [isHydrated, setIsHydrated] = createSignal(false);

  // onMount runs in the effect phase — *after* the synchronous hydration pass
  // has finished walking the server DOM — so flipping here renders the gated
  // content as a fresh client-side update (Portal: no getNextElement walk, no
  // mismatch), yet fires synchronously under `render()` (unit tests / pure CSR)
  // where requestAnimationFrame would never run. This mirrors the component
  // gate above and is strictly earlier than a rAF tick.
  onMount(() => {
    setIsHydrated(true);
  });

  return isHydrated;
}
