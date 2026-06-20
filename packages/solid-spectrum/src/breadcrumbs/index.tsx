import {
  type Accessor,
  For,
  type JSX,
  Show,
  createContext,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
  untrack,
  useContext,
} from "solid-js";
import {
  BreadcrumbItem as HeadlessBreadcrumbItem,
  Breadcrumbs as HeadlessBreadcrumbs,
  type BreadcrumbItemProps as HeadlessBreadcrumbItemProps,
  type BreadcrumbItemRenderProps,
  type BreadcrumbsProps as HeadlessBreadcrumbsProps,
  type BreadcrumbsRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter, useLocale } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { mergeStyles } from "../style/runtime";
import { useProviderProps } from "../provider";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { ActionButton } from "../button/ActionButton";
import { Menu, MenuItem, MenuTrigger, Text } from "../Menu";
import ChevronIcon from "../icon/ui-icons/Chevron";
import FolderBreadcrumbIcon from "../icon/s2wf-icons/FolderBreadcrumbIcon";
import { s2IntlStrings } from "../intl";
import {
  breadcrumbStyles,
  chevronStyles,
  currentStyles,
  wrapperStyles,
  type S2BreadcrumbsSize,
} from "./s2-breadcrumbs-styles";

const MAX_VISIBLE_ITEMS = 4;

export type { S2BreadcrumbsSize };
export type BreadcrumbsSize = S2BreadcrumbsSize | "sm" | "md" | "lg";
export type BreadcrumbsVariant = "default" | "subtle";

export interface BreadcrumbsProps<T> extends Omit<
  HeadlessBreadcrumbsProps<T>,
  "class" | "style" | "ref" | "children"
> {
  /** The children of the Breadcrumbs. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** The size of the Breadcrumbs. @default 'M' */
  size?: BreadcrumbsSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Legacy visual variant alias. Kept for source compatibility; S2 Breadcrumbs has no variant. */
  variant?: BreadcrumbsVariant;
  /** Legacy separator toggle. Kept for source compatibility. */
  showSeparator?: boolean;
  /** Ref for the navigation element. */
  ref?: RefLike<HTMLElement>;
}

export interface BreadcrumbProps extends Omit<
  HeadlessBreadcrumbItemProps,
  "class" | "style" | "ref" | "children"
> {
  /** The children of the breadcrumb item. */
  children?: JSX.Element | ((renderProps: BreadcrumbItemRenderProps) => JSX.Element);
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Ref for the breadcrumb item element. */
  ref?: RefLike<HTMLElement>;
}

export type BreadcrumbItemProps = BreadcrumbProps;

type CollapsedBreadcrumbEntry<T> =
  | {
      kind: "item";
      item: T;
      index: number;
    }
  | {
      kind: "menu";
    };

type InternalBreadcrumbsContextValue = {
  size: Accessor<S2BreadcrumbsSize>;
  isDisabled: Accessor<boolean>;
  showSeparator: Accessor<boolean>;
};

const defaultInternalBreadcrumbsContext: InternalBreadcrumbsContextValue = {
  size: () => "M",
  isDisabled: () => false,
  showSeparator: () => true,
};

export const BreadcrumbsContext = createContext<SpectrumContextValue<BreadcrumbsProps<any>>>(null);
const InternalBreadcrumbsContext = createContext<InternalBreadcrumbsContextValue>(
  defaultInternalBreadcrumbsContext,
);

function normalizeSize(size?: BreadcrumbsSize): S2BreadcrumbsSize {
  switch (size) {
    case "lg":
    case "L":
      return "L";
    case "sm":
    case "md":
    case "M":
    default:
      return "M";
  }
}

function defaultItemKey(item: unknown, index: number): string | number {
  const maybeItem = item as { key?: string | number; id?: string | number };
  return maybeItem.key ?? maybeItem.id ?? index;
}

function itemLabel(item: unknown): string {
  if (typeof item === "string" || typeof item === "number") {
    return String(item);
  }

  const maybeItem = item as {
    label?: string;
    name?: string;
    title?: string;
    textValue?: string;
    key?: string | number;
    id?: string | number;
  };
  return (
    maybeItem.textValue ??
    maybeItem.label ??
    maybeItem.name ??
    maybeItem.title ??
    String(maybeItem.key ?? maybeItem.id ?? "")
  );
}

function canMeasureOverflow(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator?.userAgent?.toLowerCase() ?? "";
  return !userAgent.includes("jsdom") && !userAgent.includes("happy-dom");
}

