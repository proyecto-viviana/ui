/**
 * Toast components for solidaria-components
 *
 * Toast notifications with auto-dismiss, pause on hover/focus, and accessibility.
 * Port of react-aria-components Toast.
 */

import {
  type JSX,
  type Accessor,
  createContext,
  createMemo,
  createEffect,
  onCleanup,
  splitProps,
  Show,
  useContext,
} from "solid-js";
import { Portal, isServer } from "solid-js/web";
import {
  type ToastState,
  type QueuedToast,
  type ToastQueueOptions,
  type ToastOptions,
  ToastQueue,
  createToastState,
} from "@proyecto-viviana/solid-stately";
import {
  createToast,
  createToastRegion,
  useUNSAFE_PortalContext,
} from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface ToastContent {
  /** Spectrum Toast message content. */
  children?: string;
  /** The title of the toast. */
  title?: string;
  /** The description/body of the toast. */
  description?: string;
  /** Spectrum variant. */
  variant?: "info" | "positive" | "negative" | "neutral";
  /** Backward-compatible type/variant of the toast. */
  type?: "info" | "success" | "warning" | "error" | "positive" | "negative" | "neutral";
  /** Spectrum action button label. */
  actionLabel?: string;
  /** Handler called when the Spectrum action button is pressed. */
  onAction?: () => void;
  /** Whether the toast should close when the Spectrum action is performed. */
  shouldCloseOnAction?: boolean;
  /** Custom action button. */
  action?: {
    label: string;
    onAction: () => void;
  };
}

export interface ToastRenderProps {
  /** Whether the toast is currently animating in. */
  isEntering: boolean;
  /** Whether the toast is currently animating out. */
  isExiting: boolean;
  /** The animation state (entering, exiting, queued). */
  animation: "entering" | "exiting" | "queued" | undefined;
  /** The toast data. */
  toast: QueuedToast<ToastContent>;
}

export interface ToastRegionRenderProps {
  /** The visible toasts. */
  visibleToasts: Accessor<QueuedToast<ToastContent>[]>;
}

export interface ToastRegionProps {
  /** The children of the component - can be JSX or render function. */
  children?: RenderChildren<ToastRegionRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ToastRegionRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ToastRegionRenderProps>;
  /** The toast state to display. If not provided, uses ToastContext. */
  state?: ToastState<ToastContent>;
  /** Accessible label for the region. */
  "aria-label"?: string;
  /** Whether to render in a portal. */
  portal?: boolean;
  /** Placement of the toast region. */
  placement?:
    | "top"
    | "top start"
    | "top end"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom start"
    | "bottom end"
    | "bottom-start"
    | "bottom-end";
}

export interface ToastProps {
  /** The toast data. */
  toast: QueuedToast<ToastContent>;
  /** The children of the component - can be JSX or render function. */
  children?: RenderChildren<ToastRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ToastRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ToastRenderProps>;
}

export const ToastContext = createContext<ToastState<ToastContent> | null>(null);

interface ToastAriaContextValue {
  titleProps: JSX.HTMLAttributes<HTMLElement>;
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
}

const ToastAriaContext = createContext<ToastAriaContextValue | null>(null);
const toastStateByKey = new Map<string, ToastState<ToastContent>>();

export function useToastContext(): ToastState<ToastContent> {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("Toast components must be used within a ToastProvider");
  }
  return context;
}

/** Default global toast queue that can be used for app-wide toasts. */
export const globalToastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: Infinity,
  hasExitAnimation: true,
});

/**
 * Add a toast to the global queue.
 * Convenience function for adding toasts from anywhere in the app.
 */
export function addToast(content: ToastContent, options?: ToastOptions): string {
  return globalToastQueue.add(content, options);
}

function normalizeToastPlacement(placement?: ToastRegionProps["placement"]) {
  return (placement ?? "bottom").replace("-", " ") as NonNullable<ToastRegionProps["placement"]>;
}

