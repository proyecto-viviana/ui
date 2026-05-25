import {
  type JSX,
  Show,
  createContext,
  createEffect,
  createMemo,
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
  Button as HeadlessButton,
  type ActionBarRenderProps,
  type ButtonRenderProps,
  useActionBarContext,
} from "@proyecto-viviana/solidaria-components";
import { FocusScope, createStringFormatter } from "@proyecto-viviana/solidaria";
import type { Key } from "@proyecto-viviana/solid-stately";
import { baseColor, focusRing, lightDark, style, type StyleString } from "../style";
import { mergeStyles } from "../style/runtime";
import { controlSize, staticColor } from "../s2-internal/style-utils";
import { ActionButtonGroup } from "../actionbuttongroup";
import { s2IntlStrings } from "../intl";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import type { StaticColor } from "../button/types";

type ScrollRef = { current?: HTMLElement | null } | HTMLElement | undefined;
type SelectedItemCount = number | "all";
type ActionBarAnimationState = {
  isEmphasized?: boolean;
  isInContainer?: boolean;
  isEntering?: boolean;
  isExiting?: boolean;
};
type ActionBarCloseButtonState = ButtonRenderProps & {
  staticColor?: StaticColor;
  isStaticColor: boolean;
};

const ACTION_BAR_EXIT_DURATION = 200;

const actionBarStyles = style<ActionBarAnimationState>({
  borderRadius: "lg",
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      default: "elevated",
      isEmphasized: "neutral",
    },
  },
  backgroundColor: "--s2-container-bg",
  boxShadow: "elevated",
  boxSizing: "border-box",
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: lightDark("transparent-white-25" as never, "gray-200" as never),
    isEmphasized: "transparent",
    forcedColors: "ButtonBorder",
  },
  paddingX: 8,
  paddingY: 12,
  display: "flex",
  gap: 16,
  alignItems: "center",
  position: {
    isInContainer: "absolute",
  },
  bottom: 0,
  insetStart: 8,
  "--insetEnd": {
    type: "insetEnd",
    value: 8,
  },
  width: {
    default: "full",
    isInContainer: "auto",
  },
  marginX: "auto",
  maxWidth: 960,
  transition: "transform",
  transitionDuration: 200,
  translateY: {
    default: -8,
    isEntering: "full",
    isExiting: "full",
  },
});

const actionsWrapperStyles = style({
  order: 1,
  marginStart: "auto",
});

const selectionWrapperStyles = style({
  order: 0,
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const selectionCountStyles = style<{ isEmphasized?: boolean }>({
  font: "ui",
  color: {
    default: "neutral",
    isEmphasized: "gray-25" as never,
  },
});

const closeButtonHoverBackground = {
  default: "gray-200" as never,
  isStaticColor: "transparent-overlay-200" as never,
} as const;

const closeButtonStyles = style<ActionBarCloseButtonState>({
  ...focusRing(),
  ...staticColor(),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  size: controlSize(),
  flexShrink: 0,
  borderRadius: "full",
  padding: 0,
  borderStyle: "none",
  transition: "default",
  backgroundColor: {
    default: "transparent",
    isHovered: closeButtonHoverBackground,
    isFocusVisible: closeButtonHoverBackground,
    isPressed: closeButtonHoverBackground,
  },
  "--iconPrimary": {
    type: "color",
    value: {
      default: baseColor("neutral"),
      isDisabled: "disabled",
      isStaticColor: {
        default: baseColor("transparent-overlay-800"),
        isDisabled: "transparent-overlay-400",
      },
      forcedColors: {
        default: "ButtonText",
        isDisabled: "GrayText",
      },
    },
  },
  outlineColor: {
    default: "focus-ring",
    isStaticColor: "transparent-overlay-1000",
    forcedColors: "Highlight",
  },
  disableTapHighlight: true,
});

const closeIconStyles = style({
  size: 12,
});

function ActionBarCloseIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      class={closeIconStyles}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="m7.342 6 3.396-3.396a.95.95 0 1 0-1.342-1.342L6 4.658 2.604 1.262a.95.95 0 1 0-1.343 1.342L4.659 6 1.262 9.396a.95.95 0 1 0 1.343 1.342L6 7.342l3.396 3.396a.946.946 0 0 0 1.342.001.95.95 0 0 0 0-1.343z"
      />
    </svg>
  );
}

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

export type ActionBarSelectedKeys = "all" | Set<Key>;

export interface ActionBarContainerStateProps {
  selectedKeys?: "all" | Iterable<Key>;
  defaultSelectedKeys?: "all" | Iterable<Key>;
  onSelectionChange?: (keys: ActionBarSelectedKeys) => void;
  renderActionBar?: (selectedKeys: ActionBarSelectedKeys) => JSX.Element;
  scrollRef?: ScrollRef;
}

