/**
 * Popover component for solidaria-components
 *
 * A headless popover component that positions relative to a trigger element.
 * Port of react-aria-components Popover.
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import {
  createOverlayTrigger,
  createPopover,
  FocusScope,
  useUNSAFE_PortalContext,
  visuallyHiddenStyles,
  type Placement,
  type PlacementAxis,
} from "@proyecto-viviana/solidaria";
import { createOverlayTriggerState } from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  dataAttr,
  useIsHydrated,
} from "./utils";
import { DialogTriggerContext, PopoverTriggerContext } from "./contexts";

export interface PopoverRenderProps {
  /**
   * The name of the component that triggered the popover.
   */
  trigger: string | null;
  /**
   * The placement of the popover relative to the trigger.
   */
  placement: PlacementAxis | null;
  /**
   * Whether the popover is currently entering (for animations).
   */
  isEntering: boolean;
  /**
   * Whether the popover is currently exiting (for animations).
   */
  isExiting: boolean;
}

export interface PopoverProps extends SlotProps {
  /** The children of the component - can be JSX or render function. */
  children?: RenderChildren<PopoverRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<PopoverRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<PopoverRenderProps>;
  /**
   * The name of the component that triggered the popover.
   */
  trigger?: string;
  /**
   * The ref for the element which the popover positions itself with respect to.
   * Required when used standalone (not within a trigger component).
   */
  triggerRef?: () => Element | null;
  /**
   * The placement of the element with respect to its anchor element.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * The placement padding that should be applied between the element and its
   * surrounding container.
   * @default 12
   */
  containerPadding?: number;
  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   * @default 8
   */
  offset?: number;
  /**
   * The additional offset applied along the cross axis between the element and its
   * anchor element.
   * @default 0
   */
  crossOffset?: number;
  /**
   * Whether the element should flip its orientation when there is insufficient room.
   * @default true
   */
  shouldFlip?: boolean;
  /**
   * The max height of the popover.
   */
  maxHeight?: number;
  /**
   * A boundary element for placement calculations.
   */
  boundaryElement?: Element;
  /**
   * A ref for the popover arrow element.
   */
  arrowRef?: () => Element | null;
  /**
   * A ref for the scrollable popover element.
   */
  scrollRef?: () => Element | null;
  /**
   * Whether the popover is non-modal (allows interaction outside).
   */
  isNonModal?: boolean;
  /**
   * Whether pressing Escape to close should be disabled.
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * Filter for which outside interactions should close the popover.
   */
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
  /** Whether the popover is open (controlled). */
  isOpen?: boolean;
  /** Whether the popover opens by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the popover's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether focus should move to the popover container on open.
   * @default true
   */
  autoFocus?: boolean;
  /** Whether the popover is entering (for animations). */
  isEntering?: boolean;
  /** Whether the popover is exiting (for animations). */
  isExiting?: boolean;
}