function fallbackVisibleTailCount(itemCount: number): number {
  return itemCount > MAX_VISIBLE_ITEMS ? MAX_VISIBLE_ITEMS - 2 : itemCount;
}

/**
 * Breadcrumbs show hierarchy and navigational context for a user's location within an application.
 */
export function Breadcrumbs<T>(props: BreadcrumbsProps<T>): JSX.Element {
  if (typeof window === "undefined") {
    return renderBreadcrumbs(props, () => {});
  }

  return createRoot((disposeRoot) => renderBreadcrumbs(props, disposeRoot));
}

function renderBreadcrumbs<T>(props: BreadcrumbsProps<T>, disposeRoot: () => void): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(BreadcrumbsContext), props.slot);
  const mergedProps = mergeProps(
    { size: "M" as const, showSeparator: true },
    providerProps,
    contextProps ?? {},
    props,
  );
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "items",
    "getKey",
    "onAction",
    "isDisabled",
    "ref",
    "variant",
    "showSeparator",
  ]);

  const size = () => normalizeSize(local.size);
  const isDisabled = () => local.isDisabled ?? false;
  const showSeparator = () => local.showSeparator !== false;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLElement> } | null)?.ref,
    props.ref,
  );
  let rootElement: HTMLElement | undefined;
  let measurementElement: HTMLElement | undefined;
  let measurementMenuButton: HTMLElement | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let mutationObserver: MutationObserver | undefined;
  let connectionObserver: MutationObserver | undefined;
  const observedResizeTargets = new WeakSet<Element>();
  const observedMutationTargets = new WeakSet<Element>();
  let retryOverflowUpdateTimeout: number | undefined;
  const initialOverflowUpdateTimeouts: number[] = [];
  const measurementId = `rsp-breadcrumbs-${Math.random().toString(36).slice(2)}`;
  const [canMeasure, setCanMeasure] = createSignal(false);
  const [visibleTailCount, setVisibleTailCount] = createSignal(MAX_VISIBLE_ITEMS - 2);
  let cleanupOverflowObservers = () => {};
  let hasDisposedRoot = false;
  let hasCleanedOverflowObservers = false;

  const getClassName = (renderProps: BreadcrumbsRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      wrapperStyles(
        {
          size: size(),
          isDisabled: renderProps.isDisabled,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const allItems = createMemo(() => local.items ?? []);
  const scheduleOverflowRetry = () => {
    if (
      hasDisposedRoot ||
      typeof window === "undefined" ||
      retryOverflowUpdateTimeout !== undefined
    ) {
      return;
    }

    retryOverflowUpdateTimeout = window.setTimeout(() => {
      retryOverflowUpdateTimeout = undefined;
      updateOverflow();
    }, 16);
  };
  const updateOverflow = () => {
    if (hasDisposedRoot) {
      return;
    }

    const items = local.items ?? [];
    if (items.length === 0) {
      setVisibleTailCount(0);
      return;
    }

    if (!canMeasure()) {
      setVisibleTailCount(fallbackVisibleTailCount(items.length));
      return;
    }

    const measureRoot =
      measurementElement ??
      (typeof document !== "undefined"
        ? (document.querySelector(
            `[data-rsp-breadcrumbs-measure-id="${measurementId}"]`,
          ) as HTMLElement | null)
        : undefined);
    const visibleContainer =
      measureRoot?.previousElementSibling instanceof HTMLElement
        ? measureRoot.previousElementSibling
        : undefined;
    const container = visibleContainer ?? rootElement;
    if (measureRoot && measurementElement !== measureRoot) {
      measurementElement = measureRoot;
    }
    if (container && rootElement !== container) {
      rootElement = container;
      assignRefs(container);
    }
    observeOverflowTargets();
    if (!measureRoot || !container || typeof window === "undefined") {
      scheduleOverflowRetry();
      setVisibleTailCount(fallbackVisibleTailCount(items.length));
      return;
    }

    const hiddenItems = Array.from(measureRoot.querySelectorAll("ol > li")).filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );
    const folder =
      measurementMenuButton ??
      (measureRoot.querySelector("[data-hidden-breadcrumb-menu-button]") as HTMLElement | null);
    if (hiddenItems.length <= 0 || !folder) {
      scheduleOverflowRetry();
      setVisibleTailCount(fallbackVisibleTailCount(items.length));
      return;
    }

    const containerWidth = container.offsetWidth || container.getBoundingClientRect().width;
    const containerGap = Number.parseFloat(window.getComputedStyle(container).gap || "0") || 0;
    const folderGap =
      Number.parseFloat(window.getComputedStyle(folder).marginInlineStart || "0") || 0;
    const widths = hiddenItems.map((breadcrumb) => breadcrumb.offsetWidth + 1);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);

    if (
      totalWidth <= containerWidth - items.length * containerGap &&
      items.length <= MAX_VISIBLE_ITEMS
    ) {
      setVisibleTailCount(items.length);
      return;
    }

    const firstWidth = widths.shift() ?? 0;
    let availableWidth =
      containerWidth - firstWidth - folderGap - folder.offsetWidth - containerGap;
    let nextVisibleTailCount = 0;
    const maxTailCount = MAX_VISIBLE_ITEMS - 2;

    for (const width of widths.reverse()) {
      availableWidth -= width;
      if (availableWidth <= 0) {
        break;
      }
      availableWidth -= containerGap;
      nextVisibleTailCount += 1;
    }

    const nextTailCount = Math.max(1, Math.min(maxTailCount, nextVisibleTailCount));
    setVisibleTailCount(nextTailCount);
  };
  const queueOverflowUpdate = () => {
    if (hasDisposedRoot) {
      return;
    }

    queueMicrotask(updateOverflow);
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(updateOverflow);
    }
    if (typeof window !== "undefined") {
      window.setTimeout(updateOverflow, 0);
    }
  };
  const disposeBreadcrumbsRoot = () => {
    if (hasDisposedRoot) {
      return;
    }

    hasDisposedRoot = true;
    cleanupOverflowObservers();
    disposeRoot();
  };
  const cleanupIfDisconnected = () => {
    if (rootElement?.isConnected || measurementElement?.isConnected) {
      return;
    }

    disposeBreadcrumbsRoot();
  };
  const observeOverflowTargets = () => {
    if (hasDisposedRoot || !rootElement || (!resizeObserver && !mutationObserver)) {
      return;
    }

    const observeElement = (element: HTMLElement, options: { mutations?: boolean } = {}) => {
      if (resizeObserver && !observedResizeTargets.has(element)) {
        resizeObserver.observe(element);
        observedResizeTargets.add(element);
      }

      if (
        options.mutations !== false &&
        mutationObserver &&
        !observedMutationTargets.has(element)
      ) {
        mutationObserver.observe(element, {
          attributes: true,
          attributeFilter: ["class", "style"],
        });
        observedMutationTargets.add(element);
      }
    };

    let element: HTMLElement | null = rootElement;
    while (element && element !== document.body) {
      observeElement(element);
      element = element.parentElement;
    }

    if (measurementElement) {
      observeElement(measurementElement, { mutations: false });
      if (measurementElement.parentElement) {
        observeElement(measurementElement.parentElement);
      }
    }
  };
  const setRootElement = (element: HTMLElement) => {
    if (hasDisposedRoot) {
      return;
    }

    rootElement = element;
    assignRefs(element);
    observeOverflowTargets();
    queueOverflowUpdate();
  };
  const setMeasurementElement = (element: HTMLElement) => {
    if (hasDisposedRoot) {
      return;
    }

    measurementElement = element;
    const previousElement = element.previousElementSibling;
    if (previousElement instanceof HTMLElement) {
      rootElement = previousElement;
      assignRefs(previousElement);
      observeOverflowTargets();
    }
    queueOverflowUpdate();
  };
  const setMeasurementMenuButton = (element: HTMLElement) => {
    if (hasDisposedRoot) {
      return;
    }

    measurementMenuButton = element;
    queueOverflowUpdate();
  };

  createEffect(() => {
    allItems().length;
    canMeasure();
    size();
    isDisabled();
    queueOverflowUpdate();
  });

  onMount(() => {
    const nextCanMeasure = canMeasureOverflow();
    setCanMeasure(nextCanMeasure);

    const safeUpdate = () => {
      if (rootElement && !rootElement.isConnected) {
        cleanupIfDisconnected();
        return;
      }

      updateOverflow();
    };
    const safeQueueUpdate = () => {
      if (rootElement && !rootElement.isConnected) {
        cleanupIfDisconnected();
        return;
      }

      queueOverflowUpdate();
    };
    resizeObserver =
      nextCanMeasure && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(safeQueueUpdate)
        : undefined;
    mutationObserver =
      nextCanMeasure && typeof MutationObserver !== "undefined"
        ? new MutationObserver(safeQueueUpdate)
        : undefined;

    observeOverflowTargets();
    safeUpdate();
    window.addEventListener("resize", safeUpdate);
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        safeUpdate();
        requestAnimationFrame(safeUpdate);
      });
    }
    for (const delay of [16, 50, 100, 250]) {
      initialOverflowUpdateTimeouts.push(window.setTimeout(safeUpdate, delay));
    }
    document.fonts?.ready.then(() => {
      if (!hasDisposedRoot) {
        safeUpdate();
      }
    });
    connectionObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(cleanupIfDisconnected)
        : undefined;
    connectionObserver?.observe(document.body, { childList: true, subtree: true });
    cleanupOverflowObservers = () => {
      if (hasCleanedOverflowObservers) {
        return;
      }

      hasCleanedOverflowObservers = true;
      window.removeEventListener("resize", safeUpdate);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      connectionObserver?.disconnect();
      for (const timeout of initialOverflowUpdateTimeouts) {
        window.clearTimeout(timeout);
      }
      if (retryOverflowUpdateTimeout !== undefined) {
        window.clearTimeout(retryOverflowUpdateTimeout);
      }
    };
  });
  onCleanup(() => cleanupOverflowObservers());

  const shouldCollapse = createMemo(() => {
    const items = allItems();
    return (
      items.length > 2 &&
      (items.length > MAX_VISIBLE_ITEMS || (canMeasure() && visibleTailCount() < items.length))
    );
  });
  createEffect(() => {
    shouldCollapse();
    queueOverflowUpdate();
  });
  const collapsedCollection = createMemo<CollapsedBreadcrumbEntry<T>[]>(() => {
    const items = allItems();
    if (!shouldCollapse()) {
      return [];
    }

    const tailCount = Math.min(visibleTailCount(), items.length);
    const sliceIndex = Math.max(1, items.length - tailCount);

    return [
      { kind: "item", item: items[0] as T, index: 0 },
      { kind: "menu" },
      ...items.slice(sliceIndex).map((item, index) => ({
        kind: "item" as const,
        item,
        index: sliceIndex + index,
      })),
    ];
  });
  const collapsedItems = createMemo(() => {
    const items = allItems();
    if (!shouldCollapse()) {
      return [];
    }

    const tailCount = Math.min(visibleTailCount(), items.length);
    const sliceIndex = Math.max(1, items.length - tailCount);
    return items.slice(1, sliceIndex);
  });

  const renderDynamicItem = (item: T | undefined) => {
    if (item === undefined) {
      return null;
    }

    const renderItem = local.children as ((item: T) => JSX.Element) | undefined;
    return renderItem?.(item);
  };

  return (
    <InternalBreadcrumbsContext.Provider value={{ size, isDisabled, showSeparator }}>
      <Show
        when={shouldCollapse()}
        fallback={
          <HeadlessBreadcrumbs
            {...headlessProps}
            items={local.items}
            getKey={local.getKey}
            onAction={local.onAction}
            isDisabled={local.isDisabled}
            ref={setRootElement}
            class={getClassName}
            style={() => mergedUnsafeStyle() ?? {}}
            children={local.children as any}
          />
        }
      >
        <HeadlessBreadcrumbs
          {...headlessProps}
          items={collapsedCollection()}
          getKey={(entry) =>
            entry.kind === "menu"
              ? "__breadcrumb-menu"
              : (local.getKey?.(entry.item) ?? defaultItemKey(entry.item, entry.index))
          }
          onAction={local.onAction}
          isDisabled={local.isDisabled}
          ref={setRootElement}
          class={getClassName}
          style={() => mergedUnsafeStyle() ?? {}}
          children={(entry) =>
            entry.kind === "menu" ? (
              <BreadcrumbMenu
                items={collapsedItems()}
                getKey={(item, index) =>
                  local.getKey?.(item as T) ?? defaultItemKey(item, index + 1)
                }
                getLabel={itemLabel}
                onAction={local.onAction}
              />
            ) : (
              renderDynamicItem(entry.item)
            )
          }
        />
      </Show>
      <Show when={allItems().length > 0 && canMeasure()}>
        <div
          ref={setMeasurementElement}
          aria-hidden="true"
          data-rsp-breadcrumbs-measure=""
          data-rsp-breadcrumbs-measure-id={measurementId}
          style={{
            position: "absolute",
            inset: "0",
            visibility: "hidden",
            overflow: "hidden",
            opacity: 0,
            "pointer-events": "none",
          }}
        >
          <HeadlessBreadcrumbs
            {...headlessProps}
            items={local.items}
            getKey={local.getKey}
            isDisabled={local.isDisabled}
            class={getClassName}
            style={() => ({})}
            children={local.children as any}
          />
          <ActionButton
            ref={setMeasurementMenuButton}
            data-hidden-breadcrumb-menu-button=""
            isQuiet
            aria-label="More items"
          >
            <FolderBreadcrumbIcon />
          </ActionButton>
        </div>
      </Show>
    </InternalBreadcrumbsContext.Provider>
  );
}

