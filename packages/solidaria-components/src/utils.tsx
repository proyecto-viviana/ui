/**
 * Utility functions for solidaria-components
 * Port of react-aria-components/src/utils.tsx
 */

import {
  type JSX,
  type Accessor,
  type Context,
  type FlowComponent,
  createComponent,
  createContext,
  useContext,
  createMemo,
  createSignal,
  onMount,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { mergeProps } from "@proyecto-viviana/solidaria";

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

/** A Solid ref target: a callback, a mutable `{ current }` object, or undefined. */
export type RefLike<T> = T | ((el: T) => void) | { current?: T | null } | undefined;

/** A value paired with an optional ref to merge onto the consuming element. */
export type WithRef<T, E> = T & { ref?: RefLike<E> };

/**
 * A context value carrying named slots (mirrors react-aria-components'
 * `SlottedValue`). Each entry under `slots` is the props object delivered to the
 * component rendered with the matching `slot` name.
 */
export interface SlottedValue<T> {
  slots?: Record<string, T>;
}

/** A slotted context value: a slots record, a bare value, or null/undefined. */
export type SlottedContextValue<T> = SlottedValue<T> | T | null | undefined;

/**
 * The value type for a context consumed via {@link useContextProps}. Mirrors
 * upstream `ContextValue<T, E>`: it may carry `slots` and an optional `ref` to
 * merge onto the consuming element.
 */
export type ContextValue<T, E = HTMLElement> = SlottedContextValue<WithRef<T, E>>;

/**
 * Creates a context that can carry either a bare value or a `slots` record.
 */
export function createSlottedContext<T>() {
  return createContext<SlottedContextValue<T>>(null);
}

/** Assigns an element to a Solid ref (callback or mutable `{ current }` object). */
export function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    (ref as (el: T) => void)(el);
  } else if (typeof ref === "object" && "current" in ref) {
    (ref as { current?: T | null }).current = el;
  }
}

/** Merges multiple Solid refs into one callback that forwards to each, once. */
export function mergeRefs<T>(...refs: Array<RefLike<T>>): (el: T) => void {
  return (el: T) => {
    const seen = new Set<RefLike<T>>();
    for (const ref of refs) {
      if (!ref || seen.has(ref)) {
        continue;
      }

      seen.add(ref);
      assignRef(ref, el);
    }
  };
}

/**
 * Resolves a (possibly slotted) context value for the given slot name. Port of
 * react-aria-components' `useSlottedContext`:
 * - `slot === null` opts out of the context entirely (returns `null`);
 * - if the context carries a `slots` record, the entry for `slot` (or
 *   {@link DEFAULT_SLOT}) is returned, throwing on an unknown slot name;
 * - otherwise the bare context value is returned.
 */
export function useSlottedContext<T>(
  context: Context<SlottedContextValue<T>>,
  slot?: string | null,
): T | null | undefined {
  const ctx = useContext(context);
  if (slot === null) {
    // An explicit `null` slot means: ignore this context.
    return null;
  }

  if (ctx && typeof ctx === "object" && "slots" in ctx && ctx.slots) {
    const slots = ctx.slots as Record<string, T>;
    const slotName = slot || DEFAULT_SLOT;
    const slotValue = slots[slotName];
    if (!slotValue) {
      const validSlots = Object.keys(slots)
        .map((name) => `"${name}"`)
        .join(", ");
      throw new Error(
        slot
          ? `Invalid slot "${slot}". Valid slot names are ${validSlots}.`
          : `A slot prop is required. Valid slot names are ${validSlots}.`,
      );
    }
    return slotValue;
  }

  return ctx as T | null | undefined;
}

/**
 * Merges context-provided props and a context ref into a component's own props
 * and ref. Port of react-aria-components' `useContextProps`:
 * - the context is resolved for `props.slot` via {@link useSlottedContext};
 * - props win over context props (handler props are chained by `mergeProps`);
 * - the component's own ref and the context's ref merge into one callback.
 *
 * The prop merge stays reactive (Solid `mergeProps` preserves getters), so prop
 * changes keep flowing; the context value is read once at setup, matching a single
 * upstream render.
 */
export function useContextProps<TProps extends SlotProps, TRef>(
  props: TProps,
  ref: RefLike<TRef>,
  context: Context<ContextValue<TProps, TRef>>,
): [TProps, (el: TRef) => void] {
  const ctx = (useSlottedContext(context, props.slot) ?? {}) as WithRef<Partial<TProps>, TRef>;
  const { ref: contextRef, ...contextProps } = ctx;
  const mergedRef = mergeRefs(ref, contextRef);
  const mergedProps = mergeProps(contextProps as object, props as object) as unknown as TProps;
  return [mergedProps, mergedRef];
}

/**
 * Detects whether slotted content was rendered into a placeholder, for the
 * aria-label fallback pattern. Port of react-aria-components' `useSlot`: returns a
 * ref callback to attach to the placeholder and an accessor that is `true` while
 * an element is mounted there. The accessor flips to `false` after mount if the
 * ref never ran (no slotted content was provided).
 */
export function useSlot(initialState = true): [(el: Element | null) => void, Accessor<boolean>] {
  const [hasSlot, setHasSlot] = createSignal(initialState);
  let hasRun = false;
  const ref = (el: Element | null) => {
    hasRun = true;
    setHasSlot(!!el);
  };
  onMount(() => {
    if (!hasRun) {
      setHasSlot(false);
    }
  });
  return [ref, hasSlot];
}

/**
 * Nests a set of context providers around `children`. Port of
 * react-aria-components' `Provider`: each `[Context, value]` pair wraps the
 * previous result, so the LAST pair is the outermost provider — matching upstream's
 * wrap-in-iteration-order.
 *
 * `children` is read through a lazy getter inside the innermost provider so child
 * components are *created* within every provider's owner; Solid binds `useContext`
 * at component-execution time, so eager children would miss these providers.
 */
export function Provider(props: {
  values: Array<[Context<unknown>, unknown]>;
  children: JSX.Element;
}): JSX.Element {
  const build = (index: number): JSX.Element => {
    if (index < 0) {
      return props.children;
    }
    const [context, value] = props.values[index];
    return createComponent(context.Provider, {
      value,
      get children() {
        return build(index - 1);
      },
    });
  };
  return build(props.values.length - 1);
}

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
