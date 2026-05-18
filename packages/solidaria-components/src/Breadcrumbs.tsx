/**
 * Breadcrumbs component for solidaria-components
 *
 * A pre-wired headless breadcrumbs component that combines aria hooks.
 * Port of react-aria-components Breadcrumbs.
 */

import {
  type Accessor,
  type JSX,
  createContext,
  createMemo,
  createSignal,
  children as resolveChildren,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  createBreadcrumbs,
  createBreadcrumbItem,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaBreadcrumbsProps,
  type AriaBreadcrumbItemProps,
  type PressEvent,
} from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface BreadcrumbsRenderProps {
  /** Whether the breadcrumbs are disabled. */
  isDisabled: boolean;
}

export interface BreadcrumbsProps<T> extends Omit<AriaBreadcrumbsProps, "isDisabled">, SlotProps {
  /** The items to render in the breadcrumbs. */
  items?: T[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => string | number;
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean;
  /** Handler called when a breadcrumb item is activated. */
  onAction?: (key: string | number) => void;
  /** The children of the component, or a render function for collection items. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<BreadcrumbsRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<BreadcrumbsRenderProps>;
  /** Ref for the navigation element. */
  ref?: RefLike<HTMLElement>;
}

export interface BreadcrumbItemRenderProps {
  /** Whether this is the current/last item. */
  isCurrent: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** Whether the item is pressed. */
  isPressed: boolean;
  /** Whether the item is focused. */
  isFocused: boolean;
  /** Whether the item has visible focus ring. */
  isFocusVisible: boolean;
  /** Whether the item is hovered. */
  isHovered: boolean;
}

export interface BreadcrumbItemProps
  extends Omit<AriaBreadcrumbItemProps, "isDisabled">, SlotProps {
  /** The children of the breadcrumb item. */
  children?: RenderChildren<BreadcrumbItemRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<BreadcrumbItemRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<BreadcrumbItemRenderProps>;
  /** Whether this item is disabled. */
  isDisabled?: boolean;
  /** Ref for the breadcrumb item element. */
  ref?: RefLike<HTMLElement>;
}

interface BreadcrumbsContextValue {
  isDisabled: Accessor<boolean>;
  onAction?: (key: string | number) => void;
  registerStaticItem?: () => number;
  staticItemCount?: Accessor<number>;
  resetStaticItems?: () => void;
  setStaticItemCount?: (count: number) => void;
}

export const BreadcrumbsContext = createContext<BreadcrumbsContextValue | null>(null);

interface BreadcrumbItemContextValue {
  itemKey: string | number | null;
  isLast: Accessor<boolean>;
}

export const BreadcrumbItemContext = createContext<BreadcrumbItemContextValue | null>(null);

function defaultItemKey(item: unknown, index: number): string | number {
  const maybeItem = item as { key?: string | number; id?: string | number };
  return maybeItem.key ?? maybeItem.id ?? index;
}

/**
 * Breadcrumbs show hierarchy and navigational context for a user's location within an application.
 */
export function Breadcrumbs<T>(props: BreadcrumbsProps<T>): JSX.Element {
  const [local, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "items", "getKey", "isDisabled", "onAction", "ref"],
    ["aria-label", "aria-labelledby", "aria-describedby", "aria-details"],
  );

  const isDisabled = () => local.isDisabled ?? false;
  const items = () => local.items ?? [];
  const hasCollectionItems = () => local.items !== undefined;
  const getItemKey = (item: T, index: number): string | number =>
    local.getKey?.(item) ?? defaultItemKey(item, index);
  const [staticItemCount, setStaticItemCount] = createSignal(0);
  let nextStaticIndex = 0;
  const resetStaticItems = () => {
    nextStaticIndex = 0;
    setStaticItemCount(0);
  };
  const registerStaticItem = () => {
    const index = nextStaticIndex;
    nextStaticIndex += 1;
    return index;
  };

  const { navProps } = createBreadcrumbs({
    get "aria-label"() {
      return ariaProps["aria-label"];
    },
    get "aria-labelledby"() {
      return ariaProps["aria-labelledby"];
    },
    get "aria-describedby"() {
      return ariaProps["aria-describedby"];
    },
    get isDisabled() {
      return isDisabled();
    },
  });

