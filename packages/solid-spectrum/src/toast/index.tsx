import {
  type JSX,
  type Accessor,
  batch,
  createContext,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import {
  FocusScope,
  createPreventScroll,
  createStringFormatter,
  filterDOMProps,
} from "@proyecto-viviana/solidaria";
import {
  Toast as HeadlessToast,
  ToastRegion as HeadlessToastRegion,
  ToastProvider as HeadlessToastProvider,
  ToastContext,
  ToastTitle as HeadlessToastTitle,
  ToastDescription as HeadlessToastDescription,
  ToastCloseButton as HeadlessToastCloseButton,
  globalToastQueue,
  addToast as headlessAddToast,
  useToastContext,
  type ToastContent,
  type ToastProps as HeadlessToastProps,
  type ToastRegionProps as HeadlessToastRegionProps,
  type ToastProviderProps as HeadlessToastProviderProps,
  type ToastRenderProps,
  type ToastRegionRenderProps,
} from "@proyecto-viviana/solidaria-components";
import {
  ToastQueue as StatelyToastQueue,
  type QueuedToast,
  type ToastOptions as StatelyToastOptions,
} from "@proyecto-viviana/solid-stately";
import { ActionButton, Button } from "../button";
import { AlertTriangleIcon } from "../icon/s2wf-icons/AlertTriangleIcon";
import { CheckmarkCircleIcon } from "../icon/s2wf-icons/CheckmarkCircleIcon";
import { ChevronDownIcon } from "../icon/s2wf-icons/ChevronDownIcon";
import { CloseIcon } from "../icon/s2wf-icons/CloseIcon";
import { InfoCircleIcon } from "../icon/s2wf-icons/InfoCircleIcon";
import { s2IntlStrings } from "../intl";
import { createMediaQuery } from "../utils/createMediaQuery";
import { focusRing, style } from "../style" with { type: "macro" };

export type ToastPlacement = "top" | "top end" | "bottom" | "bottom end";
export type ToastVariant = "positive" | "negative" | "info" | "neutral";
type LegacyToastVariant = "success" | "warning" | "error";
type ToastEdge = "top" | "bottom";
type ToastAlign = "center" | "end";

// --- S2 Toast view transitions -------------------------------------------------
// Ported from @react-spectrum/s2's Toast.module.css and the startViewTransition /
// global reduce-motion machinery in Toast.tsx. Upstream ships these rules as a CSS
// module that the bundler injects; the `::view-transition-group()` pseudo-elements,
// `html.toast-*` global selectors and `@keyframes` cannot be expressed by the atomic
// style() macro, so we inject the equivalent global stylesheet at runtime (guarded) —
// the same idiom solidaria uses for createPress / createPreventScroll. Class names are
// the literal ones from the upstream module (left un-hashed).
const TOAST_ANIMATION_CSS = `
/* Safari doesn't support :active-view-transition-type() yet, so we fall back to a class on the html element */
html.toast-add,
html.toast-remove,
html.toast-expand,
html.toast-collapse,
html.toast-clear,
html:active-view-transition-type(
  toast-add,
  toast-remove,
  toast-expand,
  toast-collapse,
  toast-clear
) {
  view-transition-name: none;

  .toast-controls {
    view-transition-name: toast-controls;
  }

  .toast-background {
    view-transition-name: toast-background;
  }

  &::view-transition-group(toast-background) {
    z-index: 0;
    will-change: transform;
  }

  &::view-transition-group(.toast),
  &::view-transition-group(toast-list-expanded),
  &::view-transition-group(toast-list-collapsed) {
    z-index: 1;
    will-change: transform;
  }

  &::view-transition-group(toast-controls) {
    z-index: 2;
    will-change: transform;
  }

  &::view-transition-group(toast-content),
  &::view-transition-group(toast-expand),
  &::view-transition-group(toast-action),
  &::view-transition-group(toast-close) {
    z-index: 3;
    will-change: transform;
  }

  &::view-transition-group(*) {
    animation-duration: 400ms;
  }
}

html.toast-add,
html.toast-remove,
html:active-view-transition-type(toast-add, toast-remove) {
  /* The new toast should slide in and out. With reduce motion enabled, it fades by default. */
  &:not(.reduceMotion) {
    &::view-transition-new(.toast):only-child {
      animation-name: slide-in;
    }

    &::view-transition-old(.toast):only-child {
      animation-name: slide-out;
    }
  }

  &::view-transition-group(.toast.bottom) {
    --slideX: 0;
    --slideY: calc(100% + 12px);
  }

  &::view-transition-group(.toast.top) {
    --slideX: 0;
    --slideY: calc(-100% - 12px);
  }

  &::view-transition-group(.toast.start) {
    --slideX: calc(-100% - 12px);
    --slideY: 0;
  }

  &::view-transition-group(.toast.end) {
    --slideX: calc(100% + 12px);
    --slideY: 0;
  }
}

/* Make the "Show all" button animate slightly faster/slower than other components when expanding/collapsing.
 * This prevents it from appearing to overlap the text when it fades out and the text repositions. */
html.toast-expand,
html:active-view-transition-type(toast-expand) {
  &::view-transition-group(toast-expand) {
    animation-duration: 300ms;
  }
}

html.toast-collapse,
html:active-view-transition-type(toast-collapse) {
  &::view-transition-group(toast-expand) {
    animation-duration: 600ms;
  }
}

html.toast-expand,
html.toast-collapse,
html:active-view-transition-type(toast-expand, toast-collapse) {
  &:not(.reduceMotion) {
    /* When expanding/collapsing, animate the components of the main toast individually. */
    .toast-content {
      view-transition-name: toast-content;
    }

    .toast-expand {
      view-transition-name: toast-expand;
    }

    .toast-action {
      view-transition-name: toast-action;
    }

    .toast-close {
      view-transition-name: toast-close;
    }

    /* Force toast controls to be visible during the animation */
    .toast-controls {
      display: flex;
    }

    /* Smoothly transition the size of toasts. */
    &::view-transition-old(.toast),
    &::view-transition-new(.toast) {
      /* Make the old and new images fill the size of the parent group. */
      height: 100%;
      width: 100%;
    }

    /* Background toasts don't have their components split apart in separate view transitions.
     * This means we need to do some tricks to get the aspect ratio to transition smoothly.
     * Clipping messes up the shadows a bit, but it's less noticeable on the background toasts. */
    &::view-transition-old(.background-toast),
    &::view-transition-new(.background-toast) {
      /* Cover all of the available space without stretching the aspect ratio */
      object-fit: cover;
      object-position: top center;
      /* Clip to retain rounded corners */
      clip-path: inset(0px round 10px);
    }
  }

  &.reduceMotion {
    /* Do not animate individual toasts in reduced motion. The whole list cross-fades instead. */
    .toast {
      view-transition-name: none !important;
    }

    .toast-list-expanded {
      view-transition-name: toast-list-expanded;
    }

    .toast-list-collapsed {
      view-transition-name: toast-list-collapsed;
    }
  }
}

@keyframes slide-in {
  from {
    translate: var(--slideX) var(--slideY);
    opacity: 0;
  }
}

@keyframes slide-out {
  to {
    translate: var(--slideX) var(--slideY);
    opacity: 0;
  }
}
`;

let toastAnimationStylesInjected = false;
function ensureToastAnimationStyles(): void {
  if (toastAnimationStylesInjected || typeof document === "undefined") {
    return;
  }
  const styleEl = document.createElement("style");
  styleEl.id = "solid-spectrum-toast-animations";
  styleEl.textContent = TOAST_ANIMATION_CSS;
  document.head.appendChild(styleEl);
  toastAnimationStylesInjected = true;
}

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
}
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

