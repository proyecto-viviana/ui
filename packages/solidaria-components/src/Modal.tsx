/**
 * Modal and ModalOverlay components for solidaria-components
 *
 * Headless modal components with overlay, focus trapping, and dismissal handling.
 * Port of react-aria-components Modal.
 */

import {
  type JSX,
  createContext,
  createMemo,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  Show,
  useContext,
} from "solid-js";
import { Portal, isServer } from "solid-js/web";
import {
  createInteractOutside,
  ariaHideOutside,
  FocusScope,
  useUNSAFE_PortalContext,
} from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  useRenderProps,
  filterDOMProps,
  dataAttr,
  useIsHydrated,
} from "./utils";
import {
  DialogTriggerContext,
  OverlayTriggerStateContext,
  type OverlayTriggerState,
} from "./contexts";

/**
 * Internal context to signal that Modal is wrapped in ModalOverlay.
 * When present, Modal should not create its own Portal.
 */
interface InternalModalContextValue {
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
}

const InternalModalContext = createContext<InternalModalContextValue | null>(null);

// Stack of visible modals, used to ensure only the top-most modal dismisses on Escape/outside interaction.
const visibleModals: Array<() => Element | null> = [];

function pruneDisconnectedModals() {
  for (let index = visibleModals.length - 1; index >= 0; index -= 1) {
    const element = visibleModals[index]?.();
    if (!element?.isConnected) {
      visibleModals.splice(index, 1);
    }
  }
}

export interface ModalRenderProps {
  /** Whether the modal is currently entering (for animations). */
  isEntering: boolean;
  /** Whether the modal is currently exiting (for animations). */
  isExiting: boolean;
}

export interface ModalOverlayProps {
  /** The children of the component - can be JSX or render function. */
  children?: RenderChildren<ModalRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ModalRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ModalRenderProps>;
  /** Whether the modal is open (controlled). */
  isOpen?: boolean;
  /** Whether the modal opens by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the modal's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether clicking outside the modal closes it. */
  isDismissable?: boolean;
  /** Whether pressing Escape closes the modal. */
  isKeyboardDismissDisabled?: boolean;
  /** Whether the modal is entering (for animations). */
  isEntering?: boolean;
  /** Whether the modal is exiting (for animations). */
  isExiting?: boolean;
}

export interface ModalProps extends ModalOverlayProps {}

export { OverlayTriggerStateContext, type OverlayTriggerState } from "./contexts";
export { useOverlayTriggerState } from "./contexts";
export const ModalContext = OverlayTriggerStateContext;

/**
 * ModalOverlay is the backdrop/underlay behind a modal.
 * It handles click-outside dismissal and provides styling hooks.
 */
