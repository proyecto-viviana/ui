import {
  type Accessor,
  For,
  type JSX,
  Show,
  createContext,
  createMemo,
  createSignal,
  mergeProps,
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
import type { StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
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

/**
 * Breadcrumbs show hierarchy and navigational context for a user's location within an application.
 */
export function Breadcrumbs<T>(props: BreadcrumbsProps<T>): JSX.Element {
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

  const visibleItems = createMemo(() => {
    const items = local.items ?? [];
    if (items.length <= MAX_VISIBLE_ITEMS) {
      return items;
    }

    return [items[0], ...items.slice(items.length - 2)];
  });
  const collapsedCollection = createMemo<CollapsedBreadcrumbEntry<T>[]>(() => {
    const items = local.items ?? [];
    if (items.length <= MAX_VISIBLE_ITEMS) {
      return [];
    }

    return [
      { kind: "item", item: items[0] as T },
      { kind: "menu" },
      ...items.slice(items.length - 2).map((item) => ({ kind: "item" as const, item })),
    ];
  });
  const collapsedItems = createMemo(() => {
    const items = local.items ?? [];
    return items.length > MAX_VISIBLE_ITEMS ? items.slice(1, items.length - 2) : [];
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
        when={(local.items?.length ?? 0) > MAX_VISIBLE_ITEMS}
        fallback={
          <HeadlessBreadcrumbs
            {...headlessProps}
            items={local.items}
            getKey={local.getKey}
            onAction={local.onAction}
            isDisabled={local.isDisabled}
            ref={(element: HTMLElement) => assignRefs(element)}
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
              : (local.getKey?.(entry.item) ??
                defaultItemKey(entry.item, collapsedCollection().indexOf(entry)))
          }
          onAction={local.onAction}
          isDisabled={local.isDisabled}
          ref={(element: HTMLElement) => assignRefs(element)}
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
          onAction={props.onAction}
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