let globalReduceMotion = false;

/**
 * Runs a toast queue/stack mutation inside a View Transition so the resulting re-render
 * is animated, mirroring @react-spectrum/s2's startViewTransition. Adds a `toast-<action>`
 * class (and `reduceMotion`) to <html> so the injected CSS can target the transition, then
 * removes them once it settles. Where the View Transitions API is unavailable (SSR, jsdom,
 * older browsers) it runs the mutation synchronously, so behavior is unchanged.
 */
function startViewTransition(fn: () => void, type: string): void {
  const doc =
    typeof document === "undefined" ? undefined : (document as DocumentWithViewTransition);
  if (doc && typeof doc.startViewTransition === "function") {
    ensureToastAnimationStyles();
    doc.documentElement.classList.add(type);
    if (globalReduceMotion) {
      doc.documentElement.classList.add("reduceMotion");
    }

    const viewTransition = doc.startViewTransition(() => batch(fn));
    void viewTransition.ready.catch(() => {});
    void viewTransition.finished.finally(() => {
      doc.documentElement.classList.remove(type, "reduceMotion");
    });
  } else {
    fn();
  }
}

/** A toast's view-transition-name; prefixed so the numeric queue keys remain valid CSS idents. */
function toastViewTransitionName(key: string, suffix = ""): string {
  return `toast-${key}${suffix}`;
}