export function ModalOverlay(props: ModalOverlayProps): JSX.Element {
  // Do NOT early-return on the server: rendering children bare on the server and a
  // <Show>/<Portal> overlay on the client desyncs hydration. Run the same structure
  // on both and gate the Portal on useIsHydrated() (see Popover for the rationale).
  const isHydrated = useIsHydrated();

  // IMPORTANT: Don't destructure or access props.children early!
  // In SolidJS, children are lazily evaluated. Accessing them before
  // the context provider renders causes them to evaluate outside the context.
  // See: https://github.com/solidjs/solid/issues/182
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "isDismissable",
    "isKeyboardDismissDisabled",
    "isEntering",
    "isExiting",
  ]);

  // Get state from DialogTrigger context if available
  const dialogTriggerContext = useContext(DialogTriggerContext);

  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? false);

  // Determine if open (controlled > DialogTrigger context > uncontrolled)
  const isOpen = (): boolean => {
    if (local.isOpen !== undefined) return local.isOpen;
    if (dialogTriggerContext) return dialogTriggerContext.state.isOpen();
    return internalOpen();
  };

  const close = () => {
    if (local.isOpen !== undefined) {
      local.onOpenChange?.(false);
    } else if (dialogTriggerContext) {
      dialogTriggerContext.state.close();
      local.onOpenChange?.(false);
    } else {
      setInternalOpen(false);
      local.onOpenChange?.(false);
    }
  };

  const open = () => {
    if (local.isOpen !== undefined) {
      local.onOpenChange?.(true);
    } else if (dialogTriggerContext) {
      dialogTriggerContext.state.open();
      local.onOpenChange?.(true);
    } else {
      setInternalOpen(true);
      local.onOpenChange?.(true);
    }
  };

  const toggle = () => {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  };

  const state: OverlayTriggerState = {
    get isOpen() {
      return isOpen();
    },
    open,
    close,
    toggle,
  };

  const renderValues = createMemo<ModalRenderProps>(() => ({
    isEntering: local.isEntering ?? false,
    isExiting: local.isExiting ?? false,
  }));

  // Resolve render props - don't pass children, we'll render props.children directly
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ModalOverlay",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  // Internal context value to signal Modal that it's wrapped
  const internalModalContext: InternalModalContextValue = {
    isDismissable: local.isDismissable,
    isKeyboardDismissDisabled: local.isKeyboardDismissDisabled,
  };
  const portalContext = useUNSAFE_PortalContext();
  const portalContainer = () => portalContext.getContainer?.() ?? undefined;
  let overlayRef!: HTMLDivElement;

  const isTopMostModalInOverlay = () => {
    pruneDisconnectedModals();
    const topMostModal = visibleModals[visibleModals.length - 1]?.();
    return !topMostModal || overlayRef?.contains(topMostModal);
  };

  const handleOverlayPointerDown: JSX.EventHandler<HTMLDivElement, PointerEvent> = (event) => {
    if (local.isDismissable && event.target === event.currentTarget && isTopMostModalInOverlay()) {
      close();
    }
  };

  createEffect(() => {
    if (!isOpen() || local.isKeyboardDismissDisabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.isComposing && isTopMostModalInOverlay()) {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown, true);
    });
  });

  // Resolve children - handle both static JSX and render functions
  // IMPORTANT: We access props.children directly (not local.children) to preserve
  // lazy evaluation inside context providers
  const resolveChildren = () => {
    const children = props.children;
    if (typeof children === "function") {
      return (children as (props: ModalRenderProps) => JSX.Element)(renderValues());
    }
    return children;
  };

  return (
    <Show when={isHydrated() && (isOpen() || local.isExiting)}>
      <Portal mount={portalContainer()}>
        <OverlayTriggerStateContext.Provider value={state}>
          <InternalModalContext.Provider value={internalModalContext}>
            <div
              {...domProps()}
              ref={overlayRef}
              class={renderProps.class()}
              style={renderProps.style()}
              data-entering={dataAttr(local.isEntering)}
              data-exiting={dataAttr(local.isExiting)}
              onPointerDown={handleOverlayPointerDown}
            >
              {resolveChildren()}
            </div>
          </InternalModalContext.Provider>
        </OverlayTriggerStateContext.Provider>
      </Portal>
    </Show>
  );
}

/**
 * Modal is a dialog container that manages focus trapping, scroll prevention,
 * aria-hiding of content outside, and dismissal.
 *
 * Usage patterns:
 * 1. Standalone: `<Modal isOpen>...</Modal>` - Creates its own overlay
 * 2. With custom overlay: `<ModalOverlay><Modal>...</Modal></ModalOverlay>`
 *
 * Note: Due to SolidJS's eager JSX evaluation, we cannot detect at render time
 * whether Modal is wrapped in ModalOverlay. So standalone Modal always creates
 * an overlay, and wrapped Modal renders directly (relying on InternalModalContext).
 */
export function Modal(props: ModalProps): JSX.Element {
  // Check for InternalModalContext which signals we're inside a rendered ModalOverlay
  // This works because ModalContent is rendered INSIDE ModalOverlay's Show/Portal
  return <ModalContentWithAutoOverlay {...props} />;
}

/**
 * Helper component that handles the overlay detection.
 * By being a separate component, we can use Show to defer rendering until
 * the parent context is available.
 */
function ModalContentWithAutoOverlay(props: ModalProps): JSX.Element {
  const [overlayProps, modalProps] = splitProps(props, [
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "isDismissable",
    "isKeyboardDismissDisabled",
    "isEntering",
    "isExiting",
  ]);

  // Check for InternalModalContext - if present, we're inside a ModalOverlay
  const internalContext = useContext(InternalModalContext);

  // If wrapped in ModalOverlay, just render the content
  if (internalContext) {
    return (
      <ModalContent {...modalProps} internalContext={internalContext}>
        {props.children}
      </ModalContent>
    );
  }

  // For standalone usage, wrap in ModalOverlay
  const standaloneContext: InternalModalContextValue = {
    isDismissable: overlayProps.isDismissable,
    isKeyboardDismissDisabled: overlayProps.isKeyboardDismissDisabled,
  };

  return (
    <ModalOverlay {...overlayProps}>
      <ModalContent {...modalProps} internalContext={standaloneContext}>
        {props.children}
      </ModalContent>
    </ModalOverlay>
  );
}

