/**
 * SSR utilities for Solidaria
 *
 * SolidJS has built-in SSR support with `isServer` and `createUniqueId()`.
 * These utilities provide a consistent API matching React-Aria's patterns
 * with additional features for hydration management.
 */

import {
  type Accessor,
  type JSX,
  type ParentProps,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  createUniqueId,
} from "solid-js";
import { isServer } from "solid-js/web";

export interface SSRProviderProps extends ParentProps {}

export interface SSRContextValue {
  /** Whether currently rendering on the server. */
  isSSR: boolean;
  /** Prefix for generated IDs, allowing nested providers. */
  prefix: string;
}

const SSRContext = createContext<SSRContextValue>({
  isSSR: isServer,
  prefix: "",
});

/**
 * Returns whether the component is currently being server side rendered.
 * Can be used to delay browser-specific rendering until after hydration.
 *
 * Note: This returns a static boolean. For reactive hydration detection,
 * use `createHydrationState()`.
 */
export function createIsSSR(): boolean {
  return isServer;
}

/**
 * Check if we can use DOM APIs.
 * This is useful for code that needs to run only in the browser.
 */
export const canUseDOM = !isServer;

/**
 * Generate a unique ID that is stable across server and client.
 * Uses SolidJS's built-in createUniqueId which handles SSR correctly.
 *
 * @param defaultId - Optional default ID to use instead of generating one.
 *
 * @example
 * ```tsx
 * function TextField(props) {
 *   const inputId = createId(props.id);
 *   return (
 *     <>
 *       <label for={inputId}>{props.label}</label>
 *       <input id={inputId} />
 *     </>
 *   );
 * }
 * ```
 */
export function createId(defaultId?: string): string {
  if (defaultId) {
    return defaultId;
  }
  const ctx = useContext(SSRContext);
  const uniqueId = createUniqueId();
  return ctx.prefix ? `solidaria-${ctx.prefix}-${uniqueId}` : `solidaria-${uniqueId}`;
}

/**
 * Generates an id, but only resolves to it once an element with that id is
 * actually present in the DOM. Returns `undefined` otherwise.
 *
 * This is a 1:1 port of @react-aria/utils's `useSlotId`. It exists so that an
 * `aria-labelledby` can point at an optional slot (e.g. a section header) and
 * automatically fall back to `undefined` when the slot is not rendered, instead
 * of leaving a dangling reference to a non-existent id.
 *
 * The initial value is the generated id so that server and first client render
 * agree (no hydration mismatch); a client-only effect then probes the DOM and
 * clears the value when no matching element exists.
 *
 * @param deps - Accessors re-probed when their values change (mirrors the
 *   dependency array of the upstream hook).
 */
export function createSlotId(deps: Array<Accessor<unknown>> = []): Accessor<string | undefined> {
  const id = createId();
  const [resolvedId, setResolvedId] = createSignal<string | undefined>(id);

  createEffect(() => {
    // Re-probe when any explicit dependency changes.
    for (const dep of deps) {
      dep();
    }
    setResolvedId(document.getElementById(id) ? id : undefined);
  });

  return resolvedId;
}

/**
 * Provides SSR context to the component tree.
 *
 * While SolidJS handles most SSR scenarios automatically, this provider
 * can be useful for:
 * - Nested ID prefixes to avoid collisions in micro-frontends
 * - Explicit hydration boundary markers
 * - Testing SSR behavior
 *
 * @example
 * ```tsx
 * // Root of your app
 * <SSRProvider>
 *   <App />
 * </SSRProvider>
 *
 * // With custom prefix for micro-frontend
 * <SSRProvider prefix="widget">
 *   <Widget />
 * </SSRProvider>
 * ```
 */
export function SSRProvider(props: SSRProviderProps & { prefix?: string }): JSX.Element {
  const parentContext = useContext(SSRContext);

  const value = createMemo<SSRContextValue>(() => ({
    isSSR: isServer,
    prefix: props.prefix
      ? parentContext.prefix
        ? `${parentContext.prefix}-${props.prefix}`
        : props.prefix
      : parentContext.prefix,
  }));

  return <SSRContext.Provider value={value()}>{props.children}</SSRContext.Provider>;
}

/**
 * Tracks whether the component is currently hydrating.
 *
 * During server-side rendering, this returns `true`. After hydration
 * completes on the client, it switches to `false`. This is useful for
 * components that need to show different content during hydration.
 *
 * @example
 * ```tsx
 * function ClientOnlyComponent() {
 *   const isHydrating = createHydrationState();
 *
 *   return (
 *     <Show when={!isHydrating()} fallback={<LoadingPlaceholder />}>
 *       <InteractiveWidget />
 *     </Show>
 *   );
 * }
 * ```
 */