export interface ToastOptions extends Omit<StatelyToastOptions, "priority"> {
  /** DOM id passed through to the queued toast content. */
  id?: string;
  /** Data attributes passed through to the queued toast content. */
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
  /** A label for the action button within the toast. */
  actionLabel?: string;
  /** Handler that is called when the action button is pressed. */
  onAction?: () => void;
  /** Whether the toast should automatically close when an action is performed. */
  shouldCloseOnAction?: boolean;
}

export interface ToastProviderProps extends HeadlessToastProviderProps {}

export interface ToastRegionProps extends Omit<
  HeadlessToastRegionProps,
  "class" | "style" | "children" | "placement"
> {
  /** Placement of the toast container on the page. @default "bottom" */
  placement?: ToastPlacement;
  /** Additional CSS class name. */
  class?: string;
}

export interface ToastContainerProps extends ToastRegionProps {
  /**
   * Forces reduced-motion toast animations regardless of the user's
   * `prefers-reduced-motion` setting. Mirrors @react-spectrum/s2's
   * `PRIVATE_forceReducedMotion` test hook.
   */
  PRIVATE_forceReducedMotion?: boolean;
}

export interface ToastProps extends Omit<HeadlessToastProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
  /** Internal index accessor used by ToastRegion for S2 stack rendering. */
  index?: Accessor<number>;
  /** Internal visible toasts accessor used by ToastRegion for S2 stack rendering. */
  visibleToasts?: Accessor<QueuedToast<ToastContent>[]>;
  /** Internal expanded stack state accessor used by ToastContainer. */
  isExpanded?: Accessor<boolean>;
  /** Internal stack expansion handler used by ToastContainer. */
  onToggleExpanded?: () => void;
  /**
   * Whether a ToastContainer is present to drive stack expansion. When false (a
   * bare ToastRegion, which has no expand/collapse context), the collapsed-stack
   * "Show all" affordance is hidden because it cannot be honored — mirroring the
   * upstream split where ToastContainer, not the low-level region, owns expansion.
   */
  canExpand?: boolean;
  /** Internal placement edge used for collapsed background stack positioning. */
  placementEdge?: ToastEdge;
  /** Internal placement alignment used for the toast's view-transition-class. */
  placementAlign?: ToastAlign;
}

interface ToastContainerContextValue {
  isExpanded: Accessor<boolean>;
  toggleExpanded: () => void;
  collapse: () => void;
  clear: () => void;
  reduceMotion: Accessor<boolean>;
}

const ToastContainerContext = createContext<ToastContainerContextValue | null>(null);

const toastAriaIntlStrings = {
  "en-US": {
    close: "Close",
  },
  "es-ES": {
    close: "Cerrar",
  },
};