function BreadcrumbMenu<T>(props: {
  items: T[];
  getKey: (item: T, index: number) => string | number;
  getLabel: (item: T) => string;
  onAction?: (key: string | number) => void;
}): JSX.Element {
  const locale = useLocale();
  const context = useContext(InternalBreadcrumbsContext) ?? defaultInternalBreadcrumbsContext;
  const formatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const label = () => formatter().format("breadcrumbs.more");

  return (
    <span
      class={breadcrumbStyles({
        size: context.size(),
        isDisabled: context.isDisabled(),
        isMenu: true,
      })}
      data-rsp-breadcrumb-menu=""
    >
      <MenuTrigger>
        <ActionButton isDisabled={context.isDisabled()} isQuiet aria-label={label()}>
          <FolderBreadcrumbIcon />
        </ActionButton>
        <Menu
          items={props.items}
          // Menu invokes onAction(key, value); Breadcrumbs' contract is key-only
          // (matching upstream), so drop the leaked item value.
          onAction={(key) => props.onAction?.(key)}
          size={context.size()}
          aria-label={label()}
        >
          {(item) => (
            <MenuItem id={props.getKey(item, props.items.indexOf(item))}>
              <Text slot="label">{props.getLabel(item)}</Text>
            </MenuItem>
          )}
        </Menu>
      </MenuTrigger>
      <ChevronIcon
        size={context.size()}
        class={chevronStyles({ direction: locale().direction, isMenu: true })}
      />
    </span>
  );
}

