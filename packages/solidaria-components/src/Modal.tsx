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
  createEnterAnimation,
  createExitAnimation,
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
import { VisuallyHidden } from "./VisuallyHidden";

/**
 * Internal context to signal that Modal is wrapped in ModalOverlay.
 * When present, Modal should not create its own Portal.
 */
interface InternalModalContextValue {
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  // Upstream's ModalOverlay owns the modal element's ref so it can watch the
  // modal surface's exit animation alongside the overlay's (both must finish
  // before the overlay unmounts). ModalContent registers its element here.
  setModalRef?: (element: HTMLElement | null) => void;
  // Combined exit flag (overlay OR modal still exiting). Both the overlay and
  // the modal surface carry `data-exiting` off this so they fade out together.
  isExiting?: () => boolean;
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

  // Enter/exit animation state (mirrors upstream's ModalOverlayWithForwardRef +
  // ModalOverlayInner). The overlay stays mounted here even while closed, so the
  // enter animation is gated on `isOpen` (isReady) — otherwise it would resolve
  // to "done entering" before the element ever mounts. Exit is watched for BOTH
  // the overlay and the modal surface; the modal registers its element via
  // InternalModalContext (setModalRef) so we can await its exit too.
  let overlayRef!: HTMLDivElement;
  // Signal-backed so the enter/exit effects re-run once the element mounts — a
  // plain closure over `overlayRef` would read `null` if the effect fired first
  // and, with no reactive dep on the ref, never recover (stuck `data-entering`).
  const [overlayEl, setOverlayEl] = createSignal<HTMLElement | null>(null);
  const overlayRefAccessor = () => overlayEl();
  const registerOverlayRef = (element: HTMLDivElement) => {
    overlayRef = element;
    setOverlayEl(element);
  };
  const [modalEl, setModalEl] = createSignal<HTMLElement | null>(null);

  const isOverlayEntering = createEnterAnimation(overlayRefAccessor, isOpen);
  const isOverlayExiting = createExitAnimation(overlayRefAccessor, isOpen);
  const isModalExiting = createExitAnimation(() => modalEl(), isOpen);
  const overlayEntering = () => isOverlayEntering() || (local.isEntering ?? false);
  const combinedExiting = () =>
    isOverlayExiting() || isModalExiting() || (local.isExiting ?? false);

  const renderValues = createMemo<ModalRenderProps>(() => ({
    isEntering: overlayEntering(),
    isExiting: combinedExiting(),
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
    setModalRef: setModalEl,
    isExiting: combinedExiting,
  };
  const portalContext = useUNSAFE_PortalContext();
  const portalContainer = () => portalContext.getContainer?.() ?? undefined;

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
    <Show when={isHydrated() && (isOpen() || combinedExiting())}>
      <Portal mount={portalContainer()}>
        <OverlayTriggerStateContext.Provider value={state}>
          <InternalModalContext.Provider value={internalModalContext}>
            <div
              {...domProps()}
              ref={registerOverlayRef}
              class={renderProps.class()}
              style={renderProps.style()}
              data-entering={dataAttr(overlayEntering())}
              data-exiting={dataAttr(combinedExiting())}
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

  // If wrapped in ModalOverlay, just render the content. ModalContent reads the
  // overlay's InternalModalContext itself (via useContext), so nothing needs
  // threading — in both branches ModalContent renders inside a provider.
  if (internalContext) {
    return <ModalContent {...modalProps}>{props.children}</ModalContent>;
  }

  // For standalone usage, wrap in ModalOverlay.
  return (
    <ModalOverlay {...overlayProps}>
      <ModalContent {...modalProps}>{props.children}</ModalContent>
    </ModalOverlay>
  );
}

/**
 * Internal component that renders the actual modal content.
 * Used by both standalone Modal and Modal wrapped in ModalOverlay.
 */
function ModalContent(props: ModalProps): JSX.Element {
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
  ]);

  let modalRef!: HTMLDivElement;
  const modalRefAccessor = () => modalRef ?? null;
  // Signal-backed element for the enter animation, so the effect re-runs when
  // the surface mounts (see the overlay's note); the plain `modalRef` var still
  // backs the synchronous consumers (focus stack, interact-outside, aria-hide).
  const [modalEl, setModalEl] = createSignal<HTMLElement | null>(null);

  // Get state from parent OverlayTriggerStateContext (provided by ModalOverlay)
  const parentState = useContext(OverlayTriggerStateContext);

  // The overlay (auto or user-provided) always wraps this content, so it owns
  // the InternalModalContext: dismissal settings, the modal-ref registration
  // sink, and the combined exit flag.
  const internalContext = useContext(InternalModalContext);

  // Get dismissable settings from internal context (set by ModalOverlay)
  const isDismissable = () => internalContext?.isDismissable ?? local.isDismissable;
  const isKeyboardDismissDisabled = () =>
    internalContext?.isKeyboardDismissDisabled ?? local.isKeyboardDismissDisabled;

  // Determine if open from parent state
  const isOpen = (): boolean => {
    if (local.isOpen !== undefined) return local.isOpen;
    return parentState?.isOpen ?? false;
  };

  // Register this element with the overlay so it can await the modal surface's
  // exit animation (upstream threads modalRef down the same way). The overlay's
  // combined exit flag drives this surface's `data-exiting`. The enter animation
  // is local — the modal fades/slides in on its own timeline (delay 160 vs the
  // overlay's 0).
  const registerModalRef = (element: HTMLDivElement) => {
    modalRef = element;
    setModalEl(element);
    internalContext?.setModalRef?.(element);
  };
  const isModalEntering = createEnterAnimation(() => modalEl(), isOpen);
  const isModalExiting = () => internalContext?.isExiting?.() ?? (local.isExiting ?? false);

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
      cleanup = ariaHideOutside([modalRef], { shouldUseInert: true });
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
    isEntering: isModalEntering(),
    isExiting: isModalExiting(),
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
    // No autoFocus: react-aria's Overlay renders FocusScope with restoreFocus +
    // contain only — initial focus is useDialog's job (it focuses the dialog
    // element itself when nothing inside holds focus).
    <FocusScope contain restoreFocus>
      <div
        {...domProps()}
        ref={registerModalRef}
        class={renderProps.class()}
        style={renderProps.style()}
        data-entering={dataAttr(isModalEntering())}
        data-exiting={dataAttr(isModalExiting())}
      >
        <Show when={isDismissable()}>
          {/* Faithful to react-aria's DismissButton: a bare button carrying
              only `width/height: 1px` inside a VisuallyHidden `div` wrapper —
              NOT the hidden styles inlined onto the button. The wrapper clips
              it out of sight while the button keeps its intrinsic UA border-box,
              which is exactly what upstream renders (and what D8 target-size
              measures against the pair oracle). Inlining the reset onto the
              button instead collapsed it to a 1x1 box, diverging from
              upstream's ~16x6 sentinel. */}
          <VisuallyHidden elementType="div">
            <button
              aria-label="Dismiss"
              tabIndex={-1}
              onClick={close}
              style={{ width: "1px", height: "1px" }}
            />
          </VisuallyHidden>
        </Show>
        {renderProps.renderChildren()}
      </div>
    </FocusScope>
  );
}

export default Modal;