/**
 * Internal component that renders the actual modal content.
 * Used by both standalone Modal and Modal wrapped in ModalOverlay.
 */
function ModalContent(
  props: ModalProps & { internalContext: InternalModalContextValue },
): JSX.Element {
  if (isServer) {
    return <>{props.children}</>;
  }

  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "style",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "isDismissable",
    "isKeyboardDismissDisabled",
    "isEntering",
    "isExiting",
    "internalContext",
  ]);

  let modalRef!: HTMLDivElement;
  const modalRefAccessor = () => modalRef ?? null;

  // Get state from parent OverlayTriggerStateContext (provided by ModalOverlay)
  const parentState = useContext(OverlayTriggerStateContext);

  // Get dismissable settings from internal context (set by ModalOverlay)
  const isDismissable = () => local.internalContext?.isDismissable ?? local.isDismissable;
  const isKeyboardDismissDisabled = () =>
    local.internalContext?.isKeyboardDismissDisabled ?? local.isKeyboardDismissDisabled;

  // Determine if open from parent state
  const isOpen = (): boolean => {
    if (local.isOpen !== undefined) return local.isOpen;
    return parentState?.isOpen ?? false;
  };

  // Keep this modal in a global stack so nested modals dismiss in top-down order.
  createEffect(() => {
    if (!isOpen()) return;

    pruneDisconnectedModals();
    if (!visibleModals.includes(modalRefAccessor)) {
      visibleModals.push(modalRefAccessor);
    }

    onCleanup(() => {
      const index = visibleModals.indexOf(modalRefAccessor);
      if (index >= 0) {
        visibleModals.splice(index, 1);
      }
    });
  });

  const isTopMostModal = () => {
    pruneDisconnectedModals();
    return visibleModals[visibleModals.length - 1] === modalRefAccessor;
  };

  const close = () => {
    if (local.isOpen !== undefined) {
      local.onOpenChange?.(false);
    } else {
      parentState?.close();
    }
  };

  // Prevent scroll when modal is open
  createEffect(() => {
    if (!isOpen()) return;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    onCleanup(() => {
      html.style.overflow = prevOverflow;
    });
  });

  // Click outside to close (if dismissable)
  createEffect(() => {
    if (!isOpen() || !isDismissable()) return;

    createInteractOutside({
      ref: modalRefAccessor,
      onInteractOutside: () => {
        if (isTopMostModal()) {
          close();
        }
      },
      isDisabled: false,
    });
  });

  // Escape key to close
  createEffect(() => {
    if (!isOpen() || isKeyboardDismissDisabled()) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.isComposing && isTopMostModal()) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown, true);
    });
  });

  // Aria-hide outside content
  createEffect(() => {
    if (!isOpen() || !modalRef) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const ownerWindow = modalRef.ownerDocument.defaultView ?? window;

    const hideOutside = () => {
      if (cancelled || !modalRef?.isConnected) return;
      cleanup = ariaHideOutside([modalRef]);
    };

    if (modalRef.isConnected) {
      hideOutside();
    } else {
      ownerWindow.queueMicrotask(hideOutside);
    }

    onCleanup(() => {
      cancelled = true;
      cleanup?.();
    });
  });

  const renderValues = createMemo<ModalRenderProps>(() => ({
    isEntering: local.isEntering ?? false,
    isExiting: local.isExiting ?? false,
  }));

  const renderProps = useRenderProps(
    {
      // Lazy: the modal content is gated behind `<Show when={isHydrated() && …}>`
      // (Portal) below, so it must not be instantiated during the component body.
      // An eager `children: props.children` would build the content template (and
      // walk getNextElement) before the gate — content the server never emitted →
      // hydration mismatch. See Popover for the full rationale.
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Modal",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  return (
    <FocusScope contain restoreFocus autoFocus>
      <div
        {...domProps()}
        ref={modalRef}
        class={renderProps.class()}
        style={renderProps.style()}
        data-entering={dataAttr(local.isEntering)}
        data-exiting={dataAttr(local.isExiting)}
      >
        <Show when={isDismissable()}>
          <button
            type="button"
            aria-label="Dismiss"
            tabIndex={-1}
            onClick={close}
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              "white-space": "nowrap",
              border: 0,
            }}
          />
        </Show>
        {renderProps.renderChildren()}
      </div>
    </FocusScope>
  );
}

export default Modal;