export interface ActionBarContainerState {
  selectedKeys: () => ActionBarSelectedKeys;
  onSelectionChange: (keys: "all" | Iterable<Key>) => void;
  actionBar: () => JSX.Element;
  actionBarHeight: () => number;
}

export const ActionBarContext = createContext<SpectrumContextValue<ActionBarProps>>(null);

function normalizeSelectedKeys(keys: "all" | Iterable<Key> | undefined): ActionBarSelectedKeys {
  return keys === "all" ? "all" : new Set(keys ?? []);
}

function copySelectedKeys(keys: ActionBarSelectedKeys): ActionBarSelectedKeys {
  return keys === "all" ? "all" : new Set(keys);
}

function getScrollElement(scrollRef: ScrollRef): HTMLElement | null {
  if (!scrollRef) {
    return null;
  }

  if (typeof HTMLElement !== "undefined" && scrollRef instanceof HTMLElement) {
    return scrollRef;
  }

  return "current" in scrollRef ? (scrollRef.current ?? null) : null;
}

export function createActionBarContainer(
  props: ActionBarContainerStateProps,
): ActionBarContainerState {
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] =
    createSignal<ActionBarSelectedKeys>(normalizeSelectedKeys(props.defaultSelectedKeys));
  const [actionBarHeight, setActionBarHeight] = createSignal(0);

  const selectedKeys = createMemo<ActionBarSelectedKeys>(() =>
    props.selectedKeys !== undefined
      ? normalizeSelectedKeys(props.selectedKeys)
      : uncontrolledSelectedKeys(),
  );
  const selectedItemCount = createMemo<SelectedItemCount>(() => {
    const keys = selectedKeys();
    return keys === "all" ? "all" : keys.size;
  });
  const setSelectedKeys = (keys: "all" | Iterable<Key>) => {
    const normalized = normalizeSelectedKeys(keys);

    if (props.selectedKeys === undefined) {
      setUncontrolledSelectedKeys(normalized);
    }

    props.onSelectionChange?.(copySelectedKeys(normalized));
  };
  const actionBarRef = (element: HTMLDivElement) => {
    setActionBarHeight(element ? element.offsetHeight + 8 : 0);
  };
  const actionBarContext: SpectrumContextValue<ActionBarProps> = {
    ref: actionBarRef,
    get scrollRef() {
      return props.scrollRef;
    },
    get selectedItemCount() {
      return selectedItemCount();
    },
    onClearSelection: () => setSelectedKeys(new Set()),
  };

  return {
    selectedKeys,
    onSelectionChange: setSelectedKeys,
    actionBar: () => (
      <ActionBarContext.Provider value={actionBarContext}>
        {props.renderActionBar?.(selectedKeys())}
      </ActionBarContext.Provider>
    ),
    actionBarHeight,
  };
}

function getBarClassName(
  renderProps: ActionBarRenderProps,
  contextUnsafeClassName?: string,
  propUnsafeClassName?: string,
  contextClassName?: string,
  propClassName?: string,
  isEmphasized?: boolean,
  isInContainer?: boolean,
  isEntering?: boolean,
  isExiting?: boolean,
  styles?: StyleString,
): string {
  return [
    "vui-action-bar",
    isEmphasized ? "vui-action-bar--emphasized" : "",
    isInContainer ? "vui-action-bar--in-container" : "",
    isEntering ? "vui-action-bar--entering" : "",
    isExiting ? "vui-action-bar--exiting" : "",
    contextUnsafeClassName ?? "",
    propUnsafeClassName ?? "",
    contextClassName ?? "",
    propClassName ?? "",
    mergeStyles(
      actionBarStyles({
        isEmphasized,
        isInContainer,
        isEntering,
        isExiting,
      }),
      styles,
    ),
  ]
    .filter(Boolean)
    .join(" ");
}

function countMessage(
  formatter: ReturnType<ReturnType<typeof createStringFormatter>>,
  count: SelectedItemCount,
): string {
  if (count === "all") {
    return formatter.format("actionbar.selectedAll");
  }

  const message = formatter.format("actionbar.selected", { count });
  return message.includes("{count}") ? message.replace("{count}", String(count)) : message;
}