export interface ToastProviderProps {
  /** The children of the provider. */
  children: JSX.Element;
  /** Custom toast queue options. */
  queueOptions?: ToastQueueOptions;
  /** Use global queue instead of creating a new one. */
  useGlobalQueue?: boolean;
}

/**
 * ToastProvider creates a toast queue context for descendant components.
 * Use this to wrap your app or a section that needs toast notifications.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 *   <ToastRegion />
 * </ToastProvider>
 * ```
 */
export function ToastProvider(props: ToastProviderProps): JSX.Element {
  const queue = props.useGlobalQueue
    ? globalToastQueue
    : new ToastQueue<ToastContent>(props.queueOptions);

  const state = createToastState({ queue });

  return <ToastContext.Provider value={state}>{props.children}</ToastContext.Provider>;
}

/**
 * ToastRegion is a container that displays all visible toasts.
 * It handles pause on hover/focus and provides the landmark region.
 *
 * @example
 * ```tsx
 * <ToastRegion placement="bottom-end">
 *   {(renderProps) => (
 *     <For each={renderProps.visibleToasts}>
 *       {(toast) => <Toast toast={toast} />}
 *     </For>
 *   )}
 * </ToastRegion>
 * ```
 */
export function ToastRegion(props: ToastRegionProps): JSX.Element {
  if (isServer) {
    return null as unknown as JSX.Element;
  }

  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "style",
    "state",
    "aria-label",
    "portal",
    "placement",
  ]);
  const portalContext = useUNSAFE_PortalContext();
  const portalContainer = () => portalContext.getContainer?.() ?? undefined;

  const contextState = useContext(ToastContext);
  const state = () => local.state ?? contextState;

  const getRegionAria = () => {
    const s = state();
    if (!s) return null;
    return createToastRegion({
      state: s,
      "aria-label": local["aria-label"],
    });
  };

  const renderValues = createMemo<ToastRegionRenderProps>(() => ({
    visibleToasts: () => state()?.visibleToasts() ?? [],
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ToastRegion",
    },
    renderValues,
  );
  const renderedChildren = createMemo(() => renderProps.renderChildren());

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const placementStyles = createMemo<JSX.CSSProperties>(() => {
    const placement = normalizeToastPlacement(local.placement);
    const [edge, align = "center"] = placement.split(" ");
    const base: JSX.CSSProperties = {
      position: "fixed",
      "z-index": 100001,
      display: "flex",
      "flex-direction": edge === "top" ? "column" : "column-reverse",
      gap: "8px",
      padding: "16px",
      "pointer-events": "none",
    };

    if (edge === "top") {
      if (align === "end") {
        return { ...base, top: "16px", right: "16px" } as JSX.CSSProperties;
      }
      if (align === "start") {
        return { ...base, top: "16px", left: "16px" } as JSX.CSSProperties;
      }
      return {
        ...base,
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
      } as JSX.CSSProperties;
    }

    if (align === "end") {
      return { ...base, bottom: "16px", right: "16px" } as JSX.CSSProperties;
    }
    if (align === "start") {
      return { ...base, bottom: "16px", left: "16px" } as JSX.CSSProperties;
    }
    return {
      ...base,
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
    } as JSX.CSSProperties;
  });

  const normalizedPlacement = () => normalizeToastPlacement(local.placement);

  const visibleToasts = () => state()?.visibleToasts() ?? [];
  const hasToasts = () => visibleToasts().length > 0;

  const regionContent = () => {
    const regionAria = getRegionAria();
    if (!regionAria || !state()) return null;

    // Merge styles - placement styles are base, renderProps.style() overrides
    const mergedStyle = () => {
      const placement = placementStyles();
      const custom = renderProps.style();
      if (!custom) return placement;
      return { ...placement, ...custom } as JSX.CSSProperties;
    };

    const { ref: _ref, ...cleanRegionProps } = regionAria.regionProps as Record<string, unknown>;

    return (
      <div
        {...domProps()}
        {...cleanRegionProps}
        class={renderProps.class()}
        style={mergedStyle()}
        data-placement={normalizedPlacement()}
      >
        {renderedChildren()}
      </div>
    );
  };

  return (
    <Show when={hasToasts()}>
      <Show when={local.portal !== false} fallback={regionContent()}>
        <Portal mount={portalContainer()}>{regionContent()}</Portal>
      </Show>
    </Show>
  );
}

