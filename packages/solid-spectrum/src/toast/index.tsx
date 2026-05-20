import {
  type JSX,
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  For,
  onCleanup,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { FocusScope, createPreventScroll } from "@proyecto-viviana/solidaria";
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
import { focusRing, style } from "../s2-style";

export type ToastPlacement = "top" | "top end" | "bottom" | "bottom end";
export type ToastVariant = "positive" | "negative" | "info" | "neutral";
type LegacyToastVariant = "success" | "warning" | "error";
type ToastEdge = "top" | "bottom";
type ToastAlign = "center" | "end";

export interface ToastOptions extends Omit<StatelyToastOptions, "priority"> {
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

export interface ToastContainerProps extends ToastRegionProps {}

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
  /** Internal placement edge used for collapsed background stack positioning. */
  placementEdge?: ToastEdge;
}

interface ToastContainerContextValue {
  isExpanded: Accessor<boolean>;
  toggleExpanded: () => void;
  collapse: () => void;
  clear: () => void;
}

const ToastContainerContext = createContext<ToastContainerContextValue | null>(null);

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
  const key = headlessAddToast(
    {
      children,
      variant,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
      shouldCloseOnAction: options.shouldCloseOnAction,
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
                  class={toastBackground}
                  data-solid-spectrum-toast-background=""
                  onClick={containerContext?.collapse}
                />
              </Show>
              <div
                class={toastList({ placement: placement().edge, isExpanded: isExpanded() })}
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
                      placementEdge={placement().edge}
                    />
                  )}
                </For>
              </div>
              <Show when={containerContext}>
                {(context) => (
                  <div
                    class={toastControls({ isExpanded: isExpanded() })}
                    data-solid-spectrum-toast-controls=""
                  >
                    <ActionButton size="S" onPress={context().clear}>
                      Clear all
                    </ActionButton>
                    <ActionButton size="S" onPress={context().collapse}>
                      Collapse
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
  const [isExpanded, setIsExpanded] = createSignal(false);
  const unsubscribe = globalToastQueue.subscribe((toasts) => {
    if (toasts.length === 0) {
      setIsExpanded(false);
    }
  });
  onCleanup(unsubscribe);

  const context: ToastContainerContextValue = {
    isExpanded,
    toggleExpanded: () => setIsExpanded((value) => !value),
    collapse: () => setIsExpanded(false),
    clear: () => globalToastQueue.clear(),
  };

  return (
    <ToastContainerContext.Provider value={context}>
      <ToastProvider useGlobalQueue>
        <ToastRegion {...props} />
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
    "placementEdge",
  ]);
  const state = useToastContext();
  const content = () => local.toast.content;
  const variant = () => normalizeVariant(content().variant, content().type);
  const title = () => content().children ?? content().title;
  const actionLabel = () => content().actionLabel ?? content().action?.label;
  const actionHandler = () => content().onAction ?? content().action?.onAction;
  const visibleToasts = () => local.visibleToasts?.() ?? [local.toast];
  const index = () => local.index?.() ?? visibleToasts().indexOf(local.toast);
  const isMain = () => index() <= 0;
  const isExpanded = () => local.isExpanded?.() ?? false;
  const shouldRenderAsSingle = () => !isMain() || visibleToasts().length <= 1 || isExpanded();
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
    }) as JSX.CSSProperties;

  return (
    <Show
      when={!isMain() && !isExpanded()}
      fallback={
        <HeadlessToast
          {...rest}
          toast={local.toast}
          data-solid-spectrum-variant={variant()}
          style={{
            "z-index": visibleToasts().length - index() - 1,
          }}
          class={(_renderProps: ToastRenderProps) =>
            [toastStyle({ variant: variant(), isExpanded: isExpanded() }), local.class ?? ""]
              .filter(Boolean)
              .join(" ")
          }
        >
          <div class={toastBody({ isSingle: shouldRenderAsSingle() })}>
            <div class={toastContent}>
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
            <Show when={!isExpanded() && visibleToasts().length > 1}>
              <ActionButton
                isQuiet
                staticColor="white"
                styles={toastExpand}
                onPress={local.onToggleExpanded}
              >
                Show all
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
                onPress={handleAction}
              >
                {actionLabel()}
              </Button>
            </Show>
          </div>

          <HeadlessToastCloseButton
            toast={local.toast}
            class={closeButtonStyles({})}
            aria-label="Close"
          >
            <CloseIcon aria-hidden="true" />
          </HeadlessToastCloseButton>
        </HeadlessToast>
      }
    >
      <div
        role="presentation"
        style={backgroundStyle()}
        class={toastStyle({ variant: variant(), isExpanded: isExpanded() })}
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