const toastRegion = style<{ placement: ToastEdge; align: ToastAlign; isExpanded?: boolean }>({
  ...focusRing(),
  display: "flex",
  flexDirection: {
    placement: {
      top: "column",
      bottom: "column-reverse",
    },
  },
  position: "fixed",
  insetX: 0,
  width: "fit",
  top: {
    placement: {
      top: {
        default: 16,
        isExpanded: 0,
      },
    },
  },
  bottom: {
    placement: {
      bottom: {
        default: 16,
        isExpanded: 0,
      },
    },
  },
  marginStart: {
    align: {
      center: "auto",
      end: "auto",
    },
  },
  marginEnd: {
    align: {
      center: "auto",
      end: 16,
    },
  },
  boxSizing: "border-box",
  maxHeight: "full",
  borderRadius: "lg",
});

const toastList = style<{ placement: ToastEdge; isExpanded?: boolean }>({
  position: "relative",
  flexGrow: 1,
  display: "flex",
  gap: 8,
  flexDirection: {
    placement: {
      top: "column",
      bottom: "column-reverse",
    },
  },
  boxSizing: "border-box",
  margin: 0,
  marginX: {
    default: 0,
    isExpanded: -8,
  },
  padding: {
    default: 0,
    isExpanded: 8,
  },
  paddingBottom: {
    isExpanded: {
      placement: {
        top: 8,
        bottom: 16,
      },
    },
  },
  paddingTop: {
    isExpanded: {
      placement: {
        top: 16,
        bottom: 8,
      },
    },
  },
  overflow: {
    isExpanded: "auto",
  },
});

const toastStyle = style<{ variant: ToastVariant; isExpanded?: boolean }>({
  ...focusRing(),
  outlineColor: {
    default: "focus-ring",
    isExpanded: "white",
  },
  display: "flex",
  gap: 16,
  paddingStart: 16,
  paddingEnd: 8,
  paddingY: 12,
  borderRadius: "lg",
  minHeight: 56,
  maxWidth: "[min(336px,90vw)]",
  boxSizing: "border-box",
  flexShrink: 0,
  font: "ui",
  color: "white",
  backgroundColor: {
    variant: {
      neutral: "neutral-subdued",
      info: "informative",
      positive: "positive",
      negative: "negative",
    },
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  boxShadow: {
    default: "elevated",
    isExpanded: "none",
  },
  willChange: "transform",
});

const toastBody = style<{ isSingle?: boolean }>({
  display: {
    default: "grid",
    isSingle: "flex",
  },
  gridTemplateColumns: ["auto", "1fr", "auto"],
  gridTemplateAreas: ["content content content", "expand . action"],
  flexGrow: 1,
  flexWrap: "wrap",
  alignItems: "center",
  columnGap: 24,
  rowGap: 8,
});

const toastContent = style({
  display: "flex",
  cursor: "default",
  gap: 8,
  alignItems: "baseline",
  gridArea: "content",
  width: "fit",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  minWidth: 0,
});

const toastText = style({
  minWidth: 0,
});

const toastDescription = style({
  font: "body-sm",
  opacity: 0.9,
  marginTop: 2,
});

const toastIcon = style({
  flexShrink: 0,
  color: "white",
});

const toastAction = style({
  marginStart: "auto",
  gridArea: "action",
});

const toastExpand = style({
  gridArea: "expand",
});

const toastBackground = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "transparent-overlay-500",
  pointerEvents: "auto",
});

const toastControls = style<{ isExpanded?: boolean }>({
  colorScheme: "light",
  pointerEvents: "auto",
  display: {
    default: "none",
    isExpanded: "flex",
  },
  justifyContent: "end",
  gap: 8,
  opacity: {
    default: 0,
    isExpanded: 1,
  },
});

