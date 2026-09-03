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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Popover.tsx

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
  createEnterAnimation,
  createExitAnimation,
  FocusScope,
  useIsHidden,
  useLocale,
  useUNSAFE_PortalContext,
  visuallyHiddenStyles,
  type AriaLabelingProps,
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
import {
  DialogTriggerContext,
  OverlayTriggerStateContext,
  PopoverTriggerContext,
} from "./contexts";
import { SelectContext } from "./Select";

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

export interface PopoverProps extends SlotProps, AriaLabelingProps {
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
   * Overrides the target element's bounding rectangle. Useful for positioning relative to
   * a specific point such as the mouse cursor (e.g. context menus) or text selection.
   *
   * @default target.getBoundingClientRect()
   * @param target - The target element.
   */
  getTargetRect?: (target: Element) => DOMRect | null | undefined;
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
  /**
   * Whether the popover should appear and disappear without an entry or exit animation.
   * Used by PreviewTrigger to skip animations when quickly swapping between overlays.
   */
  shouldSkipAnimation?: boolean;
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

/**
 * RAC Overlay.tsx OverlayContext. Dialog's useOverlayFocusContain equivalent
 * sets contain so a nested Dialog still traps Tab when the Popover itself is
 * not the dialog (DatePicker / DateRangePicker CalendarPopover).
 */
export interface OverlayContextValue {
  setContain: (contain: boolean) => void;
}

export const OverlayContext = createContext<OverlayContextValue | null>(null);

function resolveTriggerElement(value: unknown): Element | null {
  if (value == null) return null;
  if (typeof value === "function") {
    return resolveTriggerElement((value as () => unknown)());
  }
  if (value instanceof Element) {
    return value;
  }
  return null;
}

function preferredPlacementAxis(placement: Placement | undefined): PlacementAxis {
  const axis = (placement ?? "bottom").split(" ")[0];
  if (axis === "top" || axis === "bottom" || axis === "left" || axis === "right") {
    return axis;
  }
  return "bottom";
}

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
    "getTargetRect",
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
    "shouldSkipAnimation",
  ]);

  // A reactive ref (not a plain `let`) so the overlay-position effect in
  // createOverlayPosition — which tracks `overlayRef()` as a dependency —
  // re-runs once the portal node actually mounts. React gets this timing for
  // free from useLayoutEffect (the ref is populated before the position effect
  // fires); in Solid the portal node is created lazily on open, AFTER the
  // position effect first ran with a null ref, so a non-reactive ref left the
  // popover stranded at the createOverlayPosition fallback (position:fixed;
  // top:0; left:0) whenever no other dependency happened to re-fire the effect
  // after mount. Mirrors the sibling groupRef signal below.
  const [popoverRef, setPopoverRef] = createSignal<HTMLDivElement | null>(null);
  const [groupRef, setGroupRef] = createSignal<HTMLDivElement | null>(null);
  // False on the server and during hydration; true after onMount. Gates the Portal
  // so overlay content only ever renders client-side, post-hydration.
  const isHydrated = useIsHydrated();

  // Mirrors upstream S2 Popover (Popover.mjs: `el.lang = locale; el.dir =
  // direction`): the overlay portals out of the app root, so it must carry both
  // the locale `lang` AND writing `direction` — otherwise the portaled
  // listbox/dialog stays LTR and keeps the Latin font under an RTL Provider (the
  // `:lang(ar)` font swap needs a `lang` ancestor the portal would otherwise
  // escape). RAC's own Popover only threads `dir`; S2 adds `lang` on top.
  const locale = useLocale();

  const triggerContext = useContext(PopoverTriggerContext);
  const dialogTriggerContext = useContext(DialogTriggerContext);
  const overlayTriggerState = useContext(OverlayTriggerStateContext);
  const popoverGroupContext = useContext(PopoverGroupContext);
  const selectContext = useContext(SelectContext);
  const overlayLabelledBy = () =>
    props["aria-labelledby"] ??
    (selectContext?.menuProps as { "aria-labelledby"?: string } | undefined)?.["aria-labelledby"];
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
    if (overlayTriggerState) {
      return overlayTriggerState.isOpen;
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
    } else if (overlayTriggerState) {
      overlayTriggerState.close();
      local.onOpenChange?.(false);
    } else {
      setInternalOpen(false);
      local.onOpenChange?.(false);
    }
  };

  const getTriggerRef = () => {
    if (local.triggerRef !== undefined) {
      // Compiled JSX passes `() => element`. Comparison `hc` unwraps zero-arg
      // function props into getters, so `triggerRef` can already be the node
      // (`get triggerRef() { return el }`). Calling a node is a TypeError and
      // leaves the overlay at the origin frame (#275).
      return resolveTriggerElement(local.triggerRef);
    }
    if (triggerContext) return triggerContext.triggerRef();
    if (dialogTriggerContext) return dialogTriggerContext.triggerRef();
    return null;
  };

  const popoverAria = createPopover(
    {
      triggerRef: getTriggerRef,
      popoverRef: () => popoverRef(),
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
      get getTargetRect() {
        return local.getTargetRect;
      },
      get arrowRef() {
        return local.arrowRef;
      },
      get scrollRef() {
        return local.scrollRef;
      },
      get isNonModal() {
        return local.isNonModal ?? resolvedTrigger() === "PreviewTrigger";
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
        } else if (overlayTriggerState) {
          overlayTriggerState.open();
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
        } else if (overlayTriggerState) {
          overlayTriggerState.toggle();
        } else {
          setInternalOpen(true);
          local.onOpenChange?.(true);
        }
      },
      point: () => triggerContext?.state.point?.() ?? dialogTriggerContext?.state.point?.() ?? null,
    },
  );

  // RAC: `useExitAnimation(ref, state.isOpen)` lives on the outer Popover so the
  // `'closed' | 'open' | 'exiting'` machine survives Inner unmount. Enter lives
  // on PopoverInner (below) so it re-initializes per open, matching
  // `useEnterAnimation(ref, !!placement)` in RAC's PopoverInner.
  const exitAnimation = createExitAnimation(() => popoverRef(), isOpen);
  const isExiting = () =>
    Boolean(local.isExiting) || (!(local.shouldSkipAnimation ?? false) && exitAnimation());
  const isHidden = useIsHidden();

  const [triggerWidth, setTriggerWidth] = createSignal<string | undefined>();
  const hasExplicitTriggerWidth = () => {
    const style = typeof local.style === "function" ? undefined : local.style;
    return (
      (style as (JSX.CSSProperties & Record<string, unknown>) | undefined)?.["--trigger-width"] !=
      null
    );
  };
  const updateTriggerWidth = () => {
    const trigger = getTriggerRef();
    if (!trigger || hasExplicitTriggerWidth()) return;
    // Layout width, not getBoundingClientRect: S2 `pressScale` applies
    // `perspective + translate3d(0,0,-2px)` while the trigger is pressed, which
    // shrinks the transformed rect (~5.84px on size-S/M Picker). RAC measures
    // in `useLayoutEffect` after pointer-up so the transform is already gone;
    // Solid's `createEffect` can run on the pressed frame, and ResizeObserver
    // does not fire for CSS transforms. `offsetWidth` is the box `--trigger-width`
    // is supposed to copy (RAC `Popover.tsx:309-331`).
    const width =
      trigger instanceof HTMLElement ? trigger.offsetWidth : trigger.getBoundingClientRect().width;
    setTriggerWidth(`${width}px`);
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

  const shouldBeDialogBase = () =>
    !local.isNonModal ||
    resolvedTrigger() === "SubmenuTrigger" ||
    resolvedTrigger() === "PreviewTrigger";
  const [isDialog, setIsDialog] = createSignal(shouldBeDialogBase());
  const [overlayContain, setOverlayContain] = createSignal(false);
  createEffect(() => {
    const node = popoverRef();
    if (!node) return;
    setIsDialog(shouldBeDialogBase() && node.querySelector("[role=dialog]") == null);
  });

  const shouldBeDialog = () => isDialog();
  const shouldContainFocus = () => {
    // RAC Popover.tsx:368 — `shouldContainFocus={isDialog && trigger !== 'PreviewTrigger'}`.
    // MenuTrigger must contain Tab; excluding it leaked focus to document.body
    // while the overlay stayed open (#267).
    if (!shouldBeDialog()) {
      return false;
    }
    return resolvedTrigger() !== "PreviewTrigger";
  };
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
    if (!popoverRef()) return;
    if (resolvedTrigger() === "SubmenuTrigger") return;

    let timeout: number | undefined;
    let frame: number | undefined;

    const focusIfNeeded = () => {
      if (!isOpen() || !shouldBeDialog()) return;
      const node = popoverRef();
      if (!node || resolvedTrigger() === "SubmenuTrigger") return;
      // Nested Dialog (DatePicker) owns initial focus via createDialog —
      // RAC PopoverInner skips focusSafely when isDialog is false.
      if (node.querySelector("[role=dialog]")) return;
      if (document.activeElement === node || node.contains(document.activeElement)) {
        return;
      }
      node.focus();
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

  const isNonModal = () => local.isNonModal ?? resolvedTrigger() === "PreviewTrigger";

  // Enter animation is owned by this inner tree so it remounts on each full
  // open (RAC PopoverInner + useEnterAnimation). It stays mounted while
  // `isExiting` so a reopen-during-exit does not start a second enter.
  //
  // Local addition (documented deviation): RAC's `useEnterAnimation(ref,
  // !!placement)` reports `isEntering === false` while the popover is still
  // unplaced (`animation.ts:22`), relying on `useLayoutEffect` positioning so
  // that state never paints. Here the open-but-unplaced state is also reported
  // as entering, so if positioning ever lands after a paint the `top:0;left:0`
  // frame stays at the entering opacity instead of flashing at the origin.
  function PopoverInner(): JSX.Element {
    const enterAnimation = createEnterAnimation(
      () => popoverRef(),
      () => popoverAria.placement() != null,
    );
    const isEntering = () =>
      Boolean(local.isEntering) ||
      (!(local.shouldSkipAnimation ?? false) &&
        (enterAnimation() || (isOpen() && popoverAria.placement() == null)));

    const renderValues = createMemo<PopoverRenderProps>(() => {
      const preferred = preferredPlacementAxis(local.placement);
      const entering = isEntering();
      return {
        trigger: resolvedTrigger() ?? null,
        // RAC usePopover reports placement from useLayoutEffect before paint.
        // Until Solid's createEffect positioning lands, seed the preferred axis
        // so S2 `translateY: { placement: { bottom: { isEntering: -4 } } }` does
        // not miss the bottom branch. Hold that axis for the whole enter so a
        // later measured flip cannot replace the keyframe mid-transition
        // (DatePicker D2: Solid `0px 4px` vs React `0px -4px`).
        placement: entering ? preferred : (popoverAria.placement() ?? preferred),
        isEntering: entering,
        isExiting: isExiting(),
      };
    });

    const renderProps = useRenderProps(
      {
        get children() {
          return props.children;
        },
        class: local.class,
        style: local.style,
        defaultClassName: "solidaria-Popover",
      },
      renderValues,
    );

    const mergedStyle = (): JSX.CSSProperties => {
      const ariaStyle = (popoverAria.popoverProps as Record<string, unknown>).style as
        | JSX.CSSProperties
        | undefined;
      const renderStyle = (renderProps.style() || {}) as JSX.CSSProperties &
        Record<string, unknown>;
      return {
        ...ariaStyle,
        ...renderStyle,
        "--trigger-width": renderStyle["--trigger-width"] ?? triggerWidth(),
      };
    };

    return (
      <PopoverContext.Provider
        value={{ placement: popoverAria.placement, arrowProps: () => popoverAria.arrowProps }}
      >
        <OverlayContext.Provider value={{ setContain: setOverlayContain }}>
          <FocusScope
            contain={(shouldContainFocus() || overlayContain()) && !isExiting()}
            restoreFocus
          >
            <div
              {...domProps()}
              {...cleanPopoverProps()}
              {...(triggerContext?.overlayProps ?? {})}
              ref={(el) => {
                setPopoverRef(el);
                triggerContext?.setOverlayRef?.(el);
              }}
              id={overlayId()}
              role={shouldBeDialog() ? "dialog" : undefined}
              tabIndex={shouldBeDialog() ? -1 : undefined}
              aria-labelledby={overlayLabelledBy()}
              class={renderProps.class()}
              style={mergedStyle()}
              lang={locale().locale}
              dir={locale().direction}
              data-trigger={resolvedTrigger()}
              data-placement={renderValues().placement}
              data-entering={dataAttr(isEntering())}
              data-exiting={dataAttr(isExiting())}
            >
              <Show when={!isNonModal()}>
                <PopoverDismissButton onDismiss={close} />
              </Show>
              {/* A render-prop child runs once over a getter view of the render
                  values. RAC re-invokes it on every placement / isEntering /
                  isExiting change and React reconciles onto the same DOM; Solid
                  would recreate the subtree, discarding a Menu's tree state and
                  DOM focus when the enter animation settles (Tabs has the same
                  contract for press flips). */}
              {renderProps.renderChildrenStable()}
              <PopoverDismissButton onDismiss={close} />
            </div>
          </FocusScope>
        </OverlayContext.Provider>
      </PopoverContext.Provider>
    );
  }

  const underlay = () => (
    <div
      data-testid="underlay"
      {...(popoverAria.underlayProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
      style={{ position: "fixed", inset: 0 }}
    />
  );

  const hiddenChildren = () => {
    const children = props.children;
    if (typeof children === "function") {
      return children({
        trigger: resolvedTrigger() ?? null,
        placement: "bottom",
        isEntering: false,
        isExiting: false,
      });
    }
    return children;
  };

  return (
    <Show when={!isHidden()} fallback={hiddenChildren()}>
      <Show when={isHydrated() && (isOpen() || isExiting())}>
        <Portal mount={portalContainer()}>
          <Show when={!isNonModal() && !isSubPopover() && isOpen()}>{underlay()}</Show>
          <Show
            when={isSubPopover()}
            fallback={
              <div ref={setGroupRef} style={{ display: "contents" }}>
                <PopoverGroupContext.Provider value={() => groupRef()}>
                  <PopoverInner />
                </PopoverGroupContext.Provider>
              </div>
            }
          >
            <PopoverInner />
          </Show>
        </Portal>
      </Show>
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

  // Mirror react-aria-components' OverlayArrow: the wrapper positions itself
  // absolutely against the popover edge (`[placement]: '100%'`) and takes the
  // cross-axis offset (`left`/`top`) from the overlay's computed `arrowProps`.
  // No `aria-hidden`/`role="presentation"` — upstream leaves the arrow in the
  // accessibility tree (the arrow SVG surfaces as an unlabeled `img`), matching
  // S2's `<OverlayArrow className="">`. The styled layer therefore passes no
  // positioning class of its own.
  const mergedStyle = (): JSX.CSSProperties => {
    const currentPlacement = placement();
    // Mirror react-aria-components' OverlayArrow: the reported `arrowProps`
    // offset (`left`/`top`) points at the arrow's CENTER, so the wrapper must be
    // pulled back by half its size to center on that point — horizontally for
    // top/bottom placements, vertically for left/right. Omitting this shifts the
    // arrow off by half its width/height (a self-inflicted divergence).
    const style: JSX.CSSProperties = {
      position: "absolute",
      transform:
        currentPlacement === "top" || currentPlacement === "bottom"
          ? "translateX(-50%)"
          : "translateY(-50%)",
    };
    if (currentPlacement != null) {
      (style as Record<string, string>)[currentPlacement] = "100%";
    }

    const contextStyle = (popoverContext?.arrowProps() as Record<string, unknown> | undefined)
      ?.style as (JSX.CSSProperties & Record<string, unknown>) | undefined;
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
    <div class={props.class} style={mergedStyle()} data-placement={placement()}>
      {props.render ? props.render() : props.children}
    </div>
  );
}

export default Popover;