/**
 * An individual Breadcrumb for Breadcrumbs.
 */
export function Breadcrumb(props: BreadcrumbProps): JSX.Element {
  const context = useContext(InternalBreadcrumbsContext) ?? defaultInternalBreadcrumbsContext;
  const locale = useLocale();
  const providerProps = useProviderProps(props);
  const mergedProps = mergeProps(providerProps, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "ref",
  ]);

  const assignRefs = mergeContextRefs(props.ref);
  const mergedStyles = () => mergeContextStyles(undefined, local.styles);
  const size = () => context.size();
  const [isCurrent, setIsCurrent] = createSignal(false);

  const syncRenderProps = (renderProps: BreadcrumbItemRenderProps) => {
    untrack(() => {
      if (isCurrent() !== renderProps.isCurrent) {
        setIsCurrent(renderProps.isCurrent);
      }
    });
  };

  const getClassName = (renderProps: BreadcrumbItemRenderProps): string => {
    syncRenderProps(renderProps);

    return [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        breadcrumbStyles({
          size: size(),
          isDisabled: renderProps.isDisabled || context.isDisabled(),
          isCurrent: renderProps.isCurrent,
          isHovered: renderProps.isHovered,
          isFocusVisible: renderProps.isFocusVisible,
          isFocused: renderProps.isFocused,
          isPressed: renderProps.isPressed,
        }),
        renderProps.isCurrent ? currentStyles({ size: size() }) : undefined,
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getStyle = (renderProps: BreadcrumbItemRenderProps): JSX.CSSProperties => ({
    ...(local.UNSAFE_style ?? {}),
    display: "block",
    "clip-path": renderProps.isFocusVisible ? "none" : "margin-box",
  });

  const renderChildren = (renderProps: BreadcrumbItemRenderProps): JSX.Element => {
    syncRenderProps(renderProps);

    const content =
      typeof local.children === "function" ? local.children(renderProps) : local.children;

    return content;
  };

  return (
    <span style={{ display: "contents" }}>
      <HeadlessBreadcrumbItem
        {...headlessProps}
        elementType={isCurrent() ? "div" : headlessProps.elementType}
        ref={(node: HTMLElement) => assignRefs(node)}
        isDisabled={headlessProps.isDisabled || context.isDisabled()}
        class={getClassName}
        style={getStyle}
        children={renderChildren}
      />
      <Show when={context.showSeparator() && !isCurrent()}>
        <ChevronIcon size="M" class={chevronStyles({ direction: locale().direction })} />
      </Show>
    </span>
  );
}

export const BreadcrumbItem = Breadcrumb;
export const Item = Breadcrumb;

Breadcrumbs.Item = Breadcrumb;