const closeButtonStyles = style({
  ...focusRing(),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: "full",
  borderWidth: 0,
  padding: 0,
  color: "white",
  backgroundColor: {
    default: "transparent",
    isHovered: "transparent-overlay-100",
    isPressed: "transparent-overlay-200",
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

function normalizePlacement(placement?: ToastPlacement): {
  placement: ToastPlacement;
  edge: ToastEdge;
  align: ToastAlign;
} {
  const normalized = placement ?? "bottom";
  const [edge, align = "center"] = normalized.split(" ") as [ToastEdge, ToastAlign?];
  return {
    placement: normalized,
    edge,
    align: align === "end" ? "end" : "center",
  };
}

function normalizeVariant(
  variant?: ToastContent["variant"],
  type?: ToastContent["type"],
): ToastVariant {
  if (variant) {
    return variant;
  }

  switch (type as ToastVariant | LegacyToastVariant | undefined) {
    case "positive":
    case "success":
      return "positive";
    case "negative":
    case "error":
    case "warning":
      return "negative";
    case "info":
      return "info";
    case "neutral":
    default:
      return "neutral";
  }
}

function getVariantIcon(variant: ToastVariant): JSX.Element | null {
  switch (variant) {
    case "positive":
      return <CheckmarkCircleIcon aria-hidden="true" />;
    case "negative":
      return <AlertTriangleIcon aria-hidden="true" />;
    case "info":
      return <InfoCircleIcon aria-hidden="true" />;
    case "neutral":
    default:
      return null;
  }
}

function closeGlobalToast(key: string) {
  globalToastQueue.close(key);
  globalToastQueue.remove(key);
}

function addSpectrumToast(
  children: string,
  variant: ToastVariant,
  options: ToastOptions = {},
): () => void {
  const timeout =
    options.timeout && !options.actionLabel ? Math.max(options.timeout, 5000) : undefined;
  const domProps = filterDOMProps(options as Record<string, unknown>);
  const key = headlessAddToast(
    {
      children,
      variant,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
      shouldCloseOnAction: options.shouldCloseOnAction,
      ...domProps,
    },
    {
      timeout,
      onClose: options.onClose,
    },
  );

  return () => closeGlobalToast(key);
}

/**
 * ToastProvider creates a toast queue context for descendant components.
 * Most S2 usage should render ToastContainer once at the app root instead.
 */
export function ToastProvider(props: ToastProviderProps): JSX.Element {
  return <HeadlessToastProvider {...props} />;
}

/**
 * ToastRegion displays all visible toasts from the surrounding ToastProvider.
 * This remains for lower-level composition; ToastContainer self-wires the global queue.
 */
export function ToastRegion(props: ToastRegionProps): JSX.Element {
  const [local, rest] = splitProps(props, ["placement", "class"]);
  const placement = () => normalizePlacement(local.placement);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const containerContext = useContext(ToastContainerContext);
  const isExpanded = () => containerContext?.isExpanded() ?? false;
  createPreventScroll({
    get isDisabled() {
      return !isExpanded();
    },
  });
  const toggleExpanded = (visibleToasts: QueuedToast<ToastContent>[]) => {
    if (!isExpanded() && visibleToasts.length <= 1) {
      return;
    }
    containerContext?.toggleExpanded();
  };
  const handleRegionKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !isExpanded()) {
      return;
    }

    event.stopPropagation();
    containerContext?.collapse();
  };
  const handleListClick = (event: MouseEvent, visibleToasts: QueuedToast<ToastContent>[]) => {
    const target = event.target;
    if (isExpanded() || !(target instanceof Element) || target.closest("button")) {
      return;
    }
    toggleExpanded(visibleToasts);
  };
  createEffect(() => {
    if (!isExpanded() || !containerContext) {
      return;
    }

    const ownerDocument = globalThis.document;
    if (!ownerDocument) {
      return;
    }

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      containerContext.collapse();
    };

    ownerDocument.addEventListener("keydown", handleDocumentKeyDown, true);
    onCleanup(() => ownerDocument.removeEventListener("keydown", handleDocumentKeyDown, true));
  });

  return (
    <HeadlessToastRegion
      {...rest}
      placement={placement().placement}
      class={(_renderProps: ToastRegionRenderProps) =>
        [
          toastRegion({
            placement: placement().edge,
            align: placement().align,
            isExpanded: isExpanded(),
          }),
          local.class ?? "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {(regionProps: ToastRegionRenderProps) => {
        const visibleToasts = () => regionProps.visibleToasts();

        return (
          <FocusScope contain={isExpanded()}>
            <div
              data-solid-spectrum-toast-focus-scope=""
              onKeyDown={handleRegionKeyDown}
              style={{ display: "contents" }}
            >
              <Show when={containerContext && isExpanded()}>
                <div
                  class={`toast-background ${toastBackground}`}
                  data-solid-spectrum-toast-background=""
                  onClick={containerContext?.collapse}
                />
              </Show>
              <div
                class={[
                  isExpanded() ? "toast-list-expanded" : "toast-list-collapsed",
                  toastList({ placement: placement().edge, isExpanded: isExpanded() }),
                ].join(" ")}
                data-solid-spectrum-toast-list=""
                onClick={(event) => handleListClick(event, visibleToasts())}
              >
                <For each={visibleToasts()}>
                  {(toast, index) => (
                    <Toast
                      toast={toast}
                      index={index}
                      visibleToasts={visibleToasts}
                      isExpanded={isExpanded}
                      onToggleExpanded={() => toggleExpanded(visibleToasts())}
                      canExpand={Boolean(containerContext)}
                      placementEdge={placement().edge}
                      placementAlign={placement().align}
                    />
                  )}
                </For>
              </div>
              <Show when={containerContext}>
                {(context) => (
                  <div
                    class={`toast-controls ${toastControls({ isExpanded: isExpanded() })}`}
                    data-solid-spectrum-toast-controls=""
                  >
                    <ActionButton size="S" onPress={context().clear}>
                      {stringFormatter().format("toast.clearAll")}
                    </ActionButton>
                    <ActionButton size="S" onPress={context().collapse}>
                      {stringFormatter().format("toast.collapse")}
                    </ActionButton>
                  </div>
                )}
              </Show>
            </div>
          </FocusScope>
        );
      }}
    </HeadlessToastRegion>
  );
}

