import {
  type JSX,
  createContext,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import {
  ActionBar as HeadlessActionBar,
  ActionBarContainer as HeadlessActionBarContainer,
  ActionBarSelectionCount as HeadlessSelectionCount,
  ActionBarClearButton as HeadlessClearButton,
  type ActionBarRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../s2-style";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

type ScrollRef = { current?: HTMLElement | null } | HTMLElement | undefined;

export interface ActionBarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children" | "ref" | "slot"
> {
  /** The number of selected items. ActionBar is hidden when 0. */
  selectedItemCount?: number | "all";
  /** Whether the ActionBar should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Callback when the clear button is pressed. */
  onClearSelection?: () => void;
  /** Callback when an action is triggered. */
  onAction?: (key: Key) => void;
  /** The action buttons to display. */
  children?: JSX.Element;
  /** A ref to the scrollable element the ActionBar appears above. */
  scrollRef?: ScrollRef;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Accessible label for the action bar. @default 'Actions' */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the action bar. */
  "aria-labelledby"?: string;
  /** Optional keydown handler for the action bar root. */
  onKeyDown?: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent>;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

export interface ActionBarContainerProps {
  children?: JSX.Element;
  class?: string;
}

export const ActionBarContext = createContext<SpectrumContextValue<ActionBarProps>>(null);

function getScrollElement(scrollRef: ScrollRef): HTMLElement | null {
  if (!scrollRef) {
    return null;
  }

  if (typeof HTMLElement !== "undefined" && scrollRef instanceof HTMLElement) {
    return scrollRef;
  }

  return "current" in scrollRef ? (scrollRef.current ?? null) : null;
}

function getBarClassName(
  renderProps: ActionBarRenderProps,
  unsafeClassName?: string,
  extraClass?: string,
  isEmphasized?: boolean,
  isInContainer?: boolean,
  styles?: StyleString,
): string {
  return [
    "vui-action-bar flex items-center gap-2 rounded-lg border border-primary-600 bg-bg-300 p-2",
    isEmphasized ? "vui-action-bar--emphasized" : "",
    isInContainer ? "absolute bottom-0 inset-x-2 mx-auto max-w-[960px]" : "",
    unsafeClassName ?? "",
    extraClass ?? "",
    styles ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function ActionBar(props: ActionBarProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ActionBarContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "class",
    "children",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
    "scrollRef",
  ]);
  const [scrollbarWidth, setScrollbarWidth] = createSignal(0);
  const scrollElement = () => getScrollElement(local.scrollRef);
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const actionBarRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const rootStyle = () => {
    const unsafeStyle = mergedUnsafeStyle();
    const containerStyle = local.scrollRef
      ? ({
          "inset-inline-end": `calc(var(--insetEnd, 8px) + ${scrollbarWidth()}px)`,
        } satisfies JSX.CSSProperties)
      : undefined;

    return containerStyle || unsafeStyle ? { ...containerStyle, ...unsafeStyle } : undefined;
  };
  const updateScrollbarWidth = () => {
    const element = scrollElement();
    setScrollbarWidth(element ? element.offsetWidth - element.clientWidth : 0);
  };

  createEffect(updateScrollbarWidth);
  onMount(() => {
    updateScrollbarWidth();
    const element = scrollElement();
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateScrollbarWidth);
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  return (
    <HeadlessActionBar
      {...headlessProps}
      selectedItemCount={headlessProps.selectedItemCount ?? 0}
      onClearSelection={headlessProps.onClearSelection}
      ref={actionBarRef}
      slot={local.slot ?? undefined}
      class={(rp: ActionBarRenderProps) =>
        getBarClassName(
          rp,
          local.UNSAFE_className,
          local.class,
          local.isEmphasized,
          !!local.scrollRef,
          mergedStyles(),
        )
      }
      style={rootStyle()}
    >
      <HeadlessClearButton class="inline-flex items-center justify-center rounded p-1 text-primary-200 hover:bg-bg-400 transition-colors" />
      <HeadlessSelectionCount class="text-sm text-primary-200 whitespace-nowrap" />
      <div class="flex-1" />
      <div class="flex items-center gap-1">{local.children}</div>
    </HeadlessActionBar>
  );
}

export function ActionBarContainer(props: ActionBarContainerProps): JSX.Element {
  return (
    <HeadlessActionBarContainer
      class={["vui-action-bar-container", props.class].filter(Boolean).join(" ")}
    >
      {props.children}
    </HeadlessActionBarContainer>
  );
}