  const renderValues = createMemo<BreadcrumbsRenderProps>(() => ({
    isDisabled: isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Breadcrumbs",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  return (
    <BreadcrumbsContext.Provider
      value={{
        isDisabled,
        onAction: local.onAction,
        registerStaticItem,
        staticItemCount,
        resetStaticItems,
        setStaticItemCount,
      }}
    >
      <nav
        {...navProps}
        {...domProps()}
        ref={(element) => assignRef(local.ref, element)}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={isDisabled() || undefined}
      >
        <ol
          style={{
            display: "flex",
            "align-items": "center",
            "list-style": "none",
            margin: 0,
            padding: 0,
          }}
        >
          <Show
            when={hasCollectionItems()}
            fallback={
              <StaticBreadcrumbItems>{local.children as JSX.Element}</StaticBreadcrumbItems>
            }
          >
            <For each={items()}>
              {(item, index) => {
                const itemKey = getItemKey(item, index());
                const isLast = () => index() === items().length - 1;
                const renderItem = local.children as ((item: T) => JSX.Element) | undefined;

                return (
                  <li style={{ display: "flex", "align-items": "center" }}>
                    <BreadcrumbItemContext.Provider value={{ itemKey, isLast }}>
                      {renderItem?.(item)}
                    </BreadcrumbItemContext.Provider>
                  </li>
                );
              }}
            </For>
          </Show>
        </ol>
      </nav>
    </BreadcrumbsContext.Provider>
  );
}

function StaticBreadcrumbItems(props: { children?: JSX.Element }): JSX.Element {
  const context = useContext(BreadcrumbsContext);
  const staticChildren = resolveChildren(() => props.children);
  const childArray = createMemo(() => {
    context?.resetStaticItems?.();
    const array = staticChildren.toArray();
    context?.setStaticItemCount?.(array.length);
    return array;
  });

  return (
    <For each={childArray()}>
      {(child) => <li style={{ display: "flex", "align-items": "center" }}>{child}</li>}
    </For>
  );
}

/**
 * A BreadcrumbItem represents an individual breadcrumb in the navigation trail.
 */
export function BreadcrumbItem(props: BreadcrumbItemProps): JSX.Element {
  const [local, ariaProps] = splitProps(props, ["class", "style", "slot", "isDisabled", "ref"]);

  const context = useContext(BreadcrumbsContext);
  const itemContext = useContext(BreadcrumbItemContext);
  const staticIndex = itemContext ? null : context?.registerStaticItem?.();
  const isDisabled = () => local.isDisabled ?? context?.isDisabled() ?? false;
  const isCurrent = () =>
    ariaProps.isCurrent ??
    itemContext?.isLast() ??
    (staticIndex !== null &&
      staticIndex !== undefined &&
      context?.staticItemCount !== undefined &&
      staticIndex === context.staticItemCount() - 1);
  const itemKey = () => itemContext?.itemKey ?? ariaProps.id ?? null;

  const handlePress = (e: PressEvent) => {
    ariaProps.onPress?.(e);
    const key = itemKey();
    if (key !== null && !isCurrent() && !isDisabled()) {
      context?.onAction?.(key);
    }
  };

  const { itemProps, isPressed } = createBreadcrumbItem({
    get id() {
      return ariaProps.id;
    },
    get isCurrent() {
      return isCurrent();
    },
    get isDisabled() {
      return isDisabled();
    },
    get href() {
      return ariaProps.href;
    },
    get target() {
      return ariaProps.target;
    },
    get rel() {
      return ariaProps.rel;
    },
    get elementType() {
      return ariaProps.elementType;
    },
    get onPress() {
      return handlePress;
    },
    get onPressStart() {
      return ariaProps.onPressStart;
    },
    get onPressEnd() {
      return ariaProps.onPressEnd;
    },
    get onClick() {
      return ariaProps.onClick;
    },
    get onFocus() {
      return ariaProps.onFocus;
    },
    get onBlur() {
      return ariaProps.onBlur;
    },
    get onFocusChange() {
      return ariaProps.onFocusChange;
    },
    get onKeyDown() {
      return ariaProps.onKeyDown;
    },
    get onKeyUp() {
      return ariaProps.onKeyUp;
    },
    get autoFocus() {
      return ariaProps.autoFocus;
    },
    get "aria-label"() {
      return ariaProps["aria-label"];
    },
    get "aria-labelledby"() {
      return ariaProps["aria-labelledby"];
    },
    get "aria-describedby"() {
      return ariaProps["aria-describedby"];
    },
    get "aria-details"() {
      return ariaProps["aria-details"];
    },
    get "aria-current"() {
      return ariaProps["aria-current"];
    },
  });

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });
  const mergedItemProps = createMemo(() =>
    mergeProps(
      itemProps as Record<string, unknown>,
      focusProps as Record<string, unknown>,
      hoverProps as Record<string, unknown>,
    ),
  );
  const elementType = () => ariaProps.elementType ?? "a";

  const renderValues = createMemo<BreadcrumbItemRenderProps>(() => ({
    isCurrent: isCurrent(),
    isDisabled: isDisabled(),
    isPressed: isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-BreadcrumbItem",
    },
    renderValues,
  );

  const mergedStyle = () => {
    const userStyle = renderProps.style();
    const baseStyle = { display: "inline-flex", "align-items": "center" };
    return userStyle ? { ...baseStyle, ...userStyle } : baseStyle;
  };

  return (
    <Dynamic
      component={elementType()}
      {...mergedItemProps()}
      ref={(element: HTMLElement) => assignRef(local.ref, element)}
      href={isCurrent() ? undefined : (mergedItemProps() as { href?: string }).href}
      aria-current={isCurrent() ? (ariaProps["aria-current"] ?? "page") : undefined}
      aria-disabled={isDisabled() || isCurrent() || undefined}
      class={renderProps.class()}
      style={mergedStyle()}
      data-current={isCurrent() || undefined}
      data-disabled={isDisabled() || undefined}
      data-pressed={isPressed() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
    >
      {renderProps.renderChildren()}
    </Dynamic>
  );
}

Breadcrumbs.Item = BreadcrumbItem;
