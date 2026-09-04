// @ts-nocheck

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/CardView.tsx

// Port of packages/@react-spectrum/s2/src/CardView.tsx.

import {
  type JSX,
  Show,
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
import { focusRing, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { useProviderProps } from "../provider";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
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
    gridTemplateColumns: "[repeat(var(--cardview-columns,1),minmax(0,1fr))]",
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
  const [viewportWidth, setViewportWidth] = createSignal(0);
  let rootElement: HTMLDivElement | undefined;
  const assignRootRef = mergeContextRefs(local.ref, (element: HTMLDivElement) => {
    rootElement = element;
  });

  const updateSize = () => {
    const width = rootElement?.clientWidth ?? 0;
    setViewportWidth(width);
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
  const packing = () => layoutOptions[size()][density()];
  const columnCount = () => {
    const width = viewportWidth();
    const { minItemSize, minSpace } = packing();
    if (width <= 0) return 1;
    return Math.max(1, Math.floor((width + minSpace) / (minItemSize + minSpace)));
  };
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
            style={{
              ...local.UNSAFE_style,
              "--cardview-columns": String(columnCount()),
            }}
            layout="grid"
            columnCount={layout() === "waterfall" ? 1 : columnCount()}
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

  return (
    <Show when={Boolean(local.renderActionBar)} fallback={cardView}>
      <div class={wrapperStyles({}, local.styles)} style={local.UNSAFE_style}>
        {cardView}
        {local.renderActionBar?.(actionSelectedKeys())}
      </div>
    </Show>
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