function ActionBarCloseButton(props: {
  isEmphasized?: boolean;
  "aria-label": string;
}): JSX.Element {
  const ctx = useActionBarContext();
  const staticColorValue = () => (props.isEmphasized ? "auto" : undefined);

  return (
    <HeadlessButton
      aria-label={props["aria-label"]}
      onPress={() => ctx?.onClearSelection?.()}
      class={(renderProps: ButtonRenderProps) =>
        closeButtonStyles({
          ...renderProps,
          staticColor: staticColorValue(),
          isStaticColor: !!staticColorValue(),
        })
      }
    >
      <ActionBarCloseIcon />
    </HeadlessButton>
  );
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
  const [isRendered, setIsRendered] = createSignal((headlessProps.selectedItemCount ?? 0) !== 0);
  const [isEntering, setIsEntering] = createSignal(false);
  const [isExiting, setIsExiting] = createSignal(false);
  const [lastCount, setLastCount] = createSignal<SelectedItemCount>(
    headlessProps.selectedItemCount ?? 0,
  );
  let exitTimeout: ReturnType<typeof setTimeout> | undefined;
  let enterFrame: number | undefined;

  const scrollElement = () => getScrollElement(local.scrollRef);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const selectedItemCount = () => headlessProps.selectedItemCount ?? 0;
  const isOpen = () => selectedItemCount() !== 0;
  const renderedCount = () => (isOpen() ? selectedItemCount() : lastCount());
  const selectedItemCountForHeadless = () => (isRendered() ? renderedCount() : 0);
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const actionBarRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const rootStyle = (): JSX.CSSProperties => {
    const unsafeStyle = mergedUnsafeStyle();
    const containerStyle = {
      "inset-inline-end": `calc(var(--insetEnd, 8px) + ${scrollbarWidth()}px)`,
    } satisfies JSX.CSSProperties;

    return { ...containerStyle, ...unsafeStyle };
  };
  const updateScrollbarWidth = () => {
    const element = scrollElement();
    setScrollbarWidth(element ? element.offsetWidth - element.clientWidth : 0);
  };

  createEffect(updateScrollbarWidth);
  createEffect(() => {
    const count = selectedItemCount();
    const open = count !== 0;

    if (count === "all" || count > 0) {
      setLastCount(count);
    }

    if (exitTimeout) {
      clearTimeout(exitTimeout);
      exitTimeout = undefined;
    }

    if (open) {
      setIsRendered(true);
      setIsExiting(false);

      if (local.scrollRef) {
        setIsEntering(true);
        if (typeof requestAnimationFrame !== "undefined") {
          if (enterFrame != null) {
            cancelAnimationFrame(enterFrame);
          }
          enterFrame = requestAnimationFrame(() => {
            enterFrame = undefined;
            setIsEntering(false);
          });
        } else {
          setTimeout(() => setIsEntering(false), 0);
        }
      } else {
        setIsEntering(false);
      }
      return;
    }

    setIsEntering(false);
    if (!isRendered()) {
      setIsExiting(false);
      return;
    }

    if (!local.scrollRef) {
      setIsRendered(false);
      setIsExiting(false);
      return;
    }

    setIsExiting(true);
    exitTimeout = setTimeout(() => {
      exitTimeout = undefined;
      setIsRendered(false);
      setIsExiting(false);
    }, ACTION_BAR_EXIT_DURATION);
  });
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
  onCleanup(() => {
    if (exitTimeout) {
      clearTimeout(exitTimeout);
    }
    if (enterFrame != null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(enterFrame);
    }
  });

  const actionGroupLabel = createMemo(() => stringFormatter().format("actionbar.actions"));
  const actionsAvailableLabel = createMemo(() =>
    stringFormatter().format("actionbar.actionsAvailable"),
  );
  const clearSelectionLabel = createMemo(() =>
    stringFormatter().format("actionbar.clearSelection"),
  );
  const selectionLabel = createMemo(() => countMessage(stringFormatter(), renderedCount()));

  return (
    <Show when={isRendered()}>
      <FocusScope restoreFocus>
        <HeadlessActionBar
          {...headlessProps}
          selectedItemCount={selectedItemCountForHeadless()}
          onClearSelection={headlessProps.onClearSelection}
          actionsAvailableMessage={actionsAvailableLabel()}
          ref={actionBarRef}
          slot={local.slot ?? undefined}
          class={(rp: ActionBarRenderProps) =>
            getBarClassName(
              rp,
              contextProps?.UNSAFE_className,
              props.UNSAFE_className,
              contextProps?.class,
              props.class,
              local.isEmphasized,
              !!local.scrollRef,
              isEntering(),
              isExiting(),
              mergedStyles(),
            )
          }
          style={() => rootStyle()}
        >
          <div class={selectionWrapperStyles}>
            <ActionBarCloseButton
              isEmphasized={local.isEmphasized}
              aria-label={clearSelectionLabel()}
            />
            <span class={selectionCountStyles({ isEmphasized: local.isEmphasized })}>
              {selectionLabel()}
            </span>
          </div>
          <div class={actionsWrapperStyles}>
            <ActionButtonGroup
              staticColor={local.isEmphasized ? "auto" : undefined}
              isQuiet
              aria-label={actionGroupLabel()}
            >
              {local.children}
            </ActionButtonGroup>
          </div>
        </HeadlessActionBar>
      </FocusScope>
    </Show>
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