/**
 * Toast is an individual notification component.
 *
 * @example
 * ```tsx
 * <Toast toast={toast}>
 *   {(renderProps) => (
 *     <div class={renderProps.isExiting ? 'fade-out' : 'fade-in'}>
 *       <h3>{renderProps.toast.content.title}</h3>
 *       <p>{renderProps.toast.content.description}</p>
 *     </div>
 *   )}
 * </Toast>
 * ```
 */
export function Toast(props: ToastProps): JSX.Element {
  const [local, rest] = splitProps(props, ["toast", "children", "class", "style"]);

  let toastRef!: HTMLDivElement;

  const state = useToastContext();

  createEffect(() => {
    const key = local.toast.key;
    toastStateByKey.set(key, state);
    onCleanup(() => {
      if (toastStateByKey.get(key) === state) {
        toastStateByKey.delete(key);
      }
    });
  });

  const hasTitle = () => !!(local.toast.content.children ?? local.toast.content.title);
  const toastAria = createToast({
    toast: local.toast,
    state,
    hasTitle: hasTitle(),
    hasDescription: !!local.toast.content.description,
  });

  const renderValues = createMemo<ToastRenderProps>(() => ({
    isEntering: local.toast.animation === "entering",
    isExiting: local.toast.animation === "exiting",
    animation: local.toast.animation,
    toast: local.toast,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Toast",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const mergedStyle = () => {
    const custom = renderProps.style();
    if (!custom) return { "pointer-events": "auto" as const };
    return { "pointer-events": "auto" as const, ...custom } as JSX.CSSProperties;
  };

  const handleRootClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-solidaria-toast-close-button]")) {
      state.close(local.toast.key);
      state.remove(local.toast.key);
    }
  };

  // Exit animation lifecycle:
  // When animation becomes 'exiting', wait for CSS animations/transitions to finish,
  // then call state.remove() to finalize removal from the queue.
  // In JSDOM or when no animations are running, remove immediately.
  // Reduced-motion is handled by CSS (shorter/no animations), so the lifecycle
  // naturally completes faster when the user prefers reduced motion.
  createEffect(() => {
    if (local.toast.animation !== "exiting") return;
    if (!toastRef) {
      state.remove(local.toast.key);
      return;
    }

    // Check if the element supports the Web Animations API
    if (!("getAnimations" in toastRef)) {
      state.remove(local.toast.key);
      return;
    }

    const animations = toastRef.getAnimations();
    if (animations.length === 0) {
      // No CSS animations/transitions running - remove immediately
      state.remove(local.toast.key);
      return;
    }

    // Wait for all running animations to finish, then remove
    let canceled = false;
    Promise.all(animations.map((a) => a.finished))
      .then(() => {
        if (!canceled) {
          state.remove(local.toast.key);
        }
      })
      .catch(() => {
        // Animation was canceled (e.g. element removed) - still clean up
        if (!canceled) {
          state.remove(local.toast.key);
        }
      });

    onCleanup(() => {
      canceled = true;
    });
  });

  const { ref: _ref, ...cleanToastProps } = toastAria.toastProps as Record<string, unknown>;

  // Ensure ARIA title/description IDs are present on rendered sub-components,
  // even when children are pre-composed outside the Toast provider owner.
  createEffect(() => {
    if (!toastRef) return;

    const titleId = (toastAria.titleProps as Record<string, unknown>).id as string | undefined;
    const descriptionId = (toastAria.descriptionProps as Record<string, unknown>).id as
      | string
      | undefined;

    if (titleId) {
      const titleEl = toastRef.querySelector("[data-solidaria-toast-title]");
      if (titleEl instanceof HTMLElement) {
        titleEl.id = titleId;
      }
    }

    if (descriptionId) {
      const descriptionEl = toastRef.querySelector("[data-solidaria-toast-description]");
      if (descriptionEl instanceof HTMLElement) {
        descriptionEl.id = descriptionId;
      }
    }
  });

  return (
    <ToastAriaContext.Provider
      value={{ titleProps: toastAria.titleProps, descriptionProps: toastAria.descriptionProps }}
    >
      <div
        ref={toastRef}
        {...domProps()}
        {...cleanToastProps}
        class={renderProps.class()}
        style={mergedStyle()}
        data-animation={local.toast.animation}
        data-type={local.toast.content.type ?? local.toast.content.variant}
        data-variant={local.toast.content.variant}
        on:click={handleRootClick}
      >
        {renderProps.renderChildren()}
      </div>
    </ToastAriaContext.Provider>
  );
}