export function createHydrationState(): Accessor<boolean> {
  // On the server, always return true
  if (isServer) {
    return () => true;
  }

  // On the client, track hydration state
  const [isHydrating, setIsHydrating] = createSignal(true);

  onMount(() => {
    setIsHydrating(false);
  });

  return isHydrating;
}

/**
 * Hook that returns `true` during SSR and initial hydration.
 * Use this to delay browser-specific code until hydration is complete.
 *
 * Unlike `createIsSSR()` which is static, this updates reactively
 * after hydration completes.
 *
 * @example
 * ```tsx
 * function BrowserOnlyFeature() {
 *   const isSSR = useIsSSR();
 *
 *   createEffect(() => {
 *     if (!isSSR()) {
 *       // Safe to access browser APIs here
 *       window.localStorage.getItem('key');
 *     }
 *   });
 *
 *   return <Show when={!isSSR()}>...</Show>;
 * }
 * ```
 */
export function useIsSSR(): Accessor<boolean> {
  return createHydrationState();
}

/**
 * Creates an effect that only runs on the client after hydration.
 * This is a convenience wrapper that ensures browser-specific code
 * doesn't run during SSR.
 *
 * @param fn - The effect function to run
 *
 * @example
 * ```tsx
 * function Analytics() {
 *   createBrowserEffect(() => {
 *     // Safe to access window, document, localStorage, etc.
 *     window.analytics.track('page_view');
 *   });
 *
 *   return null;
 * }
 * ```
 */
export function createBrowserEffect(fn: () => void | (() => void)): void {
  if (isServer) {
    return;
  }

  createEffect(() => {
    const cleanup = fn();
    if (typeof cleanup === "function") {
      onCleanup(cleanup);
    }
  });
}

/**
 * Creates a value that is computed only on the client.
 * On the server, returns the fallback value.
 *
 * @param fn - Function to compute the value on the client
 * @param fallback - Value to return during SSR
 *
 * @example
 * ```tsx
 * function WindowSize() {
 *   const width = createBrowserValue(
 *     () => window.innerWidth,
 *     0
 *   );
 *
 *   return <span>Width: {width()}</span>;
 * }
 * ```
 */
export function createBrowserValue<T>(fn: () => T, fallback: T): Accessor<T> {
  if (isServer) {
    return () => fallback;
  }

  const [value, setValue] = createSignal<T>(fallback);

  onMount(() => {
    setValue(() => fn());
  });

  return value;
}

/**
 * Returns the window object if available, or undefined during SSR.
 * Useful for accessing browser globals safely.
 *
 * @example
 * ```tsx
 * const win = getWindow();
 * if (win) {
 *   win.addEventListener('resize', handler);
 * }
 * ```
 */
export function getWindow(): Window | undefined {
  if (typeof window !== "undefined") {
    return window;
  }
  return undefined;
}

/**
 * Returns the document object if available, or undefined during SSR.
 * Useful for accessing document safely.
 *
 * @example
 * ```tsx
 * const doc = getDocument();
 * if (doc) {
 *   doc.addEventListener('keydown', handler);
 * }
 * ```
 */
export function getDocument(): Document | undefined {
  if (typeof document !== "undefined") {
    return document;
  }
  return undefined;
}

/**
 * Returns the owner document of an element, with SSR safety.
 *
 * @param el - The element to get the owner document from
 */
export function getOwnerDocument(el: Element | null | undefined): Document | undefined {
  return el?.ownerDocument ?? getDocument();
}

/**
 * Returns the owner window of an element, with SSR safety.
 *
 * @param el - The element to get the owner window from
 */
export function getOwnerWindow(el: Element | null | undefined): Window | undefined {
  return getOwnerDocument(el)?.defaultView ?? getWindow();
}

/**
 * Gets the appropriate container for portals, with SSR safety.
 * Returns the specified container, or document.body on the client,
 * or undefined during SSR.
 *
 * @param container - Optional custom container element
 *
 * @example
 * ```tsx
 * function Modal(props) {
 *   const container = getPortalContainer(props.container);
 *
 *   return (
 *     <Show when={container}>
 *       <Portal mount={container}>
 *         {props.children}
 *       </Portal>
 *     </Show>
 *   );
 * }
 * ```
 */
export function getPortalContainer(container?: Element): Element | undefined {
  if (container) {
    return container;
  }
  return getDocument()?.body;
}