/**
 * A ToastContainer renders the queued toasts in an application. It should be placed
 * at the root of the app.
 */
export function ToastContainer(props: ToastContainerProps): JSX.Element {
  const [local, regionProps] = splitProps(props, ["PRIVATE_forceReducedMotion"]);
  const [isExpanded, setIsExpanded] = createSignal(false);

  onMount(ensureToastAnimationStyles);

  // Track prefers-reduced-motion and mirror it into the module-global flag that
  // startViewTransition reads, restoring the previous value on cleanup.
  const prefersReducedMotion = createMediaQuery("(prefers-reduced-motion)");
  const reduceMotion = () => local.PRIVATE_forceReducedMotion ?? prefersReducedMotion();
  createEffect(() => {
    const previous = globalReduceMotion;
    globalReduceMotion = reduceMotion();
    onCleanup(() => {
      globalReduceMotion = previous;
    });
  });

  // Animate every global-queue mutation (add/remove/clear) with a view transition.
  globalToastQueue.setWrapUpdate((fn, action) => startViewTransition(fn, `toast-${action}`));
  onCleanup(() => globalToastQueue.setWrapUpdate(undefined));

  const unsubscribe = globalToastQueue.subscribe((toasts) => {
    if (toasts.length === 0) {
      setIsExpanded(false);
    }
  });
  onCleanup(unsubscribe);

  const context: ToastContainerContextValue = {
    isExpanded,
    toggleExpanded: () => {
      const expanding = !isExpanded();
      startViewTransition(
        () => setIsExpanded(expanding),
        expanding ? "toast-expand" : "toast-collapse",
      );
    },
    collapse: () => {
      if (isExpanded()) {
        startViewTransition(() => setIsExpanded(false), "toast-collapse");
      }
    },
    clear: () => globalToastQueue.clear(),
    reduceMotion,
  };

  return (
    <ToastContainerContext.Provider value={context}>
      <ToastProvider useGlobalQueue>
        <ToastRegion {...regionProps} />
      </ToastProvider>
    </ToastContainerContext.Provider>
  );
}

