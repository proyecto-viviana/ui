/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/utils.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/useSlot.ts

/**
 * Utility functions for solidaria-components
 * Port of react-aria-components/src/utils.tsx
 */

import {
  createComponent,
  createContext,
  createEffect,
  useContext,
  createMemo,
  createSignal,
  onSettled,
  sharedConfig,
  untrack,
  Show,
} from "solid-js";
import type { Accessor, Context, FlowComponent } from "solid-js";
import type { JSX } from "@solidjs/web";
import { isServer } from "@solidjs/web";
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
  /** A slot name for the component. HTML `slot` may be `false` to omit. */
  slot?: string | JSX.RemoveAttribute;
}

export const DEFAULT_SLOT = "default";

/** HTML `slot` may be `false`; RAC slots are string names. */
export function resolveSlot(slot: SlotProps["slot"]): string {
  return typeof slot === "string" && slot.length > 0 ? slot : DEFAULT_SLOT;
}

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
  /**
   * Render a render-prop child ONCE over a reactive view of the values,
   * mirroring how React reconciles a render prop's returned tree in place.
   *
   * Prefer this over `renderChildren()` for interactive leaf components (a
   * Tab, a toggle segment) whose child wraps the pressable element: re-invoking
   * the render function on every values() change recreates that DOM subtree,
   * which detaches the pointer/press target mid-gesture and makes the browser
   * suppress the native `click` (createPress then has to synthesize an
   * untrusted fallback click — a visible parity break vs React). Static (non
   * function) children are returned untouched, exactly like `renderChildren`.
   */
  renderChildrenStable: () => JSX.Element;
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
  // Don't destructure children/class/style — those are often getters on the
  // caller’s splitProps view. Reading them in this helper’s body is an
  // untracked read in the calling component.
  const defaultClassName = () => props.defaultClassName ?? "";

  const computedClass = createMemo(() => {
    const currentValues = values();
    const className = props.class;
    return typeof className === "function"
      ? className(currentValues)
      : (className ?? defaultClassName());
  });

  const computedStyle = createMemo(() => {
    const currentValues = values();
    const style = props.style;
    return typeof style === "function" ? style(currentValues) : style;
  });

  // Return object with explicit function for rendering children
  // Children are accessed lazily during render (inside context providers)
  return {
    class: computedClass,
    style: computedStyle,
    renderChildren: () => {
      const children = props.children;
      // Only read values() for render-prop children. Static JSX children must
      // not track the render-state memo: re-running the insertion effect
      // recreates real DOM nodes on every hover/press/focus flip (React keeps
      // them stable via vdom diffing), which detaches the pressed node
      // mid-press and suppresses the browser's native click.
      //
      // A render prop takes the values argument, so classify by arity — the
      // same convention `solid-js/h` uses for dynamic props. A zero-arg
      // function child is an accessor (a compiled `{expression}` child, a
      // solid-refresh dev wrapper, a one-shot `solid-js/h` element thunk):
      // return it untouched so the insert machinery unwraps it in its own
      // nested effect. Calling it here would track its reads in the shared
      // insertion effect, and every re-run disposes the child computations
      // that effect owns — a one-shot h thunk then hands back the same
      // disposed node, leaving connected DOM whose reactivity is dead.
      return typeof children === "function" && children.length > 0
        ? children(values())
        : (children as JSX.Element);
    },
    renderChildrenStable: () => {
      const children = props.children;
      // Like renderChildren, let insertion own zero-argument accessors/thunks.
      if (typeof children !== "function" || children.length === 0) {
        return children as JSX.Element;
      }
      // Invoke the render function exactly once, over a getter view of the
      // values, so the returned DOM is created a single time and only the
      // reactive reads inside it (JSX bindings, component props) re-run on a
      // values() change — React's reconciliation, not Solid's recreation.
      //
      // `untrack` keeps the enclosing insert from tracking values() (so it
      // never re-runs and never recreates), but does NOT change the owner:
      // this still executes inside the caller's insert scope, so any slotted
      // context the render prop reads binds against the surrounding provider.
      //
      // The value keys are read once here (untracked). Render-state memos in
      // this codebase return a fixed-shape object, so the key set is stable.
      return untrack(() => {
        const snapshot = values();
        const view = {} as T;
        for (const key of Object.keys(snapshot) as Array<keyof T & string>) {
          Object.defineProperty(view, key, {
            enumerable: true,
            configurable: true,
            get: () => values()[key],
          });
        }
        return (children as (renderProps: T) => JSX.Element)(view);
      });
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

export interface OptionContentProps {
  /** `renderChildren` of the option's {@link useRenderProps} result. */
  render: () => JSX.Element;
  /** `labelProps` from `createOption`; spread onto the span that wraps a primitive label. */
  labelProps: JSX.HTMLAttributes<HTMLSpanElement>;
}

/**
 * Memoizes `props.render()` so classification and insertion share its result,
 * wrapping a primitive (string/number) label in `<span {...labelProps}>` so the
 * option's `aria-labelledby` has a target. Internal to the option components
 * (ListBox, ComboBox, Select); mount it *inside* the option's `TextContext`
 * provider so `<Text>` children resolve their slots.
 *
 * The tracked memo preserves updates while avoiding separate render calls for
 * the primitive check and insertion. Re-evaluation can construct children, so
 * keep this sharing and provider ownership; it is not a universal restriction
 * on getter reads or a promise that the callback runs only once forever.
 */
export function OptionContent(props: OptionContentProps): JSX.Element {
  const content = createMemo(() => props.render());
  const isPrimitive = () => {
    const value = content();
    return typeof value === "string" || typeof value === "number";
  };
  return <>{isPrimitive() ? <span {...props.labelProps}>{content()}</span> : content()}</>;
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
  slot?: string | null | JSX.RemoveAttribute,
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
  onSettled(() => {
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
    return createComponent(context, {
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
export function dataAttr(value: boolean | undefined): "true" | undefined {
  return value ? "true" : undefined;
}

export {
  ariaTrueFalse,
  attrTrue,
  attrString,
  isAriaTrue,
  coerceDomBoolean,
  coerceDomRecord,
} from "@proyecto-viviana/solidaria/utils";

/**
 * Creates data attributes from render props
 */
export function createDataAttributes<T extends Record<string, boolean | string | undefined>>(
  values: T,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "boolean") {
      result[`data-${camelToKebab(key)}`] = value ? "true" : undefined;
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
  options: { global?: boolean; events?: boolean } = {},
): R {
  const { global = false, events = true } = options;
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
        (events && eventHandlers.test(key)))
    ) {
      const descriptor = Object.getOwnPropertyDescriptor(props, key);
      if (descriptor && (descriptor.get || descriptor.set)) {
        // React props are plain values, so upstream copies them; Solid keeps the getter.
        const defined: PropertyDescriptor = {
          enumerable: true,
          configurable: true,
        };
        if (descriptor.get) {
          defined.get = () => descriptor.get!.call(props);
        }
        if (descriptor.set) {
          defined.set = (value: unknown) => {
            descriptor.set!.call(props, value);
          };
        }
        Object.defineProperty(result, key, defined);
      } else {
        result[key] = (props as Record<string, unknown>)[key];
      }
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
  const isHydrated = useIsHydrated();
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
  // CSR and post-hydration remounts are ready immediately. Starting them false
  // would unnecessarily rebuild gated children and can loop through providers.
  const [isHydrated, setIsHydrated] = createSignal(!isServer && !sharedConfig.hydrating);

  // Register on both server and client to preserve owner/ID allocation. Solid 2
  // can flush ordinary effects before hydrate returns; a client-source effect
  // waits until its hydration snapshot is released before revealing children.
  createEffect(
    () => true,
    () => {
      setIsHydrated(true);
    },
    { ssrSource: "client" },
  );

  return isHydrated;
}