export interface PopoverTriggerProps {
  /** The children - should include a trigger and popover content. */
  children: JSX.Element;
  /** Whether the popover is open (controlled). */
  isOpen?: boolean;
  /** Whether the popover is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export {
  PopoverTriggerContext,
  usePopoverTrigger,
  type PopoverTriggerContextValue,
} from "./contexts";

interface PopoverContextValue {
  placement: () => PlacementAxis | null;
  arrowProps: () => JSX.HTMLAttributes<HTMLElement>;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);
const PopoverGroupContext = createContext<(() => HTMLElement | null) | null>(null);

function PopoverDismissButton(props: { onDismiss: () => void }): JSX.Element {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      tabIndex={-1}
      onClick={props.onDismiss}
      style={visuallyHiddenStyles}
    />
  );
}

/**
 * A PopoverTrigger opens a popover when a trigger element is pressed.
 * Children should include a trigger element (e.g. Button) and the Popover.
 */
export function PopoverTrigger(props: PopoverTriggerProps): JSX.Element {
  const [local] = splitProps(props, ["isOpen", "defaultOpen", "onOpenChange"]);

  const state = createOverlayTriggerState({
    get isOpen() {
      return local.isOpen;
    },
    get defaultOpen() {
      return local.defaultOpen;
    },
    onOpenChange: local.onOpenChange,
  });

  let triggerRef: HTMLElement | null = null;
  const triggerId = createUniqueId();

  const triggerAria = createOverlayTrigger({ type: "dialog" }, state, () => triggerRef);

  const contextValue = createMemo(() => ({
    state: {
      isOpen: () => state.isOpen(),
      open: () => state.open(),
      close: () => state.close(),
      toggle: () => state.toggle(),
    },
    triggerRef: () => triggerRef,
    setTriggerRef: (el: HTMLElement | null) => {
      if (!el) return;
      if (!triggerRef || !triggerRef.isConnected) {
        triggerRef = el;
      }
    },
    triggerId,
    triggerProps: triggerAria.triggerProps,
    overlayProps: triggerAria.overlayProps,
    trigger: "PopoverTrigger",
  }));

  return (
    <PopoverTriggerContext.Provider value={contextValue()}>
      {props.children}
    </PopoverTriggerContext.Provider>
  );
}

/**
 * A popover is an overlay element positioned relative to a trigger.
 */
export function Popover(props: PopoverProps): JSX.Element {
  // Note: do NOT early-return on the server. Returning `null` on the server and a
  // full <Show>/<Portal> tree on the client desyncs Solid's hydration walk (the
  // server emits no marker for the <Show>), which surfaces as "Hydration Mismatch /
  // getNextElement" in the parent (e.g. Picker). Instead, run the same structure on
  // both and gate the Portal on `useIsHydrated()` so the overlay only mounts on the
  // client after hydration — the server + first client render both produce an empty
  // <Show> marker, so hydration aligns.
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "trigger",
    "triggerRef",
    "placement",
    "containerPadding",
    "offset",
    "crossOffset",
    "shouldFlip",
    "maxHeight",
    "boundaryElement",
    "arrowRef",
    "scrollRef",
    "isNonModal",
    "isKeyboardDismissDisabled",
    "shouldCloseOnInteractOutside",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "autoFocus",
    "isEntering",
    "isExiting",
  ]);

  let popoverRef!: HTMLDivElement;
  const [groupRef, setGroupRef] = createSignal<HTMLDivElement | null>(null);
  // False on the server and during hydration; true after onMount. Gates the Portal
  // so overlay content only ever renders client-side, post-hydration.
  const isHydrated = useIsHydrated();

  const triggerContext = useContext(PopoverTriggerContext);
  const dialogTriggerContext = useContext(DialogTriggerContext);
  const popoverGroupContext = useContext(PopoverGroupContext);
  const resolvedTrigger = () =>
    local.trigger ??
    triggerContext?.trigger ??
    (dialogTriggerContext ? "DialogTrigger" : undefined);
  const isSubPopover = () => resolvedTrigger() === "SubmenuTrigger" && popoverGroupContext != null;

  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? false);

  const isOpen = (): boolean => {
    if (local.isOpen !== undefined) return local.isOpen;
    if (triggerContext) {
      return triggerContext.state.isOpen();
    }
    if (dialogTriggerContext) {
      return dialogTriggerContext.state.isOpen();
    }
    return internalOpen();
  };

  const close = () => {
    if (local.isOpen !== undefined) {
      local.onOpenChange?.(false);
    } else if (triggerContext) {
      triggerContext.state.close();
      local.onOpenChange?.(false);
    } else if (dialogTriggerContext) {
      dialogTriggerContext.state.close();
      local.onOpenChange?.(false);
    } else {
      setInternalOpen(false);
      local.onOpenChange?.(false);
    }
  };

  const getTriggerRef = () => {
    if (local.triggerRef) return local.triggerRef();
    if (triggerContext) return triggerContext.triggerRef();
    if (dialogTriggerContext) return dialogTriggerContext.triggerRef();
    return null;
  };

  const popoverAria = createPopover(
    {
      triggerRef: getTriggerRef,
      popoverRef: () => popoverRef ?? null,
      groupRef: () => (isSubPopover() ? (popoverGroupContext?.() ?? null) : groupRef()),
      get placement() {
        return local.placement;
      },
      get containerPadding() {
        return local.containerPadding;
      },
      get offset() {
        return local.offset ?? 8;
      },
      get crossOffset() {
        return local.crossOffset;
      },
      get shouldFlip() {
        return local.shouldFlip;
      },
      get maxHeight() {
        return local.maxHeight;
      },
      get boundaryElement() {
        return local.boundaryElement;
      },
      get arrowRef() {
        return local.arrowRef;
      },
      get scrollRef() {
        return local.scrollRef;
      },
      get isNonModal() {
        return local.isNonModal;
      },
      get isKeyboardDismissDisabled() {
        return local.isKeyboardDismissDisabled;
      },
      get shouldCloseOnInteractOutside() {
        return local.shouldCloseOnInteractOutside;
      },
      get trigger() {
        return resolvedTrigger();
      },
    },
    {
      isOpen,
      open: () => {
        if (local.isOpen !== undefined) {
          local.onOpenChange?.(true);
        } else if (triggerContext) {
          triggerContext.state.open();
          local.onOpenChange?.(true);
        } else if (dialogTriggerContext) {
          dialogTriggerContext.state.open();
          local.onOpenChange?.(true);
        } else {
          setInternalOpen(true);
          local.onOpenChange?.(true);
        }
      },
      close,
      toggle: () => {
        if (isOpen()) close();
        else if (local.isOpen !== undefined) {
          local.onOpenChange?.(true);
        } else if (triggerContext) {
          triggerContext.state.toggle();
        } else if (dialogTriggerContext) {
          dialogTriggerContext.state.toggle();
        } else {
          setInternalOpen(true);
          local.onOpenChange?.(true);
        }
      },
    },
  );

  const renderValues = createMemo<PopoverRenderProps>(() => ({
    trigger: resolvedTrigger() ?? null,
    placement: popoverAria.placement(),
    isEntering: local.isEntering ?? false,
    isExiting: local.isExiting ?? false,
  }));

  const renderProps = useRenderProps(
    {
      // Read children lazily. The popover content is gated behind
      // `<Show when={isHydrated() && …}>` below, so it must NOT be instantiated
      // during the component body. An eager `children: props.children` reads the
      // child getter at object-construction time, building the content template
      // (and walking `getNextElement`) before the gate — which the server, with
      // the gate closed, never emitted → hydration mismatch. The getter defers
      // the read until `renderChildren()` runs inside the gated overlay.
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Popover",
    },
    renderValues,
  );

  const [triggerWidth, setTriggerWidth] = createSignal<string | undefined>();
  const hasExplicitTriggerWidth = () => {
    const style = renderProps.style() as (JSX.CSSProperties & Record<string, unknown>) | undefined;
    return style?.["--trigger-width"] != null;
  };
  const updateTriggerWidth = () => {
    const trigger = getTriggerRef();
    if (!trigger || hasExplicitTriggerWidth()) return;
    setTriggerWidth(`${trigger.getBoundingClientRect().width}px`);
  };
  createEffect(() => {
    if (!isOpen()) return;
    updateTriggerWidth();

    const trigger = getTriggerRef();
    if (!trigger || hasExplicitTriggerWidth() || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateTriggerWidth);
    observer.observe(trigger);
    onCleanup(() => observer.disconnect());
  });

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const overlayId = () => {
    const restId = (rest as Record<string, unknown>).id as string | undefined;
    return (
      restId ??
      (triggerContext?.overlayProps?.id as string | undefined) ??
      (dialogTriggerContext?.overlayProps?.id as string | undefined)
    );
  };

  const cleanPopoverProps = () => {
    const {
      style: _style,
      ref: _ref,
      ...remaining
    } = popoverAria.popoverProps as Record<string, unknown>;
    return remaining;
  };

  const mergedStyle = (): JSX.CSSProperties => {
    const ariaStyle = (popoverAria.popoverProps as Record<string, unknown>).style as
      | JSX.CSSProperties
      | undefined;
    const renderStyle = (renderProps.style() || {}) as JSX.CSSProperties & Record<string, unknown>;
    return {
      ...ariaStyle,
      ...renderStyle,
      "--trigger-width": renderStyle["--trigger-width"] ?? triggerWidth(),
    };
  };

  const shouldBeDialog = () => !local.isNonModal || resolvedTrigger() === "SubmenuTrigger";
  const portalContext = useUNSAFE_PortalContext();
  const portalContainer = () => {
    if (isSubPopover()) {
      return popoverGroupContext?.() ?? portalContext.getContainer?.() ?? undefined;
    }
    return portalContext.getContainer?.() ?? undefined;
  };

  // Match React Aria Components: focus the popover container only when no
  // descendant has already moved focus during mount.
  createEffect(() => {
    if (!isOpen() || !shouldBeDialog()) return;
    if ((local.autoFocus ?? true) === false) return;
    if (!popoverRef) return;
    if (resolvedTrigger() === "SubmenuTrigger") return;

    let timeout: number | undefined;
    let frame: number | undefined;

    const focusIfNeeded = () => {
      if (!isOpen() || !shouldBeDialog()) return;
      if (!popoverRef || resolvedTrigger() === "SubmenuTrigger") return;
      if (document.activeElement === popoverRef || popoverRef.contains(document.activeElement)) {
        return;
      }
      popoverRef.focus();
    };

    const scheduleFocus = () => {
      timeout = window.setTimeout(focusIfNeeded, 0);
    };

    if (typeof window.requestAnimationFrame === "function") {
      frame = window.requestAnimationFrame(scheduleFocus);
    } else {
      scheduleFocus();
    }

    onCleanup(() => {
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
      }
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    });
  });

  // Fallback Escape handling for environments where focus is not moved into the popover.
  createEffect(() => {
    if (!isOpen()) return;
    if (local.isKeyboardDismissDisabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (event.defaultPrevented) return;
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });

  const overlay = () => (
    <PopoverContext.Provider
      value={{ placement: popoverAria.placement, arrowProps: () => popoverAria.arrowProps }}
    >
      <FocusScope contain={shouldBeDialog()} restoreFocus>
        <div
          {...domProps()}
          {...cleanPopoverProps()}
          ref={popoverRef}
          id={overlayId()}
          role={shouldBeDialog() ? "dialog" : undefined}
          tabIndex={shouldBeDialog() ? -1 : undefined}
          class={renderProps.class()}
          style={mergedStyle()}
          data-trigger={resolvedTrigger()}
          data-placement={popoverAria.placement()}
          data-entering={dataAttr(local.isEntering)}
          data-exiting={dataAttr(local.isExiting)}
        >
          <Show when={!local.isNonModal}>
            <PopoverDismissButton onDismiss={close} />
          </Show>
          {renderProps.renderChildren()}
          <PopoverDismissButton onDismiss={close} />
        </div>
      </FocusScope>
    </PopoverContext.Provider>
  );

  const underlay = () => (
    <div
      data-testid="underlay"
      {...(popoverAria.underlayProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
      style={{ position: "fixed", inset: 0 }}
    />
  );

  return (
    <Show when={isHydrated() && (isOpen() || local.isExiting)}>
      <Portal mount={portalContainer()}>
        <Show when={!local.isNonModal && !isSubPopover() && isOpen()}>{underlay()}</Show>
        <Show
          when={isSubPopover()}
          fallback={
            <div ref={setGroupRef} style={{ display: "contents" }}>
              <PopoverGroupContext.Provider value={() => groupRef()}>
                {overlay()}
              </PopoverGroupContext.Provider>
            </div>
          }
        >
          {overlay()}
        </Show>
      </Portal>
    </Show>
  );
}

export interface OverlayArrowProps {
  /** The children - should be an SVG or element for the arrow. */
  children?: JSX.Element;
  /** Render function used when Solid children accessors would be ambiguous. */
  render?: () => JSX.Element;
  /** The CSS className. */
  class?: string;
  /** The inline style. */
  style?: JSX.CSSProperties;
}

/**
 * An arrow element that points towards the trigger.
 */
export function OverlayArrow(props: OverlayArrowProps): JSX.Element {
  const popoverContext = useContext(PopoverContext);
  const placement = () => popoverContext?.placement() ?? null;

  const mergedStyle = () => {
    const contextStyle = (popoverContext?.arrowProps() as Record<string, unknown> | undefined)
      ?.style as (JSX.CSSProperties & Record<string, unknown>) | undefined;
    const style: JSX.CSSProperties = {};
    if (typeof contextStyle?.left === "string") {
      style.left = contextStyle.left;
    }
    if (typeof contextStyle?.top === "string") {
      style.top = contextStyle.top;
    }

    const localStyle =
      props.style &&
      !(typeof CSSStyleDeclaration !== "undefined" && props.style instanceof CSSStyleDeclaration)
        ? props.style
        : undefined;

    return {
      ...style,
      ...localStyle,
    };
  };

  return (
    <div
      class={props.class}
      style={mergedStyle()}
      data-placement={placement()}
      aria-hidden="true"
      role="presentation"
    >
      {props.render ? props.render() : props.children}
    </div>
  );
}

export default Popover;