/** Toast displays an individual notification with icon, content, action, and close button. */
export function Toast(props: ToastProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "toast",
    "class",
    "index",
    "visibleToasts",
    "isExpanded",
    "onToggleExpanded",
    "canExpand",
    "placementEdge",
    "placementAlign",
  ]);
  const state = useToastContext();
  const containerCtx = useContext(ToastContainerContext);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const ariaStringFormatter = createStringFormatter(toastAriaIntlStrings);
  const content = () => local.toast.content;
  const contentDomProps = () => filterDOMProps(content() as Record<string, unknown>);
  const variant = () => normalizeVariant(content().variant, content().type);
  const title = () => content().children ?? content().title;
  const actionLabel = () => content().actionLabel ?? content().action?.label;
  const actionHandler = () => content().onAction ?? content().action?.onAction;
  const visibleToasts = () => local.visibleToasts?.() ?? [local.toast];
  const index = () => local.index?.() ?? visibleToasts().indexOf(local.toast);
  const isMain = () => index() <= 0;
  const isExpanded = () => local.isExpanded?.() ?? false;
  const shouldRenderAsSingle = () => !isMain() || visibleToasts().length <= 1 || isExpanded();
  const reduceMotion = () => containerCtx?.reduceMotion() ?? false;
  // Upstream gates the per-component view transitions on `ctx && isMain`; our `canExpand`
  // already encodes the presence of a ToastContainer (the upstream `ctx`).
  const useComponentTransition = () => local.canExpand === true && isMain();
  const mainViewTransitionClass = () =>
    [
      "toast",
      !isMain() ? "background-toast" : "",
      local.placementEdge ?? "bottom",
      local.placementAlign ?? "center",
    ]
      .filter(Boolean)
      .join(" ");
  const handleAction = () => {
    actionHandler()?.();
    if (content().shouldCloseOnAction) {
      state.close(local.toast.key);
      state.remove(local.toast.key);
    }
  };

  const backgroundStyle = () =>
    ({
      position: "absolute",
      [local.placementEdge === "top" ? "bottom" : "top"]: "0",
      left: "0",
      width: "100%",
      translate: `0 0 ${(-12 * index()) / 16}rem`,
      opacity: index() >= 3 ? 0 : 1,
      "z-index": visibleToasts().length - index() - 1,
      "pointer-events": "none",
      // When reduced motion is enabled, append the index to the view-transition-name so
      // adding/removing a toast cross-fades instead of transitioning position — the toasts
      // read as separate elements per index rather than the same one moving.
      "view-transition-name": toastViewTransitionName(
        local.toast.key,
        reduceMotion() ? `-${index()}` : "",
      ),
      "view-transition-class": "toast background-toast",
    }) as JSX.CSSProperties;

  return (
    <Show
      when={!isMain() && !isExpanded()}
      fallback={
        <HeadlessToast
          {...contentDomProps()}
          {...rest}
          toast={local.toast}
          data-solid-spectrum-variant={variant()}
          style={
            {
              "z-index": visibleToasts().length - index() - 1,
              "view-transition-name": toastViewTransitionName(local.toast.key),
              "view-transition-class": mainViewTransitionClass(),
            } as JSX.CSSProperties
          }
          class={(_renderProps: ToastRenderProps) =>
            [
              "toast",
              toastStyle({ variant: variant(), isExpanded: isExpanded() }),
              local.class ?? "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <div class={toastBody({ isSingle: shouldRenderAsSingle() })}>
            <div class={useComponentTransition() ? `${toastContent} toast-content` : toastContent}>
              <Show when={getVariantIcon(variant())}>
                {(icon) => (
                  <span class={toastIcon} data-solid-spectrum-toast-icon="">
                    {icon()}
                  </span>
                )}
              </Show>
              <div class={toastText}>
                <Show when={title()}>
                  <HeadlessToastTitle>{title()}</HeadlessToastTitle>
                </Show>
                <Show when={content().description}>
                  <HeadlessToastDescription class={toastDescription}>
                    {content().description}
                  </HeadlessToastDescription>
                </Show>
              </div>
            </div>
            <Show when={local.canExpand && !isExpanded() && visibleToasts().length > 1}>
              <ActionButton
                isQuiet
                staticColor="white"
                styles={toastExpand}
                UNSAFE_className={useComponentTransition() ? "toast-expand" : undefined}
                onPress={local.onToggleExpanded}
              >
                {stringFormatter().format("toast.showAll")}
                <ChevronDownIcon
                  aria-hidden="true"
                  style={{
                    rotate: local.placementEdge === "bottom" ? "180deg" : undefined,
                  }}
                />
              </ActionButton>
            </Show>
            <Show when={actionLabel()}>
              <Button
                variant="secondary"
                fillStyle="outline"
                staticColor="white"
                styles={toastAction}
                UNSAFE_className={useComponentTransition() ? "toast-action" : undefined}
                onPress={handleAction}
              >
                {actionLabel()}
              </Button>
            </Show>
          </div>

          <HeadlessToastCloseButton
            toast={local.toast}
            class={
              useComponentTransition()
                ? `${closeButtonStyles({})} toast-close`
                : closeButtonStyles({})
            }
            aria-label={ariaStringFormatter().format("close")}
          >
            <CloseIcon aria-hidden="true" />
          </HeadlessToastCloseButton>
        </HeadlessToast>
      }
    >
      <div
        role="presentation"
        style={backgroundStyle()}
        class={`toast ${toastStyle({ variant: variant(), isExpanded: isExpanded() })}`}
        data-solid-spectrum-toast-background-item=""
        data-solid-spectrum-variant={variant()}
      />
    </Show>
  );
}

/**
 * Add a legacy Solid toast to the global queue.
 * Prefer ToastQueue.neutral/positive/negative/info for the React Spectrum S2 API.
 */
export function addToast(content: ToastContent, options?: StatelyToastOptions): string {
  return headlessAddToast(content, options);
}

/** Backward-compatible helper for existing Solid callers. */
export function toastSuccess(
  message: string,
  options?: Omit<StatelyToastOptions, "priority">,
): string {
  return addToast(
    { title: message, type: "success", variant: "positive" },
    { timeout: 5000, ...options },
  );
}

/** Backward-compatible helper for existing Solid callers. */
export function toastError(
  message: string,
  options?: Omit<StatelyToastOptions, "priority">,
): string {
  return addToast(
    { title: message, type: "error", variant: "negative" },
    { timeout: 8000, ...options },
  );
}

/** Backward-compatible helper for existing Solid callers. */
export function toastWarning(
  message: string,
  options?: Omit<StatelyToastOptions, "priority">,
): string {
  return addToast(
    { title: message, type: "warning", variant: "negative" },
    { timeout: 6000, ...options },
  );
}

/** Backward-compatible helper for existing Solid callers. */
export function toastInfo(
  message: string,
  options?: Omit<StatelyToastOptions, "priority">,
): string {
  return addToast({ title: message, type: "info", variant: "info" }, { timeout: 5000, ...options });
}

export const ToastQueue = {
  /** Queues a neutral toast. */
  neutral(children: string, options: ToastOptions = {}): () => void {
    return addSpectrumToast(children, "neutral", options);
  },
  /** Queues a positive toast. */
  positive(children: string, options: ToastOptions = {}): () => void {
    return addSpectrumToast(children, "positive", options);
  },
  /** Queues a negative toast. */
  negative(children: string, options: ToastOptions = {}): () => void {
    return addSpectrumToast(children, "negative", options);
  },
  /** Queues an informational toast. */
  info(children: string, options: ToastOptions = {}): () => void {
    return addSpectrumToast(children, "info", options);
  },
};

export {
  ToastContext,
  globalToastQueue,
  StatelyToastQueue,
  useToastContext,
  type ToastContent,
  type ToastRenderProps,
  type ToastRegionRenderProps,
  type QueuedToast,
  type StatelyToastOptions,
};
