// @ts-nocheck
import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import {
  Collection,
  GridList as HeadlessGridList,
  GridListItem as HeadlessGridListItem,
  type GridListProps as HeadlessGridListProps,
  type GridListRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import { CardContext, InternalCardViewContext } from "../card/index";
import { ImageCoordinator } from "../image";
import type { StyleString } from "../style";
import { focusRing, style } from "../style";
import { mergeStyles } from "../style/runtime";
import { useProviderProps } from "../provider";
import { getAllowedOverrides, type UnsafeClassName } from "../s2-internal/style-utils";
import type { RefLike, SpectrumContextValue } from "../button/spectrum-context";
import { mergeContextRefs } from "../button/spectrum-context";

export type CardViewLayout = "grid" | "waterfall";
export type CardViewSize = "XS" | "S" | "M" | "L" | "XL";
export type CardViewDensity = "compact" | "regular" | "spacious";
export type CardViewVariant = "primary" | "secondary" | "tertiary" | "quiet";
export type CardViewSelectionStyle = "checkbox" | "highlight";
export type CardViewLoadingState = "idle" | "loading" | "loadingMore" | "sorting" | "filtering";

export interface CardViewProps<T extends object> extends Omit<
  HeadlessGridListProps<T>,
  "class" | "style" | "children" | "selectionBehavior" | "isLoading"
> {
  /** The cards contained within the CardView. */
  children: (item: T) => JSX.Element;
  /** The layout of the cards. @default 'grid' */
  layout?: CardViewLayout;
  /** The size of the cards. @default 'M' */
  size?: CardViewSize;
  /** The amount of space between cards. @default 'regular' */
  density?: CardViewDensity;
  /** The visual style of the cards. @default 'primary' */
  variant?: CardViewVariant;
  /** How selection should be displayed. @default 'checkbox' */
  selectionStyle?: CardViewSelectionStyle;
  /** The loading state of the CardView. */
  loadingState?: CardViewLoadingState;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Provides an action bar when cards are selected. */
  renderActionBar?: (selectedKeys: "all" | Set<Key>) => JSX.Element;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Ref for the grid list root element. */
  ref?: RefLike<HTMLDivElement>;
}

export const CardViewContext = createContext<SpectrumContextValue<CardViewProps<any>>>(null);

const layoutOptions = {
  XS: {
    compact: { minSpace: 6, minItemSize: 100, maxItemSize: 140 },
    regular: { minSpace: 8, minItemSize: 100, maxItemSize: 140 },
    spacious: { minSpace: 12, minItemSize: 100, maxItemSize: 140 },
  },
  S: {
    compact: { minSpace: 8, minItemSize: 150, maxItemSize: 210 },
    regular: { minSpace: 12, minItemSize: 150, maxItemSize: 210 },
    spacious: { minSpace: 16, minItemSize: 150, maxItemSize: 210 },
  },
  M: {
    compact: { minSpace: 12, minItemSize: 200, maxItemSize: 280 },
    regular: { minSpace: 16, minItemSize: 200, maxItemSize: 280 },
    spacious: { minSpace: 20, minItemSize: 200, maxItemSize: 280 },
  },
  L: {
    compact: { minSpace: 16, minItemSize: 270, maxItemSize: 370 },
    regular: { minSpace: 20, minItemSize: 270, maxItemSize: 370 },
    spacious: { minSpace: 24, minItemSize: 270, maxItemSize: 370 },
  },
  XL: {
    compact: { minSpace: 20, minItemSize: 340, maxItemSize: 460 },
    regular: { minSpace: 24, minItemSize: 340, maxItemSize: 460 },
    spacious: { minSpace: 28, minItemSize: 340, maxItemSize: 460 },
  },
} as const;

const SIZES: CardViewSize[] = ["XS", "S", "M", "L", "XL"];

const cardViewStyles = style<
  GridListRenderProps & {
    size: CardViewSize;
    density: CardViewDensity;
    isLoading?: boolean;
    isActionBar?: boolean;
  }
>(
  {
    overflowY: {
      default: "auto",
      isLoading: "hidden",
    },
    display: {
      default: "grid",
      isEmpty: "flex",
    },
    boxSizing: "border-box",
    flexDirection: "column",
    alignItems: {
      default: "stretch",
      isEmpty: "center",
    },
    justifyContent: {
      default: "start",
      isEmpty: "center",
    },
    gap: {
      density: {
        compact: {
          size: {
            XS: "[6px]",
            S: 8,
            M: 12,
            L: 16,
            XL: 20,
          },
        },
        regular: {
          size: {
            XS: 8,
            S: 12,
            M: 16,
            L: 20,
            XL: 24,
          },
        },
        spacious: {
          size: {
            XS: 12,
            S: 16,
            M: 20,
            L: 24,
            XL: 28,
          },
        },
      },
    },
    gridTemplateColumns: {
      size: {
        XS: "[repeat(auto-fit,minmax(100px,140px))]",
        S: "[repeat(auto-fit,minmax(150px,210px))]",
        M: "[repeat(auto-fit,minmax(200px,280px))]",
        L: "[repeat(auto-fit,minmax(270px,370px))]",
        XL: "[repeat(auto-fit,minmax(340px,460px))]",
      },
    },
    ...focusRing(),
    outlineStyle: {
      default: "none",
      isEmpty: {
        isFocusVisible: "solid",
      },
    },
    outlineOffset: -2,
    height: {
      isActionBar: "full",
    },
  },
  getAllowedOverrides({ height: true }),
);

const wrapperStyles = style(
  {
    position: "relative",
    overflow: "clip",
  },
  getAllowedOverrides({ height: true }),
);

function selectedKeySet(keys: "all" | Iterable<Key> | undefined): "all" | Set<Key> {
  if (keys === "all") {
    return "all";
  }

  return new Set(keys ?? []);
}

/**
 * A CardView displays a group of related objects, with support for selection and bulk actions.
 */
export function CardView<T extends object>(props: CardViewProps<T>): JSX.Element {
  const providerProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(providerProps, [
    "children",
    "layout",
    "size",
    "density",
    "variant",
    "selectionStyle",
    "loadingState",
    "styles",
    "renderActionBar",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
    "isLoading",
    "hasMore",
    "onLoadMore",
  ]);
  const requestedSize = (): CardViewSize => local.size ?? "M";
  const density = (): CardViewDensity => local.density ?? "regular";
  const variant = (): CardViewVariant => local.variant ?? "primary";
  const layout = (): CardViewLayout => local.layout ?? "grid";
  const selectionStyle = (): CardViewSelectionStyle => local.selectionStyle ?? "checkbox";
  const isLoading = () =>
    local.isLoading || local.loadingState === "loading" || local.loadingState === "loadingMore";
  const [maxSizeIndex, setMaxSizeIndex] = createSignal(SIZES.length - 1);
  let rootElement: HTMLDivElement | undefined;
  const assignRootRef = mergeContextRefs(local.ref, (element: HTMLDivElement) => {
    rootElement = element;
  });

  const updateSize = () => {
    const width = rootElement?.clientWidth ?? 0;
    if (width <= 0) {
      setMaxSizeIndex(SIZES.length - 1);
      return;
    }

    let index = SIZES.length - 1;
    while (index > 0) {
      const options = layoutOptions[SIZES[index]][density()];
      if (width >= options.minItemSize * 2 + options.minSpace * 3) {
        break;
      }
      index--;
    }
    setMaxSizeIndex(index);
  };

  onMount(() => {
    updateSize();
    if (typeof ResizeObserver !== "function" || !rootElement) {
      return;
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(rootElement);
    onCleanup(() => observer.disconnect());
  });

  createEffect(() => {
    density();
    requestedSize();
    updateSize();
  });

  const size = (): CardViewSize =>
    SIZES[Math.min(maxSizeIndex(), Math.max(0, SIZES.indexOf(requestedSize())))];
  const [actionSelectedKeys, setActionSelectedKeys] = createSignal<"all" | Set<Key>>(
    selectedKeySet(headlessProps.selectedKeys ?? headlessProps.defaultSelectedKeys),
  );
  createEffect(() => {
    setActionSelectedKeys(
      selectedKeySet(headlessProps.selectedKeys ?? headlessProps.defaultSelectedKeys),
    );
  });
  const onSelectionChange = (keys: "all" | Set<Key>) => {
    setActionSelectedKeys(keys === "all" ? "all" : new Set(keys));
    headlessProps.onSelectionChange?.(keys);
  };
  const className = (renderProps: GridListRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        cardViewStyles({
          ...renderProps,
          size: size(),
          density: density(),
          isLoading: isLoading(),
          isActionBar: !!local.renderActionBar,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const cardView = (
    <InternalCardViewContext.Provider
      value={{ ElementType: HeadlessGridListItem, layout: layout() }}
    >
      <CardContext.Provider value={{ size: size(), variant: variant() }}>
        <ImageCoordinator>
          <HeadlessGridList
            {...headlessProps}
            ref={(element: HTMLDivElement) => assignRootRef(element)}
            class={className}
            style={local.UNSAFE_style}
            selectionBehavior={selectionStyle() === "highlight" ? "replace" : "toggle"}
            onSelectionChange={onSelectionChange}
            isLoading={isLoading()}
            hasMore={local.hasMore ?? !!local.onLoadMore}
            onLoadMore={local.onLoadMore}
            data-layout={layout()}
            data-size={size()}
            data-requested-size={requestedSize()}
            data-density={density()}
            data-variant={variant()}
            data-selection-style={selectionStyle()}
          >
            {(item: T) => local.children(item)}
          </HeadlessGridList>
        </ImageCoordinator>
      </CardContext.Provider>
    </InternalCardViewContext.Provider>
  );

  if (!local.renderActionBar) {
    return cardView;
  }

  return (
    <div class={wrapperStyles({}, local.styles)} style={local.UNSAFE_style}>
      {cardView}
      {local.renderActionBar(actionSelectedKeys())}
    </div>
  );
}

export { Collection };
export {
  Card,
  CardPreview,
  CollectionCardPreview,
  AssetCard,
  UserCard,
  ProductCard,
  CardContext,
  Image,
} from "../card/index";
export type {
  CardProps,
  CardPreviewProps,
  AssetCardProps,
  UserCardProps,
  ProductCardProps,
  CardRenderProps,
  CardDensity,
  CardSize,
  CardVariant,
} from "../card/index";