export interface ToastTitleProps {
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * ToastTitle renders the toast title with proper accessibility attributes.
 */
export function ToastTitle(props: ToastTitleProps): JSX.Element {
  const context = useContext(ToastAriaContext);
  const { ref: _ref, ...ariaTitleProps } = (context?.titleProps ?? {}) as Record<string, unknown>;

  return (
    <div data-solidaria-toast-title="" {...ariaTitleProps} class={props.class} style={props.style}>
      {props.children}
    </div>
  );
}

export interface ToastDescriptionProps {
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * ToastDescription renders the toast description with proper accessibility attributes.
 */
export function ToastDescription(props: ToastDescriptionProps): JSX.Element {
  const context = useContext(ToastAriaContext);
  const { ref: _ref, ...ariaDescriptionProps } = (context?.descriptionProps ?? {}) as Record<
    string,
    unknown
  >;

  return (
    <div
      data-solidaria-toast-description=""
      {...ariaDescriptionProps}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

export interface ToastCloseButtonProps {
  /** The toast to close. */
  toast: QueuedToast<ToastContent>;
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
  "aria-label"?: string;
}

/**
 * ToastCloseButton is a button that closes the toast.
 */
export function ToastCloseButton(props: ToastCloseButtonProps): JSX.Element {
  const contextState = useContext(ToastContext);
  const handleClose = () => {
    const key = props.toast.key;
    const state = contextState ?? toastStateByKey.get(key);
    state?.close(key);
    state?.remove(key);
  };

  return (
    <button
      type="button"
      class={props.class}
      style={props.style}
      aria-label={props["aria-label"] ?? "Close"}
      data-solidaria-toast-close-button=""
      on:click={handleClose}
      onClick={handleClose}
    >
      {props.children ?? "×"}
    </button>
  );
}

export interface DefaultToastProps {
  toast: QueuedToast<ToastContent>;
}

/**
 * DefaultToast provides a basic toast layout with title, description, and close button.
 * Use this as a starting point or as-is for simple toast needs.
 */
export function DefaultToast(props: DefaultToastProps): JSX.Element {
  const content = () => props.toast.content;
  const title = () => content().children ?? content().title;
  const actionLabel = () => content().actionLabel ?? content().action?.label;
  const actionHandler = () => content().onAction ?? content().action?.onAction;
  const state = useToastContext();
  const handleAction = () => {
    actionHandler()?.();
    if (content().shouldCloseOnAction) {
      state.close(props.toast.key);
      state.remove(props.toast.key);
    }
  };

  return (
    <Toast toast={props.toast}>
      <div style={{ display: "flex", "align-items": "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <Show when={title()}>
            <ToastTitle style={{ "font-weight": "bold", "margin-bottom": "4px" }}>
              {title()}
            </ToastTitle>
          </Show>
          <Show when={content().description}>
            <ToastDescription>{content().description}</ToastDescription>
          </Show>
          <Show when={actionLabel()}>
            <button type="button" style={{ "margin-top": "8px" }} onClick={handleAction}>
              {actionLabel()}
            </button>
          </Show>
        </div>
        <ToastCloseButton toast={props.toast} />
      </div>
    </Toast>
  );
}
